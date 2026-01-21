# Implementation Guide: Partial Sales with Double-Entry Accounting

## Overview

This guide helps you integrate partial sales with proper double-entry accounting into your ERP system. The implementation supports:

✅ Partial payments at sale time
✅ Multiple payment methods
✅ Customer due tracking (Accounts Receivable)
✅ Automatic journal entry generation
✅ Later payment reconciliation
✅ Balance validation

---

## Phase 1: Type System Updates

### Step 1.1: Merge Enhanced Types

Your current `types.ts` needs to be enhanced. You have two options:

**Option A: Update existing types.ts (Recommended)**
```typescript
// In app/src/app/types.ts

// Add these new types at the top
export type PaymentMethod = 'cash' | 'bank' | 'pos' | 'check' | 'credit' | 'other';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue' | 'cleared';

// Add payment allocation structure
export interface SalePaymentAllocation {
  paymentMethod: PaymentMethod;
  amount: number;
  accountId: string;
  accountName: string;
  date: string;
}

// Update Sale interface:
export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  type: 'sale' | 'repair' | 'return';
  items: SaleItem[];  // Your existing SaleItem structure
  
  // Amounts
  subtotal: number;
  vatAmount: number;
  total: number;
  
  // NEW: Payment Tracking
  paymentStatus: PaymentStatus;
  totalPaid: number;
  remainingDue: number;
  paymentAllocations: SalePaymentAllocation[];  // NEW
  
  // Accounting
  journalEntryId: string;
  linkedPaymentEntries: string[];  // NEW - for multiple payments
  
  date: string;
}

// NEW: Payment record
export interface SalePayment {
  id: string;
  saleId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  amount: number;
  date: string;
  notes?: string;
  journalEntryId: string;
  accountId: string;
  accountName: string;
}

// Update Customer interface:
export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  
  // UPDATED
  outstandingBalance: number;
  totalSales: number;
  totalPaid: number;
  totalRepairs: number;
  
  // NEW
  creditLimit?: number;
  creditTerms?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  
  purchaseHistory?: Array<{
    invoiceNumber: string;
    itemName: string;
    quantity: number;
    amount: number;
    date: string;
    type: 'sale' | 'repair' | 'return';
  }>;
}
```

**Option B: Use separate file (types-enhanced.ts is already created)**
- File created: `app/src/app/types-enhanced.ts`
- Update imports: `import type { Sale, SalePayment } from './types-enhanced'`

---

## Phase 2: Backend Logic Integration

### Step 2.1: Add Accounting Logic Module

File created: `app/src/app/accounting-logic.ts`

This module provides:
- `createSaleWithPartialPayment()` - Main sale creation
- `createSaleJournalEntry()` - Generates accounting entries
- `recordPaymentReceived()` - Records later payments
- `updateSaleAfterPayment()` - Updates sale status
- `updateCustomerBalance()` - Tracks customer due
- Helper functions for calculations

### Step 2.2: Update Mock Data (mockData.ts)

Add mock data for demonstrations:

```typescript
// In app/src/app/mockData.ts

export const mockSalesWithPartialPayments: Sale[] = [
  {
    id: 'SALE-001',
    invoiceNumber: 'INV-00001',
    customerId: 'CUST-001',
    customerName: 'Ahmad Al-Mansouri',
    type: 'sale',
    items: [
      {
        itemId: 'ITEM-OUD',
        itemName: 'Oud Premium',
        quantity: 2,
        ratePerUnit: 500,
        amount: 1000,
      }
    ],
    subtotal: 1000,
    vatAmount: 50,
    total: 1050,
    paymentStatus: 'partial',
    totalPaid: 525,  // 500 POS + 25 cash
    remainingDue: 525,
    paymentAllocations: [
      {
        paymentMethod: 'pos',
        amount: 500,
        accountId: 'COA-1020',
        accountName: 'POS Account',
        date: '2026-01-20',
      },
      {
        paymentMethod: 'cash',
        amount: 25,
        accountId: 'COA-1010',
        accountName: 'Cash Account',
        date: '2026-01-20',
      }
    ],
    journalEntryId: 'JE-SALE-001',
    linkedPaymentEntries: [],
    date: '2026-01-20',
  }
];

export const mockSalePayments: SalePayment[] = [
  {
    id: 'PAY-001',
    saleId: 'SALE-001',
    invoiceNumber: 'INV-00001',
    customerId: 'CUST-001',
    customerName: 'Ahmad Al-Mansouri',
    paymentMethod: 'cash',
    amount: 525,
    date: '2026-02-15',
    journalEntryId: 'JE-PAY-001',
    accountId: 'COA-1010',
    accountName: 'Cash Account',
  }
];
```

### Step 2.3: Update Chart of Accounts

Ensure these accounts exist in `mockChartOfAccounts`:

```typescript
// In mockData.ts - ensure these COA entries

{
  id: 'COA-1010',
  code: '1010',
  name: 'Cash Account',
  type: 'asset',
  balance: 5000,
  isActive: true,
  level: 1,
},
{
  id: 'COA-1020',
  code: '1020',
  name: 'POS Account',
  type: 'asset',
  balance: 3000,
  isActive: true,
  level: 1,
},
{
  id: 'COA-1030',
  code: '1030',
  name: 'Bank Account',
  type: 'asset',
  balance: 10000,
  isActive: true,
  level: 1,
},
{
  id: 'COA-1110',
  code: '1110',
  name: 'Accounts Receivable - Customer Due',
  type: 'asset',
  balance: 0,
  isActive: true,
  level: 2,
  parentId: 'COA-1100',
},
{
  id: 'COA-4010',
  code: '4010',
  name: 'Sales Account',
  type: 'revenue',
  balance: 0,
  isActive: true,
  level: 2,
  parentId: 'COA-4000',
},
{
  id: 'COA-4020',
  code: '4020',
  name: 'Sales Returns',
  type: 'revenue',
  balance: 0,
  isActive: true,
  level: 2,
  parentId: 'COA-4000',
},
```

---

## Phase 3: Frontend Integration

### Step 3.1: Component Implementation

Created: `app/src/app/components/SalesModuleEnhanced.tsx`

Features:
- Customer selection
- Sale item addition
- **Payment allocation UI** (NEW)
- Real-time calculation
- Payment recording
- Customer balance tracking

### Step 3.2: Integration with Existing SalesModule

You can either:

**Option A: Replace SalesModule**
- Use `SalesModuleEnhanced` as the new main component
- Update imports in your App.tsx

**Option B: Coexist**
- Keep existing SalesModule
- Add tab or switcher to use enhanced version

### Step 3.3: Update Payment Status Badge

In your components that display sales, use updated badge:

```typescript
function getPaymentStatusBadge(status: PaymentStatus) {
  const badgeConfig: Record<PaymentStatus, { color: string; label: string }> = {
    paid: { color: 'bg-green-600', label: 'PAID' },
    partial: { color: 'bg-yellow-600', label: 'PARTIAL' },
    pending: { color: 'bg-gray-600', label: 'PENDING' },
    overdue: { color: 'bg-red-600', label: 'OVERDUE' },
    cleared: { color: 'bg-blue-600', label: 'CLEARED' },
  };
  
  const config = badgeConfig[status];
  return <Badge className={config.color}>{config.label}</Badge>;
}
```

---

## Phase 4: Accounting Module Updates

### Step 4.1: Update Journal Entry Preview

The journal entries for sales should show:

```
Journal Entry: JE-SALE-001
Description: Sale INV-00001 - Ahmad Al-Mansouri (sale)
Reference: INV-00001

Entries:
  Dr | POS Account (1020)              | 500.00 |
  Dr | Accounts Receivable (1110)      | 500.00 |
     | Cash Account (1010)             | 50.00  |
  Cr | Sales Account (4010)            |        | 1050.00
     ────────────────────────────────────────────────
     | Total                           | 1050.00| 1050.00
```

### Step 4.2: Add Journal Entry Lines for Multiple Line Items

Update `JournalEntry` structure to support multiple lines:

```typescript
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  referenceType?: 'sale' | 'payment' | 'adjustment';  // NEW
  relatedDocumentId?: string;  // NEW
  entries: JournalEntryLine[];  // Can be 2+ lines now
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted';
}
```

---

## Phase 5: Reporting Enhancements

### Step 5.1: Add Outstanding Balance Report

```typescript
export function OutstandingBalanceReport() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const reportData = customers
    .filter(c => c.outstandingBalance > 0)
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Total Due</TableHead>
          <TableHead className="text-right">Total Paid</TableHead>
          <TableHead className="text-right">Payment %</TableHead>
          <TableHead>Credit Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportData.map(customer => (
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell className="text-right">AED {customer.outstandingBalance}</TableCell>
            <TableCell className="text-right">AED {customer.totalPaid}</TableCell>
            <TableCell className="text-right">
              {((customer.totalPaid / (customer.totalPaid + customer.outstandingBalance)) * 100).toFixed(1)}%
            </TableCell>
            <TableCell>
              <Badge>{customer.riskLevel?.toUpperCase()}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Step 5.2: Accounts Receivable Aging Report

```typescript
export function ARAgingReport() {
  // Group sales by aging buckets
  const aging = calculateARAging(sales);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {aging.current}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">31-60 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {aging.days31_60}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">61-90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {aging.days61_90}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Over 90 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">AED {aging.days91_plus}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## Phase 6: Testing & Validation

### Step 6.1: Unit Tests for Accounting Logic

```typescript
import { 
  createSaleWithPartialPayment,
  isJournalEntryBalanced,
  calculateCustomerBalance 
} from '../accounting-logic';

describe('Accounting Logic', () => {
  it('should create balanced journal entry for partial sale', () => {
    const { sale, journalEntry } = createSaleWithPartialPayment(
      {
        customerId: 'CUST-1',
        customerName: 'Test Customer',
        items: [{ 
          itemId: '1', 
          itemName: 'Product', 
          quantity: 1, 
          ratePerUnit: 1000,
          amount: 1000 
        }],
        type: 'sale',
        invoiceNumber: 'INV-001',
        date: '2026-01-20',
      },
      [{ 
        paymentMethod: 'pos', 
        amount: 500,
        accountId: 'COA-1020',
        accountName: 'POS Account',
        date: '2026-01-20',
      }]
    );
    
    // Journal must balance
    expect(isJournalEntryBalanced(journalEntry)).toBe(true);
    
    // Sale must be partial
    expect(sale.paymentStatus).toBe('partial');
    expect(sale.remainingDue).toBe(500);
  });
  
  it('should handle multiple payment methods', () => {
    const allocations = [
      { paymentMethod: 'pos', amount: 500, accountId: 'COA-1020', accountName: 'POS', date: '2026-01-20' },
      { paymentMethod: 'cash', amount: 300, accountId: 'COA-1010', accountName: 'Cash', date: '2026-01-20' },
    ];
    
    const { journalEntry } = createSaleWithPartialPayment(
      { /*...*/ },
      allocations
    );
    
    // Should have 4 lines: 2 payments + 1 AR + 1 sales
    expect(journalEntry.entries.length).toBe(4);
  });
});
```

### Step 6.2: Integration Test

```typescript
// Test complete flow: Create sale -> Record payment -> Check balance
const sale = createSale(...);
recordPaymentReceived(sale, { amount: 500, method: 'cash', date: '2026-02-15' });

const balance = calculateCustomerBalance([sale]);
expect(balance.outstandingBalance).toBe(0);
```

---

## Phase 7: Database Migration (For Real Backend)

If using a real database, run these migrations:

```sql
-- Add new columns to sales table
ALTER TABLE sales ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE sales ADD COLUMN total_paid DECIMAL(12,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN remaining_due DECIMAL(12,2) DEFAULT 0;

-- Create payment allocations table
CREATE TABLE payment_allocations (
  id VARCHAR(50) PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  account_id VARCHAR(50) NOT NULL,
  account_name VARCHAR(100),
  allocation_date TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

-- Create sale payments table
CREATE TABLE sale_payments (
  id VARCHAR(50) PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL,
  invoice_number VARCHAR(50),
  customer_id VARCHAR(50) NOT NULL,
  payment_method VARCHAR(20),
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE,
  journal_entry_id VARCHAR(50),
  account_id VARCHAR(50),
  account_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create customer balance tracking table
CREATE TABLE customer_balances (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  total_sales DECIMAL(14,2) DEFAULT 0,
  total_paid DECIMAL(14,2) DEFAULT 0,
  outstanding_balance DECIMAL(14,2) DEFAULT 0,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Add indexes for performance
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_payments_sale_id ON sale_payments(sale_id);
CREATE INDEX idx_payments_customer_id ON sale_payments(customer_id);
```

---

## Implementation Checklist

### Phase 1: Types
- [ ] Update `types.ts` OR use `types-enhanced.ts`
- [ ] Add `PaymentMethod`, `PaymentStatus` types
- [ ] Add `SalePaymentAllocation`, `SalePayment` interfaces
- [ ] Update `Sale` and `Customer` interfaces

### Phase 2: Logic
- [ ] Import `accounting-logic.ts` module
- [ ] Add mock data for sales with payments
- [ ] Verify Chart of Accounts has all needed accounts
- [ ] Test `createSaleWithPartialPayment()` function

### Phase 3: UI
- [ ] Import and use `SalesModuleEnhanced`
- [ ] Test payment allocation UI
- [ ] Test "Record Payment" dialog
- [ ] Verify balance calculations display correctly

### Phase 4: Accounting
- [ ] Update AccountingModule to show sale journal entries
- [ ] Verify journal entries balance (debit = credit)
- [ ] Test payment journal entry creation
- [ ] Verify linked entries display

### Phase 5: Reporting
- [ ] Add Outstanding Balance report
- [ ] Add AR Aging report
- [ ] Add Customer Credit Status report
- [ ] Test report calculations

### Phase 6: Testing
- [ ] Run unit tests for accounting logic
- [ ] Run integration tests for complete flow
- [ ] Test edge cases (over-payment, multiple payments, refunds)

### Phase 7: Optimization
- [ ] Add indexes to database
- [ ] Optimize customer balance queries
- [ ] Cache frequently accessed data

---

## Key Business Validations

```typescript
// Always validate these:

1. totalPaid + remainingDue = total
2. journalEntry.totalDebit = journalEntry.totalCredit
3. paymentAmount <= remainingDue
4. Each payment allocation > 0
5. Sum of allocations = paid amount
6. Customer exists before creating sale
7. Inventory updated correctly
8. All dates are valid
```

---

## Troubleshooting

### Journal entry not balanced
- Check that you're including ALL payment allocations
- Verify AR (Accounts Receivable) is included for unpaid portion
- Sum of debits should equal credit to sales account

### Customer balance incorrect
- Recalculate using `calculateCustomerBalance()` from scratch
- Verify no duplicate sales in data
- Check that payment amounts match payment records

### Missing journal entries
- Ensure `journalEntryId` is set on sale creation
- Check that payment entries are linked to `linkedPaymentEntries` array
- Verify entries are being created via `recordPaymentReceived()`

---

## Next Steps

1. **Choose integration path**: Update existing types or use new types-enhanced.ts
2. **Copy modules**: Add accounting-logic.ts to your project
3. **Update UI**: Integrate SalesModuleEnhanced component
4. **Test thoroughly**: Use provided unit and integration tests
5. **Add reporting**: Implement AR aging and balance reports
6. **Migrate database**: Run SQL migrations if using real backend
7. **Train users**: Document partial payment workflow

---

## Support References

- Design Document: `PARTIAL_SALES_DESIGN.md`
- Types Definition: `types-enhanced.ts`
- Logic Module: `accounting-logic.ts`
- Component: `SalesModuleEnhanced.tsx`

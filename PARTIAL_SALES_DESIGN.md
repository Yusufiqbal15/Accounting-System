# Sales with Partial Payments & Double-Entry Accounting

## 1. Design Architecture

### 1.1 Data Flow

```
Sale Created
    ↓
├─→ Validate (items, customer, amounts)
├─→ Deduct Inventory
├─→ Create Payment Allocation
│   ├─→ POS/Bank Payment (Debit)
│   └─→ Customer Due Amount (Debit)
└─→ Generate Journal Entries
    ├─→ Debit: POS/Bank/Cash (actual payment)
    ├─→ Debit: Accounts Receivable (remaining due)
    └─→ Credit: Sales Revenue (total amount)

Customer Pays Later
    ↓
├─→ Create Payment Record
├─→ Update Customer Balance
└─→ Generate Journal Entry
    ├─→ Debit: Cash/Bank (payment received)
    └─→ Credit: Accounts Receivable (due cleared)
```

### 1.2 Accounting Equation Validation

**On Sale Day (Example: 1000 AED sale, 500 POS paid, 500 due)**

Fundamental Equation: **Assets = Liabilities + Equity**

| Account | Type | Debit | Credit | Impact |
|---------|------|-------|--------|--------|
| POS Account (Asset) | Asset | 500 | - | +500 |
| Accounts Receivable (Asset) | Asset | 500 | - | +500 |
| Sales Revenue | Revenue | - | 1000 | +1000 (equity) |
| **Total** | | **1000** | **1000** | ✓ Balanced |

**When Customer Pays 500 AED in Cash**

| Account | Type | Debit | Credit | Impact |
|---------|------|-------|--------|--------|
| Cash (Asset) | Asset | 500 | - | +500 |
| Accounts Receivable | Asset | - | 500 | -500 |
| **Total** | | **500** | **500** | ✓ Balanced |

---

## 2. Enhanced Data Models

### 2.1 Payment Methods
```typescript
type PaymentMethod = 'cash' | 'bank' | 'pos' | 'check' | 'credit' | 'other';
type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue' | 'cleared';
```

### 2.2 Sale Structure (Updated)
```typescript
interface SalePaymentAllocation {
  paymentMethod: PaymentMethod;
  amount: number;
  accountId: string; // Reference to COA
  accountName: string; // e.g., "POS Account", "Cash Account"
  date: string;
}

interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  type: 'sale' | 'repair' | 'return';
  items: SaleItem[];
  
  // Amounts
  subtotal: number;
  vatAmount: number;
  total: number;
  
  // Payment Tracking (NEW)
  paymentStatus: PaymentStatus;
  totalPaid: number; // Sum of all payments received
  remainingDue: number; // total - totalPaid
  
  // Payment Allocations (NEW)
  paymentAllocations: SalePaymentAllocation[]; // Multiple payments
  
  // Accounting (NEW)
  journalEntryId: string; // Initial sale entry
  linkedPaymentEntries: string[]; // Array of payment journal entries
  
  date: string;
}

interface SalePayment {
  id: string;
  saleId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  amount: number;
  date: string;
  notes?: string;
  journalEntryId: string; // Reference to accounting entry
}

interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  
  // Balance Tracking (NEW)
  outstandingBalance: number; // Total due
  totalSales: number;
  totalPaid: number;
  creditLimit?: number;
  creditTerms?: number; // days
  
  totalRepairs: number;
  purchaseHistory?: PurchaseHistoryItem[];
}
```

### 2.3 Chart of Accounts (Essential for Sales)

**Assets (1000-1999)**
- 1000-1099: Cash & Bank Accounts
  - 1010: Cash Account
  - 1020: POS Account
  - 1030: Bank Account
- 1100-1199: Receivables
  - 1110: Accounts Receivable (Customer Due)

**Revenue (4000-4999)**
- 4000-4099: Sales Revenue
  - 4010: Sales Account
  - 4020: Returns Account

**Supporting Accounts**
- 2110: Accounts Payable (for later: supplier payments)
- 3000: Owner's Equity/Capital

---

## 3. Database Tables Design

### 3.1 Sales Table
```sql
CREATE TABLE sales (
  id VARCHAR(50) PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  sale_type ENUM('sale', 'repair', 'return') NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  vat_amount DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  
  -- Payment Tracking
  payment_status ENUM('paid', 'partial', 'pending', 'overdue', 'cleared') NOT NULL,
  total_paid DECIMAL(12, 2) DEFAULT 0,
  remaining_due DECIMAL(12, 2) NOT NULL,
  
  -- Accounting
  journal_entry_id VARCHAR(50),
  
  sale_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
  INDEX (invoice_number),
  INDEX (customer_id),
  INDEX (payment_status)
);
```

### 3.2 Sale Items Table
```sql
CREATE TABLE sale_items (
  id VARCHAR(50) PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL,
  item_id VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity DECIMAL(12, 3) NOT NULL,
  rate_per_unit DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  INDEX (sale_id)
);
```

### 3.3 Sale Payments Table (NEW)
```sql
CREATE TABLE sale_payments (
  id VARCHAR(50) PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  
  payment_method ENUM('cash', 'bank', 'pos', 'check', 'credit', 'other') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes TEXT,
  
  -- Accounting Link
  journal_entry_id VARCHAR(50),
  account_id VARCHAR(50), -- COA account used
  account_name VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id),
  INDEX (sale_id),
  INDEX (customer_id),
  INDEX (invoice_number)
);
```

### 3.4 Payment Allocations Table (NEW)
```sql
CREATE TABLE payment_allocations (
  id VARCHAR(50) PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL,
  payment_method ENUM('cash', 'bank', 'pos', 'check', 'credit', 'other') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Accounting
  account_id VARCHAR(50) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  
  allocation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  INDEX (sale_id)
);
```

### 3.5 Customer Balance Table (NEW - for easy tracking)
```sql
CREATE TABLE customer_balances (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  total_sales DECIMAL(14, 2) DEFAULT 0,
  total_paid DECIMAL(14, 2) DEFAULT 0,
  outstanding_balance DECIMAL(14, 2) DEFAULT 0,
  
  credit_limit DECIMAL(14, 2),
  credit_terms_days INT,
  
  updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

### 3.6 Journal Entries Table (Updated)
```sql
CREATE TABLE journal_entries (
  id VARCHAR(50) PRIMARY KEY,
  entry_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  reference VARCHAR(50) NOT NULL,
  
  reference_type ENUM('sale', 'payment', 'adjustment') NOT NULL,
  related_document_id VARCHAR(50), -- sale_id or payment_id
  
  total_debit DECIMAL(12, 2) NOT NULL,
  total_credit DECIMAL(12, 2) NOT NULL,
  status ENUM('draft', 'posted') NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  posted_at TIMESTAMP NULL,
  
  INDEX (reference),
  INDEX (entry_date)
);

CREATE TABLE journal_entry_lines (
  id VARCHAR(50) PRIMARY KEY,
  journal_entry_id VARCHAR(50) NOT NULL,
  account_id VARCHAR(50) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  
  debit DECIMAL(12, 2) DEFAULT 0,
  credit DECIMAL(12, 2) DEFAULT 0,
  
  line_sequence INT NOT NULL,
  
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id),
  INDEX (journal_entry_id)
);
```

---

## 4. Accounting Logic

### 4.1 Sale Creation with Partial Payment

**Pseudocode:**
```
FUNCTION createSaleWithPartialPayment(saleData, paymentAllocations)
  
  VALIDATE:
    - Customer exists
    - Items in stock
    - Payment methods valid
    - Sum of allocations = total sale (or partial)
  
  // Deduct inventory
  FOR EACH item in saleData.items
    inventory[item.id].quantity -= item.quantity
  END FOR
  
  // Create sale record
  sale = new Sale()
  sale.total = calculateTotal(saleData)
  sale.totalPaid = SUM(paymentAllocations[].amount)
  sale.remainingDue = sale.total - sale.totalPaid
  
  IF sale.remainingDue = 0
    sale.paymentStatus = 'paid'
  ELSE IF sale.totalPaid > 0 AND sale.totalPaid < sale.total
    sale.paymentStatus = 'partial'
  ELSE IF sale.totalPaid = 0
    sale.paymentStatus = 'pending'
  END IF
  
  SAVE sale
  
  // Create journal entry for sale
  journalEntry = createSaleJournalEntry(sale, paymentAllocations)
  sale.journalEntryId = journalEntry.id
  
  // Update customer balance
  updateCustomerBalance(sale.customerId)
  
  RETURN sale

END FUNCTION
```

### 4.2 Create Sale Journal Entry

**Journal Entry Structure:**

For sale of 1000 AED with 500 POS payment + 500 due:

```
Journal Entry: JE-SALE-001
Date: 2026-01-20
Description: Sale INV-001 (Product: Oud, 1000 AED)
Reference: INV-001

Entries:
  Line 1: Debit  | POS Account (1020)        | 500 | -
  Line 2: Debit  | Accounts Receivable (1110)| 500 | -
  Line 3: Credit | Sales Account (4010)      | -   | 1000
  ────────────────────────────────────────────────────
  TOTAL:                                      1000 | 1000  ✓ Balanced
```

**TypeScript Implementation:**
```typescript
function createSaleJournalEntry(
  sale: Sale, 
  paymentAllocations: SalePaymentAllocation[]
): JournalEntry {
  
  const entries: JournalEntryLine[] = [];
  let totalDebit = 0;
  
  // Line 1: For each payment method, create debit entry
  for (const allocation of paymentAllocations) {
    entries.push({
      accountId: allocation.accountId,
      accountName: allocation.accountName,
      debit: allocation.amount,
      credit: 0
    });
    totalDebit += allocation.amount;
  }
  
  // Line 2: For unpaid portion, create Accounts Receivable entry
  if (sale.remainingDue > 0) {
    entries.push({
      accountId: 'COA-1110', // Accounts Receivable
      accountName: 'Accounts Receivable',
      debit: sale.remainingDue,
      credit: 0
    });
    totalDebit += sale.remainingDue;
  }
  
  // Line 3: Credit to Sales Account
  entries.push({
    accountId: 'COA-4010', // Sales Account
    accountName: 'Sales Account',
    debit: 0,
    credit: sale.total
  });
  
  // Create and post journal entry
  const journalEntry: JournalEntry = {
    id: generateId('JE'),
    date: sale.date,
    description: `Sale ${sale.invoiceNumber} - ${sale.customerName}`,
    reference: sale.invoiceNumber,
    entries: entries,
    totalDebit: totalDebit,
    totalCredit: sale.total,
    status: 'posted'
  };
  
  // Validate: Debits must equal Credits
  if (journalEntry.totalDebit !== journalEntry.totalCredit) {
    throw new Error('Journal entry is not balanced');
  }
  
  return journalEntry;
}
```

### 4.3 Payment Receipt (Later Payment)

**Journal Entry for Customer Paying 500 AED in Cash:**

```
Journal Entry: JE-PAYMENT-001
Date: 2026-02-15 (payment date)
Description: Payment Received - INV-001
Reference: INV-001-PAY

Entries:
  Line 1: Debit  | Cash Account (1010)       | 500 | -
  Line 2: Credit | Accounts Receivable (1110)| -   | 500
  ──────────────────────────────────────────────────
  TOTAL:                                       500 | 500  ✓ Balanced
```

**TypeScript Implementation:**
```typescript
function recordPaymentReceived(
  sale: Sale,
  paymentData: {
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
    notes?: string;
  }
): SalePayment {
  
  // Validate: Cannot pay more than due
  if (paymentData.amount > sale.remainingDue) {
    throw new Error('Payment amount exceeds remaining due');
  }
  
  // Create payment record
  const payment: SalePayment = {
    id: generateId('PAY'),
    saleId: sale.id,
    invoiceNumber: sale.invoiceNumber,
    customerId: sale.customerId,
    customerName: sale.customerName,
    paymentMethod: paymentData.paymentMethod,
    amount: paymentData.amount,
    date: paymentData.date,
    notes: paymentData.notes
  };
  
  // Get account mapping for payment method
  const accountMap: Record<PaymentMethod, string> = {
    'cash': 'COA-1010',      // Cash Account
    'bank': 'COA-1030',      // Bank Account
    'pos': 'COA-1020',       // POS Account
    'check': 'COA-1030',     // Bank (checks go to bank)
    'credit': 'COA-1010',    // Treat as cash for now
    'other': 'COA-1010'
  };
  
  // Create journal entry
  const journalEntry: JournalEntry = {
    id: generateId('JE'),
    date: paymentData.date,
    description: `Payment Received - ${sale.invoiceNumber}`,
    reference: `${sale.invoiceNumber}-PAY`,
    entries: [
      {
        accountId: accountMap[paymentData.paymentMethod],
        accountName: getAccountName(accountMap[paymentData.paymentMethod]),
        debit: paymentData.amount,
        credit: 0
      },
      {
        accountId: 'COA-1110', // Accounts Receivable
        accountName: 'Accounts Receivable',
        debit: 0,
        credit: paymentData.amount
      }
    ],
    totalDebit: paymentData.amount,
    totalCredit: paymentData.amount,
    status: 'posted'
  };
  
  // Save journal entry
  payment.journalEntryId = journalEntry.id;
  saveJournalEntry(journalEntry);
  
  // Update sale
  sale.totalPaid += paymentData.amount;
  sale.remainingDue -= paymentData.amount;
  sale.linkedPaymentEntries.push(journalEntry.id);
  
  // Update status
  if (sale.remainingDue === 0) {
    sale.paymentStatus = 'cleared';
  } else if (sale.remainingDue < sale.total && sale.totalPaid > 0) {
    sale.paymentStatus = 'partial';
  }
  
  saveSale(sale);
  
  // Update customer balance
  updateCustomerBalance(sale.customerId);
  
  return payment;
}
```

### 4.4 Customer Balance Update

```typescript
function updateCustomerBalance(customerId: string): void {
  
  // Get all sales for this customer
  const customerSales = getSalesByCustomer(customerId);
  
  let totalSales = 0;
  let totalPaid = 0;
  let outstandingBalance = 0;
  
  for (const sale of customerSales) {
    if (sale.type === 'sale') { // Exclude returns
      totalSales += sale.total;
      totalPaid += sale.totalPaid;
      outstandingBalance += sale.remainingDue;
    }
  }
  
  // Update customer record
  const customer = getCustomer(customerId);
  customer.totalSales = totalSales;
  customer.outstandingBalance = outstandingBalance;
  customer.totalPaid = totalPaid;
  
  saveCustomer(customer);
  
  // Update/create balance tracking record
  let balanceRecord = getCustomerBalance(customerId);
  if (!balanceRecord) {
    balanceRecord = {
      id: generateId('CB'),
      customerId: customerId,
      totalSales: totalSales,
      totalPaid: totalPaid,
      outstandingBalance: outstandingBalance
    };
  } else {
    balanceRecord.totalSales = totalSales;
    balanceRecord.totalPaid = totalPaid;
    balanceRecord.outstandingBalance = outstandingBalance;
  }
  
  saveCustomerBalance(balanceRecord);
}
```

---

## 5. Key Business Rules

1. **Sale can only be created if:**
   - Customer exists
   - At least one item selected
   - Total amount > 0
   - Payment method is valid

2. **Payment Status:**
   - `pending`: No payment received (total_paid = 0)
   - `partial`: Some payment received (0 < total_paid < total)
   - `paid`: Full payment on creation (total_paid = total)
   - `cleared`: Initially partial, now fully paid later
   - `overdue`: Past due date, unpaid

3. **Payment Allocation:**
   - Multiple payment methods allowed (50 AED POS + 450 AED Bank)
   - Sum must equal sale total OR be less (for partial)
   - Each allocation linked to Chart of Accounts

4. **Journal Entry Rules:**
   - Must always balance (Debit = Credit)
   - Sale entry created at sale creation time
   - Payment entry created when payment received
   - Each entry has reference to source document

5. **Customer Balance:**
   - Updated after every sale creation
   - Updated after every payment received
   - Shows total outstanding due
   - Supports credit limit checks

---

## 6. Reporting & Analytics

### 6.1 Sales Report with Payment Status
```sql
SELECT 
  s.invoice_number,
  s.customer_name,
  s.total,
  s.total_paid,
  s.remaining_due,
  s.payment_status,
  s.sale_date,
  COUNT(sp.id) as payment_count
FROM sales s
LEFT JOIN sale_payments sp ON s.id = sp.sale_id
WHERE s.sale_date BETWEEN ? AND ?
GROUP BY s.id
ORDER BY s.sale_date DESC;
```

### 6.2 Customer Outstanding Balance Report
```sql
SELECT 
  c.id,
  c.name,
  c.contact,
  cb.total_sales,
  cb.total_paid,
  cb.outstanding_balance,
  COUNT(s.id) as total_invoices
FROM customers c
LEFT JOIN customer_balances cb ON c.id = cb.customer_id
LEFT JOIN sales s ON c.id = s.customer_id AND s.payment_status IN ('partial', 'pending')
GROUP BY c.id
HAVING cb.outstanding_balance > 0
ORDER BY cb.outstanding_balance DESC;
```

### 6.3 Accounts Receivable Aging Report
```sql
SELECT 
  s.invoice_number,
  s.customer_name,
  s.total,
  s.remaining_due,
  s.sale_date,
  DATEDIFF(CURDATE(), s.sale_date) as days_outstanding,
  CASE 
    WHEN DATEDIFF(CURDATE(), s.sale_date) <= 30 THEN 'Current'
    WHEN DATEDIFF(CURDATE(), s.sale_date) <= 60 THEN '31-60 Days'
    WHEN DATEDIFF(CURDATE(), s.sale_date) <= 90 THEN '61-90 Days'
    ELSE 'Over 90 Days'
  END as aging_bucket
FROM sales s
WHERE s.payment_status IN ('partial', 'pending')
ORDER BY s.sale_date ASC;
```

---

## 7. Implementation Priority

### Phase 1: Core Structure
- [ ] Update types.ts with new interfaces
- [ ] Create database tables
- [ ] Implement createSaleJournalEntry()
- [ ] Implement recordPaymentReceived()

### Phase 2: UI Components
- [ ] Update SalesModule with payment allocations
- [ ] Create payment method selector
- [ ] Add real-time balance calculation
- [ ] Create payment receipt form

### Phase 3: Reporting
- [ ] Outstanding balance report
- [ ] Aging report
- [ ] Payment tracking dashboard
- [ ] Customer credit status

### Phase 4: Advanced Features
- [ ] Credit limit checks
- [ ] Automatic overdue alerts
- [ ] Payment reminders
- [ ] Partial refund handling

---

## 8. Example Scenarios

### Scenario 1: Full Payment at Sale
- Sale: 1000 AED
- POS Payment: 1000 AED
- Status: `paid`
- AR Balance: 0

### Scenario 2: Partial Payment at Sale, Later Full Payment
- **Day 1 Sale:**
  - Sale: 1000 AED
  - POS Payment: 500 AED
  - Status: `partial`
  - AR Balance: 500 AED
  
- **Day 30 Payment:**
  - Cash Payment: 500 AED
  - Status: `cleared`
  - AR Balance: 0

### Scenario 3: Multiple Payment Methods
- Sale: 1000 AED
- POS Payment: 600 AED (allocated to POS Account)
- Bank Transfer: 300 AED (allocated to Bank Account)
- Remaining Due: 100 AED (allocated to AR Account)
- Status: `partial`

### Scenario 4: Return Adjustment
- Original Sale: 1000 AED (partial 500 paid)
- Return: 200 AED
- New Total: 800 AED
- Adjustment Entry: Credit AR 200, Debit Returns Account

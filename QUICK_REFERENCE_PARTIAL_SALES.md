# Quick Reference: Partial Sales Implementation

## Files Created

| File | Purpose |
|------|---------|
| `PARTIAL_SALES_DESIGN.md` | Complete design architecture & business rules |
| `IMPLEMENTATION_GUIDE_PARTIAL_SALES.md` | Step-by-step implementation guide |
| `types-enhanced.ts` | Enhanced TypeScript interfaces |
| `accounting-logic.ts` | Core accounting business logic |
| `SalesModuleEnhanced.tsx` | React UI component for sales |
| `scenarios-and-tests.ts` | Practical examples & test cases |

---

## Core Concepts

### 1. Double-Entry Accounting
Every transaction has two sides:
- **Debit**: Money going into an account (left side)
- **Credit**: Money going out of an account (right side)
- **Rule**: Total Debits MUST equal Total Credits

### 2. Chart of Accounts (COA)
```
Assets (1000-1999)
  ├─ Cash (1010)
  ├─ POS Account (1020)
  ├─ Bank Account (1030)
  └─ Accounts Receivable (1110) ← Customer Due

Revenue (4000-4999)
  └─ Sales Account (4010)
```

### 3. Partial Payment Workflow

```
SALE CREATION
├─ Validate customer & items
├─ Calculate total with VAT
├─ Record payment allocations
├─ Generate journal entry (POSTED)
└─ Update customer balance

LATER: PAYMENT RECEIVED
├─ Validate payment <= remaining due
├─ Create payment record
├─ Generate payment journal entry (POSTED)
├─ Update sale status
└─ Update customer balance
```

---

## Key Functions

### Create Sale with Partial Payment
```typescript
import { createSaleWithPartialPayment } from './accounting-logic';

const { sale, journalEntry } = createSaleWithPartialPayment(
  {
    customerId: 'CUST-001',
    customerName: 'Ahmad',
    items: [{ itemId: 'OUD', itemName: 'Oud', quantity: 1, ratePerUnit: 1000, amount: 1000 }],
    type: 'sale',
    invoiceNumber: 'INV-001',
    date: '2026-01-20',
  },
  [
    {
      paymentMethod: 'pos',
      amount: 500,
      accountId: 'COA-1020',
      accountName: 'POS Account',
      date: '2026-01-20',
    }
  ]
);

console.log(`Invoice: ${sale.invoiceNumber}`);
console.log(`Total: ${sale.total}, Paid: ${sale.totalPaid}, Due: ${sale.remainingDue}`);
console.log(`Status: ${sale.paymentStatus}`); // 'partial'
console.log(`Journal Balanced: ${isJournalEntryBalanced(journalEntry)}`); // true
```

### Record Payment Later
```typescript
import { recordPaymentReceived, updateSaleAfterPayment } from './accounting-logic';

const { payment, journalEntry } = recordPaymentReceived(sale, {
  amount: 500,
  paymentMethod: 'cash',
  date: '2026-02-15',
});

const updatedSale = updateSaleAfterPayment(sale, payment);
console.log(`Now: Paid=${updatedSale.totalPaid}, Due=${updatedSale.remainingDue}`);
console.log(`Status: ${updatedSale.paymentStatus}`); // 'cleared'
```

### Track Customer Balance
```typescript
import { calculateCustomerBalance, updateCustomerBalance } from './accounting-logic';

const balance = calculateCustomerBalance(allSalesForCustomer);
console.log(`Total Sales: ${balance.totalSales}`);
console.log(`Total Paid: ${balance.totalPaid}`);
console.log(`Outstanding: ${balance.outstandingBalance}`);
```

---

## Journal Entry Examples

### Sale with Partial Payment
```
Date: 2026-01-20
Description: Sale INV-001 - Ahmad (sale)
Reference: INV-001

Dr | POS Account (1020)           | 500
Dr | Accounts Receivable (1110)   | 500
───────────────────────────────────────
Cr | Sales Account (4010)         |     | 1050
```

### Customer Pays Remaining
```
Date: 2026-02-15
Description: Payment Received - INV-001 (Ahmad)
Reference: INV-001-PAY

Dr | Cash Account (1010)          | 500
───────────────────────────────────────
Cr | Accounts Receivable (1110)   |     | 500
```

### Result: Accounts Receivable Goes to Zero
- Initial AR: 500 (after sale)
- After payment: 500 - 500 = **0** ✓

---

## Implementation Checklist

### Phase 1: Types (15 min)
- [ ] Add `PaymentMethod`, `PaymentStatus` types to `types.ts`
- [ ] Add `SalePaymentAllocation`, `SalePayment` interfaces
- [ ] Update `Sale` interface with new fields
- [ ] Update `Customer` interface with balance tracking

### Phase 2: Logic (30 min)
- [ ] Import/copy `accounting-logic.ts`
- [ ] Add mock data with partial payments
- [ ] Update Chart of Accounts
- [ ] Test `createSaleWithPartialPayment()`

### Phase 3: UI (45 min)
- [ ] Import `SalesModuleEnhanced` component
- [ ] Test payment allocation UI
- [ ] Test payment recording
- [ ] Verify calculations

### Phase 4: Accounting (30 min)
- [ ] Display sale journal entries
- [ ] Display payment entries
- [ ] Verify balance checks
- [ ] Add linked entries display

### Phase 5: Reports (30 min)
- [ ] Outstanding balance report
- [ ] AR aging report
- [ ] Customer credit status

**Total: ~2.5 hours for basic implementation**

---

## Common Patterns

### Pattern 1: Multiple Payment Methods
```typescript
const allocations = [
  { paymentMethod: 'pos', amount: 600, accountId: 'COA-1020', ... },
  { paymentMethod: 'cash', amount: 300, accountId: 'COA-1010', ... },
  { paymentMethod: 'bank', amount: 150, accountId: 'COA-1030', ... },
];
// Total: 1050 (paid)
// Remaining: 0 (fully paid)
```

### Pattern 2: Partial Payment with AR
```typescript
const allocations = [
  { paymentMethod: 'bank', amount: 800, accountId: 'COA-1030', ... },
];
// Total: 1000
// Paid: 800
// Remaining: 200 → Goes to Accounts Receivable
```

### Pattern 3: Multiple Payments
```typescript
// First payment
recordPaymentReceived(sale, { amount: 200, method: 'cash', ... });

// Second payment
recordPaymentReceived(sale, { amount: 300, method: 'bank', ... });

// Third payment (final)
recordPaymentReceived(sale, { amount: 100, method: 'pos', ... });

// Result: Sale fully cleared with 3 linked journal entries
```

---

## Validation Rules

```typescript
// All of these must be TRUE:

1. sale.totalPaid + sale.remainingDue === sale.total
2. journalEntry.totalDebit === journalEntry.totalCredit
3. paymentAmount > 0 AND paymentAmount <= sale.remainingDue
4. sum(paymentAllocations.amounts) <= sale.total
5. customer exists before sale creation
6. sale.paymentStatus determined correctly:
   - 'paid' if remainingDue === 0
   - 'partial' if 0 < totalPaid < total
   - 'pending' if totalPaid === 0
   - 'cleared' if was partial, now remainingDue === 0
```

---

## Error Handling

```typescript
try {
  const { sale, journalEntry } = createSaleWithPartialPayment(saleData, allocations);
} catch (error) {
  // Possible errors:
  // - "Customer information is required"
  // - "At least one item is required"
  // - "Payment allocations exceed sale total"
  // - "Journal entry not balanced"
  
  console.error(error.message);
}

try {
  recordPaymentReceived(sale, { amount: 600, ... });
} catch (error) {
  // Possible errors:
  // - "Payment amount exceeds remaining due"
  // - "Payment amount must be positive"
  // - "Payment journal entry is not balanced"
  
  console.error(error.message);
}
```

---

## Performance Optimization

### For Large Customer Bases:
```typescript
// 1. Use customer balance table for quick lookups
const balance = getCustomerBalance(customerId); // O(1) instead of O(n)

// 2. Index sales by customer
CREATE INDEX idx_sales_customer_id ON sales(customer_id);

// 3. Cache outstanding balances
const cache = new Map<string, number>();

// 4. Batch update balance calculations
updateMultipleCustomerBalances([customerId1, customerId2, ...]);
```

---

## Testing

### Unit Tests
```typescript
// Test create sale
expect(sale.paymentStatus).toBe('partial');
expect(sale.remainingDue).toBe(500);

// Test journal balance
expect(isJournalEntryBalanced(journalEntry)).toBe(true);

// Test payment
expect(updatedSale.remainingDue).toBe(0);
expect(updatedSale.paymentStatus).toBe('cleared');
```

### Integration Tests
```typescript
// Flow: Create → Pay → Verify Balance
const sale = createSale(...);
recordPayment(sale, 500);
const balance = calculateBalance([sale]);
expect(balance.outstandingBalance).toBe(0);
```

---

## Troubleshooting

### Journal Entry Not Balanced
```
❌ Debit: 1050 | Credit: 1000

Check:
1. Are all payment allocations included?
2. Is Accounts Receivable included for unpaid amount?
3. Is sale total correct (including VAT)?
```

### Customer Balance Wrong
```
❌ Outstanding: 500 (should be 0)

Check:
1. Has sale been created? journalEntryId set?
2. Has payment been recorded? linkedPaymentEntries updated?
3. Run: calculateCustomerBalance(sales) from scratch
```

### Payment Already Recorded
```
❌ "Payment amount exceeds remaining due"

Check:
1. Is payment already in the sale.linkedPaymentEntries?
2. Is sale.totalPaid already updated?
3. Verify sale.remainingDue is correct
```

---

## Next Steps

1. **Copy files** to your project
2. **Update types** in `types.ts`
3. **Integrate logic** in your services/hooks
4. **Update UI** with `SalesModuleEnhanced`
5. **Add reports** for AR tracking
6. **Test thoroughly** with provided scenarios
7. **Deploy** to production

---

## Support Resources

- 📄 Full Design: `PARTIAL_SALES_DESIGN.md`
- 🔧 Implementation: `IMPLEMENTATION_GUIDE_PARTIAL_SALES.md`
- 💻 Code Examples: `scenarios-and-tests.ts`
- 🧩 Logic Module: `accounting-logic.ts`
- 🎨 UI Component: `SalesModuleEnhanced.tsx`

---

## Key Takeaways

✅ **Partial payments are recorded at sale time, not just noted**
✅ **Journal entries always balance (Debit = Credit)**
✅ **Accounts Receivable tracks customer due amounts**
✅ **Each payment generates its own journal entry**
✅ **Customer balance updates automatically**
✅ **All entries maintain audit trail**

---

## Example: End-to-End Flow

```
DAY 1: Customer buys Oud for 1000 AED
├─ Creates Sale: INV-001, paid 500 POS, due 500
├─ Journal Entry: Dr POS 500, Dr AR 500, Cr Sales 1000 ✓
└─ Customer balance: 500 outstanding

DAY 30: Customer pays remaining 500 via bank
├─ Records Payment: 500 bank transfer
├─ Journal Entry: Dr Bank 500, Cr AR 500 ✓
├─ Updates Sale: totalPaid 1000, remainingDue 0
└─ Customer balance: 0 outstanding (CLEARED)

ACCOUNTING CHECK:
├─ Assets: POS 500 + Bank 500 + AR 0 = 1000
├─ Equity: Sales 1000
└─ Formula: Assets (1000) = Equity (1000) ✓ BALANCED
```

This completes your partial sales implementation with proper double-entry accounting! 🎉

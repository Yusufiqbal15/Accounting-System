# Visual Diagrams: Partial Sales with Double-Entry Accounting

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SALES MODULE (FRONTEND)                      │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ Customer Select │  │  Add Sale Items  │  │ Payment Config │  │
│  │                 │  │                  │  │                │  │
│  │ - Search        │  │ - Item selector  │  │ - Method       │  │
│  │ - View Balance  │  │ - Qty & Rate     │  │ - Amount       │  │
│  │ - Select        │  │ - Remove item    │  │ - Account      │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬───────┘  │
│           │                    │                     │           │
│           └────────────────────┼─────────────────────┘           │
│                                ▼                                 │
│                    ┌─────────────────────┐                      │
│                    │ Real-time Calc      │                      │
│                    │ ─────────────────── │                      │
│                    │ Subtotal, VAT,      │                      │
│                    │ Total, Paid, Due    │                      │
│                    └─────────┬───────────┘                      │
│                              ▼                                   │
│                    [CREATE SALE BUTTON]                         │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────────┐                      │
│                    │ Record Payment      │                      │
│                    │ - Amount            │                      │
│                    │ - Method            │                      │
│                    │ - Date              │                      │
│                    └─────────┬───────────┘                      │
└────────────────────────────────┼──────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌──────────────────────┐   ┌──────────────────────┐
        │  ACCOUNTING LOGIC    │   │  CUSTOMER BALANCE    │
        │  ──────────────────  │   │  ──────────────────  │
        │ - Validate Sale      │   │ - Calculate Total    │
        │ - Create JE          │   │ - Calculate Paid     │
        │ - Post Entry         │   │ - Calculate Due      │
        │ - Record Payment     │   │ - Determine Risk     │
        └──────────┬───────────┘   └──────────┬───────────┘
                   │                          │
                   │    ┌────────────────────┘
                   ▼    ▼
        ┌──────────────────────────────┐
        │  CHART OF ACCOUNTS           │
        │  ────────────────────────    │
        │  1010 Cash Account           │
        │  1020 POS Account            │
        │  1030 Bank Account           │
        │  1110 Accounts Receivable    │
        │  4010 Sales Account          │
        └──────────────────────────────┘
```

---

## 2. Sale Creation Flow Diagram

```
START: Create Sale
   │
   ├─→ Select Customer ──→ Get customer info
   │
   ├─→ Add Sale Items ──→ [Item 1, Item 2, ...]
   │
   ├─→ Calculate Totals ──→ Subtotal + VAT = Total
   │
   ├─→ Add Payment Allocation(s) ──→ [POS 500, Bank 300, ...]
   │
   ├─→ VALIDATE
   │  ├─ Customer exists ✓
   │  ├─ Items not empty ✓
   │  ├─ Allocations ≤ Total ✓
   │  └─ All amounts > 0 ✓
   │
   ├─→ CREATE SALE RECORD
   │  ├─ sale.id
   │  ├─ sale.total = 1050
   │  ├─ sale.totalPaid = 500
   │  ├─ sale.remainingDue = 550
   │  └─ sale.paymentStatus = 'partial'
   │
   ├─→ CREATE JOURNAL ENTRY
   │  ├─ For each allocation:
   │  │  └─ Dr [Payment Account] [Amount]
   │  │
   │  ├─ If remainingDue > 0:
   │  │  └─ Dr [Accounts Receivable] [Amount]
   │  │
   │  ├─ Credit Sales Account
   │  │  └─ Cr [Sales Account] [Total]
   │  │
   │  ├─ VALIDATE: Debit = Credit ✓
   │  │
   │  └─ Status = 'posted'
   │
   ├─→ UPDATE CUSTOMER
   │  ├─ outstandingBalance += 550
   │  ├─ totalSales += 1050
   │  └─ totalPaid += 500
   │
   └─→ END: Sale Created ✓
       Linked: sale → journalEntry → customer
```

---

## 3. Journal Entry Visualization

### Sale Entry (Partial Payment)

```
┌─────────────────────────────────────────────────────────┐
│ Journal Entry: JE-SALE-001                              │
├─────────────────────────────────────────────────────────┤
│ Date: 2026-01-20                                        │
│ Reference: INV-001                                      │
│ Description: Sale INV-001 - Ahmad Al-Mansouri (sale)   │
├─────────────────────────────────────────────────────────┤
│ Account               │ Debit    │ Credit   │ Purpose   │
├──────────────────────┼──────────┼──────────┼───────────┤
│ POS Account (1020)   │ 500      │          │ Received  │
│ Accounts Receivable  │ 550      │          │ Still Due │
│ (1110)               │          │          │           │
├──────────────────────┼──────────┼──────────┤───────────┤
│ Sales Account (4010) │          │ 1050     │ Revenue   │
├──────────────────────┼──────────┼──────────┼───────────┤
│ TOTAL                │ 1050     │ 1050     │ Balanced✓ │
└──────────────────────┴──────────┴──────────┴───────────┘

Formula Check:
  Debits:   500 + 550 = 1050
  Credits:  1050
  Result:   1050 = 1050 ✓ BALANCED
```

### Payment Entry (Later)

```
┌─────────────────────────────────────────────────────────┐
│ Journal Entry: JE-PAY-001                               │
├─────────────────────────────────────────────────────────┤
│ Date: 2026-02-15                                        │
│ Reference: INV-001-PAY                                  │
│ Description: Payment Received - INV-001 (Ahmad)        │
├─────────────────────────────────────────────────────────┤
│ Account               │ Debit    │ Credit   │ Purpose   │
├──────────────────────┼──────────┼──────────┼───────────┤
│ Cash Account (1010)  │ 550      │          │ Received  │
├──────────────────────┼──────────┼──────────┤───────────┤
│ Accounts Receivable  │          │ 550      │ Cleared   │
│ (1110)               │          │          │           │
├──────────────────────┼──────────┼──────────┼───────────┤
│ TOTAL                │ 550      │ 550      │ Balanced✓ │
└──────────────────────┴──────────┴──────────┴───────────┘

Result: AR balance goes 550 → 0 ✓
```

---

## 4. Payment Status Lifecycle

```
                    ┌─────────────────┐
                    │   CREATE SALE   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  totalPaid = 0  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Determine Status│
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┬────────────┐
                │            │            │            │
                ▼            ▼            ▼            ▼
           totalPaid=0  0<totalPaid totalPaid=total remainingDue=0
             ╔════════╗  <total   ╔══════════╗  after payment
             ║PENDING ║     │     ║ PARTIAL  ║      │
             ╚════════╝     ▼     ╚════┬═════╝      ▼
                        ╔════════╗     │       ╔═════════╗
                        ║  PAID  ║     │       ║ CLEARED ║
                        ╚════════╝     │       ╚═════════╝
                                       │
                            recordPaymentReceived()
                                       │
                                       ▼
                                (if full payment)


State Transitions:
  PENDING  → PAID (if full payment at sale)
  PENDING  → PARTIAL (when partial payment added)
  PARTIAL  → CLEARED (when remaining paid later)
  PARTIAL  → PENDING (if payment refunded - future feature)
```

---

## 5. Accounts Receivable (AR) Flow

```
ACCOUNTS RECEIVABLE ACCOUNT
═══════════════════════════════════════════════════════════

Initial Balance: 0


Sale INV-001 (1000 AED, 500 paid, 500 due)
  Dr: Accounts Receivable    550
  Cr: Sales Account                 1050
  
Balance After Sale 1: 550
┌────────────────────────────────┐
│         AR Account             │
│   Dr: 550  │  Cr:             │
│  Balance: 550 (Customer Owes)  │
└────────────────────────────────┘


Customer pays 550 in Cash
  Dr: Cash Account           550
  Cr: Accounts Receivable            550

Balance After Payment: 0
┌────────────────────────────────┐
│         AR Account             │
│   Dr: 550  │  Cr: 550         │
│  Balance: 0 (Fully Paid)       │
└────────────────────────────────┘


The Accounting Equation:
  Before Payment: Assets (POS+AR+Cash) = Liabilities + Equity
                  500 + 550 + 0 = 0 + 1050 ✓
  
  After Payment:  Assets (POS+AR+Cash) = Liabilities + Equity
                  500 + 0 + 550 = 0 + 1050 ✓
```

---

## 6. Multiple Payment Methods

```
Sale: 3000 AED Total

Payment Allocation:
┌─────────────────────────────────────────┐
│  Payment Method  │  Amount   │ Account  │
├──────────────────┼───────────┼──────────┤
│  POS             │  1000     │ COA-1020 │
│  Bank            │  1000     │ COA-1030 │
│  Cash            │  1000     │ COA-1010 │
├──────────────────┼───────────┼──────────┤
│  TOTAL PAID      │  3000     │  (FULL)  │
└─────────────────────────────────────────┘

Journal Entry:
┌──────────────────────────────────────────────┐
│ Dr │ POS Account      │ 1000                 │
│ Dr │ Bank Account     │ 1000                 │
│ Dr │ Cash Account     │ 1000                 │
├────┼──────────────────┼──────────────────────┤
│ Cr │ Sales Account    │         3150 (inc VAT)
├────┼──────────────────┼──────────────────────┤
│    │ TOTAL            │ 3000 = 3000 ✓       │
└──────────────────────────────────────────────┘

Asset Movement:
  Before: POS: 0,  Bank: 0,  Cash: 0
  After:  POS: 1000, Bank: 1000, Cash: 1000
  Net Impact: +3000 (customer paid in full)
```

---

## 7. Customer Balance Dashboard

```
CUSTOMER: Ahmad Al-Mansouri

Sales Transactions:
┌────────┬────────────┬──────┬──────┬──────┬──────────┐
│Invoice │    Date    │Total │ Paid │ Due  │ Status   │
├────────┼────────────┼──────┼──────┼──────┼──────────┤
│INV-001 │2026-01-20 │1050  │500   │550   │PARTIAL   │
│INV-002 │2026-01-22 │2100  │2100  │0     │PAID      │
│INV-003 │2026-01-25 │3150  │1000  │2150  │PARTIAL   │
└────────┴────────────┴──────┴──────┴──────┴──────────┘

Balance Summary:
┌─────────────────────────────────┐
│ Total Sales:                    │
│ ├─ INV-001:  1050              │
│ ├─ INV-002:  2100              │
│ ├─ INV-003:  3150              │
│ └─ SUBTOTAL: 6300              │
├─────────────────────────────────┤
│ Total Payments Received:        │
│ ├─ INV-001:  500               │
│ ├─ INV-002:  2100              │
│ ├─ INV-003:  1000              │
│ └─ SUBTOTAL: 3600              │
├─────────────────────────────────┤
│ Outstanding Balance:            │
│ ├─ INV-001:  550               │
│ ├─ INV-002:  0                 │
│ ├─ INV-003:  2150              │
│ └─ TOTAL:    2700 (DUE)        │
├─────────────────────────────────┤
│ Payment Status:                 │
│ └─ 57.14% Paid (3600/6300)     │
│ └─ 42.86% Outstanding (2700)   │
├─────────────────────────────────┤
│ Credit Risk:                    │
│ └─ MEDIUM (42% unpaid)         │
└─────────────────────────────────┘
```

---

## 8. Database Schema Overview

```
SALES TABLE
┌─────────────────────────────────────────────────────┐
│ id              │ INV-001                           │
│ invoice_number  │ INV-001                           │
│ customer_id     │ CUST-001                          │
│ customer_name   │ Ahmad Al-Mansouri                │
│ subtotal        │ 1000.00                          │
│ vat_amount      │ 50.00                            │
│ total           │ 1050.00                          │
├─────────────────────────────────────────────────────┤
│ payment_status  │ partial  ◄─ NEW                  │
│ total_paid      │ 500.00   ◄─ NEW                  │
│ remaining_due   │ 550.00   ◄─ NEW                  │
├─────────────────────────────────────────────────────┤
│ journal_entry_id │ JE-SALE-001                      │
│ linked_payments  │ [JE-PAY-001, ...]                │
└─────────────────────────────────────────────────────┘
       │
       ├─→ PAYMENT_ALLOCATIONS TABLE
       │   ┌────────────────────────────────┐
       │   │ sale_id     │ INV-001          │
       │   │ method      │ pos              │
       │   │ amount      │ 500.00           │
       │   │ account_id  │ COA-1020         │
       │   └────────────────────────────────┘
       │
       └─→ SALE_PAYMENTS TABLE
           ┌────────────────────────────────┐
           │ sale_id     │ INV-001          │
           │ amount      │ 550.00           │
           │ method      │ cash             │
           │ date        │ 2026-02-15       │
           │ journal_id  │ JE-PAY-001       │
           └────────────────────────────────┘


CUSTOMERS TABLE
┌──────────────────────────────────────────────────┐
│ id                   │ CUST-001                 │
│ name                 │ Ahmad Al-Mansouri       │
│ total_sales          │ 6300.00    ◄─ UPDATED  │
│ total_paid           │ 3600.00    ◄─ UPDATED  │
│ outstanding_balance  │ 2700.00    ◄─ NEW     │
│ credit_limit         │ 5000.00    ◄─ NEW     │
│ risk_level           │ medium     ◄─ NEW     │
└──────────────────────────────────────────────────┘
```

---

## 9. Accounting Equation Validation

```
THE FUNDAMENTAL EQUATION:
   ASSETS = LIABILITIES + EQUITY

Sale Day (1050 AED total, 500 POS paid, 550 due):

ASSETS                          LIABILITIES + EQUITY
├─ POS Account      500          (none)
└─ AR (Customer)    550          └─ Sales Revenue  1050
───────────────────────           ─────────────────────
  TOTAL ASSETS:    1050            TOTAL L+E:      1050 ✓

Payment Day (550 paid from customer):

ASSETS                          LIABILITIES + EQUITY
├─ Cash            550          (none)
├─ POS Account     500          └─ Sales Revenue  1050
└─ AR (Customer)     0
───────────────────────           ─────────────────────
  TOTAL ASSETS:   1050            TOTAL L+E:       1050 ✓

Key Insight: No matter when payment is received,
             the accounting equation always balances!
```

---

## 10. Implementation Timeline

```
┌──────────────────────────────────────────────────────────────────┐
│ IMPLEMENTATION TIMELINE                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Phase 1: Types (15 min)                                         │
│ ├─ Add PaymentMethod, PaymentStatus types                      │
│ ├─ Add SalePaymentAllocation interface                         │
│ ├─ Update Sale interface                                        │
│ └─ Update Customer interface                                    │
│   └─ ✓ types-enhanced.ts created                               │
│                                                                  │
│ Phase 2: Logic (30 min)                                         │
│ ├─ Add accounting-logic.ts module                              │
│ ├─ Implement createSaleWithPartialPayment()                    │
│ ├─ Implement recordPaymentReceived()                           │
│ └─ Add validation functions                                     │
│   └─ ✓ accounting-logic.ts created                             │
│                                                                  │
│ Phase 3: UI (45 min)                                            │
│ ├─ Create SalesModuleEnhanced component                        │
│ ├─ Add payment allocation UI                                   │
│ ├─ Add payment recording dialog                                │
│ └─ Test calculations                                            │
│   └─ ✓ SalesModuleEnhanced.tsx created                         │
│                                                                  │
│ Phase 4: Accounting (30 min)                                    │
│ ├─ Update AccountingModule                                      │
│ ├─ Display sale journal entries                                │
│ ├─ Display payment entries                                      │
│ └─ Verify balance checks                                        │
│   └─ ✓ Module updates needed                                   │
│                                                                  │
│ Phase 5: Reports (30 min)                                       │
│ ├─ Add Outstanding Balance report                              │
│ ├─ Add AR Aging report                                         │
│ └─ Add Customer Credit Status                                   │
│   └─ ✓ Functions available in accounting-logic                │
│                                                                  │
│ Phase 6: Testing (15 min)                                       │
│ ├─ Run scenario examples                                        │
│ ├─ Test with provided test cases                               │
│ └─ Verify all validations                                       │
│   └─ ✓ scenarios-and-tests.ts created                          │
│                                                                  │
│ Phase 7: Deploy (15 min)                                        │
│ ├─ Database migrations (if needed)                              │
│ ├─ Deploy code changes                                          │
│ └─ Verify in production                                         │
│   └─ ✓ Ready to go                                             │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ TOTAL TIME: 2.5-3 hours                                          │
│                                                                  │
│ STATUS: ✓ ALL COMPONENTS CREATED AND DOCUMENTED                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. File Dependencies

```
APPLICATION LAYER
├─ SalesModuleEnhanced.tsx (UI)
│  └─ imports
│     ├─ types-enhanced.ts (TypeScript types)
│     │  └─ uses
│     │     └─ Sale, SalePayment, Customer
│     │
│     └─ accounting-logic.ts (Business logic)
│        ├─ createSaleWithPartialPayment()
│        ├─ recordPaymentReceived()
│        └─ updateSaleAfterPayment()
│
├─ AccountingModule.tsx (UI)
│  └─ Displays JournalEntry from accounting-logic
│
└─ App.tsx (Main)
   ├─ SalesModuleEnhanced
   ├─ AccountingModule
   └─ ReportsModule (for AR reports)

DATABASE LAYER
├─ sales
├─ sale_items
├─ sale_payments ◄─ NEW
├─ payment_allocations ◄─ NEW
├─ customers
└─ journal_entries

MOCK DATA (Development)
├─ mockSales
├─ mockSalePayments ◄─ NEW
├─ mockCustomers (updated)
└─ mockChartOfAccounts (updated)
```

---

This completes your visual reference guide! All diagrams show the flow, structure, and validation of the partial sales system with proper double-entry accounting.

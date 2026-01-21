// Enhanced Type Definitions for Sales with Partial Payments & Double-Entry Accounting

// Payment Methods
export type PaymentMethod = 'cash' | 'bank' | 'pos' | 'check' | 'credit' | 'other';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue' | 'cleared';

// ============================================================================
// PAYMENT & SALE STRUCTURES
// ============================================================================

/**
 * Payment allocation for a sale - indicates which account receives which amount
 * Example: Sale of 1000 AED with 500 POS + 500 due
 */
export interface SalePaymentAllocation {
  paymentMethod: PaymentMethod;
  amount: number;
  accountId: string; // Chart of Accounts reference (e.g., 'COA-1020' for POS)
  accountName: string; // Human readable (e.g., "POS Account")
  date: string; // When this payment was made/allocated
}

/**
 * Individual item in a sale
 */
export interface SaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  volume?: number;
  ratePerUnit: number;
  amount: number; // quantity * ratePerUnit
}

/**
 * Complete sale transaction with partial payment support
 * 
 * Example: Sale of Oud 1000 AED
 * - 500 AED paid via POS at sale time
 * - 500 AED remaining due from customer
 */
export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  type: 'sale' | 'repair' | 'return';
  
  // Items
  items: SaleItem[];
  
  // Amounts
  subtotal: number;
  vatAmount: number; // 5%
  total: number;
  
  // Payment Tracking (ENHANCED)
  paymentStatus: PaymentStatus;
  totalPaid: number; // Sum of all payments received
  remainingDue: number; // total - totalPaid
  
  // Payment Allocations (NEW)
  // Shows how the payment was split (e.g., 500 POS + 500 AR)
  paymentAllocations: SalePaymentAllocation[];
  
  // Accounting Links (ENHANCED)
  journalEntryId: string; // Initial sale entry
  linkedPaymentEntries: string[]; // Array of payment journal entry IDs
  
  date: string;
}

/**
 * Payment record for a sale - created when customer pays
 * Links a payment to its corresponding journal entry
 */
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
  
  // Accounting Link
  journalEntryId: string; // Reference to accounting entry
  accountId: string; // Which COA account received this payment
  accountName: string;
}

/**
 * Payment allocation detail - stored separately for detailed tracking
 * (Can be same as SalePaymentAllocation, but kept for history/audit)
 */
export interface PaymentAllocation {
  id: string;
  saleId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  accountId: string; // Chart of Accounts
  accountName: string;
  date: string;
}

// ============================================================================
// CUSTOMER STRUCTURES
// ============================================================================

/**
 * Enhanced customer with balance tracking
 */
export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  
  // Balance Tracking (ENHANCED)
  outstandingBalance: number; // Total due from this customer
  totalSales: number; // Lifetime sales total
  totalPaid: number; // Lifetime payments received
  totalRepairs: number;
  
  // Credit Management (NEW)
  creditLimit?: number; // Maximum credit allowed
  creditTerms?: number; // Number of days for payment
  riskLevel?: 'low' | 'medium' | 'high'; // Based on payment history
  
  purchaseHistory?: Array<{
    invoiceNumber: string;
    itemName: string;
    quantity: number;
    amount: number;
    date: string;
    type: 'sale' | 'repair' | 'return';
    paymentStatus: PaymentStatus;
  }>;
}

/**
 * Separate tracking for customer balance snapshots
 * Denormalized for performance in reports
 */
export interface CustomerBalance {
  id: string;
  customerId: string;
  totalSales: number;
  totalPaid: number;
  outstandingBalance: number; // totalSales - totalPaid
  creditLimit?: number;
  creditTerms?: number;
}

// ============================================================================
// ACCOUNTING STRUCTURES (ENHANCED)
// ============================================================================

/**
 * Line item in a journal entry
 */
export interface JournalEntryLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

/**
 * Complete journal entry with all lines
 * Must always balance: totalDebit === totalCredit
 */
export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string; // Invoice number or payment reference
  referenceType?: 'sale' | 'payment' | 'adjustment'; // Type of transaction
  relatedDocumentId?: string; // Links to sale_id or payment_id
  entries: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted';
}

/**
 * Chart of Accounts structure
 */
export interface ChartOfAccount {
  id: string;
  code: string; // e.g., "1010"
  name: string; // e.g., "Cash Account"
  type: AccountType;
  parentId?: string;
  balance: number; // Updated as entries are posted
  isActive: boolean;
  level: number; // 1: Parent, 2: Child, 3: Sub-child
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cogs';

// ============================================================================
// EXAMPLE CHART OF ACCOUNTS STRUCTURE
// ============================================================================

/*
  1000-1999: ASSETS
    1000-1099: Cash & Bank Accounts
      1010: Cash Account (Asset)
      1020: POS Account (Asset)
      1030: Bank Account (Asset)
    1100-1199: Receivables
      1110: Accounts Receivable - Customer Due (Asset)
  
  2000-2999: LIABILITIES
    2100-2199: Payables
      2110: Accounts Payable - Supplier Due (Liability)
  
  3000-3999: EQUITY
    3000: Owner's Capital (Equity)
  
  4000-4999: REVENUE
    4000-4099: Sales
      4010: Sales Account (Revenue)
      4020: Sales Returns (Revenue, negative)
  
  5000-5999: COST OF GOODS SOLD
    5000: COGS
  
  6000-6999: EXPENSES
    6000: Operating Expenses
    6110: Production Waste / Scrap
*/

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface SalesWithPaymentSummary {
  sale: Sale;
  payments: SalePayment[];
  remainingDue: number;
  paymentPercentage: number; // (totalPaid / total) * 100
}

export interface AccountReceivableReport {
  customerId: string;
  customerName: string;
  totalDue: number;
  daysOverdue: number;
  agingBucket: 'current' | '31-60' | '61-90' | 'over90';
  invoices: Array<{
    invoiceNumber: string;
    date: string;
    amount: number;
    paid: number;
    due: number;
  }>;
}

// ============================================================================
// VALIDATION & CALCULATION HELPERS
// ============================================================================

/**
 * Calculate VAT amount (5%)
 */
export function calculateVAT(subtotal: number): number {
  return subtotal * 0.05;
}

/**
 * Calculate total sale amount
 */
export function calculateSaleTotal(subtotal: number): number {
  return subtotal + calculateVAT(subtotal);
}

/**
 * Validate if journal entry is balanced
 */
export function isJournalEntryBalanced(entry: JournalEntry): boolean {
  return entry.totalDebit === entry.totalCredit && entry.totalDebit > 0;
}

/**
 * Validate payment allocation sums
 */
export function validatePaymentAllocations(
  allocations: SalePaymentAllocation[],
  saleTotal: number,
  isPartialPaymentAllowed: boolean = true
): { valid: boolean; error?: string } {
  
  const sum = allocations.reduce((acc, alloc) => acc + alloc.amount, 0);
  
  if (isPartialPaymentAllowed) {
    if (sum > saleTotal) {
      return { valid: false, error: 'Payment allocations exceed sale total' };
    }
    if (sum < 0) {
      return { valid: false, error: 'Payment amounts must be positive' };
    }
  } else {
    if (sum !== saleTotal) {
      return { valid: false, error: 'Payment allocations must equal sale total' };
    }
  }
  
  return { valid: true };
}

/**
 * Backend Accounting Logic for Partial Sales with Double-Entry Accounting
 * 
 * This module handles:
 * 1. Sale creation with partial payments
 * 2. Journal entry generation
 * 3. Payment receipt processing
 * 4. Customer balance tracking
 * 5. Accounting validations
 */

import type {
  Sale,
  SaleItem,
  SalePayment,
  SalePaymentAllocation,
  JournalEntry,
  JournalEntryLine,
  Customer,
  PaymentMethod,
  PaymentStatus,
  CustomerBalance,
  ChartOfAccount,
} from './types-enhanced';

// ============================================================================
// CHART OF ACCOUNTS MAPPING
// ============================================================================

/**
 * Standard Chart of Accounts for sales operations
 */
export const CHART_OF_ACCOUNTS = {
  // Assets
  CASH_ACCOUNT: 'COA-1010',
  POS_ACCOUNT: 'COA-1020',
  BANK_ACCOUNT: 'COA-1030',
  ACCOUNTS_RECEIVABLE: 'COA-1110',
  
  // Liabilities
  ACCOUNTS_PAYABLE: 'COA-2110',
  
  // Equity
  OWNERS_CAPITAL: 'COA-3000',
  
  // Revenue
  SALES_ACCOUNT: 'COA-4010',
  SALES_RETURNS: 'COA-4020',
  
  // COGS & Expenses
  COGS: 'COA-5000',
  PRODUCTION_WASTE: 'COA-6110',
};

export const ACCOUNT_NAMES: Record<string, string> = {
  [CHART_OF_ACCOUNTS.CASH_ACCOUNT]: 'Cash Account',
  [CHART_OF_ACCOUNTS.POS_ACCOUNT]: 'POS Account',
  [CHART_OF_ACCOUNTS.BANK_ACCOUNT]: 'Bank Account',
  [CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE]: 'Accounts Receivable (Customer Due)',
  [CHART_OF_ACCOUNTS.SALES_ACCOUNT]: 'Sales Account',
  [CHART_OF_ACCOUNTS.SALES_RETURNS]: 'Sales Returns',
  [CHART_OF_ACCOUNTS.COGS]: 'Cost of Goods Sold',
  [CHART_OF_ACCOUNTS.PRODUCTION_WASTE]: 'Production Waste / Scrap',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get account name from COA mapping
 */
export function getAccountName(accountId: string): string {
  return ACCOUNT_NAMES[accountId] || 'Unknown Account';
}

/**
 * Map payment method to Chart of Accounts
 */
export function getAccountIdForPaymentMethod(method: PaymentMethod): string {
  const mapping: Record<PaymentMethod, string> = {
    'cash': CHART_OF_ACCOUNTS.CASH_ACCOUNT,
    'bank': CHART_OF_ACCOUNTS.BANK_ACCOUNT,
    'pos': CHART_OF_ACCOUNTS.POS_ACCOUNT,
    'check': CHART_OF_ACCOUNTS.BANK_ACCOUNT, // Checks go to bank
    'credit': CHART_OF_ACCOUNTS.CASH_ACCOUNT, // Treat as cash initially
    'other': CHART_OF_ACCOUNTS.CASH_ACCOUNT,
  };
  return mapping[method];
}

/**
 * Calculate VAT (5% in this case)
 */
export function calculateVAT(amount: number): number {
  return parseFloat((amount * 0.05).toFixed(2));
}

/**
 * Calculate sale total with VAT
 */
export function calculateSaleTotal(subtotal: number): number {
  return subtotal + calculateVAT(subtotal);
}

/**
 * Round to 2 decimal places
 */
export function round(value: number): number {
  return parseFloat(value.toFixed(2));
}

// ============================================================================
// SALE CREATION & JOURNAL ENTRIES
// ============================================================================

/**
 * Main function: Create a sale with partial payment support
 * 
 * Business Rules:
 * - Customer must exist
 * - At least one item required
 * - Payment allocations must sum to <= sale total
 * - Inventory must be decremented
 * - Journal entry must be created and posted
 */
export function createSaleWithPartialPayment(
  saleData: {
    customerId: string;
    customerName: string;
    items: SaleItem[];
    type: 'sale' | 'repair' | 'return';
    invoiceNumber: string;
    date: string;
  },
  paymentAllocations: SalePaymentAllocation[]
): { sale: Sale; journalEntry: JournalEntry } {
  
  // Validate inputs
  validateSaleData(saleData);
  
  // Calculate amounts
  const subtotal = calculateSubtotal(saleData.items);
  const vat = calculateVAT(subtotal);
  const total = calculateSaleTotal(subtotal);
  const totalPaid = paymentAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  const remainingDue = round(total - totalPaid);
  
  // Validate payment allocations
  validatePaymentAllocations(paymentAllocations, total);
  
  // Determine payment status
  const paymentStatus = determinePaymentStatus(totalPaid, total);
  
  // Create sale object
  const sale: Sale = {
    id: generateId('SALE'),
    invoiceNumber: saleData.invoiceNumber,
    customerId: saleData.customerId,
    customerName: saleData.customerName,
    type: saleData.type,
    items: saleData.items,
    subtotal: subtotal,
    vatAmount: vat,
    total: total,
    paymentStatus: paymentStatus,
    totalPaid: totalPaid,
    remainingDue: remainingDue,
    paymentAllocations: paymentAllocations,
    journalEntryId: '',
    linkedPaymentEntries: [],
    date: saleData.date,
  };
  
  // Create journal entry for the sale
  const journalEntry = createSaleJournalEntry(sale, paymentAllocations);
  sale.journalEntryId = journalEntry.id;
  
  return { sale, journalEntry };
}

/**
 * Validate sale creation data
 */
function validateSaleData(saleData: {
  customerId: string;
  customerName: string;
  items: SaleItem[];
  type: 'sale' | 'repair' | 'return';
  invoiceNumber: string;
  date: string;
}): void {
  if (!saleData.customerId || !saleData.customerName) {
    throw new Error('Customer information is required');
  }
  
  if (!saleData.items || saleData.items.length === 0) {
    throw new Error('At least one item is required');
  }
  
  for (const item of saleData.items) {
    if (item.quantity <= 0 || item.ratePerUnit <= 0) {
      throw new Error(`Invalid item: ${item.itemName}`);
    }
  }
  
  if (!saleData.invoiceNumber || !saleData.date) {
    throw new Error('Invoice number and date are required');
  }
}

/**
 * Calculate subtotal from items
 */
function calculateSubtotal(items: SaleItem[]): number {
  return round(items.reduce((sum, item) => sum + item.amount, 0));
}

/**
 * Validate payment allocations don't exceed sale total
 */
function validatePaymentAllocations(
  allocations: SalePaymentAllocation[],
  saleTotal: number
): void {
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  
  if (totalAllocated > saleTotal) {
    throw new Error(
      `Payment allocations (${totalAllocated}) exceed sale total (${saleTotal})`
    );
  }
  
  // Check each allocation has positive amount
  for (const alloc of allocations) {
    if (alloc.amount <= 0) {
      throw new Error(`Payment amounts must be positive`);
    }
    if (!alloc.accountId || !alloc.paymentMethod) {
      throw new Error(`Payment method and account are required for all allocations`);
    }
  }
}

/**
 * Determine payment status based on payment amount
 */
function determinePaymentStatus(
  totalPaid: number,
  saleTotal: number
): PaymentStatus {
  if (totalPaid === 0) {
    return 'pending';
  } else if (totalPaid >= saleTotal) {
    return 'paid';
  } else {
    return 'partial';
  }
}

/**
 * Create journal entry for a sale with partial payment
 * 
 * For sale of 1000 AED with 500 POS payment + 500 due:
 * 
 * Debit:  POS Account (1020)                 500
 * Debit:  Accounts Receivable (1110)         500
 * ────────────────────────────────────────────
 * Credit: Sales Account (4010)                           1000
 * ════════════════════════════════════════════════════════════
 * Total Debit: 1000  |  Total Credit: 1000  ✓ BALANCED
 */
export function createSaleJournalEntry(
  sale: Sale,
  paymentAllocations: SalePaymentAllocation[]
): JournalEntry {
  
  const entries: JournalEntryLine[] = [];
  let totalDebit = 0;
  
  // Line 1-N: For each payment allocation, create a debit entry
  for (const allocation of paymentAllocations) {
    entries.push({
      accountId: allocation.accountId,
      accountName: allocation.accountName,
      debit: allocation.amount,
      credit: 0,
    });
    totalDebit += allocation.amount;
  }
  
  // Line N+1: For unpaid portion, create Accounts Receivable entry
  if (sale.remainingDue > 0) {
    entries.push({
      accountId: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE,
      accountName: getAccountName(CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE),
      debit: sale.remainingDue,
      credit: 0,
    });
    totalDebit += sale.remainingDue;
  }
  
  // Final Line: Credit to Sales Account (or Sales Returns if return)
  const salesAccountId = sale.type === 'return' 
    ? CHART_OF_ACCOUNTS.SALES_RETURNS 
    : CHART_OF_ACCOUNTS.SALES_ACCOUNT;
  
  entries.push({
    accountId: salesAccountId,
    accountName: getAccountName(salesAccountId),
    debit: 0,
    credit: sale.total,
  });
  
  // Create journal entry
  const journalEntry: JournalEntry = {
    id: generateId('JE'),
    date: sale.date,
    description: `Sale ${sale.invoiceNumber} - ${sale.customerName} (${sale.type})`,
    reference: sale.invoiceNumber,
    referenceType: 'sale',
    relatedDocumentId: sale.id,
    entries: entries,
    totalDebit: round(totalDebit),
    totalCredit: sale.total,
    status: 'posted',
  };
  
  // Validate: Journal entry must be balanced
  if (!isJournalEntryBalanced(journalEntry)) {
    throw new Error(
      `Journal entry not balanced. Debit: ${journalEntry.totalDebit}, ` +
      `Credit: ${journalEntry.totalCredit}`
    );
  }
  
  return journalEntry;
}

/**
 * Validate if journal entry is balanced
 */
export function isJournalEntryBalanced(entry: JournalEntry): boolean {
  return entry.totalDebit === entry.totalCredit && entry.totalDebit > 0;
}

// ============================================================================
// PAYMENT RECEIPT PROCESSING
// ============================================================================

/**
 * Record a payment received from customer for a partially paid sale
 * 
 * For paying 500 AED in Cash on a sale with 500 AED remaining:
 * 
 * Debit:  Cash Account (1010)                500
 * ────────────────────────────────────────────
 * Credit: Accounts Receivable (1110)                      500
 * ════════════════════════════════════════════════════════════
 * Total Debit: 500  |  Total Credit: 500  ✓ BALANCED
 */
export function recordPaymentReceived(
  sale: Sale,
  paymentData: {
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
    notes?: string;
  }
): { payment: SalePayment; journalEntry: JournalEntry } {
  
  // Validate payment
  validatePaymentAmount(sale, paymentData.amount);
  
  // Get account for payment method
  const accountId = getAccountIdForPaymentMethod(paymentData.paymentMethod);
  
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
    notes: paymentData.notes,
    journalEntryId: '',
    accountId: accountId,
    accountName: getAccountName(accountId),
  };
  
  // Create journal entry for payment
  const journalEntry: JournalEntry = {
    id: generateId('JE'),
    date: paymentData.date,
    description: `Payment Received - ${sale.invoiceNumber} (${sale.customerName})`,
    reference: `${sale.invoiceNumber}-PAY`,
    referenceType: 'payment',
    relatedDocumentId: payment.id,
    entries: [
      {
        accountId: accountId,
        accountName: getAccountName(accountId),
        debit: paymentData.amount,
        credit: 0,
      },
      {
        accountId: CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE,
        accountName: getAccountName(CHART_OF_ACCOUNTS.ACCOUNTS_RECEIVABLE),
        debit: 0,
        credit: paymentData.amount,
      },
    ],
    totalDebit: paymentData.amount,
    totalCredit: paymentData.amount,
    status: 'posted',
  };
  
  // Validate entry is balanced
  if (!isJournalEntryBalanced(journalEntry)) {
    throw new Error('Payment journal entry is not balanced');
  }
  
  payment.journalEntryId = journalEntry.id;
  
  return { payment, journalEntry };
}

/**
 * Validate payment amount doesn't exceed remaining due
 */
function validatePaymentAmount(sale: Sale, paymentAmount: number): void {
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be positive');
  }
  
  if (paymentAmount > sale.remainingDue) {
    throw new Error(
      `Payment (${paymentAmount}) exceeds remaining due (${sale.remainingDue})`
    );
  }
}

/**
 * Update sale after payment received
 */
export function updateSaleAfterPayment(sale: Sale, payment: SalePayment): Sale {
  sale.totalPaid = round(sale.totalPaid + payment.amount);
  sale.remainingDue = round(sale.total - sale.totalPaid);
  sale.linkedPaymentEntries.push(payment.journalEntryId);
  
  // Update payment status
  if (sale.remainingDue === 0) {
    sale.paymentStatus = 'cleared';
  } else if (sale.remainingDue < sale.total && sale.totalPaid > 0) {
    sale.paymentStatus = 'partial';
  }
  
  return sale;
}

// ============================================================================
// CUSTOMER BALANCE TRACKING
// ============================================================================

/**
 * Calculate total outstanding balance for a customer
 * Sums all unpaid and partial sales
 */
export function calculateCustomerBalance(sales: Sale[]): {
  totalSales: number;
  totalPaid: number;
  outstandingBalance: number;
} {
  let totalSales = 0;
  let totalPaid = 0;
  let outstandingBalance = 0;
  
  for (const sale of sales) {
    // Only count sales, not returns (for now)
    if (sale.type === 'sale') {
      totalSales += sale.total;
      totalPaid += sale.totalPaid;
      outstandingBalance += sale.remainingDue;
    }
  }
  
  return {
    totalSales: round(totalSales),
    totalPaid: round(totalPaid),
    outstandingBalance: round(outstandingBalance),
  };
}

/**
 * Update customer record with latest balance
 */
export function updateCustomerBalance(
  customer: Customer,
  sales: Sale[]
): Customer {
  
  const balance = calculateCustomerBalance(sales);
  
  customer.totalSales = balance.totalSales;
  customer.outstandingBalance = balance.outstandingBalance;
  customer.totalPaid = balance.totalPaid;
  
  // Determine risk level based on payment history
  if (balance.outstandingBalance === 0) {
    customer.riskLevel = 'low';
  } else if (balance.outstandingBalance > 0 && balance.totalPaid === 0) {
    customer.riskLevel = 'high'; // New customer with no payments yet
  } else if (balance.outstandingBalance / balance.totalSales > 0.5) {
    customer.riskLevel = 'high'; // More than 50% unpaid
  } else if (balance.outstandingBalance / balance.totalSales > 0.25) {
    customer.riskLevel = 'medium';
  } else {
    customer.riskLevel = 'low';
  }
  
  return customer;
}

/**
 * Create or update customer balance tracking record
 */
export function createCustomerBalanceRecord(
  customerId: string,
  sales: Sale[]
): CustomerBalance {
  
  const balance = calculateCustomerBalance(sales);
  
  return {
    id: generateId('CB'),
    customerId: customerId,
    totalSales: balance.totalSales,
    totalPaid: balance.totalPaid,
    outstandingBalance: balance.outstandingBalance,
  };
}

// ============================================================================
// REPORTING & ANALYTICS
// ============================================================================

/**
 * Calculate accounts receivable aging
 * Groups invoices by days outstanding
 */
export function calculateARAging(sales: Sale[], asOfDate: Date = new Date()): {
  current: number;
  days31_60: number;
  days61_90: number;
  days91_plus: number;
  totalAR: number;
} {
  
  const current = [];
  const days31_60 = [];
  const days61_90 = [];
  const days91_plus = [];
  
  for (const sale of sales) {
    if (sale.paymentStatus === 'pending' || sale.paymentStatus === 'partial') {
      const saleDate = new Date(sale.date);
      const daysOutstanding = Math.floor(
        (asOfDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysOutstanding <= 30) {
        current.push(sale.remainingDue);
      } else if (daysOutstanding <= 60) {
        days31_60.push(sale.remainingDue);
      } else if (daysOutstanding <= 90) {
        days61_90.push(sale.remainingDue);
      } else {
        days91_plus.push(sale.remainingDue);
      }
    }
  }
  
  const sumCurrent = current.reduce((a, b) => a + b, 0);
  const sum31_60 = days31_60.reduce((a, b) => a + b, 0);
  const sum61_90 = days61_90.reduce((a, b) => a + b, 0);
  const sum91_plus = days91_plus.reduce((a, b) => a + b, 0);
  
  return {
    current: round(sumCurrent),
    days31_60: round(sum31_60),
    days61_90: round(sum61_90),
    days91_plus: round(sum91_plus),
    totalAR: round(sumCurrent + sum31_60 + sum61_90 + sum91_plus),
  };
}

/**
 * Get sales summary grouped by payment status
 */
export function getSalesSummaryByPaymentStatus(sales: Sale[]): Record<PaymentStatus, {
  count: number;
  totalAmount: number;
  averageAmount: number;
}> {
  
  const summary: Record<PaymentStatus, any> = {
    paid: { count: 0, totalAmount: 0, averageAmount: 0 },
    partial: { count: 0, totalAmount: 0, averageAmount: 0 },
    pending: { count: 0, totalAmount: 0, averageAmount: 0 },
    overdue: { count: 0, totalAmount: 0, averageAmount: 0 },
    cleared: { count: 0, totalAmount: 0, averageAmount: 0 },
  };
  
  for (const sale of sales) {
    const status = sale.paymentStatus;
    summary[status].count++;
    summary[status].totalAmount += sale.total;
  }
  
  // Calculate averages
  for (const status of Object.keys(summary)) {
    const key = status as PaymentStatus;
    if (summary[key].count > 0) {
      summary[key].averageAmount = round(
        summary[key].totalAmount / summary[key].count
      );
    }
  }
  
  return summary;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate payment allocation suggestions based on payment method availability
 */
export function generatePaymentAllocations(
  saleTotal: number,
  paymentBreakdown: Record<PaymentMethod, number>,
  chartOfAccounts: ChartOfAccount[]
): SalePaymentAllocation[] {
  
  const allocations: SalePaymentAllocation[] = [];
  
  for (const [method, amount] of Object.entries(paymentBreakdown)) {
    if (amount > 0) {
      const accountId = getAccountIdForPaymentMethod(method as PaymentMethod);
      allocations.push({
        paymentMethod: method as PaymentMethod,
        amount: amount,
        accountId: accountId,
        accountName: getAccountName(accountId),
        date: new Date().toISOString().split('T')[0],
      });
    }
  }
  
  return allocations;
}

/**
 * Check if customer exceeds credit limit
 */
export function checkCreditLimitExceeded(
  customer: Customer,
  newSaleAmount: number
): boolean {
  
  if (!customer.creditLimit) {
    return false; // No limit set
  }
  
  return (customer.outstandingBalance + newSaleAmount) > customer.creditLimit;
}

/**
 * Check if sale payment is overdue
 */
export function isSaleOverdue(
  sale: Sale,
  customer: Customer,
  asOfDate: Date = new Date()
): boolean {
  
  if (!customer.creditTerms || sale.paymentStatus === 'paid') {
    return false;
  }
  
  const saleDate = new Date(sale.date);
  const dueDate = new Date(saleDate);
  dueDate.setDate(dueDate.getDate() + customer.creditTerms);
  
  return asOfDate > dueDate;
}

/**
 * Generate invoice number with sequential format
 */
export function generateInvoiceNumber(sequence: number, prefix: string = 'INV'): string {
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
}

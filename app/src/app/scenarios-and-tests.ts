/**
 * Practical Examples & Test Cases
 * Complete walkthroughs of common scenarios
 */

import type {
  Sale,
  Customer,
  SalePaymentAllocation,
  PaymentMethod,
} from './types-enhanced';

import {
  createSaleWithPartialPayment,
  recordPaymentReceived,
  updateSaleAfterPayment,
  calculateCustomerBalance,
  isJournalEntryBalanced,
  CHART_OF_ACCOUNTS,
} from './accounting-logic';

// ============================================================================
// SCENARIO 1: Basic Partial Payment at Sale Time
// ============================================================================

/**
 * Scenario 1: Customer buys Oud for 1000 AED
 * Pays 500 via POS immediately
 * Remaining 500 due later
 */
export function scenario1_BasicPartialPayment() {
  console.log('=== SCENARIO 1: Basic Partial Payment ===\n');
  
  // Step 1: Define customer
  const customer: Customer = {
    id: 'CUST-001',
    name: 'Ahmad Al-Mansouri',
    contact: 'Ahmad',
    email: 'ahmad@example.com',
    phone: '+971-50-1234567',
    address: 'Dubai, UAE',
    outstandingBalance: 0,
    totalSales: 0,
    totalPaid: 0,
    totalRepairs: 0,
  };
  
  // Step 2: Define sale items
  const saleItems = [
    {
      itemId: 'ITEM-OUD-001',
      itemName: 'Oud Premium 30ml',
      quantity: 1,
      ratePerUnit: 1000,
      amount: 1000,
    }
  ];
  
  // Step 3: Define payment allocations (500 via POS, 500 due)
  const paymentAllocations: SalePaymentAllocation[] = [
    {
      paymentMethod: 'pos',
      amount: 500,
      accountId: CHART_OF_ACCOUNTS.POS_ACCOUNT,
      accountName: 'POS Account',
      date: '2026-01-20',
    }
  ];
  
  // Step 4: Create sale with partial payment
  const { sale, journalEntry } = createSaleWithPartialPayment(
    {
      customerId: customer.id,
      customerName: customer.name,
      items: saleItems,
      type: 'sale',
      invoiceNumber: 'INV-001',
      date: '2026-01-20',
    },
    paymentAllocations
  );
  
  // Step 5: Display results
  console.log('SALE CREATED:');
  console.log(`  Invoice: ${sale.invoiceNumber}`);
  console.log(`  Total: AED ${sale.total}`);
  console.log(`  Paid: AED ${sale.totalPaid}`);
  console.log(`  Due: AED ${sale.remainingDue}`);
  console.log(`  Status: ${sale.paymentStatus}\n`);
  
  console.log('JOURNAL ENTRY:');
  console.log(`  Reference: ${journalEntry.reference}`);
  console.log(`  Total Debit: AED ${journalEntry.totalDebit}`);
  console.log(`  Total Credit: AED ${journalEntry.totalCredit}`);
  console.log(`  Balanced: ${isJournalEntryBalanced(journalEntry) ? '✓' : '✗'}\n`);
  
  console.log('JOURNAL LINES:');
  for (const line of journalEntry.entries) {
    if (line.debit > 0) {
      console.log(`  Dr | ${line.accountName.padEnd(30)} | AED ${line.debit.toFixed(2)}`);
    } else {
      console.log(`  Cr | ${line.accountName.padEnd(30)} | AED ${line.credit.toFixed(2)}`);
    }
  }
  console.log();
  
  return { sale, journalEntry, customer };
}

// ============================================================================
// SCENARIO 2: Payment Received Later
// ============================================================================

/**
 * Scenario 2: Customer pays the remaining 500 AED one month later via bank transfer
 */
export function scenario2_PaymentReceivedLater() {
  console.log('=== SCENARIO 2: Payment Received Later ===\n');
  
  // Get sale from scenario 1
  const { sale: originalSale } = scenario1_BasicPartialPayment();
  const sale = JSON.parse(JSON.stringify(originalSale)); // Clone
  
  console.log('\n--- RECORDING PAYMENT ---\n');
  
  // Step 1: Record payment
  const { payment, journalEntry } = recordPaymentReceived(sale, {
    amount: 500,
    paymentMethod: 'bank',
    date: '2026-02-15',
    notes: 'Bank transfer received',
  });
  
  // Step 2: Update sale with payment info
  const updatedSale = updateSaleAfterPayment(sale, payment);
  
  console.log('PAYMENT RECORDED:');
  console.log(`  Payment ID: ${payment.id}`);
  console.log(`  Amount: AED ${payment.amount}`);
  console.log(`  Method: ${payment.paymentMethod}`);
  console.log(`  Date: ${payment.date}\n`);
  
  console.log('UPDATED SALE STATUS:');
  console.log(`  Total Paid: AED ${updatedSale.totalPaid}`);
  console.log(`  Remaining Due: AED ${updatedSale.remainingDue}`);
  console.log(`  Payment Status: ${updatedSale.paymentStatus}\n`);
  
  console.log('PAYMENT JOURNAL ENTRY:');
  console.log(`  Reference: ${journalEntry.reference}`);
  for (const line of journalEntry.entries) {
    if (line.debit > 0) {
      console.log(`  Dr | ${line.accountName.padEnd(30)} | AED ${line.debit.toFixed(2)}`);
    } else {
      console.log(`  Cr | ${line.accountName.padEnd(30)} | AED ${line.credit.toFixed(2)}`);
    }
  }
  console.log(`  Balanced: ${isJournalEntryBalanced(journalEntry) ? '✓' : '✗'}\n`);
  
  return { payment, journalEntry, updatedSale };
}

// ============================================================================
// SCENARIO 3: Multiple Payment Methods
// ============================================================================

/**
 * Scenario 3: Customer buys 3 items for 3000 AED
 * Pays with multiple methods: 1000 POS + 1000 Cash + 1000 Bank
 */
export function scenario3_MultiplePaymentMethods() {
  console.log('=== SCENARIO 3: Multiple Payment Methods (Full Payment) ===\n');
  
  const saleItems = [
    {
      itemId: 'ITEM-1',
      itemName: 'Product A',
      quantity: 1,
      ratePerUnit: 1000,
      amount: 1000,
    },
    {
      itemId: 'ITEM-2',
      itemName: 'Product B',
      quantity: 1,
      ratePerUnit: 1000,
      amount: 1000,
    },
    {
      itemId: 'ITEM-3',
      itemName: 'Product C',
      quantity: 1,
      ratePerUnit: 1000,
      amount: 1000,
    }
  ];
  
  const paymentAllocations: SalePaymentAllocation[] = [
    {
      paymentMethod: 'pos',
      amount: 1000,
      accountId: CHART_OF_ACCOUNTS.POS_ACCOUNT,
      accountName: 'POS Account',
      date: '2026-01-21',
    },
    {
      paymentMethod: 'cash',
      amount: 1000,
      accountId: CHART_OF_ACCOUNTS.CASH_ACCOUNT,
      accountName: 'Cash Account',
      date: '2026-01-21',
    },
    {
      paymentMethod: 'bank',
      amount: 1000,
      accountId: CHART_OF_ACCOUNTS.BANK_ACCOUNT,
      accountName: 'Bank Account',
      date: '2026-01-21',
    }
  ];
  
  const { sale, journalEntry } = createSaleWithPartialPayment(
    {
      customerId: 'CUST-002',
      customerName: 'Fatima Al-Zahra',
      items: saleItems,
      type: 'sale',
      invoiceNumber: 'INV-002',
      date: '2026-01-21',
    },
    paymentAllocations
  );
  
  console.log('SALE SUMMARY:');
  console.log(`  Invoice: ${sale.invoiceNumber}`);
  console.log(`  Total: AED ${sale.total}`);
  console.log(`  Total Paid: AED ${sale.totalPaid}`);
  console.log(`  Remaining Due: AED ${sale.remainingDue}`);
  console.log(`  Status: ${sale.paymentStatus}\n`);
  
  console.log('PAYMENT BREAKDOWN:');
  for (const alloc of paymentAllocations) {
    console.log(`  - ${alloc.paymentMethod.toUpperCase()}: AED ${alloc.amount} (${alloc.accountName})`);
  }
  console.log();
  
  console.log('JOURNAL ENTRY (3 debits + 1 credit):');
  for (const line of journalEntry.entries) {
    if (line.debit > 0) {
      console.log(`  Dr | ${line.accountName.padEnd(30)} | AED ${line.debit.toFixed(2)}`);
    } else {
      console.log(`  Cr | ${line.accountName.padEnd(30)} | AED ${line.credit.toFixed(2)}`);
    }
  }
  console.log(`  Total Lines: ${journalEntry.entries.length}`);
  console.log(`  Balanced: ${isJournalEntryBalanced(journalEntry) ? '✓' : '✗'}\n`);
  
  return { sale, journalEntry };
}

// ============================================================================
// SCENARIO 4: Mixed Partial & Full Payments
// ============================================================================

/**
 * Scenario 4: Customer buys 2000 AED worth
 * Pays 800 immediately (POS 500 + Cash 300)
 * Remaining 1200 due
 */
export function scenario4_MixedPaymentMethods() {
  console.log('=== SCENARIO 4: Mixed Payment Methods (Partial) ===\n');
  
  const saleItems = [
    {
      itemId: 'ITEM-OIL-001',
      itemName: 'Perfume Oil - Premium',
      quantity: 2,
      ratePerUnit: 1000,
      amount: 2000,
    }
  ];
  
  const paymentAllocations: SalePaymentAllocation[] = [
    {
      paymentMethod: 'pos',
      amount: 500,
      accountId: CHART_OF_ACCOUNTS.POS_ACCOUNT,
      accountName: 'POS Account',
      date: '2026-01-22',
    },
    {
      paymentMethod: 'cash',
      amount: 300,
      accountId: CHART_OF_ACCOUNTS.CASH_ACCOUNT,
      accountName: 'Cash Account',
      date: '2026-01-22',
    }
  ];
  
  const { sale, journalEntry } = createSaleWithPartialPayment(
    {
      customerId: 'CUST-003',
      customerName: 'Mohammed bin Rashid',
      items: saleItems,
      type: 'sale',
      invoiceNumber: 'INV-003',
      date: '2026-01-22',
    },
    paymentAllocations
  );
  
  console.log('SALE ANALYSIS:');
  console.log(`  Invoice: ${sale.invoiceNumber}`);
  console.log(`  Total Sale: AED ${sale.total}`);
  console.log(`  Amount Paid: AED ${sale.totalPaid} (${(sale.totalPaid / sale.total * 100).toFixed(1)}%)`);
  console.log(`  Amount Due: AED ${sale.remainingDue} (${(sale.remainingDue / sale.total * 100).toFixed(1)}%)`);
  console.log(`  Status: ${sale.paymentStatus.toUpperCase()}\n`);
  
  console.log('JOURNAL ENTRY BREAKDOWN:');
  let debitCount = 0;
  for (const line of journalEntry.entries) {
    if (line.debit > 0) {
      console.log(`  [Debit ${++debitCount}] ${line.accountName.padEnd(30)} AED ${line.debit.toFixed(2)}`);
    }
  }
  for (const line of journalEntry.entries) {
    if (line.credit > 0) {
      console.log(`  [Credit] ${line.accountName.padEnd(30)} AED ${line.credit.toFixed(2)}`);
    }
  }
  console.log();
  
  return { sale, journalEntry };
}

// ============================================================================
// SCENARIO 5: Customer Balance Tracking
// ============================================================================

/**
 * Scenario 5: Track customer balance across multiple sales
 */
export function scenario5_CustomerBalanceTracking() {
  console.log('=== SCENARIO 5: Customer Balance Tracking ===\n');
  
  // Create multiple sales for same customer
  const sales: Sale[] = [];
  
  // Sale 1: 1000 AED, 500 paid
  const { sale: sale1 } = createSaleWithPartialPayment(
    {
      customerId: 'CUST-004',
      customerName: 'Zainab Ahmed',
      items: [{ itemId: '1', itemName: 'Product', quantity: 1, ratePerUnit: 1000, amount: 1000 }],
      type: 'sale',
      invoiceNumber: 'INV-004',
      date: '2026-01-20',
    },
    [{ paymentMethod: 'pos', amount: 500, accountId: CHART_OF_ACCOUNTS.POS_ACCOUNT, accountName: 'POS', date: '2026-01-20' }]
  );
  sales.push(sale1);
  
  // Sale 2: 2000 AED, 1500 paid
  const { sale: sale2 } = createSaleWithPartialPayment(
    {
      customerId: 'CUST-004',
      customerName: 'Zainab Ahmed',
      items: [{ itemId: '2', itemName: 'Product', quantity: 1, ratePerUnit: 2000, amount: 2000 }],
      type: 'sale',
      invoiceNumber: 'INV-005',
      date: '2026-01-22',
    },
    [{ paymentMethod: 'bank', amount: 1500, accountId: CHART_OF_ACCOUNTS.BANK_ACCOUNT, accountName: 'Bank', date: '2026-01-22' }]
  );
  sales.push(sale2);
  
  // Calculate customer balance
  const balance = calculateCustomerBalance(sales);
  
  console.log('CUSTOMER: Zainab Ahmed (CUST-004)\n');
  
  console.log('INDIVIDUAL SALES:');
  for (const sale of sales) {
    console.log(`  ${sale.invoiceNumber}: ${sale.type.padEnd(7)} | Total: AED ${sale.total.toLocaleString()} | Paid: AED ${sale.totalPaid.toLocaleString()} | Due: AED ${sale.remainingDue.toLocaleString()}`);
  }
  console.log();
  
  console.log('CUSTOMER BALANCE SUMMARY:');
  console.log(`  Total Sales Value: AED ${balance.totalSales.toLocaleString()}`);
  console.log(`  Total Payments Received: AED ${balance.totalPaid.toLocaleString()}`);
  console.log(`  Outstanding Balance: AED ${balance.outstandingBalance.toLocaleString()}`);
  console.log(`  Collection Rate: ${((balance.totalPaid / balance.totalSales) * 100).toFixed(1)}%\n`);
  
  return { sales, balance };
}

// ============================================================================
// SCENARIO 6: Accounting Validation
// ============================================================================

/**
 * Scenario 6: Demonstrate accounting validation rules
 */
export function scenario6_AccountingValidation() {
  console.log('=== SCENARIO 6: Accounting Validation Rules ===\n');
  
  const { sale, journalEntry } = scenario1_BasicPartialPayment();
  
  console.log('\nVALIDATION CHECKS:\n');
  
  // Check 1: Journal entry balance
  console.log(`1. Journal Entry Balanced (Debit = Credit):`);
  console.log(`   Debit: AED ${journalEntry.totalDebit}`);
  console.log(`   Credit: AED ${journalEntry.totalCredit}`);
  console.log(`   Result: ${isJournalEntryBalanced(journalEntry) ? '✓ PASS' : '✗ FAIL'}\n`);
  
  // Check 2: Accounting equation
  console.log(`2. Fundamental Accounting Equation: Assets = Liabilities + Equity`);
  const totalDebits = journalEntry.totalDebit;
  const totalCredits = journalEntry.totalCredit;
  console.log(`   Total Debits (Assets): AED ${totalDebits}`);
  console.log(`   Total Credits (Equity): AED ${totalCredits}`);
  console.log(`   Result: ${totalDebits === totalCredits ? '✓ PASS' : '✗ FAIL'}\n`);
  
  // Check 3: Payment allocation matches
  console.log(`3. Payment Allocations Matched:`);
  const allocatedTotal = sale.paymentAllocations.reduce((sum, a) => sum + a.amount, 0);
  console.log(`   Sum of allocations: AED ${allocatedTotal}`);
  console.log(`   Sale.totalPaid: AED ${sale.totalPaid}`);
  console.log(`   Result: ${allocatedTotal === sale.totalPaid ? '✓ PASS' : '✗ FAIL'}\n`);
  
  // Check 4: Remaining due calculation
  console.log(`4. Remaining Due Calculation:`);
  console.log(`   Sale Total: AED ${sale.total}`);
  console.log(`   Total Paid: AED ${sale.totalPaid}`);
  console.log(`   Remaining Due: AED ${sale.remainingDue}`);
  console.log(`   Expected: AED ${sale.total - sale.totalPaid}`);
  console.log(`   Result: ${sale.remainingDue === (sale.total - sale.totalPaid) ? '✓ PASS' : '✗ FAIL'}\n`);
  
  // Check 5: Journal entries count
  console.log(`5. Journal Entry Lines:`);
  console.log(`   Number of lines: ${journalEntry.entries.length}`);
  console.log(`   Expected minimum: 3 (at least 1 debit + 1 AR + 1 credit)`);
  console.log(`   Result: ${journalEntry.entries.length >= 3 ? '✓ PASS' : '✗ FAIL'}\n`);
}

// ============================================================================
// EDGE CASES & ERROR SCENARIOS
// ============================================================================

/**
 * Test error handling
 */
export function testErrorScenarios() {
  console.log('=== ERROR SCENARIOS ===\n');
  
  // Error 1: Payment exceeds due amount
  console.log('1. Payment Exceeds Due Amount:');
  try {
    const { sale } = scenario1_BasicPartialPayment();
    recordPaymentReceived(sale, {
      amount: 600, // Exceeds 500 due
      paymentMethod: 'cash',
      date: '2026-02-15',
    });
  } catch (error: any) {
    console.log(`   ✓ Caught: "${error.message}"\n`);
  }
  
  // Error 2: Allocation sum exceeds total
  console.log('2. Allocation Sum Exceeds Sale Total:');
  try {
    createSaleWithPartialPayment(
      {
        customerId: 'CUST-005',
        customerName: 'Test',
        items: [{ itemId: '1', itemName: 'Product', quantity: 1, ratePerUnit: 1000, amount: 1000 }],
        type: 'sale',
        invoiceNumber: 'INV-ERR-1',
        date: '2026-01-23',
      },
      [
        { paymentMethod: 'pos', amount: 600, accountId: CHART_OF_ACCOUNTS.POS_ACCOUNT, accountName: 'POS', date: '2026-01-23' },
        { paymentMethod: 'cash', amount: 600, accountId: CHART_OF_ACCOUNTS.CASH_ACCOUNT, accountName: 'Cash', date: '2026-01-23' },
      ]
    );
  } catch (error: any) {
    console.log(`   ✓ Caught: "${error.message}"\n`);
  }
  
  // Error 3: No items
  console.log('3. Sale With No Items:');
  try {
    createSaleWithPartialPayment(
      {
        customerId: 'CUST-005',
        customerName: 'Test',
        items: [],
        type: 'sale',
        invoiceNumber: 'INV-ERR-2',
        date: '2026-01-23',
      },
      []
    );
  } catch (error: any) {
    console.log(`   ✓ Caught: "${error.message}"\n`);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

export function runAllScenarios() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  PARTIAL SALES WITH DOUBLE-ENTRY ACCOUNTING - EXAMPLES ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    scenario1_BasicPartialPayment();
    scenario2_PaymentReceivedLater();
    scenario3_MultiplePaymentMethods();
    scenario4_MixedPaymentMethods();
    scenario5_CustomerBalanceTracking();
    scenario6_AccountingValidation();
    testErrorScenarios();
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✓ ALL SCENARIOS COMPLETED SUCCESSFULLY                ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('✗ Error during scenario execution:', error);
  }
}

// Run if this is the main module
if (typeof window === 'undefined') {
  // NodeJS environment
  // runAllScenarios();
}

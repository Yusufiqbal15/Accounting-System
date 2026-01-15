import type { 
  InventoryItem, 
  Supplier, 
  Customer, 
  Purchase, 
  BOM, 
  WorkOrder, 
  Sale, 
  RepairService,
  VATRecord,
  DashboardStats,
  ChartOfAccount,
  JournalEntry,
  ProductionOrder,
  ProductionWastage
} from './types';

// Helper function to calculate volume
export const calculateVolume = (length: number, width: number, height: number, quantity: number = 1): number => {
  return (length * width * height * quantity) / 1000000;
};

// Mock Inventory Data
export const mockInventory: InventoryItem[] = [
  {
    id: 'INV001',
    name: 'Teak Wood Plank',
    category: 'raw_materials',
    type: 'wood',
    length: 300,
    width: 20,
    height: 5,
    quantity: 50,
    volume: calculateVolume(300, 20, 5, 50),
    costPerUnit: 450,
    stockStatus: 'in_stock'
  },
  {
    id: 'INV002',
    name: 'Marine Plywood 18mm',
    category: 'raw_materials',
    type: 'ply',
    length: 240,
    width: 120,
    height: 1.8,
    quantity: 30,
    volume: calculateVolume(240, 120, 1.8, 30),
    costPerUnit: 280,
    stockStatus: 'in_stock'
  },
  {
    id: 'INV003',
    name: 'Oak Wood Sheet',
    category: 'raw_materials',
    type: 'wood',
    length: 250,
    width: 25,
    height: 3,
    quantity: 15,
    volume: calculateVolume(250, 25, 3, 15),
    costPerUnit: 380,
    stockStatus: 'low_stock'
  },
  {
    id: 'INV004',
    name: 'Custom Dining Table',
    category: 'finished_goods',
    type: 'finished',
    length: 200,
    width: 100,
    height: 75,
    quantity: 5,
    volume: calculateVolume(200, 100, 75, 5),
    costPerUnit: 2500,
    stockStatus: 'in_stock'
  },
  {
    id: 'INV005',
    name: 'Wood Screws Set',
    category: 'raw_materials',
    type: 'spare_part',
    length: 5,
    width: 1,
    height: 1,
    quantity: 200,
    volume: calculateVolume(5, 1, 1, 200),
    costPerUnit: 15,
    stockStatus: 'in_stock'
  },
  {
    id: 'INV006',
    name: 'Office Desk - Premium',
    category: 'trading_items',
    type: 'finished',
    length: 150,
    width: 75,
    height: 73,
    quantity: 8,
    volume: calculateVolume(150, 75, 73, 8),
    costPerUnit: 1800,
    stockStatus: 'in_stock'
  }
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'SUP001',
    name: 'Dubai Wood Traders',
    contact: 'Ahmed Al Mansouri',
    email: 'ahmed@dubaiwoodtraders.ae',
    phone: '+971 4 123 4567',
    address: 'Industrial Area, Dubai, UAE',
    outstandingPayable: 25000,
    totalPurchases: 450000
  },
  {
    id: 'SUP002',
    name: 'Emirates Plywood Co.',
    contact: 'Sarah Johnson',
    email: 'sarah@emiratesply.ae',
    phone: '+971 2 987 6543',
    address: 'Abu Dhabi Industrial Zone, UAE',
    outstandingPayable: 0,
    totalPurchases: 320000
  },
  {
    id: 'SUP003',
    name: 'Global Timber Imports',
    contact: 'Mohammed Hassan',
    email: 'mohammed@globaltimber.ae',
    phone: '+971 6 555 1234',
    address: 'Sharjah Free Zone, UAE',
    outstandingPayable: 15000,
    totalPurchases: 280000
  }
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'CUST001',
    name: 'Al Noor Construction',
    contact: 'Khalid Al Noor',
    email: 'khalid@alnoor.ae',
    phone: '+971 4 234 5678',
    address: 'Business Bay, Dubai, UAE',
    outstandingBalance: 18000,
    totalSales: 250000,
    totalRepairs: 2
  },
  {
    id: 'CUST002',
    name: 'Premium Interiors LLC',
    contact: 'Lisa Wang',
    email: 'lisa@premiuminteriors.ae',
    phone: '+971 4 876 5432',
    address: 'Dubai Marina, UAE',
    outstandingBalance: 0,
    totalSales: 180000,
    totalRepairs: 5
  },
  {
    id: 'CUST003',
    name: 'Green Valley Hotels',
    contact: 'Rajesh Kumar',
    email: 'rajesh@greenvalley.ae',
    phone: '+971 2 345 6789',
    address: 'Abu Dhabi, UAE',
    outstandingBalance: 42000,
    totalSales: 520000,
    totalRepairs: 8
  }
];

// Mock Purchases
export const mockPurchases: Purchase[] = [
  {
    id: 'PUR001',
    supplierId: 'SUP001',
    supplierName: 'Dubai Wood Traders',
    itemId: 'INV001',
    itemName: 'Teak Wood Plank',
    quantity: 50,
    dimensions: { length: 300, width: 20, height: 5 },
    volume: calculateVolume(300, 20, 5, 50),
    basePurchasePrice: 20000,
    shippingCost: 1500,
    customsClearance: 800,
    otherCharges: 200,
    landedCost: 22500,
    vatAmount: 1125,
    totalCost: 23625,
    paymentStatus: 'paid',
    date: '2026-01-05'
  },
  {
    id: 'PUR002',
    supplierId: 'SUP002',
    supplierName: 'Emirates Plywood Co.',
    itemId: 'INV002',
    itemName: 'Marine Plywood 18mm',
    quantity: 30,
    dimensions: { length: 240, width: 120, height: 1.8 },
    volume: calculateVolume(240, 120, 1.8, 30),
    basePurchasePrice: 8000,
    shippingCost: 400,
    customsClearance: 0,
    otherCharges: 100,
    landedCost: 8500,
    vatAmount: 425,
    totalCost: 8925,
    paymentStatus: 'pending',
    date: '2026-01-08'
  }
];

// Mock BOMs
export const mockBOMs: BOM[] = [
  {
    id: 'BOM001',
    productName: 'Custom Dining Table',
    rawMaterials: [
      {
        itemId: 'INV001',
        itemName: 'Teak Wood Plank',
        quantity: 8,
        volume: calculateVolume(300, 20, 5, 8),
        cost: 3600
      },
      {
        itemId: 'INV005',
        itemName: 'Wood Screws Set',
        quantity: 2,
        volume: calculateVolume(5, 1, 1, 2),
        cost: 30
      }
    ],
    laborCost: 800,
    overheadCost: 200,
    totalProductionCost: 4630,
    costPerUnit: 4630
  },
  {
    id: 'BOM002',
    productName: 'Bookshelf Unit',
    rawMaterials: [
      {
        itemId: 'INV002',
        itemName: 'Marine Plywood 18mm',
        quantity: 4,
        volume: calculateVolume(240, 120, 1.8, 4),
        cost: 1120
      },
      {
        itemId: 'INV005',
        itemName: 'Wood Screws Set',
        quantity: 1,
        volume: calculateVolume(5, 1, 1, 1),
        cost: 15
      }
    ],
    laborCost: 400,
    overheadCost: 100,
    totalProductionCost: 1635,
    costPerUnit: 1635
  }
];

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO001',
    productName: 'Custom Dining Table',
    bomId: 'BOM001',
    quantity: 3,
    assignedTechnician: 'Ali Rahman',
    startDate: '2026-01-06',
    dueDate: '2026-01-13',
    status: 'wip',
    progress: 60
  },
  {
    id: 'WO002',
    productName: 'Bookshelf Unit',
    bomId: 'BOM002',
    quantity: 5,
    assignedTechnician: 'John Smith',
    startDate: '2026-01-08',
    dueDate: '2026-01-15',
    status: 'pending',
    progress: 0
  },
  {
    id: 'WO003',
    productName: 'Custom Dining Table',
    bomId: 'BOM001',
    quantity: 2,
    assignedTechnician: 'Ali Rahman',
    startDate: '2025-12-28',
    dueDate: '2026-01-05',
    status: 'completed',
    progress: 100
  }
];

// Mock Sales
export const mockSales: Sale[] = [
  {
    id: 'SAL001',
    invoiceNumber: 'INV-2026-001',
    customerId: 'CUST001',
    customerName: 'Al Noor Construction',
    type: 'sale',
    items: [
      {
        itemId: 'INV004',
        itemName: 'Custom Dining Table',
        quantity: 2,
        dimensions: { length: 200, width: 100, height: 75 },
        volume: calculateVolume(200, 100, 75, 2),
        ratePerUnit: 5000,
        amount: 10000
      }
    ],
    subtotal: 10000,
    vatAmount: 500,
    total: 10500,
    paymentStatus: 'paid',
    date: '2026-01-07'
  },
  {
    id: 'SAL002',
    invoiceNumber: 'INV-2026-002',
    customerId: 'CUST002',
    customerName: 'Premium Interiors LLC',
    type: 'sale',
    items: [
      {
        itemId: 'INV006',
        itemName: 'Office Desk - Premium',
        quantity: 5,
        dimensions: { length: 150, width: 75, height: 73 },
        volume: calculateVolume(150, 75, 73, 5),
        ratePerUnit: 2800,
        amount: 14000
      }
    ],
    subtotal: 14000,
    vatAmount: 700,
    total: 14700,
    paymentStatus: 'partial',
    date: '2026-01-08'
  }
];

// Mock Repair Services
export const mockRepairs: RepairService[] = [
  {
    id: 'REP001',
    invoiceNumber: 'REP-2026-001',
    customerId: 'CUST003',
    customerName: 'Green Valley Hotels',
    instrument: 'Conference Table',
    issueDescription: 'Surface damage and loose joints',
    spareParts: [
      {
        itemId: 'INV005',
        itemName: 'Wood Screws Set',
        quantity: 2,
        cost: 30
      }
    ],
    laborCharges: 500,
    technicianAssigned: 'John Smith',
    subtotal: 530,
    vatAmount: 26.5,
    total: 556.5,
    paymentStatus: 'paid',
    date: '2026-01-06'
  }
];

// Mock VAT Records
export const mockVATRecords: VATRecord[] = [
  {
    period: 'December 2025',
    salesVAT: 12500,
    purchaseVAT: 8500,
    netVAT: 4000,
    status: 'filed'
  },
  {
    period: 'January 2026',
    salesVAT: 1226.5,
    purchaseVAT: 1550,
    netVAT: -323.5,
    status: 'pending'
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalStock: 6.57, // m³
  totalPurchases: 32550,
  totalSales: 25200,
  netProfit: 8420,
  workOrdersInProgress: 2,
  outstandingCustomerPayments: 60000,
  outstandingSupplierPayments: 40000
};

// Mock chart data
export const mockMonthlySalesData = [
  { month: 'Jul', sales: 42000, purchases: 35000 },
  { month: 'Aug', sales: 38000, purchases: 32000 },
  { month: 'Sep', sales: 45000, purchases: 38000 },
  { month: 'Oct', sales: 52000, purchases: 42000 },
  { month: 'Nov', sales: 48000, purchases: 40000 },
  { month: 'Dec', sales: 55000, purchases: 45000 },
  { month: 'Jan', sales: 25200, purchases: 32550 }
];

export const mockProfitTrendData = [
  { month: 'Jul', profit: 7000 },
  { month: 'Aug', profit: 6000 },
  { month: 'Sep', profit: 7000 },
  { month: 'Oct', profit: 10000 },
  { month: 'Nov', profit: 8000 },
  { month: 'Dec', profit: 10000 },
  { month: 'Jan', profit: 8420 }
];

export const mockStockConsumptionData = [
  { category: 'Raw Materials', volume: 4.2 },
  { category: 'Finished Goods', volume: 1.5 },
  { category: 'Trading Items', volume: 0.87 }
];

// Mock Chart of Accounts with Production Waste/Scrap hierarchy
export const mockChartOfAccounts: ChartOfAccount[] = [
  // Assets
  { id: 'COA-1000', code: '1000', name: 'Assets', type: 'asset', balance: 245000, isActive: true, level: 1 },
  { id: 'COA-1100', code: '1100', name: 'Current Assets', type: 'asset', parentId: 'COA-1000', balance: 185000, isActive: true, level: 2 },
  { id: 'COA-1110', code: '1110', name: 'Cash', type: 'asset', parentId: 'COA-1100', balance: 45500, isActive: true, level: 3 },
  { id: 'COA-1120', code: '1120', name: 'Bank - Emirates NBD', type: 'asset', parentId: 'COA-1100', balance: 78000, isActive: true, level: 3 },
  { id: 'COA-1130', code: '1130', name: 'Accounts Receivable', type: 'asset', parentId: 'COA-1100', balance: 60000, isActive: true, level: 3 },
  { id: 'COA-1140', code: '1140', name: 'Raw Material Inventory', type: 'asset', parentId: 'COA-1100', balance: 38250, isActive: true, level: 3 },
  { id: 'COA-1141', code: '1141', name: 'Finished Goods Inventory', type: 'asset', parentId: 'COA-1100', balance: 22500, isActive: true, level: 3 },
  { id: 'COA-1200', code: '1200', name: 'Fixed Assets', type: 'asset', parentId: 'COA-1000', balance: 60000, isActive: true, level: 2 },
  
  // Liabilities
  { id: 'COA-2000', code: '2000', name: 'Liabilities', type: 'liability', balance: 82500, isActive: true, level: 1 },
  { id: 'COA-2100', code: '2100', name: 'Current Liabilities', type: 'liability', parentId: 'COA-2000', balance: 82500, isActive: true, level: 2 },
  { id: 'COA-2110', code: '2110', name: 'Accounts Payable', type: 'liability', parentId: 'COA-2100', balance: 40000, isActive: true, level: 3 },
  { id: 'COA-2120', code: '2120', name: 'VAT Payable', type: 'liability', parentId: 'COA-2100', balance: 42500, isActive: true, level: 3 },
  
  // Equity
  { id: 'COA-3000', code: '3000', name: 'Equity', type: 'equity', balance: 150000, isActive: true, level: 1 },
  { id: 'COA-3100', code: '3100', name: 'Owner\'s Equity', type: 'equity', parentId: 'COA-3000', balance: 100000, isActive: true, level: 2 },
  { id: 'COA-3200', code: '3200', name: 'Retained Earnings', type: 'equity', parentId: 'COA-3000', balance: 50000, isActive: true, level: 2 },
  
  // Revenue
  { id: 'COA-4000', code: '4000', name: 'Revenue', type: 'revenue', balance: 125420, isActive: true, level: 1 },
  { id: 'COA-4100', code: '4100', name: 'Sales Revenue', type: 'revenue', parentId: 'COA-4000', balance: 118000, isActive: true, level: 2 },
  { id: 'COA-4200', code: '4200', name: 'Service Revenue', type: 'revenue', parentId: 'COA-4000', balance: 7420, isActive: true, level: 2 },
  
  // Cost of Goods Sold
  { id: 'COA-5000', code: '5000', name: 'Cost of Goods Sold', type: 'cogs', balance: 48920, isActive: true, level: 1 },
  { id: 'COA-5100', code: '5100', name: 'Material Cost', type: 'cogs', parentId: 'COA-5000', balance: 38420, isActive: true, level: 2 },
  { id: 'COA-5200', code: '5200', name: 'Direct Labor', type: 'cogs', parentId: 'COA-5000', balance: 10500, isActive: true, level: 2 },
  
  // Expenses
  { id: 'COA-6000', code: '6000', name: 'Expenses', type: 'expense', balance: 38310, isActive: true, level: 1 },
  { id: 'COA-6100', code: '6100', name: 'Production Expenses', type: 'expense', parentId: 'COA-6000', balance: 18650, isActive: true, level: 2 },
  { id: 'COA-6110', code: '6110', name: 'Production Waste / Scrap', type: 'expense', parentId: 'COA-6100', balance: 3280, isActive: true, level: 3 },
  { id: 'COA-6120', code: '6120', name: 'Production Overhead', type: 'expense', parentId: 'COA-6100', balance: 15370, isActive: true, level: 3 },
  { id: 'COA-6200', code: '6200', name: 'Operating Expenses', type: 'expense', parentId: 'COA-6000', balance: 12450, isActive: true, level: 2 },
  { id: 'COA-6210', code: '6210', name: 'Rent Expense', type: 'expense', parentId: 'COA-6200', balance: 8000, isActive: true, level: 3 },
  { id: 'COA-6220', code: '6220', name: 'Utilities', type: 'expense', parentId: 'COA-6200', balance: 2450, isActive: true, level: 3 },
  { id: 'COA-6230', code: '6230', name: 'Administrative Expenses', type: 'expense', parentId: 'COA-6200', balance: 2000, isActive: true, level: 3 },
  { id: 'COA-6300', code: '6300', name: 'Shipping & Logistics', type: 'expense', parentId: 'COA-6000', balance: 7210, isActive: true, level: 2 }
];

// Mock Production Orders with Wastage
export const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'PROD-001',
    productName: 'Custom Dining Table',
    bomId: 'BOM001',
    quantity: 3,
    rawMaterialsUsed: [
      {
        itemId: 'INV001',
        itemName: 'Teak Wood Plank',
        quantityUsed: 24,
        wastageQuantity: 2,
        wastagePercentage: 8.3,
        cost: 10800,
        wastageValue: 900
      },
      {
        itemId: 'INV005',
        itemName: 'Wood Screws Set',
        quantityUsed: 6,
        wastageQuantity: 0,
        wastagePercentage: 0,
        cost: 90,
        wastageValue: 0
      }
    ],
    laborCost: 2400,
    overheadCost: 600,
    totalWastageValue: 900,
    totalProductionCost: 14790,
    startDate: '2026-01-06',
    completionDate: '2026-01-13',
    status: 'wip',
    journalEntryId: 'JE-PROD-001'
  },
  {
    id: 'PROD-002',
    productName: 'Bookshelf Unit',
    bomId: 'BOM002',
    quantity: 5,
    rawMaterialsUsed: [
      {
        itemId: 'INV002',
        itemName: 'Marine Plywood 18mm',
        quantityUsed: 20,
        wastageQuantity: 1,
        wastagePercentage: 5,
        cost: 5600,
        wastageValue: 280
      },
      {
        itemId: 'INV005',
        itemName: 'Wood Screws Set',
        quantityUsed: 5,
        wastageQuantity: 0,
        wastagePercentage: 0,
        cost: 75,
        wastageValue: 0
      }
    ],
    laborCost: 2000,
    overheadCost: 500,
    totalWastageValue: 280,
    totalProductionCost: 8455,
    startDate: '2026-01-08',
    completionDate: '2026-01-15',
    status: 'pending',
    journalEntryId: 'JE-PROD-002'
  },
  {
    id: 'PROD-003',
    productName: 'Office Cabinet',
    bomId: 'BOM003',
    quantity: 2,
    rawMaterialsUsed: [
      {
        itemId: 'INV003',
        itemName: 'Oak Wood Sheet',
        quantityUsed: 10,
        wastageQuantity: 1,
        wastagePercentage: 10,
        cost: 3800,
        wastageValue: 380
      }
    ],
    laborCost: 1200,
    overheadCost: 300,
    totalWastageValue: 380,
    totalProductionCost: 5680,
    startDate: '2025-12-28',
    completionDate: '2026-01-05',
    status: 'completed',
    journalEntryId: 'JE-PROD-003'
  },
  {
    id: 'PROD-004',
    productName: 'Conference Table',
    bomId: 'BOM004',
    quantity: 1,
    rawMaterialsUsed: [
      {
        itemId: 'INV001',
        itemName: 'Teak Wood Plank',
        quantityUsed: 16,
        wastageQuantity: 2,
        wastagePercentage: 12.5,
        cost: 7200,
        wastageValue: 900
      }
    ],
    laborCost: 1500,
    overheadCost: 400,
    totalWastageValue: 900,
    totalProductionCost: 10000,
    startDate: '2026-01-04',
    completionDate: '2026-01-12',
    status: 'completed',
    journalEntryId: 'JE-PROD-004'
  },
  {
    id: 'PROD-005',
    productName: 'Storage Unit',
    bomId: 'BOM005',
    quantity: 4,
    rawMaterialsUsed: [
      {
        itemId: 'INV002',
        itemName: 'Marine Plywood 18mm',
        quantityUsed: 12,
        wastageQuantity: 1,
        wastagePercentage: 8.3,
        cost: 3360,
        wastageValue: 280
      },
      {
        itemId: 'INV003',
        itemName: 'Oak Wood Sheet',
        quantityUsed: 6,
        wastageQuantity: 0,
        wastagePercentage: 0,
        cost: 2280,
        wastageValue: 0
      }
    ],
    laborCost: 1600,
    overheadCost: 450,
    totalWastageValue: 280,
    totalProductionCost: 7970,
    startDate: '2026-01-02',
    completionDate: '2026-01-10',
    status: 'completed',
    journalEntryId: 'JE-PROD-005'
  },
  {
    id: 'PROD-006',
    productName: 'Display Cabinet',
    bomId: 'BOM006',
    quantity: 3,
    rawMaterialsUsed: [
      {
        itemId: 'INV001',
        itemName: 'Teak Wood Plank',
        quantityUsed: 15,
        wastageQuantity: 3,
        wastagePercentage: 20,
        cost: 6750,
        wastageValue: 1350
      }
    ],
    laborCost: 1800,
    overheadCost: 500,
    totalWastageValue: 1350,
    totalProductionCost: 10400,
    startDate: '2025-12-30',
    completionDate: '2026-01-08',
    status: 'completed',
    journalEntryId: 'JE-PROD-006'
  }
];

// Mock Journal Entries for Production Waste
export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'JE-PROD-001',
    date: '2026-01-06',
    description: 'Production Order PROD-001 - Material Wastage',
    reference: 'PROD-001',
    entries: [
      {
        accountId: 'COA-6110',
        accountName: 'Production Waste / Scrap',
        debit: 900,
        credit: 0
      },
      {
        accountId: 'COA-1140',
        accountName: 'Raw Material Inventory',
        debit: 0,
        credit: 900
      }
    ],
    totalDebit: 900,
    totalCredit: 900,
    status: 'posted'
  },
  {
    id: 'JE-PROD-002',
    date: '2026-01-08',
    description: 'Production Order PROD-002 - Material Wastage',
    reference: 'PROD-002',
    entries: [
      {
        accountId: 'COA-6110',
        accountName: 'Production Waste / Scrap',
        debit: 280,
        credit: 0
      },
      {
        accountId: 'COA-1140',
        accountName: 'Raw Material Inventory',
        debit: 0,
        credit: 280
      }
    ],
    totalDebit: 280,
    totalCredit: 280,
    status: 'draft'
  },
  {
    id: 'JE-PROD-003',
    date: '2026-01-05',
    description: 'Production Order PROD-003 - Material Wastage',
    reference: 'PROD-003',
    entries: [
      {
        accountId: 'COA-6110',
        accountName: 'Production Waste / Scrap',
        debit: 380,
        credit: 0
      },
      {
        accountId: 'COA-1140',
        accountName: 'Raw Material Inventory',
        debit: 0,
        credit: 380
      }
    ],
    totalDebit: 380,
    totalCredit: 380,
    status: 'posted'
  },
  {
    id: 'JE-PROD-004',
    date: '2026-01-12',
    description: 'Production Order PROD-004 - Material Wastage',
    reference: 'PROD-004',
    entries: [
      {
        accountId: 'COA-6110',
        accountName: 'Production Waste / Scrap',
        debit: 900,
        credit: 0
      },
      {
        accountId: 'COA-1140',
        accountName: 'Raw Material Inventory',
        debit: 0,
        credit: 900
      }
    ],
    totalDebit: 900,
    totalCredit: 900,
    status: 'posted'
  },
  {
    id: 'JE-PROD-005',
    date: '2026-01-10',
    description: 'Production Order PROD-005 - Material Wastage',
    reference: 'PROD-005',
    entries: [
      {
        accountId: 'COA-6110',
        accountName: 'Production Waste / Scrap',
        debit: 280,
        credit: 0
      },
      {
        accountId: 'COA-1140',
        accountName: 'Raw Material Inventory',
        debit: 0,
        credit: 280
      }
    ],
    totalDebit: 280,
    totalCredit: 280,
    status: 'posted'
  },
  {
    id: 'JE-PROD-006',
    date: '2026-01-08',
    description: 'Production Order PROD-006 - Material Wastage (High Wastage Alert)',
    reference: 'PROD-006',
    entries: [
      {
        accountId: 'COA-6110',
        accountName: 'Production Waste / Scrap',
        debit: 1350,
        credit: 0
      },
      {
        accountId: 'COA-1140',
        accountName: 'Raw Material Inventory',
        debit: 0,
        credit: 1350
      }
    ],
    totalDebit: 1350,
    totalCredit: 1350,
    status: 'posted'
  }
];
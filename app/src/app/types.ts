// Type definitions for the manufacturing system

export type InventoryCategory = 'raw_materials' | 'finished_goods' | 'trading_items';
export type MaterialType = 'wood' | 'ply' | 'raw' | 'spare_part' | 'finished' | 'scrap';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';
export type WorkOrderStatus = 'pending' | 'wip' | 'quality_check' | 'completed';
export type TransactionType = 'sale' | 'repair' | 'purchase';
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cogs';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  type: MaterialType;
  length: number; // cm
  width: number; // cm
  height: number; // cm (thickness for ply)
  quantity: number;
  volume: number; // m³ (auto-calculated)
  costPerUnit: number; // AED
  stockStatus: StockStatus;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  outstandingPayable: number;
  totalPurchases: number;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  outstandingBalance: number;
  totalSales: number;
  totalRepairs: number;
  purchaseHistory?: Array<{
    invoiceNumber: string;
    itemName: string;
    quantity: number;
    amount: number;
    date: string;
    type: 'sale' | 'repair' | 'return';
  }>;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  volume: number; // m³
  basePurchasePrice: number;
  shippingCost: number;
  customsClearance: number;
  otherCharges: number;
  landedCost: number; // auto-calculated
  vatAmount: number; // 5%
  totalCost: number;
  paymentStatus: PaymentStatus;
  date: string;
}

export interface BOM {
  id: string;
  productName: string;
  rawMaterials: {
    itemId: string;
    itemName: string;
    quantity: number;
    volume: number;
    cost: number;
  }[];
  laborCost: number;
  overheadCost: number;
  totalProductionCost: number; // auto-calculated
  costPerUnit: number;
}

export interface WorkOrder {
  id: string;
  productName: string;
  bomId: string;
  quantity: number;
  assignedTechnician: string;
  startDate: string;
  dueDate: string;
  status: WorkOrderStatus;
  progress: number; // 0-100
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  type: 'sale' | 'repair' | 'return';
  items: {
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
    amount: number;
  }[];
  subtotal: number;
  vatAmount: number; // 5%
  total: number;
  paymentStatus: PaymentStatus;
  date: string;
}

export interface RepairService {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  instrument: string;
  issueDescription: string;
  spareParts: {
    itemId: string;
    itemName: string;
    quantity: number;
    cost: number;
  }[];
  laborCharges: number;
  technicianAssigned: string;
  subtotal: number;
  vatAmount: number; // 5%
  total: number;
  paymentStatus: PaymentStatus;
  date: string;
}

export interface VATRecord {
  period: string;
  salesVAT: number;
  purchaseVAT: number;
  netVAT: number; // salesVAT - purchaseVAT
  status: 'pending' | 'filed' | 'paid';
}

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  balance: number;
  isActive: boolean;
  level: number; // 1 for parent, 2 for child, 3 for sub-child
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  entries: {
    accountId: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted';
}

export interface ProductionWastage {
  id: string;
  productionOrderId: string;
  rawMaterialId: string;
  rawMaterialName: string;
  wastageQuantity: number;
  wastagePercentage: number;
  wastageValue: number; // AED
  date: string;
  reason?: string;
}

export interface ProductionOrder {
  id: string;
  productName: string;
  bomId: string;
  quantity: number;
  rawMaterialsUsed: {
    itemId: string;
    itemName: string;
    quantityUsed: number;
    wastageQuantity: number;
    wastagePercentage: number;
    cost: number;
    wastageValue: number;
  }[];
  laborCost: number;
  overheadCost: number;
  totalWastageValue: number;
  totalProductionCost: number;
  startDate: string;
  completionDate: string;
  status: WorkOrderStatus;
  journalEntryId?: string;
}

export interface DashboardStats {
  totalStock: number; // m³
  totalPurchases: number; // AED
  totalSales: number; // AED
  netProfit: number; // AED
  workOrdersInProgress: number;
  outstandingCustomerPayments: number;
  outstandingSupplierPayments: number;
}
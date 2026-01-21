/**
 * Enhanced Sales Module Component with Partial Payment Support
 * 
 * Features:
 * - Create sales with partial payments
 * - Multiple payment method allocation
 * - Real-time balance calculation
 * - Payment tracking and reconciliation
 * - Customer due management
 */

'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, FileText, Search, X, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { 
  PaymentStatus, 
  Sale, 
  Customer,
  SalePaymentAllocation,
  PaymentMethod,
  SalePayment,
} from '../types-enhanced';
import {
  createSaleWithPartialPayment,
  recordPaymentReceived,
  updateSaleAfterPayment,
  getAccountIdForPaymentMethod,
  getAccountName,
  CHART_OF_ACCOUNTS,
  calculateSaleTotal,
  generateInvoiceNumber,
} from '../accounting-logic';

interface SalesModuleProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export function SalesModuleEnhanced({ customers, setCustomers }: SalesModuleProps) {
  const { t, i18n } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  
  // Sale form states
  const [showAddSale, setShowAddSale] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  
  // Sale items
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState({
    itemId: '',
    itemName: '',
    quantity: '',
    ratePerUnit: '',
  });
  
  // Payment allocation states (NEW)
  const [paymentAllocations, setPaymentAllocations] = useState<SalePaymentAllocation[]>([]);
  const [currentAllocation, setCurrentAllocation] = useState({
    paymentMethod: 'cash' as PaymentMethod,
    amount: '',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);

  // ============================================================================
  // CUSTOMER SELECTION
  // ============================================================================

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.contact.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery('');
    setCustomerSearchOpen(false);
  };

  // ============================================================================
  // PAYMENT ALLOCATION MANAGEMENT
  // ============================================================================

  /**
   * Add payment allocation for a sale (can have multiple methods)
   */
  const handleAddPaymentAllocation = () => {
    const amount = parseFloat(currentAllocation.amount);
    
    if (amount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }
    
    // Validate total allocations don't exceed sale total
    const subtotal = calculateSubtotal();
    const total = calculateSaleTotal(subtotal);
    const totalAllocated = paymentAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    
    if (totalAllocated + amount > total) {
      toast.error(`Payment allocation exceeds sale total (${total})`);
      return;
    }
    
    const accountId = getAccountIdForPaymentMethod(currentAllocation.paymentMethod);
    
    const allocation: SalePaymentAllocation = {
      paymentMethod: currentAllocation.paymentMethod,
      amount: amount,
      accountId: accountId,
      accountName: getAccountName(accountId),
      date: new Date().toISOString().split('T')[0],
    };
    
    setPaymentAllocations([...paymentAllocations, allocation]);
    setCurrentAllocation({ paymentMethod: 'cash', amount: '' });
    toast.success(`${allocation.paymentMethod.toUpperCase()} allocation added`);
  };

  /**
   * Remove payment allocation
   */
  const handleRemoveAllocation = (index: number) => {
    setPaymentAllocations(paymentAllocations.filter((_, i) => i !== index));
  };

  // ============================================================================
  // SALE ITEMS MANAGEMENT
  // ============================================================================

  const handleAddItem = () => {
    if (!currentItem.itemId || !currentItem.quantity || !currentItem.ratePerUnit) {
      toast.error('Please fill all item fields');
      return;
    }
    
    const quantity = parseFloat(currentItem.quantity);
    const rate = parseFloat(currentItem.ratePerUnit);
    
    if (quantity <= 0 || rate <= 0) {
      toast.error('Quantity and rate must be positive');
      return;
    }
    
    const amount = quantity * rate;
    
    const item = {
      itemId: currentItem.itemId,
      itemName: currentItem.itemName,
      quantity: quantity,
      ratePerUnit: rate,
      amount: amount,
    };
    
    setSaleItems([...saleItems, item]);
    setCurrentItem({ itemId: '', itemName: '', quantity: '', ratePerUnit: '' });
    toast.success('Item added to sale');
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calculateSubtotal = (): number => {
    return saleItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const subtotal = calculateSubtotal();
  const vat = subtotal * 0.05;
  const total = subtotal + vat;
  
  const totalPaid = paymentAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  const remainingDue = Math.max(0, total - totalPaid);

  // ============================================================================
  // SALE CREATION
  // ============================================================================

  const handleCreateSale = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }
    
    if (saleItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      // Create sale with payment allocations
      const invoiceNumber = generateInvoiceNumber(sales.length + 1);
      
      const { sale, journalEntry } = createSaleWithPartialPayment(
        {
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          items: saleItems.map(item => ({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            ratePerUnit: item.ratePerUnit,
            amount: item.amount,
          })),
          type: 'sale',
          invoiceNumber: invoiceNumber,
          date: new Date().toISOString().split('T')[0],
        },
        paymentAllocations
      );
      
      // Add to sales list
      setSales([...sales, sale]);
      
      // Update customer outstanding balance
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedCustomer.id) {
          return {
            ...c,
            outstandingBalance: c.outstandingBalance + remainingDue,
            totalSales: c.totalSales + total,
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      
      // Reset form
      setSelectedCustomer(null);
      setSaleItems([]);
      setPaymentAllocations([]);
      setShowAddSale(false);
      
      toast.success(`Sale ${invoiceNumber} created successfully!`);
      
      // Show payment status
      if (remainingDue > 0) {
        toast.info(`Customer due: AED ${remainingDue.toFixed(2)}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sale');
    }
  };

  // ============================================================================
  // PAYMENT RECEIPT
  // ============================================================================

  const handleRecordPayment = () => {
    if (!selectedSale) {
      toast.error('No sale selected');
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    
    if (amount <= 0 || amount > selectedSale.remainingDue) {
      toast.error('Invalid payment amount');
      return;
    }
    
    try {
      const { payment, journalEntry } = recordPaymentReceived(selectedSale, {
        amount: amount,
        paymentMethod: paymentMethod,
        date: new Date().toISOString().split('T')[0],
      });
      
      // Update sale
      const updatedSale = updateSaleAfterPayment(selectedSale, payment);
      const updatedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
      setSales(updatedSales);
      
      // Add payment
      setPayments([...payments, payment]);
      
      // Update customer
      const updatedCustomers = customers.map(c => {
        if (c.id === selectedSale.customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - amount),
            totalPaid: (c.totalPaid || 0) + amount,
          };
        }
        return c;
      });
      setCustomers(updatedCustomers);
      
      // Reset payment form
      setShowPaymentModal(false);
      setSelectedSale(null);
      setPaymentAmount('');
      setPaymentMethod('cash');
      
      toast.success('Payment recorded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredSales = sales.filter(sale => {
    const matchesQuery = 
      sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sale.paymentStatus === filterStatus;
    
    return matchesQuery && matchesStatus;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Sales Management</h1>
        <p className="text-muted-foreground mt-1">Manage sales with partial payments and customer due tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              AED {sales.reduce((sum, s) => sum + s.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              AED {sales.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              AED {sales.reduce((sum, s) => sum + s.remainingDue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Create Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sale with Payment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label>Customer *</Label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder="Search customer..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      onFocus={() => setCustomerSearchOpen(true)}
                    />
                    {customerSearchOpen && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0"
                          >
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone} • Due: AED {customer.outstandingBalance}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sale Items */}
              <div className="space-y-3">
                <Label>Sale Items *</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Item ID"
                    value={currentItem.itemId}
                    onChange={(e) => setCurrentItem({ ...currentItem, itemId: e.target.value })}
                  />
                  <Input
                    placeholder="Item Name"
                    value={currentItem.itemName}
                    onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Rate/Unit"
                    value={currentItem.ratePerUnit}
                    onChange={(e) => setCurrentItem({ ...currentItem, ratePerUnit: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>

                {saleItems.length > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">AED {item.ratePerUnit}</TableCell>
                            <TableCell className="text-right font-medium">AED {item.amount}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(idx)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Payment Allocations (NEW) */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Payment Allocation *</Label>
                  <span className="text-xs text-muted-foreground">Allocate sale payment to accounts</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Select value={currentAllocation.paymentMethod} onValueChange={(value) => setCurrentAllocation({ ...currentAllocation, paymentMethod: value as PaymentMethod })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount (AED)"
                    value={currentAllocation.amount}
                    onChange={(e) => setCurrentAllocation({ ...currentAllocation, amount: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPaymentAllocation}
                  >
                    Add
                  </Button>
                </div>

                {paymentAllocations.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Account</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentAllocations.map((alloc, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium capitalize">{alloc.paymentMethod}</TableCell>
                            <TableCell className="text-right">AED {alloc.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right text-xs">{alloc.accountName}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAllocation(idx)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Sale Summary */}
              {saleItems.length > 0 && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">AED {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (5%):</span>
                    <span className="font-medium">AED {vat.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total Sale:</span>
                    <span className="font-bold text-lg">AED {total.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Paid:</p>
                      <p className="font-bold text-green-600">AED {totalPaid.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining:</p>
                      <p className="font-bold text-orange-600">AED {remainingDue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status:</p>
                      <Badge variant={remainingDue === 0 ? 'default' : 'secondary'}>
                        {remainingDue === 0 ? 'PAID' : remainingDue < total ? 'PARTIAL' : 'PENDING'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddSale(false)}>Cancel</Button>
                <Button
                  onClick={handleCreateSale}
                  className="bg-blue-900 hover:bg-blue-800"
                  disabled={!selectedCustomer || saleItems.length === 0}
                >
                  Create Sale
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cleared">Cleared</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total (AED)</TableHead>
                <TableHead className="text-right">Paid (AED)</TableHead>
                <TableHead className="text-right">Due (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell className="text-right">AED {sale.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">AED {sale.totalPaid.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-orange-600 font-medium">AED {sale.remainingDue.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {sale.paymentStatus.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {sale.remainingDue > 0 && (
                      <Dialog open={showPaymentModal && selectedSale?.id === sale.id} onOpenChange={setShowPaymentModal}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSale(sale);
                              setShowPaymentModal(true);
                            }}
                          >
                            Record Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Payment - {sale.invoiceNumber}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="bg-muted p-3 rounded">
                              <p className="text-sm text-muted-foreground">Remaining Due</p>
                              <p className="text-2xl font-bold">AED {sale.remainingDue.toFixed(2)}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Payment Amount (AED) *</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                max={sale.remainingDue}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Payment Method</Label>
                              <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="bank">Bank Transfer</SelectItem>
                                  <SelectItem value="pos">POS</SelectItem>
                                  <SelectItem value="check">Check</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                              <Button
                                onClick={handleRecordPayment}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm Payment
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default SalesModuleEnhanced;

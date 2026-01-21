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
import { Plus, FileText, Search, X } from 'lucide-react';
import { mockSales, mockInventory } from '../mockData';
import type { PaymentStatus, Sale, InventoryItem, Customer } from '../types';
import { toast } from 'sonner';

interface SalesModuleProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export function SalesModule({ customers, setCustomers }: SalesModuleProps) {
  const { t, i18n } = useTranslation();
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'repair' | 'return'>('all');

  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    itemId: '',
    itemName: '',
    itemType: 'wood',
    quantity: '',
    length: '',
    width: '',
    height: '',
    ratePerUnit: '',
    saleType: 'sale' as 'sale' | 'repair' | 'return'
  });

  const calculateVolume = () => {
    const l = parseFloat(formData.length) || 0;
    const w = parseFloat(formData.width) || 0;
    const h = parseFloat(formData.height) || 0;
    const q = parseFloat(formData.quantity) || 0;
    return (l * w * h * q) / 1000000;
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.contact.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone.includes(customerSearchQuery)
  );

  // Filter items based on search
  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) &&
    item.quantity > 0
  );

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name
    }));
    setCustomerSearchQuery('');
    setCustomerSearchOpen(false);
  };

  // Handle adding a new customer
  const handleAddNewCustomer = () => {
    if (!newCustomerData.name || !newCustomerData.contact || !newCustomerData.email || !newCustomerData.phone || !newCustomerData.address) {
      toast.error(t('sales.enterCustomerDetails'));
      return;
    }

    const newCustomer: Customer = {
      id: `CUST${Date.now()}`,
      name: newCustomerData.name,
      contact: newCustomerData.contact,
      email: newCustomerData.email,
      phone: newCustomerData.phone,
      address: newCustomerData.address,
      outstandingBalance: 0,
      totalSales: 0,
      totalRepairs: 0,
      purchaseHistory: []
    };

    // Add new customer to list
    setCustomers([...customers, newCustomer]);

    // Auto-select the newly created customer
    handleCustomerSelect(newCustomer);

    // Reset form and close dialog
    setNewCustomerData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: ''
    });
    setShowAddCustomer(false);
    toast.success(t('sales.customerAddedSuccessfully'));
  };

  // Handle item selection from dropdown
  const handleItemSelect = (itemId: string) => {
    const selectedItem = inventory.find(item => item.id === itemId);
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        itemType: selectedItem.type,
        length: selectedItem.length.toString(),
        width: selectedItem.width.toString(),
        height: selectedItem.height.toString(),
        ratePerUnit: selectedItem.costPerUnit.toString()
      }));
      setItemSearchQuery('');
    }
  };

  const handleAddSale = () => {
    // Validate required fields
    if (!formData.customerId || !formData.itemId || !formData.quantity || !formData.ratePerUnit) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    // For wood items, dimensions are mandatory
    if (formData.itemType === 'wood' && (!formData.length || !formData.width || !formData.height)) {
      toast.error(t('inventory.pleaseProvideDimensions'));
      return;
    }

    // Check inventory quantity for sales (not for repairs or returns)
    if (formData.saleType === 'sale') {
      const inventoryItem = inventory.find(item => item.id === formData.itemId);
      if (!inventoryItem || inventoryItem.quantity < parseFloat(formData.quantity)) {
          toast.error(t('sales.selectValidCustomer'));
          return;
        }
      }
    
    // Calculate amount
    const amount = parseFloat(formData.quantity) * parseFloat(formData.ratePerUnit);
    const vat = amount * 0.05;
    const total = amount + vat;
    const volume = calculateVolume();

    const newSale: Sale = {
      id: `SALE${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      customerId: formData.customerId,
      customerName: formData.customerName,
      type: formData.saleType,
      items: [
        {
          itemId: formData.itemId,
          itemName: formData.itemName,
          quantity: parseFloat(formData.quantity),
          ...(formData.length || formData.width || formData.height ? {
            dimensions: {
              length: parseFloat(formData.length) || 0,
              width: parseFloat(formData.width) || 0,
              height: parseFloat(formData.height) || 0,
            },
            volume: volume > 0 ? volume : undefined
          } : {}),
          ratePerUnit: parseFloat(formData.ratePerUnit),
          amount: amount
        }
      ],
      subtotal: amount,
      vatAmount: vat,
      total: total,
      paymentStatus: 'pending',
      date: new Date().toISOString()
    };

    // Update inventory based on transaction type
    if (formData.saleType === 'sale') {
      // Deduct from inventory on sale
      setInventory(inventory.map(item => 
        item.id === formData.itemId 
          ? { ...item, quantity: item.quantity - parseFloat(formData.quantity) }
          : item
      ));
    } else if (formData.saleType === 'return') {
      // Add back to inventory on return
      setInventory(inventory.map(item => 
        item.id === formData.itemId 
          ? { ...item, quantity: item.quantity + parseFloat(formData.quantity) }
          : item
      ));
    }

    // Update customer purchase history and totals
    setCustomers(customers.map(customer => {
      if (customer.id === formData.customerId) {
        const updatedHistory = customer.purchaseHistory || [];
        updatedHistory.push({
          invoiceNumber: newSale.invoiceNumber,
          itemName: formData.itemName,
          quantity: parseFloat(formData.quantity),
          amount: amount,
          date: newSale.date,
          type: formData.saleType
        });
        
        return {
          ...customer,
          totalSales: customer.totalSales + amount,
          totalRepairs: formData.saleType === 'repair' ? customer.totalRepairs + 1 : customer.totalRepairs,
          outstandingBalance: formData.saleType === 'return' 
            ? customer.outstandingBalance - amount 
            : customer.outstandingBalance + amount,
          purchaseHistory: updatedHistory
        };
      }
      return customer;
    }));

    setSales([...sales, newSale]);
    
    // Reset form
    setSelectedCustomer(null);
    setFormData({ 
      customerId: '',
      customerName: '', 
      itemId: '',
      itemName: '', 
      itemType: 'wood',
      quantity: '', 
      length: '',
      width: '',
      height: '',
      ratePerUnit: '', 
      saleType: 'sale' 
    });
    setShowAddSale(false);
    toast.success(t('messages.transactionRecorded'));
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">{t('salesModule.paid')}</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500">{t('salesModule.partial')}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">{t('common.loading')}</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">{t('reports.overdue')}</Badge>;
    }
  };

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sale.paymentStatus === filterStatus;
    const matchesType = filterType === 'all' || sale.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">{t('salesModule.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('salesModule.manageSales')}</p>
        </div>
        <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('salesModule.newSale')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('dialogs.addItem')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Customer Selection with Search */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <Label>{t('salesModule.customer')} * (CRM)</Label>
                  <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="bg-amber-50 hover:bg-amber-100 text-amber-900">
                        <Plus className="h-3 w-3 mr-1" />
                        {t('customers.addCustomer')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('customers.addCustomer')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t('customers.name')} *</Label>
                          <Input
                            placeholder="Enter customer name"
                            value={newCustomerData.name}
                            onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('customers.contact')} *</Label>
                          <Input
                            placeholder="Enter contact person name"
                            value={newCustomerData.contact}
                            onChange={(e) => setNewCustomerData({ ...newCustomerData, contact: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('customers.email')} *</Label>
                          <Input
                            type="email"
                            placeholder="Enter email"
                            value={newCustomerData.email}
                            onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('customers.phone')} *</Label>
                          <Input
                            placeholder="Enter phone number"
                            value={newCustomerData.phone}
                            onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('customers.address')} *</Label>
                          <Input
                            placeholder="Enter address"
                            value={newCustomerData.address}
                            onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                          <Button variant="outline" onClick={() => setShowAddCustomer(false)}>{t('common.cancel')}</Button>
                          <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleAddNewCustomer}>{t('customers.addCustomer')}</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  {selectedCustomer ? (
                    <div className="border rounded-lg p-3 bg-blue-50 border-blue-300 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">{selectedCustomer.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                          <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                          <p className="text-xs text-muted-foreground">{selectedCustomer.address}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(null);
                            setFormData(prev => ({ ...prev, customerId: '', customerName: '' }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 text-xs gap-2">
                        <div className="bg-white p-2 rounded">
                          <span className="text-muted-foreground">Total Sales:</span>
                          <p className="font-semibold">AED {selectedCustomer.totalSales.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <span className="text-muted-foreground">Outstanding:</span>
                          <p className="font-semibold text-red-600">AED {selectedCustomer.outstandingBalance.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Purchase History */}
                      {selectedCustomer.purchaseHistory && selectedCustomer.purchaseHistory.length > 0 && (
                        <div className="bg-white p-2 rounded text-xs">
                          <p className="font-semibold mb-1">Recent Purchases:</p>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {selectedCustomer.purchaseHistory.slice(-3).reverse().map((purchase, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span>{purchase.itemName} (Qty: {purchase.quantity})</span>
                                <span className="text-muted-foreground">{new Date(purchase.date).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Input
                        placeholder="Search customer by name, email, or phone..."
                        value={customerSearchQuery}
                        onChange={(e) => {
                          setCustomerSearchQuery(e.target.value);
                          setCustomerSearchOpen(true);
                        }}
                        onFocus={() => setCustomerSearchOpen(true)}
                      />
                      {customerSearchOpen && (
                        <div className="absolute top-full left-0 right-0 border rounded-lg bg-white shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <button
                                key={customer.id}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <div className="font-semibold text-sm">{customer.name}</div>
                                <div className="text-xs text-muted-foreground">{customer.email} | {customer.phone}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                              No customers found
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sale Type *</Label>
                  <Select value={formData.saleType} onValueChange={(val: any) => setFormData({ ...formData, saleType: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="return">Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Item Selection with Search */}
              <div className="space-y-2">
                <Label>Search & Select Item from Inventory *</Label>
                <Input
                  placeholder="Search instrument (e.g., Guitar, Drum...)"
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="mb-2"
                />
                
                {itemSearchQuery && (
                  <div className="border rounded-lg bg-white shadow-md max-h-48 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <button
                          key={item.id}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0"
                          onClick={() => handleItemSelect(item.id)}
                        >
                          <div className="font-semibold text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Type: {item.type} | Available: {item.quantity} | Cost: AED {item.costPerUnit}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                        No items found
                      </div>
                    )}
                  </div>
                )}

                {formData.itemId && (
                  <div className="border rounded-lg p-3 bg-green-50 border-green-300">
                    <p className="text-xs text-muted-foreground">Selected Item</p>
                    <p className="font-semibold text-green-900">{formData.itemName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {formData.itemType} | Cost: AED {formData.ratePerUnit}
                    </p>
                  </div>
                )}
              </div>

              {/* Dimensions - Mandatory for Wood */}
              {formData.itemType === 'wood' && (
                <div>
                  <Label className="mb-2 block">Dimensions (cm) * - Required for Wood</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Length (cm) *</Label>
                      <Input
                        type="number"
                        placeholder="Length"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Width (cm) *</Label>
                      <Input
                        type="number"
                        placeholder="Width"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Height (cm) *</Label>
                      <Input
                        type="number"
                        placeholder="Height"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dimensions - Optional for Non-Wood */}
              {formData.itemType !== 'wood' && (
                <div>
                  <Label className="mb-2 block">Dimensions (cm) - Optional</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Length (cm)</Label>
                      <Input
                        type="number"
                        placeholder="Length"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Width (cm)</Label>
                      <Input
                        type="number"
                        placeholder="Width"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                      <Input
                        type="number"
                        placeholder="Height"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate Per Unit (AED) *</Label>
                  <Input
                    type="number"
                    placeholder="Enter rate"
                    value={formData.ratePerUnit}
                    onChange={(e) => setFormData({ ...formData, ratePerUnit: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddSale(false)}>{t('common.cancel')}</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddSale}>{t('sales.newOrder')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="text-sm">Total Sales (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {mockSales.reduce((sum, s) => sum + s.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader>
            <CardTitle className="text-sm">VAT Collected (5%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              AED {mockSales.reduce((sum, s) => sum + s.vatAmount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-sm">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              AED {mockSales.filter(s => s.paymentStatus !== 'paid').reduce((sum, s) => sum + s.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer or invoice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="repair">Repairs</SelectItem>
                  <SelectItem value="return">Returns</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">VAT (5%)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{sale.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{sale.subtotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{sale.vatAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{sale.total.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentBadge(sale.paymentStatus)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No sales found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sales Items Detail */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Sales Details ({filteredSales.length})</h2>
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sale.invoiceNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{sale.customerName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-green-600">AED {sale.total.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Dimensions (cm)</TableHead>
                      <TableHead className="text-right">Volume (m³)</TableHead>
                      <TableHead className="text-right">Rate/Unit</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.dimensions ? 
                            `${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.height}` 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.volume ? item.volume.toFixed(4) : '-'}
                        </TableCell>
                        <TableCell className="text-right">{item.ratePerUnit.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={5} className="text-right font-semibold">Subtotal:</TableCell>
                      <TableCell className="text-right font-semibold">AED {sale.subtotal.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right">VAT (5%):</TableCell>
                      <TableCell className="text-right">AED {sale.vatAmount.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow className="bg-green-50">
                      <TableCell colSpan={5} className="text-right font-semibold text-lg">Total:</TableCell>
                      <TableCell className="text-right font-semibold text-lg text-green-900">
                        AED {sale.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No sales found matching your search
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

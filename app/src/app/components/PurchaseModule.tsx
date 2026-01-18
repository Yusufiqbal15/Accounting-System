'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Search, Trash2 } from 'lucide-react';
import { mockPurchases, calculateVolume } from '../mockData';
import type { PaymentStatus, Purchase } from '../types';
import { toast } from 'sonner';

export function PurchaseModule() {
  const { t } = useTranslation();
  const [showNewPurchase, setShowNewPurchase] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    supplier: '',
    item: '',
    itemType: 'wood',
    quantity: '',
    length: '',
    width: '',
    height: '',
    basePrice: '',
    shipping: '',
    customs: '',
    other: ''
  });

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">{t('purchases.paid')}</Badge>;
      case 'partial':
        return <Badge className="bg-amber-500">{t('purchases.partial')}</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500">{t('purchases.pending')}</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">{t('purchases.overdue')}</Badge>;
    }
  };

  // Calculate landed cost
  const calculateLandedCost = () => {
    const base = parseFloat(formData.basePrice) || 0;
    const ship = parseFloat(formData.shipping) || 0;
    const cust = parseFloat(formData.customs) || 0;
    const oth = parseFloat(formData.other) || 0;
    return base + ship + cust + oth;
  };

  const landedCost = calculateLandedCost();
  const vatAmount = landedCost * 0.05;
  const totalCost = landedCost + vatAmount;

  const volume = formData.length && formData.width && formData.height && formData.quantity
    ? calculateVolume(
        parseFloat(formData.length),
        parseFloat(formData.width),
        parseFloat(formData.height),
        parseFloat(formData.quantity)
      )
    : 0;

  const handleCreatePurchase = () => {
    // Validation
    if (!formData.supplier || !formData.item || !formData.quantity || !formData.basePrice) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    // Create new purchase order
    const newPurchase: Purchase = {
      id: `PO-${Date.now()}`,
      supplierId: `SUP-${Date.now()}`,
      supplierName: formData.supplier,
      itemId: `ITEM-${Date.now()}`,
      itemName: formData.item,
      quantity: parseFloat(formData.quantity),
      dimensions: {
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
      },
      volume: volume,
      basePurchasePrice: parseFloat(formData.basePrice),
      shippingCost: parseFloat(formData.shipping) || 0,
      customsClearance: parseFloat(formData.customs) || 0,
      otherCharges: parseFloat(formData.other) || 0,
      landedCost: landedCost,
      vatAmount: vatAmount,
      totalCost: totalCost,
      paymentStatus: 'pending',
      date: new Date().toISOString(),
    };

    // Add to purchases list
    setPurchases([...purchases, newPurchase]);
    
    // Reset form and close dialog
    setFormData({
      supplier: '',
      item: '',
      itemType: 'wood',
      quantity: '',
      length: '',
      width: '',
      height: '',
      basePrice: '',
      shipping: '',
      customs: '',
      other: ''
    });
    setShowNewPurchase(false);
    
    toast.success(t('purchases.orderCreatedSuccessfully'));
  };

  // Filter purchases
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || purchase.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
    toast.success(t('common.success'));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">{t('purchases.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('purchases.title')}</p>
        </div>
        <Dialog open={showNewPurchase} onOpenChange={setShowNewPurchase}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('purchases.newPurchase')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('purchases.newPurchase')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Supplier Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('purchases.supplier')}</Label>
                  <Input 
                    placeholder={t('purchases.supplier')}
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('purchases.itemName')}</Label>
                  <Input 
                    placeholder={t('purchases.itemName')}
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  />
                </div>
              </div>

              {/* Item Type */}
              <div>
                <Label>{t('itemsManagement.type')}</Label>
                <Select value={formData.itemType} onValueChange={(val) => setFormData({ ...formData, itemType: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="ply">Plywood</SelectItem>
                    <SelectItem value="spare_part">Spare Parts</SelectItem>
                    <SelectItem value="other">Other Purchases</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dimensions - Only for Wood and Ply */}
              {(formData.itemType === 'wood' || formData.itemType === 'ply') && (
                <div>
                  <Label className="mb-3 block">Dimensions (cm) {formData.itemType === 'wood' ? '*' : ''} & Quantity</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Length (cm) {formData.itemType === 'wood' ? '*' : ''}</Label>
                      <Input 
                        type="number"
                        placeholder="300"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        required={formData.itemType === 'wood'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Width (cm) {formData.itemType === 'wood' ? '*' : ''}</Label>
                      <Input 
                        type="number"
                        placeholder="20"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        required={formData.itemType === 'wood'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Height (cm) {formData.itemType === 'wood' ? '*' : ''}</Label>
                      <Input 
                        type="number"
                        placeholder="5"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        required={formData.itemType === 'wood'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input 
                        type="number"
                      placeholder="50"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-sm font-semibold text-blue-900">
                      Auto Volume: {volume.toFixed(4)} m³
                    </span>
                  </div>
                </div>
              )}

              {/* Non-Wood Items - Optional Size */}
              {(formData.itemType !== 'wood' && formData.itemType !== 'ply') && (
                <div>
                  <Label className="mb-3 block">Dimensions (cm) - Optional & Quantity</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Length (cm)</Label>
                      <Input 
                        type="number"
                        placeholder="300"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Width (cm)</Label>
                      <Input 
                        type="number"
                        placeholder="20"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                      <Input 
                        type="number"
                        placeholder="5"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Quantity *</Label>
                      <Input 
                        type="number"
                        placeholder="50"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  {volume > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <span className="text-sm font-semibold text-blue-900">
                        Auto Volume: {volume.toFixed(4)} m³
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div>
                <Label className="mb-3 block">{t('purchases.pricing')} (AED)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('purchases.basePrice')}</Label>
                    <Input 
                      type="number"
                      placeholder="20000"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('purchases.shippingCost')}</Label>
                    <Input 
                      type="number"
                      placeholder="1500"
                      value={formData.shipping}
                      onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('purchases.customsClearance')}</Label>
                    <Input 
                      type="number"
                      placeholder="800"
                      value={formData.customs}
                      onChange={(e) => setFormData({ ...formData, customs: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">{t('common.actions')}</Label>
                    <Input 
                      type="number"
                      placeholder="200"
                      value={formData.other}
                      onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm">{t('common.success')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{t('purchases.landedCost')} (Auto):</span>
                    <span className="font-semibold">AED {landedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('purchases.vatAmount')}:</span>
                    <span className="font-semibold">AED {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-green-300">
                    <span>{t('purchases.totalCost')}:</span>
                    <span className="text-green-900">AED {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowNewPurchase(false)}>
                  {t('common.cancel')}
                </Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleCreatePurchase}>
                  {t('purchases.newPurchase')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('purchases.newPurchase')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('common.filter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('itemsManagement.all')}</SelectItem>
                  <SelectItem value="paid">{t('purchases.paid')}</SelectItem>
                  <SelectItem value="partial">{t('purchases.partial')}</SelectItem>
                  <SelectItem value="pending">{t('purchases.pending')}</SelectItem>
                  <SelectItem value="overdue">{t('purchases.overdue')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('purchases.poNumber')}</TableHead>
                <TableHead>{t('production.orderDate')}</TableHead>
                <TableHead>{t('purchases.supplier')}</TableHead>
                <TableHead>{t('purchases.itemName')}</TableHead>
                <TableHead className="text-right">{t('inventory.volume')} (m³)</TableHead>
                <TableHead className="text-right">{t('purchases.landedCost')}</TableHead>
                <TableHead className="text-right">VAT (5%)</TableHead>
                <TableHead className="text-right">{t('purchases.totalCost')}</TableHead>
                <TableHead>{t('purchases.paymentStatus')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                    <TableCell>{purchase.supplierName}</TableCell>
                    <TableCell>{purchase.itemName}</TableCell>
                    <TableCell className="text-right font-semibold">{purchase.volume.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{purchase.landedCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{purchase.vatAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{purchase.totalCost.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentBadge(purchase.paymentStatus)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePurchase(purchase.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

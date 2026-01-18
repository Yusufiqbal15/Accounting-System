'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Search } from 'lucide-react';
import { mockInventory, calculateVolume } from '../mockData';
import type { InventoryCategory, StockStatus, InventoryItem } from '../types';
import { toast } from 'sonner';

export function InventoryManagement() {
  const { t, i18n } = useTranslation();
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<InventoryCategory>('raw_materials');
  const [showAddItem, setShowAddItem] = useState(false);

  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'wood',
    length: '',
    width: '',
    height: '',
    quantity: '',
    costPerUnit: '',
    stockStatus: 'in_stock' as StockStatus
  });

  const handleAddItem = () => {
    if (!formData.name || !formData.quantity || !formData.costPerUnit) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    // For wood items, dimensions are mandatory
    if (formData.type === 'wood' && (!formData.length || !formData.width || !formData.height)) {
      toast.error(t('inventory.pleaseProvideDimensions'));
      return;
    }

    const volume = calculateVolume(
      parseFloat(formData.length) || 0,
      parseFloat(formData.width) || 0,
      parseFloat(formData.height) || 0,
      parseFloat(formData.quantity)
    );

    const newItem: InventoryItem = {
      id: `INV${Date.now()}`,
      name: formData.name,
      category: selectedTab,
      type: formData.type as any,
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      height: parseFloat(formData.height) || 0,
      quantity: parseFloat(formData.quantity),
      volume: volume,
      costPerUnit: parseFloat(formData.costPerUnit),
      stockStatus: formData.stockStatus
    };

    setInventory([...inventory, newItem]);
    setFormData({
      name: '',
      type: 'wood',
      length: '',
      width: '',
      height: '',
      quantity: '',
      costPerUnit: '',
      stockStatus: 'in_stock'
    });
    setShowAddItem(false);
    toast.success(t('inventory.itemAddedSuccessfully'));
  };

  const getStockBadge = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-600">{t('inventoryModule.inStock')}</Badge>;
      case 'low_stock':
        return <Badge className="bg-amber-500">{t('inventoryModule.lowStock')}</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-500">{t('common.noData')}</Badge>;
    }
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.category === selectedTab &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">{t('inventoryModule.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('inventoryModule.manageInventory')}</p>
        </div>
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('inventoryModule.addNewItem')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('dialogs.addItem')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('inventoryModule.itemName')} *</Label>
                <Input
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('inventoryModule.type')}</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wood">Wood</SelectItem>
                      <SelectItem value="ply">Plywood</SelectItem>
                      <SelectItem value="raw">Raw Material</SelectItem>
                      <SelectItem value="spare_part">Spare Part</SelectItem>
                      <SelectItem value="finished">Finished Good</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('inventoryModule.status')}</Label>
                  <Select value={formData.stockStatus} onValueChange={(val: any) => setFormData({ ...formData, stockStatus: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">{t('inventoryModule.inStock')}</SelectItem>
                      <SelectItem value="low_stock">{t('inventoryModule.lowStock')}</SelectItem>
                      <SelectItem value="out_of_stock">{t('common.noData')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dimensions - Mandatory for Wood */}
              {formData.type === 'wood' && (
                <div className="space-y-2">
                  <Label>Dimensions (cm) * - Required for Wood</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Length *</Label>
                      <Input
                        type="number"
                        placeholder="Length"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Width *</Label>
                      <Input
                        type="number"
                        placeholder="Width"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Height *</Label>
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
              {formData.type !== 'wood' && (
                <div className="space-y-2">
                  <Label>Dimensions (cm) - Optional</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Length</Label>
                      <Input
                        type="number"
                        placeholder="Length"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        placeholder="Width"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Height</Label>
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
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Per Unit (AED) *</Label>
                  <Input
                    type="number"
                    placeholder="Cost"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowAddItem(false)}>{t('common.cancel')}</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddItem}>{t('common.add')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Formula Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-blue-900">{t('inventoryModule.autoCalculation')}</span>
            <code className="bg-white px-3 py-1 rounded border border-blue-200 text-blue-900">
              {t('inventoryModule.volumeFormula')}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('inventoryModule.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Inventory Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as InventoryCategory)}>
        <TabsList>
          <TabsTrigger value="raw_materials">{t('inventoryModule.rawMaterials')}</TabsTrigger>
          <TabsTrigger value="finished_goods">{t('inventoryModule.finishedGoods')}</TabsTrigger>
          <TabsTrigger value="trading_items">{t('inventoryModule.tradingItems')}</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab === 'raw_materials' && t('inventoryModule.rawMaterials')}
                {selectedTab === 'finished_goods' && t('inventoryModule.finishedGoods')}
                {selectedTab === 'trading_items' && t('inventoryModule.tradingItems')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventoryModule.itemCode')}</TableHead>
                    <TableHead>{t('inventoryModule.itemName')}</TableHead>
                    <TableHead>{t('inventoryModule.type')}</TableHead>
                    <TableHead className="text-right">{t('inventoryModule.length')}</TableHead>
                    <TableHead className="text-right">{t('inventoryModule.width')}</TableHead>
                    <TableHead className="text-right">{t('inventoryModule.height')}</TableHead>
                    <TableHead className="text-right">{t('inventoryModule.quantity')}</TableHead>
                    <TableHead className="text-right bg-blue-50">{t('inventoryModule.volume')}</TableHead>
                    <TableHead className="text-right">Cost/Unit (AED)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.length}</TableCell>
                      <TableCell className="text-right">{item.width}</TableCell>
                      <TableCell className="text-right">{item.height}</TableCell>
                      <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                      <TableCell className="text-right font-semibold bg-blue-50 text-blue-900">
                        {item.volume.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">{item.costPerUnit.toLocaleString()}</TableCell>
                      <TableCell>{getStockBadge(item.stockStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {t('common.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('inventoryModule.totalRawMaterials')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {inventory.filter((i) => i.category === 'raw_materials').reduce((sum, i) => sum + i.volume, 0).toFixed(2)} m³
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('inventoryModule.totalFinishedGoods')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {mockInventory.filter((i) => i.category === 'finished_goods').reduce((sum, i) => sum + i.volume, 0).toFixed(2)} m³
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('inventoryModule.totalTradingItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {mockInventory.filter((i) => i.category === 'trading_items').reduce((sum, i) => sum + i.volume, 0).toFixed(2)} m³
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

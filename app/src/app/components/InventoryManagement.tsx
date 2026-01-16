import { useState } from 'react';
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
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<InventoryCategory>('raw_materials');
  const [showAddItem, setShowAddItem] = useState(false);
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
      toast.error('Please fill in all required fields');
      return;
    }

    // For wood items, dimensions are mandatory
    if (formData.type === 'wood' && (!formData.length || !formData.width || !formData.height)) {
      toast.error('Please provide dimensions for wood items');
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
    toast.success('Inventory item added successfully!');
  };

  const getStockBadge = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-600">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-amber-500">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-500">Out of Stock</Badge>;
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
          <h1 className="text-3xl font-semibold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Manage raw materials, finished goods, and trading items</p>
        </div>
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Item Name *</Label>
                <Input
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Type</Label>
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
                  <Label>Stock Status</Label>
                  <Select value={formData.stockStatus} onValueChange={(val: any) => setFormData({ ...formData, stockStatus: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
                <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
                <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleAddItem}>Add Item</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Formula Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-blue-900">Auto-Calculation Formula:</span>
            <code className="bg-white px-3 py-1 rounded border border-blue-200 text-blue-900">
              Volume (m³) = (Length × Width × Height × Quantity) ÷ 1,000,000
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Inventory Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as InventoryCategory)}>
        <TabsList>
          <TabsTrigger value="raw_materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="finished_goods">Finished Goods</TabsTrigger>
          <TabsTrigger value="trading_items">Trading Items</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab === 'raw_materials' && 'Raw Materials'}
                {selectedTab === 'finished_goods' && 'Finished Goods (Manufactured)'}
                {selectedTab === 'trading_items' && 'Trading Items (Resale)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Length (cm)</TableHead>
                    <TableHead className="text-right">Width (cm)</TableHead>
                    <TableHead className="text-right">Height (cm)</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right bg-blue-50">Volume (m³)</TableHead>
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
                  No items found in this category
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
            <CardTitle className="text-sm">Total Raw Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {inventory.filter((i) => i.category === 'raw_materials').reduce((sum, i) => sum + i.volume, 0).toFixed(2)} m³
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Finished Goods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {mockInventory.filter((i) => i.category === 'finished_goods').reduce((sum, i) => sum + i.volume, 0).toFixed(2)} m³
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Trading Items</CardTitle>
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

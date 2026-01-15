import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { InventoryItem } from '../types';
import { toast } from 'sonner';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  isEditing: boolean;
}

export function ItemFormDialog({ open, onOpenChange, item, isEditing }: ItemFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'raw_materials',
    type: 'wood',
    length: '',
    width: '',
    height: '',
    quantity: '',
    costPerUnit: '',
    stockStatus: 'in_stock'
  });

  useEffect(() => {
    if (item && isEditing) {
      setFormData({
        name: item.name,
        category: item.category,
        type: item.type,
        length: item.length.toString(),
        width: item.width.toString(),
        height: item.height.toString(),
        quantity: item.quantity.toString(),
        costPerUnit: item.costPerUnit.toString(),
        stockStatus: item.stockStatus
      });
    } else {
      setFormData({
        name: '',
        category: 'raw_materials',
        type: 'wood',
        length: '',
        width: '',
        height: '',
        quantity: '',
        costPerUnit: '',
        stockStatus: 'in_stock'
      });
    }
  }, [item, isEditing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    setShowSuccess(true);

    // Show success message
    toast.success(isEditing ? 'Item updated successfully!' : 'Item created successfully!');

    // Hide success state and close dialog after delay
    setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateVolume = () => {
    const l = parseFloat(formData.length) || 0;
    const w = parseFloat(formData.width) || 0;
    const h = parseFloat(formData.height) || 0;
    const q = parseFloat(formData.quantity) || 0;
    return ((l * w * h * q) / 1000000).toFixed(4);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update item information below' : 'Enter new item details below'}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-600">
              {isEditing ? 'Item Updated!' : 'Item Created!'}
            </h3>
            <p className="text-muted-foreground mt-2">Operation completed successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw_materials">Raw Materials</SelectItem>
                        <SelectItem value="finished_goods">Finished Goods</SelectItem>
                        <SelectItem value="trading_items">Trading Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wood">Wood</SelectItem>
                        <SelectItem value="ply">Ply</SelectItem>
                        <SelectItem value="raw">Raw</SelectItem>
                        <SelectItem value="spare_part">Spare Part</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="scrap">Scrap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stockStatus">Stock Status *</Label>
                    <Select value={formData.stockStatus} onValueChange={(value) => handleChange('stockStatus', value)}>
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
              </div>

              {/* Dimensions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Dimensions (cm)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm) *</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => handleChange('length', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm) *</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      value={formData.width}
                      onChange={(e) => handleChange('width', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Quantity and Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Quantity & Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPerUnit">Cost per Unit (AED) *</Label>
                    <Input
                      id="costPerUnit"
                      type="number"
                      step="0.01"
                      value={formData.costPerUnit}
                      onChange={(e) => handleChange('costPerUnit', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Auto-calculated Volume */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Total Volume (Auto-calculated)</p>
                    <p className="text-xs text-muted-foreground mt-1">Based on dimensions × quantity</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {calculateVolume()} m³
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update Item' : 'Create Item'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

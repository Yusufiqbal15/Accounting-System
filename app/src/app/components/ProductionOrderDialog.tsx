import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useState } from 'react';
import { Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mockBOMs, mockInventory } from '../mockData';

interface ProductionOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductionOrderDialog({ open, onOpenChange }: ProductionOrderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bomId: '',
    quantity: '',
    startDate: new Date().toISOString().split('T')[0],
    completionDate: ''
  });

  const [materials, setMaterials] = useState<Array<{
    itemId: string;
    itemName: string;
    quantityUsed: string;
    wastageQuantity: string;
    wastagePercentage: string;
  }>>([
    { itemId: '', itemName: '', quantityUsed: '', wastageQuantity: '', wastagePercentage: '' }
  ]);

  const handleAddMaterial = () => {
    setMaterials([...materials, { itemId: '', itemName: '', quantityUsed: '', wastageQuantity: '', wastagePercentage: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, field: string, value: string) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };

    // Auto-calculate wastage percentage
    if (field === 'quantityUsed' || field === 'wastageQuantity') {
      const used = parseFloat(updatedMaterials[index].quantityUsed) || 0;
      const waste = parseFloat(updatedMaterials[index].wastageQuantity) || 0;
      if (used > 0) {
        const percentage = (waste / used) * 100;
        updatedMaterials[index].wastagePercentage = percentage.toFixed(1);
      }
    }

    setMaterials(updatedMaterials);
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const item = mockInventory.find(i => i.id === itemId);
    if (item) {
      const updatedMaterials = [...materials];
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        itemId: item.id,
        itemName: item.name
      };
      setMaterials(updatedMaterials);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
    setShowSuccess(true);

    toast.success('Production order created successfully!');

    setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Production Order</DialogTitle>
          <DialogDescription>
            Enter production details with material wastage tracking
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-600">Order Created!</h3>
            <p className="text-muted-foreground mt-2">Production order and journal entry posted successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>BOM Template (Optional)</Label>
                    <Select value={formData.bomId} onValueChange={(value) => setFormData({ ...formData, bomId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select BOM" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockBOMs.map(bom => (
                          <SelectItem key={bom.id} value={bom.id}>{bom.productName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">Target Completion *</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={formData.completionDate}
                      onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Raw Materials with Wastage */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground">Raw Materials & Wastage</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </Button>
                </div>

                {materials.map((material, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Material #{index + 1}</span>
                      {materials.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Item *</Label>
                        <Select value={material.itemId} onValueChange={(value) => handleItemSelect(index, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockInventory.filter(i => i.category === 'raw_materials').map(item => (
                              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity Used *</Label>
                        <Input
                          type="number"
                          value={material.quantityUsed}
                          onChange={(e) => handleMaterialChange(index, 'quantityUsed', e.target.value)}
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Wastage Quantity</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={material.wastageQuantity}
                          onChange={(e) => handleMaterialChange(index, 'wastageQuantity', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Wastage %</Label>
                        <Input
                          type="text"
                          value={material.wastagePercentage}
                          readOnly
                          placeholder="Auto-calculated"
                          className="bg-muted"
                        />
                      </div>
                      {material.wastagePercentage && parseFloat(material.wastagePercentage) > 10 && (
                        <div className="flex items-end">
                          <div className="bg-red-100 border border-red-300 rounded px-2 py-1.5 text-xs text-red-700 font-medium">
                            ⚠️ High Wastage
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Wastage Impact Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Accounting Impact Preview</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  The following journal entry will be created automatically:
                </p>
                <div className="bg-white rounded p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Debit:</span>
                    <span className="font-medium">Production Waste / Scrap</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit:</span>
                    <span className="font-medium">Raw Material Inventory</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
                    Creating Order...
                  </>
                ) : (
                  'Create Production Order'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

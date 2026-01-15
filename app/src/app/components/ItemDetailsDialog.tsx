import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { InventoryItem } from '../types';
import { Package, Ruler, DollarSign, TrendingUp, Layers } from 'lucide-react';

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export function ItemDetailsDialog({ open, onOpenChange, item }: ItemDetailsDialogProps) {
  if (!item) return null;

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-600">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="destructive">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="secondary">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case 'raw_materials':
        return 'Raw Material';
      case 'finished_goods':
        return 'Finished Goods';
      case 'trading_items':
        return 'Trading Item';
      default:
        return category;
    }
  };

  const totalValue = item.costPerUnit * item.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-900" />
            Item Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {item.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {getStockStatusBadge(item.stockStatus)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Item Code</p>
                <p className="font-medium">{item.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{getCategoryDisplay(item.category)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{item.type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dimensions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="h-4 w-4 text-blue-900" />
              <h4 className="font-semibold">Dimensions</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Length</p>
                <p className="font-semibold text-lg">{item.length} cm</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Width</p>
                <p className="font-semibold text-lg">{item.width} cm</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Height</p>
                <p className="font-semibold text-lg">{item.height} cm</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stock Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-blue-900" />
              <h4 className="font-semibold">Stock Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-2xl font-bold text-blue-900">{item.quantity}</p>
                <p className="text-xs text-muted-foreground mt-1">units in stock</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-blue-900">{item.volume.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">cubic meters (m³)</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-blue-900" />
              <h4 className="font-semibold">Pricing & Valuation</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Cost per Unit</p>
                <p className="text-2xl font-bold text-green-600">AED {item.costPerUnit.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-green-600">AED {totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.quantity} units × AED {item.costPerUnit}</p>
              </div>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-900" />
              <h4 className="font-semibold text-sm">Calculations</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume per unit:</span>
                <span className="font-medium">{(item.volume / item.quantity).toFixed(6)} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost per m³:</span>
                <span className="font-medium">AED {(totalValue / item.volume).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

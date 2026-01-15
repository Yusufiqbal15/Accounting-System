import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertTriangle, FileText } from 'lucide-react';
import type { ProductionOrder } from '../types';

interface WastageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: ProductionOrder[];
}

export function WastageDetailsDialog({ open, onOpenChange, orders }: WastageDetailsDialogProps) {
  const totalWastageValue = orders.reduce((sum, order) => sum + order.totalWastageValue, 0);
  const totalMaterialCost = orders.reduce((sum, order) => 
    sum + order.rawMaterialsUsed.reduce((s, m) => s + m.cost, 0), 0
  );
  const averageWastagePercentage = (totalWastageValue / totalMaterialCost) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Production Waste Details</DialogTitle>
              <DialogDescription>
                Detailed breakdown of material wastage and financial impact
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Waste Value</p>
              <p className="text-2xl font-bold text-red-600">
                AED {totalWastageValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Material Cost</p>
              <p className="text-2xl font-bold text-blue-900">
                AED {totalMaterialCost.toLocaleString()}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Average Wastage %</p>
              <p className="text-2xl font-bold text-amber-600">
                {averageWastagePercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          <Separator />

          {/* Production Orders Breakdown */}
          {orders.map((order) => {
            const materialCost = order.rawMaterialsUsed.reduce((sum, m) => sum + m.cost, 0);
            const wastagePercentage = (order.totalWastageValue / materialCost) * 100;

            return (
              <div key={order.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Order: {order.id} | Quantity: {order.quantity} units
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.startDate).toLocaleDateString()} - {new Date(order.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={wastagePercentage > 10 ? 'destructive' : 'secondary'}>
                      {wastagePercentage.toFixed(1)}% Wastage
                    </Badge>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Qty Used</TableHead>
                      <TableHead className="text-right">Waste Qty</TableHead>
                      <TableHead className="text-right">Waste %</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Waste Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.rawMaterialsUsed.map((material, idx) => (
                      <TableRow 
                        key={idx} 
                        className={material.wastagePercentage > 10 ? 'bg-red-50' : ''}
                      >
                        <TableCell className="font-medium">{material.itemName}</TableCell>
                        <TableCell className="text-right">{material.quantityUsed}</TableCell>
                        <TableCell className="text-right">
                          {material.wastageQuantity > 0 ? (
                            <span className="text-red-600 font-medium">{material.wastageQuantity}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {material.wastagePercentage > 0 ? (
                            <span className={material.wastagePercentage > 10 ? 'text-red-600 font-bold' : 'text-amber-600'}>
                              {material.wastagePercentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0%</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          AED {(material.cost / material.quantityUsed).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {material.wastageValue > 0 ? (
                            <span className="text-red-600 font-semibold">
                              AED {material.wastageValue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-red-50 font-semibold">
                      <TableCell colSpan={5}>Total Wastage for this Order</TableCell>
                      <TableCell className="text-right text-red-600">
                        AED {order.totalWastageValue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Journal Entry Reference */}
                {order.journalEntryId && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-900" />
                      <div>
                        <p className="text-sm font-medium">Accounting Entry: {order.journalEntryId}</p>
                        <p className="text-xs text-muted-foreground">
                          Posted to Production Waste / Scrap account
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Posted</Badge>
                  </div>
                )}
              </div>
            );
          })}

          <Separator />

          {/* Financial Impact Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Financial Impact Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Material Cost:</span>
                <span className="font-medium">AED {totalMaterialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Wastage:</span>
                <span className="font-medium text-red-600">AED {totalWastageValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective Material Cost:</span>
                <span className="font-medium">AED {(totalMaterialCost - totalWastageValue).toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between pt-2">
                <span className="font-semibold">Wastage Percentage:</span>
                <span className="font-bold text-red-600">{averageWastagePercentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Recommendations
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Review cutting patterns and production processes for high-wastage materials</li>
              <li>• Implement quality checks before material cutting to reduce errors</li>
              <li>• Consider using wastage material for smaller production items</li>
              <li>• Set wastage thresholds and alerts for real-time monitoring</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

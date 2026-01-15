import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Package, 
  Users, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  FileText,
  Search
} from 'lucide-react';
import { mockProductionOrders, mockJournalEntries } from '../mockData';
import { useState } from 'react';
import { ProductionOrderDialog } from './ProductionOrderDialog';
import { JournalEntryPreviewDialog } from './JournalEntryPreviewDialog';

export function ProductionManagement() {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [journalPreviewOpen, setJournalPreviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockProductionOrders[0] | null>(null);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewJournal = (order: typeof mockProductionOrders[0]) => {
    setSelectedOrder(order);
    setSelectedJournalId(order.journalEntryId || null);
    setJournalPreviewOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'wip':
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalWastage = mockProductionOrders.reduce((sum, order) => sum + order.totalWastageValue, 0);
  const avgWastagePercentage = mockProductionOrders.reduce((sum, order) => {
    const totalMaterialCost = order.rawMaterialsUsed.reduce((s, m) => s + m.cost, 0);
    return sum + (order.totalWastageValue / totalMaterialCost) * 100;
  }, 0) / mockProductionOrders.length;

  const highWastageOrders = mockProductionOrders.filter(order => {
    const totalMaterialCost = order.rawMaterialsUsed.reduce((s, m) => s + m.cost, 0);
    const wastagePercentage = (order.totalWastageValue / totalMaterialCost) * 100;
    return wastagePercentage > 10; // Alert threshold
  });

  const filteredOrders = mockProductionOrders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Production Management</h1>
          <p className="text-muted-foreground mt-1">Production orders with waste tracking & accounting integration</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setOrderDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Production Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Orders</CardTitle>
            <Package className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{mockProductionOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockProductionOrders.filter(o => o.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Production Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {mockProductionOrders.reduce((sum, o) => sum + o.totalProductionCost, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Wastage</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-500">
              AED {totalWastage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {avgWastagePercentage.toFixed(1)}% of material cost
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">High Wastage Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">
              {highWastageOrders.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Orders exceeding 10% wastage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Orders and Wastage Analysis */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Production Orders</TabsTrigger>
          <TabsTrigger value="wastage">Wastage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {filteredOrders.length > 0 ? filteredOrders.map((order) => {
            const totalMaterialCost = order.rawMaterialsUsed.reduce((sum, m) => sum + m.cost, 0);
            const wastagePercentage = (order.totalWastageValue / totalMaterialCost) * 100;
            const isHighWastage = wastagePercentage > 10;

            return (
              <Card key={order.id} className={`border-l-4 ${isHighWastage ? 'border-l-red-500' : 'border-l-blue-900'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle>{order.productName}</CardTitle>
                        {getStatusBadge(order.status)}
                        {isHighWastage && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            High Wastage
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Order ID: {order.id} | Quantity: {order.quantity} units
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.startDate).toLocaleDateString()} - {new Date(order.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-blue-900">
                        AED {order.totalProductionCost.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Production Cost</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Raw Materials with Wastage */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Raw Materials & Wastage
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Used Qty</TableHead>
                          <TableHead className="text-right">Wastage Qty</TableHead>
                          <TableHead className="text-right">Wastage %</TableHead>
                          <TableHead className="text-right">Wastage Value</TableHead>
                          <TableHead className="text-right">Total Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.rawMaterialsUsed.map((material, idx) => (
                          <TableRow key={idx} className={material.wastagePercentage > 10 ? 'bg-red-50' : ''}>
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
                                <span className={material.wastagePercentage > 10 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                                  {material.wastagePercentage.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0%</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {material.wastageValue > 0 ? (
                                <span className="text-red-600 font-medium">AED {material.wastageValue.toLocaleString()}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              AED {material.cost.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Cost Breakdown with Wastage Highlight */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Material Cost</p>
                            <p className="text-lg font-semibold">
                              AED {totalMaterialCost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Wastage</p>
                            <p className="text-lg font-semibold text-red-600">
                              AED {order.totalWastageValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-red-600">{wastagePercentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Labor Cost</p>
                            <p className="text-lg font-semibold">AED {order.laborCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Overhead</p>
                            <p className="text-lg font-semibold">AED {order.overheadCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-900 text-white">
                      <CardContent className="pt-6">
                        <div>
                          <p className="text-xs opacity-80">Total Cost</p>
                          <p className="text-xl font-semibold mt-1">
                            AED {order.totalProductionCost.toLocaleString()}
                          </p>
                          {order.journalEntryId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 text-xs"
                              onClick={() => handleViewJournal(order)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View Journal
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Journal Entry Preview Link */}
                  {order.journalEntryId && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-900" />
                          <span className="text-sm font-medium">Accounting Entry</span>
                          <Badge variant="outline" className="text-xs">Auto-Posted</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewJournal(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Journal Entry
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Wastage of AED {order.totalWastageValue.toLocaleString()} posted to Production Waste/Scrap account
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }) : (
            <Card>
              <CardContent className="pt-6 text-center py-8 text-muted-foreground">
                No production orders found matching your search
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wastage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Wastage Analysis & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Material Cost</TableHead>
                    <TableHead className="text-right">Wastage Value</TableHead>
                    <TableHead className="text-right">Wastage %</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProductionOrders.map(order => {
                    const totalMaterialCost = order.rawMaterialsUsed.reduce((sum, m) => sum + m.cost, 0);
                    const wastagePercentage = (order.totalWastageValue / totalMaterialCost) * 100;
                    const isHighWastage = wastagePercentage > 10;

                    return (
                      <TableRow key={order.id} className={isHighWastage ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell className="text-right">AED {totalMaterialCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 font-medium">
                            AED {order.totalWastageValue.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={isHighWastage ? 'text-red-600 font-bold' : 'text-amber-600'}>
                            {wastagePercentage.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isHighWastage ? (
                            <Badge variant="destructive">High Wastage</Badge>
                          ) : wastagePercentage > 5 ? (
                            <Badge className="bg-amber-500">Moderate</Badge>
                          ) : (
                            <Badge className="bg-green-600">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductionOrderDialog 
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
      />
      <JournalEntryPreviewDialog
        open={journalPreviewOpen}
        onOpenChange={setJournalPreviewOpen}
        journalEntryId={selectedJournalId}
        productionOrder={selectedOrder}
      />
    </div>
  );
}

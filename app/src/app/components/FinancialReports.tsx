'use client';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  AlertTriangle,
  Package
} from 'lucide-react';
import { mockChartOfAccounts, mockProductionOrders, mockSales, mockPurchases } from '../mockData';
import { useState } from 'react';
import { WastageDetailsDialog } from './WastageDetailsDialog';

export function FinancialReports() {
  const { t } = useTranslation();
  const [wastageDialogOpen, setWastageDialogOpen] = useState(false);
  const [selectedWastageOrders, setSelectedWastageOrders] = useState<typeof mockProductionOrders>([]);

  // Calculate P&L Components
  const totalRevenue = mockChartOfAccounts.find(acc => acc.id === 'COA-4000')?.balance || 0;
  const salesRevenue = mockChartOfAccounts.find(acc => acc.id === 'COA-4100')?.balance || 0;
  const serviceRevenue = mockChartOfAccounts.find(acc => acc.id === 'COA-4200')?.balance || 0;

  const totalCOGS = mockChartOfAccounts.find(acc => acc.id === 'COA-5000')?.balance || 0;
  const materialCost = mockChartOfAccounts.find(acc => acc.id === 'COA-5100')?.balance || 0;
  const directLabor = mockChartOfAccounts.find(acc => acc.id === 'COA-5200')?.balance || 0;

  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMargin = (grossProfit / totalRevenue) * 100;

  const totalExpenses = mockChartOfAccounts.find(acc => acc.id === 'COA-6000')?.balance || 0;
  const productionExpenses = mockChartOfAccounts.find(acc => acc.id === 'COA-6100')?.balance || 0;
  const productionWaste = mockChartOfAccounts.find(acc => acc.id === 'COA-6110')?.balance || 0;
  const productionOverhead = mockChartOfAccounts.find(acc => acc.id === 'COA-6120')?.balance || 0;
  const operatingExpenses = mockChartOfAccounts.find(acc => acc.id === 'COA-6200')?.balance || 0;
  const shippingLogistics = mockChartOfAccounts.find(acc => acc.id === 'COA-6300')?.balance || 0;

  const netProfit = totalRevenue - totalCOGS - totalExpenses;
  const netProfitMargin = (netProfit / totalRevenue) * 100;

  // Inventory Analysis
  const rawMaterialInventory = mockChartOfAccounts.find(acc => acc.id === 'COA-1140')?.balance || 0;
  const finishedGoodsInventory = mockChartOfAccounts.find(acc => acc.id === 'COA-1141')?.balance || 0;
  const totalInventory = rawMaterialInventory + finishedGoodsInventory;

  // Wastage Impact
  const totalWastageValue = mockProductionOrders.reduce((sum, order) => sum + order.totalWastageValue, 0);
  const wastageAsPercentOfRevenue = (productionWaste / totalRevenue) * 100;
  const wastageAsPercentOfCOGS = (productionWaste / totalCOGS) * 100;

  const handleViewWastageDetails = () => {
    setSelectedWastageOrders(mockProductionOrders.filter(o => o.totalWastageValue > 0));
    setWastageDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive P&L and inventory analysis with waste accounting</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net Margin: {netProfitMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Gross Profit</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-900">
              AED {grossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Margin: {grossProfitMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Production Waste</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-500">
              AED {productionWaste.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {wastageAsPercentOfRevenue.toFixed(1)}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Net Profit</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">After all expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Reports */}
      <Tabs defaultValue="pl">
        <TabsList>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="wastage">Wastage Analysis</TabsTrigger>
        </TabsList>

        {/* Profit & Loss Report */}
        <TabsContent value="pl" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Period: January 2026 | With Production Waste Accounting
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Revenue Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Revenue</h3>
                  <Badge className="bg-green-600">Income</Badge>
                </div>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="pl-8">Sales Revenue</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {salesRevenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">Service Revenue</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {serviceRevenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-green-50 font-semibold">
                      <TableCell>Total Revenue</TableCell>
                      <TableCell className="text-right text-green-600">
                        AED {totalRevenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Cost of Goods Sold */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Cost of Goods Sold (COGS)</h3>
                  <Badge variant="secondary">Direct Costs</Badge>
                </div>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="pl-8">Material Cost</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {materialCost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">Direct Labor</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {directLabor.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-red-50 font-semibold">
                      <TableCell>Total COGS</TableCell>
                      <TableCell className="text-right text-red-600">
                        AED {totalCOGS.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Gross Profit</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900">
                      AED {grossProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Margin: {grossProfitMargin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Operating Expenses with Waste Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Operating Expenses</h3>
                  <Badge variant="destructive">Expenses</Badge>
                </div>
                <Table>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-semibold">Production Expenses</TableCell>
                      <TableCell className="text-right font-semibold">
                        AED {productionExpenses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={handleViewWastageDetails}>
                      <TableCell className="pl-12 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Production Waste / Scrap
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        AED {productionWaste.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-12">Production Overhead</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {productionOverhead.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Operating Expenses</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {operatingExpenses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Shipping & Logistics</TableCell>
                      <TableCell className="text-right font-medium">
                        AED {shippingLogistics.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-red-50 font-semibold">
                      <TableCell>Total Operating Expenses</TableCell>
                      <TableCell className="text-right text-red-600">
                        AED {totalExpenses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-6" />

              {/* Net Profit */}
              <div className={`rounded-lg p-6 ${netProfit >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl">Net Profit</h3>
                    <p className="text-sm text-muted-foreground mt-1">After all expenses</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      AED {netProfit.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Net Margin: {netProfitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Waste Impact Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold">Production Waste Impact on P&L</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Waste</p>
                    <p className="text-lg font-semibold text-red-600">
                      AED {productionWaste.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">% of Revenue</p>
                    <p className="text-lg font-semibold text-red-600">
                      {wastageAsPercentOfRevenue.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">% of COGS</p>
                    <p className="text-lg font-semibold text-red-600">
                      {wastageAsPercentOfCOGS.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Reducing waste by 50% would increase net profit by AED {(productionWaste / 2).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Report</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current inventory status with waste impact
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inventory Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Raw Materials</p>
                        <p className="text-xl font-bold text-blue-900">
                          AED {rawMaterialInventory.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Finished Goods</p>
                        <p className="text-xl font-bold text-green-600">
                          AED {finishedGoodsInventory.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900 text-white">
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-xs opacity-80">Total Inventory</p>
                      <p className="text-xl font-bold mt-1">
                        AED {totalInventory.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Waste Impact on Inventory */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold">Waste Impact on Inventory</h4>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Waste Quantity</TableHead>
                      <TableHead className="text-right">Waste Value</TableHead>
                      <TableHead className="text-right">Inventory Reduction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>January 2026</TableCell>
                      <TableCell className="text-right">
                        {mockProductionOrders.reduce((sum, o) => 
                          sum + o.rawMaterialsUsed.reduce((s, m) => s + m.wastageQuantity, 0), 0
                        )} units
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        AED {totalWastageValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        -{((totalWastageValue / rawMaterialInventory) * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-muted-foreground">
                💡 Material wastage directly reduces raw material inventory value through automated journal entries
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wastage Analysis Tab */}
        <TabsContent value="wastage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Detailed Wastage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Material Cost</TableHead>
                    <TableHead className="text-right">Wastage Value</TableHead>
                    <TableHead className="text-right">Wastage %</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProductionOrders.filter(o => o.totalWastageValue > 0).map(order => {
                    const materialCost = order.rawMaterialsUsed.reduce((sum, m) => sum + m.cost, 0);
                    const wastagePercentage = (order.totalWastageValue / materialCost) * 100;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell>{new Date(order.startDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">AED {materialCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          AED {order.totalWastageValue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={wastagePercentage > 10 ? 'destructive' : 'secondary'}>
                            {wastagePercentage.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedWastageOrders([order]);
                            setWastageDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Wastage Details Dialog */}
      <WastageDetailsDialog
        open={wastageDialogOpen}
        onOpenChange={setWastageDialogOpen}
        orders={selectedWastageOrders}
      />
    </div>
  );
}

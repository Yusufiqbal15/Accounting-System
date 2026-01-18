'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTranslation } from 'react-i18next';
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
import { ProductionOrderDialog } from './ProductionOrderDialog';
import { JournalEntryPreviewDialog } from './JournalEntryPreviewDialog';

export function ProductionManagement() {
  const { t, i18n } = useTranslation();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [journalPreviewOpen, setJournalPreviewOpen] = useState(false);

  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);
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
        return <Badge className="bg-green-600">{t('common.completed')}</Badge>;
      case 'wip':
        return <Badge className="bg-blue-600">{t('productionManagement.inProgress')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('productionManagement.pending')}</Badge>;
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
          <h1 className="text-3xl font-semibold">{t('productionManagement.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('productionManagement.subtitle')}</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setOrderDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('productionManagement.newProductionOrder')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('productionManagement.totalOrders')}</CardTitle>
            <Package className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{mockProductionOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockProductionOrders.filter(o => o.status === 'completed').length} {t('common.completed')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('productionManagement.productionValue')}</CardTitle>
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
            <CardTitle className="text-sm">{t('productionManagement.totalWastage')}</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-500">
              AED {totalWastage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('productionManagement.avgWastage')} {avgWastagePercentage.toFixed(1)}% {t('productionManagement.ofMaterialCost')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('productionManagement.highWastageAlerts')}</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">
              {highWastageOrders.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('productionManagement.ordersExceeding10Percent')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Orders and Wastage Analysis */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">{t('productionManagement.productionOrders')}</TabsTrigger>
          <TabsTrigger value="wastage">{t('productionManagement.wastageAnalysis')}</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('productionManagement.searchPlaceholder')}
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
                            {t('productionManagement.highWastage')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('productionManagement.orderID')}: {order.id} | {t('productionManagement.quantity')}: {order.quantity} {t('common.units')}
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
                      {t('productionManagement.rawMaterialsWastage')}
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('productionManagement.material')}</TableHead>
                          <TableHead className="text-right">{t('productionManagement.usedQty')}</TableHead>
                          <TableHead className="text-right">{t('productionManagement.wastageQty')}</TableHead>
                          <TableHead className="text-right">{t('productionManagement.wastagePercent')}</TableHead>
                          <TableHead className="text-right">{t('productionManagement.wastageValue')}</TableHead>
                          <TableHead className="text-right">{t('productionManagement.totalCost')}</TableHead>
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
                            <p className="text-xs text-muted-foreground">{t('productionManagement.materialCost')}</p>
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
                            <p className="text-xs text-muted-foreground">{t('productionManagement.wastage')}</p>
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
                            <p className="text-xs text-muted-foreground">{t('productionManagement.laborCost')}</p>
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
                            <p className="text-xs text-muted-foreground">{t('productionManagement.overhead')}</p>
                            <p className="text-lg font-semibold">AED {order.overheadCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-900 text-white">
                      <CardContent className="pt-6">
                        <div>
                          <p className="text-xs opacity-80">{t('productionManagement.totalCost')}</p>
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
                              {t('productionManagement.viewJournal')}
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
                          <span className="text-sm font-medium">{t('productionManagement.accountingEntry')}</span>
                          <Badge variant="outline" className="text-xs">{t('productionManagement.autoPosted')}</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewJournal(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {t('productionManagement.viewJournalEntry')}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('productionManagement.wastageLabel')} AED {order.totalWastageValue.toLocaleString()} {t('productionManagement.postedTo')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }) : (
            <Card>
              <CardContent className="pt-6 text-center py-8 text-muted-foreground">
                {t('common.noData')}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wastage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {t('productionManagement.wastageAnalysisAlerts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('productionManagement.orderID')}</TableHead>
                    <TableHead>{t('productionManagement.product')}</TableHead>
                    <TableHead className="text-right">{t('productionManagement.materialCost')}</TableHead>
                    <TableHead className="text-right">{t('productionManagement.wastageValue')}</TableHead>
                    <TableHead className="text-right">{t('productionManagement.wastagePercent')}</TableHead>
                    <TableHead className="text-center">{t('common.status')}</TableHead>
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
                            <Badge variant="destructive">{t('productionManagement.highWastage')}</Badge>
                          ) : wastagePercentage > 5 ? (
                            <Badge className="bg-amber-500">{t('productionManagement.moderate')}</Badge>
                          ) : (
                            <Badge className="bg-green-600">{t('productionManagement.normal')}</Badge>
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

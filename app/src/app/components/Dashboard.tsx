'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  ClipboardList,
  AlertCircle,
  Building2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { mockDashboardStats, mockMonthlySalesData, mockProfitTrendData, mockStockConsumptionData } from '../mockData';

const COLORS = ['#1e3a8a', '#16a34a', '#f59e0b'];

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const stats = mockDashboardStats;

  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.welcome')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.inventory')}</CardTitle>
            <Package className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalStock.toFixed(2)} m³</div>
            <p className="text-xs text-muted-foreground mt-1">{t('common.loading')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalPurchases')}</CardTitle>
            <ShoppingCart className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('reports.fromDate')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalSales')}</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('reports.fromDate')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.netProfit')}</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {stats.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.currentPeriod')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.workOrdersWIP')}</CardTitle>
            <ClipboardList className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.workOrdersInProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.inProgress')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.outstandingReceivables')}</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.outstandingCustomerPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.fromCustomers')}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.outstandingPayables')}</CardTitle>
            <Building2 className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.outstandingSupplierPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('dashboard.toSuppliers')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales & Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.monthlySalesVsPurchases')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('dashboard.last7MonthsComparison')}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMonthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#16a34a" name={t('dashboard.sales')} />
                <Bar dataKey="purchases" fill="#ef4444" name={t('dashboard.purchases')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.profitTrend')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('dashboard.monthlyProfitOverTime')}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockProfitTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  name={t('dashboard.profit')}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Consumption */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.stockByCategory')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('dashboard.currentVolumeDistribution')}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockStockConsumptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry.category}: ${entry.volume} m³`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="volume"
                >
                  {mockStockConsumptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">{t('dashboard.totalMaterialCost')}</span>
              <span className="font-semibold">AED 22,500</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">{t('dashboard.totalLaborCost')}</span>
              <span className="font-semibold">AED 1,700</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">{t('dashboard.totalOverhead')}</span>
              <span className="font-semibold">AED 500</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">{t('dashboard.vatCollected')}</span>
              <span className="font-semibold text-green-600">AED 1,226.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('dashboard.vatPaid')}</span>
              <span className="font-semibold text-red-500">AED 1,550</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

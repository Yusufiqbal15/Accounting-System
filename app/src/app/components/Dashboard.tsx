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
  const stats = mockDashboardStats;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your manufacturing control center</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.totalStock.toFixed(2)} m³</div>
            <p className="text-xs text-muted-foreground mt-1">Current inventory volume</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {stats.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders (WIP)</CardTitle>
            <ClipboardList className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.workOrdersInProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Receivables</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.outstandingCustomerPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From customers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payables</CardTitle>
            <Building2 className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED {stats.outstandingSupplierPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">To suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales & Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales vs Purchases</CardTitle>
            <p className="text-sm text-muted-foreground">Last 7 months comparison (AED)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMonthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#16a34a" name="Sales" />
                <Bar dataKey="purchases" fill="#ef4444" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly profit over time (AED)</p>
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
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Consumption */}
        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
            <p className="text-sm text-muted-foreground">Current volume distribution (m³)</p>
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
            <CardTitle>Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">Total Material Cost</span>
              <span className="font-semibold">AED 22,500</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">Total Labor Cost</span>
              <span className="font-semibold">AED 1,700</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">Total Overhead</span>
              <span className="font-semibold">AED 500</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-muted-foreground">VAT Collected</span>
              <span className="font-semibold text-green-600">AED 1,226.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">VAT Paid</span>
              <span className="font-semibold text-red-500">AED 1,550</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

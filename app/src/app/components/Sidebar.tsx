import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Factory, 
  ClipboardList,
  Wrench,
  Users,
  Building2,
  Calculator,
  FileText,
  Receipt,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from './ui/utils';

export type NavigationPage = 
  | 'dashboard' 
  | 'inventory'
  | 'items'
  | 'purchases' 
  | 'sales' 
  | 'production' 
  | 'production-mgmt'
  | 'work-orders'
  | 'repairs'
  | 'customers'
  | 'suppliers'
  | 'accounting'
  | 'reports'
  | 'financial-reports'
  | 'vat'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory' as NavigationPage, label: 'Inventory', icon: Package },
  { id: 'items' as NavigationPage, label: 'Items Management', icon: Package },
  { id: 'purchases' as NavigationPage, label: 'Purchases', icon: ShoppingCart },
  { id: 'sales' as NavigationPage, label: 'Sales', icon: TrendingUp },
  { id: 'production' as NavigationPage, label: 'Production/BOM', icon: Factory },
  { id: 'production-mgmt' as NavigationPage, label: 'Production Orders', icon: Factory },
  { id: 'work-orders' as NavigationPage, label: 'Work Orders', icon: ClipboardList },
  { id: 'repairs' as NavigationPage, label: 'Repairs & Maintenance', icon: Wrench },
  { id: 'customers' as NavigationPage, label: 'Customers (CRM)', icon: Users },
  { id: 'suppliers' as NavigationPage, label: 'Suppliers', icon: Building2 },
  { id: 'accounting' as NavigationPage, label: 'Accounting', icon: Calculator },
  { id: 'reports' as NavigationPage, label: 'Reports', icon: FileText },
  { id: 'financial-reports' as NavigationPage, label: 'Financial Reports', icon: FileText },
  { id: 'vat' as NavigationPage, label: 'VAT (UAE)', icon: Receipt },
  { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white flex flex-col shadow-xl">
      {/* Logo and Header */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
            <Factory className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Manufacturing ERP</h1>
            <p className="text-xs text-blue-300">Wood & Production</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
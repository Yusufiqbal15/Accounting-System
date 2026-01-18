'use client';

import React from 'react';
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
  LogOut,
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from './ui/button';
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

const getNavItems = (t: any) => [
  { id: 'dashboard' as NavigationPage, label: t('nav.dashboard'), icon: LayoutDashboard },
  { id: 'inventory' as NavigationPage, label: t('nav.inventory'), icon: Package },
  { id: 'items' as NavigationPage, label: t('nav.items'), icon: Package },
  { id: 'purchases' as NavigationPage, label: t('nav.purchases'), icon: ShoppingCart },
  { id: 'sales' as NavigationPage, label: t('nav.sales'), icon: TrendingUp },
  { id: 'production' as NavigationPage, label: t('nav.production'), icon: Factory },
  { id: 'production-mgmt' as NavigationPage, label: t('nav.productionMgmt'), icon: Factory },
  { id: 'work-orders' as NavigationPage, label: t('nav.workOrders'), icon: ClipboardList },
  { id: 'repairs' as NavigationPage, label: t('nav.repairs'), icon: Wrench },
  { id: 'customers' as NavigationPage, label: t('nav.customers'), icon: Users },
  { id: 'suppliers' as NavigationPage, label: t('nav.suppliers'), icon: Building2 },
  { id: 'accounting' as NavigationPage, label: t('nav.accounting'), icon: Calculator },
  { id: 'reports' as NavigationPage, label: t('nav.reports'), icon: FileText },
  { id: 'financial-reports' as NavigationPage, label: t('nav.financialReports'), icon: FileText },
  { id: 'vat' as NavigationPage, label: t('nav.vat'), icon: Receipt },
  { id: 'settings' as NavigationPage, label: t('nav.settings'), icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const navItems = getNavItems(t);
  
  // Re-calculate navItems when language changes
  React.useEffect(() => {
    // Force re-render when language changes
  }, [i18n.language]);

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

      {/* Language Switcher */}
      <div className="px-4 py-3 border-b border-blue-800">
        <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
          <Globe className="h-4 w-4" />
          {t('language.english')}
        </div>
        <div className="flex gap-2">
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('en')}
            className="flex-1 text-xs"
          >
            EN
          </Button>
          <Button
            variant={language === 'ar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('ar')}
            className="flex-1 text-xs"
          >
            {t('language.arabic')}
          </Button>
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
          <span className="text-sm">{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );
}
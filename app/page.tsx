'use client';

import { useState } from 'react';
import { LoginScreen } from './src/app/components/LoginScreen';
import { Sidebar, type NavigationPage } from './src/app/components/Sidebar';
import { Dashboard } from './src/app/components/Dashboard';
import { InventoryManagement } from './src/app/components/InventoryManagement';
import { ItemsManagement } from './src/app/components/ItemsManagement';
import { PurchaseModule } from './src/app/components/PurchaseModule';
import { SalesModule } from './src/app/components/SalesModule';
import { ProductionBOM } from './src/app/components/ProductionBOM';
import { ProductionManagement } from './src/app/components/ProductionManagement';
import { WorkOrders } from './src/app/components/WorkOrders';
import { RepairMaintenance } from './src/app/components/RepairMaintenance';
import { CustomerManagement } from './src/app/components/CustomerManagement';
import { SupplierManagement } from './src/app/components/SupplierManagement';
import { AccountingModule } from './src/app/components/AccountingModule';
import { ReportsScreen } from './src/app/components/ReportsScreen';
import { FinancialReports } from './src/app/components/FinancialReports';
import { VATModule } from './src/app/components/VATModule';
import { SettingsScreen } from './src/app/components/SettingsScreen';
import { Toaster } from './src/app/components/ui/sonner';
import { mockCustomers } from './src/app/mockData';
import type { Customer } from './src/app/types';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryManagement />;
      case 'items':
        return <ItemsManagement />;
      case 'purchases':
        return <PurchaseModule />;
      case 'sales':
        return <SalesModule customers={customers} setCustomers={setCustomers} />;
      case 'production':
        return <ProductionBOM />;
      case 'production-mgmt':
        return <ProductionManagement />;
      case 'work-orders':
        return <WorkOrders />;
      case 'repairs':
        return <RepairMaintenance />;
      case 'customers':
        return <CustomerManagement customers={customers} setCustomers={setCustomers} />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'accounting':
        return <AccountingModule />;
      case 'reports':
        return <ReportsScreen />;
      case 'financial-reports':
        return <FinancialReports />;
      case 'vat':
        return <VATModule />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={() => setIsLoggedIn(false)}
      />
      <main className="flex-1 overflow-y-auto bg-background">
        {renderPage()}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

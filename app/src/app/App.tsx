import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar, type NavigationPage } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InventoryManagement } from './components/InventoryManagement';
import { ItemsManagement } from './components/ItemsManagement';
import { PurchaseModule } from './components/PurchaseModule';
import { SalesModule } from './components/SalesModule';
import { ProductionBOM } from './components/ProductionBOM';
import { ProductionManagement } from './components/ProductionManagement';
import { WorkOrders } from './components/WorkOrders';
import { RepairMaintenance } from './components/RepairMaintenance';
import { CustomerManagement } from './components/CustomerManagement';
import { SupplierManagement } from './components/SupplierManagement';
import { AccountingModule } from './components/AccountingModule';
import { ReportsScreen } from './components/ReportsScreen';
import { FinancialReports } from './components/FinancialReports';
import { VATModule } from './components/VATModule';
import { SettingsScreen } from './components/SettingsScreen';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');

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
        return <SalesModule />;
      case 'production':
        return <ProductionBOM />;
      case 'production-mgmt':
        return <ProductionManagement />;
      case 'work-orders':
        return <WorkOrders />;
      case 'repairs':
        return <RepairMaintenance />;
      case 'customers':
        return <CustomerManagement />;
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
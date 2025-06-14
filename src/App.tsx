import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { BusinessManagement } from './components/Business/BusinessManagement';
import { CashbookManagement } from './components/Cashbook/CashbookManagement';
import { TransferManagement } from './components/Transfer/TransferManagement';
import { CustomerManagement } from './components/Customer/CustomerManagement';
import { DueRegister } from './components/Due/DueRegister';
import { ProductCatalog } from './components/Product/ProductCatalog';
import { PurchaseManagement } from './components/Purchase/PurchaseManagement';
import { StockManagement } from './components/Stock/StockManagement';
import { SalesManagement } from './components/Sales/SalesManagement';
import { ReportsAnalytics } from './components/Reports/ReportsAnalytics';
import { AdminPanel } from './components/Admin/AdminPanel';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'businesses':
        return <BusinessManagement />;
      case 'cashbook':
        return <CashbookManagement />;
      case 'transfers':
        return <TransferManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'dues':
        return <DueRegister />;
      case 'products':
        return <ProductCatalog />;
      case 'purchases':
        return <PurchaseManagement />;
      case 'stock':
        return <StockManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
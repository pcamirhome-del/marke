
import React, { useState } from 'react';
import { useStore } from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import CompaniesPage from './pages/Companies';
import InvoicesPage from './pages/Invoices';
import InventoryPage from './pages/Inventory';
import SalesPage from './pages/Sales';
import AdminPage from './pages/Admin';
import StockPage from './pages/Stock';
import BarcodePrintingPage from './pages/BarcodePrinting';

const App: React.FC = () => {
  const store = useStore();
  const { state, logout } = store;
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isRTL, setIsRTL] = useState(true);

  // Simple Router based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard store={store} setCurrentPage={setCurrentPage} />;
      case 'companies': return <CompaniesPage store={store} />;
      case 'invoices': return <InvoicesPage store={store} />;
      case 'inventory': return <InventoryPage store={store} />;
      case 'sales': return <SalesPage store={store} />;
      case 'admin': return <AdminPage store={store} />;
      case 'stock': return <StockPage store={store} />;
      case 'barcode-printing': return <BarcodePrintingPage store={store} />;
      case 'create-order': return <InvoicesPage store={store} defaultCreate={true} />;
      default: return <Dashboard store={store} setCurrentPage={setCurrentPage} />;
    }
  };

  if (!state.currentUser) {
    return <Login store={store} />;
  }

  return (
    <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
      <Layout 
        currentUser={state.currentUser} 
        logout={logout} 
        setCurrentPage={setCurrentPage} 
        currentPage={currentPage}
        isRTL={isRTL}
        setIsRTL={setIsRTL}
        settings={state.settings}
      >
        {renderPage()}
      </Layout>
    </div>
  );
};

export default App;

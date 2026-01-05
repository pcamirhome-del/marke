
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Printer, 
  Building2, 
  ClipboardList, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Languages,
  Barcode
} from 'lucide-react';
import { User, AppSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  logout: () => void;
  setCurrentPage: (page: string) => void;
  currentPage: string;
  isRTL: boolean;
  setIsRTL: (val: boolean) => void;
  settings: AppSettings;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  logout, 
  setCurrentPage, 
  currentPage,
  isRTL,
  setIsRTL,
  settings
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'create-order', label: 'إنشاء طلب', icon: ShoppingCart, permission: 'createOrder' },
    { id: 'stock', label: 'حالة المخزون', icon: Package, permission: 'stock' },
    { id: 'barcode-printing', label: 'طباعة الباركود', icon: Barcode, permission: 'barcodePrinting' },
    { id: 'companies', label: 'إدارة الموردين', icon: Building2, permission: 'companies' },
    { id: 'inventory', label: 'جرد البضائع', icon: ClipboardList, permission: 'inventory' },
    { id: 'sales', label: 'تقارير الأداء', icon: TrendingUp, permission: 'sales' },
    { id: 'admin', label: 'إعدادات النظام', icon: Settings, permission: 'admin' },
  ];

  const filteredItems = menuItems.filter(item => {
    const permKey = item.permission as keyof typeof currentUser.permissions;
    return currentUser.role === 'admin' || currentUser.permissions[permKey];
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-indigo-700 text-white p-4 flex justify-between items-center no-print">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg">{settings.appName}</span>
        <div className="w-6"></div>
      </div>

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 no-print ${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-indigo-800">
            <h1 className="text-xl font-bold">{settings.appName}</h1>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 space-x-3 hover:bg-indigo-800 transition-colors flex-row-reverse space-x-reverse ${
                  currentPage === item.id ? 'bg-indigo-800 border-r-4 border-white' : ''
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-indigo-800">
            <button 
              onClick={() => setIsRTL(!isRTL)}
              className="w-full flex items-center px-4 py-2 mb-2 text-indigo-200 hover:text-white transition-colors flex-row-reverse space-x-reverse"
            >
              <Languages size={18} />
              <span>{isRTL ? 'English' : 'العربية'}</span>
            </button>
            <div className="flex items-center mb-4 px-2 flex-row-reverse space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden text-right">
                <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-indigo-400 capitalize">{currentUser.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center px-4 py-2 bg-indigo-800 rounded-lg hover:bg-red-600 transition-colors flex-row-reverse space-x-reverse"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

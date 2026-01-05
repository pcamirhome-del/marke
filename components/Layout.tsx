
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
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

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-x-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-indigo-700 text-white p-4 flex justify-between items-center no-print sticky top-0 z-40 shadow-lg">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(!sidebarOpen);
          }}
          className="p-2 hover:bg-indigo-600 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-lg truncate px-2">{settings.appName}</span>
        <div className="w-10"></div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-72 bg-indigo-900 text-white transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 no-print shadow-2xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-indigo-800/50">
            <h1 className="text-xl font-bold truncate ml-2">{settings.appName}</h1>
            <button className="md:hidden p-1 hover:bg-indigo-800 rounded" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all flex-row-reverse space-x-reverse ${
                  currentPage === item.id 
                    ? 'bg-white text-indigo-900 shadow-lg font-bold' 
                    : 'text-indigo-100 hover:bg-indigo-800'
                }`}
              >
                <item.icon size={22} className={currentPage === item.id ? 'text-indigo-600' : ''} />
                <span className="text-base mr-3">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-indigo-800/50 bg-indigo-950/30">
            <button 
              onClick={() => setIsRTL(!isRTL)}
              className="w-full flex items-center px-4 py-2.5 mb-3 text-indigo-200 hover:text-white transition-colors flex-row-reverse space-x-reverse border border-indigo-800 rounded-lg"
            >
              <Languages size={18} />
              <span className="text-sm mr-2">{isRTL ? 'English' : 'العربية'}</span>
            </button>
            
            <div className="flex items-center mb-4 px-2 flex-row-reverse space-x-reverse">
              <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-indigo-400 flex items-center justify-center text-sm font-bold shadow-inner">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden text-right mr-3">
                <p className="text-sm font-bold truncate leading-none mb-1">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-400 uppercase tracking-tighter">{currentUser.role === 'admin' ? 'مدير كامل الصلاحيات' : 'موظف مبيعات'}</p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all flex-row-reverse space-x-reverse group"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="font-bold mr-2">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50 flex flex-col">
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

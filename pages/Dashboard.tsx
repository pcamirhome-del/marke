
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  TrendingUp, 
  Package, 
  AlertCircle, 
  FileText,
  ShoppingCart,
  Building2,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  store: ReturnType<typeof useStore>;
  setCurrentPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ store, setCurrentPage }) => {
  const { state } = store;
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toLocaleDateString();
  const todayInvoices = state.invoices.filter(inv => new Date(inv.date).toLocaleDateString() === todayStr);
  const totalSalesToday = todayInvoices.reduce((acc, inv) => acc + inv.totalValue, 0);
  const totalStockItems = state.products.length;
  const lowStockItems = state.products.filter(p => p.quantity < 10).length;
  const pendingInvoices = state.invoices.filter(inv => inv.status !== 'Paid').length;

  const dayName = dateTime.toLocaleDateString('ar-EG', { weekday: 'long' });
  const dateStr = dateTime.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });

  const stats = [
    { 
      label: 'مبيعات اليوم', 
      value: `${totalSalesToday.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'bg-emerald-100 text-emerald-600',
      id: 'sales'
    },
    { 
      label: 'إجمالي المنتجات', 
      value: totalStockItems, 
      icon: Package, 
      color: 'bg-blue-100 text-blue-600',
      id: 'stock'
    },
    { 
      label: 'نواقص المخزون', 
      value: lowStockItems, 
      icon: AlertCircle, 
      color: 'bg-rose-100 text-rose-600',
      id: 'inventory'
    },
    { 
      label: 'فواتير معلقة', 
      value: pendingInvoices, 
      icon: FileText, 
      color: 'bg-amber-100 text-amber-600',
      id: 'invoices'
    },
  ];

  return (
    <div className="text-right space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">أهلاً بك في نظام {state.settings.appName}</p>
        </div>
        
        {/* Clock & Date Widget - Improved for Mobile */}
        <div className="w-full lg:w-auto bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between md:justify-end md:space-x-6 md:space-x-reverse">
          <div className="flex items-center space-x-3 space-x-reverse text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Calendar size={22} />
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{dayName}</div>
              <div className="text-sm font-black whitespace-nowrap">{dateStr}</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-100"></div>
          <div className="flex items-center space-x-3 space-x-reverse text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Clock size={22} />
            </div>
            <div className="text-xl md:text-2xl font-black font-mono tracking-tighter">{timeStr}</div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setCurrentPage(stat.id === 'invoices' ? 'invoices' : stat.id)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center lg:items-end lg:flex-row-reverse cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className={`p-4 rounded-xl mb-3 lg:mb-0 lg:ml-4 bg-opacity-10 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div className="text-center lg:text-right">
              <p className="text-xs text-gray-500 font-bold mb-1">{stat.label}</p>
              <h3 className="text-xl md:text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-black mb-6 border-r-4 border-indigo-600 pr-3 leading-none">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentPage('create-order')}
              className="group p-5 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold flex flex-col items-center justify-center space-y-3 shadow-sm"
            >
              <ShoppingCart size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">طلب جديد</span>
            </button>
            <button 
              onClick={() => setCurrentPage('stock')}
              className="group p-5 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-bold flex flex-col items-center justify-center space-y-3 shadow-sm"
            >
              <Package size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">المخزون</span>
            </button>
            <button 
              onClick={() => setCurrentPage('companies')}
              className="group p-5 bg-purple-50 text-purple-700 rounded-2xl hover:bg-purple-600 hover:text-white transition-all font-bold flex flex-col items-center justify-center space-y-3 shadow-sm"
            >
              <Building2 size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">الموردين</span>
            </button>
            <button 
              onClick={() => setCurrentPage('sales')}
              className="group p-5 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-600 hover:text-white transition-all font-bold flex flex-col items-center justify-center space-y-3 shadow-sm"
            >
              <TrendingUp size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">التقارير</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setCurrentPage('invoices')}
              className="text-xs font-bold text-indigo-600 flex items-center hover:translate-x-[-4px] transition-transform"
            >
              <ArrowRight size={14} className="ml-1 rotate-180" />
              عرض الكل
            </button>
            <h2 className="text-lg font-black border-r-4 border-indigo-600 pr-3 leading-none">أحدث العمليات</h2>
          </div>
          
          <div className="table-container">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-4 pr-4">المعرف</th>
                  <th className="pb-4">المورد</th>
                  <th className="pb-4 text-center">المبلغ</th>
                  <th className="pb-4 text-left pl-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {state.invoices.slice(-6).reverse().map(inv => {
                  const company = state.companies.find(c => c.id === inv.companyId);
                  const statusMap: Record<string, {label: string, class: string}> = {
                    'Paid': {label: 'مدفوعة', class: 'bg-emerald-100 text-emerald-700'},
                    'Partial': {label: 'جزئية', class: 'bg-amber-100 text-amber-700'},
                    'Pending': {label: 'معلقة', class: 'bg-rose-100 text-rose-700'}
                  };
                  const status = statusMap[inv.status] || {label: inv.status, class: 'bg-gray-100 text-gray-700'};
                  return (
                    <tr key={inv.id} className="text-sm hover:bg-gray-50 transition-colors group">
                      <td className="py-4 pr-4 font-black text-gray-400 group-hover:text-indigo-600">#{inv.id}</td>
                      <td className="py-4 font-bold">{company?.name || '---'}</td>
                      <td className="py-4 text-center font-black">${inv.totalValue.toFixed(2)}</td>
                      <td className="py-4 text-left pl-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {state.invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 italic">لا توجد عمليات مسجلة حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

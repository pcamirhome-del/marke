
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
  Clock
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
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'إجمالي المنتجات', 
      value: totalStockItems, 
      icon: Package, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'نواقص المخزون', 
      value: lowStockItems, 
      icon: AlertCircle, 
      color: 'bg-red-100 text-red-600' 
    },
    { 
      label: 'فواتير غير مدفوعة', 
      value: pendingInvoices, 
      icon: FileText, 
      color: 'bg-amber-100 text-amber-600' 
    },
  ];

  return (
    <div className="text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">نظام {state.settings.appName}</h1>
          <p className="text-gray-500">مرحباً بك مجدداً في لوحة التحكم</p>
        </div>
        
        {/* Clock & Date Widget */}
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse text-indigo-600">
            <Calendar size={20} />
            <div className="text-right">
              <div className="text-xs text-gray-400 font-bold">{dayName}</div>
              <div className="text-sm font-bold">{dateStr}</div>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-100"></div>
          <div className="flex items-center space-x-2 space-x-reverse text-indigo-600">
            <Clock size={20} />
            <div className="text-2xl font-black font-mono">{timeStr}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center flex-row-reverse">
            <div className={`p-4 rounded-lg ml-4 bg-opacity-10 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setCurrentPage('create-order')}
              className="p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex flex-col items-center justify-center space-y-2"
            >
              <ShoppingCart size={24} />
              <span>إنشاء طلب جديد</span>
            </button>
            <button 
              onClick={() => setCurrentPage('stock')}
              className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium flex flex-col items-center justify-center space-y-2"
            >
              <Package size={24} />
              <span>فحص المخزون</span>
            </button>
            <button 
              onClick={() => setCurrentPage('companies')}
              className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium flex flex-col items-center justify-center space-y-2"
            >
              <Building2 size={24} />
              <span>إضافة مورد</span>
            </button>
            <button 
              onClick={() => setCurrentPage('sales')}
              className="p-4 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium flex flex-col items-center justify-center space-y-2"
            >
              <TrendingUp size={24} />
              <span>تقارير المبيعات</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">آخر العمليات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-gray-400 text-xs font-medium uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pr-4">رقم الفاتورة</th>
                  <th className="pb-3">الشركة الموردة</th>
                  <th className="pb-3">المبلغ الإجمالي</th>
                  <th className="pb-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {state.invoices.slice(-5).reverse().map(inv => {
                  const company = state.companies.find(c => c.id === inv.companyId);
                  const statusMap: Record<string, string> = {
                    'Paid': 'مدفوعة',
                    'Partial': 'جزئية',
                    'Pending': 'معلقة'
                  };
                  return (
                    <tr key={inv.id} className="text-sm">
                      <td className="py-3 font-medium pr-4">#{inv.id}</td>
                      <td className="py-3">{company?.name || 'غير معروف'}</td>
                      <td className="py-3 font-semibold">${inv.totalValue.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                          inv.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {statusMap[inv.status] || inv.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {state.invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">لا توجد عمليات مسجلة</td>
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

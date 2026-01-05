
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

const SalesPage: React.FC<{ store: any }> = ({ store }) => {
  const { state } = store;
  const [filter, setFilter] = useState<'day' | 'month' | 'year' | 'total'>('day');

  const today = new Date().toLocaleDateString();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredInvoices = state.invoices.filter((inv: any) => {
    const invDate = new Date(inv.date);
    if (filter === 'day') return invDate.toLocaleDateString() === today;
    if (filter === 'month') return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    if (filter === 'year') return invDate.getFullYear() === currentYear;
    return true; // total
  });

  const totalSales = filteredInvoices.reduce((acc: number, inv: any) => acc + inv.totalValue, 0);
  const totalPaid = filteredInvoices.reduce((acc: number, inv: any) => acc + inv.paidAmount, 0);
  const totalOutstanding = totalSales - totalPaid;

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
      const fullDateStr = d.toLocaleDateString();
      const dailyTotal = state.invoices
        .filter((inv: any) => new Date(inv.date).toLocaleDateString() === fullDateStr)
        .reduce((acc: number, inv: any) => acc + inv.totalValue, 0);
      days.push({ name: dateStr, value: dailyTotal });
    }
    return days;
  }, [state.invoices]);

  return (
    <div className="text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-row-reverse">
        <h1 className="text-2xl font-bold">تقارير وتحليلات المبيعات</h1>
        
        <div className="bg-white border p-1 rounded-xl flex shadow-sm flex-row-reverse">
          {(['day', 'month', 'year', 'total'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f === 'day' ? 'اليوم' : 
               f === 'month' ? 'الشهر الحالي' : 
               f === 'year' ? 'السنة الحالية' : 'إجمالي المبيعات'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4 flex-row-reverse">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl ml-3">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-bold text-gray-500">إجمالي قيمة الفواتير</h3>
          </div>
          <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4 flex-row-reverse">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl ml-3">
              <DollarSign size={24} />
            </div>
            <h3 className="font-bold text-gray-500">المبالغ المدفوعة</h3>
          </div>
          <p className="text-3xl font-bold">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4 flex-row-reverse">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl ml-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-gray-500">إجمالي المديونية</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold mb-6">اتجاه المبيعات (آخر 7 أيام)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis orientation="right" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'right' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;

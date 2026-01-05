
import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Camera, Package } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';

const StockPage: React.FC<{ store: any }> = ({ store }) => {
  const { state } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const filteredProducts = state.products.filter((p: any) => {
    const s = searchTerm.toLowerCase();
    const company = state.companies.find((c: any) => c.id === p.companyId);
    return p.name.toLowerCase().includes(s) || 
           p.barcode.includes(s) || 
           company?.name.toLowerCase().includes(s);
  });

  const handleScan = (barcode: string) => {
    setSearchTerm(barcode);
    setShowScanner(false);
  };

  return (
    <div className="max-w-6xl mx-auto text-right">
      <div className="flex justify-between items-center mb-6 flex-row-reverse">
        <h1 className="text-2xl font-bold">حالة المخزون</h1>
        <button 
          onClick={() => setShowScanner(true)}
          className="flex items-center space-x-2 flex-row-reverse bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Camera size={20} className="ml-2" />
          <span>مسح الباركود للكشف</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ابحث بالاسم، الباركود، أو المورد..."
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-xs font-medium uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4">الباركود</th>
              <th className="px-6 py-4">اسم المنتج</th>
              <th className="px-6 py-4">المورد</th>
              <th className="px-6 py-4">الكمية</th>
              <th className="px-6 py-4">سعر الجملة</th>
              <th className="px-6 py-4">سعر البيع المقترح</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p: any) => {
              const company = state.companies.find((c: any) => c.id === p.companyId);
              const sellingPrice = p.wholesalePrice * (1 + state.settings.profitMargin / 100);
              return (
                <tr key={p.barcode} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{p.barcode}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{p.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{company?.name || 'غير معروف'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                      p.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">${p.wholesalePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">${sellingPrice.toFixed(2)}</td>
                </tr>
              )
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>لا توجد منتجات مطابقة لعملية البحث</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default StockPage;

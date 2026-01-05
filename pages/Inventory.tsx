
import React, { useState } from 'react';
import { useStore } from '../store';
import { Search, Edit3, Save } from 'lucide-react';

const InventoryPage: React.FC<{ store: any }> = ({ store }) => {
  const { state, updateProductStock } = store;
  const [editingBarcode, setEditingBarcode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [search, setSearch] = useState('');

  const filtered = state.products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  const handleUpdate = (barcode: string) => {
    const product = state.products.find((p: any) => p.barcode === barcode);
    if (product) {
      updateProductStock(barcode, editValue - product.quantity);
      setEditingBarcode(null);
    }
  };

  return (
    <div className="text-right">
      <h1 className="text-2xl font-bold mb-6">جرد وتحديث المخزون</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ابحث عن منتج بالاسم أو الباركود لعمل جرد..."
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-xs font-medium uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4">الباركود</th>
              <th className="px-6 py-4">اسم المنتج</th>
              <th className="px-6 py-4 text-center">الكمية الحالية</th>
              <th className="px-6 py-4 text-left">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p: any) => (
              <tr key={p.barcode} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono">{p.barcode}</td>
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4 text-center">
                  {editingBarcode === p.barcode ? (
                    <input 
                      type="number"
                      className="w-24 px-2 py-1 border rounded focus:ring-1 focus:ring-indigo-500 text-center"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      autoFocus
                    />
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.quantity}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-left">
                  {editingBarcode === p.barcode ? (
                    <button 
                      onClick={() => handleUpdate(p.barcode)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                    >
                      <Save size={16} className="ml-1" />
                      <span>تحديث</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setEditingBarcode(p.barcode); setEditValue(p.quantity); }}
                      className="text-gray-500 hover:text-indigo-600 flex items-center space-x-1"
                    >
                      <Edit3 size={16} className="ml-1" />
                      <span>تعديل يدوي</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;

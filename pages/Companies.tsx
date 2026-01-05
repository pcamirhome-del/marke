
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Building2, Phone, MapPin, Package, X, Hash } from 'lucide-react';

const CompaniesPage: React.FC<{ store: any }> = ({ store }) => {
  const { state, addCompany, addProduct } = store;
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  
  const [newCompany, setNewCompany] = useState({ name: '', phone: '', address: '' });
  const [newProduct, setNewProduct] = useState({ barcode: '', name: '', wholesalePrice: 0, quantity: 0, category: '', unit: '' });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany(newCompany);
    setNewCompany({ name: '', phone: '', address: '' });
    setShowCompanyModal(false);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    addProduct({
      ...newProduct,
      companyId: selectedCompanyId,
      wholesalePrice: Number(newProduct.wholesalePrice),
      quantity: Number(newProduct.quantity)
    });
    setNewProduct({ barcode: '', name: '', wholesalePrice: 0, quantity: 0, category: '', unit: '' });
    setShowProductModal(false);
  };

  return (
    <div className="text-right">
      <div className="flex justify-between items-center mb-6 flex-row-reverse">
        <h1 className="text-2xl font-bold">إدارة الشركات والمنتجات</h1>
        <div className="flex space-x-2 flex-row-reverse">
           <button 
            onClick={() => setShowCompanyModal(true)}
            className="flex items-center space-x-2 flex-row-reverse bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} className="ml-2" />
            <span>إضافة شركة موردة</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold flex items-center flex-row-reverse">
              <Building2 size={18} className="text-indigo-600 ml-2" />
              <span>الشركات المسجلة</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {state.companies.map((company: any) => (
                <div 
                  key={company.id} 
                  className={`p-4 hover:bg-indigo-50 cursor-pointer transition-colors text-right ${selectedCompanyId === company.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div className="flex justify-between items-center flex-row-reverse">
                    <div className="font-bold text-gray-800">{company.name}</div>
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded flex items-center">
                      <Hash size={10} className="ml-0.5" /> {company.code}
                    </span>
                  </div>
                  <div className="flex items-center flex-row-reverse text-xs text-gray-500 mt-1">
                    <Phone size={12} className="ml-1" />
                    <span>{company.phone}</span>
                    <MapPin size={12} className="ml-1 mr-2" />
                    <span>{company.address}</span>
                  </div>
                </div>
              ))}
              {state.companies.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  لم يتم إضافة شركات موردة بعد
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCompanyId ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center flex-row-reverse">
                <div className="font-bold flex items-center flex-row-reverse">
                  <Package size={18} className="text-indigo-600 ml-2" />
                  <span>منتجات الشركة المختارة</span>
                </div>
                <button 
                  onClick={() => setShowProductModal(true)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  + إضافة منتج جديد
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-gray-400 text-xs font-medium uppercase border-b border-gray-100">
                      <th className="px-6 py-3">الباركود</th>
                      <th className="px-6 py-3">الاسم</th>
                      <th className="px-6 py-3">سعر الجملة</th>
                      <th className="px-6 py-3">الكمية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {state.products.filter((p: any) => p.companyId === selectedCompanyId).map((p: any) => (
                      <tr key={p.barcode} className="text-sm">
                        <td className="px-6 py-3 font-mono">{p.barcode}</td>
                        <td className="px-6 py-3 font-medium">{p.name}</td>
                        <td className="px-6 py-3">${p.wholesalePrice.toFixed(2)}</td>
                        <td className="px-6 py-3 font-bold">{p.quantity} {p.unit}</td>
                      </tr>
                    ))}
                    {state.products.filter((p: any) => p.companyId === selectedCompanyId).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-gray-500">
                          لا توجد منتجات مسجلة لهذه الشركة حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
              <Building2 size={48} className="mb-4 opacity-20" />
              <p>يرجى اختيار شركة من القائمة لعرض منتجاتها</p>
            </div>
          )}
        </div>
      </div>

      {showCompanyModal && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-right">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-bold">إضافة شركة جديدة</h2>
              <button onClick={() => setShowCompanyModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                حفظ الشركة
              </button>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-right">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-bold">إضافة منتج للشركة</h2>
              <button onClick={() => setShowProductModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg text-right" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="اختياري" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg text-right" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} placeholder="كجم، قطعة..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية الافتتاحية</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر الجملة</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-right" value={newProduct.wholesalePrice} onChange={e => setNewProduct({...newProduct, wholesalePrice: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                تأكيد الإضافة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;

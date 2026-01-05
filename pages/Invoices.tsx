
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  Receipt, 
  Printer, 
  Trash2, 
  AlertTriangle,
  X,
  CreditCard,
  Building2,
  Package,
  Send,
  MessageCircle
} from 'lucide-react';
import { InvoiceItem } from '../types';

interface InvoicesPageProps {
  store: any;
  defaultCreate?: boolean;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({ store, defaultCreate = false }) => {
  const { state, addInvoice, addInstallment, deleteInvoice, addCompany } = store;

  const [showOrderModal, setShowOrderModal] = useState(defaultCreate);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waTarget, setWaTarget] = useState({ name: '', phone: '' });
  
  // Create Order Form State
  const [orderCompanyId, setOrderCompanyId] = useState('');
  const [orderItems, setOrderItems] = useState<InvoiceItem[]>([]);
  const [orderPaidAmount, setOrderPaidAmount] = useState(0);
  const [orderIsReceived, setOrderIsReceived] = useState(false);
  
  // Inline Add States
  const [newItem, setNewItem] = useState({ barcode: '', quantity: 1, name: '', wholesalePrice: 0 });
  const [showInlineCompanyModal, setShowInlineCompanyModal] = useState(false);
  const [inlineCompany, setInlineCompany] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (defaultCreate) setShowOrderModal(true);
  }, [defaultCreate]);

  // Logic: Check for outstanding balance when selecting company
  useEffect(() => {
    if (orderCompanyId) {
      const pending = state.invoices.find((inv: any) => inv.companyId === orderCompanyId && inv.status !== 'Paid');
      if (pending) {
        setShowWarning(true);
      }
    }
  }, [orderCompanyId, state.invoices]);

  const handleAddItem = () => {
    const sellingPrice = newItem.wholesalePrice * (1 + state.settings.profitMargin / 100);
    const itemToAdd: InvoiceItem = {
      barcode: newItem.barcode || `AUTO-${Date.now()}`,
      name: newItem.name,
      quantity: newItem.quantity,
      wholesalePrice: newItem.wholesalePrice,
      sellingPrice: sellingPrice
    };
    setOrderItems([...orderItems, itemToAdd]);
    setNewItem({ barcode: '', quantity: 1, name: '', wholesalePrice: 0 });
  };

  const calculateTotal = () => orderItems.reduce((acc, item) => acc + (item.wholesalePrice * item.quantity), 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCompanyId || orderItems.length === 0) return;
    addInvoice({
      companyId: orderCompanyId,
      date: new Date().toISOString(),
      items: orderItems,
      totalValue: calculateTotal(),
      paidAmount: Number(orderPaidAmount),
      installments: [],
      isReceived: orderIsReceived
    });
    setOrderCompanyId('');
    setOrderItems([]);
    setOrderPaidAmount(0);
    setOrderIsReceived(false);
    setShowOrderModal(false);
  };

  const handleAddInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || installmentAmount <= 0) return;
    addInstallment(selectedInvoice.id, Number(installmentAmount));
    setShowInstallmentModal(false);
    setInstallmentAmount(0);
  };

  const [installmentAmount, setInstallmentAmount] = useState(0);

  const handlePrint = (invoice: any) => {
    const company = state.companies.find((c: any) => c.id === invoice.companyId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl">
        <head>
          <title>فاتورة رقم #${invoice.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
            body { font-family: 'Noto Sans Arabic', sans-serif; padding: 40px; text-align: right; color: #333; }
            .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; position: relative; }
            .header h1 { color: #4f46e5; margin: 0; font-size: 28px; }
            .header .inv-no { position: absolute; left: 0; top: 0; font-size: 20px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item { background: #f9fafb; padding: 15px; border-radius: 8px; }
            .info-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
            .info-value { font-weight: bold; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 12px; text-align: right; }
            td { border-bottom: 1px solid #e5e7eb; padding: 12px; }
            .footer { margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .totals-box { width: 250px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .grand-total { border-top: 1px solid #333; padding-top: 8px; font-weight: bold; font-size: 18px; color: #4f46e5; }
            .signature { border-top: 1px dashed #333; width: 150px; text-align: center; padding-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${state.settings.appName}</h1>
            <div class="inv-no">#${invoice.id}</div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">المورد</div>
              <div class="info-value">${company?.name || 'غير معروف'} (كود: ${company?.code || '---'})</div>
            </div>
            <div class="info-item">
              <div class="info-label">التاريخ</div>
              <div class="info-value">${new Date(invoice.date).toLocaleDateString('ar-EG')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">تاريخ الاستحقاق</div>
              <div class="info-value">${new Date(invoice.expiryDate).toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr><th>الصنف</th><th>الباركود</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
            </thead>
            <tbody>
              ${invoice.items.map((item: any) => `
                <tr><td>${item.name}</td><td>${item.barcode}</td><td>${item.quantity}</td><td>$${item.wholesalePrice.toFixed(2)}</td><td>$${(item.wholesalePrice * item.quantity).toFixed(2)}</td></tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div class="signature">إمضاء المدير المسئول</div>
            <div class="totals-box">
              <div class="total-row"><span>الإجمالي قبل السداد:</span><span>$${invoice.totalValue.toFixed(2)}</span></div>
              <div class="total-row"><span>المبلغ المسدد:</span><span>$${invoice.paidAmount.toFixed(2)}</span></div>
              <div class="total-row grand-total"><span>المبلغ المتبقي:</span><span>$${(invoice.totalValue - invoice.paidAmount).toFixed(2)}</span></div>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleWhatsAppSend = (invoice: any) => {
    const message = `*فاتورة من ${state.settings.appName}*%0A` +
      `مرحباً ${waTarget.name}%0A` +
      `رقم الفاتورة: #${invoice.id}%0A` +
      `الإجمالي: $${invoice.totalValue.toFixed(2)}%0A` +
      `المبلغ المتبقي: $${(invoice.totalValue - invoice.paidAmount).toFixed(2)}%0A` +
      `شكراً لتعاملكم معنا.`;
    
    const phone = waTarget.phone.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    setShowWhatsAppModal(false);
  };

  const openWhatsAppModal = (invoice: any) => {
    const company = state.companies.find((c: any) => c.id === invoice.companyId);
    setSelectedInvoice(invoice);
    setWaTarget({ name: company?.name || '', phone: company?.phone || '' });
    setShowWhatsAppModal(true);
  };

  return (
    <div className="text-right">
      <div className="flex justify-between items-center mb-6 flex-row-reverse">
        <h1 className="text-2xl font-bold">إدارة الفواتير والمشتريات</h1>
        <button 
          onClick={() => setShowOrderModal(true)}
          className="flex items-center space-x-2 flex-row-reverse bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} className="ml-2" />
          <span>إنشاء فاتورة جديدة</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-medium uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">المورد (كود)</th>
                <th className="px-6 py-4 text-center">التاريخ</th>
                <th className="px-6 py-4">القيمة</th>
                <th className="px-6 py-4">المتبقي</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.invoices.slice().reverse().map((inv: any) => {
                const company = state.companies.find((c: any) => c.id === inv.companyId);
                const remaining = inv.totalValue - inv.paidAmount;
                const statusMap: Record<string, string> = { 'Paid': 'مدفوعة', 'Partial': 'جزئية', 'Pending': 'معلقة' };
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">#{inv.id}</td>
                    <td className="px-6 py-4 font-medium">
                      {company?.name || 'غير معروف'}
                      {company && <span className="text-xs text-indigo-500 mr-1 bg-indigo-50 px-1 rounded">({company.code})</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm text-center">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold">${inv.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-red-600 font-medium">${remaining.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {statusMap[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handlePrint(inv)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Printer size={18} /></button>
                        <button onClick={() => openWhatsAppModal(inv)} className="p-1.5 text-gray-400 hover:text-green-600"><MessageCircle size={18} /></button>
                        {inv.status !== 'Paid' && <button onClick={() => { setSelectedInvoice(inv); setShowInstallmentModal(true); }} className="p-1.5 text-gray-400 hover:text-green-600"><Plus size={18} /></button>}
                        {state.currentUser?.role === 'admin' && <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[120] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden text-right">
            <div className="p-6 bg-green-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-lg font-bold flex items-center flex-row-reverse">
                <MessageCircle size={20} className="ml-2" />
                <span>إرسال عبر واتساب</span>
              </h2>
              <button onClick={() => setShowWhatsAppModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم المستلم</label>
                <input 
                  type="text" className="w-full px-4 py-2 border rounded-xl text-right"
                  value={waTarget.name} onChange={e => setWaTarget({...waTarget, name: e.target.value})}
                  placeholder="اسم الشخص أو المورد"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">رقم الواتساب</label>
                <input 
                  type="text" className="w-full px-4 py-2 border rounded-xl text-center font-bold"
                  value={waTarget.phone} onChange={e => setWaTarget({...waTarget, phone: e.target.value})}
                  placeholder="966XXXXXXXXX"
                />
              </div>
              <button 
                onClick={() => handleWhatsAppSend(selectedInvoice)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 space-x-reverse"
              >
                <Send size={18} />
                <span>إرسال الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col text-right">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0 flex-row-reverse">
              <h2 className="text-xl font-bold flex items-center flex-row-reverse">
                <Receipt className="ml-2" />
                <span>إنشاء فاتورة مشتريات</span>
              </h2>
              <button onClick={() => setShowOrderModal(false)}><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                  <div className="flex space-x-2 flex-row-reverse">
                    <select 
                      className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-right font-bold focus:border-indigo-600"
                      value={orderCompanyId}
                      onChange={e => setOrderCompanyId(e.target.value)}
                    >
                      <option value="">-- اختر مورد --</option>
                      {state.companies.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <button onClick={() => setShowInlineCompanyModal(true)} className="p-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 mr-2"><Plus size={24} /></button>
                  </div>
                </div>
                <div className="flex items-center flex-row-reverse cursor-pointer mt-6">
                  <input type="checkbox" className="w-6 h-6 text-indigo-600 rounded-lg ml-3" checked={orderIsReceived} onChange={e => setOrderIsReceived(e.target.checked)} />
                  <span className="text-sm font-bold text-gray-700">تم استلام البضاعة فوراً؟</span>
                </div>
              </div>

              {orderCompanyId && (
                <div className="bg-indigo-50 p-6 rounded-2xl mb-8 border-2 border-indigo-100">
                  <h3 className="font-bold flex items-center flex-row-reverse mb-4"><Package className="ml-2 text-indigo-600" size={18} /><span>إضافة أصناف</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-row-reverse">
                    <input placeholder="اسم الصنف" className="w-full px-4 py-2 border rounded-lg text-right" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    <input type="number" placeholder="الكمية" className="w-full px-4 py-2 border rounded-lg text-right" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                    <input type="number" placeholder="سعر الجملة" className="w-full px-4 py-2 border rounded-lg text-right" value={newItem.wholesalePrice} onChange={e => setNewItem({...newItem, wholesalePrice: Number(e.target.value)})} />
                    <button onClick={handleAddItem} className="bg-indigo-600 text-white rounded-lg font-bold py-2">أضف للجدول</button>
                  </div>
                </div>
              )}

              <div className="mb-6">
                 <table className="w-full text-right border-collapse">
                  <thead className="bg-gray-100">
                    <tr><th className="py-3 pr-4 rounded-tr-xl">الصنف</th><th className="py-3 text-center">الكمية</th><th className="py-3 text-center">سعر الوحدة</th><th className="py-3 text-center">الإجمالي</th><th className="py-3 text-left pl-4 rounded-tl-xl">حذف</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {orderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-4 pr-4"><div className="font-bold text-gray-800">{item.name}</div><div className="text-xs text-gray-400">باركود: {item.barcode}</div></td>
                        <td className="py-4 text-center font-bold">{item.quantity}</td>
                        <td className="py-4 text-center">$ {item.wholesalePrice.toFixed(2)}</td>
                        <td className="py-4 text-center font-bold text-indigo-600">$ {(item.wholesalePrice * item.quantity).toFixed(2)}</td>
                        <td className="py-4 text-left pl-4"><button onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                 </table>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t shrink-0">
              <div className="flex justify-between items-center mb-6 flex-row-reverse">
                <div className="text-right">
                   <div className="text-gray-500 text-sm mb-1 font-bold uppercase tracking-widest">إجمالي الفاتورة</div>
                   <div className="text-4xl font-bold text-indigo-600">$ {calculateTotal().toFixed(2)}</div>
                </div>
                <div className="w-64">
                  <label className="block text-sm font-bold text-gray-600 mb-2">المسدد الآن</label>
                  <input type="number" className="w-full px-4 py-3 bg-white border-2 border-indigo-200 rounded-xl text-2xl font-bold text-green-600 text-center" value={orderPaidAmount} onChange={e => setOrderPaidAmount(Number(e.target.value))} />
                </div>
              </div>
              <button onClick={handleSubmitOrder} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-green-700 shadow-xl">حفظ وإصدار الفاتورة</button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Add Company */}
      {showInlineCompanyModal && (
        <div className="fixed inset-0 z-[110] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden text-right">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-lg font-bold">إضافة مورد سريع</h2>
              <button onClick={() => setShowInlineCompanyModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input placeholder="اسم الشركة" className="w-full px-4 py-2 border rounded-lg text-right" value={inlineCompany.name} onChange={e => setInlineCompany({...inlineCompany, name: e.target.value})} />
              <input placeholder="رقم الهاتف" className="w-full px-4 py-2 border rounded-lg text-right" value={inlineCompany.phone} onChange={e => setInlineCompany({...inlineCompany, phone: e.target.value})} />
              <button onClick={() => { addCompany(inlineCompany); setShowInlineCompanyModal(false); setInlineCompany({name:'', phone:'', address:''}); }} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">تأكيد الإضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;

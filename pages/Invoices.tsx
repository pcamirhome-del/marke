
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
  MessageCircle,
  Search
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
  const [searchTerm, setSearchTerm] = useState('');
  
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
    if (!newItem.name || newItem.wholesalePrice <= 0) return;
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

  const filteredInvoices = state.invoices.filter((inv: any) => {
    const company = state.companies.find((c: any) => c.id === inv.companyId);
    return inv.id.toString().includes(searchTerm) || company?.name.includes(searchTerm);
  });

  return (
    <div className="text-right space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-none">الفواتير والمشتريات</h1>
        <button 
          onClick={() => setShowOrderModal(true)}
          className="w-full md:w-auto flex items-center justify-center bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold flex-row-reverse space-x-reverse"
        >
          <Plus size={20} className="ml-2" />
          <span>إنشاء فاتورة جديدة</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
        <Search className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="ابحث برقم الفاتورة أو اسم المورد..." 
          className="w-full pr-12 pl-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="table-container">
          <table className="w-full text-right whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">المورد (كود)</th>
                <th className="px-6 py-4 text-center">التاريخ</th>
                <th className="px-6 py-4">القيمة</th>
                <th className="px-6 py-4">المتبقي</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.slice().reverse().map((inv: any) => {
                const company = state.companies.find((c: any) => c.id === inv.companyId);
                const remaining = inv.totalValue - inv.paidAmount;
                const statusMap: Record<string, {label: string, class: string}> = { 
                  'Paid': {label: 'مدفوعة', class: 'bg-emerald-100 text-emerald-700'}, 
                  'Partial': {label: 'جزئية', class: 'bg-amber-100 text-amber-700'}, 
                  'Pending': {label: 'معلقة', class: 'bg-rose-100 text-rose-700'} 
                };
                const status = statusMap[inv.status] || {label: inv.status, class: 'bg-gray-100 text-gray-700'};
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 font-black text-gray-400 group-hover:text-indigo-600">#{inv.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{company?.name || '---'}</div>
                      {company && <span className="text-[10px] text-indigo-500 font-black">كود: {company.code}</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm text-center">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-black">${inv.totalValue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-rose-600 font-black">${remaining.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handlePrint(inv)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Printer size={18} /></button>
                        <button onClick={() => openWhatsAppModal(inv)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><MessageCircle size={18} /></button>
                        {inv.status !== 'Paid' && <button onClick={() => { setSelectedInvoice(inv); setShowInstallmentModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Plus size={18} /></button>}
                        {state.currentUser?.role === 'admin' && <button onClick={() => { if(confirm('حذف الفاتورة؟')) deleteInvoice(inv.id); }} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic font-bold">لم يتم العثور على فواتير</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden text-right shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-lg font-black flex items-center flex-row-reverse">
                <MessageCircle size={22} className="ml-2" />
                <span>إرسال عبر واتساب</span>
              </h2>
              <button onClick={() => setShowWhatsAppModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">اسم المستلم</label>
                <input 
                  type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-right font-bold"
                  value={waTarget.name} onChange={e => setWaTarget({...waTarget, name: e.target.value})}
                  placeholder="الاسم"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-1">رقم الواتساب</label>
                <input 
                  type="text" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-center font-black text-lg tracking-widest"
                  value={waTarget.phone} onChange={e => setWaTarget({...waTarget, phone: e.target.value})}
                  placeholder="966XXXXXXXXX"
                />
              </div>
              <button 
                onClick={() => handleWhatsAppSend(selectedInvoice)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors"
              >
                <Send size={20} />
                <span>إرسال الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col text-right animate-in slide-in-from-bottom duration-300">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0 flex-row-reverse">
              <h2 className="text-xl font-black flex items-center flex-row-reverse">
                <Receipt className="ml-3" size={24} />
                <span>فاتورة مشتريات جديدة</span>
              </h2>
              <button onClick={() => setShowOrderModal(false)} className="hover:rotate-90 transition-transform"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase block pr-1">اختر المورد</label>
                  <div className="flex space-x-2 flex-row-reverse">
                    <select 
                      className="flex-1 px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-right font-black focus:ring-2 focus:ring-indigo-500"
                      value={orderCompanyId}
                      onChange={e => setOrderCompanyId(e.target.value)}
                    >
                      <option value="">-- اضغط للاختيار --</option>
                      {state.companies.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => setShowInlineCompanyModal(true)} 
                      className="p-3.5 bg-indigo-100 text-indigo-700 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all mr-2"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center flex-row-reverse cursor-pointer md:mt-6 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <input type="checkbox" className="w-6 h-6 text-indigo-600 rounded-lg ml-3 border-none focus:ring-offset-0 focus:ring-transparent" checked={orderIsReceived} onChange={e => setOrderIsReceived(e.target.checked)} />
                  <span className="text-sm font-black text-indigo-900">استلام البضاعة وإضافتها للمخزن فوراً</span>
                </div>
              </div>

              {orderCompanyId && (
                <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-inner space-y-6">
                  <h3 className="font-black flex items-center flex-row-reverse text-indigo-600 border-b border-indigo-50 pb-4">
                    <Package className="ml-2" size={20} />
                    <span>إضافة أصناف للفاتورة</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-row-reverse">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 pr-1">اسم الصنف</label>
                      <input placeholder="مثال: حليب المراعي" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-right font-bold" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 pr-1">الكمية</label>
                      <input type="number" placeholder="0" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-center font-black" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 pr-1">سعر الجملة ($)</label>
                      <input type="number" placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-center font-black" value={newItem.wholesalePrice} onChange={e => setNewItem({...newItem, wholesalePrice: Number(e.target.value)})} />
                    </div>
                    <div className="flex items-end">
                      <button onClick={handleAddItem} className="w-full bg-indigo-600 text-white rounded-xl font-black py-3.5 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">إضافة بند</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                 <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest pr-1">جدول الأصناف المضافة</h3>
                 <div className="table-container bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                   <table className="w-full text-right border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50">
                      <tr className="text-[10px] font-black uppercase text-gray-400">
                        <th className="py-4 pr-6">الصنف</th>
                        <th className="py-4 text-center">الكمية</th>
                        <th className="py-4 text-center">سعر الوحدة</th>
                        <th className="py-4 text-center">الإجمالي</th>
                        <th className="py-4 text-left pl-6">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-5 pr-6">
                            <div className="font-black text-gray-800">{item.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">#{item.barcode}</div>
                          </td>
                          <td className="py-5 text-center font-black">{item.quantity}</td>
                          <td className="py-5 text-center font-bold text-gray-500">$ {item.wholesalePrice.toFixed(2)}</td>
                          <td className="py-5 text-center font-black text-indigo-600">$ {(item.wholesalePrice * item.quantity).toFixed(2)}</td>
                          <td className="py-5 text-left pl-6">
                            <button onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orderItems.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-gray-300 font-bold italic">لا توجد أصناف في الفاتورة بعد</td>
                        </tr>
                      )}
                    </tbody>
                   </table>
                 </div>
              </div>
            </div>

            <div className="p-6 md:p-10 bg-gray-50 border-t shrink-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 flex-row-reverse">
                <div className="text-right w-full md:w-auto">
                   <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">المبلغ الإجمالي الكلي</div>
                   <div className="text-5xl font-black text-indigo-600 tabular-nums">$ {calculateTotal().toFixed(2)}</div>
                </div>
                <div className="w-full md:w-72 space-y-2">
                  <label className="block text-xs font-black text-gray-400 uppercase pr-1">المبلغ المسدد نقداً</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-5 bg-white border-none rounded-3xl text-3xl font-black text-emerald-600 text-center shadow-inner focus:ring-4 focus:ring-emerald-100"
                    value={orderPaidAmount}
                    onChange={e => setOrderPaidAmount(Number(e.target.value))}
                  />
                </div>
              </div>
              <button 
                onClick={handleSubmitOrder} 
                disabled={orderItems.length === 0 || !orderCompanyId}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                تأكيد وحفظ الفاتورة النهائية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Add Company */}
      {showInlineCompanyModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden text-right shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-lg font-black">إضافة مورد سريع</h2>
              <button onClick={() => setShowInlineCompanyModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase pr-1">اسم المورد</label>
                <input placeholder="الاسم" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-right font-bold" value={inlineCompany.name} onChange={e => setInlineCompany({...inlineCompany, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase pr-1">رقم الهاتف</label>
                <input placeholder="05XXXXXXXX" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-center font-bold" value={inlineCompany.phone} onChange={e => setInlineCompany({...inlineCompany, phone: e.target.value})} />
              </div>
              <button onClick={() => { addCompany(inlineCompany); setShowInlineCompanyModal(false); setInlineCompany({name:'', phone:'', address:''}); }} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">تأكيد الإضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* Warning/Installment modals with modern look */}
      {showWarning && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in bounce-in duration-500">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">تنبيه: مديونية سابقة</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">هذا المورد له فواتير سابقة غير مسددة بالكامل. هل ترغب في الاستمرار بإنشاء فاتورة جديدة له؟</p>
            <div className="space-y-3">
              <button onClick={() => setShowWarning(false)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700">نعم، متابعة الإنشاء</button>
              <button onClick={() => { setShowWarning(false); setShowOrderModal(false); }} className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black">لا، إلغاء وعرض الديون</button>
            </div>
          </div>
        </div>
      )}

      {showInstallmentModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-right animate-in zoom-in duration-200">
            <h3 className="text-xl font-black mb-6 flex items-center flex-row-reverse border-b pb-4">
              <CreditCard className="ml-3 text-indigo-600" size={24} />
              <span>إضافة دفعة سداد</span>
            </h3>
            <div className="bg-indigo-50 p-5 rounded-2xl mb-6 space-y-2">
              <div className="flex justify-between items-center text-sm font-bold flex-row-reverse text-indigo-900">
                <span>إجمالي الفاتورة:</span>
                <span className="font-black">${selectedInvoice.totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold flex-row-reverse text-rose-600">
                <span>المبلغ المتبقي:</span>
                <span className="font-black">${(selectedInvoice.totalValue - selectedInvoice.paidAmount).toFixed(2)}</span>
              </div>
            </div>
            <form onSubmit={handleAddInstallment} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase pr-1">مبلغ الدفعة الجديدة</label>
                <input 
                  autoFocus required type="number" step="0.01"
                  className="w-full px-4 py-5 bg-gray-50 border-none rounded-2xl text-center text-3xl font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  value={installmentAmount} onChange={e => setInstallmentAmount(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700">تأكيد السداد</button>
                <button type="button" onClick={() => setShowInstallmentModal(false)} className="px-8 bg-gray-100 text-gray-700 py-4 rounded-2xl font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;

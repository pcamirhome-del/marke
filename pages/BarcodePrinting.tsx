
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Printer, FileSpreadsheet, Plus, X, Barcode as BarcodeIcon, Building2, LayoutGrid } from 'lucide-react';

const BarcodePrintingPage: React.FC<{ store: any }> = ({ store }) => {
  const { state } = store;
  const [barcodesToPrint, setBarcodesToPrint] = useState<{barcode: string, quantity: number}[]>([]);
  const [singleBarcode, setSingleBarcode] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const addBarcode = (code: string) => {
    if (!code) return;
    const exists = barcodesToPrint.find(b => b.barcode === code);
    if (exists) {
      setBarcodesToPrint(barcodesToPrint.map(b => b.barcode === code ? { ...b, quantity: b.quantity + 1 } : b));
    } else {
      setBarcodesToPrint([...barcodesToPrint, { barcode: code, quantity: 1 }]);
    }
    setSingleBarcode('');
  };

  const addCompanyBarcodes = () => {
    if (!selectedCompanyId) return;
    const companyProducts = state.products.filter((p: any) => p.companyId === selectedCompanyId);
    const newItems = companyProducts.map((p: any) => ({ barcode: p.barcode, quantity: 1 }));
    setBarcodesToPrint([...barcodesToPrint, ...newItems]);
    setSelectedCompanyId('');
  };

  const removeItem = (code: string) => {
    setBarcodesToPrint(barcodesToPrint.filter(b => b.barcode !== code));
  };

  const printBarcodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const items = barcodesToPrint.flatMap(item => {
      const product = state.products.find((p: any) => p.barcode === item.barcode);
      return Array(item.quantity).fill({
        barcode: item.barcode,
        name: product?.name || 'منتج غير معروف',
        price: product?.wholesalePrice ? (product.wholesalePrice * (1 + state.settings.profitMargin / 100)).toFixed(2) : '0.00',
        date: new Date().toLocaleDateString('ar-EG')
      });
    });

    const html = `
      <html dir="rtl">
        <head>
          <title>طباعة باركود - ${state.settings.appName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
            body { font-family: 'Noto Sans Arabic', sans-serif; margin: 0; padding: 10mm; background: white; }
            .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
            .barcode-item { 
              border: 1px solid #333; 
              padding: 5px; 
              text-align: center; 
              height: 40mm; 
              width: 100%; 
              display: flex; 
              flex-direction: column; 
              justify-content: center; 
              overflow: hidden;
              box-sizing: border-box;
            }
            .app-name { font-size: 8px; font-weight: bold; margin-bottom: 2px; border-bottom: 1px solid #eee; }
            .item-name { font-size: 10px; font-weight: bold; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .item-price { font-size: 14px; font-weight: black; color: #000; margin: 2px 0; }
            .barcode-val { font-family: 'monospace'; font-size: 10px; letter-spacing: 1px; margin-top: 2px; border-top: 1px solid #eee; padding-top: 2px; }
            .print-date { font-size: 6px; color: #666; margin-top: 2px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${items.map(item => `
              <div class="barcode-item">
                <div class="app-name">${state.settings.appName}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price} $</div>
                <div class="barcode-val">${item.barcode}</div>
                <div class="print-date">طبع في: ${item.date}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = () => {
    const csvRows = [
      ['اسم المنتج', 'الباركود', 'السعر', 'تاريخ الطباعة']
    ];
    
    barcodesToPrint.forEach(item => {
      const product = state.products.find((p: any) => p.barcode === item.barcode);
      const price = product?.wholesalePrice ? (product.wholesalePrice * (1 + state.settings.profitMargin / 100)).toFixed(2) : '0.00';
      csvRows.push([
        product?.name || 'غير معروف',
        item.barcode,
        price,
        new Date().toLocaleDateString()
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `barcodes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-right">
      <h1 className="text-2xl font-bold mb-6 flex items-center flex-row-reverse">
        <Printer size={28} className="ml-2 text-indigo-600" />
        <span>مركز طباعة الباركود والتسعير</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Selection Area */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 flex items-center flex-row-reverse">
              <BarcodeIcon size={18} className="ml-2 text-indigo-600" />
              <span>إضافة باركود محدد</span>
            </h3>
            <div className="flex space-x-2 flex-row-reverse">
              <input 
                type="text" 
                placeholder="أدخل رقم الباركود..."
                className="flex-1 px-4 py-2 border rounded-xl text-right mr-2"
                value={singleBarcode}
                onChange={e => setSingleBarcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBarcode(singleBarcode)}
              />
              <button onClick={() => addBarcode(singleBarcode)} className="bg-indigo-600 text-white p-2 rounded-xl">
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 flex items-center flex-row-reverse">
              <Building2 size={18} className="ml-2 text-indigo-600" />
              <span>إضافة جميع باركودات شركة</span>
            </h3>
            <div className="flex space-x-2 flex-row-reverse">
              <select 
                className="flex-1 px-4 py-2 border rounded-xl text-right mr-2"
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
              >
                <option value="">-- اختر شركة موردة --</option>
                {state.companies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button onClick={addCompanyBarcodes} className="bg-indigo-600 text-white p-2 rounded-xl">
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* List to Print */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 flex-row-reverse">
            <h3 className="font-bold flex items-center flex-row-reverse">
              <LayoutGrid size={18} className="ml-2 text-indigo-600" />
              <span>قائمة الطباعة الحالية ({barcodesToPrint.length})</span>
            </h3>
            {barcodesToPrint.length > 0 && (
              <button onClick={() => setBarcodesToPrint([])} className="text-red-500 text-xs font-bold">مسح الكل</button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto divide-y">
            {barcodesToPrint.map((item, idx) => {
              const product = state.products.find((p: any) => p.barcode === item.barcode);
              return (
                <div key={idx} className="py-3 flex justify-between items-center flex-row-reverse">
                  <div className="text-right">
                    <div className="font-bold text-sm">{product?.name || 'غير معروف'}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.barcode}</div>
                  </div>
                  <div className="flex items-center space-x-3 flex-row-reverse">
                    <div className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold">الكمية: {item.quantity}</div>
                    <button onClick={() => removeItem(item.barcode)} className="text-red-400 hover:text-red-600 ml-3">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
            {barcodesToPrint.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">أضف باركودات للبدء في الطباعة</div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              disabled={barcodesToPrint.length === 0}
              onClick={printBarcodes}
              className="bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              <Printer size={20} />
              <span>طباعة الملصقات</span>
            </button>
            <button 
              disabled={barcodesToPrint.length === 0}
              onClick={exportToExcel}
              className="bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              <FileSpreadsheet size={20} />
              <span>تصدير إكسيل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section Card */}
      <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
        <h4 className="text-center font-bold text-gray-400 mb-6 uppercase tracking-widest text-xs">نموذج شكل الملصق المطبوع</h4>
        <div className="flex justify-center">
          <div className="bg-white border-2 border-indigo-600 p-6 rounded-none w-64 text-center shadow-xl">
             <div className="text-[10px] font-bold text-indigo-600 border-b pb-1 mb-2 uppercase tracking-tighter">{state.settings.appName}</div>
             <div className="text-sm font-black mb-1">اسم الصنف هنا</div>
             <div className="text-3xl font-black my-2">25.00 $</div>
             <div className="font-mono text-xs tracking-widest border-t pt-1 mt-2">1234567890</div>
             <div className="text-[8px] text-gray-400 mt-2">طبع في: {new Date().toLocaleDateString('ar-EG')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrintingPage;

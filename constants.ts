
import { User, AppSettings, UserPermissions, Company, Product, Invoice } from './types';

export const DEFAULT_PERMISSIONS: UserPermissions = {
  dashboard: true,
  createOrder: true,
  stock: true,
  barcodePrinting: true,
  companies: true,
  inventory: true,
  sales: true,
  admin: false,
};

export const INITIAL_USER: User = {
  id: 'admin-001',
  name: 'مدير النظام التجريبي',
  username: 'admin',
  password: 'admin',
  role: 'admin',
  permissions: {
    dashboard: true,
    createOrder: true,
    stock: true,
    barcodePrinting: true,
    companies: true,
    inventory: true,
    sales: true,
    admin: true,
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  profitMargin: 15,
  appName: 'سوبر ماركت برو (نسخة العرض)',
};

// مفتاح تخزين جديد كلياً لضمان عدم تداخل أي بيانات قديمة
export const STORAGE_KEYS = {
  APP_STATE: 'supermarket_pro_forced_v50_final',
};

// بيانات تجريبية مضمونة الظهور
export const SEED_COMPANIES: Company[] = [
  { id: 'c1', code: 100, name: 'شركة النخبة للمواد الغذائية', phone: '0501234567', address: 'الرياض' },
  { id: 'c2', code: 101, name: 'مؤسسة التكامل العالمية', phone: '0559876543', address: 'جدة' },
  { id: 'c3', code: 102, name: 'مزارع الوادي السعيد', phone: '0540001112', address: 'الدمام' },
];

export const SEED_PRODUCTS: Product[] = [
  { barcode: '6281001', name: 'أرز بسمتي فاخر 5 كجم', companyId: 'c1', wholesalePrice: 45.00, quantity: 50, category: 'أرز', unit: 'كيس' },
  { barcode: '6281002', name: 'زيت دوار الشمس 1.5 لتر', companyId: 'c1', wholesalePrice: 12.50, quantity: 120, category: 'زيوت', unit: 'حبة' },
  { barcode: '6281003', name: 'مكرونة إيطالي 500جم', companyId: 'c2', wholesalePrice: 3.25, quantity: 200, category: 'معلبات', unit: 'حبة' },
  { barcode: '6281004', name: 'شاي الربيع 100 فتلة', companyId: 'c2', wholesalePrice: 14.00, quantity: 15, category: 'مشروبات', unit: 'علبة' },
  { barcode: '6281005', name: 'ملح ساسا 500جم', companyId: 'c3', wholesalePrice: 1.00, quantity: 500, category: 'بهارات', unit: 'حبة' },
];

const generateDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const SEED_INVOICES: Invoice[] = [
  {
    id: 1001,
    companyId: 'c1',
    date: generateDate(0), // اليوم لضمان ظهوره في الإحصائيات
    expiryDate: generateDate(-10),
    items: [{ barcode: '6281001', name: 'أرز بسمتي فاخر 5 كجم', quantity: 10, wholesalePrice: 45.00, sellingPrice: 51.75 }],
    totalValue: 450.00,
    paidAmount: 450.00,
    installments: [],
    isReceived: true,
    status: 'Paid'
  },
  {
    id: 1002,
    companyId: 'c2',
    date: generateDate(1), // أمس
    expiryDate: generateDate(-5),
    items: [{ barcode: '6281003', name: 'مكرونة إيطالي 500جم', quantity: 100, wholesalePrice: 3.25, sellingPrice: 3.74 }],
    totalValue: 325.00,
    paidAmount: 100.00,
    installments: [{ id: 'inst1', date: generateDate(0), amount: 100.00 }],
    isReceived: true,
    status: 'Partial'
  }
];

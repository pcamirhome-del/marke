
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
  name: 'مدير النظام',
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
  appName: 'سوبر ماركت برو',
};

export const STORAGE_KEYS = {
  APP_STATE: 'supermarket_pro_state_v2',
};

// بيانات تجريبية لتظهر على Vercel
export const SEED_COMPANIES: Company[] = [
  { id: 'c1', code: 100, name: 'شركة الهلال للمواد الغذائية', phone: '0501234567', address: 'الرياض - حي الملز' },
  { id: 'c2', code: 101, name: 'مؤسسة النور للتجارة والتوزيع', phone: '0559876543', address: 'جدة - المنطقة الصناعية' },
];

export const SEED_PRODUCTS: Product[] = [
  { barcode: '6281001', name: 'أرز بسمتي 5 كجم', companyId: 'c1', wholesalePrice: 45.00, quantity: 50, category: 'أرز', unit: 'كيس' },
  { barcode: '6281002', name: 'زيت نباتي 1.5 لتر', companyId: 'c1', wholesalePrice: 12.50, quantity: 120, category: 'زيوت', unit: 'حبة' },
  { barcode: '6281003', name: 'مكرونة إيطالية 500جم', companyId: 'c2', wholesalePrice: 3.25, quantity: 200, category: 'معلبات', unit: 'حبة' },
  { barcode: '6281004', name: 'شاي أحمر كبوس 100 فتلة', companyId: 'c2', wholesalePrice: 14.00, quantity: 15, category: 'مشروبات', unit: 'علبة' },
];

const generatePastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const SEED_INVOICES: Invoice[] = [
  {
    id: 1000,
    companyId: 'c1',
    date: generatePastDate(5),
    expiryDate: generatePastDate(-2),
    items: [{ barcode: '6281001', name: 'أرز بسمتي 5 كجم', quantity: 20, wholesalePrice: 45.00, sellingPrice: 51.75 }],
    totalValue: 900.00,
    paidAmount: 500.00,
    installments: [{ id: 'inst1', date: generatePastDate(4), amount: 500.00 }],
    isReceived: true,
    status: 'Partial'
  },
  {
    id: 1001,
    companyId: 'c2',
    date: generatePastDate(2),
    expiryDate: generatePastDate(-5),
    items: [{ barcode: '6281003', name: 'مكرونة إيطالية 500جم', quantity: 100, wholesalePrice: 3.25, sellingPrice: 3.74 }],
    totalValue: 325.00,
    paidAmount: 325.00,
    installments: [{ id: 'inst2', date: generatePastDate(1), amount: 325.00 }],
    isReceived: true,
    status: 'Paid'
  }
];

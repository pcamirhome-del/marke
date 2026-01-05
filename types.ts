
export type Role = 'admin' | 'user';

export interface UserPermissions {
  dashboard: boolean;
  createOrder: boolean;
  stock: boolean;
  barcodePrinting: boolean;
  companies: boolean;
  inventory: boolean;
  sales: boolean;
  admin: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  permissions: UserPermissions;
}

export interface Company {
  id: string;
  code: number;
  name: string;
  phone: string;
  address: string;
}

export interface Product {
  barcode: string;
  name: string;
  companyId: string;
  wholesalePrice: number;
  quantity: number;
  description?: string;
  unit?: string;
  category?: string;
}

export interface Installment {
  id: string;
  date: string;
  amount: number;
}

export interface InvoiceItem {
  barcode: string;
  name: string;
  quantity: number;
  wholesalePrice: number;
  sellingPrice: number;
}

export interface Invoice {
  id: number;
  companyId: string;
  date: string;
  expiryDate: string;
  items: InvoiceItem[];
  totalValue: number;
  paidAmount: number;
  installments: Installment[];
  isReceived: boolean;
  status: 'Pending' | 'Partial' | 'Paid';
}

export interface AppSettings {
  profitMargin: number;
  appName: string;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  companies: Company[];
  products: Product[];
  invoices: Invoice[];
  settings: AppSettings;
}


import { User, AppSettings, UserPermissions } from './types';

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

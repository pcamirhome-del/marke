
import { useState, useEffect, useCallback } from 'react';
import { AppState, User, Company, Product, Invoice, AppSettings, Installment } from './types';
import { STORAGE_KEYS, INITIAL_USER, DEFAULT_SETTINGS, SEED_COMPANIES, SEED_PRODUCTS, SEED_INVOICES } from './constants';

const INITIAL_STATE: AppState = {
  users: [INITIAL_USER],
  currentUser: null,
  companies: SEED_COMPANIES,
  products: SEED_PRODUCTS,
  invoices: SEED_INVOICES,
  settings: DEFAULT_SETTINGS,
};

export function useStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!saved) return INITIAL_STATE;
      
      const parsed = JSON.parse(saved);
      
      // منطق الصيانة الإجباري: إذا كانت البيانات فارغة، استخدم SEED_DATA فوراً
      const companies = (parsed.companies && parsed.companies.length > 0) ? parsed.companies : SEED_COMPANIES;
      const products = (parsed.products && parsed.products.length > 0) ? parsed.products : SEED_PRODUCTS;
      const invoices = (parsed.invoices && parsed.invoices.length > 0) ? parsed.invoices : SEED_INVOICES;
      const users = (parsed.users && parsed.users.length > 0) ? parsed.users : [INITIAL_USER];
      const settings = parsed.settings || DEFAULT_SETTINGS;

      return {
        ...INITIAL_STATE,
        ...parsed,
        users,
        companies,
        products,
        invoices,
        settings,
        currentUser: null 
      };
    } catch (e) {
      console.error("Store Init Error:", e);
      return INITIAL_STATE;
    }
  });

  // حفظ الحالة في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
  }, [state]);

  const login = useCallback((username: string, password: string): boolean => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  }, [state.users]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const updateSettings = useCallback((settings: AppSettings) => {
    setState(prev => ({ ...prev, settings }));
  }, []);

  const addCompany = useCallback((companyData: Omit<Company, 'id' | 'code'>) => {
    setState(prev => {
      const lastCode = prev.companies.length > 0 
        ? Math.max(...prev.companies.map(c => c.code)) 
        : 99;
      
      const newCompany: Company = {
        ...companyData,
        id: Date.now().toString(),
        code: lastCode + 1
      };
      return { ...prev, companies: [...prev.companies, newCompany] };
    });
  }, []);

  const addProduct = useCallback((product: Product) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products.filter(p => p.barcode !== product.barcode), product]
    }));
  }, []);

  const updateProductStock = useCallback((barcode: string, delta: number) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.barcode === barcode ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
      )
    }));
  }, []);

  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id' | 'status' | 'expiryDate'>) => {
    const nextId = state.invoices.length > 0 
      ? Math.max(...state.invoices.map(i => i.id)) + 1 
      : 1000;

    const remaining = invoiceData.totalValue - invoiceData.paidAmount;
    const status = remaining <= 0 ? 'Paid' : (invoiceData.paidAmount > 0 ? 'Partial' : 'Pending');

    const dateObj = new Date(invoiceData.date);
    const expiryObj = new Date(dateObj);
    expiryObj.setDate(expiryObj.getDate() + 7);

    const newInvoice: Invoice = {
      ...invoiceData,
      id: nextId,
      status,
      expiryDate: expiryObj.toISOString()
    };

    setState(prev => ({ ...prev, invoices: [...prev.invoices, newInvoice] }));

    if (newInvoice.isReceived) {
      newInvoice.items.forEach(item => {
        updateProductStock(item.barcode, item.quantity);
      });
    }

    return newInvoice;
  }, [state.invoices, updateProductStock]);

  const addInstallment = useCallback((invoiceId: number, amount: number) => {
    setState(prev => {
      const newInvoices = prev.invoices.map(inv => {
        if (inv.id === invoiceId) {
          const newPaidAmount = inv.paidAmount + amount;
          const remaining = inv.totalValue - newPaidAmount;
          const status = remaining <= 0 ? 'Paid' : 'Partial';
          const newInstallment: Installment = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            amount
          };
          return {
            ...inv,
            paidAmount: newPaidAmount,
            status,
            installments: [...inv.installments, newInstallment]
          };
        }
        return inv;
      });
      return { ...prev, invoices: newInvoices };
    });
  }, []);

  const deleteInvoice = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== id)
    }));
  }, []);

  const manageUser = useCallback((user: User, action: 'add' | 'edit' | 'delete') => {
    setState(prev => {
      if (action === 'delete') return { ...prev, users: prev.users.filter(u => u.id !== user.id) };
      if (action === 'edit') return { ...prev, users: prev.users.map(u => u.id === user.id ? user : u) };
      return { ...prev, users: [...prev.users, user] };
    });
  }, []);

  return {
    state,
    login,
    logout,
    updateSettings,
    addCompany,
    addProduct,
    updateProductStock,
    addInvoice,
    addInstallment,
    deleteInvoice,
    manageUser,
  };
}

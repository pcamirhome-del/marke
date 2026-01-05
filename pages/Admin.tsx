
import React, { useState } from 'react';
import { useStore } from '../store';
import { Users, Percent, Save, Plus, Trash2, X, Shield, Type } from 'lucide-react';
import { User, UserPermissions } from '../types';

const AdminPage: React.FC<{ store: any }> = ({ store }) => {
  const { state, updateSettings, manageUser } = store;

  const [margin, setMargin] = useState(state.settings.profitMargin);
  const [appName, setAppName] = useState(state.settings.appName);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user' as const,
    permissions: {
      dashboard: true,
      createOrder: true,
      stock: true,
      invoices: true,
      companies: true,
      inventory: true,
      sales: true,
      admin: false,
    }
  });

  const handleSaveSettings = () => {
    updateSettings({ ...state.settings, profitMargin: Number(margin), appName });
    alert("تم حفظ الإعدادات بنجاح");
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    manageUser({ ...newUser, id: Date.now().toString() }, 'add');
    setShowUserModal(false);
  };

  const handleUpdatePerms = (permKey: keyof UserPermissions) => {
    if (!selectedUser) return;
    const updatedUser = {
      ...selectedUser,
      permissions: {
        ...selectedUser.permissions,
        [permKey]: !selectedUser.permissions[permKey]
      }
    };
    setSelectedUser(updatedUser);
    manageUser(updatedUser, 'edit');
  };

  return (
    <div className="max-w-4xl mx-auto text-right">
      <h1 className="text-2xl font-bold mb-8">إعدادات النظام والإدارة</h1>

      {/* Global Settings */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center flex-row-reverse">
          <Settings className="text-indigo-600 ml-2" size={20} />
          <span>إعدادات البرنامج</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center flex-row-reverse">
               <Type size={14} className="ml-1" /> اسم البرنامج
            </label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-right font-bold"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center flex-row-reverse">
               <Percent size={14} className="ml-1" /> هامش الربح (%)
            </label>
            <input 
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 text-right font-bold"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
            />
          </div>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center flex-row-reverse"
        >
          <Save size={20} className="ml-2" />
          <span>حفظ جميع التغييرات</span>
        </button>
      </section>

      {/* User Management */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 flex-row-reverse">
          <h2 className="text-lg font-bold flex items-center flex-row-reverse">
            <Users size={20} className="text-indigo-600 ml-2" />
            <span>إدارة الموظفين والصلاحيات</span>
          </h2>
          <button 
            onClick={() => setShowUserModal(true)}
            className="text-indigo-600 text-sm font-bold flex items-center flex-row-reverse hover:underline"
          >
            <Plus size={16} className="ml-1" />
            إضافة مستخدم جديد
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-3">الاسم</th>
                <th className="pb-3">المستخدم</th>
                <th className="pb-3 text-center">الدور</th>
                <th className="pb-3 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.users.map((user: User) => (
                <tr key={user.id}>
                  <td className="py-4 font-medium">{user.name}</td>
                  <td className="py-4 text-gray-500 font-mono">@{user.username}</td>
                  <td className="py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role === 'admin' ? 'مدير' : 'موظف عادي'}
                    </span>
                  </td>
                  <td className="py-4 text-left">
                    <div className="flex items-center space-x-3">
                      {user.username !== 'admin' && (
                        <>
                          <button 
                            onClick={() => { setSelectedUser(user); setShowPermModal(true); }}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="تعديل الصلاحيات"
                          >
                            <Shield size={18} />
                          </button>
                          <button 
                            onClick={() => manageUser(user, 'delete')} 
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* New User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[90] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-right">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-bold">إضافة حساب موظف</h2>
              <button onClick={() => setShowUserModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input required className="w-full px-4 py-2 border rounded-xl text-right" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input required className="w-full px-4 py-2 border rounded-xl text-right" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input required type="password" className="w-full px-4 py-2 border rounded-xl text-right" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">إنشاء الحساب</button>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-right">
            <div className="p-6 bg-indigo-800 text-white flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-bold flex items-center flex-row-reverse">
                <Shield size={20} className="ml-2" />
                <span>صلاحيات: {selectedUser.name}</span>
              </h2>
              <button onClick={() => setShowPermModal(false)}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-3">
              {Object.keys(selectedUser.permissions).map((key) => {
                const labelMap: Record<string, string> = {
                  dashboard: 'الوصول للوحة التحكم',
                  createOrder: 'إنشاء طلبات جديدة',
                  stock: 'عرض حالة المخزون',
                  invoices: 'إدارة الفواتير',
                  companies: 'إدارة الموردين',
                  inventory: 'عمليات الجرد',
                  sales: 'عرض تقارير المبيعات',
                  admin: 'الدخول للإعدادات',
                };
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg flex-row-reverse">
                    <span className="font-medium">{labelMap[key] || key}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={selectedUser.permissions[key as keyof UserPermissions]} 
                        onChange={() => handleUpdatePerms(key as keyof UserPermissions)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { Settings } from 'lucide-react';

export default AdminPage;

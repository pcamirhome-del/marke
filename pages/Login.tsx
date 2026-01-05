
import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Lock, User as UserIcon, Calendar, Clock, Smile, Info } from 'lucide-react';

interface LoginProps {
  store: any;
}

const Login: React.FC<LoginProps> = ({ store }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.login(username, password)) {
      const user = store.state.users.find((u: any) => u.username === username);
      setWelcomeUser(user?.name || username);
    } else {
      setError(true);
    }
  };

  const dayName = dateTime.toLocaleDateString('ar-EG', { weekday: 'long' });
  const dateStr = dateTime.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  if (welcomeUser) {
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Smile size={64} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">مرحباً بك!</h2>
          <p className="text-xl text-indigo-600 font-bold mb-8">{welcomeUser}</p>
          <p className="text-gray-500 mb-6">يتم توجيهك الآن إلى لوحة التحكم...</p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Clock Display */}
      <div className="mb-8 text-white text-center animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center justify-center space-x-2 space-x-reverse text-indigo-200 mb-1">
          <Calendar size={18} />
          <span className="font-bold text-lg">{dayName} - {dateStr}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <Clock size={24} className="text-white opacity-80" />
          <span className="text-4xl font-black font-mono tracking-widest">{timeStr}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 bg-indigo-600 text-white text-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBasket size={48} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{store.state.settings.appName}</h1>
          <p className="text-indigo-100 mt-2">نظام الإدارة والمخزون المتقدم</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6 text-right">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-pulse text-center">
              بيانات الدخول غير صحيحة
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                autoFocus
                type="text" 
                className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-gray-800"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-gray-800"
                placeholder="admin"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transform active:scale-95 transition-all shadow-xl shadow-indigo-200"
          >
            تسجيل الدخول
          </button>

          <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3 space-x-reverse">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-blue-700 leading-relaxed font-bold">
              بيانات الدخول الافتراضية للوحة التحكم: <br/>
              اسم المستخدم: <span className="underline">admin</span> <br/>
              كلمة المرور: <span className="underline">admin</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

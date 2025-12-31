
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginProps {
  setView: (v: any) => void;
  setUser: (u: UserProfile) => void;
  setIsAdmin: (a: boolean) => void;
  allUsers: UserProfile[];
}

const Login: React.FC<LoginProps> = ({ setView, setUser, setIsAdmin, allUsers }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone === 'admin@nest.com' && password === '12341234') {
      setIsAdmin(true);
      return;
    }

    // Checking local simulation
    const found = allUsers.find(u => u.phone === phone);
    if (found) {
      setUser(found);
      setView('dashboard');
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-pink-100 to-white">
      <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="Nestgirl Logo" className="w-48 mb-8 drop-shadow-md" />
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-pink-50">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">تسجيل الدخول</h1>
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف أو البريد</label>
            <input 
              type="text" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 bg-pink-50 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all"
              placeholder="05xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-pink-50 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none transition-all"
              placeholder="********"
            />
          </div>
          <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95">
            دخول
          </button>
        </form>
        <div className="mt-8 text-center text-gray-500">
          ليس لديك حساب؟ 
          <button onClick={() => setView('signup')} className="text-pink-600 font-bold mr-1">انشاء حساب</button>
        </div>
      </div>
    </div>
  );
};

export default Login;

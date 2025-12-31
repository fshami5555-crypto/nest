
import React from 'react';
import { X, User, Settings, Shield, Info, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (o: boolean) => void;
  setView: (v: any) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen, setView, onLogout }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      
      {/* Sidebar Content */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-[101] shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <button onClick={() => setOpen(false)} className="p-2 bg-pink-50 rounded-xl text-pink-500 mb-8"><X /></button>
          
          <div className="space-y-4">
            <button onClick={() => { setView('profile'); setOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-pink-50 text-gray-700 transition-colors">
              <div className="bg-pink-100 p-2 rounded-xl text-pink-600"><User size={20} /></div>
              <span className="font-bold">الملف الشخصي</span>
            </button>
            
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-pink-50 text-gray-700 transition-colors">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Settings size={20} /></div>
              <span className="font-bold">الإعدادات</span>
            </button>
            
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-pink-50 text-gray-700 transition-colors">
              <div className="bg-green-100 p-2 rounded-xl text-green-600"><Shield size={20} /></div>
              <span className="font-bold">الخصوصية</span>
            </button>

            <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-pink-50 text-gray-700 transition-colors">
              <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Info size={20} /></div>
              <span className="font-bold">حول التطبيق</span>
            </button>
            
            <div className="pt-8 mt-8 border-t">
              <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-600 transition-colors">
                <LogOut size={20} />
                <span className="font-bold">تسجيل الخروج</span>
              </button>
            </div>
          </div>
          
          <div className="mt-20 flex flex-col items-center opacity-30">
            <img src="https://i.ibb.co/gLTJ5VMS/image.png" className="w-16 mb-2" alt="" />
            <p className="text-[10px]">Nestgirl v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

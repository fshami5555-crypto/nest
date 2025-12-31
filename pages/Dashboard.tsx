
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { Bell, Menu, Cloud, Calendar, Clock } from 'lucide-react';
import { getDynamicGreeting } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  setView: (v: any) => void;
  setIsSidebarOpen: (o: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, setView, setIsSidebarOpen }) => {
  const [aiText, setAiText] = useState("جاري التحميل...");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getDynamicGreeting(user).then(setAiText);
  }, [user]);

  const daysRemaining = useMemo(() => {
    if (user.isPeriodActive) return 0;
    const today = new Date().getDate();
    const next = user.nextPeriodDay || 1;
    let diff = next - today;
    if (diff <= 0) diff += 30;
    return diff;
  }, [user]);

  const togglePeriod = () => {
    const isStarting = !user.isPeriodActive;
    onUpdateUser({
      ...user,
      isPeriodActive: isStarting,
      periodStartTimestamp: isStarting ? Date.now() : undefined,
      nextPeriodDay: isStarting ? undefined : (new Date().getDate() + 25) % 30 // Rough estimation
    });
  };

  return (
    <div className="p-4 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-xl shadow-sm"><Menu size={24} className="text-pink-500" /></button>
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
        </div>
        <button className="p-2 bg-white rounded-xl shadow-sm text-pink-500 relative">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-pink-400 to-rose-400 p-6 rounded-[2.5rem] text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-rose-100 flex items-center gap-2"><Calendar size={14} /> {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-4xl font-bold flex items-center gap-3"><Clock size={28} /> {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-rose-100 flex items-center gap-2 mt-2"><Cloud size={16} /> مشمس، 25° م</p>
          </div>
          <div className="text-left">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
              <p className="text-xs">دورتكِ الشهرية</p>
              <p className="text-xl font-bold">
                {user.isPeriodActive ? 'اليوم الأول' : `باقي ${daysRemaining} يوم`}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={togglePeriod}
          className={`mt-6 w-full py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${user.isPeriodActive ? 'bg-white text-rose-500' : 'bg-rose-600 text-white'}`}
        >
          {user.isPeriodActive ? 'انتهت الدورة' : 'بدأت الدورة لدي'}
        </button>
      </div>

      {/* AI Chat Box */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 mb-6 flex gap-4 items-start">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white overflow-hidden">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="AI" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-pink-600 mb-1">مساعدتكِ الذكية</h4>
          <p className="text-gray-600 leading-relaxed text-sm">
            {aiText}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-blue-50">
          <p className="text-xs text-blue-400 mb-1">الوزن الحالي</p>
          <p className="text-xl font-bold text-blue-600">{user.weight} كجم</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-orange-50">
          <p className="text-xs text-orange-400 mb-1">النشاط البدني</p>
          <p className="text-xl font-bold text-orange-600">نشط</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

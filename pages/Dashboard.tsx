
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, AICache } from '../types';
import { 
  Sparkles, AlertCircle, Info, Baby, Heart, Star, ShieldCheck, 
  Cloud, Sun, CloudRain, CloudLightning, Wind 
} from 'lucide-react';
import { getDynamicGreeting, getStatusSpecificAdvice, getDailyHoroscope } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  setView: (v: any) => void;
  setIsSidebarOpen: (o: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, setView, setIsSidebarOpen }) => {
  const [aiText, setAiText] = useState(user.aiCache?.greeting?.text || "مرحباً بكِ في Nestgirl...");
  const [statusAdvice, setStatusAdvice] = useState(user.aiCache?.statusAdvice?.text || "جاري تجهيز نصائح مخصصة لحالتكِ...");
  const [horoscope, setHoroscope] = useState(user.aiCache?.horoscope?.text || "جاري قراءة حركة النجوم من أجلكِ...");
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);

  const zodiacInfo = useMemo(() => {
    const date = new Date(user.birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: "الحمل", icon: "♈" };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: "الثور", icon: "♉" };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: "الجوزاء", icon: "♊" };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: "السرطان", icon: "♋" };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: "الأسد", icon: "♌" };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: "العذراء", icon: "♍" };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: "الميزان", icon: "♎" };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: "العقرب", icon: "♏" };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: "القوس", icon: "♐" };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: "الجدي", icon: "♑" };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: "الدلو", icon: "♒" };
    return { name: "الحوت", icon: "♓" };
  }, [user.birthDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`);
          const data = await res.json();
          setWeather({ temp: Math.round(data.current_weather.temperature), code: data.current_weather.weathercode });
        } catch (e) {}
      });
    }
    return () => clearInterval(timer);
  }, []);

  const stateInfo = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (user.isPostpartum) {
      const start = user.postpartumStartTimestamp ? new Date(user.postpartumStartTimestamp) : today;
      const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return { type: 'postpartum', title: `يومكِ الـ ${diffDays} في النفاس`, subtitle: `الحمد لله على سلامتكِ وسلامة مولودكِ`, buttonText: 'أنهيت فترة النفاس ✨', gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600', icon: <Star size={20} className="text-white" /> };
    }
    if (user.motherhoodStatus === 'pregnant' && user.expectedDueDate) {
      const due = new Date(user.expectedDueDate.replace(/-/g, '/'));
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { type: 'pregnant', title: diffDays < 0 ? `تأخرت الولادة ${Math.abs(diffDays)} يوم` : `باقي ${diffDays} يوم للولادة`, subtitle: `رحلة سعيدة يا ماما، اهتمي بنفسكِ`, buttonText: 'قمت بالإنجاب 👶', gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500', icon: <Baby size={20} className="text-white" /> };
    }
    if (user.isPeriodActive && user.periodStartTimestamp) {
      const start = new Date(user.periodStartTimestamp);
      const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const remaining = Math.max(0, 6 - diffDays);
      return { type: 'period_active', title: remaining > 0 ? `باقي ${remaining} أيام وتنتهي` : `اليوم الـ ${diffDays} للدورة`, subtitle: 'اهتمي بصحتكِ، التدفئة والراحة مهمة', buttonText: 'انتهت الدورة', gradient: 'bg-gradient-to-br from-rose-500 to-pink-600', icon: <Info size={16} className="text-white" /> };
    }
    if (user.nextPeriodDate) {
      const next = new Date(user.nextPeriodDate.replace(/-/g, '/'));
      const diffDays = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return { type: 'late', title: diffDays === 0 ? 'الموعد المتوقع اليوم' : `تأخرت الدورة ${Math.abs(diffDays)} يوم`, subtitle: 'يرجى مراقبة حالتكِ الصحية والتوتر', buttonText: 'بدأت الدورة لدي', gradient: 'bg-gradient-to-br from-red-600 to-rose-700', icon: <AlertCircle size={16} className="text-white" /> };
      return { type: 'normal', title: `باقي ${diffDays} يوم للدورة`, subtitle: 'فترة النشاط والإنجاز والجمال', buttonText: 'بدأت الدورة لدي', gradient: 'bg-gradient-to-br from-pink-400 to-rose-500', icon: <Heart size={16} /> };
    }
    return { type: 'normal', title: 'يوم سعيد لكِ', subtitle: 'يوم جديد مليء بالفرص', buttonText: 'بدأت الدورة لدي', gradient: 'bg-gradient-to-br from-pink-400 to-rose-500', icon: <Heart size={16} /> };
  }, [user, currentTime]);

  const getNext6AM = () => {
    const now = new Date();
    const next = new Date(now);
    if (now.getHours() >= 6) next.setDate(now.getDate() + 1);
    next.setHours(6, 0, 0, 0);
    return next.getTime();
  };

  useEffect(() => {
    const now = Date.now();
    let updatedCache: AICache = { ...user.aiCache };
    let needsUpdate = false;

    const fetchAIContent = async () => {
      if (!user.aiCache?.greeting || now > user.aiCache.greeting.expiresAt) {
        const text = await getDynamicGreeting(user);
        updatedCache.greeting = { text, expiresAt: now + 4 * 60 * 60 * 1000 };
        setAiText(text);
        needsUpdate = true;
      }
      if (!user.aiCache?.statusAdvice || now > user.aiCache.statusAdvice.expiresAt || user.aiCache.statusAdvice.statusType !== stateInfo.type) {
        setLoadingAdvice(true);
        const text = await getStatusSpecificAdvice(user, stateInfo.type);
        updatedCache.statusAdvice = { text, expiresAt: now + 4 * 60 * 60 * 1000, statusType: stateInfo.type };
        setStatusAdvice(text);
        setLoadingAdvice(false);
        needsUpdate = true;
      }
      if (!user.aiCache?.horoscope || now > user.aiCache.horoscope.expiresAt) {
        setLoadingHoroscope(true);
        const text = await getDailyHoroscope(zodiacInfo.name, user.name);
        updatedCache.horoscope = { text, expiresAt: getNext6AM() };
        setHoroscope(text);
        setLoadingHoroscope(false);
        needsUpdate = true;
      }
      if (needsUpdate) onUpdateUser({ ...user, aiCache: updatedCache });
    };
    fetchAIContent();
  }, [user.name, stateInfo.type, zodiacInfo.name]);

  const handleAction = () => {
    const updatedUser = { ...user };
    if (stateInfo.type === 'postpartum') {
      updatedUser.isPostpartum = false;
      updatedUser.motherhoodStatus = 'mother';
      delete updatedUser.postpartumStartTimestamp;
    } else if (stateInfo.type === 'pregnant') {
      updatedUser.isPostpartum = true;
      updatedUser.postpartumStartTimestamp = Date.now();
      updatedUser.motherhoodStatus = 'mother';
    } else if (stateInfo.type === 'period_active') {
      updatedUser.isPeriodActive = false;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 25);
      updatedUser.nextPeriodDate = nextDate.toISOString().split('T')[0];
      delete updatedUser.periodStartTimestamp;
    } else {
      updatedUser.isPeriodActive = true;
      updatedUser.periodStartTimestamp = Date.now();
    }
    onUpdateUser(updatedUser);
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-yellow-400" size={20} />;
    if (code <= 3) return <Cloud className="text-gray-400" size={20} />;
    if (code <= 48) return <Wind className="text-blue-300" size={20} />;
    if (code <= 67) return <CloudRain className="text-blue-500" size={20} />;
    return <CloudLightning className="text-purple-500" size={20} />;
  };

  return (
    <div className="p-4 pt-20 max-w-2xl mx-auto">
      <div className={`p-6 rounded-[2.5rem] text-white shadow-xl mb-6 relative overflow-hidden transition-all duration-500 ${stateInfo.gradient}`}>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-white/80 text-xs">{currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold my-2">{currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
              {weather && (
                <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/20">
                  {getWeatherIcon(weather.code)}
                  <span className="font-bold">{weather.temp}°</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 text-center min-w-[120px]">
            <div className="flex justify-center mb-1">{stateInfo.icon}</div>
            <p className="text-lg font-bold">{stateInfo.title}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white/90 italic">{stateInfo.subtitle}</p>
        <button onClick={handleAction} className="mt-6 w-full py-4 bg-white text-gray-800 rounded-2xl font-bold shadow-lg active:scale-95 hover:bg-gray-50 transition-all">
          {stateInfo.buttonText}
        </button>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border-2 border-indigo-500/30 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:rotate-12 transition-transform duration-700">{zodiacInfo.icon}</div>
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-500 text-white rounded-2xl shadow-lg"><Sparkles size={20} /></div>
          <div>
            <h3 className="font-bold text-white text-lg">حظكِ اليوم: برج {zodiacInfo.name}</h3>
            <p className="text-indigo-300 text-[10px] font-bold tracking-widest uppercase">توقعات النجوم ✨</p>
          </div>
        </div>
        {loadingHoroscope ? (
          <div className="py-4 space-y-2"><div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div><div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div></div>
        ) : (
          <p className="text-indigo-100 text-sm leading-relaxed italic animate-in fade-in zoom-in duration-500">"{horoscope}"</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 mb-6 flex gap-4 items-start hover:shadow-md transition-shadow">
        <div className="w-12 h-12 flex-shrink-0 bg-pink-100 rounded-full flex items-center justify-center"><Sparkles size={24} className="text-pink-500" /></div>
        <div className="flex-1">
          <h4 className="font-bold text-pink-600 mb-1 text-sm flex items-center gap-1">نصيحتكِ اليومية <Star size={12} className="fill-pink-500" /></h4>
          <p className="text-gray-600 text-xs italic leading-relaxed">"{aiText}"</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-white to-pink-50 p-6 rounded-3xl shadow-sm border-2 border-pink-100 mb-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-500 text-white rounded-xl shadow-lg group-hover:rotate-12 transition-transform"><ShieldCheck size={20} /></div>
          <h3 className="font-bold text-gray-800">نصائح العناية المتخصصة</h3>
        </div>
        {loadingAdvice ? (
          <div className="flex flex-col items-center py-4 space-y-2"><div className="flex gap-1"><div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75"></div></div></div>
        ) : (
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{statusAdvice}</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

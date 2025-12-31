
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { Bell, Menu, Cloud, Calendar, Clock, MapPin, Sun, CloudRain, CloudLightning, CloudSnow, CloudFog, CloudSun, Sparkles, AlertCircle, Info, Baby } from 'lucide-react';
import { getDynamicGreeting } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  onUpdateUser: (u: UserProfile) => void;
  setView: (v: any) => void;
  setIsSidebarOpen: (o: boolean) => void;
}

interface WeatherInfo {
  temp: number;
  condition: string;
  city: string;
  icon: React.ElementType;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, setView, setIsSidebarOpen }) => {
  const [aiText, setAiText] = useState("جاري التحميل...");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getDynamicGreeting(user).then(setAiText);
    fetchWeather();
  }, [user.name, user.maritalStatus, user.motherhoodStatus, user.isPostpartum, user.isPeriodActive]);

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setWeatherLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`);
        const geoData = await geoRes.json();
        const cityName = geoData.city || geoData.locality || "موقعك الحالي";
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        const code = weatherData.current_weather.weathercode;
        const temp = Math.round(weatherData.current_weather.temperature);
        const mapping = getWeatherMapping(code);
        setWeather({ temp, city: cityName, condition: mapping.text, icon: mapping.icon });
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setWeatherLoading(false);
      }
    }, () => setWeatherLoading(false));
  };

  const getWeatherMapping = (code: number) => {
    if (code === 0) return { text: "صافٍ", icon: Sun };
    if (code <= 3) return { text: "غائم جزئياً", icon: CloudSun };
    if (code <= 48) return { text: "ضبابي", icon: CloudFog };
    if (code <= 67) return { text: "ممطر", icon: CloudRain };
    if (code <= 77) return { text: "ثلوج", icon: CloudSnow };
    if (code <= 82) return { text: "زخات مطر", icon: CloudRain };
    if (code >= 95) return { text: "عواصف رعدية", icon: CloudLightning };
    return { text: "غائم", icon: Cloud };
  };

  const stateInfo = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.motherhoodStatus === 'pregnant' && user.expectedDueDate) {
      const due = new Date(user.expectedDueDate);
      const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const diffTime = dueDateOnly.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const totalPregnancyDays = 274;
      const startDate = new Date(dueDateOnly.getTime() - (totalPregnancyDays * 24 * 60 * 60 * 1000));
      const passedTime = today.getTime() - startDate.getTime();
      const passedDays = Math.floor(passedTime / (1000 * 60 * 60 * 24));
      const currentMonth = Math.min(9, Math.max(1, Math.ceil(passedDays / 30.5)));

      if (diffDays < 0) {
        return {
          type: 'pregnant_late',
          title: `تأخرت الولادة ${Math.abs(diffDays)} يوم`,
          subtitle: `لقد أتممتِ الشهر التاسع بسلام`,
          buttonText: 'قمت بالإنجاب 👶',
          gradient: 'bg-gradient-to-br from-red-500 to-rose-700',
          icon: <AlertCircle size={20} className="text-white" />
        };
      }

      return {
        type: 'pregnant',
        title: `باقي ${diffDays} يوم للولادة`,
        subtitle: `أنتِ في الشهر الـ ${currentMonth}`,
        buttonText: 'قمت بالإنجاب 👶',
        gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500',
        icon: <Baby size={20} className="text-white" />
      };
    }

    if (user.isPostpartum && user.postpartumStartTimestamp) {
      const start = new Date(user.postpartumStartTimestamp);
      const startDayOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const diffTime = today.getTime() - startDayOnly.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return {
        type: 'postpartum',
        title: `اليوم الـ ${diffDays} للنفاس`,
        subtitle: 'فترة التعافي والعناية بالمولود',
        buttonText: 'بدأت الدورة لدي',
        gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        icon: <Sparkles size={20} className="text-white" />
      };
    }

    if (user.isPeriodActive && user.periodStartTimestamp) {
      const start = new Date(user.periodStartTimestamp);
      const startDayOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const diffTime = today.getTime() - startDayOnly.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return { 
        type: 'period_active', 
        title: `اليوم الـ ${diffDays} للدورة`, 
        subtitle: 'فترة الحيض',
        buttonText: 'انتهت الدورة',
        gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
        icon: <Info size={16} className="text-white" />
      };
    }

    if (user.nextPeriodDate) {
      const expectedDate = new Date(user.nextPeriodDate);
      const expectedDateOnly = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate());
      
      const diffTime = expectedDateOnly.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { 
          type: 'late', 
          title: `تأخرت الدورة ${Math.abs(diffDays)} يوم`, 
          subtitle: 'يرجى الانتباه لصحتكِ',
          buttonText: 'بدأت الدورة لدي',
          gradient: 'bg-gradient-to-br from-red-600 to-rose-700',
          icon: <AlertCircle size={16} />
        };
      } else {
        let sub = 'فترة الاستعداد';
        let isFertile = diffDays <= 16 && diffDays >= 12; // تقريب لأيام التبويض
        if (isFertile) sub = 'أيام التبويض (خصوبة عالية)';

        return { 
          type: 'waiting', 
          title: `باقي ${diffDays} يوم للدورة`, 
          subtitle: sub,
          buttonText: 'بدأت الدورة لدي',
          gradient: 'bg-gradient-to-br from-pink-400 to-rose-400',
          icon: isFertile ? <Sparkles size={16} /> : <Calendar size={16} />
        };
      }
    }

    return { 
      type: 'none', 
      title: 'لا توجد بيانات', 
      subtitle: 'يرجى تحديث ملفكِ الشخصي',
      buttonText: 'بدأت الدورة لدي',
      gradient: 'bg-gradient-to-br from-gray-400 to-gray-500',
      icon: <Calendar size={16} />
    };
  }, [user, currentTime]);

  const handleAction = () => {
    const updatedUser = { ...user };

    if (stateInfo.type === 'pregnant' || stateInfo.type === 'pregnant_late') {
      updatedUser.motherhoodStatus = 'mother';
      updatedUser.isPostpartum = true;
      updatedUser.postpartumStartTimestamp = Date.now();
      updatedUser.isPeriodActive = false;
      delete updatedUser.expectedDueDate;
    } else if (stateInfo.type === 'postpartum') {
      updatedUser.isPostpartum = false;
      delete updatedUser.postpartumStartTimestamp;
      updatedUser.isPeriodActive = true;
      updatedUser.periodStartTimestamp = Date.now();
      updatedUser.motherhoodStatus = 'mother';
    } else if (stateInfo.type === 'period_active') {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      updatedUser.isPeriodActive = false;
      delete updatedUser.periodStartTimestamp;
      updatedUser.nextPeriodDate = nextDate.toISOString().split('T')[0];
    } else {
      updatedUser.isPeriodActive = true;
      updatedUser.periodStartTimestamp = Date.now();
      updatedUser.isPostpartum = false;
      if (updatedUser.motherhoodStatus === 'pregnant') {
        updatedUser.motherhoodStatus = 'not_pregnant';
      }
    }

    onUpdateUser(updatedUser);
  };

  const WeatherIcon = weather?.icon || Cloud;

  return (
    <div className="p-4 pt-4">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-xl shadow-sm hover:scale-105 transition-transform"><Menu size={24} className="text-pink-500" /></button>
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
        </div>
        <button className="p-2 bg-white rounded-xl shadow-sm text-pink-500 relative hover:scale-105 transition-transform">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <div className={`p-6 rounded-[2.5rem] text-white shadow-xl mb-6 relative overflow-hidden transition-all duration-700 ease-in-out ${stateInfo.gradient}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-white/80 flex items-center gap-2 text-xs opacity-90">
              <Calendar size={14} /> {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-4xl font-bold flex items-center gap-3 my-2">
              <Clock size={28} /> {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="text-white/90 flex items-center gap-2 mt-3 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              {weatherLoading ? (
                <span className="text-xs animate-pulse">جاري جلب حالة الطقس...</span>
              ) : weather ? (
                <>
                  <WeatherIcon size={16} className="text-yellow-200" />
                  <span className="text-xs font-bold">{weather.city}: {weather.condition}، {weather.temp}° م</span>
                </>
              ) : (
                <>
                  <MapPin size={14} />
                  <span className="text-xs">تفعيل الموقع للطقس</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-left">
            <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 text-center min-w-[140px] shadow-lg">
              <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1 flex items-center justify-center gap-1 font-bold">
                {stateInfo.icon} وضعكِ الحالي
              </p>
              <p className="text-lg font-bold leading-tight">{stateInfo.title}</p>
              <p className="text-[9px] mt-1 text-white/90 font-medium bg-white/10 rounded px-1 py-0.5">{stateInfo.subtitle}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleAction}
          className="mt-6 w-full py-4 bg-white text-gray-800 rounded-2xl font-bold shadow-lg transition-all active:scale-95 hover:bg-gray-50 flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:translate-x-1 transition-transform">{stateInfo.buttonText}</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 mb-6 flex gap-4 items-start relative overflow-hidden group transition-all hover:shadow-md hover:border-pink-200">
        <div className="absolute top-0 right-0 w-2 h-full bg-pink-400 opacity-20"></div>
        <div className="w-12 h-12 bg-pink-100 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white overflow-hidden shadow-inner">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="AI" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-pink-600 mb-1 text-sm flex items-center gap-2">
            مساعدتكِ الذكية <Sparkles size={14} />
          </h4>
          <p className="text-gray-600 leading-relaxed text-xs italic">
            "{aiText}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-50 flex flex-col justify-between h-28 hover:shadow-md transition-all hover:-translate-y-1">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">الوزن الحالي</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-blue-600">{user.weight}</p>
            <span className="text-xs text-blue-300 font-bold mb-1">كجم</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-50 flex flex-col justify-between h-28 hover:shadow-md transition-all hover:-translate-y-1">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">المرحلة الحالية</p>
          <div className="flex items-end justify-between">
            <p className="text-sm font-bold text-orange-600 capitalize">
              {user.isPostpartum ? 'فترة النفاس' : (user.motherhoodStatus === 'pregnant' ? 'مرحلة الحمل' : (user.isPeriodActive ? 'فترة الحيض' : 'الوضع الطبيعي'))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { Bell, Menu, Cloud, Calendar, Clock, MapPin, Sun, CloudRain, CloudLightning, CloudSnow, CloudFog, CloudSun } from 'lucide-react';
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
  }, [user]);

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Fetch City Name (Reverse Geocoding)
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`);
        const geoData = await geoRes.json();
        const cityName = geoData.city || geoData.locality || "موقعك الحالي";

        // Fetch Weather Data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        const code = weatherData.current_weather.weathercode;
        const temp = Math.round(weatherData.current_weather.temperature);
        
        const mapping = getWeatherMapping(code);
        
        setWeather({
          temp,
          city: cityName,
          condition: mapping.text,
          icon: mapping.icon
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setWeatherLoading(false);
      }
    }, () => {
      setWeatherLoading(false);
    });
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

  const WeatherIcon = weather?.icon || Cloud;

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
            <p className="text-rose-100 flex items-center gap-2 text-xs opacity-90">
              <Calendar size={14} /> {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-4xl font-bold flex items-center gap-3 my-2">
              <Clock size={28} /> {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="text-rose-50 flex items-center gap-2 mt-3 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
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
                  <span className="text-xs">يرجى تفعيل الموقع للطقس</span>
                </>
              )}
            </div>
          </div>
          <div className="text-left">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
              <p className="text-[10px] uppercase tracking-wider opacity-80">دورتكِ الشهرية</p>
              <p className="text-lg font-bold">
                {user.isPeriodActive ? 'اليوم الأول' : `باقي ${daysRemaining} يوم`}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={togglePeriod}
          className={`mt-6 w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${user.isPeriodActive ? 'bg-white text-rose-500' : 'bg-rose-600 text-white'}`}
        >
          {user.isPeriodActive ? 'انتهت الدورة' : 'بدأت الدورة لدي'}
        </button>
      </div>

      {/* AI Chat Box */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50 mb-6 flex gap-4 items-start relative overflow-hidden group transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-2 h-full bg-pink-400 opacity-20"></div>
        <div className="w-12 h-12 bg-pink-100 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white overflow-hidden shadow-inner">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="AI" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-pink-600 mb-1 text-sm">مساعدتكِ الذكية</h4>
          <p className="text-gray-600 leading-relaxed text-xs">
            {aiText}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-50 flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">الوزن الحالي</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-blue-600">{user.weight}</p>
            <span className="text-xs text-blue-300 font-bold mb-1">كجم</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-50 flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">النشاط البدني</p>
          <div className="flex items-end justify-between">
            <p className="text-lg font-bold text-orange-600">نشط اليوم</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

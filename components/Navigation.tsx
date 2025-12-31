
import React from 'react';
import { Home, Heart, Baby, Utensils, Sparkles, Users } from 'lucide-react';

interface NavProps {
  currentView: string;
  setView: (v: any) => void;
}

const Navigation: React.FC<NavProps> = ({ currentView, setView }) => {
  const items = [
    { id: 'dashboard', icon: Home, label: 'الرئيسية' },
    { id: 'skin', icon: Heart, label: 'بشرتكِ' },
    { id: 'family', icon: Baby, label: 'طفلكِ' },
    { id: 'fitness', icon: Utensils, label: 'رشاقة' },
    { id: 'community', icon: Users, label: 'مجتمعنا' },
    { id: 'psych', icon: Sparkles, label: 'مستشاركِ' },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-2 flex justify-around items-center z-50">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button 
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'bg-pink-500 text-white scale-110' : 'text-gray-400 hover:text-pink-400'}`}
          >
            <Icon size={20} />
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;

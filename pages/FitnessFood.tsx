
import React, { useState } from 'react';
import { UserProfile, Article } from '../types';
import { getWeeklyMealPlan } from '../services/geminiService';
import { Utensils, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface FitnessFoodProps {
  user: UserProfile;
  articles: Article[];
}

const FitnessFood: React.FC<FitnessFoodProps> = ({ user, articles }) => {
  const [goal, setGoal] = useState<'lose' | 'gain' | 'maintain' | null>(null);
  const [plan, setPlan] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredArticles = articles.filter(a => a.category === 'fitness');

  const handleGenerate = async (selectedGoal: 'lose' | 'gain' | 'maintain') => {
    setGoal(selectedGoal);
    setLoading(true);
    const data = await getWeeklyMealPlan(user, selectedGoal);
    setPlan(data);
    setLoading(false);
  };

  return (
    <div className="p-4 pt-20">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">الرشاقة والغذاء</h2>

      {/* Featured Articles */}
      <div className="space-y-4 mb-8">
        {filteredArticles.map(a => (
          <div key={a.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <img src={a.image} alt={a.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-bold mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Meal Planner */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-pink-50">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="text-pink-500" />
          <h3 className="font-bold text-lg">جدولكِ الغذائي الذكي</h3>
        </div>
        
        {!plan && !loading && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">ما هو هدفكِ الصحي حالياً؟</p>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleGenerate('lose')} className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                <span className="font-bold">تخفيف الوزن</span>
                <TrendingDown />
              </button>
              <button onClick={() => handleGenerate('gain')} className="flex items-center justify-between p-4 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                <span className="font-bold">زيادة الوزن</span>
                <TrendingUp />
              </button>
              <button onClick={() => handleGenerate('maintain')} className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                <span className="font-bold">المحافظة على الوزن</span>
                <RefreshCw />
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-10 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p className="text-gray-500">جاري تصميم جدول مخصص لكِ...</p>
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-pink-500 uppercase">جدول الأسبوع</p>
              <button onClick={() => setPlan(null)} className="text-xs text-gray-400">تغيير الهدف</button>
            </div>
            {plan.map((day, idx) => (
              <div key={idx} className="border-b last:border-0 pb-4">
                <h4 className="font-bold text-rose-500 mb-2">{day.day}</h4>
                <div className="space-y-2">
                  {day.meals.map((meal: any, midx: number) => (
                    <div key={midx} className="flex gap-3 text-sm">
                      <span className="text-gray-400 w-16">{meal.time}</span>
                      <span className="font-bold text-gray-700 w-20">{meal.type}:</span>
                      <span className="text-gray-600 flex-1">{meal.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessFood;

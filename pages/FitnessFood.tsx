
import React, { useState, useEffect } from 'react';
import { UserProfile, Article } from '../types';
import { getWeeklyMealPlan } from '../services/geminiService';
import { saveUserToDB } from '../services/firebaseService';
import { Utensils, TrendingUp, TrendingDown, RefreshCw, Heart, MessageCircle } from 'lucide-react';
import ArticleView from '../components/ArticleView';

interface FitnessFoodProps {
  user: UserProfile;
  articles: Article[];
}

const FitnessFood: React.FC<FitnessFoodProps> = ({ user, articles }) => {
  const [goal, setGoal] = useState<'lose' | 'gain' | 'maintain' | null>(user.mealPlanGoal as any || null);
  const [plan, setPlan] = useState<any[] | null>(user.savedMealPlan || null);
  const [loading, setLoading] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const filteredArticles = articles.filter(a => a.category === 'fitness');
  const activeArticle = articles.find(a => a.id === selectedArticleId);

  const handleGenerate = async (selectedGoal: 'lose' | 'gain' | 'maintain') => {
    setGoal(selectedGoal);
    setLoading(true);
    const data = await getWeeklyMealPlan(user, selectedGoal);
    if (data) {
      setPlan(data);
      try {
        await saveUserToDB({ ...user, savedMealPlan: data, mealPlanGoal: selectedGoal });
      } catch (e) {
        console.error("Failed to save meal plan", e);
      }
    }
    setLoading(false);
  };

  const handleReset = () => {
    if (window.confirm("هل ترغبين في تغيير هدفكِ وإنشاء جدول جديد؟")) {
      setPlan(null);
      setGoal(null);
    }
  };

  return (
    <div className="p-4 pt-20">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">الرشاقة والغذاء</h2>

      <div className="space-y-4 mb-8">
        {filteredArticles.map(a => (
          <div key={a.id} onClick={() => setSelectedArticleId(a.id || null)} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-50 cursor-pointer">
            <img src={a.image} alt={a.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-bold mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{a.content}</p>
              
              <div className="flex items-center justify-end gap-4 text-gray-400 border-t border-pink-50 pt-2">
                <div className="flex items-center gap-1">
                  <Heart size={14} className={a.likes && a.likes > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                  <span className="text-[10px] font-bold">{a.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  <span className="text-[10px] font-bold">{a.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-md border border-pink-50 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="text-pink-500" />
            <h3 className="font-bold text-lg">جدولكِ الغذائي الذكي</h3>
          </div>
          {plan && (
            <button onClick={handleReset} className="text-xs text-pink-500 font-bold border border-pink-100 px-3 py-1 rounded-full hover:bg-pink-50">تغيير الهدف</button>
          )}
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
            <p className="text-gray-500 font-bold">جاري تصميم جدول مخصص لكِ...</p>
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            <div className="bg-pink-50 p-3 rounded-2xl text-center">
              <p className="text-xs font-bold text-pink-600">هدفكِ الحالي: {
                goal === 'lose' ? 'تخفيف الوزن' : goal === 'gain' ? 'زيادة الوزن' : 'المحافظة على الوزن'
              }</p>
            </div>
            {plan.map((day, idx) => (
              <div key={idx} className="border-b last:border-0 pb-4">
                <h4 className="font-bold text-rose-500 mb-2 border-r-4 border-rose-500 pr-2">{day.day}</h4>
                <div className="space-y-3">
                  {day.meals.map((meal: any, midx: number) => (
                    <div key={midx} className="flex flex-col bg-gray-50 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-700 text-sm">{meal.type}</span>
                        <span className="text-[10px] bg-white px-2 py-1 rounded-lg text-gray-400 shadow-sm">{meal.time}</span>
                      </div>
                      <span className="text-gray-600 text-xs leading-relaxed">{meal.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeArticle && <ArticleView article={activeArticle} user={user} onClose={() => setSelectedArticleId(null)} />}
    </div>
  );
};

export default FitnessFood;

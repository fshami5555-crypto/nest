
import React, { useState, useEffect } from 'react';
import { UserProfile, Article } from '../types';
import { getWeeklyMealPlan } from '../services/geminiService';
import { saveUserToDB } from '../services/firebaseService';
import { Utensils, TrendingUp, TrendingDown, RefreshCw, Heart, MessageCircle, X, ChevronLeft, Flame, Info, CheckCircle2 } from 'lucide-react';
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
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);

  const filteredArticles = articles.filter(a => a.category === 'fitness');
  const activeArticle = articles.find(a => a.id === selectedArticleId);

  const handleGenerate = async (selectedGoal: 'lose' | 'gain' | 'maintain') => {
    setGoal(selectedGoal);
    setLoading(true);
    const data = await getWeeklyMealPlan(user, selectedGoal);
    if (data && Array.isArray(data)) {
      setPlan(data);
      try {
        await saveUserToDB({ ...user, savedMealPlan: data, mealPlanGoal: selectedGoal });
      } catch (e) {
        console.error("Failed to save meal plan", e);
      }
    } else {
      alert("عذراً، حدث خطأ في إنشاء الجدول. حاولي مرة أخرى.");
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

      {/* قسم المقالات */}
      <div className="space-y-4 mb-10">
        {filteredArticles.map(a => (
          <div key={a.id} onClick={() => setSelectedArticleId(a.id || null)} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-50 cursor-pointer hover:shadow-md transition-shadow">
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

      {/* قسم الجدول الغذائي */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-pink-100 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-2xl text-pink-500"><Utensils size={24} /></div>
            <h3 className="font-bold text-xl text-gray-800">جدولكِ الغذائي الذكي</h3>
          </div>
          {plan && (
            <button onClick={handleReset} className="text-xs text-pink-500 font-bold bg-pink-50 px-4 py-2 rounded-full hover:bg-pink-100 transition-colors">تحديث الهدف</button>
          )}
        </div>
        
        {!plan && !loading && (
          <div className="space-y-6 relative z-10">
            <p className="text-gray-600 text-sm leading-relaxed">أخبرينا بهدفكِ الصحي لنقوم بتصميم خطة غذائية مخصصة لكِ عبر الذكاء الاصطناعي، تشمل السعرات وطرق التحضير.</p>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => handleGenerate('lose')} className="flex items-center justify-between p-5 rounded-3xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all border-2 border-orange-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm"><TrendingDown /></div>
                  <span className="font-bold">تخفيف الوزن</span>
                </div>
                <ChevronLeft />
              </button>
              <button onClick={() => handleGenerate('gain')} className="flex items-center justify-between p-5 rounded-3xl bg-green-50 text-green-700 hover:bg-green-100 transition-all border-2 border-green-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm"><TrendingUp /></div>
                  <span className="font-bold">زيادة الوزن</span>
                </div>
                <ChevronLeft />
              </button>
              <button onClick={() => handleGenerate('maintain')} className="flex items-center justify-between p-5 rounded-3xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all border-2 border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm"><RefreshCw /></div>
                  <span className="font-bold">المحافظة على الوزن</span>
                </div>
                <ChevronLeft />
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-16 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-100 border-t-pink-500"></div>
              <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500" size={24} />
            </div>
            <p className="text-gray-500 font-bold animate-pulse">جاري تحليل بياناتكِ وتصميم الجدول...</p>
          </div>
        )}

        {plan && (
          <div className="space-y-8 relative z-10">
             <div className="flex justify-center">
               <div className="bg-pink-50 px-6 py-2 rounded-full border border-pink-100">
                <p className="text-xs font-bold text-pink-600">الهدف الحالي: {
                  goal === 'lose' ? 'تخفيف الوزن' : goal === 'gain' ? 'زيادة الوزن' : 'المحافظة على الوزن'
                }</p>
               </div>
             </div>

            {plan.map((day, idx) => (
              <div key={idx} className="bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100">
                <h4 className="font-bold text-rose-500 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  {day.day}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {(day.meals || []).map((meal: any, midx: number) => (
                    <button 
                      key={midx} 
                      onClick={() => setSelectedMeal(meal)}
                      className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-200 border border-transparent transition-all group"
                    >
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">{meal.type}</span>
                        <span className="font-bold text-gray-800 text-sm group-hover:text-pink-600 transition-colors">{meal.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
                          <Flame size={10} />
                          <span className="font-bold">{meal.calories} كـالوري</span>
                        </div>
                        <ChevronLeft size={16} className="text-gray-300 group-hover:text-pink-400 group-hover:translate-x-[-4px] transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال تفاصيل الوجبة */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-pink-500 uppercase">{selectedMeal.type}</span>
                <h3 className="font-bold text-xl text-gray-800">{selectedMeal.title}</h3>
              </div>
              <button onClick={() => setSelectedMeal(null)} className="p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-pink-50 hover:text-pink-500 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* لوحة السعرات والماكروز */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                  <Flame className="mx-auto text-orange-500 mb-1" size={16} />
                  <p className="text-[10px] text-orange-400">سعرات</p>
                  <p className="font-bold text-orange-700">{selectedMeal.calories}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-[10px] text-blue-400">بروتين</p>
                  <p className="font-bold text-blue-700">{selectedMeal.macros?.protein}ج</p>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-[10px] text-green-400">كربوهيدرات</p>
                  <p className="font-bold text-green-700">{selectedMeal.macros?.carbs}ج</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-[10px] text-purple-400">دهون</p>
                  <p className="font-bold text-purple-700">{selectedMeal.macros?.fat}ج</p>
                </div>
              </div>

              {/* المكونات */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <Utensils size={18} className="text-pink-500" />
                  المكونات الرئيسية
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedMeal.ingredients || []).map((ing: string, i: number) => (
                    <span key={i} className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-600 border border-gray-200">{ing}</span>
                  ))}
                </div>
              </div>

              {/* طريقة التحضير */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  طريقة التحضير
                </h4>
                <div className="space-y-3">
                  {(selectedMeal.instructions || []).map((step: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-pink-500 shadow-sm border border-pink-100 text-xs">{i + 1}</span>
                      <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-pink-50 border-t border-pink-100">
              <p className="text-[10px] text-center text-pink-400 italic">"صحتكِ تبدأ من مطبخكِ يا جميلة. استمتعي بوجبتكِ!" 🌸</p>
            </div>
          </div>
        </div>
      )}

      {activeArticle && <ArticleView article={activeArticle} user={user} onClose={() => setSelectedArticleId(null)} />}
    </div>
  );
};

export default FitnessFood;

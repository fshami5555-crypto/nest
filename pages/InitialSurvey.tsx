
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface InitialSurveyProps {
  user: UserProfile;
  onComplete: (data: Partial<UserProfile>) => void;
}

const InitialSurvey: React.FC<InitialSurveyProps> = ({ user, onComplete }) => {
  // بيانات الحمل
  const [expectedDueDate, setExpectedDueDate] = useState('');
  const [babyGender, setBabyGender] = useState<'boy' | 'girl' | 'not_yet'>('not_yet');

  // بيانات الدورة
  const [stillGetsPeriod, setStillGetsPeriod] = useState<boolean | null>(null);
  const [nextPeriodDay, setNextPeriodDay] = useState<number>(1);
  const [issues, setIssues] = useState('');

  // حساب العمر
  const birthYear = new Date(user.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  const isPregnant = user.motherhoodStatus === 'pregnant';
  const isOver40 = age > 40;

  const handleFinish = () => {
    const data: Partial<UserProfile> = {};
    
    if (isPregnant) {
      data.expectedDueDate = expectedDueDate;
      data.babyGender = babyGender;
    } else {
      if (isOver40) {
        data.stillGetsPeriod = stillGetsPeriod === true;
        if (stillGetsPeriod) {
          data.nextPeriodDay = nextPeriodDay;
          data.periodIssues = issues;
        }
      } else {
        data.nextPeriodDay = nextPeriodDay;
        data.periodIssues = issues;
      }
    }
    
    onComplete(data);
  };

  return (
    <div className="min-h-screen p-8 bg-pink-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-50 rounded-full opacity-50"></div>
        
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-2 relative z-10">مرحباً {user.name} في بيتك الجديد!</h1>
        <p className="text-gray-500 mb-8 text-center text-sm relative z-10 italic">"مكانكِ الآمن للعناية بكل تفاصيلكِ"</p>
        
        <div className="space-y-6 relative z-10">
          {isPregnant ? (
            /* واجهة الحامل */
            <>
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">الموعد المتوقع للولادة</label>
                <input 
                  type="date" 
                  value={expectedDueDate}
                  onChange={(e) => setExpectedDueDate(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl outline-none border border-pink-200 focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">جنس المولود</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setBabyGender('boy')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all ${babyGender === 'boy' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-blue-500 border border-blue-100'}`}
                  >
                    ولد 👦
                  </button>
                  <button 
                    onClick={() => setBabyGender('girl')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all ${babyGender === 'girl' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-pink-500 border border-pink-100'}`}
                  >
                    بنت 👧
                  </button>
                  <button 
                    onClick={() => setBabyGender('not_yet')}
                    className={`p-3 rounded-xl text-xs font-bold transition-all ${babyGender === 'not_yet' ? 'bg-gray-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'}`}
                  >
                    لم أكتشف بعد
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* واجهة غير الحامل (عادية أو فوق 40) */
            <>
              {isOver40 && (
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 mb-4">
                  <label className="block text-sm font-bold text-purple-700 mb-3">هل لا زالت تأتيكِ الدورة الشهرية؟</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStillGetsPeriod(true)}
                      className={`flex-1 p-3 rounded-xl font-bold transition-all ${stillGetsPeriod === true ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border border-purple-200'}`}
                    >
                      نعم
                    </button>
                    <button 
                      onClick={() => setStillGetsPeriod(false)}
                      className={`flex-1 p-3 rounded-xl font-bold transition-all ${stillGetsPeriod === false ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-600 border border-purple-200'}`}
                    >
                      لا
                    </button>
                  </div>
                </div>
              )}

              {(!isOver40 || stillGetsPeriod === true) && (
                <>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">موعد الدورة الشهرية القادمة (يوم من الشهر)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1" max="31"
                        value={nextPeriodDay}
                        onChange={(e) => setNextPeriodDay(parseInt(e.target.value))}
                        className="w-full p-3 bg-white rounded-xl outline-none border border-pink-200 focus:ring-2 focus:ring-pink-300 pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300">📅</span>
                    </div>
                  </div>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">هل تعانين من أي مشاكل أو أوجاع أثناء الدورة؟</label>
                    <textarea 
                      value={issues}
                      onChange={(e) => setIssues(e.target.value)}
                      placeholder="مثلاً: ألم في الظهر، صداع، تقلبات مزاجية..."
                      className="w-full p-3 bg-white rounded-xl outline-none border border-pink-200 h-24 focus:ring-2 focus:ring-pink-300 text-sm"
                    />
                  </div>
                </>
              )}

              {isOver40 && stillGetsPeriod === false && (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-sm text-center font-bold animate-in fade-in duration-500">
                  شكراً لمشاركتنا، سنقوم بتوفير محتوى مخصص يتناسب مع مرحلتكِ الحالية بكل حب.
                </div>
              )}
            </>
          )}

          <button 
            onClick={handleFinish}
            disabled={isOver40 && !isPregnant && stillGetsPeriod === null}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-bold p-5 rounded-2xl shadow-xl transition-all active:scale-95 mt-4"
          >
            ابدئي رحلتكِ الآن ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialSurvey;

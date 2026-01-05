
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface InitialSurveyProps {
  user: UserProfile;
  onComplete: (data: Partial<UserProfile>) => void;
}

const InitialSurvey: React.FC<InitialSurveyProps> = ({ user, onComplete }) => {
  const [expectedDueDate, setExpectedDueDate] = useState('');
  const [babyGender, setBabyGender] = useState<'boy' | 'girl' | 'not_yet'>('not_yet');
  const [stillGetsPeriod, setStillGetsPeriod] = useState<boolean | null>(null);
  const [lastPeriodEndDate, setLastPeriodEndDate] = useState('');
  const [issues, setIssues] = useState('');

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
          processPeriodLogic(data);
        }
      } else {
        processPeriodLogic(data);
      }
    }
    onComplete(data);
  };

  const processPeriodLogic = (data: Partial<UserProfile>) => {
    if (lastPeriodEndDate) {
      data.lastPeriodEndDate = lastPeriodEndDate;
      // حساب الموعد القادم بشكل دقيق
      const endDate = new Date(lastPeriodEndDate);
      endDate.setHours(0,0,0,0);
      
      const nextDate = new Date(endDate);
      nextDate.setDate(endDate.getDate() + 25); // الدورة القادمة تبدأ بعد 25 يوم من انتهاء الأخيرة (تقريبياً)
      
      data.nextPeriodDate = nextDate.toISOString().split('T')[0];
    }
    data.periodIssues = issues;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen p-8 bg-pink-50 flex flex-col items-center justify-center font-sans" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-100">
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-6">مرحباً {user.name} ✨</h1>
        
        <div className="space-y-6">
          {isPregnant ? (
            <>
              <div className="bg-pink-50/50 p-4 rounded-2xl">
                <label className="block text-sm font-bold text-gray-700 mb-2">الموعد المتوقع للولادة</label>
                <input type="date" value={expectedDueDate} onChange={(e) => setExpectedDueDate(e.target.value)} className="w-full p-3 rounded-xl border-pink-200 border outline-none" />
              </div>
            </>
          ) : (
            <>
              {isOver40 && (
                <div className="p-4 bg-purple-50 rounded-2xl text-center">
                  <p className="text-sm font-bold mb-4">هل لا زالت تأتيكِ الدورة؟</p>
                  <div className="flex gap-4">
                    <button onClick={() => setStillGetsPeriod(true)} className={`flex-1 p-3 rounded-xl ${stillGetsPeriod === true ? 'bg-purple-600 text-white' : 'bg-white border'}`}>نعم</button>
                    <button onClick={() => setStillGetsPeriod(false)} className={`flex-1 p-3 rounded-xl ${stillGetsPeriod === false ? 'bg-purple-600 text-white' : 'bg-white border'}`}>لا</button>
                  </div>
                </div>
              )}

              {(!isOver40 || stillGetsPeriod === true) && (
                <div className="bg-pink-50/50 p-4 rounded-2xl">
                  <label className="block text-sm font-bold text-gray-700 mb-2">متى انتهت آخر دورة لكِ؟</label>
                  <input 
                    type="date" 
                    max={today}
                    value={lastPeriodEndDate} 
                    onChange={(e) => setLastPeriodEndDate(e.target.value)} 
                    className="w-full p-3 rounded-xl border-pink-200 border outline-none" 
                  />
                  <p className="text-[10px] text-gray-400 mt-2 italic">* سنقوم بحساب موعدكِ القادم تلقائياً ليكون دقيقاً.</p>
                </div>
              )}
            </>
          )}

          <button 
            onClick={handleFinish}
            disabled={(!isPregnant && !lastPeriodEndDate && (!isOver40 || stillGetsPeriod))}
            className="w-full bg-pink-500 text-white font-bold p-5 rounded-2xl shadow-lg disabled:bg-gray-300"
          >
            ابدئي رحلتكِ معنا 🌸
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialSurvey;

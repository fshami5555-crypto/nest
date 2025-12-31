
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface InitialSurveyProps {
  user: UserProfile;
  onComplete: (data: Partial<UserProfile>) => void;
}

const InitialSurvey: React.FC<InitialSurveyProps> = ({ user, onComplete }) => {
  const [nextPeriodDay, setNextPeriodDay] = useState<number>(1);
  const [issues, setIssues] = useState('');

  return (
    <div className="min-h-screen p-8 bg-pink-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-6">مرحباً {user.name} في بيتك الجديد!</h1>
        <p className="text-gray-600 mb-8 text-center text-sm">لنكمل بعض المعلومات لنعتني بكِ بشكل أفضل.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">موعد الدورة الشهرية القادمة (يوم من الشهر)</label>
            <input 
              type="number" 
              min="1" max="31"
              value={nextPeriodDay}
              onChange={(e) => setNextPeriodDay(parseInt(e.target.value))}
              className="w-full p-3 bg-pink-50 rounded-xl outline-none border border-pink-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">هل تعانين من أي مشاكل أو أوجاع أثناء الدورة؟</label>
            <textarea 
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder="مثلاً: ألم في الظهر، صداع..."
              className="w-full p-3 bg-pink-50 rounded-xl outline-none border border-pink-100 h-24"
            />
          </div>
          <button 
            onClick={() => onComplete({ nextPeriodDay, periodIssues: issues })}
            className="w-full bg-pink-500 text-white font-bold p-4 rounded-xl shadow-lg"
          >
            ابدئي رحلتك
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialSurvey;


import React, { useState } from 'react';
import { UserProfile, MaritalStatus, MotherhoodStatus } from '../types';

interface SignupProps {
  setView: (v: any) => void;
  onSignup: (u: UserProfile) => void;
}

const Signup: React.FC<SignupProps> = ({ setView, onSignup }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    maritalStatus: 'single',
    motherhoodStatus: 'none',
    isPeriodActive: false
  });
  const [password, setPassword] = useState('');

  const steps = [
    { label: 'الاسم', key: 'name', type: 'text', guide: 'أهلاً بكِ! أخبريني ما هو اسمكِ الجميل؟' },
    { label: 'تاريخ الميلاد', key: 'birthDate', type: 'date', guide: 'متى نحتفل بعيد ميلادك؟' },
    { label: 'الحالة الاجتماعية', key: 'maritalStatus', type: 'marital', guide: 'هل أنتِ مرتبطة أم لا زلتِ فراشة طليقة؟' },
    { label: 'الطول (سم)', key: 'height', type: 'number', guide: 'ما هو طولكِ الرائع؟' },
    { label: 'الوزن (كجم)', key: 'weight', type: 'number', guide: 'والآن، ما هو وزنكِ الحالي؟' },
    { label: 'أمراض مزمنة', key: 'chronicDiseases', type: 'text', guide: 'هل تعانين من أي أمراض مزمنة كالسكر أو الضغط؟' },
    { label: 'عمليات سابقة', key: 'previousSurgeries', type: 'text', guide: 'هل أجريتِ أي عمليات طبية سابقاً؟' },
    { label: 'رقم الهاتف', key: 'phone', type: 'tel', guide: 'أحتاج رقم هاتفكِ للتواصل.' },
    { label: 'كلمة السر', key: 'password', type: 'password', guide: 'وأخيراً، ضعي كلمة سر قوية لحماية حسابك.' }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onSignup(formData as UserProfile);
      setView('survey');
    }
  };

  const updateField = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const renderField = () => {
    const s = steps[step];
    if (s.type === 'marital') {
      return (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button 
              onClick={() => updateField('maritalStatus', 'single')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${formData.maritalStatus === 'single' ? 'bg-pink-100 border-pink-500' : 'bg-gray-50 border-gray-100'}`}
            >عزباء</button>
            <button 
              onClick={() => updateField('maritalStatus', 'married')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${formData.maritalStatus === 'married' ? 'bg-pink-100 border-pink-500' : 'bg-gray-50 border-gray-100'}`}
            >متزوجة</button>
          </div>
          {formData.maritalStatus === 'married' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة الحالية:</label>
              <select 
                onChange={(e) => updateField('motherhoodStatus', e.target.value as MotherhoodStatus)}
                className="w-full p-3 bg-pink-50 border border-pink-100 rounded-xl"
              >
                <option value="none">اختر</option>
                <option value="pregnant">حامل</option>
                <option value="not_pregnant">غير حامل</option>
                <option value="mother">أم لأطفال</option>
              </select>
            </div>
          )}
        </div>
      );
    }

    if (s.type === 'password') {
      return (
        <input 
          type="password"
          className="w-full p-3 bg-pink-50 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      );
    }

    return (
      <input 
        type={s.type}
        className="w-full p-3 bg-pink-50 border border-pink-100 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
        value={(formData as any)[s.key] || ''}
        onChange={(e) => updateField(s.key, e.target.value)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-white relative overflow-hidden">
      <button onClick={() => setView('login')} className="absolute top-6 left-6 text-pink-600 font-bold">إلغاء</button>
      
      <div className="mt-20">
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-8">
          <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-pink-600">{steps[step].label}</h2>
        <div className="mb-10">
          {renderField()}
        </div>
        
        <button 
          onClick={handleNext}
          className="w-full bg-pink-500 text-white p-4 rounded-2xl shadow-lg font-bold hover:bg-pink-600 transition-colors"
        >
          {step === steps.length - 1 ? 'إنهاء التسجيل' : 'التالي'}
        </button>
      </div>

      {/* Floating Character */}
      <div className="mt-auto pt-10 flex items-end gap-4 animate-bounce-slow">
        <div className="relative">
          <div className="bg-pink-100 p-4 rounded-2xl rounded-bl-none text-pink-800 text-sm border border-pink-200 shadow-sm max-w-[200px]">
            {steps[step].guide}
          </div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-100 transform rotate-45 border-r border-b border-pink-200"></div>
        </div>
        <img src="https://i.ibb.co/gLL91v09/1.png" alt="Character" className="w-20 h-20 rounded-full object-cover border-4 border-pink-200 shadow-lg" />
      </div>
    </div>
  );
};

export default Signup;

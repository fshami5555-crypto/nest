
import React from 'react';
import { UserProfile, Article } from '../types';

interface SkinCareProps {
  user: UserProfile;
  articles: Article[];
}

const SkinCare: React.FC<SkinCareProps> = ({ user, articles }) => {
  const filtered = articles.filter(a => {
    if (a.category !== 'skin') return false;
    if (a.targetMarital !== 'all' && a.targetMarital !== user.maritalStatus) return false;
    // Simple age filtering
    const age = new Date().getFullYear() - new Date(user.birthDate).getFullYear();
    if (age < a.ageRange[0] || age > a.ageRange[1]) return false;
    return true;
  });

  return (
    <div className="p-4 pt-20">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">العناية والبشرة</h2>
      <div className="space-y-6">
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50">
            <img src={a.image} className="w-full h-56 object-cover" alt="" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">{a.title}</h3>
              <p className="text-gray-600 leading-relaxed">{a.content}</p>
              <button className="mt-4 text-pink-500 font-bold">اقرئي المزيد...</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">لا توجد مقالات مخصصة لكِ حالياً.</p>}
      </div>
    </div>
  );
};

export default SkinCare;

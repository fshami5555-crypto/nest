
import React, { useState } from 'react';
import { UserProfile, Article } from '../types';
import ArticleView from '../components/ArticleView';
import { Heart, MessageCircle } from 'lucide-react';

interface FamilyCareProps {
  user: UserProfile;
  articles: Article[];
}

const FamilyCare: React.FC<FamilyCareProps> = ({ user, articles }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const filtered = articles.filter(a => {
    if (a.category !== 'family') return false;
    if (a.targetMarital !== 'all' && a.targetMarital !== user.maritalStatus) return false;
    if (a.targetMotherhood !== 'all' && a.targetMotherhood !== user.motherhoodStatus) return false;
    return true;
  });

  const activeArticle = articles.find(a => a.id === selectedArticleId);

  return (
    <div className="p-4 pt-20">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">الطفل والأسرة</h2>
      <div className="space-y-6">
        {filtered.map(a => (
          <div key={a.id} onClick={() => setSelectedArticleId(a.id || null)} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50 cursor-pointer active:scale-95 transition-transform">
            <img src={a.image} className="w-full h-56 object-cover" alt="" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">{a.title}</h3>
              <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">{a.content}</p>
              
              <div className="flex items-center justify-between border-t border-pink-50 pt-4">
                <button className="text-pink-500 font-bold text-sm">اقرئي المزيد...</button>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Heart size={16} className={a.likes && a.likes > 0 ? 'fill-pink-500 text-pink-500' : ''} />
                    <span className="text-xs font-bold">{a.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span className="text-xs font-bold">{a.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white p-10 rounded-3xl text-center shadow-sm">
            <p className="text-gray-400">هذا القسم يظهر فيه ما يناسب فئتكِ العمرية وحالتكِ الاجتماعية.</p>
          </div>
        )}
      </div>
      {activeArticle && <ArticleView article={activeArticle} user={user} onClose={() => setSelectedArticleId(null)} />}
    </div>
  );
};

export default FamilyCare;

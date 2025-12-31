
import React, { useState } from 'react';
import { Article, UserProfile, Comment } from '../types';
import { X, Heart, MessageCircle, Share2, Send, Check } from 'lucide-react';
import { addCommentToArticle, likeArticleInDB } from '../services/firebaseService';

interface ArticleViewProps {
  article: Article;
  user: UserProfile;
  onClose: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, user, onClose }) => {
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (article.id) {
      likeArticleInDB(article.id, article.likes || 0);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !article.id) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userName: user.name,
      text: commentText,
      isAdminReply: false
    };
    await addCommentToArticle(article.id, newComment);
    setCommentText('');
  };

  const handleCopyLink = () => {
    const url = window.location.href + '?article=' + article.id;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto pb-20 animate-in slide-in-from-bottom duration-300">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center z-10">
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600"><X size={20} /></button>
        <span className="font-bold text-pink-600">Nestgirl</span>
        <button onClick={handleCopyLink} className="p-2 bg-pink-50 rounded-full text-pink-600 relative">
          {copied ? <Check size={20} /> : <Share2 size={20} />}
          {copied && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded">تم النسخ</span>}
        </button>
      </header>

      <div className="max-w-2xl mx-auto">
        <img src={article.image} className="w-full h-72 object-cover" alt="" />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 leading-tight">{article.title}</h1>
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-8">
            <span>{new Date(article.createdAt || Date.now()).toLocaleDateString('ar-EG')}</span>
            <span className="bg-pink-100 text-pink-500 px-3 py-1 rounded-full text-xs font-bold">{article.category === 'skin' ? 'بشرة' : article.category === 'family' ? 'أسرة' : 'رشاقة'}</span>
          </div>
          
          <div className="prose prose-pink max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-wrap mb-10">
            {article.content}
          </div>

          <div className="flex items-center gap-6 py-6 border-t border-b mb-8">
            <button onClick={handleLike} className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors">
              <Heart size={24} className={article.likes && article.likes > 0 ? 'fill-pink-500 text-pink-500' : ''} />
              <span className="font-bold">{article.likes || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle size={24} />
              <span className="font-bold">{article.comments?.length || 0}</span>
            </div>
          </div>

          <section className="space-y-6">
            <h3 className="text-xl font-bold">التعليقات</h3>
            <div className="space-y-4">
              {article.comments?.map(c => (
                <div key={c.id} className={`p-4 rounded-2xl ${c.isAdminReply ? 'bg-pink-50 border border-pink-100' : 'bg-gray-50'}`}>
                  <p className="font-bold text-pink-600 text-sm mb-1">{c.userName} {c.isAdminReply && <span className="bg-pink-200 text-[10px] px-1 rounded mr-2">إدارة</span>}</p>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              ))}
              {(!article.comments || article.comments.length === 0) && <p className="text-gray-400 text-center py-4">لا توجد تعليقات بعد. كن أول من يعلق!</p>}
            </div>

            <div className="flex gap-2 mt-6">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="شاركينا برأيك..."
                className="flex-1 p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button onClick={handleAddComment} className="bg-pink-500 text-white p-4 rounded-2xl shadow-lg active:scale-95"><Send size={24} /></button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;

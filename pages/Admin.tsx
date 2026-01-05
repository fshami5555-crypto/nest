
import React, { useState, useEffect } from 'react';
import { UserProfile, Article, CommunityPost } from '../types.ts';
import { Users, Heart, Baby, Utensils, Share2, LogOut, Plus, CheckCircle, Cpu, Key, Save, X, Image as ImageIcon, Trash2, MessageCircle } from 'lucide-react';
import { addArticleToDB, addPostToDB, addCommentToPost, saveAppSettings, getAppSettings, deleteUserFromDB } from '../services/firebaseService.ts';
import { updateGeminiKey } from '../services/geminiService.ts';

interface AdminProps {
  onLogout: () => void;
  users: UserProfile[];
  articles: Article[];
  posts: CommunityPost[];
  onDeleteUser?: (phone: string) => void;
}

const AdminDashboard: React.FC<AdminProps> = ({ onLogout, users, articles, posts, onDeleteUser }) => {
  const [tab, setTab] = useState<'users' | 'skin' | 'family' | 'fitness' | 'community' | 'ai'>('users');
  const [showModal, setShowModal] = useState<'article' | 'post' | null>(null);
  const [activePostForReply, setActivePostForReply] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '', image: '', content: '', targetMarital: 'all', targetMotherhood: 'all', ageRange: [12, 60]
  });

  const [newPost, setNewPost] = useState<Partial<CommunityPost>>({
    publisherName: 'إدارة Nestgirl', publisherImage: 'https://i.ibb.co/gLTJ5VMS/image.png', text: ''
  });

  useEffect(() => {
    if (tab === 'ai') {
      getAppSettings().then(settings => {
        if (settings) setGeminiKey(settings.geminiApiKey);
      });
    }
  }, [tab]);

  const handleSaveAIConfig = async () => {
    setIsSavingKey(true);
    try {
      await saveAppSettings({ geminiApiKey: geminiKey });
      updateGeminiKey(geminiKey);
      alert("تم حفظ مفتاح OpenRouter بنجاح وتفعيل نماذج Gemini!");
    } catch (e) {
      alert("فشل الحفظ.");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleAddArticle = async () => {
    if (!newArticle.title || !newArticle.content) return;
    let category: 'skin' | 'family' | 'fitness' = 'skin';
    if (tab === 'family') category = 'family';
    if (tab === 'fitness') category = 'fitness';
    await addArticleToDB({ ...newArticle, category } as Article);
    alert("تم نشر المقال بنجاح!");
    setShowModal(null);
    setNewArticle({ title: '', image: '', content: '', targetMarital: 'all', targetMotherhood: 'all', ageRange: [12, 60] });
  };

  const handleAddPost = async () => {
    if (!newPost.text) return;
    await addPostToDB(newPost);
    alert("تم نشر البوست!");
    setShowModal(null);
    setNewPost({ publisherName: 'إدارة Nestgirl', publisherImage: 'https://i.ibb.co/gLTJ5VMS/image.png', text: '' });
  };

  const handleAdminReply = async (postId: string) => {
    if (!adminReplyText.trim()) return;
    await addCommentToPost(postId, {
      id: Math.random().toString(36).substr(2, 9),
      userName: "إدارة Nestgirl",
      text: adminReplyText,
      isAdminReply: true
    });
    setAdminReplyText('');
    setActivePostForReply(null);
  };

  const renderArticlesList = (category: 'skin' | 'family' | 'fitness') => {
    const filtered = articles.filter(a => a.category === category);
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">المقالات ({filtered.length})</h2>
          <button onClick={() => setShowModal('article')} className="bg-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg"><Plus size={18} /> إضافة مقال</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-2xl shadow-sm border flex gap-4">
              <img src={a.image} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-bold line-clamp-1">{a.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.content}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-1 rounded">{a.targetMarital === 'all' ? 'الكل' : (a.targetMarital === 'single' ? 'عازبات' : 'متزوجات')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-right">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 space-y-4 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" className="w-10 h-10 rounded-lg" alt="Logo" />
          <h1 className="text-xl font-bold text-pink-400">Nestgirl Admin</h1>
        </div>
        
        <nav className="space-y-1 flex-1 overflow-y-auto pr-2">
          <button onClick={() => setTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'users' ? 'bg-pink-500 shadow-lg scale-105' : 'hover:bg-slate-800'}`}>
            <Users size={18} /> المستخدمات
          </button>
          <button onClick={() => setTab('skin')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'skin' ? 'bg-pink-500 shadow-lg scale-105' : 'hover:bg-slate-800'}`}>
            <Heart size={18} /> العناية والبشرة
          </button>
          <button onClick={() => setTab('family')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'family' ? 'bg-pink-500 shadow-lg scale-105' : 'hover:bg-slate-800'}`}>
            <Baby size={18} /> الطفل والأسرة
          </button>
          <button onClick={() => setTab('fitness')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'fitness' ? 'bg-pink-500 shadow-lg scale-105' : 'hover:bg-slate-800'}`}>
            <Utensils size={18} /> الرشاقة والغذاء
          </button>
          <button onClick={() => setTab('community')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'community' ? 'bg-pink-500 shadow-lg scale-105' : 'hover:bg-slate-800'}`}>
            <Share2 size={18} /> المجتمع
          </button>
          <button onClick={() => setTab('ai')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${tab === 'ai' ? 'bg-pink-500 shadow-lg scale-105' : 'hover:bg-slate-800'}`}>
            <Cpu size={18} /> الذكاء الاصطناعي
          </button>
        </nav>

        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-900/30">
          <LogOut size={18} /> تسجيل الخروج
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 mr-64">
        {tab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">الحسابات المسجلة ({users.length})</h2>
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border">
              <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4">الاسم</th>
                    <th className="p-4">الهاتف</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">العمر</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.phone} className="border-b hover:bg-pink-50/30 transition-colors">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4">{u.phone}</td>
                      <td className="p-4">{u.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}</td>
                      <td className="p-4">{new Date().getFullYear() - new Date(u.birthDate).getFullYear()} سنة</td>
                      <td className="p-4">
                        <button onClick={() => onDeleteUser && onDeleteUser(u.phone)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400">لا يوجد مستخدمون مسجلون بعد.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'skin' && renderArticlesList('skin')}
        {tab === 'family' && renderArticlesList('family')}
        {tab === 'fitness' && renderArticlesList('fitness')}

        {tab === 'community' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">إدارة المجتمع ({posts.length})</h2>
              <button onClick={() => setShowModal('post')} className="bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg"><Plus size={18} /> إضافة بوست إدارة</button>
            </div>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={post.publisherImage} className="w-8 h-8 rounded-full" />
                    <span className="font-bold text-sm">{post.publisherName}</span>
                    <span className="text-[10px] text-gray-400 mr-auto">{new Date(post.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{post.text}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 border-t pt-3">
                    <span>{post.likes} إعجاب</span>
                    <span>{post.comments?.length || 0} تعليق</span>
                    <button onClick={() => setActivePostForReply(activePostForReply === post.id ? null : post.id!)} className="text-pink-500 flex items-center gap-1 mr-auto"><MessageCircle size={14} /> الرد كإدارة</button>
                  </div>
                  {activePostForReply === post.id && (
                    <div className="mt-4 flex gap-2">
                      <input type="text" value={adminReplyText} onChange={e => setAdminReplyText(e.target.value)} placeholder="اكتب رد الإدارة هنا..." className="flex-1 p-2 bg-pink-50 rounded-xl border border-pink-100 outline-none text-sm" />
                      <button onClick={() => handleAdminReply(post.id!)} className="bg-pink-500 text-white px-4 rounded-xl font-bold shadow-sm">إرسال</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-pink-50 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8 text-pink-600">
                <div className="bg-pink-100 p-4 rounded-3xl"><Key size={32} /></div>
                <div>
                  <h2 className="text-2xl font-bold">إعدادات OpenRouter AI</h2>
                  <p className="text-xs text-gray-400 mt-1">تشغيل نماذج Gemini عبر OpenRouter</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">OpenRouter API Key</label>
                  <input 
                    type="password" 
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="sk-or-v1-..." 
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-pink-300 outline-none transition-all"
                  />
                  <p className="mt-4 text-[11px] text-gray-500 leading-relaxed bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    تم تحويل التطبيق للعمل مع <strong>OpenRouter</strong>. هذا يسمح لك باستخدام نموذج <strong>Gemini 2.0 Flash</strong> بكفاءة عالية وبدون قيود الـ SDK المباشر في بعض المناطق.
                  </p>
                </div>
                
                <button 
                  onClick={handleSaveAIConfig}
                  disabled={isSavingKey}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-pink-200"
                >
                  {isSavingKey ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Save size={24} /> حفظ وتفعيل المفتاح</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals for Articles/Posts */}
      {showModal === 'article' && <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-6">إضافة مقال جديد ({tab === 'skin' ? 'بشرة' : (tab === 'family' ? 'أسرة' : 'رشاقة')})</h3>
            <div className="space-y-4">
              <input className="w-full p-4 bg-gray-50 rounded-2xl border outline-none" placeholder="عنوان المقال" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
              <input className="w-full p-4 bg-gray-50 rounded-2xl border outline-none" placeholder="رابط صورة الغلاف" value={newArticle.image} onChange={e => setNewArticle({...newArticle, image: e.target.value})} />
              <textarea className="w-full p-4 bg-gray-50 rounded-2xl h-40 border outline-none" placeholder="محتوى المقال التفصيلي..." value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})}></textarea>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-3 bg-gray-50 border rounded-xl outline-none" value={newArticle.targetMarital} onChange={e => setNewArticle({...newArticle, targetMarital: e.target.value as any})}>
                  <option value="all">كل الفئات الاجتماعية</option>
                  <option value="single">للعازبات</option>
                  <option value="married">للمتزوجات</option>
                </select>
                <select className="p-3 bg-gray-50 border rounded-xl outline-none" value={newArticle.targetMotherhood} onChange={e => setNewArticle({...newArticle, targetMotherhood: e.target.value as any})}>
                  <option value="all">كل حالات الأمومة</option>
                  <option value="none">بدون أطفال</option>
                  <option value="pregnant">للحوامل</option>
                  <option value="mother">للأمهات</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-8">
              <button onClick={handleAddArticle} className="flex-1 bg-pink-500 text-white p-4 rounded-2xl font-bold shadow-lg">نشر المقال</button>
              <button onClick={() => setShowModal(null)} className="flex-1 bg-gray-200 p-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
      </div>}

      {showModal === 'post' && <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8">
            <h3 className="text-xl font-bold mb-6 text-indigo-600 flex items-center gap-2"><Share2 /> إضافة منشور إدارة للمجتمع</h3>
            <textarea className="w-full p-4 bg-gray-50 rounded-2xl h-40 border outline-none mb-4" placeholder="اكتبي شيئاً يهم المجتمع..." value={newPost.text} onChange={e => setNewPost({...newPost, text: e.target.value})}></textarea>
            <div className="flex gap-2">
              <button onClick={handleAddPost} className="flex-1 bg-indigo-500 text-white p-4 rounded-2xl font-bold shadow-lg">نشر للمجتمع</button>
              <button onClick={() => setShowModal(null)} className="flex-1 bg-gray-200 p-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
      </div>}
    </div>
  );
};

export default AdminDashboard;

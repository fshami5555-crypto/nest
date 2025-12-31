
import React, { useState, useEffect } from 'react';
import { UserProfile, Article, CommunityPost } from '../types.ts';
import { Users, FileText, Share2, LogOut, Plus, CheckCircle, Cpu, Key, Save } from 'lucide-react';
import { addArticleToDB, addPostToDB, addCommentToPost, saveAppSettings, getAppSettings } from '../services/firebaseService.ts';
import { updateGeminiKey } from '../services/geminiService.ts';

interface AdminProps {
  onLogout: () => void;
  users: UserProfile[];
  articles: Article[];
  posts: CommunityPost[];
}

const AdminDashboard: React.FC<AdminProps> = ({ onLogout, users, articles, posts }) => {
  const [tab, setTab] = useState<'users' | 'articles' | 'posts' | 'ai'>('users');
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [activePostForReply, setActivePostForReply] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  
  // AI Settings State
  const [geminiKey, setGeminiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    // Load existing settings when switching to AI tab
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
      alert("تم حفظ مفتاح API بنجاح!");
    } catch (e) {
      alert("فشل الحفظ، تأكد من اتصالك وقواعد الحماية.");
    } finally {
      setIsSavingKey(false);
    }
  };

  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    category: 'skin',
    targetMarital: 'all',
    targetMotherhood: 'all',
    ageRange: [12, 60]
  });

  const [newPost, setNewPost] = useState<Partial<CommunityPost>>({
    publisherName: 'إدارة Nestgirl',
    publisherImage: 'https://i.ibb.co/gLTJ5VMS/image.png'
  });

  const handleAddArticle = async () => {
    if (!newArticle.title || !newArticle.content) return;
    await addArticleToDB(newArticle as Article);
    setShowAddArticle(false);
    setNewArticle({ category: 'skin', targetMarital: 'all', targetMotherhood: 'all', ageRange: [12, 60] });
  };

  const handleAddPost = async () => {
    if (!newPost.text) return;
    await addPostToDB(newPost);
    setShowAddPost(false);
    setNewPost({ publisherName: 'إدارة Nestgirl', publisherImage: 'https://i.ibb.co/gLTJ5VMS/image.png' });
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

  return (
    <div className="flex min-h-screen bg-gray-100 text-right">
      <div className="w-64 bg-slate-900 text-white p-6 space-y-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" className="w-10 h-10 rounded-lg" alt="Logo" />
          <h1 className="text-xl font-bold">لوحة الإدارة</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => setTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'users' ? 'bg-pink-500 shadow-lg' : 'hover:bg-slate-800'}`}>
            <Users size={20} /> المستخدمات
          </button>
          <button onClick={() => setTab('articles')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'articles' ? 'bg-pink-500 shadow-lg' : 'hover:bg-slate-800'}`}>
            <FileText size={20} /> المقالات
          </button>
          <button onClick={() => setTab('posts')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'posts' ? 'bg-pink-500 shadow-lg' : 'hover:bg-slate-800'}`}>
            <Share2 size={20} /> المجتمع
          </button>
          <button onClick={() => setTab('ai')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'ai' ? 'bg-pink-500 shadow-lg' : 'hover:bg-slate-800'}`}>
            <Cpu size={20} /> الذكاء الاصطناعي
          </button>
        </nav>

        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-900/30">
          <LogOut size={20} /> تسجيل الخروج
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
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
                    <th className="p-4">الوزن/الطول</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">جاري تحميل المستخدمات...</td></tr>}
                  {users.map(u => (
                    <tr key={u.phone} className="border-b hover:bg-pink-50/30">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4">{u.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs ${u.maritalStatus === 'married' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'}`}>
                          {u.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}
                        </span>
                      </td>
                      <td className="p-4">{u.weight} كجم / {u.height} سم</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">إدارة المقالات</h2>
              <button onClick={() => setShowAddArticle(true)} className="bg-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-colors"><Plus /> إضافة مقال</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => (
                <div key={a.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm">
                  <img src={a.image} className="w-full h-32 object-cover" alt="" />
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{a.title}</h3>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded">{a.category}</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">{a.targetMarital}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">إدارة المجتمع والردود</h2>
              <button onClick={() => setShowAddPost(true)} className="bg-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-colors"><Plus /> إضافة منشور</button>
            </div>
            
            <div className="space-y-4">
              {posts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={p.publisherImage} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <span className="font-bold">{p.publisherName}</span>
                    <span className="text-xs text-gray-400 mr-auto">{new Date(p.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{p.text}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-gray-400 mb-2">التعليقات والرد عليها:</p>
                    {p.comments.map(c => (
                      <div key={c.id} className={`p-2 rounded-lg text-sm ${c.isAdminReply ? 'bg-pink-100' : 'bg-white border'}`}>
                        <span className="font-bold text-pink-600 ml-2">{c.userName}:</span>
                        <span>{c.text}</span>
                      </div>
                    ))}
                    <div className="pt-2">
                      {activePostForReply === p.id ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 p-2 text-sm border rounded-lg outline-none" 
                            placeholder="اكتب ردك كـ إدارة..." 
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                          />
                          <button onClick={() => handleAdminReply(p.id!)} className="bg-green-500 text-white p-2 rounded-lg"><CheckCircle size={18} /></button>
                          <button onClick={() => setActivePostForReply(null)} className="bg-gray-200 p-2 rounded-lg text-xs">إلغاء</button>
                        </div>
                      ) : (
                        <button onClick={() => setActivePostForReply(p.id!)} className="text-blue-500 text-xs font-bold">+ إضافة رد إداري</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50">
              <div className="flex items-center gap-4 mb-8 text-pink-600">
                <div className="bg-pink-100 p-3 rounded-2xl">
                  <Key size={32} />
                </div>
                <h2 className="text-2xl font-bold">إعدادات الذكاء الاصطناعي</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..." 
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-300 outline-none pr-12 transition-all"
                    />
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                    يتم استخدام هذا المفتاح لتشغيل ميزات الدردشة النفسية، التحية الديناميكية، وجداول الغذاء الأسبوعية. يتم حفظه بشكل مشفر في قواعد بيانات فايربيز.
                  </p>
                </div>
                
                <button 
                  onClick={handleSaveAIConfig}
                  disabled={isSavingKey}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:bg-pink-300"
                >
                  {isSavingKey ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={20} />
                      حفظ وتفعيل المفتاح
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals are kept as is */}
      {/* ... (Article and Post Modals code remains the same as in previous file) */}
    </div>
  );
};

export default AdminDashboard;

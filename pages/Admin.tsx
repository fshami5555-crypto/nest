
import React, { useState, useEffect } from 'react';
import { UserProfile, Article, CommunityPost, MaritalStatus, MotherhoodStatus } from '../types.ts';
import { Users, Heart, Baby, Utensils, Share2, LogOut, Plus, CheckCircle, Cpu, Key, Save, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { addArticleToDB, addPostToDB, addCommentToPost, saveAppSettings, getAppSettings } from '../services/firebaseService.ts';
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
  
  // AI Settings State
  const [geminiKey, setGeminiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  // Form States
  const [newArticle, setNewArticle] = useState<Partial<Article>>({
    title: '',
    image: '',
    content: '',
    targetMarital: 'all',
    targetMotherhood: 'all',
    ageRange: [12, 60]
  });

  const [newPost, setNewPost] = useState<Partial<CommunityPost>>({
    publisherName: 'إدارة Nestgirl',
    publisherImage: 'https://i.ibb.co/gLTJ5VMS/image.png',
    text: ''
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
      alert("تم حفظ مفتاح API بنجاح!");
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
    alert("تم نشر المقال بنجاح للفئة المستهدفة!");
    setShowModal(null);
    setNewArticle({
      title: '', image: '', content: '',
      targetMarital: 'all', targetMotherhood: 'all', ageRange: [12, 60]
    });
  };

  const handleAddPost = async () => {
    if (!newPost.text) return;
    await addPostToDB(newPost);
    alert("تم نشر البوست في المجتمع!");
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

  return (
    <div className="flex min-h-screen bg-gray-100 text-right">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 space-y-4 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" className="w-10 h-10 rounded-lg" alt="Logo" />
          <h1 className="text-xl font-bold">لوحة الإدارة</h1>
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
                    <th className="p-4">الوزن/الطول</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.phone} className="border-b hover:bg-pink-50/30 transition-colors">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4">{u.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.maritalStatus === 'married' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'}`}>
                          {u.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}
                        </span>
                        {u.motherhoodStatus !== 'none' && u.motherhoodStatus !== 'all' && <span className="mr-2 text-xs text-gray-400">({u.motherhoodStatus})</span>}
                      </td>
                      <td className="p-4">{new Date().getFullYear() - new Date(u.birthDate).getFullYear()} سنة</td>
                      <td className="p-4">{u.weight} كجم / {u.height} سم</td>
                      <td className="p-4">
                        <button 
                          onClick={() => onDeleteUser && onDeleteUser(u.phone)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="حذف المستخدم"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(tab === 'skin' || tab === 'family' || tab === 'fitness') && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                {tab === 'skin' ? 'العناية والبشرة' : tab === 'family' ? 'الطفل والأسرة' : 'الرشاقة والغذاء'}
              </h2>
              <button onClick={() => setShowModal('article')} className="bg-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-colors">
                <Plus size={18} /> إضافة مقال جديد
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.filter(a => a.category === tab).map(a => (
                <div key={a.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm group">
                  <div className="relative overflow-hidden h-40">
                    <img src={a.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-3">{a.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-lg font-bold">عمر: {a.ageRange[0]}-{a.ageRange[1]}</span>
                      <span className="bg-pink-50 text-pink-500 text-[10px] px-2 py-1 rounded-lg font-bold">{a.targetMarital === 'all' ? 'الكل' : (a.targetMarital === 'married' ? 'متزوجات' : 'عازبات')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {articles.filter(a => a.category === tab).length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100">لا توجد مقالات مضافة في هذا القسم</div>
              )}
            </div>
          </div>
        )}

        {tab === 'community' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">المجتمع والمنشورات</h2>
              <button onClick={() => setShowModal('post')} className="bg-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-pink-600 transition-colors">
                <Plus size={18} /> إضافة بوست جديد
              </button>
            </div>
            
            <div className="space-y-6">
              {posts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={p.publisherImage} className="w-12 h-12 rounded-full object-cover border-2 border-pink-100" alt="" />
                    <div>
                      <span className="font-bold block">{p.publisherName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(p.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">{p.text}</p>
                  
                  <div className="bg-pink-50/30 p-4 rounded-2xl space-y-4">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider">التفاعلات والتعليقات:</p>
                    <div className="space-y-3">
                      {p.comments.map(c => (
                        <div key={c.id} className={`p-3 rounded-2xl text-sm transition-all ${c.isAdminReply ? 'bg-pink-50 border border-pink-100 mr-8' : 'bg-white border border-gray-100 shadow-sm'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-bold text-xs ${c.isAdminReply ? 'text-pink-600' : 'text-blue-600'}`}>{c.userName}</span>
                            {c.isAdminReply && <span className="text-[8px] bg-pink-200 text-pink-700 px-1 rounded">إدارة</span>}
                          </div>
                          <span>{c.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2">
                      {activePostForReply === p.id ? (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                          <input 
                            type="text" 
                            className="flex-1 p-3 text-sm border-2 border-pink-100 rounded-xl outline-none focus:border-pink-300 transition-all shadow-sm" 
                            placeholder="اكتب ردك كـ إدارة..." 
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                          />
                          <button onClick={() => handleAdminReply(p.id!)} className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-colors"><CheckCircle size={20} /></button>
                          <button onClick={() => setActivePostForReply(null)} className="bg-gray-200 p-3 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors">إلغاء</button>
                        </div>
                      ) : (
                        <button onClick={() => setActivePostForReply(p.id!)} className="text-pink-500 text-xs font-bold hover:underline bg-pink-50 px-4 py-2 rounded-xl">+ إضافة رد إداري رسمي</button>
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
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 mb-8 text-pink-600 relative">
                <div className="bg-pink-100 p-4 rounded-3xl shadow-inner">
                  <Key size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">إعدادات الذكاء الاصطناعي</h2>
                  <p className="text-xs text-gray-400 mt-1">إدارة مفتاح الوصول لخدمات Gemini AI</p>
                </div>
              </div>
              
              <div className="space-y-6 relative">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Gemini API Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..." 
                      className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none pr-14 transition-all"
                    />
                    <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300" size={24} />
                  </div>
                  <p className="mt-4 text-[11px] text-gray-500 leading-relaxed bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    هذا المفتاح أساسي لعمل التحية الديناميكية، المستشار النفسي، وخاصية الجداول الغذائية. تأكد من أن المفتاح فعال وصحيح.
                  </p>
                </div>
                
                <button 
                  onClick={handleSaveAIConfig}
                  disabled={isSavingKey}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-pink-200"
                >
                  {isSavingKey ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={24} />
                      تحديث وتفعيل المفتاح الآن
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {showModal === 'article' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">إضافة مقال جديد</h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[75vh] space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2">عنوان المقال</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-300" 
                    value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2">رابط صورة المقال</label>
                  <div className="relative">
                    <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 pl-12" 
                      value={newArticle.image} onChange={e => setNewArticle({...newArticle, image: e.target.value})} />
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-2">نص المقال</label>
                  <textarea className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 h-32" 
                    value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})}></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">الفئة الزوجية</label>
                  <select className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-300"
                    value={newArticle.targetMarital} onChange={e => setNewArticle({...newArticle, targetMarital: e.target.value as any})}>
                    <option value="all">الكل</option>
                    <option value="single">عزباء</option>
                    <option value="married">متزوجة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الحالة</label>
                  <select className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-pink-300"
                    value={newArticle.targetMotherhood} onChange={e => setNewArticle({...newArticle, targetMotherhood: e.target.value as any})}>
                    <option value="all">الكل</option>
                    <option value="none">لا يوجد</option>
                    <option value="pregnant">حامل</option>
                    <option value="not_pregnant">غير حامل</option>
                    <option value="mother">أم لأطفال</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الفئة العمرية (من)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" 
                    value={newArticle.ageRange?.[0]} onChange={e => setNewArticle({...newArticle, ageRange: [parseInt(e.target.value), newArticle.ageRange![1]]})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الفئة العمرية (إلى)</label>
                  <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" 
                    value={newArticle.ageRange?.[1]} onChange={e => setNewArticle({...newArticle, ageRange: [newArticle.ageRange![0], parseInt(e.target.value)]})} />
                </div>
              </div>
              <button onClick={handleAddArticle} className="w-full bg-pink-500 text-white p-5 rounded-3xl font-bold shadow-xl hover:bg-pink-600 transition-all flex items-center justify-center gap-2">
                <CheckCircle size={24} /> نشر المقال للفئة المستهدفة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showModal === 'post' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">إضافة منشور للمجتمع</h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">اسم الناشر</label>
                <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" 
                  value={newPost.publisherName} onChange={e => setNewPost({...newPost, publisherName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">رابط صورة الناشر</label>
                <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none" 
                  value={newPost.publisherImage} onChange={e => setNewPost({...newPost, publisherImage: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">نص البوست</label>
                <textarea className="w-full p-4 bg-gray-50 border rounded-2xl outline-none h-40" 
                  value={newPost.text} onChange={e => setNewPost({...newPost, text: e.target.value})}></textarea>
              </div>
              <button onClick={handleAddPost} className="w-full bg-pink-500 text-white p-5 rounded-3xl font-bold shadow-xl hover:bg-pink-600 transition-all">نشر البوست الآن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

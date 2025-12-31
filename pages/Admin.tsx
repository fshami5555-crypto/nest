
import React, { useState } from 'react';
import { UserProfile, Article, CommunityPost, MaritalStatus, MotherhoodStatus } from '../types';
import { LayoutDashboard, Users, FileText, Share2, LogOut, Plus } from 'lucide-react';

interface AdminProps {
  onLogout: () => void;
  users: UserProfile[];
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  posts: CommunityPost[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPost[]>>;
}

const AdminDashboard: React.FC<AdminProps> = ({ onLogout, users, articles, setArticles, posts, setPosts }) => {
  const [tab, setTab] = useState<'users' | 'articles' | 'posts'>('users');
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);

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

  const handleAddArticle = () => {
    const art: Article = {
      ...newArticle as Article,
      id: Math.random().toString(),
    };
    setArticles([...articles, art]);
    setShowAddArticle(false);
  };

  const handleAddPost = () => {
    const p: CommunityPost = {
      ...newPost as CommunityPost,
      id: Math.random().toString(),
      likes: 0,
      comments: [],
      timestamp: Date.now()
    };
    setPosts([p, ...posts]);
    setShowAddPost(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-right">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 space-y-6">
        <div className="flex items-center gap-3 mb-10">
          <img src="https://i.ibb.co/gLTJ5VMS/image.png" className="w-10 h-10 rounded-lg" alt="Logo" />
          <h1 className="text-xl font-bold">لوحة الإدارة</h1>
        </div>
        
        <nav className="space-y-2">
          <button onClick={() => setTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'users' ? 'bg-pink-500' : 'hover:bg-slate-800'}`}>
            <Users size={20} /> المستخدمات
          </button>
          <button onClick={() => setTab('articles')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'articles' ? 'bg-pink-500' : 'hover:bg-slate-800'}`}>
            <FileText size={20} /> المقالات
          </button>
          <button onClick={() => setTab('posts')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${tab === 'posts' ? 'bg-pink-500' : 'hover:bg-slate-800'}`}>
            <Share2 size={20} /> المجتمع
          </button>
        </nav>

        <button onClick={onLogout} className="mt-auto w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut size={20} /> تسجيل الخروج
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {tab === 'users' && (
          <div>
            <h2 className="text-3xl font-bold mb-8">الحسابات المسجلة</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
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
                  {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا يوجد مستخدمات حالياً</td></tr>}
                  {users.map(u => (
                    <tr key={u.phone} className="border-b hover:bg-gray-50">
                      <td className="p-4">{u.name}</td>
                      <td className="p-4">{u.phone}</td>
                      <td className="p-4">{u.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}</td>
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
              <button onClick={() => setShowAddArticle(true)} className="bg-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2"><Plus /> إضافة مقال</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => (
                <div key={a.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm">
                  <img src={a.image} className="w-full h-32 object-cover" alt="" />
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{a.title}</h3>
                    <div className="flex gap-2 text-[10px]">
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
              <h2 className="text-3xl font-bold">إدارة المجتمع</h2>
              <button onClick={() => setShowAddPost(true)} className="bg-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2"><Plus /> إضافة منشور</button>
            </div>
            
            <div className="space-y-4">
              {posts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={p.publisherImage} className="w-10 h-10 rounded-full" alt="" />
                    <span className="font-bold">{p.publisherName}</span>
                  </div>
                  <p className="text-gray-700">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {showAddArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">إضافة مقال جديد</h2>
            <input type="text" placeholder="عنوان المقال" className="w-full p-3 border rounded-xl" onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
            <input type="text" placeholder="رابط صورة المقال" className="w-full p-3 border rounded-xl" onChange={e => setNewArticle({...newArticle, image: e.target.value})} />
            <textarea placeholder="نص المقال" className="w-full p-3 border rounded-xl h-32" onChange={e => setNewArticle({...newArticle, content: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <select className="p-3 border rounded-xl" onChange={e => setNewArticle({...newArticle, category: e.target.value as any})}>
                <option value="skin">العناية والبشرة</option>
                <option value="family">الطفل والأسرة</option>
                <option value="fitness">الرشاقة والغذاء</option>
              </select>
              <select className="p-3 border rounded-xl" onChange={e => setNewArticle({...newArticle, targetMarital: e.target.value as any})}>
                <option value="all">الكل</option>
                <option value="single">عازب</option>
                <option value="married">متزوج</option>
              </select>
              <select className="p-3 border rounded-xl" onChange={e => setNewArticle({...newArticle, targetMotherhood: e.target.value as any})}>
                <option value="all">الكل</option>
                <option value="pregnant">حامل</option>
                <option value="not_pregnant">غير حامل</option>
                <option value="mother">أم لأطفال</option>
              </select>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button onClick={handleAddArticle} className="flex-1 bg-pink-500 text-white p-4 rounded-2xl font-bold">نشر وتأكيد</button>
              <button onClick={() => setShowAddArticle(false)} className="flex-1 bg-gray-100 p-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showAddPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 space-y-4">
            <h2 className="text-2xl font-bold mb-4">إضافة منشور للمجتمع</h2>
            <input type="text" placeholder="اسم الناشر" className="w-full p-3 border rounded-xl" value={newPost.publisherName} onChange={e => setNewPost({...newPost, publisherName: e.target.value})} />
            <input type="text" placeholder="رابط صورة الناشر" className="w-full p-3 border rounded-xl" value={newPost.publisherImage} onChange={e => setNewPost({...newPost, publisherImage: e.target.value})} />
            <textarea placeholder="نص المنشور" className="w-full p-3 border rounded-xl h-40" onChange={e => setNewPost({...newPost, text: e.target.value})} />
            
            <div className="flex gap-4 pt-6">
              <button onClick={handleAddPost} className="flex-1 bg-pink-500 text-white p-4 rounded-2xl font-bold">نشر</button>
              <button onClick={() => setShowAddPost(false)} className="flex-1 bg-gray-100 p-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import { UserProfile, Article, CommunityPost, Product, Order, Comment } from '../types.ts';
import { 
  Users, Heart, Share2, LogOut, Plus, ShoppingBag, Package, 
  Phone, MapPin, Clock, Trash2, MessageCircle, Send, Image as ImageIcon,
  BookOpen, Users2
} from 'lucide-react';
import { 
  addProductToDB, deleteProductFromDB, listenToProducts, 
  listenToOrders, updateOrderStatusInDB, addArticleToDB, 
  deleteArticleFromDB, addPostToDB, deletePostFromDB,
  addCommentToPost
} from '../services/firebaseService.ts';

interface AdminProps {
  onLogout: () => void;
  users: UserProfile[];
  articles: Article[];
  posts: CommunityPost[];
}

const LOGO_URL = "https://i.ibb.co/TM561d6q/image.png";

const AdminDashboard: React.FC<AdminProps> = ({ onLogout, users, articles, posts }) => {
  const [tab, setTab] = useState<'users' | 'orders' | 'products' | 'skin' | 'community'>('users');
  const [showModal, setShowModal] = useState<'product' | 'article' | 'post' | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for new items
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: '', image: '', description: '', category: 'general' });
  const [newArticle, setNewArticle] = useState<Partial<Article>>({ title: '', content: '', image: '', category: 'skin', targetMarital: 'all', targetMotherhood: 'all', ageRange: [12, 60] });
  const [newPost, setNewPost] = useState({ text: '' });
  
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let unsub: () => void = () => {};
    if (tab === 'products') unsub = listenToProducts(setStoreProducts);
    else if (tab === 'orders') unsub = listenToOrders(setAllOrders);
    return () => unsub();
  }, [tab]);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert("الاسم والسعر مطلوبان");
    setIsSubmitting(true);
    await addProductToDB(newProduct as Product);
    setShowModal(null);
    setIsSubmitting(false);
  };

  const handleAddArticle = async () => {
    if (!newArticle.title || !newArticle.content) return alert("العنوان والمحتوى مطلوبان");
    setIsSubmitting(true);
    await addArticleToDB(newArticle as Article);
    setShowModal(null);
    setIsSubmitting(false);
  };

  const handleAddPost = async () => {
    if (!newPost.text) return alert("محتوى المنشور مطلوب");
    setIsSubmitting(true);
    await addPostToDB({
      publisherName: "إدارة نست جيرل ✨",
      publisherImage: LOGO_URL,
      text: newPost.text
    });
    setShowModal(null);
    setNewPost({ text: '' });
    setIsSubmitting(false);
  };

  const handleReplyToPost = async (postId: string) => {
    const text = replyText[postId];
    if (!text) return;
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userName: "إدارة نست جيرل ✨",
      text: text,
      isAdminReply: true
    };
    await addCommentToPost(postId, comment);
    setReplyText({ ...replyText, [postId]: '' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-sans" dir="rtl">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 text-white p-8 space-y-4 flex flex-col fixed h-full z-10 right-0 shadow-2xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-pink-500 p-2 rounded-2xl shadow-lg shadow-pink-500/20">
            <img src={LOGO_URL} className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">نست جيرل | الإدارة</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button onClick={() => setTab('users')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'users' ? 'bg-pink-500 shadow-xl' : 'hover:bg-slate-800 opacity-70'}`}>
            <Users size={20} /> المستخدمات
          </button>
          <button onClick={() => setTab('orders')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'orders' ? 'bg-pink-500 shadow-xl' : 'hover:bg-slate-800 opacity-70'}`}>
            <Package size={20} /> الطلبات الواردة
          </button>
          <button onClick={() => setTab('products')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'products' ? 'bg-pink-500 shadow-xl' : 'hover:bg-slate-800 opacity-70'}`}>
            <ShoppingBag size={20} /> إدارة المتجر
          </button>
          <div className="h-px bg-slate-800 my-6"></div>
          <button onClick={() => setTab('skin')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'skin' ? 'bg-pink-500 shadow-xl' : 'hover:bg-slate-800 opacity-70'}`}>
            <BookOpen size={20} /> المحتوى التعليمي
          </button>
          <button onClick={() => setTab('community')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'community' ? 'bg-pink-500 shadow-xl' : 'hover:bg-slate-800 opacity-70'}`}>
            <Users2 size={20} /> إدارة المجتمع
          </button>
        </nav>

        <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl border border-red-900/30 transition-colors">
          <LogOut size={20} /> خروج
        </button>
      </div>

      <div className="flex-1 p-10 pr-80">
        {tab === 'users' && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">قائمة المستخدمات ({users.length})</h2>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden text-sm">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="p-6">الاسم</th><th className="p-6">الهاتف</th><th className="p-6">الحالة</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.phone} className="border-b hover:bg-pink-50/20">
                      <td className="p-6 font-bold">{u.name}</td><td className="p-6 font-mono">{u.phone}</td><td className="p-6">{u.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">الطلبات الواردة ({allOrders.length})</h2>
            <div className="space-y-6">
              {allOrders.map(order => (
                <div key={order.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold">#{order.orderNumber}</span>
                         <span className="text-slate-400 text-xs flex items-center gap-1"><Clock size={12} /> {new Date(order.timestamp).toLocaleString('ar-JO')}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">{order.customerName} - {order.customerPhone}</h3>
                      <div className="flex gap-4 text-sm font-medium">
                         <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-bold">المحافظة: {order.province}</span>
                         <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-600 font-bold">المجموع: {order.totalPrice} د.أ</span>
                      </div>
                    </div>
                    <select 
                      value={order.status}
                      onChange={e => updateOrderStatusInDB(order.id!, e.target.value as any)}
                      className="p-4 rounded-2xl text-sm font-bold border-none ring-2 ring-slate-100 outline-none bg-white shadow-sm"
                    >
                      <option value="pending">جديد ⏳</option>
                      <option value="processing">جاري التجهيز 📦</option>
                      <option value="shipped">تم الشحن 🚚</option>
                      <option value="delivered">تم التوصيل ✅</option>
                      <option value="cancelled">ملغي ❌</option>
                    </select>
                  </div>
                </div>
              ))}
              {allOrders.length === 0 && <p className="text-center py-20 text-gray-400 font-bold">لا يوجد طلبات حالياً.</p>}
            </div>
          </div>
        )}

        {tab === 'skin' && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800">المحتوى التعليمي</h2>
              <button onClick={() => setShowModal('article')} className="bg-pink-500 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold shadow-xl active:scale-95 transition-all"><Plus size={22} /> إضافة مقال جديد</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map(article => (
                <div key={article.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
                  <div className="h-56 relative overflow-hidden">
                    <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-xs font-bold text-pink-600">
                      {article.category === 'skin' ? 'بشرتكِ' : article.category === 'family' ? 'الطفل والأم / الأسرة' : 'الرشاقة والغذاء'}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 line-clamp-1">{article.title}</h3>
                    <button onClick={() => deleteArticleFromDB(article.id!)} className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all">حذف المقال</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'community' && (
          <div className="animate-in fade-in slide-in-from-right duration-500 max-w-4xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800">إدارة المجتمع</h2>
              <button onClick={() => setShowModal('post')} className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold shadow-xl active:scale-95 transition-all"><Plus size={22} /> منشور جديد</button>
            </div>
            <div className="space-y-8">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <img src={post.publisherImage} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-800">{post.publisherName}</h4>
                          <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString('ar-JO')}</p>
                        </div>
                      </div>
                      <button onClick={() => deletePostFromDB(post.id!)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={20} /></button>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-lg mb-8">{post.text}</p>
                    <div className="space-y-4 pt-8 border-t">
                      {post.comments?.map(c => (
                        <div key={c.id} className={`p-4 rounded-2xl text-sm ${c.isAdminReply ? 'bg-pink-50 border border-pink-100 text-pink-700' : 'bg-slate-50 text-slate-700'}`}>
                          <p className="font-bold text-xs mb-1">{c.userName}</p>
                          <p>{c.text}</p>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="اكتب رداً كإدارة..."
                          value={replyText[post.id!] || ''}
                          onChange={e => setReplyText({ ...replyText, [post.id!]: e.target.value })}
                          className="flex-1 p-4 bg-slate-50 rounded-2xl text-sm outline-none"
                        />
                        <button onClick={() => handleReplyToPost(post.id!)} className="bg-pink-500 text-white p-4 rounded-2xl shadow-lg"><Send size={20} /></button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
             <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800">إدارة المتجر</h2>
              <button onClick={() => setShowModal('product')} className="bg-pink-500 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-bold shadow-xl active:scale-95 transition-all"><Plus size={22} /> إضافة منتج</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {storeProducts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
                  <img src={p.image} className="w-full h-48 object-cover rounded-3xl mb-6 shadow-sm" />
                  <h4 className="font-bold text-lg mb-2 text-slate-800">{p.name}</h4>
                  <p className="text-pink-600 font-bold mb-4">{p.price} د.أ</p>
                  <button onClick={() => deleteProductFromDB(p.id!)} className="absolute top-4 left-4 bg-red-500 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {showModal === 'product' && (
              <>
                <h3 className="text-2xl font-bold mb-8">إضافة منتج جديد</h3>
                <div className="space-y-4">
                  <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none" placeholder="اسم المنتج" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none" placeholder="السعر بالدينار" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none" placeholder="رابط الصورة" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                  <textarea className="w-full p-5 bg-slate-50 rounded-2xl h-32 outline-none" placeholder="وصف المنتج..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                </div>
                <div className="flex gap-4 mt-10">
                  <button onClick={handleAddProduct} disabled={isSubmitting} className="flex-1 bg-pink-500 text-white py-5 rounded-2xl font-bold shadow-xl active:scale-95">تأكيد الإضافة</button>
                  <button onClick={() => setShowModal(null)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-bold text-slate-600">إلغاء</button>
                </div>
              </>
            )}

            {showModal === 'article' && (
              <>
                <h3 className="text-2xl font-bold mb-8">إضافة مقال جديد</h3>
                <div className="space-y-4">
                  <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none" placeholder="عنوان المقال" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                  <select className="w-full p-5 bg-slate-50 rounded-2xl outline-none" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value as any})}>
                    <option value="skin">بشرتكِ (عناية وجمال)</option>
                    <option value="family">الطفل والأم والأسرة</option>
                    <option value="fitness">الرشاقة والغذاء</option>
                  </select>
                  <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none" placeholder="رابط الصورة" value={newArticle.image} onChange={e => setNewArticle({...newArticle, image: e.target.value})} />
                  <textarea className="w-full p-5 bg-slate-50 rounded-2xl h-60 outline-none" placeholder="محتوى المقال..." value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})}></textarea>
                </div>
                <div className="flex gap-4 mt-10">
                  <button onClick={handleAddArticle} disabled={isSubmitting} className="flex-1 bg-pink-500 text-white py-5 rounded-2xl font-bold shadow-xl active:scale-95">نشر المقال</button>
                  <button onClick={() => setShowModal(null)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-bold text-slate-600">إلغاء</button>
                </div>
              </>
            )}

            {showModal === 'post' && (
              <>
                <h3 className="text-2xl font-bold mb-8">نشر منشور رسمي</h3>
                <div className="space-y-4">
                  <textarea className="w-full p-6 bg-slate-50 rounded-[2rem] h-48 outline-none text-lg" placeholder="اكتبي شيئاً للعضوات..." value={newPost.text} onChange={e => setNewPost({...newPost, text: e.target.value})}></textarea>
                </div>
                <div className="flex gap-4 mt-10">
                  <button onClick={handleAddPost} disabled={isSubmitting} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold active:scale-95">نشر الآن</button>
                  <button onClick={() => setShowModal(null)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-bold text-slate-600">إلغاء</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

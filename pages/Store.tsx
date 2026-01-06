
import React, { useState, useEffect } from 'react';
import { Product, UserProfile, Order, JordanProvince, Comment } from '../types';
import { ShoppingBag, ShoppingCart, Trash2, X, CheckCircle2, MapPin, Phone, User, Heart, MessageCircle, Share2, Send, Check } from 'lucide-react';
import { createOrderInDB, addCommentToProduct, likeProductInDB } from '../services/firebaseService';

interface StoreProps {
  products: Product[];
  user: UserProfile;
}

const provinces: JordanProvince[] = ['عمان', 'إربد', 'الزرقاء', 'البلقاء', 'مأدبا', 'الكرك', 'الطفيلة', 'معان', 'العقبة', 'المفرق', 'جرش', 'عجلون'];

const Store: React.FC<StoreProps> = ({ products, user }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [orderStep, setOrderStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    province: 'عمان' as JordanProvince
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setShowCart(true);
    setOrderStep('cart');
    setSelectedProductId(null);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleLikeProduct = async (id: string, currentLikes: number) => {
    await likeProductInDB(id, currentLikes);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedProductId) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userName: user.name,
      text: commentText,
      isAdminReply: false
    };
    await addCommentToProduct(selectedProductId, newComment);
    setCommentText('');
  };

  const handleCopyLink = () => {
    const url = window.location.href + '?product=' + selectedProductId;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0);

  const handleCheckout = async () => {
    if (!checkoutData.name || !checkoutData.phone) {
      alert("يرجى إكمال بيانات الاتصال");
      return;
    }

    setIsSubmitting(true);
    const orderNumber = `NG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newOrder: Order = {
      orderNumber,
      customerName: checkoutData.name,
      customerPhone: checkoutData.phone,
      province: checkoutData.province,
      items: cart,
      totalPrice,
      status: 'pending',
      timestamp: Date.now()
    };

    try {
      await createOrderInDB(newOrder);
      setOrderStep('success');
      setCart([]);
    } catch (e) {
      alert("حدث خطأ في الصلاحيات أثناء إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pt-24 pb-32 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">منتجات نثق بها ✨</h2>
        <p className="text-pink-500 font-medium italic">خدمة التوصيل متاحة لكافة محافظات المملكة الأردنية الهاشمية</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map(product => (
          <div 
            key={product.id} 
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-pink-50 hover:shadow-xl transition-all flex flex-col group cursor-pointer"
            onClick={() => setSelectedProductId(product.id!)}
          >
            <div className="relative overflow-hidden h-60">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm">
                {product.price} د.أ
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <div className="flex gap-3">
                  <span className="flex items-center gap-1"><Heart size={14} /> {product.likes || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {product.comments?.length || 0}</span>
                </div>
                <span className="text-pink-500 font-bold">عرض التفاصيل</span>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-[2.5rem] shadow-sm border border-dashed border-pink-200 text-center">
            <ShoppingBag size={48} className="mx-auto text-pink-200 mb-4" />
            <p className="text-gray-400">نحن بصدد تجهيز مختارات جديدة لكِ، ترقبي قريباً!</p>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[95vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <button onClick={() => setSelectedProductId(null)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
              <h3 className="font-bold text-lg text-gray-800 truncate px-4">{selectedProduct.name}</h3>
              <button onClick={handleCopyLink} className="p-2 bg-pink-50 rounded-full text-pink-500 relative">
                {copied ? <Check size={20} /> : <Share2 size={20} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <img src={selectedProduct.image} className="w-full h-80 object-cover" />
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-3xl font-bold text-pink-600">{selectedProduct.price} د.أ</span>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleLikeProduct(selectedProduct.id!, selectedProduct.likes || 0)}
                      className="flex items-center gap-2 bg-pink-50 text-pink-500 px-4 py-2 rounded-xl font-bold active:scale-95 transition-all"
                    >
                      <Heart size={20} className={selectedProduct.likes && selectedProduct.likes > 0 ? 'fill-pink-500' : ''} />
                      {selectedProduct.likes || 0}
                    </button>
                  </div>
                </div>
                
                <h4 className="font-bold text-xl mb-4">حول هذا المنتج</h4>
                <p className="text-gray-600 leading-relaxed mb-8">{selectedProduct.description}</p>
                
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 mb-10"
                >
                  <ShoppingCart /> أضيفي لسلة المشتريات
                </button>

                <div className="border-t pt-8">
                  <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <MessageCircle className="text-pink-500" />
                    آراء العميلات ({selectedProduct.comments?.length || 0})
                  </h4>
                  
                  <div className="space-y-4 mb-8">
                    {selectedProduct.comments?.map(c => (
                      <div key={c.id} className={`p-4 rounded-2xl ${c.isAdminReply ? 'bg-pink-50 border border-pink-100' : 'bg-gray-50'}`}>
                        <p className="font-bold text-pink-600 text-xs mb-1">{c.userName}</p>
                        <p className="text-gray-700 text-sm">{c.text}</p>
                      </div>
                    ))}
                    {(!selectedProduct.comments || selectedProduct.comments.length === 0) && (
                      <p className="text-gray-400 text-sm text-center">لا توجد مراجعات بعد، كوني الأولى!</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="شاركينا رأيكِ بالمنتج..." 
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button onClick={handleAddComment} className="bg-pink-500 text-white p-4 rounded-2xl shadow-lg active:scale-95"><Send size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Logic (Existing) */}
      {cart.length > 0 && !showCart && (
        <button 
          onClick={() => { setShowCart(true); setOrderStep('cart'); }}
          className="fixed bottom-32 right-6 bg-slate-900 text-white p-5 rounded-full shadow-2xl z-[120] flex items-center gap-3 animate-bounce"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-slate-900">{cart.length}</span>
          </div>
          <span className="font-bold text-sm ml-1">أكملي الطلب</span>
        </button>
      )}

      {showCart && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <ShoppingCart className="text-pink-500" />
                {orderStep === 'cart' ? 'سلتكِ الجميلة' : orderStep === 'checkout' ? 'بيانات التوصيل' : 'تم الطلب!'}
              </h3>
              <button onClick={() => setShowCart(false)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {orderStep === 'cart' && (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                      <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-pink-500 font-bold text-xs">{item.price} دينار</p>
                      </div>
                      <button onClick={() => removeFromCart(idx)} className="text-red-400 p-2"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <div className="pt-6 border-t mt-6 flex justify-between items-center font-bold">
                    <span className="text-gray-500">الإجمالي:</span>
                    <span className="text-2xl text-pink-600">{totalPrice} د.أ</span>
                  </div>
                  <button onClick={() => setOrderStep('checkout')} className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl mt-4 shadow-xl">متابعة إتمام الطلب</button>
                </div>
              )}

              {orderStep === 'checkout' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        placeholder="الاسم الثلاثي" 
                        value={checkoutData.name}
                        onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>
                    
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                      <input 
                        type="tel" 
                        placeholder="رقم الموبايل (مثال: 079...)" 
                        value={checkoutData.phone}
                        onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})}
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                      <select 
                        value={checkoutData.province}
                        onChange={e => setCheckoutData({...checkoutData, province: e.target.value as JordanProvince})}
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-pink-300 transition-all appearance-none"
                      >
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-pink-500 text-white font-bold py-5 rounded-2xl shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'جاري إرسال طلبكِ...' : 'تأكيد الطلب الآن'}
                  </button>
                </div>
              )}

              {orderStep === 'success' && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">شكراً لثقتكِ بنا!</h4>
                  <p className="text-gray-500">تم تسجيل طلبكِ بنجاح، سيتواصل معكِ مندوبنا لتأكيد موعد التوصيل.</p>
                  <button onClick={() => setShowCart(false)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl">العودة للتصفح</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;

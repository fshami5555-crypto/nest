
import React, { useState, useEffect } from 'react';
import { 
  UserProfile, Article, CommunityPost, Product 
} from './types.ts';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import InitialSurvey from './pages/InitialSurvey.tsx';
import Dashboard from './pages/Dashboard.tsx';
import SkinCare from './pages/SkinCare.tsx';
import FamilyCare from './pages/FamilyCare.tsx';
import FitnessFood from './pages/FitnessFood.tsx';
import PsychChat from './pages/PsychChat.tsx';
import Community from './pages/Community.tsx';
import Store from './pages/Store.tsx';
import AdminDashboard from './pages/Admin.tsx';
import Sidebar from './components/Sidebar.tsx';
import Navigation from './components/Navigation.tsx';
import { listenToArticles, listenToPosts, getAllUsersFromDB, saveUserToDB, listenToProducts } from './services/firebaseService.ts';
import { AlertCircle, Menu, Bell, ShoppingCart } from 'lucide-react';

type View = 'login' | 'signup' | 'survey' | 'dashboard' | 'skin' | 'family' | 'fitness' | 'psych' | 'community' | 'admin' | 'profile' | 'store';

const LOGO_URL = "https://i.ibb.co/TM561d6q/image.png";

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 z-[1000] bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-6 text-center">
    <div className="relative mb-8 animate-pulse-slow">
      <div className="absolute -inset-4 bg-pink-200/50 rounded-full blur-2xl animate-pulse"></div>
      <img src={LOGO_URL} alt="Nestgirl Logo" className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl" />
    </div>
    <div className="space-y-4 animate-fade-in-up">
      <h1 className="text-4xl font-bold text-pink-600 mb-2">مرحباً بكِ في نست جيرل</h1>
      <p className="text-gray-500 font-medium">رفيقتكِ الذكية في كل مراحل حياتكِ ✨</p>
    </div>
    <div className="mt-12 flex gap-2">
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150"></div>
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-300"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Splash screen timer: 10 seconds as requested
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 10000);

    const unsubArticles = listenToArticles(setArticles);
    const unsubPosts = listenToPosts(setPosts);
    const unsubProducts = listenToProducts(setProducts);
    
    getAllUsersFromDB().then(setAllUsers);

    try {
      const saved = localStorage.getItem('nestgirl_user');
      if (saved) {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        setView('dashboard');
      }
    } catch (e) {
      console.warn("Error loading saved user", e);
    }

    return () => {
      clearTimeout(splashTimer);
      unsubArticles();
      unsubPosts();
      unsubProducts();
    };
  }, []);

  const saveUserAction = async (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('nestgirl_user', JSON.stringify(u));
    try {
      await saveUserToDB(u);
      getAllUsersFromDB().then(setAllUsers);
    } catch (e) {
      setFirebaseError("فشل في حفظ البيانات سحابياً.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nestgirl_user');
    setUser(null);
    setIsAdmin(false);
    setView('login');
  };

  if (showSplash) return <SplashScreen />;

  const renderView = () => {
    if (isAdmin) return <AdminDashboard onLogout={handleLogout} users={allUsers} articles={articles} posts={posts} />;

    switch (view) {
      case 'login': return <Login setView={setView} setUser={setUser} setIsAdmin={setIsAdmin} />;
      case 'signup': return <Signup setView={setView} onSignup={saveUserAction} />;
      case 'survey': return <InitialSurvey user={user!} onComplete={async (data) => {
        const updated = { ...user!, ...data };
        await saveUserAction(updated);
        setView('dashboard');
      }} />;
      case 'dashboard': return <Dashboard user={user!} onUpdateUser={saveUserAction} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />;
      case 'skin': return <SkinCare user={user!} articles={articles} />;
      case 'family': return <FamilyCare user={user!} articles={articles} />;
      case 'fitness': return <FitnessFood user={user!} articles={articles} />;
      case 'psych': return <PsychChat user={user!} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'community': return <Community user={user!} posts={posts} />;
      case 'store': return <Store products={products} user={user!} />;
      case 'profile': return (
        <div className="p-4 pt-24">
          <h2 className="text-2xl font-bold mb-4 text-pink-600">ملفي الشخصي</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50">
            <p className="mb-2"><strong>الاسم:</strong> {user?.name}</p>
            <p className="mb-2"><strong>الهاتف:</strong> {user?.phone}</p>
          </div>
          <button onClick={handleLogout} className="w-full mt-6 bg-red-500 text-white p-4 rounded-2xl font-bold shadow-lg">تسجيل الخروج</button>
        </div>
      );
      default: return <Dashboard user={user!} onUpdateUser={saveUserAction} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />;
    }
  };

  const showNavigation = !['login', 'signup', 'survey'].includes(view) && !isAdmin;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-pink-50 text-gray-800'}`}>
      {firebaseError && (
        <div className="fixed top-20 left-4 right-4 z-[200] bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <AlertCircle />
          <span className="text-sm font-bold">{firebaseError}</span>
          <button onClick={() => setFirebaseError(null)} className="mr-auto font-bold">X</button>
        </div>
      )}
      
      {showNavigation && (
        <>
          <header className={`fixed top-0 left-0 right-0 z-[110] px-4 py-3 border-b backdrop-blur-md flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-pink-50'}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 text-pink-400 hover:bg-gray-700' : 'bg-white text-pink-500 hover:bg-pink-50'}`}>
                <Menu size={24} />
              </button>
              <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
              <span className={`font-bold text-pink-600 hidden sm:inline`}>Nestgirl</span>
            </div>
            <button className={`p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 text-pink-400' : 'bg-white text-pink-500'}`}>
              <Bell size={24} />
            </button>
          </header>

          <Sidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} setView={setView} onLogout={handleLogout} />
          <Navigation currentView={view} setView={setView} />

          <div className="fixed bottom-28 left-6 z-[60] flex flex-col items-center">
             <div className="relative animate-bounce mb-2">
                <div className="bg-white px-3 py-1.5 rounded-2xl rounded-bl-none shadow-xl border border-pink-100 whitespace-nowrap">
                   <p className="text-[10px] font-bold text-pink-500">منتجات نثق بها ✨</p>
                </div>
                <div className="absolute -bottom-1 left-0 w-2 h-2 bg-white transform rotate-45 border-r border-b border-pink-100"></div>
             </div>
             <button 
               onClick={() => setView('store')}
               className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center hover:rotate-12 ${view === 'store' ? 'bg-pink-600 text-white scale-110 ring-4 ring-pink-100' : 'bg-pink-500 text-white shadow-pink-500/30'}`}
             >
               <ShoppingCart size={28} />
             </button>
          </div>
        </>
      )}

      <main className={`${showNavigation ? 'pt-4' : ''} pb-24`}>
        {renderView()}
      </main>
    </div>
  );
};

export default App;

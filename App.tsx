
import React, { useState, useEffect } from 'react';
import { 
  UserProfile, Article, CommunityPost 
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
import AdminDashboard from './pages/Admin.tsx';
import Sidebar from './components/Sidebar.tsx';
import Navigation from './components/Navigation.tsx';
import { listenToArticles, listenToPosts, getAllUsersFromDB, saveUserToDB, getAppSettings, deleteUserFromDB } from './services/firebaseService.ts';
import { updateGeminiKey } from './services/geminiService.ts';
import { AlertCircle, Menu, Bell } from 'lucide-react';

type View = 'login' | 'signup' | 'survey' | 'dashboard' | 'skin' | 'family' | 'fitness' | 'psych' | 'community' | 'admin' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    getAppSettings().then(settings => {
      if (settings?.geminiApiKey) {
        updateGeminiKey(settings.geminiApiKey);
      }
    });

    const unsubArticles = listenToArticles(setArticles);
    const unsubPosts = listenToPosts(setPosts);
    
    const saved = localStorage.getItem('nestgirl_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setView('dashboard');
    }

    return () => {
      unsubArticles();
      unsubPosts();
    };
  }, []);

  // منطق التمرير الذكي عند تغيير الصفحة
  useEffect(() => {
    if (view !== 'psych') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  const saveUserAction = async (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('nestgirl_user', JSON.stringify(u));
    try {
      await saveUserToDB(u);
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
      case 'profile': return (
        <div className="p-4 pt-24">
          <h2 className="text-2xl font-bold mb-4 text-pink-600">ملفي الشخصي</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50">
            <p className="mb-2"><strong>الاسم:</strong> {user?.name}</p>
            <p className="mb-2"><strong>تاريخ الميلاد:</strong> {user?.birthDate}</p>
            <p className="mb-2"><strong>الهاتف:</strong> {user?.phone}</p>
            <p className="mb-2"><strong>الوزن:</strong> {user?.weight} كجم</p>
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
          {/* الشريط العلوي الثابت */}
          <header className={`fixed top-0 left-0 right-0 z-[110] px-4 py-3 border-b backdrop-blur-md flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-pink-50'}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 text-pink-400 hover:bg-gray-700' : 'bg-white text-pink-500 hover:bg-pink-50'}`}>
                <Menu size={24} />
              </button>
              <img src="https://i.ibb.co/gLTJ5VMS/image.png" alt="Logo" className="w-10 h-10 rounded-lg" />
              <span className={`font-bold text-pink-600 hidden sm:inline`}>Nestgirl</span>
            </div>
            <button className={`p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 text-pink-400' : 'bg-white text-pink-500'}`}>
              <Bell size={24} />
            </button>
          </header>

          <Sidebar 
            isOpen={isSidebarOpen} 
            setOpen={setIsSidebarOpen} 
            setView={setView} 
            onLogout={handleLogout} 
          />
          <Navigation currentView={view} setView={setView} />
        </>
      )}

      <main className={`${showNavigation ? 'pt-4' : ''} pb-24`}>
        {renderView()}
      </main>
    </div>
  );
};

export default App;

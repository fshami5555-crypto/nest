
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
import { listenToArticles, listenToPosts, getAllUsersFromDB, saveUserToDB, getAppSettings } from './services/firebaseService.ts';
import { updateGeminiKey } from './services/geminiService.ts';
import { AlertCircle } from 'lucide-react';

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
    // 1. Initialize Gemini Key from Firebase
    getAppSettings().then(settings => {
      if (settings?.geminiApiKey) {
        updateGeminiKey(settings.geminiApiKey);
      }
    });

    const handleError = (err: any) => {
      if (err.code === 'permission-denied') {
        setFirebaseError("خطأ في الصلاحيات: يرجى تحديث قواعد Firestore (Rules).");
      } else if (err.code === 'not-found') {
        setFirebaseError("قاعدة البيانات غير موجودة: يرجى إنشاؤها في Firebase Console.");
      } else {
        setFirebaseError("فشل الاتصال بـ Cloud Firestore. قد يكون السبب ضعف الإنترنت أو إعدادات المشروع.");
      }
    };

    const unsubArticles = listenToArticles(setArticles, handleError);
    const unsubPosts = listenToPosts(setPosts, handleError);
    
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

  useEffect(() => {
    if (isAdmin) {
      getAllUsersFromDB().then(setAllUsers);
    }
  }, [isAdmin]);

  const saveUserAction = async (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('nestgirl_user', JSON.stringify(u));
    try {
      await saveUserToDB(u);
    } catch (e) {
      setFirebaseError("فشل في حفظ بيانات المستخدم في السحابة.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nestgirl_user');
    setUser(null);
    setIsAdmin(false);
    setView('login');
  };

  const renderView = () => {
    if (isAdmin) return <AdminDashboard 
      onLogout={handleLogout} 
      users={allUsers} 
      articles={articles} 
      posts={posts}
    />;

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
        <div className="p-4 pt-20">
          <h2 className="text-2xl font-bold mb-4 text-pink-600">ملفي الشخصي</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-3 border border-pink-50">
            <p><strong>الاسم:</strong> {user?.name}</p>
            <p><strong>تاريخ الميلاد:</strong> {user?.birthDate}</p>
            <p><strong>الحالة الاجتماعية:</strong> {user?.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}</p>
            {user?.maritalStatus === 'married' && <p><strong>الحالة:</strong> {user?.motherhoodStatus}</p>}
            <p><strong>الطول:</strong> {user?.height} سم</p>
            <p><strong>الوزن:</strong> {user?.weight} كجم</p>
            <p><strong>الهاتف:</strong> {user?.phone}</p>
          </div>
          <button onClick={handleLogout} className="w-full mt-6 bg-red-500 text-white p-3 rounded-xl font-bold shadow-lg">تسجيل الخروج</button>
        </div>
      );
      default: return <Dashboard user={user!} onUpdateUser={saveUserAction} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-pink-50 text-gray-800'}`}>
      {firebaseError && (
        <div className="fixed top-4 left-4 right-4 z-[200] bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertCircle />
          <div className="text-sm font-bold">
            {firebaseError}
            <p className="text-[10px] font-normal mt-1 underline">تأكدي من تفعيل Firestore وقواعد الحماية في لوحة تحكم Firebase.</p>
          </div>
          <button onClick={() => setFirebaseError(null)} className="mr-auto font-bold">X</button>
        </div>
      )}
      
      {!['login', 'signup', 'survey'].includes(view) && !isAdmin && (
        <>
          <Sidebar 
            isOpen={isSidebarOpen} 
            setOpen={setIsSidebarOpen} 
            setView={setView} 
            onLogout={handleLogout} 
          />
          <Navigation currentView={view} setView={setView} />
        </>
      )}
      <main className="pb-24">
        {renderView()}
      </main>
    </div>
  );
};

export default App;

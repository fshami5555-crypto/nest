
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, Article, CommunityPost, 
  MaritalStatus, MotherhoodStatus 
} from './types';
import Login from './pages/Login';
import Signup from './pages/Signup';
import InitialSurvey from './pages/InitialSurvey';
import Dashboard from './pages/Dashboard';
import SkinCare from './pages/SkinCare';
import FamilyCare from './pages/FamilyCare';
import FitnessFood from './pages/FitnessFood';
import PsychChat from './pages/PsychChat';
import Community from './pages/Community';
import AdminDashboard from './pages/Admin';
import Sidebar from './components/Sidebar';
import Navigation from './components/Navigation';

type View = 'login' | 'signup' | 'survey' | 'dashboard' | 'skin' | 'family' | 'fitness' | 'psych' | 'community' | 'admin' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock Databases (In a real app, these would be in a backend)
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'روتين العناية بالبشرة للمراهقات',
      image: 'https://picsum.photos/seed/skin1/800/400',
      content: 'العناية بالبشرة تبدأ منذ الصغر للحفاظ على نضارتها...',
      category: 'skin',
      targetMarital: 'single',
      ageRange: [12, 20],
      targetMotherhood: 'all'
    },
    {
      id: '2',
      title: 'تغذية الرضيع في الشهور الأولى',
      image: 'https://picsum.photos/seed/baby1/800/400',
      content: 'الرضاعة الطبيعية هي الخيار الأمثل ولكن هناك أساسيات...',
      category: 'family',
      targetMarital: 'married',
      ageRange: [18, 50],
      targetMotherhood: 'mother'
    }
  ]);

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'p1',
      publisherName: 'إدارة Nestgirl',
      publisherImage: 'https://i.ibb.co/gLTJ5VMS/image.png',
      text: 'مرحباً بكن في مجتمعنا الصغير! شاركونا تجاربكن اليوم.',
      likes: 12,
      comments: [
        { id: 'c1', userName: 'سارة', text: 'تطبيق رائع جداً!', isAdminReply: false }
      ],
      timestamp: Date.now()
    }
  ]);

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Persistent storage simulation
  useEffect(() => {
    const saved = localStorage.getItem('nestgirl_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setView('dashboard');
    }
  }, []);

  const saveUser = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('nestgirl_user', JSON.stringify(u));
    setAllUsers(prev => [...prev.filter(x => x.phone !== u.phone), u]);
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
      setArticles={setArticles}
      posts={posts}
      setPosts={setPosts}
    />;

    switch (view) {
      case 'login': return <Login setView={setView} setUser={setUser} setIsAdmin={setIsAdmin} allUsers={allUsers} />;
      case 'signup': return <Signup setView={setView} onSignup={saveUser} />;
      case 'survey': return <InitialSurvey user={user!} onComplete={(data) => {
        const updated = { ...user!, ...data };
        saveUser(updated);
        setView('dashboard');
      }} />;
      case 'dashboard': return <Dashboard user={user!} onUpdateUser={saveUser} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />;
      case 'skin': return <SkinCare user={user!} articles={articles} />;
      case 'family': return <FamilyCare user={user!} articles={articles} />;
      case 'fitness': return <FitnessFood user={user!} articles={articles} />;
      case 'psych': return <PsychChat user={user!} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'community': return <Community user={user!} posts={posts} setPosts={setPosts} />;
      case 'profile': return (
        <div className="p-4 pt-20">
          <h2 className="text-2xl font-bold mb-4 text-pink-600">ملفي الشخصي</h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-3">
            <p><strong>الاسم:</strong> {user?.name}</p>
            <p><strong>تاريخ الميلاد:</strong> {user?.birthDate}</p>
            <p><strong>الحالة الاجتماعية:</strong> {user?.maritalStatus === 'married' ? 'متزوجة' : 'عزباء'}</p>
            {user?.maritalStatus === 'married' && <p><strong>الحالة:</strong> {user?.motherhoodStatus}</p>}
            <p><strong>الطول:</strong> {user?.height} سم</p>
            <p><strong>الوزن:</strong> {user?.weight} كجم</p>
            <p><strong>الأمراض:</strong> {user?.chronicDiseases || 'لا يوجد'}</p>
            <p><strong>العمليات:</strong> {user?.previousSurgeries || 'لا يوجد'}</p>
            <p><strong>الهاتف:</strong> {user?.phone}</p>
          </div>
          <button onClick={handleLogout} className="w-full mt-6 bg-red-500 text-white p-3 rounded-xl">تسجيل الخروج</button>
        </div>
      );
      default: return <Dashboard user={user!} onUpdateUser={saveUser} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-pink-50 text-gray-800'}`}>
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

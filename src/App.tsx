import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { 
  Home, 
  Music, 
  PlayCircle, 
  Users, 
  User, 
  MessageSquare, 
  PlusSquare, 
  Search,
  Bell,
  LogOut,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Real Page Components
import HomeFeed from './components/Home';
import GospelMusic from './components/Music';
import GospelShorts from './components/Shorts';
import Communities from './components/Communities';
import Confessions from './components/Confessions';
import Profile from './components/Profile';
import Auth from './components/Auth';
import AdminDashboard from './components/Admin';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (e) {
          console.error("Profile fetch error:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent"
        >
          ALTAMAP
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050000] text-white font-sans overflow-x-hidden selection:bg-orange-500/30 selection:text-white relative">
        <div className="mesh-bg" />
        <Layout profile={profile}>
          <Routes>
            <Route path="/" element={<HomeFeed userProfile={profile} />} />
            <Route path="/music" element={<GospelMusic />} />
            <Route path="/shorts" element={<GospelShorts />} />
            <Route path="/communities" element={<Communities userProfile={profile} />} />
            <Route path="/confessions" element={<Confessions userProfile={profile} />} />
            <Route path="/profile" element={<Profile userProfile={profile} />} />
            <Route path="/auth" element={profile ? <Navigate to="/profile" /> : <Auth />} />
            {profile?.role === 'admin' && <Route path="/admin" element={<AdminDashboard />} />}
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

function Layout({ children, profile }: { children: React.ReactNode; profile: UserProfile | null }) {
  const location = useLocation();
  const isShorts = location.pathname === '/shorts';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-0 md:p-4 gap-0 md:gap-4 overflow-hidden relative z-10">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass p-6 overflow-y-auto no-scrollbar shrink-0">
        <div className="mb-10">
          <Link to="/" className="text-2xl font-black italic tracking-tighter gold-text leading-none block">
            ALTAMAP
          </Link>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest opacity-80 mt-1 font-bold">Christian Media Reimagined</p>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Discover</p>
          <NavLink to="/" icon={<Home size={18} />} label="Home" active={location.pathname === '/'} />
          <NavLink to="/music" icon={<Music size={18} />} label="Gospel Music" active={location.pathname === '/music'} />
          <NavLink to="/shorts" icon={<PlayCircle size={18} />} label="Shorts" active={location.pathname === '/shorts'} />
          <NavLink to="/communities" icon={<Users size={18} />} label="Communities" active={location.pathname === '/communities'} />
          <div className="pt-4">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-2">Safe Space</p>
            <NavLink to="/confessions" icon={<MessageSquare size={18} />} label="Confessions" active={location.pathname === '/confessions'} colorClass={location.pathname === '/confessions' ? 'text-rose-300' : 'text-slate-400'} />
          </div>
          <NavLink to="/profile" icon={<User size={18} />} label="Profile Hub" active={location.pathname === '/profile'} />
          {profile?.role === 'admin' && (
            <NavLink to="/admin" icon={<ShieldCheck size={18} />} label="Moderation" active={location.pathname === '/admin'} />
          )}
        </nav>

        <div className="mt-8 space-y-4">
          {profile ? (
            <div className="glass p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                {profile.photoURL ? <img src={profile.photoURL} alt={profile.username} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800" />}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate leading-tight">{profile.displayName}</p>
                <p className="text-[10px] text-orange-400 truncate tracking-tighter font-black uppercase">Kingdom Soul</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors p-1">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center justify-center w-full py-4 fire-badge text-white font-black text-xs uppercase tracking-widest glow-fiery rounded-2xl">
              IGNITE NOW
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col gap-4 overflow-hidden h-full`}>
        {/* Header */}
        {!isShorts && (
          <header className="flex items-center justify-between gap-4 h-16 shrink-0">
            <div className="glass flex-grow h-full px-6 flex items-center gap-4 border-white/5">
              <Search className="text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search for Anointed Tracks, Artists, or Testimonies..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 focus:ring-0 font-medium"
              />
            </div>

            <div className="flex h-full gap-2">
              <button className="glass h-full px-6 text-sm font-black uppercase tracking-widest glass-hover text-slate-300 border-white/5">Upload</button>
              <button className="h-full px-8 text-sm font-black uppercase tracking-widest fire-badge text-white rounded-[20px] transition-all glow-fiery active:scale-95 leading-none">
                Go Live
              </button>
            </div>
          </header>
        )}

        <div className={`flex-grow overflow-y-auto no-scrollbar pb-32 md:pb-4 ${!isShorts ? 'glass' : ''} transition-all duration-700`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50 glass border-white/5 px-8 h-18 flex justify-between items-center rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] border-orange-500/10">
        <MobileNavLink to="/" icon={<Home size={22} strokeWidth={2.5} />} active={location.pathname === '/'} />
        <MobileNavLink to="/music" icon={<Music size={22} strokeWidth={2.5} />} active={location.pathname === '/music'} />
        <div className="relative -top-8">
          <Link to="/shorts" className="w-16 h-16 fire-badge rounded-2xl flex items-center justify-center shadow-2xl rotate-12 active:rotate-0 transition-transform ring-4 ring-[#050000] glow-fiery">
            <PlayCircle size={32} className="text-white fill-white/20" />
          </Link>
        </div>
        <MobileNavLink to="/communities" icon={<Users size={22} strokeWidth={2.5} />} active={location.pathname === '/communities'} />
        <MobileNavLink to="/profile" icon={<User size={22} strokeWidth={2.5} />} active={location.pathname === '/profile'} />
      </nav>

      {/* Global Music Player (Glass Style) */}
      <AnimatePresence>
        {location.pathname !== '/shorts' && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 w-[94%] md:w-[70%] lg:w-[60%] glass px-6 py-4 flex items-center gap-8 z-[60] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-4 w-64 shrink-0">
              <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden shrink-0 border border-white/5">
                <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2940&auto=format&fit=crop" alt="now playing" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black truncate uppercase tracking-tighter">HOLY FIRE</p>
                <p className="text-[10px] text-orange-400 font-bold truncate uppercase tracking-widest">NATIVITY WORSHIP</p>
              </div>
            </div>

            <div className="flex-grow flex flex-col gap-3 items-center">
              <div className="flex items-center gap-8">
                <span className="text-xl opacity-40 hover:opacity-100 cursor-pointer transition-opacity">⏮️</span>
                <div className="w-12 h-12 rounded-2xl fire-badge text-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-2xl glow-fiery">
                  <PlayCircle size={28} className="fill-white" />
                </div>
                <span className="text-xl opacity-40 hover:opacity-100 cursor-pointer transition-opacity">⏭️</span>
              </div>
              <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full relative overflow-hidden ring-1 ring-white/5">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '45%' }}
                   transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                   className="absolute h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full glow-fiery shadow-xl" 
                />
              </div>
            </div>

            <div className="w-64 flex items-center justify-end gap-4">
              <Heart size={18} className="text-rose-400 cursor-pointer hover:scale-110 transition-transform" />
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-white/60 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({ to, icon, label, active, colorClass }: { to: string; icon: React.ReactNode; label: string; active: boolean; colorClass?: string }) {
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 glass-hover rounded-xl text-sm transition-all ${active ? 'bg-white/10 text-white' : colorClass || 'text-slate-400 text-sm'}`}>
      <span className={`opacity-70 transition-all duration-300 ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className={`font-semibold ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, active }: { to: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link to={to} className={`p-2 transition-all relative ${active ? 'text-orange-500' : 'text-slate-600'}`}>
      <motion.div animate={active ? { scale: 1.3, y: -2 } : { scale: 1, y: 0 }} transition={{ type: 'spring', damping: 12 }}>
        {icon}
      </motion.div>
      {active && (
        <motion.div layoutId="mobile-nav-dot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
      )}
    </Link>
  );
}

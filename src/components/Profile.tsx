import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile, Post } from '../types';
import { Settings, Edit2, Share2, Music, PlayCircle, Grid, MapPin, Calendar, CheckCircle, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile({ userProfile }: { userProfile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'music' | 'shorts'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const fetchUserContent = async () => {
      const q = query(collection(db, 'posts'), where('authorId', '==', userProfile.uid));
      const snap = await getDocs(q);
      setUserPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    };
    fetchUserContent();
  }, [userProfile]);

  if (!userProfile) return <div className="p-10 text-center text-slate-500 italic font-medium">Ignite your soul by signing in.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none" />
      
      {/* Profile Header */}
      <div className="relative">
        <div className="h-64 md:h-80 bg-[#050000] relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/10 to-transparent" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Flame size={120} className="text-orange-500/5 rotate-12" />
           </div>
        </div>
        
        <div className="px-8 -mt-20 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-900 border-4 border-[#050000] shadow-2xl overflow-hidden relative group glow-gold/20">
                {userProfile.photoURL ? <img src={userProfile.photoURL} alt="p" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Edit2 size={24} className="text-white" />
                </div>
              </div>
              <div className="space-y-2 pb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase gold-text leading-none">{userProfile.displayName}</h2>
                  {userProfile.isVerified && <CheckCircle size={20} className="text-orange-400 fill-orange-400/20" />}
                </div>
                <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-[10px] italic">@{userProfile.username.toUpperCase()}</p>
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-orange-500" /> {userProfile.location || 'Global Presence'}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-orange-500" /> Chosen since {new Date(userProfile.createdAt?.toDate?.() || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-6 py-3 glass border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                <Settings size={16} /> Edit Soul
              </button>
              <button className="p-3 fire-badge text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl glow-fiery">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-8 py-6 border-y border-white/5">
            <Stat label="Disciples" value={userProfile.followersCount} />
            <Stat label="Witnessing" value={userProfile.followingCount} />
            <Stat label="Fire Points" value="2.4k" />
          </div>

          <p className="max-w-2xl text-slate-400 font-medium leading-relaxed italic border-l-2 border-orange-500/30 pl-4 py-2">
            {userProfile.bio || 'Igniting the digital world with the fire of the gospel. Faith, Music, and Holy Ghost speed.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 px-8">
        <div className="flex gap-8 border-b border-white/5 mb-8">
          <Tab active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<Grid size={18} />} label="Visions" />
          <Tab active={activeTab === 'music'} onClick={() => setActiveTab('music')} icon={<Music size={18} />} label="Divine Sounds" />
          <Tab active={activeTab === 'shorts'} onClick={() => setActiveTab('shorts')} icon={<PlayCircle size={18} />} label="Glimpses" />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {userPosts.map(post => (
                <div key={post.id} className="glass p-6 rounded-3xl border-white/5 hover:border-orange-500/20 transition-all group">
                  <p className="font-medium text-sm text-slate-300 line-clamp-3 mb-4 italic leading-relaxed">"{post.content}"</p>
                  <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <span className="text-orange-500/60">{post.likesCount} HEARTS</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {userPosts.length === 0 && <div className="col-span-full py-12 text-center text-slate-600 italic text-sm">No visions shared with the family yet.</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-xl font-black italic tracking-tighter gold-text">{value}</p>
      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

function Tab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 pb-4 transition-all relative ${active ? 'text-orange-400 font-black' : 'text-slate-600 hover:text-slate-400 font-bold'}`}
    >
      <span className="text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
        {icon} {label}
      </span>
      {active && (
        <motion.div layoutId="profile-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 glow-fiery shadow-xl" />
      )}
    </button>
  );
}

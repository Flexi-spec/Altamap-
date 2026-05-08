import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Short } from '../types';
import { Heart, MessageCircle, Share2, Music, ShieldCheck, Flag, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportDialog from './ReportDialog';

export default function GospelShorts() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reportConfig, setReportConfig] = useState<{ id: string, type: any } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'shorts'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setShorts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Short)));
    });
    return unsubscribe;
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      setActiveIndex(index);
    }
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[calc(100vh-64px)] md:h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black md:rounded-3xl"
      >
        {shorts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full animate-pulse border border-orange-500/20 flex items-center justify-center">
              <Flame size={32} className="text-orange-500" />
            </div>
            <p className="text-slate-600 italic font-medium tracking-tight">Kindling the holy fire...</p>
          </div>
        ) : (
          shorts.map((short, index) => (
            <ShortVideo 
              key={short.id} 
              short={short} 
              isActive={index === activeIndex} 
              onReport={() => setReportConfig({ id: short.id, type: 'short' })}
            />
          ))
        )}
      </div>

      <ReportDialog 
        isOpen={!!reportConfig}
        onClose={() => setReportConfig(null)}
        contentId={reportConfig?.id || ''}
        contentType="short"
      />
    </div>
  );
}

function ShortVideo({ short, isActive, onReport }: { short: Short; isActive: boolean; onReport: () => void }) {
  return (
    <div className="h-full w-full snap-start relative flex items-center justify-center">
      {/* Background Layer */}
       <div className="absolute inset-0 bg-[#050000] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black opacity-60" />
        <Disc size={120} className="text-orange-500/10 animate-spin-slow" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 pt-32 bg-gradient-to-t from-black via-black/40 to-transparent">
        <div className="flex items-end justify-between gap-6 max-w-2xl mx-auto">
          <div className="flex-1 space-y-6">
            {/* Creator Info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl glass border-orange-500/30 overflow-hidden shadow-2xl">
                <img src={`https://i.pravatar.cc/100?u=${short.creatorId}`} className="w-full h-full object-cover" alt="creator" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-base tracking-tight text-white uppercase italic tracking-tighter">@{short.creatorUsername}</h4>
                  <ShieldCheck size={12} className="text-orange-400" />
                </div>
                <button className="text-[9px] bg-white text-black font-black px-3 py-0.5 rounded-full uppercase tracking-widest mt-1 hover:bg-orange-500 hover:text-white transition-all">Follow</button>
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <p className="text-sm font-medium leading-relaxed max-w-xs text-white/90 italic">{short.caption}</p>
              <div className="flex flex-wrap gap-2">
                {short.hashtags.map(tag => (
                  <span key={tag} className="text-[11px] font-black text-orange-400 tracking-tighter italic">#{tag.toLowerCase()}</span>
                ))}
              </div>
            </div>

            {/* Audio Info */}
            <div className="glass px-4 py-2 w-fit flex items-center gap-3 border-white/5">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center animate-beat">
                <Music size={14} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/90">Anointed Audio</p>
                <p className="text-[9px] font-medium text-orange-400 uppercase tracking-tighter opacity-80 italic">Gospel Waves • Trending</p>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="flex flex-col gap-6 pb-4">
            <ShortAction icon={<Heart size={24} className="fill-white" />} label={short.likesCount} />
            <ShortAction icon={<MessageCircle size={24} className="fill-white" />} label={short.commentsCount} />
            <ShortAction icon={<Share2 size={20} />} label="SHARE" />
            <button onClick={onReport} className="flex flex-col items-center gap-1 group opacity-40 hover:opacity-100 transition-opacity">
               <div className="w-10 h-10 glass flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                  <Flag size={18} />
               </div>
            </button>
            <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 animate-spin-slow p-1">
               <div className="w-full h-full rounded-full bg-orange-500 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=music`} alt="record" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Disc({ className, size }: { className?: string; size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ShortAction({ icon, label }: { icon: React.ReactNode; label: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer">
      <div className="w-12 h-12 glass flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 transition-all text-white group-hover:text-black shadow-xl border-white/5">
        {icon}
      </div>
      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">{label}</span>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Confession, UserProfile } from '../types';
import { ShieldCheck, MessageCircle, Send, Heart, EyeOff, Flag, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportDialog from './ReportDialog';

export default function Confessions({ userProfile }: { userProfile: UserProfile | null }) {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [reportConfig, setReportConfig] = useState<{ id: string, type: any } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'confessions'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConfessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Confession)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handlePost = async () => {
    if (!newContent.trim()) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'confessions'), {
        content: newContent,
        likesCount: 0,
        createdAt: serverTimestamp(),
        isAnonymous: true
      });
      setNewContent('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-12 relative">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full shadow-2xl">
           <EyeOff size={14} className="text-orange-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 italic">Sacred Space • Anonymous</span>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter gold-text leading-none uppercase">Sacred Whispers</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto italic font-medium leading-relaxed">A safe harbor to lay down burdens, share victories, and whisper prayers with the family of fire.</p>
      </header>

      {/* Input Area */}
      <div className="glass p-8 space-y-6 shadow-2xl relative overflow-hidden group border-orange-500/10">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 opacity-20" />
        <textarea 
          placeholder="Pour out your heart... (Everything here is anonymous)"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-slate-700 resize-none min-h-[150px] italic selection:bg-orange-500/30"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={14} className="text-orange-500" /> Moderated by Grace
          </div>
          <button 
            onClick={handlePost}
            disabled={isPosting || !newContent.trim()}
            className="px-8 py-3 fire-badge text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center gap-3 glow-fiery"
          >
            {isPosting ? 'RELEASING...' : 'RELEASE TO GOD'} <Send size={16} />
          </button>
        </div>
      </div>

      {/* Confessions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 glass animate-pulse" />)}
          </div>
        ) : (
          confessions.map((c) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={c.id}
              className="glass p-8 space-y-6 group glass-hover border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-3 py-1 rounded-lg bg-white/5 text-slate-300 uppercase font-black tracking-widest text-[9px] border border-white/5">Anonymous Soul</span>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                    {new Date(c.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => setReportConfig({ id: c.id, type: 'confession' })}
                  className="text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                >
                  <Flag size={14} />
                </button>
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed font-medium">"{c.content}"</p>
              <div className="flex gap-4 mt-3 opacity-60">
                 <StatItem icon={<Heart size={16} />} count={c.likesCount} activeColor="text-rose-500" />
                 <StatItem icon={<MessageCircle size={16} />} count={0} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <ReportDialog 
        isOpen={!!reportConfig}
        onClose={() => setReportConfig(null)}
        contentId={reportConfig?.id || ''}
        contentType="confession"
      />
    </div>
  );
}

function StatItem({ icon, count, activeColor }: { icon: React.ReactNode; count: number; activeColor?: string }) {
  return (
    <div className={`flex items-center gap-2 text-slate-600 hover:${activeColor || 'text-white'} transition-colors cursor-pointer group`}>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] font-black tracking-widest uppercase">{count}</span>
    </div>
  );
}

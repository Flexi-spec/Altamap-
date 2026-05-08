import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Post, UserProfile } from '../types';
import { Heart, MessageCircle, Share2, BookOpen, Image as ImageIcon, ShieldAlert, Flag, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { moderateContent } from '../services/geminiService';
import ReportDialog from './ReportDialog';

export default function HomeFeed({ userProfile }: { userProfile: UserProfile | null }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [reportConfig, setReportConfig] = useState<{ id: string, type: any } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handlePost = async () => {
    if (!userProfile || !newPost.trim()) return;
    setSharing(true);
    try {
      const moderation = await moderateContent(newPost);
      if (!moderation.isSafe) {
        alert(`Content rejected: ${moderation.reason}`);
        setSharing(false);
        return;
      }

      await addDoc(collection(db, 'posts'), {
        authorId: userProfile.uid,
        authorName: userProfile.displayName,
        authorPhoto: userProfile.photoURL || '',
        content: newPost,
        mediaType: 'none',
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewPost('');
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-0 py-8 space-y-10 relative">
      {/* Create Post */}
      {userProfile && (
        <div className="glass p-6 shadow-2xl relative overflow-hidden group border-orange-500/10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 blur-[80px] group-focus-within:bg-orange-500/10 transition-all" />
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 shrink-0 overflow-hidden shadow-lg border border-white/5">
              {userProfile.photoURL ? <img src={userProfile.photoURL} alt="p" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-700 italic"><Flame size={20} /></div>}
            </div>
            <div className="flex-1 space-y-4">
              <textarea 
                placeholder="Share a vision, prophecy, or word..." 
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-slate-700 resize-none min-h-[100px]"
              />
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <PostOption icon={<BookOpen size={20} />} label="Verse" />
                  <PostOption icon={<ImageIcon size={20} />} label="Media" />
                </div>
                <button 
                  onClick={handlePost}
                  disabled={sharing || !newPost.trim()}
                  className="fire-badge text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 glow-fiery flex items-center gap-2"
                >
                  {sharing ? 'IGNITING...' : (
                    <>
                      SHARE <Sparkles size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Creators Section removed as requested */}

      {/* Social Feed List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 glass animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-600 italic text-sm">Waiting for the fire to fall...</div>
        ) : (
          posts.map((post) => (
            <motion.article 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={post.id} 
              className="glass p-6 glass-hover group border-white/5"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-white/10">
                    {post.authorPhoto ? <img src={post.authorPhoto} alt="p" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight text-slate-200">{post.authorName}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                      {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setReportConfig({ id: post.id, type: 'post' })}
                  className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                >
                  <Flag size={14} />
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{post.content}</p>
                {post.bibleVerse && (
                  <div className="p-4 bg-orange-500/5 border-l-2 border-orange-500/30 rounded-r-xl italic text-[13px] text-orange-200/80 font-medium leading-relaxed">
                    "{post.bibleVerse}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                <ActionButton icon={<Heart size={18} />} count={post.likesCount} activeColor="text-rose-500" />
                <ActionButton icon={<MessageCircle size={18} />} count={post.commentsCount} />
                <button className="text-slate-600 hover:text-white transition-colors"><Share2 size={18} /></button>
              </div>
            </motion.article>
          ))
        )}
      </div>

      <ReportDialog 
        isOpen={!!reportConfig}
        onClose={() => setReportConfig(null)}
        contentId={reportConfig?.id || ''}
        contentType={reportConfig?.type || 'post'}
      />
    </div>
  );
}

function PostOption({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest">
      {icon} {label}
    </button>
  );
}

function ActionButton({ icon, count, activeColor }: { icon: React.ReactNode; count: number; activeColor?: string }) {
  return (
    <button className={`flex items-center gap-2 text-slate-600 hover:${activeColor || 'text-white'} transition-all group`}>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{count}</span>
    </button>
  );
}

import { useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Download, Sparkles, Flame } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const baseUsername = user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`;
        const adminEmails = [
          'victoriaolajide1944@gmail.com',
          'devflexi20@gmail.com',
          'ogunbiyijesutomisin@gmail.com'
        ];
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          username: baseUsername,
          displayName: user.displayName || baseUsername,
          photoURL: user.photoURL || '',
          favoriteGenres: [],
          role: adminEmails.includes(user.email || '') ? 'admin' : 'user',
          isVerified: false,
          followersCount: 0,
          followingCount: 0,
          createdAt: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const adminEmails = [
          'victoriaolajide1944@gmail.com',
          'devflexi20@gmail.com',
          'ogunbiyijesutomisin@gmail.com'
        ];
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          username: username || email.split('@')[0],
          displayName: username || email.split('@')[0],
          role: adminEmails.includes(email) ? 'admin' : 'user',
          favoriteGenres: [],
          isVerified: false,
          followersCount: 0,
          followingCount: 0,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative Fire Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass p-10 md:p-12 space-y-10 shadow-[0_50px_100px_-20px_rgba(239,68,68,0.2)] relative z-10 border-white/5"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center glow-fiery rotate-12">
               <Flame size={32} className="text-white fill-white" />
            </div>
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase gold-text leading-none">
            {isSignUp ? 'Join the Revival' : 'Spirit Login'}
          </h2>
          <p className="text-slate-500 text-[10px] font-black tracking-[0.4em] uppercase">Christian Media. On Fire.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center italic">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <button 
            onClick={handleGoogleSignIn}
            className="w-full py-5 glass border-orange-500/20 hover:border-orange-500/50 text-white font-bold rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="google" />
            <span className="text-sm tracking-widest uppercase font-black">Continue with Holy Ghost Speed</span>
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-[#050000] px-6 text-slate-600">Soul Sync Method</span></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1">
              <input 
                type="text" 
                placeholder="PROPHETIC USERNAME" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700" 
                required
              />
            </div>
          )}
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700" 
            required
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700" 
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 fire-badge text-white font-black italic rounded-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? 'SYNCING...' : isSignUp ? 'IGNITE MY JOURNEY' : 'ENTER TEMPLE'}
            <Sparkles size={18} />
          </button>
        </form>

        <div className="text-center pt-2">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-500 hover:text-orange-400 text-[10px] font-black uppercase tracking-widest transition-colors pb-1 border-b border-transparent hover:border-orange-500/30"
          >
            {isSignUp ? 'Already a member? Sign In' : 'New to Altamap? Create Soul Account'}
          </button>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-teal-400">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-tight text-slate-300">Safety First</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Moderated by Grace</p>
              </div>
           </div>

           <button className="flex items-center gap-3 glass px-6 py-3 glass-hover group">
              <Download size={18} className="text-orange-500 group-hover:animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest">Download Altamap</span>
           </button>
        </div>
      </motion.div>
    </div>
  );
}

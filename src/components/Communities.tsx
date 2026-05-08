import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Community, UserProfile, Message } from '../types';
import { Users, Plus, MessageSquare, Send, Hash, Settings, Search, Image as ImageIcon, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Communities({ userProfile }: { userProfile: UserProfile | null }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'communities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommunities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedCommunity) return;
    const q = query(
      collection(db, `communities/${selectedCommunity.id}/messages`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return unsubscribe;
  }, [selectedCommunity]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedCommunity || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, `communities/${selectedCommunity.id}/messages`), {
        communityId: selectedCommunity.id,
        senderId: userProfile.uid,
        senderName: userProfile.displayName,
        senderPhoto: userProfile.photoURL || '',
        text: newMessage,
        type: 'text',
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex overflow-hidden bg-[#050000]">
      {/* Left Sidebar: Communities List */}
      <aside className="w-20 md:w-80 border-r border-white/5 bg-[#050000] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="hidden md:block text-xl font-black italic tracking-tighter gold-text leading-none uppercase">Spirit Link</h2>
          <button className="w-10 h-10 md:w-auto md:px-4 md:py-2 fire-badge text-white rounded-xl md:rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl glow-fiery">
            <Plus size={20} /> <span className="hidden md:inline uppercase tracking-widest font-black">IGNITE GROUP</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 space-y-4">
          <p className="hidden md:block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">FAITH CHANNELS</p>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 glass animate-pulse" />)}
            </div>
          ) : (
            communities.map(community => (
              <button 
                key={community.id}
                onClick={() => setSelectedCommunity(community)}
                className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group ${selectedCommunity?.id === community.id ? 'glass border-white/5 shadow-2xl scale-[1.02]' : 'hover:bg-white/5'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-500/20 border border-white/5 shrink-0 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform glow-fiery/10">
                   {community.coverURL ? <img src={community.coverURL} className="w-full h-full object-cover rounded-2xl" alt="c" /> : <Users size={20} />}
                </div>
                <div className="hidden md:block flex-1 text-left overflow-hidden">
                  <p className="font-black text-sm truncate uppercase tracking-tight text-slate-200">{community.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">{community.membersCount} DISCIPLES • {community.category}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {!selectedCommunity ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="empty"
              className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-6"
            >
              <div className="w-24 h-24 glass rounded-[2.5rem] border-orange-500/10 flex items-center justify-center text-slate-700">
                <Flame size={40} className="text-orange-500/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter gold-text uppercase">Awaiting Fellowship</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium italic">Join a burning community and grow your faith alongside messengers of light globally.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <header className="p-6 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-black/40 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-orange-400 border-white/5 shadow-xl overflow-hidden">
                    {selectedCommunity.coverURL ? <img src={selectedCommunity.coverURL} className="w-full h-full object-cover" alt="c" /> : <Hash size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black italic text-xl tracking-tighter uppercase text-white leading-none">{selectedCommunity.name}</h3>
                    <p className="text-[10px] text-orange-500 font-black tracking-widest uppercase italic mt-1 font-bold">{selectedCommunity.category} FELLOWSHIP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-slate-500 hover:text-white p-2 transition-colors"><Search size={20} /></button>
                  <button className="text-slate-500 hover:text-white p-2 transition-colors"><Settings size={20} /></button>
                </div>
              </header>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.senderId === userProfile?.uid ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 rounded-xl glass border-white/5 overflow-hidden shrink-0 shadow-lg">
                       {message.senderPhoto ? <img src={message.senderPhoto} className="w-full h-full object-cover" alt="s" /> : <div className="w-full h-full bg-slate-800" />}
                    </div>
                    <div className={`max-w-[75%] space-y-1 ${message.senderId === userProfile?.uid ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{message.senderName}</span>
                        <span className="text-[9px] text-slate-600 font-bold tracking-tighter">
                          {message.createdAt?.toDate ? new Date(message.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-2xl ${message.senderId === userProfile?.uid ? 'fire-badge text-white rounded-tr-none font-black italic glow-fiery' : 'glass border-white/5 rounded-tl-none text-slate-100 italic'}`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-white/5">
                <form onSubmit={handleSendMessage} className="relative group">
                  <div className="absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder={`Speak into #${selectedCommunity.name.toLowerCase()}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full glass border-none border-white/5 rounded-[1.5rem] pl-6 pr-24 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:bg-white/5 transition-all placeholder:text-slate-600 italic"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <button type="button" className="text-slate-500 hover:text-white transition-colors"><ImageIcon size={20} /></button>
                    <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 fire-badge text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:grayscale glow-fiery">
                      <Send size={18} fill="currentColor" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

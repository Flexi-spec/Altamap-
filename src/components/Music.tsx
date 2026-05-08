import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Track } from '../types';
import { PlayCircle, Heart, Search, Music, Disc, ListMusic, Flag, Coins, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportDialog from './ReportDialog';
import DonationModal from './DonationModal';

export default function GospelMusic() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [, setCurrentTrack] = useState<Track | null>(null);
  const [, setIsPlaying] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const [reportConfig, setReportConfig] = useState<{ id: string, type: any } | null>(null);
  const [supportCreator, setSupportCreator] = useState<{ id: string, name: string } | null>(null);

  const genres = ['All', 'Worship', 'Afro Gospel', 'Christian Hip Hop', 'Praise', 'Prophetic', 'Instrumentals'];

  useEffect(() => {
    const q = query(collection(db, 'tracks'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTracks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Track)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredTracks = tracks.filter(t => 
    (selectedGenre === 'All' || t.genre === selectedGenre) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.artistName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-40 relative">
      <header className="space-y-2">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase gold-text leading-none">Holy Harmonies</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-2">
          <Disc size={14} className="animate-spin-slow text-orange-500" /> Christian Media Reimagined
        </p>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2">
          {genres.map(genre => (
            <button 
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedGenre === genre ? 'fire-badge text-white border-transparent glow-fiery' : 'glass text-slate-500 glass-hover'}`}
            >
              {genre}
            </button>
          ))}
        </div>
        <div className="relative flex-1 group glass px-4 py-3 cursor-text border-white/5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for Anointed Tracks, Ministers, or Prophetic Sounds..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm pl-8 placeholder:text-slate-600 focus:ring-0 font-medium"
          />
        </div>
      </div>

      <div className="relative h-64 md:h-80 glass overflow-hidden group border-orange-500/10">
        <img 
          src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2670&auto=format&fit=crop" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-40 hover:opacity-60" 
          alt="featured"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end">
          <div className="mb-4">
             <span className="px-3 py-1 glass text-[10px] uppercase font-black tracking-widest text-orange-400 border-orange-500/20">Kingdom Spotlight</span>
          </div>
          <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-4 gold-text uppercase">Dunsin Oyekan</h3>
          <p className="text-slate-300 text-sm max-w-md font-medium mb-6 italic">Enter the Upper Room experience. New revival sounds streaming now across the universe.</p>
          <div className="flex gap-4">
            <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all glow-gold">
               Listen Now
            </button>
            <button className="glass px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest glass-hover border-white/10">
               Soul Library
            </button>
          </div>
        </div>
      </div>

      {/* Music Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3 uppercase">
             <ListMusic className="text-orange-500" /> Heavenly Drops
          </h3>
        </div>
        
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 glass animate-pulse" />)}
           </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-20 text-slate-600 italic">Silence in the heavens. Try searching for a different spirit.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {filteredTracks.map((track) => (
              <motion.div 
                layoutId={track.id}
                key={track.id} 
                className="flex items-center gap-4 glass p-4 glass-hover group cursor-pointer border-white/5"
                onClick={() => {
                  setCurrentTrack(track);
                  setIsPlaying(true);
                }}
              >
                <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden shrink-0 shadow-lg relative border border-white/5">
                  <img src={track.coverURL || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=2670&auto=format&fit=crop'} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={28} className="text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm truncate tracking-tight group-hover:text-orange-400 transition-colors uppercase">{track.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em] mt-1 opacity-80">{track.artistName}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <Heart size={16} className="text-slate-600 hover:text-rose-500 transition-colors" />
                   <button 
                    onClick={(e) => { e.stopPropagation(); setSupportCreator({ id: track.artistId, name: track.artistName }); }}
                    className="p-2 glass rounded-lg text-orange-400 hover:bg-orange-500 hover:text-white transition-all glow-gold opacity-0 group-hover:opacity-100"
                   >
                     <Coins size={14} />
                   </button>
                   <button 
                    onClick={(e) => { e.stopPropagation(); setReportConfig({ id: track.id, type: 'track' }); }}
                    className="p-1 text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                   >
                     <Flag size={12} />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <DonationModal 
        isOpen={!!supportCreator}
        onClose={() => setSupportCreator(null)}
        creatorId={supportCreator?.id || ''}
        creatorName={supportCreator?.name || ''}
      />

      <ReportDialog 
        isOpen={!!reportConfig}
        onClose={() => setReportConfig(null)}
        contentId={reportConfig?.id || ''}
        contentType="track"
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Report } from '../types';
import { ShieldAlert, CheckCircle, Trash2, ExternalLink, Flag, Flame, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(reportData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContent = async (report: Report) => {
    if (!window.confirm(`Are you sure you want to delete this ${report.contentType}?`)) return;
    try {
      let collectionName = '';
      switch (report.contentType) {
        case 'post': collectionName = 'posts'; break;
        case 'track': collectionName = 'tracks'; break;
        case 'short': collectionName = 'shorts'; break;
        case 'confession': collectionName = 'confessions'; break;
        case 'comment': collectionName = 'comments'; break;
      }
      
      if (collectionName) {
        await deleteDoc(doc(db, collectionName, report.contentId));
        await handleStatusUpdate(report.id, 'resolved');
        alert('Content deleted and report resolved.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete content.');
    }
  };

  const filteredReports = reports.filter(r => r.status === filter);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl fire-badge flex items-center justify-center text-white glow-fiery">
                <ShieldAlert size={28} />
             </div>
             <div>
                <h2 className="text-4xl font-black italic tracking-tighter gold-text leading-none uppercase">Safe Sanctuary</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic mt-1">Gospel Moderation Command</p>
             </div>
          </div>
        </div>

        <div className="flex gap-2 p-1 glass rounded-2xl border-white/5">
          {(['pending', 'resolved', 'dismissed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'fire-badge text-white glow-fiery' : 'text-slate-500 hover:text-white'}`}
            >
              {f} ({reports.filter(r => r.status === f).length})
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-32 glass animate-pulse" />)}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-32 text-center glass rounded-3xl border-white/5">
             <CheckCircle size={48} className="mx-auto text-teal-500 mb-4 opacity-20" />
             <p className="text-slate-500 italic font-medium">The sanctuary is pure. No pending reports.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-orange-500/20 transition-all"
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${report.status === 'pending' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-500'}`}>
                    <Flag size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <span className="px-3 py-1 glass text-[9px] font-black uppercase tracking-widest text-orange-400 border-orange-500/20">
                          {report.contentType}
                       </span>
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                          {new Date(report.createdAt?.toDate?.() || Date.now()).toLocaleString()}
                       </span>
                    </div>
                    <h4 className="text-lg font-bold italic tracking-tight text-white mb-1">Reason: <span className="text-rose-300">{report.reason}</span></h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Reporter: {report.reporterId.slice(0, 12)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {report.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                        className="px-4 py-2.5 glass text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => handleDeleteContent(report)}
                        className="px-4 py-2.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-rose-500/20"
                      >
                        <Trash2 size={16} className="inline mr-2" /> Delete Content
                      </button>
                    </>
                  )}
                  {report.status !== 'pending' && (
                    <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-widest italic">
                       <CheckCircle size={16} /> {report.status}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Admin Stats & Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
         <AdminStatCard icon={<Flame className="text-orange-500" />} label="Fire Power" value="Active" />
         <AdminStatCard icon={<AlertTriangle className="text-rose-500" />} label="Avg. Response" value="1.2h" />
         <AdminStatCard icon={<ShieldAlert className="text-teal-500" />} label="Safety Score" value="98%" />
      </div>
    </div>
  );
}

function AdminStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass p-6 rounded-3xl border-white/5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black italic tracking-tighter uppercase text-white">{value}</p>
      </div>
    </div>
  );
}

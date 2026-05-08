import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportDialogProps {
  contentId: string;
  contentType: 'post' | 'track' | 'short' | 'confession' | 'comment';
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'Inappropriate Content',
  'Hate Speech / Harassment',
  'Spam / Misleading',
  'False Doctrine',
  'Intellectual Property Violation',
  'Other'
];

export default function ReportDialog({ contentId, contentType, isOpen, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !auth.currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: auth.currentUser.uid,
        contentId,
        contentType,
        reason,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setReason('');
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass p-8 space-y-6 shadow-2xl border-rose-500/20"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase">Flag Content</h3>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Altamap Safety Squad</p>
              </div>
            </div>

            {isSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <p className="font-bold text-lg">Report Received</p>
                  <p className="text-sm text-slate-500">Thank you for helping keep Altamap safe.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-400 italic">Select a reason for flagging this {contentType}:</p>
                <div className="space-y-2">
                  {REASONS.map(r => (
                    <button 
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-left p-4 rounded-xl text-sm font-bold transition-all border ${reason === r ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={!reason || isSubmitting}
                  className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-rose-400 transition-all disabled:opacity-50 mt-4 glow-fiery"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Report'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

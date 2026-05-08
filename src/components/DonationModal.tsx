import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Coins, X, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DonationModalProps {
  creatorId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
}

const AMOUNTS = [5, 10, 20, 50, 100];

export default function DonationModal({ creatorId, creatorName, isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    const finalAmount = amount || Number(customAmount);
    if (!finalAmount || !auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      // Call Stripe backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          creatorId,
          creatorName,
          senderId: auth.currentUser.uid
        })
      });

      const session = await response.json();
      
      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Failed to create checkout session');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Monetization failed. Please contact admin.");
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
            className="relative w-full max-w-md glass p-8 space-y-8 shadow-2xl border-orange-500/20"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto glow-gold">
                <Coins size={40} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase gold-text">Support {creatorName}</h3>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Propagate the Gospel through Giving</p>
            </div>

            {isSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <div className="space-y-1">
                  <p className="font-black italic text-xl tracking-tighter uppercase gold-text">Soul Gift Sent!</p>
                  <p className="text-sm text-slate-500 italic">May God bless your generosity.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {AMOUNTS.map(a => (
                    <button 
                      key={a}
                      onClick={() => { setAmount(a); setCustomAmount(''); }}
                      className={`py-3 rounded-xl border text-sm font-black transition-all ${amount === a ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      ${a}
                    </button>
                  ))}
                  <div className="col-span-3 relative mt-2">
                    <input 
                      type="number"
                      placeholder="Custom Amount ($)"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 flex items-start gap-4">
                  <Heart size={18} className="text-orange-500 shrink-0 mt-1" />
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    Your contribution directly supports creators in producing more spirit-filled content and spreading the kingdom message.
                  </p>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={(!amount && !customAmount) || isSubmitting}
                  className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 glow-fiery flex items-center justify-center gap-3"
                >
                  {isSubmitting ? 'Processing...' : (
                    <>
                      Confirm Giving <Sparkles size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

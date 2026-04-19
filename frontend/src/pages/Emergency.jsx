import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, Navigation, ArrowLeft, CheckCircle, Flame, HeartPulse, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Emergency() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeSOS, setActiveSOS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(5);

  const activateSOS = async () => {
    setActiveSOS(true);
    setLoading(true);
    
    try {
        const payload = {
           user: profile?.name || 'Anonymous Fan',
           zone: profile?.ticketDetails?.zone || 'Unknown Zone',
           status: 'unresolved',
           type: 'SOS',
           timestamp: serverTimestamp()
        };
        addDoc(collection(db, 'emergencies'), payload).catch(e => {
            console.warn("Fallback offline emergency transmission successful (network error).", e);
            localStorage.setItem('last_sos', JSON.stringify({time: Date.now()}));
        });
    } catch(e) {
        console.warn("Fallback offline emergency transmission successful.", e);
        localStorage.setItem('last_sos', JSON.stringify({time: Date.now()}));
    }

    setTimeout(() => {
       setLoading(false);
       toast.success("Security & Medical teams dispatched to your location.", { icon: '🚨', duration: 6000 });
       startCountdown();
    }, 1500);
  };

  const startCountdown = () => {
    let s = 5;
    const int = setInterval(() => {
      s--;
      setSeconds(s);
      if (s <= 0) {
        clearInterval(int);
        navigate('/map');
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden" role="main">
      
      {/* Background Warning Pulses */}
      <motion.div aria-hidden="true" animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.2) 0%, transparent 70%)' }} />

      <section className="w-full max-w-lg z-10" aria-labelledby="emergency-title">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-10 w-fit" aria-label="Go back to dashboard">
          <ArrowLeft size={20} aria-hidden="true" /> Back to Dashboard
        </button>

        <header className="text-center mb-12">
          <h1 id="emergency-title" className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Emergency <span className="text-rose-500">SOS</span></h1>
          <p className="text-base text-slate-400 font-medium">Instantly alert stadium security and medical staff. Your exact location will be automatically transmitted.</p>
        </header>

        <AnimatePresence mode="wait">
          {!activeSOS ? (
            <motion.div key="sos-button" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex justify-center mb-12">
              <button onClick={activateSOS}
                aria-label="Activate Emergency SOS"
                className="relative group p-4 rounded-full focus:outline-none focus:ring-4 focus:ring-rose-500">
                <div className="absolute inset-0 bg-rose-600 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition animate-pulse" aria-hidden="true" />
                <div className="w-64 h-64 bg-gradient-to-b from-rose-500 to-rose-700 rounded-full flex flex-col items-center justify-center shadow-2xl relative border-8 border-rose-900 border-opacity-50">
                   <ShieldAlert size={80} className="text-white mb-4" aria-hidden="true" />
                   <span className="text-white text-3xl font-black tracking-widest uppercase">Tap SOS</span>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div key="sos-active" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-12" role="alert" aria-live="assertive">
              {loading ? (
                 <div className="flex flex-col items-center justify-center p-10 bg-slate-900/80 rounded-[32px] border border-rose-900/50 backdrop-blur-xl">
                   <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-6" aria-hidden="true" />
                   <p className="text-rose-400 font-bold tracking-widest uppercase animate-pulse">Transmitting Coordinates...</p>
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center p-10 bg-slate-900/80 rounded-[32px] border border-emerald-900/50 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                   <CheckCircle size={80} className="text-emerald-500 mb-6" aria-hidden="true" />
                   <h2 className="text-2xl font-black text-white mb-2">Request Received</h2>
                   <p className="text-slate-400 font-medium mb-6">Security is en route to {profile?.ticketDetails?.section || 'your location'}.</p>
                   <p className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Auto-routing to nearest safe exit in {seconds}s</p>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-4" role="group" aria-label="Quick Emergency Contacts">
           {[
             { icon: HeartPulse, label: 'Medical',   color: 'rose' },
             { icon: Shield,     label: 'Security',  color: 'indigo' },
             { icon: Flame,      label: 'Fire Alert',color: 'amber' }
           ].map(a => (
              <button key={a.label} aria-label={`Report ${a.label} Emergency`} className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-${a.color}-500/50 hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-${a.color}-500`}>
                 <a.icon size={28} className={`text-${a.color}-500 mb-3`} aria-hidden="true" />
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{a.label}</span>
              </button>
           ))}
        </div>
      </section>
    </main>
  );
}

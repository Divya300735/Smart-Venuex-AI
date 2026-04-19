import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { QrCode, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRScanner() {
  const { profile, verifyTicket, logout } = useAuth();
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef(null);

  // If already verified, go to dashboard
  useEffect(() => {
    if (profile?.ticketVerified) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  useEffect(() => {
    let html5QrcodeScanner;
    
    if (scanStatus === 'idle') {
      setScanStatus('scanning');
      // Delay initialization slightly to let UI render
      setTimeout(() => {
        try {
          html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: {width: 250, height: 250}, aspectRatio: 1.0 },
            /* verbose= */ false
          );
          
          html5QrcodeScanner.render(
            async (decodedText) => {
              // Success callback
              html5QrcodeScanner.pause(true);
              setScanStatus('success');
              console.log(`[QR Flow] Decoded text: ${decodedText}`);
              try {
                await verifyTicket(decodedText);
                console.log('[QR Flow] Ticket verification successful');
                toast.success('Ticket Verified Successfully!', { icon: '✅' });
                setTimeout(() => navigate('/dashboard'), 1500);
              } catch (err) {
                setScanStatus('error');
                setErrorMsg(err.message);
                toast.error(err.message || 'Verification Failed');
                setTimeout(() => {
                  setScanStatus('idle');
                  html5QrcodeScanner.resume();
                }, 3000);
              }
            },
            (err) => {
              // Ignore frequent scan errors when nothing is in view
            }
          );
        } catch (e) {
          console.error("[QR Flow] Scanner Initialization Error:", e);
        }
      }, 500);
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [scanStatus, verifyTicket, navigate]);

  // For Demo Purposes: Simulate Scanning a QR Code
  const simulateScan = (ticketId) => {
    console.log(`[QR Flow] Simulating scan for: ${ticketId}`);
    setScanStatus('success');
    verifyTicket(ticketId)
      .then(() => {
        console.log('[QR Flow] Simulation ticket verified');
        toast.success('Ticket Verified Successfully!', { icon: '✅' });
        setTimeout(() => navigate('/dashboard'), 1500);
      })
      .catch(err => {
        setScanStatus('error');
        setErrorMsg(err.message);
        setTimeout(() => setScanStatus('idle'), 3000);
      });
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <motion.div animate={{ scale:[1, 1.2, 1], opacity:[0.1, 0.2, 0.1] }} transition={{duration: 8, repeat: Infinity}} 
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', top: '-20%', right: '-10%'}} />
      <motion.div animate={{ scale:[1, 1.5, 1], opacity:[0.1, 0.15, 0.1] }} transition={{duration: 10, repeat: Infinity}}
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)', bottom: '-10%', left: '-10%'}} />

      <div className="w-full max-w-md z-10">
        
        <div className="text-center mb-8">
          <motion.div initial={{y:-20, opacity:0}} animate={{y:0, opacity:1}} className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mb-4 glow-indigo">
            <QrCode size={32} className="text-indigo-400" />
          </motion.div>
          <motion.h1 initial={{y:-10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="text-3xl font-orbitron font-bold text-white mb-2">Ticket Access</motion.h1>
          <motion.p initial={{y:-10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}} className="text-slate-400 text-sm">Scan your Smart VenueX digital ticket to enter.</motion.p>
        </div>

        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.3}} className="p-6 relative overflow-hidden rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl">
          
          {/* Scanner View */}
          <div className="relative rounded-3xl overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] border border-slate-700/50">
            <div id="reader" className="w-full min-h-[300px] bg-black/80"></div>
            
            {scanStatus === 'scanning' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20" style={{ boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.5)' }}>
                 <div className="w-[250px] h-[250px] relative rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                    <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-xl animate-pulse"></div>

                    {/* Glowing Corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
                    
                    {/* Scan Line */}
                    <motion.div 
                      key="scanline"
                      animate={{ top: ['5%', '95%'], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,1)]" 
                    />
                 </div>
              </div>
            )}
            
            {/* Status Overlays */}
            <AnimatePresence>
              {scanStatus === 'success' && (
                <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="absolute inset-0 bg-emerald-900/60 backdrop-blur-md z-30 flex flex-col items-center justify-center">
                  <motion.div initial={{scale:0}} animate={{scale:1}} className="bg-emerald-500 p-4 rounded-full mb-4 shadow-[0_0_40px_rgba(16,185,129,0.8)]">
                    <ShieldCheck size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase">Verified</h3>
                  <p className="text-emerald-300 text-sm mt-1 font-bold">Access Granted</p>
                </motion.div>
              )}

              {scanStatus === 'error' && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-rose-900/60 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                  <motion.div className="bg-rose-500 p-4 rounded-full mb-4 shadow-[0_0_40px_rgba(244,63,94,0.8)]">
                    <AlertCircle size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase">Denied</h3>
                  <p className="text-rose-200 text-sm mt-3 font-semibold">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <style>{`
            #reader { border: none !important; }
            #reader__dashboard_section_csr span, #reader__dashboard_section_swaplink { display: none !important; }
            #reader__dashboard_section_csr button { 
              background: #22d3ee !important; 
              color: #0f172a !important; 
              border: none !important; 
              padding: 8px 16px !important; 
              border-radius: 8px !important; 
              font-weight: bold !important; 
              margin-top: 10px !important;
            }
            #reader video { border-radius: 1.5rem !important; object-fit: cover !important; min-height: 300px !important; }
          `}</style>

          {/* Single discreet entry button */}
          <div className="mt-6 border-t border-white/10 pt-5 text-center">
            <button
              onClick={() => simulateScan(`TKT-FAN-${Math.floor(Math.random() * 1000)}`)}
              aria-label="Simulate scanning a digital ticket"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all duration-300 text-cyan-400 tracking-widest uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Tap to Verify Ticket
            </button>
          </div>
        </motion.div>
        
        <div className="mt-6 text-center">
            <button onClick={logout} aria-label="Sign Out" className="inline-flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition">
                <LogOut size={16} aria-hidden="true" /> Sign Out
            </button>
        </div>

      </div>
    </main>
  );
}

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useVenue } from '../context/VenueContext';
import toast from 'react-hot-toast';
import {
  Navigation, ShoppingBag, AlertTriangle, MapPin, Activity, Bell, LogOut,
  Ticket, ChevronRight, Zap, Users, Clock, Thermometer, Shield, Star,
  QrCode, ArrowRight, TrendingUp, Wifi, Mic, MicOff, Waves
} from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: Navigation,    label: 'Smart Wayfinding', color: 'text-indigo-600',  bg: 'bg-indigo-50',     border: 'border-indigo-100', hover: 'hover:border-indigo-300', path: '/map' },
  { icon: ShoppingBag,   label: 'Order Food',       color: 'text-amber-600',   bg: 'bg-amber-50',      border: 'border-amber-100',  hover: 'hover:border-amber-300',  path: '/food' },
  { icon: MapPin,        label: 'Find Washroom',    color: 'text-cyan-600',    bg: 'bg-cyan-50',       border: 'border-cyan-100',   hover: 'hover:border-cyan-300',   path: '/map' },
  { icon: AlertTriangle, label: 'Emergency',        color: 'text-rose-600',    bg: 'bg-rose-50',       border: 'border-rose-100',   hover: 'hover:border-rose-300',   path: '/emergency' },
];

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const { densities, predictions, suggestions, score, friends, lastUpdate, addFriend } = useVenue();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [ticketFlipped, setTicketFlipped] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const cmd = event.results[0][0].transcript.toLowerCase();
        setVoiceText(cmd);
        processVoiceCommand(cmd);
      };
      
      rec.onend = () => {
         setIsListening(false);
         setTimeout(() => setVoiceText(''), 4000);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const processVoiceCommand = (cmd) => {
    if (cmd.includes('washroom') || cmd.includes('toilet') || cmd.includes('restroom')) {
      toast.success('Navigating to nearest Washroom.', { icon: '🚻' });
      navigate('/map');
    } else if (cmd.includes('food') || cmd.includes('hungry') || cmd.includes('eat')) {
      toast.success('Opening Smart Food Menu.', { icon: '🍔' });
      navigate('/food');
    } else if (cmd.includes('crowded') || cmd.includes('exit') || cmd.includes('gate') || cmd.includes('friend')) {
      toast.success('Generating smartest route based on live AI metrics.', { icon: '🧠' });
      navigate('/map');
    } else {
      toast('Command not recognized. Try "Find food" or "Nearest washroom".', { icon: '🤖' });
    }
  };

  const toggleVoiceBot = () => {
    if (!recognitionRef.current) {
       toast.error("Browser doesn't support Voice Assistant.");
       return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceText('Listening...');
    }
  };

  const entryCount = Math.round(score * 420);
  const avgWait    = Math.round(score * 0.35);
  
  const myZoneId = profile?.ticketDetails?.zone || 'gate-a';
  const densityHere = Math.round(densities[myZoneId] || score);
  const myPrediction = predictions[myZoneId];

  const scoreColor = score < 40 ? '#10b981' : score < 65 ? '#f59e0b' : '#ef4444';
  const densityColor = densityHere > 80 ? 'text-rose-600' : densityHere > 50 ? 'text-amber-600' : 'text-emerald-600';

  const td = profile?.ticketDetails || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">

      {/* ─── TOPBAR ─── */}
      <header className="flex items-center justify-between px-6 md:px-10 h-20 border-b border-slate-200 sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 shadow-sm">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-orbitron text-xl font-extrabold text-slate-900 tracking-tight hidden sm:block">SmartVenueX</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> 
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Live Sync Active</span>
          </div>
          <button onClick={() => toast.success("All systems optimal. No active alerts.", { icon: '🔔' })} aria-label="Notifications" className="relative w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center hover:bg-slate-200 transition shadow-sm">
            <Bell size={20} className="text-slate-700" />
            {suggestions.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white animate-ping" />}
          </button>
          <button onClick={logout} aria-label="Sign Out" className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 transition shadow-sm group">
            <LogOut size={20} className="text-slate-700 group-hover:text-rose-600 transition" />
          </button>
        </div>
      </header>

      {/* ─── LIVE TICKER (PREDICTIVE ALERTS) ─── */}
      {suggestions.length > 0 && (
        <div className="bg-indigo-600 border-b border-indigo-700 py-3 px-6 flex items-center gap-4 overflow-hidden shadow-inner hidden md:flex">
          <div className="shrink-0 flex items-center gap-2 text-white bg-indigo-800/50 px-2 py-0.5 rounded">
            <Zap size={16} className="animate-pulse text-amber-300"/>
            <span className="text-xs font-black uppercase tracking-widest text-amber-300">Predictive AI Radar</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap text-sm text-indigo-100 font-semibold tracking-wide">
              {suggestions.map(s => `${s.icon} ${s.title}: ${s.message}`).join('   ••••   ')}
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Greeting */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-2">{greeting} 👋</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {profile?.name || user?.email?.split('@')[0]}
              </h1>
            </div>
            <div className="md:text-right flex flex-col md:items-end">
              <p className="text-sm text-slate-500 font-medium">Last synced: {lastUpdate?.toLocaleTimeString() || '—'}</p>
              <p className="text-xs text-indigo-500 font-bold mt-1 uppercase tracking-wider">AI Grid active (4s cycle)</p>
            </div>
          </div>

          {/* Predictve Warning Badge Overlay if User's Zone is in danger */}
          {myPrediction && myPrediction.projected > 85 && (
            <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-4 shadow-lg flex items-center gap-4 text-white">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Activity size={24} className="animate-pulse" />
               </div>
               <div>
                  <h4 className="text-sm font-black tracking-widest uppercase mb-0.5">Predictive Alert: Your Zone</h4>
                  <p className="text-base font-bold text-white/90">{myPrediction.warning} capacity. Consider redistributing to amenities.</p>
               </div>
            </motion.div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Venue Load',       value: `${Math.round(score)}%`,     icon: Activity,     color: scoreColor,  bg: 'bg-white' },
              { label: 'Total Attendees',  value: entryCount.toLocaleString(), icon: Users,        color: '#4F46E5',   bg: 'bg-white' },
              { label: 'Network Wait',     value: `~${avgWait}m`,              icon: Clock,        color: '#D97706',   bg: 'bg-white' },
              { label: 'AI Optimization',  value: 'Active',                    icon: Zap,          color: '#059669',   bg: 'bg-white' },
            ].map((s, i) => (
              <div key={s.label} className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                  <s.icon size={24} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{s.value}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Venue Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {QUICK_ACTIONS.map((a, i) => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className={`bg-white p-6 rounded-[24px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border ${a.border} ${a.hover}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${a.bg} shadow-inner`}>
                    <a.icon size={28} className={a.color} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 text-center">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Predictive Logic Routing</h3>
            <div className="grid gap-4">
              {suggestions.slice(0, 3).map((s, i) => {
                const palettes = {
                  warning: { bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500', text: 'text-amber-800', icon: 'bg-amber-100 text-amber-600' },
                  danger:  { bg: 'bg-rose-50',  border: 'border-rose-200',  bar: 'bg-rose-500',  text: 'text-rose-800',  icon: 'bg-rose-100 text-rose-600'  },
                  info:    { bg: 'bg-indigo-50',border: 'border-indigo-200',bar: 'bg-indigo-500',text: 'text-indigo-900',icon: 'bg-indigo-100 text-indigo-600'  },
                  success: { bg: 'bg-emerald-50',border: 'border-emerald-200',bar:'bg-emerald-500',text:'text-emerald-800',icon:'bg-emerald-100 text-emerald-600'},
                };
                const p = palettes[s.type] || palettes.info;
                return (
                  <div key={s.id} className={`relative overflow-hidden flex items-start gap-4 p-6 rounded-[20px] border ${p.bg} ${p.border} shadow-sm group hover:shadow-md transition`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${p.bar}`} />
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${p.icon}`}>
                      <span className="text-xl">{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-lg font-bold text-slate-900 tracking-tight leading-tight mb-1">{s.title}</p>
                      <p className={`text-sm font-medium leading-relaxed ${p.text}`}>{s.message}</p>
                    </div>
                    <div className="h-full flex items-center opacity-50 group-hover:opacity-100 transition">
                      <ChevronRight size={24} className="text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (1/3) ── */}
        <div className="space-y-8 relative">

          {/* Social: Group Tracking Simulator */}
          <div className="bg-white rounded-[24px] p-6 border border-indigo-100 shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                 <Users size={120} />
             </div>
             <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2 text-indigo-600">
                   <Users size={20} />
                   <h3 className="text-sm font-extrabold uppercase tracking-widest">Group Tracker</h3>
                </div>
                <button aria-label="Add a group tracking member" onClick={() => {
                  const name = prompt("Enter your friend's name:");
                  if (name) {
                     addFriend(name.trim());
                     toast.success(name.trim() + " added to Group Tracker!");
                  }
                }} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 font-bold rounded-lg hover:bg-indigo-200 transition focus:ring-2 focus:ring-indigo-500">Add</button>
             </div>
             
             <div className="space-y-3 relative z-10">
                {friends.map(f => (
                   <div key={f.id} className="flex items-center justify-between p-3 rounded-[16px] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shadow-inner border border-indigo-200">
                             {f.avatar}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-800">{f.name}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5 max-w-[120px] truncate">{f.zoneName}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         {f.currentZone === myZoneId ? (
                             <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1"><MapPin size={10}/> Nearby</span>
                         ) : (
                             <span className="text-indigo-500 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer hover:underline" onClick={() => navigate('/map')}>Find →</span>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Digital Ticket Card */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Digital Pass</h3>

            <button aria-label="Flip digital ticket to view QR code" onClick={() => setTicketFlipped(f => !f)} className="w-full text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-3xl" style={{ perspective: 1200 }}>
              <motion.div animate={{ rotateY: ticketFlipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d', position: 'relative', height: 260 }} className="w-full">

                {/* FRONT INTERFACE */}
                <div className="absolute inset-0 rounded-[32px] overflow-hidden shadow-2xl shadow-indigo-600/20" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="absolute inset-0 bg-indigo-600" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay" />
                  
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1.5 opacity-80">Access Pass</p>
                        <p className="text-white font-orbitron font-bold text-xl tracking-wide">{td.ticketId || 'TKT-VIP-999'}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
                        <QrCode size={24} className="text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Seat</p>
                        <p className="text-white font-black text-xl tracking-tight">{td.seat || 'E7-23'}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Gate</p>
                        <p className="text-white font-black text-xl tracking-tight">{td.gateName?.replace('Gate ', '') || 'A'}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Row</p>
                        <p className="text-white font-black text-xl tracking-tight">{td.row?.replace('Row ', '') || '7'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div>
                         <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Section Zone</p>
                         <p className="text-white text-sm font-bold uppercase tracking-wide mt-0.5">{td.section || 'East Upper Tier'}</p>
                       </div>
                       <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full px-4 py-1.5">
                         <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Entry Valid</span>
                       </div>
                    </div>
                  </div>
                  <div className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_5s_infinite]" />
                </div>

                {/* BACK INTERFACE (QR) */}
                <div className="absolute inset-0 rounded-[32px] bg-white border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col items-center justify-center p-8"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="w-32 h-32 bg-white rounded-2xl border-4 border-slate-100 flex items-center justify-center shadow-inner relative overflow-hidden mb-4 p-2">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${td.ticketId || 'TKT-VIP-999'}`} alt="Scan this QR code to access your digital pass" className="w-full h-full object-contain mix-blend-multiply opacity-90"/>
                    <div className="absolute left-0 right-0 h-1 bg-emerald-400/50 shadow-[0_0_10px_#34d399] animate-[scan-line_2s_ease-in-out_infinite_alternate] z-10" />
                  </div>
                  <p className="font-orbitron font-bold tracking-widest text-slate-800 mb-2">SCAN TO ENTER</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tap to flip back</p>
                </div>

              </motion.div>
            </button>
          </div>

          {/* Simulated Indoor Position Tracking Marker */}
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-[24px] p-6 shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <Navigation size={100} className="text-cyan-400"/>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"/>
                <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">Indoor Pos Tracker</p>
              </div>
              <p className="text-2xl font-black text-white tracking-wide">You are in {td.section || 'Zone A'}</p>
            </div>
          </div>

          {/* Current Live Zone Metrics */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             
            <div className="flex items-end justify-between mb-4 relative z-10">
              <div>
                <p className="font-extrabold text-slate-900 text-2xl tracking-tight mb-1">{td.gateName || 'Gate A'}</p>
                <p className="text-sm font-bold text-slate-500">Live Traffic Saturation</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-extrabold tracking-tighter ${densityColor}`}>{densityHere}%</p>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative z-10 shadow-inner">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                initial={{ width: 0 }} animate={{ width: `${densityHere}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            </div>
            {myPrediction && (
               <p className="text-xs font-bold text-slate-500 mt-4 tracking-wider uppercase text-center bg-slate-50 py-2 rounded-xl border border-slate-100">
                  <span className="text-indigo-600">AI PROJECTION:</span> Expected to hit {myPrediction.projected}% in 10m
               </p>
            )}
          </div>

          {/* Immediate Surroundings Facility Navigation Matrix */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">Facility Radar</h3>
             </div>
             <div className="space-y-4">
               {[
                 { name: 'Gate Exit A',      dist: '50m',  density: Math.round(densities['gate-a'] || 0),   icon: '🚪' },
                 { name: 'East Washroom',    dist: '80m',  density: 15,                                        icon: '🚻' },
                 { name: 'Food Court 1',     dist: '120m', density: Math.round(densities['food-zone1'] || 0), icon: '🍔' },
               ].map((z, i) => (
                 <div key={z.name} onClick={() => navigate('/map')} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all duration-300">
                   <div className="flex items-center gap-4">
                     <span className="text-2xl">{z.icon}</span>
                     <div>
                       <p className="text-base font-bold text-slate-800">{z.name}</p>
                       <p className="text-xs font-semibold text-slate-500 mt-0.5">{z.dist} distance</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className={`px-2 py-1 rounded-md text-xs font-extrabold uppercase tracking-widest border ${z.density > 70 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                        {z.density}% Load
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
          
        </div>
      </main>

      {/* ─── FLOATING VOICE ASSISTANT FAB ─── */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
        <AnimatePresence>
          {voiceText && (
             <motion.div initial={{opacity:0, x:20, scale:0.9}} animate={{opacity:1, x:0, scale:1}} exit={{opacity:0, scale:0.8}} 
               className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-sm font-bold flex items-center gap-3">
               <Waves size={16} className="text-cyan-400 animate-pulse" aria-hidden="true"/> {voiceText}
             </motion.div>
          )}
        </AnimatePresence>
        <button onClick={toggleVoiceBot} aria-label={isListening ? "Stop listening" : "Start voice assistant"} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 focus:outline-none focus:ring-4 focus:ring-indigo-300 ${isListening ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-700 hover:scale-105'}`}>
           {isListening ? <MicOff size={24} aria-hidden="true"/> : <Mic size={24} aria-hidden="true"/>}
        </button>
      </div>

    </div>
  );
}

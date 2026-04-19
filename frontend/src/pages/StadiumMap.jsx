import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVenue } from '../context/VenueContext';
import { useAuth } from '../context/AuthContext';
import { densityLabel } from '../lib/simulation';
import { Navigation, ArrowLeft, Info, X, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ZONE_COLORS = {
  low:      { bg:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.6)',  text:'#047857' },
  medium:   { bg:'rgba(245,158,11,0.15)',  border:'rgba(245,158,11,0.6)',  text:'#B45309' },
  high:     { bg:'rgba(244,63,94,0.15)',   border:'rgba(244,63,94,0.6)',   text:'#BE123C' },
  critical: { bg:'rgba(225,29,72,0.25)',   border:'rgba(225,29,72,0.8)',   text:'#9F1239' },
};

const FACILITIES = [
  { id:'wc-n',   label:'Washroom',    icon:'🚻', x:38, y:22 },
  { id:'wc-s',   label:'Washroom',    icon:'🚻', x:60, y:70 },
  { id:'exit-w', label:'Emergency Exit',icon:'🚪', x:5,  y:50 },
  { id:'exit-e', label:'Emergency Exit',icon:'🚪', x:92, y:50 },
  { id:'med',    label:'First Aid',   icon:'🏥', x:50, y:50 },
];

export default function StadiumMap() {
  const { densities, ZONES, suggestions, friends } = useVenue();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [showNav,  setShowNav]  = useState(false);

  const userZone = profile?.ticketDetails?.gateName 
      ? ZONES.find(z => z.label === profile.ticketDetails.gateName || z.id === profile.ticketDetails.zone) 
      : null;

  const zoneData = (id) => ({
    density: Math.round(densities[id] ?? 0),
    label:   densityLabel(densities[id] ?? 0),
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-slate-200 sticky top-0 z-30 bg-white/90 backdrop-blur-xl shadow-sm">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={20}/> <span className="text-base font-semibold">Dashboard View</span>
        </button>
        <div className="font-orbitron text-xl font-bold text-slate-900 tracking-tight hidden sm:block">INTERACTIVE MAP</div>
        <button onClick={() => setShowNav(true)} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition">
          <Navigation size={18}/> Navigation
        </button>
      </header>

      <div className="flex-1 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row">

        {/* Map Canvas */}
        <div className="flex-1 p-6 md:p-12 flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-2xl aspect-square bg-white rounded-[40px] shadow-sm border border-slate-200 p-8">

            {/* Stadium background oval */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-4 pointer-events-none">
              {/* Outer ring */}
              <ellipse cx="50" cy="50" rx="46" ry="46"
                fill="none" stroke="rgba(226,232,240,1)" strokeWidth="1"/>
              {/* Inner field */}
              <ellipse cx="50" cy="50" rx="20" ry="14"
                fill="rgba(241,245,249,0.5)" stroke="rgba(203,213,225,1)" strokeWidth="0.8"/>
              {/* Field lines */}
              <line x1="30" y1="50" x2="70" y2="50" stroke="rgba(203,213,225,1)" strokeWidth="0.5"/>
              <circle cx="50" cy="50" r="4" fill="none" stroke="rgba(203,213,225,1)" strokeWidth="0.5"/>
              {/* Pitch label */}
              <text x="50" y="52" textAnchor="middle" fontSize="3" fill="rgba(148,163,184,1)" fontFamily="sans-serif" fontWeight="bold" letterSpacing="2">PITCH</text>
              
              {/* Routing Path */}
              {userZone && selected && (
                 <path d={`M ${userZone.x} ${userZone.y} Q 50 50 ${selected.x} ${selected.y}`} fill="none" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="1.5 1.5" className="animate-[dash_2s_linear_infinite]" opacity="0.8" />
              )}
            </svg>
            <style>{`@keyframes dash { to { stroke-dashoffset: -12; } }`}</style>

            {/* Heatmap zones */}
            {ZONES.map(zone => {
              const { density, label } = zoneData(zone.id);
              const c = ZONE_COLORS[label];
              const isSelected = selected?.id === zone.id;
              return (
                <motion.div key={zone.id}
                  onClick={() => setSelected(isSelected ? null : { ...zone, density, label })}
                  animate={{ scale: label==='critical' ? [1,1.05,1] : 1 }}
                  transition={{ duration:1.5, repeat: label==='critical' ? Infinity : 0 }}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${zone.x}%`, top: `${zone.y}%`,
                    transform: 'translate(-50%,-50%)',
                    width: zone.type==='gate' ? 44 : zone.type==='stand' ? 56 : 48,
                    height: zone.type==='gate' ? 44 : zone.type==='stand' ? 56 : 48,
                    background: c.bg,
                    border: `2px solid ${c.border}`,
                    borderRadius: zone.type==='gate' ? 12 : '50%',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    boxShadow: isSelected ? `0 0 24px ${c.border}` : `0 0 10px ${c.border}33`,
                    transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: isSelected ? 20 : 10,
                  }}>
                  <div style={{ fontSize: zone.type==='stand' ? 11 : 9, color: c.text, fontWeight:800, textAlign:'center', lineHeight:1.2, padding:'0 2px' }}>
                    {zone.label.split(' ').map((w,j) => <div key={j}>{w}</div>)}
                  </div>
                  <div style={{ fontSize:10, color:c.text, fontWeight:600, opacity:0.9, marginTop:2 }}>{density}%</div>
                </motion.div>
              );
            })}

            {/* Facility markers */}
            <div className="absolute inset-0 pointer-events-none z-10 p-4">
              {FACILITIES.map(f => (
                <div key={f.id} className="absolute pointer-events-auto" title={f.label}
                     style={{ left:`${f.x}%`, top:`${f.y}%`, transform:'translate(-50%,-50%)',
                              fontSize:20, cursor:'help', filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                  {f.icon}
                </div>
              ))}

              {/* User position */}
              {userZone && (
                  <motion.div animate={{ scale:[1,1.2,1] }} transition={{duration:2, repeat:Infinity}}
                    className="absolute z-30" style={{ left:`${userZone.x}%`, top:`${userZone.y}%` }}>
                    <div className="absolute w-6 h-6 rounded-full bg-indigo-500 opacity-40 animate-ping"
                         style={{ top:'-12px', left:'-12px' }}/>
                    <div className="w-5 h-5 rounded-full bg-indigo-600 border-[3px] border-white shadow-md relative"
                         style={{ marginTop:'-10px', marginLeft:'-10px' }}/>
                  </motion.div>
              )}

              {/* Friends Positions */}
              {friends?.map(f => {
                 const zone = ZONES.find(z => z.id === f.currentZone);
                 if (!zone) return null;
                 const hash = f.id.charCodeAt(f.id.length-1);
                 const offsetX = (hash % 5) - 2;
                 const offsetY = ((hash * 3) % 5) - 2;
                 return (
                   <motion.div key={f.id} title={f.name} className="absolute z-20 w-8 h-8 rounded-full bg-white border-2 border-indigo-100 shadow-md flex items-center justify-center text-sm" style={{ left:`calc(${zone.x + offsetX}%)`, top:`calc(${zone.y + offsetY}%)`, transform:'translate(-50%,-50%)' }}>
                      {f.avatar}
                      <div className="absolute -bottom-4 bg-white/90 backdrop-blur-sm text-[9px] font-bold px-1.5 rounded-md text-indigo-900 border border-indigo-100 whitespace-nowrap shadow-sm">{f.name}</div>
                   </motion.div>
                 );
              })}
            </div>
          </div>
        </div>

        {/* Right panel logic area */}
        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200 bg-white p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 relative">

          {/* Legend */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Capacity Legend</h3>
            <div className="grid grid-cols-2 gap-4">
              {[['Low','#10b981','< 40%'],['Medium','#f59e0b','40–65%'],['High','#ef4444','65–80%'],['Critical','#be123c','> 80%']].map(([l,c,r])=>(
                <div key={l} className="flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{background:c}}/>
                    <span className="text-sm font-bold text-slate-800 tracking-tight">{l}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium pl-5">{r} Density</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI routing suggestions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Routing Intel</h3>
            <div className="space-y-3">
              {suggestions.slice(0,2).map(s => (
                <div key={s.id} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3 shadow-sm hover:shadow-md transition">
                  <div className="text-xl shrink-0 mt-0.5">{s.icon}</div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{s.message}</p>
                </div>
              ))}
              {suggestions.length === 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-gray-500 font-medium text-center">
                  Routing paths clear.
                </div>
              )}
            </div>
          </div>

          {/* Zone Detail Modal (Inline) */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
                <div className={`p-6 rounded-2xl bg-white border shadow-sm relative ${selected.label==='critical'?'border-rose-300 shadow-[0_5px_20px_rgba(225,29,72,0.15)]':'border-slate-200'}`}>
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 p-1 rounded-full transition">
                    <X size={16}/>
                  </button>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight pr-6">{selected.labelName || selected.zone || selected.id}</h3>
                  <div className="text-sm text-gray-500 font-medium capitalize mt-1 mb-5">{selected.type} Area · Live Monitoring Active</div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-extrabold tracking-tight" style={{color: ZONE_COLORS[selected.label].text}}>
                      {selected.density}%
                    </div>
                    <div className="w-px h-10 bg-slate-200"/>
                    <div className="text-sm font-semibold tracking-wide capitalize" style={{color: ZONE_COLORS[selected.label].text}}>
                      {selected.label} traffic Load
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <motion.div className="h-2 rounded-full" initial={{width:0}} animate={{width:`${selected.density}%`}} style={{background: ZONE_COLORS[selected.label].text}}/>
                  </div>
                  
                  {selected.density >= 80 && (
                    <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold leading-relaxed border border-rose-100">
                      ⚠ Zone currently overcrowded. Seek alternate paths if navigating through this sector.
                    </div>
                  )}
                  {selected.density < 40 && (
                    <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold leading-relaxed border border-emerald-100">
                      ✓ Zero congestion issues. Wait times and transit delays are minimal.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zones directory list */}
          <div className="flex-1 min-h-[300px]">
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Directory</h3>
             <div className="space-y-1 pr-2">
               {ZONES.map(zone => {
                 const { density, label } = zoneData(zone.id);
                 const c = ZONE_COLORS[label].text;
                 return (
                   <button key={zone.id} onClick={() => setSelected({ ...zone, density, label })}
                     className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-left">
                     <span className="text-sm font-semibold text-slate-800 tracking-tight">{zone.label}</span>
                     <div className="flex items-center gap-3">
                       <span className="text-xs text-gray-500 capitalize">{label}</span>
                       <div className="px-2.5 py-1 rounded-md text-xs font-bold" style={{backgroundColor: `${ZONE_COLORS[label].bg}`, color:c}}>
                         {density}%
                       </div>
                     </div>
                   </button>
                 );
               })}
             </div>
          </div>
        </div>
      </div>

      {/* Full screen Navigation Overlay Modal */}
      <AnimatePresence>
        {showNav && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowNav(false)}>
            <motion.div initial={{y:40, scale:0.95}} animate={{y:0, scale:1}} exit={{y:40, scale:0.95}}
              className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>
              
              <div className="flex items-center justify-between mb-8 mt-2">
                <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600"><MapPin size={24}/></div>
                   Live Guidance
                </div>
                <button onClick={() => setShowNav(false)} className="text-slate-400 bg-slate-50 p-2 rounded-full hover:bg-slate-100 hover:text-slate-700 transition"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                {[
                  {step:'1', text:`Start Entry at ${profile?.ticketDetails?.gateName || 'Gate B'}`, sub:'Your official designated entry point', done:true},
                  {step:'2', text:'Follow the Green Corridor',    sub:'AI optimal path avoiding 2 congested sectors', done:true},
                  {step:'3', text:`Arrive at Seat ${profile?.ticketDetails?.seat||'E7-23'}`, sub:`Section ${profile?.ticketDetails?.seat?.split('-')[0]||'E'} · Zone ${profile?.ticketDetails?.zone||'E7'}`, done:false},
                ].map(item => (
                  <div key={item.step} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${item.done ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'} `}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 border-2 shadow-sm ${item.done ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-400 border-gray-200'}`}>
                      {item.done ? <CheckCircle size={16}/> : item.step}
                    </div>
                    <div>
                      <div className="text-lg text-slate-900 font-bold mb-1">{item.text}</div>
                      <div className="text-sm text-gray-600 font-medium leading-relaxed">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-2xl flex items-start gap-4 bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm">
                <Info size={24} className="shrink-0 mt-0.5 text-emerald-600"/>
                <div>
                  <div className="text-base font-bold mb-1 tracking-tight">Optimal Route Clear</div>
                  <div className="text-sm font-medium leading-relaxed">Estimated transit duration is ~4 minutes based on current live foot traffic models. Proceed safely.</div>
                </div>
              </div>
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

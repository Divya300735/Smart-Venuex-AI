import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVenue } from '../context/VenueContext';
import { densityLabel } from '../lib/simulation';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, AreaChart, Area, Cell
} from 'recharts';
import {
  Activity, Users, AlertTriangle, Shield, Zap, TrendingUp,
  Settings, Bell, LogOut, Map, ShoppingBag, ChevronRight,
  CheckCircle, Clock, Eye, Navigation, Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
      <div className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wider">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{color:p.color}} className="text-base font-bold">{p.name}: {Math.round(p.value)}%</div>
      ))}
    </div>
  );
};

function Sidebar({ active, setActive, navigate, logout }) {
  const links = [
    { id:'overview',   icon:Activity,   label:'Overview' },
    { id:'heatmap',    icon:Map,        label:'Heatmap' },
    { id:'alerts',     icon:Bell,       label:'Alerts' },
    { id:'staff',      icon:Users,      label:'Staff' },
    { id:'analytics',  icon:TrendingUp, label:'Analytics' },
  ];
  return (
    <div className="w-64 shrink-0 border-r border-slate-200 flex flex-col py-8 px-5 space-y-2 hidden md:flex bg-white">
      <div className="flex items-center gap-3 px-3 mb-10">
        <Cpu size={24} className="text-indigo-600"/>
        <span className="font-orbitron text-lg font-bold text-slate-900">Admin Control</span>
      </div>

      {links.map(l => (
        <button key={l.id} onClick={() => setActive(l.id)}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${active===l.id?'bg-indigo-50 text-indigo-700':'text-gray-500 hover:bg-slate-50 hover:text-slate-800'}`}>
          <l.icon size={20}/> {l.label}
        </button>
      ))}

      <div className="flex-1"/>

      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-gray-500 hover:bg-slate-50 transition-all duration-200">
        <Eye size={20}/> Fan View
      </button>
      <button onClick={logout} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-rose-500 hover:bg-rose-50 transition-all duration-200">
        <LogOut size={20}/> Sign Out
      </button>
    </div>
  );
}

function StatCard({ label, value, sub, icon:Icon, bgClass, borderClass, textClass, trend }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${borderClass} border`}>
          <Icon size={24} className={textClass}/>
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend>=0?'↑':'↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
      {sub && <div className={`text-sm mt-2 font-medium ${textClass}`}>{sub}</div>}
    </div>
  );
}

const ZONE_COLORS_MAP = {
  low:'#10b981', medium:'#f59e0b', high:'#f97316', critical:'#e11d48'
};

const STAFF_ZONES = [
  { zone:'Gate A',     staff:8,  needed:12 },
  { zone:'East Stand', staff:5,  needed:10 },
  { zone:'Food Zone 1',staff:4,  needed:6  },
  { zone:'Gate C',     staff:6,  needed:7  },
];

export default function Admin() {
  const { densities, suggestions, score, alerts, ZONES, lastUpdate } = useVenue();
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [history,   setHistory]   = useState([]);

  // Build history for sparkline
  useEffect(() => {
    if (score === 0) return;
    const entry = {
      time:  new Date().toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
      score: score,
    };
    setHistory(h => [...h.slice(-19), entry]);
  }, [score]);

  const safeScore  = Math.min(100, Math.max(0, score));
  const entryCount  = Math.round(28000 + safeScore * 120);
  const exitCount   = Math.round(entryCount * 0.15);
  const critZones   = ZONES.filter(z => (densities[z.id]??0) >= 80).length;

  const barData = ZONES.map(z => ({
    name:    z.label,
    density: Math.min(100, Math.round(densities[z.id] ?? 0)),
    fill:    ZONE_COLORS_MAP[densityLabel(densities[z.id]??0)],
  }));

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar active={activeTab} setActive={setActiveTab} navigate={navigate} logout={logout}/>

      <div className="flex-1 w-full flex flex-col h-screen overflow-y-auto custom-scrollbar">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-200 sticky top-0 z-30 bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger could go here */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight capitalize">
                {activeTab} Dashboard
              </h1>
              <div className="text-sm font-semibold text-gray-500 mt-1">Last Sync: {lastUpdate?.toLocaleTimeString()||'—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"/>
              Live Status
            </div>
            {critZones > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold shadow-sm">
                <AlertTriangle size={16}/> {critZones} Critical Zones
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-16 space-y-12">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Live Congestion" value={`${safeScore}%`}    
                   bgClass={safeScore<40?'bg-emerald-50':safeScore<65?'bg-amber-50':'bg-rose-50'} 
                   borderClass={safeScore<40?'border-emerald-200':safeScore<65?'border-amber-200':'border-rose-200'}
                   textClass={safeScore<40?'text-emerald-600':safeScore<65?'text-amber-600':'text-rose-600'}
                   icon={Activity} trend={3}/>
                <StatCard label="Total Attendees" value={entryCount.toLocaleString()} 
                   bgClass="bg-indigo-50" borderClass="border-indigo-200" textClass="text-indigo-600" icon={Users} trend={2}/>
                <StatCard label="Overcrowded Zones" value={critZones} 
                   bgClass="bg-rose-50" borderClass="border-rose-200" textClass="text-rose-600" icon={AlertTriangle} trend={-5}/>
                <StatCard label="AI Alerts Active" value={alerts.length} 
                   bgClass="bg-purple-50" borderClass="border-purple-200" textClass="text-purple-600" icon={Bell}/>
              </div>

              {/* Congestion history sparkline */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Congestion Timeline</h2>
                    <p className="text-sm text-gray-500 mt-1">Real-time facility crowding aggregate score.</p>
                  </div>
                  <div className="font-orbitron text-3xl font-extrabold" style={{color: safeScore<40?'#10b981':safeScore<65?'#f59e0b':'#ef4444'}}>
                    {safeScore}%
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={history} margin={{top:10, right:10, left:-20, bottom:0}}>
                    <defs>
                      <linearGradient id="cong" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                    <XAxis dataKey="time" tick={{fill:'#64748B', fontSize:12, fontWeight:500}} tickMargin={10} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fill:'#64748B', fontSize:12, fontWeight:500}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Area type="monotone" dataKey="score" name="Score" stroke="#6366f1" fill="url(#cong)" strokeWidth={4}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Actionable Insights */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Actionable Insights</h2>
                <div className="grid grid-cols-1 gap-4">
                  {suggestions.filter(s=>s.type==='warning'||s.type==='danger').slice(0,3).map(s => (
                    <div key={s.id} className={`bg-white rounded-2xl p-6 flex items-start gap-5 border-l-4 ${s.type==='danger'?'border-rose-500':'border-amber-500'} shadow-sm border border-slate-200`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${s.type==='danger'?'bg-rose-50 text-rose-500':'bg-amber-50 text-amber-500'}`}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-900">{s.title}</div>
                        <div className="text-base text-gray-600 mt-1 leading-relaxed">{s.message}</div>
                      </div>
                    </div>
                  ))}
                  {suggestions.filter(s=>s.type==='warning'||s.type==='danger').length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm text-gray-500 font-semibold">
                      No active critical insights at the moment.
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* ── HEATMAP ── */}
          {activeTab === 'heatmap' && (
            <motion.div key="heatmap" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className="space-y-10">
              
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Zone Density Analysis</h2>
                <p className="text-sm text-gray-500 mb-8">Capacity saturation strictly split by designated venue sections.</p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={barData} margin={{top:10,right:10,left:-20,bottom:40}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                    <XAxis dataKey="name" tick={{fill:'#64748B', fontSize:12, fontWeight:600}} tickMargin={10} angle={-25} textAnchor="end" axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fill:'#64748B', fontSize:12, fontWeight:600}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="density" name="Density" radius={[6,6,0,0]} fill="#6366f1" isAnimationActive={true}>
                      {barData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Zone cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ZONES.map(zone => {
                  const density = Math.round(densities[zone.id]??0);
                  const lbl = densityLabel(density);
                  const cInfo = {
                    low: {bg:'bg-emerald-500',   text:'text-emerald-700', badge:'bg-emerald-100 text-emerald-700'},
                    medium: {bg:'bg-amber-500',  text:'text-amber-700',   badge:'bg-amber-100 text-amber-700'},
                    high: {bg:'bg-rose-500',     text:'text-rose-700',    badge:'bg-rose-100 text-rose-700'},
                    critical: {bg:'bg-rose-600', text:'text-rose-700',    badge:'bg-rose-200 text-rose-800'}
                  }[lbl];
                  return (
                    <motion.div key={zone.id} layout className={`bg-white rounded-2xl p-6 border transition-all shadow-sm ${lbl==='critical'?'border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.15)]':'border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-bold text-slate-800">{zone.label}</span>
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${cInfo.badge}`}>
                           {lbl}
                        </span>
                      </div>
                      <div className={`text-4xl font-extrabold tracking-tight mb-4 ${cInfo.text}`}>{density}%</div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div className={`h-2.5 rounded-full transition-all duration-1000 ${cInfo.bg}`}
                                    style={{width:`${density}%`}}/>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── ALERTS ── */}
          {activeTab === 'alerts' && (
            <motion.div key="alerts" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className="space-y-6">
              <div className="text-lg font-semibold text-gray-500 mb-6">{alerts.length} incident logs recorded in current session.</div>
              {alerts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-20">
                  <CheckCircle size={64} className="mx-auto mb-6 text-emerald-100"/>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">All Clear</h3>
                  <div className="text-base text-gray-500">No overcrowding alerts detected across the entire venue.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {alerts.map((a,i) => (
                    <motion.div key={a.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                      className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5 border-l-4 border-rose-500 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} className="text-rose-600"/>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-slate-900 mb-1">{a.zone} Sector Overcrowded</div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Load: {a.density}% &nbsp;•&nbsp; Logged: {a.time}</div>
                      </div>
                      <span className="px-4 py-2 bg-rose-100 text-rose-700 text-sm font-bold uppercase rounded-lg tracking-wider md:ml-auto mt-4 md:mt-0">Critical Event</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── STAFF ── */}
          {activeTab === 'staff' && (
            <motion.div key="staff" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className="space-y-8">
              
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Zap size={24} className="text-indigo-600"/> 
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Staff Relocation Directive</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {STAFF_ZONES.map((item,i) => (
                    <motion.div key={item.zone} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                      className="flex flex-col md:flex-row md:items-center gap-6 py-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{item.zone} deployment</h3>
                        <p className="text-base text-gray-500 font-medium">
                          Active: <span className="text-slate-800">{item.staff} assigned</span> &nbsp;|&nbsp; Optimal Goal: <span className="text-slate-800">{item.needed} required</span>
                        </p>
                      </div>
                      <div className="w-full md:w-64 shrink-0">
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-gray-500">{item.staff} active</span>
                          <span className="text-indigo-600">Target: {item.needed}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full ${item.staff >= item.needed ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{width:`${(item.staff/item.needed)*100}%`}}/>
                        </div>
                      </div>
                      <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                        disabled={item.staff >= item.needed}
                        className={`md:ml-4 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-sm border ${item.staff >= item.needed ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500'}`}>
                        {item.staff >= item.needed ? 'Optimized' : `Dispatch +${item.needed-item.staff} Staff`}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}} className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Ingress"   value={entryCount.toLocaleString()} bgClass="bg-indigo-50" borderClass="border-indigo-200" textClass="text-indigo-600"  icon={Navigation} trend={4}/>
                <StatCard label="Total Egress"     value={exitCount.toLocaleString()}  bgClass="bg-emerald-50" borderClass="border-emerald-200" textClass="text-emerald-600" icon={Shield} trend={1}/>
                <StatCard label="Capacity Strain"   value={`${(100*(entryCount-exitCount)/50000).toFixed(1)}%`} bgClass="bg-amber-50" borderClass="border-amber-200" textClass="text-amber-600" icon={TrendingUp}/>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Historical Volume Variance</h2>
                <p className="text-sm text-gray-500 mb-8">Data reflects real-time shifting throughout the current operational window.</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history} margin={{top:10,right:10,left:-20,bottom:10}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                    <XAxis dataKey="time" tick={{fill:'#64748B',fontSize:12, fontWeight:500}} tickMargin={15} interval="preserveStartEnd" axisLine={false} tickLine={false}/>
                    <YAxis domain={[0,100]} tick={{fill:'#64748B',fontSize:12, fontWeight:500}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey="score" name="Load Score" stroke="#6366F1" strokeWidth={4} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label:'Peak Traffic Array',      value:'18:30–19:00', textClass:'text-rose-600', bgClass:'bg-white' },
                  { label:'Aggregate Load',    value:`${safeScore}%`, textClass:'text-indigo-600', bgClass:'bg-white' },
                  { label:'Security Logs',      value: alerts.length, textClass:'text-amber-600', bgClass:'bg-white' },
                  { label:'Optimization Triggers', value: suggestions.length, textClass:'text-purple-600', bgClass:'bg-white' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition duration-300">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">{item.label}</div>
                    <div className={`text-3xl font-bold tracking-tight ${item.textClass}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}

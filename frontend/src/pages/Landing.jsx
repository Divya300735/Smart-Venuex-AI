import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Navigation, Users, Activity, Cpu, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Navigation, title: 'Smart Navigation',   desc: 'AI-guided routes to your seat with real-time crowd avoidance logic built-in.' },
  { icon: Activity,   title: 'Live Crowd Heatmap', desc: 'Dynamic heat visualization of all stadium zones, updated every 3 seconds.' },
  { icon: Zap,        title: 'Virtual Queue',      desc: 'Skip physical lines with intelligent digital tokens for food & facilities.' },
  { icon: Shield,     title: 'Emergency System',   desc: 'One-tap panic button with instant geo-alerts to security staff.' },
  { icon: Cpu,        title: 'Predictive AI',      desc: 'Anticipates crowd surges and automatically redirects foot traffic flows.' },
  { icon: Users,      title: 'Command Center',     desc: 'Real-time dashboards for venue managers with smart dispatch tools.' },
];

const STATS = [
  { value: '50K+',  label: 'Concurrent Users' },
  { value: '12',    label: 'Stadium Zones'    },
  { value: '3s',    label: 'Data Latency'     },
  { value: '99.9%', label: 'Uptime SLA'       },
];

const BENEFITS = [
  'Real-time crowd density',
  'Zero wait ordering',
  'AI seat routing',
  'Instant emergency alerts',
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans font-normal antialiased flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-orbitron font-extrabold text-xl tracking-tight text-slate-900">SmartVenueX</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="text-base font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Sign In
            </button>
            <button onClick={() => navigate('/login')} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full mt-20">

        {/* ── HERO ── */}
        <section className="w-full flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 lg:py-40 max-w-5xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/50 border border-indigo-200 mb-10">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-sm font-bold text-indigo-700 tracking-widest uppercase">Smart Platform v2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-8 leading-[1.1]">
            The AI-Powered Stadium <br className="hidden md:block"/> Experience Platform
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Eliminate crowd congestion, reduce wait times, and deliver a premium experience at your sporting venue completely powered by real-time predictive intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3">
              Create Free Account <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/admin')} className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-3">
              <Shield size={20} className="text-indigo-600" /> Admin Dashboard
            </button>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {BENEFITS.map(b => (
              <div key={b} className="flex items-center gap-2 text-sm md:text-base font-semibold text-slate-600">
                <CheckCircle size={18} className="text-emerald-500" /> {b}
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="bg-slate-900 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((s, i) => (
              <div key={i} className="text-center flex flex-col items-center justify-center space-y-3">
                <div className="text-4xl md:text-6xl font-extrabold tracking-tighter text-indigo-400">{s.value}</div>
                <div className="text-sm md:text-base font-bold text-slate-300 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                Everything your venue needs
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Enterprise-grade modules engineered to handle massive stadium traffic routing and logic—all natively integrated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <f.icon size={32} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="px-6 pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto bg-indigo-600 rounded-[40px] px-8 py-20 md:py-28 text-center border border-indigo-500 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-8">
                Ready to transform your venue?
              </h2>
              <p className="text-lg md:text-xl text-indigo-100 mb-12 max-w-2xl font-medium leading-relaxed">
                Join our premium network of intelligent stadiums delivering flawless, world-class fan experiences with zero bottlenecks.
              </p>
              <button onClick={() => navigate('/login')} className="px-10 py-5 rounded-full font-bold text-lg bg-white text-indigo-700 shadow-xl hover:bg-slate-50 transition-all flex items-center gap-3">
                Launch Platform Free <ArrowRight size={20}/>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white border-t border-slate-200 py-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-orbitron font-bold text-slate-900 text-base">SmartVenueX</span>
          </div>
          <p className="text-sm font-semibold text-slate-500">© 2026 SmartVenueX Systems. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
}

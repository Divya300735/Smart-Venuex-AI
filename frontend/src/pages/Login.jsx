import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, AlertCircle, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function Login() {
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const [tab,       setTab]       = useState('signup');   // default → signup for new users
  const [firstName, setFirstName] = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  useEffect(() => {
    if (user) navigate('/scan');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (tab === 'signup' && !firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const safeEmail = email.trim();
    console.log(`[Auth Flow] Attempting ${tab} for: ${safeEmail}`);
    try {
      if (tab === 'signup') {
        await signup(safeEmail, password, firstName.trim());
        console.log('[Auth Flow] Signup successful.');
        setSuccess('Account created! You can now sign in.');
        // auto switch to sign in tab after signup
        setTimeout(() => {
          setSuccess('');
          setTab('login');
          setPassword('');
        }, 1800);
      } else {
        await login(safeEmail, password);
        console.log('[Auth Flow] Login successful.');
      }
    } catch (err) {
      console.error('[Auth Flow] Error:', err.message);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
    setPassword('');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-orbitron text-xl font-bold text-slate-900">SmartVenueX</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            {tab === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {tab === 'signup'
              ? 'Sign up to access your AI-powered stadium experience.'
              : 'Sign in to continue to your dashboard.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          {/* Tabs */}
          <div className="flex mb-6 p-1 rounded-xl bg-slate-100 border border-slate-200/60 gap-1">
            {[
              { id: 'signup', label: 'Sign Up' },
              { id: 'login',  label: 'Sign In' },
            ].map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)}
                aria-label={`Switch to ${t.label} tab`}
                aria-selected={tab === t.id}
                role="tab"
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${tab === t.id
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* First Name — signup only */}
            <AnimatePresence>
              {tab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      type="text"
                      placeholder="Alex"
                      required={tab === 'signup'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200
                        focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200
                    focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-900 bg-slate-50 border border-slate-200
                    focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {tab === 'signup' && (
                <p className="text-xs text-slate-400 mt-1.5 font-medium">At least 6 characters required</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-600 font-medium">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white
                transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
              ) : (
                <>
                  {tab === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Switch hint */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {tab === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => switchTab('login')}
                  className="text-indigo-600 font-semibold hover:text-indigo-500 transition">Sign In</button>
              </>
            ) : (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => switchTab('signup')}
                  className="text-indigo-600 font-semibold hover:text-indigo-500 transition">Sign Up</button>
              </>
            )}
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </main>
  );
}

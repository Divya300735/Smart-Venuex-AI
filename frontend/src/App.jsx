import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WifiOff } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VenueProvider } from './context/VenueContext';

import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import StadiumMap from './pages/StadiumMap';
import FoodOrder  from './pages/FoodOrder';
import Admin      from './pages/Admin';
import Emergency  from './pages/Emergency';
import QRScanner  from './pages/QRScanner';

// Protected route wrapper
function Protected({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
           <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin"></div>
           <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin-slow"></div>
        </div>
        <div className="text-indigo-600 text-sm font-orbitron tracking-widest uppercase font-bold">Initializing System</div>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace/>;

  const isAdmin = profile?.role === 'admin';

  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace/>;
  
  if (!profile?.ticketVerified && !adminOnly && !isAdmin) {
     return <Navigate to="/scan" replace/>;
  }
  
  return children;
}

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AuthProvider>
      <VenueProvider>
        <BrowserRouter>
          {isOffline && (
            <div className="bg-rose-600 text-white px-4 py-3 flex items-center justify-center gap-3 text-xs md:text-sm font-extrabold uppercase tracking-widest sticky top-0 z-[9999] shadow-lg animate-pulse border-b-4 border-rose-900">
              <WifiOff size={18} /> OFFLINE MODE: DISPLAYING CACHED AI PREDICTIONS
            </div>
          )}
          <Toaster 
            position="top-center" 
            toastOptions={{
              duration: 4000,
              style: { 
                background: 'rgba(255,255,255,0.9)', 
                color: '#1E293B', 
                border: '1px solid rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 600
              }
            }}/>
          <Routes>
            <Route path="/"          element={<Landing/>}/>
            <Route path="/login"     element={<Login/>}/>
            <Route path="/scan"      element={<QRScanner/>}/>
            <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
            <Route path="/map"       element={<Protected><StadiumMap/></Protected>}/>
            <Route path="/food"      element={<Protected><FoodOrder/></Protected>}/>
            <Route path="/emergency" element={<Protected><Emergency/></Protected>}/>
            <Route path="/admin"     element={<Protected adminOnly><Admin/></Protected>}/>
            <Route path="*"          element={<Navigate to="/" replace/>}/>
          </Routes>
        </BrowserRouter>
      </VenueProvider>
    </AuthProvider>
  );
}

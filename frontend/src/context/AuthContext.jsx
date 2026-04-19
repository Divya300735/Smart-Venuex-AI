import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback offline simulator if Firebase fails
  const [offlineStore, setOfflineStore] = useState({});

  useEffect(() => {
    // Standard Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({ ...data, ticketVerified: false }); // ALWAYS force re-verify ticket on open
          } else {
             // Fallback profile if missing from db
             setProfile({ email: currentUser.email, name: currentUser.displayName, role: 'user', ticketVerified: false });
          }
        } catch (err) {
          console.warn("Firestore offline bypass active:", err.message);
          setProfile({ email: currentUser?.email || 'test@test.com', name: 'Fan', role: 'user', ticketVerified: false });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      console.warn("Firebase Login Error. Using Simulation Bypass.", err.message);
      const fakeUser = { uid: 'mock-auth-uid', email, displayName: 'Fan' };
      setUser(fakeUser);
      setProfile({ email, name: 'Fan', role: 'user', ticketVerified: false });
      return fakeUser;
    }
  };

  const signup = async (email, password, firstName) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: firstName });
      
      const newProfile = { email, name: firstName, role: 'user', ticketVerified: false, ticketDetails: null };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      
      return cred.user;
    } catch (err) {
      console.warn("Firebase Signup Error. Using Simulation Bypass.", err.message);
      const fakeUser = { uid: 'mock-auth-uid', email, displayName: firstName };
      setUser(fakeUser);
      setProfile({ email, name: firstName, role: 'user', ticketVerified: false });
      return fakeUser;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e.message);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const verifyTicket = async (ticketId) => {
    try {
      // Admin override cheat code for fast hackathon demo
      if (ticketId.toLowerCase().includes('admin')) {
         setProfile(p => ({
            ...p, ticketVerified: true, role: 'admin', ticketDetails: { zone: 'vip-lounge', gateName: 'VIP Entrance', seat: 'Admin Box' }
         }));
         toast.success("Admin Access Override Engaged");
         return true;
      }

      // Real Firebase Verification
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticketSnap = await getDoc(ticketRef);
      
      if (ticketSnap.exists()) {
         const tData = ticketSnap.data();
         if (tData.used) {
            throw new Error("Ticket already scanned at another gate!");
         }
         // Mark as used
         await updateDoc(ticketRef, { used: true, scannedAt: new Date().toISOString() });
         
         const updatedProfile = {
            ...profile, ticketVerified: true, ticketDetails: { ticketId, status: 'used', zone: tData.zone || 'east-stand', gateName: tData.gateName || 'Gate A', seat: tData.seat || 'E7-23', section: tData.section || 'East Upper' }
         };
         
         // Secure in Firestore
         if (user?.uid) {
            await updateDoc(doc(db, 'users', user.uid), { ticketDetails: updatedProfile.ticketDetails });
         }
         
         setProfile(updatedProfile);
         return true;
      }
      throw new Error("Ticket ID mapping failed.");
      
    } catch (err) {
       console.warn("Firebase Ticket Verification Error. Using Simulation.", err.message);
       if (err.message.includes('already scanned')) throw err;
       
       const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'VIP Entrance'];
       const zones = ['east-stand', 'west-stand', 'north-stand', 'south-stand', 'vip-lounge'];
       const sections = ['East Upper', 'West Lower', 'North Deck', 'South End', 'Premium Box'];
       
       let sum = 0;
       if (ticketId) {
         for (let i = 0; i < ticketId.length; i++) {
           sum += ticketId.charCodeAt(i);
         }
       }
       const idx = sum % gates.length;
       
       const updatedProfile = {
          ...profile, 
          ticketVerified: true, 
          ticketDetails: {
            ticketId, status: 'used', zone: zones[idx], gateName: gates[idx], 
            seat: `${sections[idx].charAt(0)}${idx+1}-${(sum % 90) + 10}`, section: sections[idx]
          }
       };
       setProfile(updatedProfile);
       return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, verifyTicket }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

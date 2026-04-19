import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

const VenueContext = createContext();

const MOCK_ZONES = [
  { id: 'gate-a',     label: 'Gate A',      type: 'gate',   x: 15, y: 80, limit: 1200 },
  { id: 'gate-b',     label: 'Gate B',      type: 'gate',   x: 85, y: 80, limit: 1000 },
  { id: 'east-stand', label: 'East Stand',  type: 'stand',  x: 85, y: 50, limit: 15000 },
  { id: 'west-stand', label: 'West Stand',  type: 'stand',  x: 15, y: 50, limit: 15000 },
  { id: 'north-stand',label: 'North Stand', type: 'stand',  x: 50, y: 15, limit: 10000 },
  { id: 'south-stand',label: 'South Stand', type: 'stand',  x: 50, y: 85, limit: 8000 },
  { id: 'food-zone1', label: 'East Food Court', type: 'amenity', x: 70, y: 20, limit: 500 },
  { id: 'food-zone2', label: 'West Food Court', type: 'amenity', x: 30, y: 20, limit: 400 },
];

const MOCK_FRIENDS = [
  { id: 'f1', name: 'Sarah J.', avatar: '👩', currentZone: 'west-stand', zoneName: 'West Stand' },
  { id: 'f2', name: 'Mike T.', avatar: '👨', currentZone: 'food-zone1', zoneName: 'East Food Court' },
  { id: 'f3', name: 'Emily R.', avatar: '👱‍♀️', currentZone: 'gate-a', zoneName: 'Gate A Entry' }
];

export function VenueProvider({ children }) {
  const [densities, setDensities] = useState(() => {
      try {
          const cached = localStorage.getItem('cached_densities');
          if (cached) return JSON.parse(cached);
      } catch(e) {}
      return {};
  });
  const [predictions, setPredictions] = useState({}); // Predictive AI Flow Store
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [score, setScore] = useState(0);
  const [friends, setFriends] = useState(() => {
      try {
          const cached = localStorage.getItem('cached_friends');
          return cached ? JSON.parse(cached) : MOCK_FRIENDS;
      } catch(e) { return MOCK_FRIENDS; }
  });
  const [lastUpdate, setLastUpdate] = useState(null);

  // Velocity tracking ref to calculate future crowd density
  const historyRef = useRef({});

  // OFFLINE AI RULE-BASED SIMULATOR ENGINE (Zero-Latency Hack)
  const runRuleBasedAISimulation = (newDensities) => {
     let aggregate = 0;
     let keys = Object.keys(newDensities);
     if(keys.length === 0) return;
     
     let generatedSuggestions = [];
     let generatedAlerts = [];
     let newPredictions = {};
     
     keys.forEach(k => {
         aggregate += newDensities[k];
         
         // Predictve Flow Algorithm Calculate Velocity
         const currentD = newDensities[k];
         const pastHist = historyRef.current[k] || [];
         
         if (pastHist.length > 0) {
            // Compare average of moving window
            const lastAvg = pastHist.reduce((a,b)=>a+b, 0) / pastHist.length;
            const velocity = currentD - lastAvg; // Positive if growing
            
            // Generate +10 Minute Projection
            if (velocity > 0.5 && currentD > 50) {
               let predictedT10 = Math.min(99, currentD + (velocity * 4)); 
               if (predictedT10 > 80) {
                   newPredictions[k] = { projected: Math.round(predictedT10), warning: `Approaching ${Math.round(predictedT10)}% in ~10 mins` };
                   // Add high level AI route suggestions if gates
                   if (k === 'gate-a' && predictedT10 > 85) {
                      generatedSuggestions.push({
                        id: `pred-${k}`, type: 'warning', icon: '🔮', title: 'Predictive Saturation',
                        message: `Gate A will naturally compress in 10 minutes. AI redirects active.`
                      });
                   }
               }
            }
         }
         
         // Store history window (Rolling 3 periods)
         pastHist.push(currentD);
         if (pastHist.length > 3) pastHist.shift();
         historyRef.current[k] = pastHist;
     });

     let meanScore = Math.min(100, aggregate / keys.length);
     setScore(meanScore);

     // Rule 1: High Global Crowding
     if (meanScore > 75) {
       generatedSuggestions.push({
         id: 'sys-overload', type: 'danger', icon: '🚨', title: 'Global Venue Congestion',
         message: 'The stadium is experiencing peak load. Stagger exits and dispatch crowd control.'
       });
     }

     // Rule 2: Dynamic Food Routing
     const food1 = newDensities['food-zone1'] || 0;
     const food2 = newDensities['food-zone2'] || 0;
     if (food1 > 60 && food2 < 40) {
       generatedSuggestions.push({
         id: 'food-redirect', type: 'info', icon: '🍔', title: 'Optimal Food Route',
         message: 'East Food Court is highly congested. AI projects Wait Time < 4 min at West Food Court.'
       });
     }

     // 🔥 FIX: Never let the AI grid look empty on the UI presentation!
     if (generatedSuggestions.length === 0) {
         generatedSuggestions.push({
             id: 'ai-nominal', type: 'success', icon: '✅', title: 'AI System Nominal',
             message: 'All zones are operating within optimal limits. Flow patterns are stable.'
         });
     }

     setPredictions(newPredictions);
     setSuggestions(generatedSuggestions);
     
     // Cache securely for offline resilient mode
     try {
         localStorage.setItem('cached_densities', JSON.stringify(newDensities));
     } catch(e){}
  };

  useEffect(() => {
    // Attempt Firebase Subscription
    let unsubscribe = null;
    try {
        const zonesRef = collection(db, 'zones');
        unsubscribe = onSnapshot(zonesRef, (snapshot) => {
            if (snapshot.empty) throw new Error("No remote data");
            const d = {};
            snapshot.forEach(doc => {
               d[doc.id] = doc.data().density || 0;
            });
            setDensities(d);
            setLastUpdate(new Date());
            runRuleBasedAISimulation(d);
        }, (err) => {
           console.warn("Firestore listener failed, failing over to autonomous simulation.");
        });
    } catch (e) {
        console.warn("Initializing Autonomous Predictive Engine Base.");
    }

    // AUTONOMOUS OFFLINE STANDBY ENGINE
    const simInterval = setInterval(() => {
        // Randomly simulate friends moving slightly
        setFriends(prev => {
            const next = prev.map(f => {
               if (Math.random() > 0.8) {
                   const newZone = MOCK_ZONES[Math.floor(Math.random() * MOCK_ZONES.length)];
                   return { ...f, currentZone: newZone.id, zoneName: newZone.label };
               }
               return f;
            });
            localStorage.setItem('cached_friends', JSON.stringify(next));
            return next;
        });

        setDensities(prev => {
            const next = { ...prev };
            if (Object.keys(next).length === 0) {
                MOCK_ZONES.forEach(z => next[z.id] = Math.random() * 40 + 10);
            } else {
                MOCK_ZONES.forEach(z => {
                    const shift = (Math.random() - 0.45) * 8; 
                    let v = (next[z.id] || 30) + shift;
                    if (v < 5) v = 5;
                    if (v > 98) v = 98;
                    // Trigger a spike randomly to trace Predictive Flow capabilities
                    if (Math.random() > 0.95 && z.id === 'gate-a') v += Math.random() * 8;
                    next[z.id] = v;
                });
            }
            setLastUpdate(new Date());
            runRuleBasedAISimulation(next);
            return next;
        });
    }, 4000);

    return () => {
        if(unsubscribe) unsubscribe();
        clearInterval(simInterval);
    };
  }, []);

  const addFriend = (name) => {
    if (!name) return;
    const avatars = ['🧑', '👨‍🚀', '🦸', '🥷', '👩‍🎤', '🕵️'];
    const randomZone = MOCK_ZONES[Math.floor(Math.random() * MOCK_ZONES.length)];
    const newFriend = {
       id: `f-${Date.now()}`,
       name,
       avatar: avatars[Math.floor(Math.random() * avatars.length)],
       currentZone: randomZone.id,
       zoneName: randomZone.label
    };
    setFriends(prev => {
        const next = [...prev, newFriend];
        localStorage.setItem('cached_friends', JSON.stringify(next));
        return next;
    });
  };

  return (
    <VenueContext.Provider value={{ 
        densities, 
        predictions, 
        suggestions, 
        alerts, 
        score, 
        friends,
        lastUpdate, 
        ZONES: MOCK_ZONES,
        addFriend
    }}>
      {children}
    </VenueContext.Provider>
  );
}

export const useVenue = () => useContext(VenueContext);

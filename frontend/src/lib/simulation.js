// ─── Crowd Simulation Engine ───────────────────────────────────────────────
// Simulates real-time crowd density for 12 stadium zones
// Updates every 3 seconds with realistic drift / spike behaviour

export const ZONES = [
  { id: 'gate-a',     label: 'Gate A',        x: 10,  y: 45, type: 'gate' },
  { id: 'gate-b',     label: 'Gate B',        x: 88,  y: 45, type: 'gate' },
  { id: 'gate-c',     label: 'Gate C',        x: 49,  y: 5,  type: 'gate' },
  { id: 'gate-d',     label: 'Gate D',        x: 49,  y: 88, type: 'gate' },
  { id: 'north-stand',label: 'North Stand',   x: 49,  y: 18, type: 'stand' },
  { id: 'south-stand',label: 'South Stand',   x: 49,  y: 75, type: 'stand' },
  { id: 'east-stand', label: 'East Stand',    x: 78,  y: 47, type: 'stand' },
  { id: 'west-stand', label: 'West Stand',    x: 20,  y: 47, type: 'stand' },
  { id: 'food-zone1', label: 'Food Court 1',  x: 20,  y: 20, type: 'food' },
  { id: 'food-zone2', label: 'Food Court 2',  x: 78,  y: 20, type: 'food' },
  { id: 'food-zone3', label: 'Food Court 3',  x: 20,  y: 75, type: 'food' },
  { id: 'vip-lounge', label: 'VIP Lounge',    x: 78,  y: 75, type: 'vip' },
];

const BASE_DENSITIES = {
  'gate-a':      75,
  'gate-b':      35,
  'gate-c':      55,
  'gate-d':      45,
  'north-stand': 70,
  'south-stand': 60,
  'east-stand':  80,
  'west-stand':  50,
  'food-zone1':  65,
  'food-zone2':  40,
  'food-zone3':  55,
  'vip-lounge':  25,
};

let densities = { ...BASE_DENSITIES };
let listeners = [];
let intervalId = null;

/** Clamp value between min and max */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Gaussian-ish random drift */
const drift = (current, base) => {
  const noise = (Math.random() - 0.5) * 18;
  const pull  = (base - current) * 0.12;      // mean-reversion
  return clamp(current + noise + pull, 0, 100);
};

/** Trigger a random spike event ~15% of ticks */
const maybeSpikeEvent = () => {
  if (Math.random() > 0.15) return;
  const zoneIds = Object.keys(densities);
  const target  = zoneIds[Math.floor(Math.random() * zoneIds.length)];
  densities[target] = clamp(densities[target] + 25, 0, 100);
};

/** Compute density label */
export const densityLabel = (v) => {
  if (v < 40) return 'low';
  if (v < 65) return 'medium';
  if (v < 80) return 'high';
  return 'critical';
};

/** Subscribe to live updates. Returns unsubscribe fn. */
export const subscribeCrowd = (cb) => {
  listeners.push(cb);
  if (!intervalId) {
    intervalId = setInterval(() => {
      maybeSpikeEvent();
      Object.keys(densities).forEach(id => {
        densities[id] = drift(densities[id], BASE_DENSITIES[id]);
      });
      const snapshot = { ...densities, timestamp: Date.now() };
      listeners.forEach(fn => fn(snapshot));
    }, 3000);
  }
  // emit immediately
  cb({ ...densities, timestamp: Date.now() });
  return () => {
    listeners = listeners.filter(fn => fn !== cb);
    if (listeners.length === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};

/** Get current snapshot */
export const getDensities = () => ({ ...densities });

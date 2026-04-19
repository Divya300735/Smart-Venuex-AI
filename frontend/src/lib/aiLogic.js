// ─── AI Crowd Logic Module ─────────────────────────────────────────────────
// Generates intelligent suggestions based on zone density data
// No API key required – deterministic rule-based AI simulation

import { densityLabel } from './simulation';

/** Generate smart routing suggestions from density snapshot */
export const getAISuggestions = (densities) => {
  const suggestions = [];

  // Gate congestion alerts
  const gates = ['gate-a','gate-b','gate-c','gate-d'];
  const gateDensities = gates.map(id => ({ id, v: densities[id] ?? 0 }));
  const crowdedGate = gateDensities.find(g => g.v >= 75);
  const clearGate   = gateDensities.sort((a,b) => a.v - b.v)[0];

  if (crowdedGate && clearGate && crowdedGate.id !== clearGate.id) {
    const labels = { 'gate-a':'Gate A','gate-b':'Gate B','gate-c':'Gate C','gate-d':'Gate D' };
    suggestions.push({
      id: 'gate-reroute',
      type: 'warning',
      icon: '⚠️',
      title: `${labels[crowdedGate.id]} is overcrowded`,
      message: `Use ${labels[clearGate.id]} instead — save ~${Math.round((crowdedGate.v - clearGate.v) * 0.3)} min`,
      priority: 1,
    });
  }

  // Food stall suggestion
  const foodZones = [
    { id:'food-zone1', label:'Food Court 1' },
    { id:'food-zone2', label:'Food Court 2' },
    { id:'food-zone3', label:'Food Court 3' },
  ];
  const bestFood = foodZones
    .map(z => ({ ...z, v: densities[z.id] ?? 50 }))
    .sort((a,b) => a.v - b.v)[0];

  if (bestFood && bestFood.v < 55) {
    suggestions.push({
      id: 'food-suggest',
      type: 'info',
      icon: '🍕',
      title: `${bestFood.label} has shortest wait`,
      message: `Estimated queue: ${Math.round(bestFood.v * 0.4)} people · ~${Math.round(bestFood.v * 0.2)} min wait`,
      priority: 2,
    });
  }

  // VIP / stand overflow
  if ((densities['east-stand'] ?? 0) > 82) {
    suggestions.push({
      id: 'stand-overflow',
      type: 'danger',
      icon: '🚨',
      title: 'East Stand near capacity',
      message: 'Please use North or West Stand entrances to redistribute load',
      priority: 0,
    });
  }

  // General tip
  suggestions.push({
    id: 'tip',
    type: 'success',
    icon: '💡',
    title: 'Smart tip',
    message: 'Pre-order food 30 min before half-time to skip queues entirely',
    priority: 3,
  });

  return suggestions.sort((a,b) => a.priority - b.priority);
};

/** Compute overall venue congestion score 0-100 */
export const congestionScore = (densities) => {
  const vals = Object.entries(densities)
    .filter(([k, v]) => k !== 'timestamp' && typeof v === 'number')
    .map(([, v]) => v);
  if (!vals.length) return 0;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.min(100, Math.max(0, Math.round(avg)));
};

/** Predict next density for a zone (simple linear regression simulation) */
export const predictDensity = (history = []) => {
  if (history.length < 2) return null;
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const trend = (last - prev) * 0.6;
  return Math.min(100, Math.max(0, Math.round(last + trend)));
};

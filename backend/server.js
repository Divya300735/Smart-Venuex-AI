const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Mock Auth DB ---
let mockUser = null;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function makeUser(email) {
  const name = email.split('@')[0].replace(/[._]/g,' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    uid: 'mock-' + Math.random().toString(36).slice(2),
    email,
    displayName: name,
    photoURL: null,
  };
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  await delay(800);
  mockUser = makeUser(email);
  res.json({ user: mockUser });
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  await delay(1000);
  mockUser = makeUser(email);
  res.json({ user: mockUser });
});

app.post('/api/auth/logout', async (req, res) => {
  await delay(300);
  mockUser = null;
  res.json({ success: true });
});

// --- Tickets Verification Logic ---
// We simulate Firebase Firestore logic here
const ticketsDB = {
  'TKT-FAN-001': { ticketId: 'TKT-FAN-001', userId: 'user1', zone: 'A', status: 'valid' },
  'INVALID-123':  { ticketId: 'INVALID-123',  userId: 'user2', zone: 'B', status: 'used'  }
};

app.post('/api/tickets/verify', async (req, res) => {
  const { ticketId } = req.body;
  await delay(500);
  
  const ticket = ticketsDB[ticketId];
  if (!ticket) {
    return res.status(404).json({ error: "Invalid Ticket - Not Found" });
  }
  
  if (ticket.status !== 'valid') {
    return res.status(400).json({ error: "Ticket Already Used or Invalid" });
  }
  
  // Mark used, then auto-reset after 8s for demo
  ticketsDB[ticketId].status = 'used';
  setTimeout(() => { ticketsDB[ticketId].status = 'valid'; }, 8000);
  
  res.json({ success: true, message: 'Ticket verified' });
});

// --- Venue Simulation ---
const BASE_DENSITIES = {
  'gate-a': 75, 'gate-b': 35, 'gate-c': 55, 'gate-d': 45,
  'north-stand': 70, 'south-stand': 60, 'east-stand': 80, 'west-stand': 50,
  'food-zone1': 65, 'food-zone2': 40, 'food-zone3': 55, 'vip-lounge': 25,
};

let densities = { ...BASE_DENSITIES };
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const drift = (current, base) => clamp(current + (Math.random() - 0.5) * 18 + (base - current) * 0.12, 0, 100);

setInterval(() => {
  if (Math.random() <= 0.15) {
    const keys = Object.keys(densities);
    const target = keys[Math.floor(Math.random() * keys.length)];
    densities[target] = clamp(densities[target] + 25, 0, 100);
  }
  Object.keys(densities).forEach(id => {
    densities[id] = drift(densities[id], BASE_DENSITIES[id]);
  });
}, 3000);

// Polling endpoint
app.get('/api/venue/density', (req, res) => {
  res.json({ ...densities, timestamp: Date.now() });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});

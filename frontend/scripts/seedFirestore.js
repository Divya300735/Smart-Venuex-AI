import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

const MOCK_TICKETS = [
  { ticketId: 'TKT-FAN-001', userId: 'mocked', zone: 'east-stand', gateName: 'Gate A', section: 'East Upper', seat: 'E7-23', status: 'valid', used: false },
  { ticketId: 'TKT-VIP-999', userId: 'mocked', zone: 'vip-lounge', gateName: 'VIP Entrance', section: 'Premium Box', seat: 'V-1', status: 'valid', used: false }
];

async function seed() {
  console.log('🌱 Starting Firebase Seeding Process...');
  try {
    const batch = writeBatch(db);

    // Seed Zones
    for (const z of MOCK_ZONES) {
      const ref = doc(db, 'zones', z.id);
      batch.set(ref, { 
        ...z, 
        density: Math.floor(Math.random() * 50) + 10 
      });
    }

    // Seed Tickets
    for (const t of MOCK_TICKETS) {
      const ref = doc(db, 'tickets', t.ticketId);
      batch.set(ref, t);
    }

    await batch.commit();
    console.log('✅ Successfully seeded `zones` and `tickets` collections!');
    process.exit(0);
  } catch (err) {
    console.error('❌ SEED ERROR:', err.message);
    process.exit(1);
  }
}

seed();

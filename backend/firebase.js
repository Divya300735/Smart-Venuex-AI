// ─── Firebase + Mock Auth ──────────────────────────────────────────────────
// Uses Firebase when config is available, otherwise falls back to mock mode

// Replace with your Firebase config to enable real auth:
const FIREBASE_CONFIG = null; // set to your config object to enable

export const mockMode = !FIREBASE_CONFIG;

// ─── Mock Auth Store ───────────────────────────────────────────────────────
let mockUser = null;
const mockListeners = [];

export const mockAuth = {
  onAuthStateChanged: (cb) => {
    mockListeners.push(cb);
    cb(mockUser);
    return () => {};
  },
  signInWithEmailAndPassword: async (email, password) => {
    await delay(800);
    mockUser = makeUser(email);
    mockListeners.forEach(fn => fn(mockUser));
    return { user: mockUser };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    await delay(1000);
    mockUser = makeUser(email);
    mockListeners.forEach(fn => fn(mockUser));
    return { user: mockUser };
  },
  signOut: async () => {
    await delay(300);
    mockUser = null;
    mockListeners.forEach(fn => fn(null));
  },
  currentUser: null,
};

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

const delay = (ms) => new Promise(r => setTimeout(r, ms));

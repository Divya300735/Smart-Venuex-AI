import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, doc, setDoc } from 'firebase/firestore';

// ⚠️ Insert your ACTUAL Firebase Config here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDUMMYKEY1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartvenuex.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartvenuex",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartvenuex.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// PRO HACK: Enable offline persistence so the app survives internet loss on stage!
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Multiple tabs open, offline DB limited to one tab");
  } else if (err.code == 'unimplemented') {
    console.warn("Browser lacks offline support");
  }
});

// Helper: Seed dummy config locally if offline
export const initFirebaseSimulationData = async () => {
    try {
        await setDoc(doc(db, "system", "status"), {
            online: true,
            version: "v2.0"
        }, { merge: true });
        console.log("Firebase simulation local layer ready.");
    } catch(e) {
        console.warn("Using offline bypass mode due to invalid keys.");
    }
};

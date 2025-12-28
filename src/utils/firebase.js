import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore'; // used to set long-polling for RN
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCywRlMKu9ASILUicMw-tspACBs5v1g6Us",
  authDomain: "campusone-a9a14.firebaseapp.com",
  projectId: "campusone-a9a14",
  // Fixed bucket domain (use the standard appspot.com bucket)
  storageBucket: "campusone-a9a14.appspot.com",
  messagingSenderId: "495598920334",
  appId: "1:495598920334:web:de7e3a15362812a0655fdf"
};

// Prevent double initialization (Metro/Expo hot reload can re-run modules)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Ensure Firestore is initialized with long-polling once (for React Native and other environments)
// Use `globalThis` for cross-platform safety (browser, RN, Node).
if (!globalThis._firebaseFirestoreInitialized) {
  try {
    initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch (e) {
    // ignore if already initialized by another module or on unsupported platforms
    // console.debug('initializeFirestore:', e?.message || e);
  }
  globalThis._firebaseFirestoreInitialized = true;
}

export const db = getFirestore(app);

// Initialize Auth with React Native persistence when possible to persist sessions
let _auth;
try {
  // This will work on RN when AsyncStorage is available
  initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) });
  _auth = getAuth(app);
} catch (e) {
  // Fallback to default getAuth (web or unsupported env)
  _auth = getAuth(app);
}

export const auth = _auth;
export const storage = getStorage(app);

export default app;
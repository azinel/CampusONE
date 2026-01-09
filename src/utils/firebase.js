import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyCywRlMKu9ASILUicMw-tspACBs5v1g6Us",
  authDomain: "campusone-a9a14.firebaseapp.com",
  projectId: "campusone-a9a14",
  storageBucket: "campusone-a9a14.appspot.com",
  messagingSenderId: "495598920334",
  appId: "1:495598920334:web:de7e3a15362812a0655fdf"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
if (!globalThis._firebaseFirestoreInitialized) {
  try {
    initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch (e) {
  }
  globalThis._firebaseFirestoreInitialized = true;
}
export const db = getFirestore(app);
let _auth;
try {
  initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) });
  _auth = getAuth(app);
} catch (e) {
  _auth = getAuth(app);
}
export const auth = _auth;
export const storage = getStorage(app);
export default app;
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, getIdToken } from 'firebase/auth';
import app from '../firebase';
const firebaseAuth = getAuth(app);
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();
  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey).then((auth) => {
      useAuthStore.setState({
        auth: auth ? JSON.parse(auth) : null,
        isReady: true,
      });
    });
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        const token = await getIdToken(user,  true).catch(() => null);
        const authObj = { firebaseUser: { uid: user.uid, email: user.email }, token };
        setAuth(authObj);
      } else {
        setAuth(null);
      }
    });
    return () => unsubscribe();
  }, [setAuth]);
  useEffect(() => {}, []);
  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);
  const signOut = useCallback(() => {
    firebaseSignOut(firebaseAuth).catch(() => {});
    setAuth(null);
    close();
  }, [close, setAuth]);
  const signInWithEmail = useCallback(async (email, password) => {
    const res = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const token = await getIdToken(res.user);
    const authObj = { firebaseUser: { uid: res.user.uid, email: res.user.email }, token };
    setAuth(authObj);
    return authObj;
  }, [setAuth]);
  const signUpWithEmail = useCallback(async (email, password) => {
    const res = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const token = await getIdToken(res.user);
    const authObj = { firebaseUser: { uid: res.user.uid, email: res.user.email }, token };
    setAuth(authObj);
    return authObj;
  }, [setAuth]);
  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
    signInWithEmail,
    signUpWithEmail,
  };
};
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();
  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};
export default useAuth;
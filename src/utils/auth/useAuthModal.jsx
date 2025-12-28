import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Alert, TouchableOpacity, TextInput, ScrollView, Text } from 'react-native';
import { create } from 'zustand';
import { useCallback, useMemo } from 'react';
import { AuthWebView } from './AuthWebView';
import { useAuthStore, useAuthModal } from './store';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../firebase';
const firebaseAuth = getAuth(app);


/**
 * This component renders a modal for authentication purposes.
 * To show it programmatically, you should either use the `useRequireAuth` hook or the `useAuthModal` hook.
 *
 * @example
 * ```js
 * import { useAuthModal } from '@/utils/useAuthModal';
 * function MyComponent() {
 * const { open } = useAuthModal();
 * return <Button title="Login" onPress={() => open({ mode: 'signin' })} />;
 * }
 * ```
 *
 * @example
 * ```js
 * import { useRequireAuth } from '@/utils/useAuth';
 * function MyComponent() {
 *   // automatically opens the auth modal if the user is not authenticated
 *   useRequireAuth();
 *   return <Text>Protected Content</Text>;
 * }
 *
 */
export const AuthModal = () => {
  const { isOpen, mode } = useAuthModal();
  const { auth } = useAuthStore();

  const snapPoints = useMemo(() => ['100%'], []);
  const proxyURL = process.env.EXPO_PUBLIC_PROXY_BASE_URL;
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  if (!proxyURL && !baseURL) {
    return null;
  }

  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const handleEmailSignIn = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      // onAuthStateChanged listener in useAuth will pick up changes and close modal
    } catch (e) {
      console.error('Email sign-in failed:', e);
      Alert.alert('Sign-in failed', e?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      // onAuthStateChanged listener will pick up new user
    } catch (e) {
      console.error('Email sign-up failed:', e);
      Alert.alert('Sign-up failed', e?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen && !auth}
      transparent={true}
      animationType="slide"
    >
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          width: '100%',
          backgroundColor: '#fff',
          padding: 0,
        }}
      >
        {!showEmailForm ? (
          <>
            <AuthWebView
              mode={mode}
              proxyURL={proxyURL}
              baseURL={baseURL}
            />
            <View style={{ padding: 12 }}>
              <TouchableOpacity
                onPress={() => setShowEmailForm(true)}
                style={{ padding: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#007AFF' }}>Sign in with Email</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>Sign in with Email</Text>
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 }}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleEmailSignIn}
                style={{ flex: 1, padding: 12, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center' }}
                disabled={loading}
              >
                <Text style={{ color: '#fff' }}>{loading ? 'Signing in...' : 'Sign in'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEmailSignUp}
                style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' }}
                disabled={loading}
              >
                <Text>{loading ? 'Signing up...' : 'Sign up'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowEmailForm(false)} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: '#666' }}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default useAuthModal;
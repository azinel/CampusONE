import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/utils/auth/useAuth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { initiate, isReady, isAuthenticated } = useAuth(); //
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initiate(); // Initializes the auth state
  }, [initiate]);

  useEffect(() => {
    if (!isReady) return;

    // Check if the user is trying to access a protected screen
    const inAuthGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inAuthGroup) {
      // If not logged in and trying to access tabs, redirect to login
      router.replace("/login");
    } else if (isAuthenticated && segments[0] === "login") {
      // If logged in and at login page, redirect to home
      router.replace("/(tabs)");
    }

    SplashScreen.hideAsync();
  }, [isReady, isAuthenticated, segments]);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Registration of all top-level routes to ensure navigation works */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
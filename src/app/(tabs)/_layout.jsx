import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
      }}
    >
      {/* 1. Complaints Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Complaints',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Events Tab */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Mess Tab */}
      <Tabs.Screen
        name="mess"
        options={{
          title: 'Mess',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      {/* 4. Dashboard Tab (Profile) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      {/* 🚫 HIDDEN SCREENS (href: null) 
         This tells Expo: "Don't show a tab button for these files"
      */}
      
      {/* Hiding the Admin Create Event Form (FIX) */}
      <Tabs.Screen name="admin/create-event" options={{ href: null }} />
      
      {/* Hiding Other Screens */}
      <Tabs.Screen name="create-complaint" options={{ href: null }} />
      <Tabs.Screen name="submit-feedback" options={{ href: null }} />
      <Tabs.Screen name="debug" options={{ href: null }} />
      <Tabs.Screen name="complaint/[id]" options={{ href: null }} />
      <Tabs.Screen name="event/[id]" options={{ href: null }} />
      
    </Tabs>
  );
}
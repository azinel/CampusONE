import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import PrimaryButton from "@/components/PrimaryButton";
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
export default function EventDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  useEffect(() => {
    loadEvent();
  }, [id]);
  const loadEvent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      try {
        const response = await fetch(`/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data.event);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Backend fetch failed for event detail, falling back to Firestore");
      }
      const docRef = doc(db, 'events', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setEvent({
          id: snap.id,
          ...data,
          event_date: data.event_date?.toDate ? data.event_date.toDate().toISOString() : data.event_date,
        });
      }
    } catch (error) {
      console.error("Error loading event:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async () => {
    if (!auth.currentUser) {
      Alert.alert("Login Required", "Please log in to register for events.");
      return;
    }
    try {
      setRegistering(true);
      const docRef = doc(db, 'events', id);
      await updateDoc(docRef, {
        attendee_count: increment(isRegistered ? -1 : 1)
      });
      setIsRegistered(!isRegistered);
      setEvent(prev => ({ 
        ...prev, 
        attendee_count: (prev.attendee_count || 0) + (isRegistered ? -1 : 1) 
      }));
      Alert.alert(
        "Success", 
        isRegistered ? "You have unregistered from this event." : "You are successfully registered!"
      );
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };
  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <ActivityIndicator style={{ flex: 1 }} color={theme.colors.primary} />
      </View>
    );
  }
  if (!event) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Event Not Found" showBackButton onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>This event may have been removed.</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <ScreenHeader title="Event Details" showBackButton onBackPress={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {event.banner_url ? (
          <Image source={{ uri: event.banner_url }} style={styles.banner} contentFit="cover" />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.primary + "15" }]}>
            <Ionicons name="calendar" size={80} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.content}>
          <View style={[styles.clubBadge, { backgroundColor: theme.colors.primary + "15" }]}>
            <Text style={[styles.clubName, { color: theme.colors.primary, fontFamily: "Lato_700Bold" }]}>
              {event.club_name || "Campus Community"}
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: "Lato_700Bold" }]}>{event.title}</Text>
          <View style={styles.infoCard}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + "10" }]}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Date & Time</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatFullDate(event.event_date)}</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + "10" }]}>
              <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>Venue</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{event.venue}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: "Lato_700Bold" }]}>About Event</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary, fontFamily: "Lato_400Regular" }]}>
              {event.description}
            </Text>
          </View>
          <View style={styles.attendeeSection}>
             <Ionicons name="people" size={24} color={theme.colors.primary} />
             <Text style={[styles.attendeeCount, { color: theme.colors.primary, fontFamily: "Lato_700Bold" }]}>
               {event.attendee_count || 0} students are attending
             </Text>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.colors.background }]}>
        <PrimaryButton
          title={registering ? "Processing..." : isRegistered ? "Cancel Registration" : "Register Now"}
          onPress={handleRegister}
          gradient={!isRegistered}
          style={isRegistered && { backgroundColor: theme.colors.textTertiary }}
          disabled={registering}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { width: "100%", height: 250 },
  bannerPlaceholder: { width: "100%", height: 250, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  clubBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  clubName: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontSize: 26, marginBottom: 24 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  infoLabel: { fontSize: 12, textTransform: "uppercase", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600" },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24 },
  attendeeSection: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 30, padding: 16, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.02)" },
  attendeeCount: { fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }
});
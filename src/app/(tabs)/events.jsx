import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  // FIXED: Defined the loadEvents function to handle manual refreshes
  const loadEvents = useCallback(async () => {
    setLoading(true);
    // The onSnapshot listener below will handle the actual data update
    // We just trigger a brief loading state for UX
    setTimeout(() => setLoading(false), 500);
  }, []);

  useEffect(() => {
    let unsub = null;
    let active = true;

    const setup = async () => {
      setLoading(true);

      // Firestore query logic replacing the broken /api fetch
      const eventsRef = collection(db, 'events');
      let q;

      if (filter === "upcoming") {
        // Only show events where event_date is greater than or equal to now
        const now = Timestamp.now();
        q = query(
          eventsRef, 
          where('event_date', '>=', now), 
          orderBy('event_date', 'asc')
        );
      } else {
        // Show all events ordered by date
        q = query(eventsRef, orderBy('event_date', 'asc'));
      }

      unsub = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Convert Firebase Timestamps to ISO strings for your formatting functions
              event_date: data.event_date && data.event_date.toDate ? data.event_date.toDate().toISOString() : data.event_date,
            };
          });
          if (active) {
            setEvents(docs);
            setLoading(false);
          }
        },
        (err) => {
          console.error('Firestore realtime error (events):', err);
          if (active) setLoading(false);
        },
      );
    };

    setup();

    return () => {
      active = false;
      if (unsub) unsub();
    };
  }, [filter]);

  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    // Reset hours to compare just the calendar date
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffMs = eventDay - today;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 0) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/(tabs)/event/${item.id}`)}
    >
      {item.banner_url ? (
        <Image
          source={{ uri: item.banner_url }}
          style={styles.banner}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.primary + "20" }]}>
          <Ionicons name="calendar" size={40} color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.eventContent}>
        <View style={styles.clubBadge}>
          <Ionicons name="people" size={14} color={theme.colors.primary} />
          <Text style={[styles.clubName, { fontFamily: "Lato_600SemiBold", color: theme.colors.primary }]}>
            {item.club_name || "General"}
          </Text>
        </View>

        <Text style={[styles.eventTitle, { fontFamily: "Lato_700Bold", color: theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={[styles.eventDescription, { fontFamily: "Lato_400Regular", color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.eventMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { fontFamily: "Lato_400Regular", color: theme.colors.textSecondary }]}>
              {item.venue}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { fontFamily: "Lato_400Regular", color: theme.colors.textSecondary }]}>
              {formatEventDate(item.event_date)} • {formatEventTime(item.event_date)}
            </Text>
          </View>

          <View style={styles.attendeeRow}>
            <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.attendeeText, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>
              {item.attendee_count || 0} attending
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />

      <ScreenHeader
        title="Campus Events"
        subtitle="Discover & Join Activities"
        actions={[{ icon: "refresh", onPress: loadEvents }]}
      />

      <View style={styles.filterContainer}>
        {["upcoming", "all"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f ? { backgroundColor: theme.colors.primary } : {
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { fontFamily: "Lato_400Regular", color: filter === f ? "#FFFFFF" : theme.colors.text }]}>
              {f === "upcoming" ? "Upcoming" : "All Events"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={[styles.emptyText, { fontFamily: "Lato_600SemiBold", color: theme.colors.textSecondary }]}>
            No events found
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },
  eventCard: { borderRadius: 16, marginBottom: 20, overflow: "hidden", elevation: 3 },
  banner: { width: "100%", height: 180 },
  bannerPlaceholder: { width: "100%", height: 180, alignItems: "center", justifyContent: "center" },
  eventContent: { padding: 16 },
  clubBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  clubName: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  eventTitle: { fontSize: 20, marginBottom: 8 },
  eventDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  eventMeta: { gap: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
  attendeeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  attendeeText: { fontSize: 14 },
});
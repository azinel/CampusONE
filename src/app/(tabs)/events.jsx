import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
const EventCard = ({ item, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  const handleOpenLink = async () => {
    if (!item.registration_link) return;
    const supported = await Linking.canOpenURL(item.registration_link);
    if (supported) {
      await Linking.openURL(item.registration_link);
    } else {
      Alert.alert("Error", "Invalid Link");
    }
  };
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.9}
      onPress={toggleExpand}
    >
      {}
      <View style={styles.imageContainer}>
        {item.photo_url || item.banner_url ? (
          <Image
            source={{ uri: item.photo_url || item.banner_url }}
            style={styles.banner}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.primary + "20" }]}>
            <Ionicons name="calendar" size={40} color={theme.colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        {}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.date, { color: theme.colors.primary }]}>
              {item.date || "Date TBA"}
            </Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up-circle" : "chevron-down-circle"}
            size={28}
            color={theme.colors.textTertiary}
          />
        </View>
        {}
        {expanded && (
          <View style={styles.detailsContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            {}
            <View style={styles.row}>
              <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.text }]}>
                {item.location || "Venue TBA"}
              </Text>
            </View>
            {}
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {item.description}
            </Text>
            {}
            {item.registration_link ? (
              <TouchableOpacity
                style={[styles.registerBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleOpenLink}
              >
                <Text style={styles.registerText}>See Details</Text>
                <Ionicons name="arrow-forward-circle-outline" size={18} color="#FFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkAdmin = async () => {
      if (!auth.currentUser?.email) return;
      try {
        const q = query(collection(db, 'admins'), where('email', '==', auth.currentUser.email));
        const snap = await getDocs(q);
        setIsAdmin(!snap.empty);
      } catch (e) {
        console.log("Admin Check Error", e);
      }
    };
    checkAdmin();
  }, []);
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'events'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <ScreenHeader
        title="Campus Events"
        subtitle="Tap to see details"
      />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard item={item} theme={theme} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, color: theme.colors.textSecondary }}>
              No events found.
            </Text>
          }
        />
      )}
      {}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 20, backgroundColor: '#8A2BE2' }]}
          onPress={() => router.push("/admin/create-event")}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 16, marginBottom: 20, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  imageContainer: { width: "100%", height: 160, backgroundColor: '#f0f0f0' },
  banner: { width: "100%", height: "100%" },
  bannerPlaceholder: { width: "100%", height: 160, alignItems: "center", justifyContent: "center" },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  date: { fontSize: 14, fontWeight: '600' },
  detailsContainer: { marginTop: 12 },
  divider: { height: 1, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailText: { fontSize: 14, fontWeight: '500' },
  description: { fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 12 },
  registerBtn: { flexDirection: 'row', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  registerText: { color: '#FFF', fontWeight: 'bold' },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6 },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image, // Standard Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import ComplaintCard from "@/components/ComplaintCard"; // Ensure you have this or inline it

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState("All");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Define Tabs
  const tabs = ["All", "My Complaints", "Pending", "In Progress", "Resolved"];

  useEffect(() => {
    let unsubscribe;

    const fetchComplaints = async () => {
      setLoading(true); // Show loader immediately on tab switch
      try {
        const complaintsRef = collection(db, 'complaints');
        let q;

        // --- QUERY LOGIC ---
        if (activeTab === "All") {
          // Case 1: Show Everything (sorted by new)
          q = query(complaintsRef, orderBy('created_at', 'desc'));
        } else if (activeTab === "My Complaints") {
          // Case 2: Show only MY complaints (Email check)
          if (auth.currentUser?.email) {
            q = query(
              complaintsRef, 
              where('student_email', '==', auth.currentUser.email),
              orderBy('created_at', 'desc')
            );
          } else {
            setComplaints([]);
            setLoading(false);
            return;
          }
        } else {
          // Case 3: Filter by Status (Pending, Resolved, etc.)
          q = query(
            complaintsRef, 
            where('status', '==', activeTab),
            orderBy('created_at', 'desc')
          );
        }

        // Real-time Listener
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setComplaints(fetchedData);
          setLoading(false);
        }, (error) => {
          console.error("Snapshot Error:", error);
          setLoading(false);
        });

      } catch (error) {
        console.error("Query Error:", error);
        setLoading(false);
      }
    };

    fetchComplaints();

    // Cleanup listener on tab change or unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeTab]); // <--- CRITICAL: Re-run whenever activeTab changes

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Toggling the tab creates a cheap refresh effect
    const currentTab = activeTab;
    setActiveTab(currentTab); 
    setTimeout(() => setRefreshing(false), 1000);
  }, [activeTab]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {auth.currentUser?.displayName || "Student"}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Ionicons name="person" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab 
                ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } 
                : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
            ]}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === tab ? "#FFF" : theme.colors.textSecondary }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      {!loading && (
        <>
          <Ionicons name="file-tray-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
            No complaints found in "{activeTab}"
          </Text>
        </>
      )}
    </View>
  );

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser?.email) {
        const q = query(collection(db, 'admins'), where('email', '==', auth.currentUser.email));
        const snap = await getDocs(q);
        setIsAdmin(!snap.empty);
      }
    };
    checkAdmin();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      
      {/* Fixed Header */}
      <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.background, zIndex: 10 }}>
        {renderHeader()}
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            // Make sure you have a ComplaintCard component or replace this with inline UI
            <ComplaintCard 
              data={item} 
              onPress={() => router.push(`/(tabs)/complaint/${item.id}`)} 
            />
          )}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => router.push("/(tabs)/create-complaint")}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 10 },
  greeting: { fontSize: 14, fontFamily: "Lato_400Regular" },
  username: { fontSize: 20, fontFamily: "Lato_700Bold" },
  profileButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", elevation: 2 },
  tabsContainer: { gap: 10, paddingRight: 20 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  tabText: { fontWeight: "600", fontSize: 14 },
  emptyState: { alignItems: "center", justifyContent: "center", marginTop: 100 },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
});
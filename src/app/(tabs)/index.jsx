import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import CategoryBadge from "@/components/CategoryBadge";
import StatusBadge from "@/components/StatusBadge";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from "@/utils/firebase";

export default function ComplaintsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let unsub = null;
    const complaintsRef = collection(db, 'complaints');
    let q;

    if (filter === 'My Complaints') {
      q = query(complaintsRef, where('student_email', '==', auth.currentUser?.email), orderBy('created_at', 'desc'));
    } else if (filter !== 'all') {
      q = query(complaintsRef, where('status', '==', filter), orderBy('created_at', 'desc'));
    } else {
      q = query(complaintsRef, orderBy('created_at', 'desc'));
    }

    unsub = onSnapshot(q, (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate ? doc.data().created_at.toDate().toISOString() : doc.data().created_at
      })));
      setLoading(false);
    });

    return () => unsub && unsub();
  }, [filter]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <ScreenHeader title="Complaints" subtitle="Campus Feed" />

      {/* Filter Chips */}
      <View style={{ height: 60 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center', gap: 8 }}>
          {['All', 'My Complaints', 'Pending', 'In Progress', 'Resolved'].map((opt) => (
            <TouchableOpacity 
              key={opt}
              style={[styles.chip, filter === opt ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface }]}
              onPress={() => setFilter(opt)}
            >
              <Text style={{ color: filter === opt ? "#FFF" : theme.colors.text }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? <ActivityIndicator size="large" color={theme.colors.primary} style={{ flex: 1 }} /> : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={() => router.push(`/(tabs)/complaint/${item.id}`)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <CategoryBadge category={item.category} />
                <StatusBadge status={item.status} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.colors.text }}>{item.title}</Text>
              <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }} numberOfLines={2}>{item.description}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      )}

      {/* FAB - Points to create-complaint.jsx */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom }]}
        onPress={() => router.push("/(tabs)/create-complaint")}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 5 }
});
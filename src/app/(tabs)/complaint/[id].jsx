import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image, 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import CategoryBadge from "@/components/CategoryBadge";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import StatusBadge from "@/components/StatusBadge";
export default function ComplaintDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    loadComplaint();
    checkAdminStatus(); 
  }, [id]);
  const checkAdminStatus = async () => {
    if (!auth.currentUser?.email) return;
    try {
      const adminQuery = query(
        collection(db, 'admins'), 
        where('email', '==', auth.currentUser.email)
      );
      const adminSnap = await getDocs(adminQuery);
      setIsAdmin(!adminSnap.empty); 
    } catch (error) {
      console.error("Admin verification error:", error);
      setIsAdmin(false);
    }
  };
  const loadComplaint = async () => {
    if (!id) return;
    try {
      setLoading(true);
      console.log("Fetching complaint:", id);
      const docRef = doc(db, 'complaints', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        console.log("Complaint loaded. Has photo?", !!data.photo_url);
        setComplaint({
          id: snap.id,
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at,
          updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : data.updated_at,
          resolved_at: data.resolved_at?.toDate ? data.resolved_at.toDate().toISOString() : data.resolved_at,
        });
      } else {
        console.log("Document does not exist");
        Alert.alert("Error", "Complaint not found.");
      }
    } catch (error) {
      console.error("Error loading complaint:", error);
      Alert.alert("Error", "Could not load details.");
    } finally {
      setLoading(false);
    }
  };
  const updateStatus = async (newStatus) => {
    try {
      const docRef = doc(db, 'complaints', id);
      const updateData = {
        status: newStatus,
        updated_at: serverTimestamp()
      };
      if (newStatus === 'Resolved') {
        updateData.resolved_at = serverTimestamp();
      }
      await updateDoc(docRef, updateData);
      Alert.alert("Success", `Status updated to ${newStatus}`);
      loadComplaint(); 
    } catch (err) {
      console.error("Error updating status:", err);
      Alert.alert("Error", "Failed to update status.");
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.colors.statusBarStyle} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Loading Evidence...</Text>
        </View>
      </View>
    );
  }
  if (!complaint) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <ScreenHeader title="Error" showBackButton onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.text }}>Complaint not found.</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <ScreenHeader
        title="Details"
        showBackButton
        onBackPress={() => router.back()}
        actions={[{ icon: "refresh", onPress: loadComplaint }]}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.badges}>
              <CategoryBadge category={complaint.category} />
              <StatusBadge status={complaint.status} />
            </View>
            <Text style={[styles.title, { fontFamily: "Lato_700Bold", color: theme.colors.text }]}>
              {complaint.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { fontFamily: "Lato_400Regular", color: theme.colors.textSecondary }]}>
                  {complaint.hostel} - {complaint.room_number}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { fontFamily: "Lato_400Regular", color: theme.colors.textSecondary }]}>
                  {formatDate(complaint.created_at)}
                </Text>
              </View>
            </View>
          </View>
          {}
          {isAdmin && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1 }]}>
              <Text style={[styles.sectionTitle, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>
                Admin Actions
              </Text>
              <View style={styles.adminButtons}>
                <TouchableOpacity style={[styles.adminBtn, { backgroundColor: '#F59E0B' }]} onPress={() => updateStatus('In Progress')}>
                  <Text style={styles.btnText}>Mark In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.adminBtn, { backgroundColor: '#10B981' }]} onPress={() => updateStatus('Resolved')}>
                  <Text style={styles.btnText}>Resolve Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {}
          {complaint.photo_url && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>
                Photo Evidence
              </Text>
              {}
              <Image 
                source={{ uri: complaint.photo_url }} 
                style={styles.photo} 
                resizeMode="cover"
                onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
              />
            </View>
          )}
          {}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>Description</Text>
            <Text style={[styles.description, { fontFamily: "Lato_400Regular", color: theme.colors.textSecondary }]}>
              {complaint.description}
            </Text>
          </View>
          {}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>Reported By</Text>
            <View style={styles.studentInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { fontFamily: "Lato_400Regular", color: theme.colors.text }]}>{complaint.student_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { fontFamily: "Lato_400Regular", color: theme.colors.text }]}>{complaint.student_email}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  badges: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 22, marginBottom: 12 },
  metaRow: { gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  adminButtons: { flexDirection: 'row', gap: 10, marginTop: 5 },
  adminBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  photo: { width: "100%", height: 200, borderRadius: 12, backgroundColor: '#e1e1e1' }, 
  description: { fontSize: 15, lineHeight: 22 },
  studentInfo: { gap: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14 },
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import { collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db, auth } from "@/utils/firebase";
import { useAuth } from "@/utils/auth/useAuth";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { signOut } = useAuth();
  
  const [isAdmin, setIsAdmin] = useState(false); // Security Role State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    categoryStats: []
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => signOut() }
      ]
    );
  };

  useEffect(() => {
    let active = true;
    let unsubStats = () => {};

    const verifyAndLoad = async () => {
      if (!auth.currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        // 1. SECURITY CHECK: Verify against 'admins' collection
        const adminQuery = query(
          collection(db, 'admins'), 
          where('email', '==', auth.currentUser.email)
        );
        const adminSnap = await getDocs(adminQuery);
        const isUserAdmin = !adminSnap.empty;

        if (!active) return;
        setIsAdmin(isUserAdmin);

        // 2. DATA LOAD: Only fetch campus-wide stats if user is Admin
        if (isUserAdmin) {
          const q = query(collection(db, 'complaints'), orderBy('created_at', 'desc'));
          unsubStats = onSnapshot(q, (snapshot) => {
            if (!active) return;
            const complaints = snapshot.docs.map(doc => doc.data());
            
            let p = 0, ip = 0, r = 0, hp = 0;
            const categories = {};

            complaints.forEach(item => {
              if (item.status === 'Pending') p++;
              else if (item.status === 'In Progress') ip++;
              else if (item.status === 'Resolved') r++;
              
              if (item.priority > 2) hp++;
              
              const cat = item.category || 'Other';
              if (!categories[cat]) {
                categories[cat] = { category: cat, count: 0, resolved_count: 0 };
              }
              categories[cat].count++;
              if (item.status === 'Resolved') categories[cat].resolved_count++;
            });

            setStats({
              total: complaints.length,
              pending: p,
              inProgress: ip,
              resolved: r,
              highPriority: hp,
              categoryStats: Object.values(categories)
            });
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Security/Load Error:", error);
        setLoading(false);
      }
    };

    verifyAndLoad();
    return () => { active = false; unsubStats(); };
  }, []);

  const getResolvedPercentage = () => {
    return stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.colors.statusBarStyle} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      
      <ScreenHeader 
        title="Profile" 
        subtitle={isAdmin ? "Staff Dashboard" : "Student Portal"} 
        actions={[{ icon: "log-out-outline", onPress: handleLogout, style: { color: theme.colors.error } }]}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, alignItems: 'center', paddingVertical: 30 }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person" size={40} color={theme.colors.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {auth.currentUser?.displayName || "Campus User"}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {auth.currentUser?.email}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? theme.colors.error + '20' : theme.colors.success + '20' }]}>
            <Text style={{ color: isAdmin ? theme.colors.error : theme.colors.success, fontWeight: '700', fontSize: 12 }}>
              {isAdmin ? "ADMIN / WARDEN" : "STUDENT"}
            </Text>
          </View>
        </View>

        {isAdmin ? (
          /* --- ADMIN ONLY SECTION --- */
          <View>
            <Text style={styles.sectionHeader}>Campus Analytics</Text>
            
            <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.statsGrid}>
                <StatItem icon="alert-circle" color={theme.colors.primary} value={stats.total} label="Total" theme={theme} />
                <StatItem icon="time" color={theme.colors.warning} value={stats.pending} label="Pending" theme={theme} />
                <StatItem icon="hammer" color={theme.colors.info} value={stats.inProgress} label="Active" theme={theme} />
                <StatItem icon="checkmark-circle" color={theme.colors.success} value={stats.resolved} label="Solved" theme={theme} />
              </View>
              
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Resolution Rate</Text>
                  <Text style={[styles.progressValue, { color: theme.colors.success }]}>{getResolvedPercentage()}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.progressFill, { backgroundColor: theme.colors.success, width: `${getResolvedPercentage()}%` }]} />
                </View>
              </View>
            </View>

            {stats.highPriority > 0 && (
              <View style={[styles.alertCard, { backgroundColor: theme.colors.error + "15", borderColor: theme.colors.error }]}>
                <Ionicons name="warning" size={24} color={theme.colors.error} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: theme.colors.error }}>High Priority Action Needed</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 13 }}>{stats.highPriority} critical issues are currently pending.</Text>
                </View>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Category Breakdown</Text>
              {stats.categoryStats.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{item.category}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.count} items</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${(item.resolved_count / item.count) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* --- STUDENT ONLY SECTION --- */
          <View>
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Quick Actions</Text>
              <Text style={{ color: theme.colors.textSecondary, marginBottom: 15 }}>
                Manage your campus experience.
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, marginLeft: 10 }}>View My Complaints</Text>
              </View>
              <View style={[styles.infoRow, { marginTop: 15 }]}>
                <Ionicons name="restaurant" size={20} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, marginLeft: 10 }}>Give Mess Feedback</Text>
              </View>
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>About CampusOne</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
            Version 1.0.4 {"\n"}
            Connected to Cloud: {auth.currentUser ? "Verified" : "Disconnected"}
          </Text>
        </View>

        <Text style={[styles.footer, { color: theme.colors.textTertiary }]}>CampusOne • Smart Campus Backbone</Text>
      </ScrollView>
    </View>
  );
}

const StatItem = ({ icon, color, value, label, theme }) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userEmail: { fontSize: 14, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  statsCard: { borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 16, marginBottom: 16, fontWeight: 'bold' },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  statItem: { width: "48%", alignItems: "center", gap: 4, padding: 10 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 11, textTransform: 'uppercase' },
  progressSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600' },
  progressValue: { fontSize: 14, fontWeight: 'bold' },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  categoryItem: { marginBottom: 15 },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  alertCard: { flexDirection: "row", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, gap: 12, alignItems: 'center' },
  infoRow: { flexDirection: "row", alignItems: "center" },
  footer: { textAlign: "center", fontSize: 11, marginTop: 10, marginBottom: 20 }
});
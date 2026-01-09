import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
export default function MessCommitteeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };
  const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Your device cannot make calls.");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };
  const members = [
    { name: "Rahul Sharma", role: "Mess Secretary", phone: "+91 98765 43210" },
    { name: "Priya Patel", role: "Joint Secretary", phone: "+91 91234 56789" },
    { name: "Amit Kumar", role: "Menu Coordinator", phone: "+91 88997 76655" },
    { name: "Sunita Reddy", role: "Hygiene In-charge", phone: "+91 77788 99900" },
  ];
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Mess Committee"
          showBackButton
          onBackPress={handleBack}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant" size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Today's Special</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={{ color: theme.colors.textSecondary }}>Lunch (12:30 - 2:00):</Text>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 15 }}>Rajma Chawal, Jeera Aloo, Curd</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.menuItem}>
            <Text style={{ color: theme.colors.textSecondary }}>Dinner (7:30 - 9:00):</Text>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 15 }}>Egg Curry / Paneer Butter Masala</Text>
          </View>
        </View>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Committee Members</Text>
        {members.map((member, index) => (
          <View key={index} style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}>
            {}
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
               <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                 {member.name.charAt(0)}
               </Text>
            </View>
            {}
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{member.name}</Text>
              <Text style={[styles.role, { color: theme.colors.primary }]}>{member.role}</Text>
              <Text style={[styles.phone, { color: theme.colors.textSecondary }]}>{member.phone}</Text>
            </View>
            {}
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: '#10B981' }]}
              onPress={() => handleCall(member.phone)}
            >
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  card: { padding: 20, borderRadius: 16, marginBottom: 24, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  menuItem: { gap: 4, marginBottom: 8 },
  divider: { height: 1, marginVertical: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  role: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  phone: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  callBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COMMITTEE = [
  { id: '1', name: 'Dr. Rajesh Kumar', role: 'Warden / Faculty Lead', contact: 'warden@campus.edu' },
  { id: '2', name: 'Sneha Reddy', role: 'Student Representative', contact: 'sneha.r@campus.edu' },
  { id: '3', name: 'Amit Singh', role: 'Mess Supervisor', contact: 'amit.s@campus.edu' },
];

export default function CommitteeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Mess Committee" showBackButton />
      <FlatList
        data={COMMITTEE}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>{item.name}</Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>{item.role}</Text>
            <Text style={{ color: theme.colors.primary, marginTop: 8 }}>📧 {item.contact}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 16, marginBottom: 16, elevation: 3 }
});
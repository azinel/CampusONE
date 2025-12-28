import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import PrimaryButton from "@/components/PrimaryButton";
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export default function MessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [feedback, setFeedback] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for the refresh button
  const loadData = useCallback(() => {
    setLoading(true);
    // The onSnapshot listener below handles the actual data refresh
    setTimeout(() => setLoading(false), 500);
  }, []);

  useEffect(() => {
    let unsub = null;
    const q = query(collection(db, 'mess_feedback'), orderBy('created_at', 'desc'), limit(20));
    
    unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate ? doc.data().created_at.toDate().toISOString() : new Date().toISOString()
      }));
      setFeedback(docs);

      // Local analytics computation
      const total = docs.length;
      if (total > 0) {
        setAnalytics({
          averages: {
            avg_taste: docs.reduce((s, r) => s + (r.taste_rating || 0), 0) / total,
            avg_hygiene: docs.reduce((s, r) => s + (r.hygiene_rating || 0), 0) / total,
            avg_quantity: docs.reduce((s, r) => s + (r.quantity_rating || 0), 0) / total,
          }
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderStars = (rating) => (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Ionicons key={s} name={s <= rating ? "star" : "star-outline"} size={14} color={s <= rating ? "#FFD700" : "#CCC"} />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <ScreenHeader 
        title="Mess Feedback" 
        subtitle="Rate & Improve Quality" 
        actions={[
          { icon: "people-outline", onPress: () => router.push("/mess-committee") }, 
          { icon: "refresh", onPress: loadData }
        ]} 
      />
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              {analytics && (
                <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.statsTitle, { color: theme.colors.text, fontFamily: "Lato_700Bold" }]}>
                    Weekly Averages
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                     {/* FIXED: High-contrast StatItems for better visibility */}
                     <StatItem icon="restaurant" color={theme.colors.primary} value={analytics.averages.avg_taste} label="Taste" />
                     <StatItem icon="fitness" color={theme.colors.success} value={analytics.averages.avg_hygiene} label="Hygiene" />
                     <StatItem icon="analytics" color={theme.colors.info} value={analytics.averages.avg_quantity} label="Quantity" />
                  </View>
                </View>
              )}
              <PrimaryButton 
                title="Submit Feedback" 
                onPress={() => router.push("/(tabs)/submit-feedback")} 
                gradient 
                style={{ marginBottom: 20 }} 
              />
            </>
          }
          data={feedback}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
               <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                  <Text style={{fontWeight: 'bold', color: theme.colors.text}}>{item.meal_name}</Text>
                  <Text style={{fontSize: 12, color: theme.colors.textTertiary}}>{item.meal_type}</Text>
               </View>
               {renderStars(item.taste_rating)}
               {item.feedback_text && (
                 <Text style={{fontSize: 14, fontStyle: 'italic', marginTop: 8, color: theme.colors.textSecondary}}>
                   "{item.feedback_text}"
                 </Text>
               )}
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// FIXED: Enhanced StatItem with theme-aware text contrast
const StatItem = ({ icon, color, value, label }) => {
  const theme = useTheme();
  return (
    <View style={styles.statItemContainer}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[
        styles.statValue, 
        { color: theme.colors.text, fontFamily: "Lato_700Bold" } // FIXED: High contrast visibility
      ]}>
        {parseFloat(value || 0).toFixed(1)}
      </Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsCard: { padding: 20, borderRadius: 16, marginBottom: 20, elevation: 3 },
  statsTitle: { fontSize: 16, marginBottom: 15 },
  statItemContainer: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, marginTop: 4 },
  statLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2 }
});
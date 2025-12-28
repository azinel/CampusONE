import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import PrimaryButton from "@/components/PrimaryButton";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase'; // Added auth
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function SubmitFeedbackScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();

  const [mealType, setMealType] = useState("");
  const [mealName, setMealName] = useState("");
  const [tasteRating, setTasteRating] = useState(0);
  const [hygieneRating, setHygieneRating] = useState(0);
  const [quantityRating, setQuantityRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  const handleSubmit = async () => {
    // Validation
    if (!mealType || !mealName.trim() || tasteRating === 0 || hygieneRating === 0 || quantityRating === 0) {
      Alert.alert("Missing Information", "Please complete the rating and meal details.");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Try backend POST
      try {
        const response = await fetch("/api/mess-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meal_type: mealType, meal_name: mealName,
            taste_rating: tasteRating, hygiene_rating: hygieneRating, quantity_rating: quantityRating,
            feedback_text: feedbackText.trim() || null, is_anonymous: isAnonymous,
            student_email: auth.currentUser?.email // Tracking user for mess optimization
          }),
        });
        if (response.ok) {
          Alert.alert("Success!", "Feedback submitted.", [{ text: "OK", onPress: () => router.replace("/(tabs)/mess") }]);
          return;
        }
      } catch (e) {
        console.warn('Backend fallback');
      }

      // 2. Fallback: Firestore
      await addDoc(collection(db, 'mess_feedback'), {
        meal_type: mealType, meal_name: mealName,
        taste_rating: tasteRating, hygiene_rating: hygieneRating, quantity_rating: quantityRating,
        feedback_text: feedbackText.trim() || null, is_anonymous: isAnonymous,
        student_email: auth.currentUser?.email,
        created_at: serverTimestamp(),
      });

      Alert.alert("Success!", "Feedback saved (Firestore).", [{ text: "OK", onPress: () => router.replace("/(tabs)/mess") }]);
    } catch (error) {
      Alert.alert("Error", "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = (currentRating, setRating, label) => (
    <View style={styles.ratingSection}>
      <View style={styles.ratingHeader}>
        <Text style={[styles.ratingLabel, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.ratingValue, { fontFamily: "Lato_700Bold", color: theme.colors.primary }]}>{currentRating > 0 ? `${currentRating}.0` : "-"}</Text>
      </View>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
            <Ionicons name={star <= currentRating ? "star" : "star-outline"} size={36} color={star <= currentRating ? "#FFD700" : theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const paddingAnimation = useRef(new Animated.Value(insets.bottom + 12)).current;
  const animateTo = (value) => Animated.timing(paddingAnimation, { toValue: value, duration: 200, useNativeDriver: false }).start();

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.colors.statusBarStyle} />
        <ScreenHeader title="Submit Feedback" showBackButton onBackPress={() => router.back()} />

        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.form, { paddingBottom: paddingAnimation }]}>
            
            <Text style={[styles.label, { fontFamily: "Lato_600SemiBold", color: theme.colors.text }]}>Meal Type *</Text>
            <View style={styles.mealTypeGrid}>
              {mealTypes.map((type) => (
                <TouchableOpacity key={type} style={[styles.mealTypeChip, mealType === type ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]} onPress={() => setMealType(type)}>
                  <Text style={{ color: mealType === type ? "#FFFFFF" : theme.colors.text }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="Meal Name (e.g., Poha, Biryani)" value={mealName} onChangeText={setMealName} onFocus={() => animateTo(12)} onBlur={() => animateTo(insets.bottom + 12)} />

            <View style={[styles.ratingsCard, { backgroundColor: theme.colors.surface }]}>
              {renderStarSelector(tasteRating, setTasteRating, "Taste")}
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              {renderStarSelector(hygieneRating, setHygieneRating, "Hygiene")}
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              {renderStarSelector(quantityRating, setQuantityRating, "Quantity")}
            </View>

            <TextInput style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="Additional comments..." value={feedbackText} onChangeText={setFeedbackText} multiline onFocus={() => animateTo(12)} onBlur={() => animateTo(insets.bottom + 12)} />

            <TouchableOpacity style={styles.anonymousToggle} onPress={() => setIsAnonymous(!isAnonymous)}>
               <View style={styles.toggleLeft}><Ionicons name={isAnonymous ? "eye-off" : "eye"} size={20} color={theme.colors.textSecondary} /><Text style={{ color: theme.colors.text }}>Submit as Anonymous</Text></View>
               <View style={[styles.switch, { backgroundColor: isAnonymous ? theme.colors.primary : theme.colors.border }]}><View style={[styles.switchKnob, { backgroundColor: "#FFFFFF" }, isAnonymous && styles.switchKnobActive]} /></View>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
            <PrimaryButton title={submitting ? "Submitting..." : "Submit Feedback"} onPress={handleSubmit} disabled={submitting} gradient />
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 14, marginBottom: 8, marginTop: 16 },
  mealTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mealTypeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginTop: 15 },
  ratingsCard: { borderRadius: 16, padding: 20, marginTop: 20, elevation: 3 },
  ratingSection: { marginBottom: 16 },
  ratingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  stars: { flexDirection: "row", justifyContent: "space-between" },
  divider: { height: 1, marginVertical: 16 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, minHeight: 100, marginTop: 20 },
  anonymousToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  switch: { width: 50, height: 28, borderRadius: 14, padding: 2, justifyContent: "center" },
  switchKnob: { width: 24, height: 24, borderRadius: 12 },
  switchKnobActive: { marginLeft: "auto" }
});
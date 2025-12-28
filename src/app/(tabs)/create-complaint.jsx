import React, { useState, useRef, useEffect } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import PrimaryButton from "@/components/PrimaryButton";
import useUpload from "@/utils/useUpload";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateComplaintScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [upload, { loading: uploading }] = useUpload();

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hostel, setHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [photoAsset, setPhotoAsset] = useState(null);
  
  const [studentName, setStudentName] = useState(auth.currentUser?.displayName || "");
  const [studentEmail, setStudentEmail] = useState(auth.currentUser?.email || "");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Water", "Electricity", "WiFi", "Cleaning", "Other"];
  const hostels = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera roll permissions to upload photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoAsset(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!category || !title.trim() || !description.trim() || !hostel || !roomNumber.trim() || !studentName.trim() || !studentEmail.trim()) {
      Alert.alert("Missing Information", "Please fill all required fields marked with *");
      return;
    }

    try {
      setSubmitting(true);
      let uploadedPhotoUrl = null;

      if (photoAsset) {
        const { url, error } = await upload({ reactNativeAsset: photoAsset });
        if (!error) uploadedPhotoUrl = url;
      }

      const docRef = await addDoc(collection(db, 'complaints'), {
        category,
        title: title.trim(),
        description: description.trim(),
        hostel,
        room_number: roomNumber.trim(),
        photo_url: uploadedPhotoUrl,
        student_name: studentName.trim(),
        student_email: studentEmail.trim().toLowerCase(),
        status: 'Pending',
        priority: 1,
        created_at: serverTimestamp(),
      });

      Alert.alert("Success!", "Complaint submitted successfully.", [
        { text: "View Details", onPress: () => router.replace(`/(tabs)/complaint/${docRef.id}`) }
      ]);
    } catch (error) {
      console.error("Submission Error:", error);
      Alert.alert("Error", "Failed to submit. Please check your internet connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const paddingAnimation = useRef(new Animated.Value(insets.bottom + 12)).current;
  const animateTo = (value) => Animated.timing(paddingAnimation, { toValue: value, duration: 200, useNativeDriver: false }).start();

  // Unified input style with lighter background and high-visibility placeholders
  const inputStyle = [
    styles.input, 
    { 
      backgroundColor: theme.isDark ? "#2A2A2A" : "#FFFFFF", 
      color: theme.colors.text, 
      borderColor: theme.colors.outline 
    }
  ];

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.colors.statusBarStyle} />
        <ScreenHeader title="New Complaint" showBackButton onBackPress={() => router.back()} />

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.form, { paddingBottom: paddingAnimation }]}>
            
            {/* Identity Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Reporter Identity</Text>
            </View>

            <TextInput 
              style={inputStyle} 
              placeholder="Full Name *" 
              placeholderTextColor={theme.colors.textTertiary} // FIXED: High visibility
              value={studentName} 
              onChangeText={setStudentName}
            />
            <TextInput 
              style={[inputStyle, { backgroundColor: theme.isDark ? "#1A1A1A" : "#F0F0F0", opacity: 0.7 }]} 
              placeholder="College Email *" 
              placeholderTextColor={theme.colors.textTertiary}
              value={studentEmail} 
              editable={false} // FIXED: Locked field
            />

            {/* Issue Details */}
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Issue Details</Text>
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Category *</Text>
            <View style={styles.grid}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, category === cat ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
                  onPress={() => setCategory(cat)}
                >
                  <Text style={{ color: category === cat ? "#FFFFFF" : theme.colors.textSecondary }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={inputStyle} 
              placeholder="Subject (e.g., Fan not working) *" 
              placeholderTextColor={theme.colors.textTertiary} // FIXED: High visibility
              value={title} 
              onChangeText={setTitle} 
            />
            <TextInput 
              style={[styles.textArea, { backgroundColor: theme.isDark ? "#2A2A2A" : "#FFFFFF", color: theme.colors.text, borderColor: theme.colors.outline }]} 
              placeholder="Please describe the issue in detail... *" 
              placeholderTextColor={theme.colors.textTertiary} // FIXED: High visibility
              value={description} 
              onChangeText={setDescription} 
              multiline 
            />

            {/* Location Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Location</Text>
            </View>

            <View style={styles.grid}>
              {hostels.map((h) => (
                <TouchableOpacity 
                  key={h} 
                  style={[styles.chip, hostel === h ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
                  onPress={() => setHostel(h)}
                >
                  <Text style={{ color: hostel === h ? "#FFFFFF" : theme.colors.textSecondary }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput 
              style={inputStyle} 
              placeholder="Room Number *" 
              placeholderTextColor={theme.colors.textTertiary} // FIXED: High visibility
              value={roomNumber} 
              onChangeText={setRoomNumber} 
            />

            {/* Photo Evidence */}
            <TouchableOpacity 
              style={[styles.photoUpload, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
              onPress={pickImage}
            >
              {photoAsset ? (
                <Image source={{ uri: photoAsset.uri }} style={styles.photoImage} contentFit="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.textSecondary }}>Add Photo Evidence (Optional)</Text>
                </View>
              )}
            </TouchableOpacity>

            <PrimaryButton 
              title={submitting ? "Processing..." : "Submit Complaint"} 
              onPress={handleSubmit} 
              disabled={submitting || uploading} 
              gradient 
            />
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  label: { fontSize: 14, marginBottom: 12, fontWeight: '600' },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, minHeight: 120, textAlignVertical: 'top' },
  photoUpload: { borderWidth: 2, borderStyle: "dashed", borderRadius: 16, minHeight: 160, alignItems: "center", justifyContent: "center", marginBottom: 30, marginTop: 10 },
  uploadPlaceholder: { alignItems: "center", gap: 8 },
  photoImage: { width: "100%", height: 158, borderRadius: 14 },
});
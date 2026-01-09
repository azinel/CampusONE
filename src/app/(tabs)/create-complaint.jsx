import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/utils/theme";
import ScreenHeader from "@/components/ScreenHeader";
import PrimaryButton from "@/components/PrimaryButton";
import useUpload from "@/utils/useUpload";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
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
  const [studentEmail] = useState(auth.currentUser?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const isBusy = submitting || uploading;
  const categories = ["Water", "Electricity", "WiFi", "Cleaning", "Other"];
  const hostels = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"];
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.5,
      });
      if (!result.canceled) {
        setPhotoAsset(result.assets[0]);
      }
    } catch (e) {
      console.error("Picker Crash:", e);
      Alert.alert("Error", "Could not select image.");
    }
  };
  const handleSubmit = async () => {
    if (!category || !title.trim() || !description.trim() || !hostel || !roomNumber.trim()) {
      Alert.alert("Missing Info", "Please fill all fields marked with *");
      return;
    }
    try {
      console.log("--- Starting Submission ---");
      setSubmitting(true);
      let finalPhotoUrl = null;
      if (photoAsset) {
        console.log("Step A: Uploading photo...");
        const { url, error } = await upload({ reactNativeAsset: photoAsset });
        if (error) {
          console.error("Upload Error:", error);
          Alert.alert("Upload Failed", "Could not upload image.");
          setSubmitting(false);
          return;
        }
        console.log("Step A Success: URL received ->", url);
        finalPhotoUrl = url;
      }
      const complaintData = {
        category: category || "General",
        title: title.trim(),
        description: description.trim(),
        hostel: hostel || "Unknown",
        room_number: roomNumber.trim(),
        photo_url: finalPhotoUrl || null,
        student_name: studentName.trim() || "Anonymous",
        student_email: studentEmail.toLowerCase() || "no-email",
        status: 'Pending',
        priority: 1,
        created_at: serverTimestamp(),
      };
      console.log("Step B: Saving to Firestore...", complaintData);
      const docRef = await addDoc(collection(db, 'complaints'), complaintData);
      console.log("Step B Success: Document ID ->", docRef.id);
      Alert.alert(
        "Success!",
        "Complaint Submitted Successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Navigating to:", `/(tabs)/complaint/${docRef.id}`);
              try {
                router.replace(`/(tabs)/complaint/${docRef.id}`);
              } catch (navError) {
                console.error("Navigation Error:", navError);
                router.replace("/(tabs)");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("CRITICAL SUBMISSION ERROR:", error);
      Alert.alert("Submission Error", error.message || "Could not save to database.");
    } finally {
      setSubmitting(false);
    }
  };
  const inputStyle = [
    styles.input,
    { backgroundColor: theme.isDark ? "#2A2A2A" : "#FFFFFF", color: theme.colors.text, borderColor: theme.colors.outline }
  ];
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />
      {}
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ScreenHeader title="New Complaint" showBackButton onBackPress={() => router.back()} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {}
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Reporter Identity</Text>
            <TextInput style={inputStyle} placeholder="Full Name" placeholderTextColor={theme.colors.textTertiary} value={studentName} onChangeText={setStudentName} />
            <TextInput style={[inputStyle, { opacity: 0.7 }]} value={studentEmail} editable={false} />
            {}
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Category</Text>
            <View style={styles.grid}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.chip, category === cat ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={() => setCategory(cat)}>
                  <Text style={{ color: category === cat ? "#FFFFFF" : theme.colors.textSecondary, fontWeight: '700' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={inputStyle} placeholder="Subject *" placeholderTextColor={theme.colors.textTertiary} value={title} onChangeText={setTitle} />
            <TextInput style={[styles.textArea, { backgroundColor: theme.isDark ? "#2A2A2A" : "#FFFFFF", color: theme.colors.text, borderColor: theme.colors.outline }]} placeholder="Details... *" placeholderTextColor={theme.colors.textTertiary} value={description} onChangeText={setDescription} multiline />
            {}
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Location</Text>
            <View style={styles.grid}>
              {hostels.map((h) => (
                <TouchableOpacity key={h} style={[styles.chip, hostel === h ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary } : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={() => setHostel(h)}>
                  <Text style={{ color: hostel === h ? "#FFFFFF" : theme.colors.textSecondary, fontWeight: '700' }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={inputStyle} placeholder="Room Number *" placeholderTextColor={theme.colors.textTertiary} value={roomNumber} onChangeText={setRoomNumber} />
            {}
            <TouchableOpacity style={[styles.photoUpload, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={pickImage} activeOpacity={0.7}>
              {photoAsset ? (
                <View style={styles.previewContainer}>
                  {}
                  <Image source={{ uri: photoAsset.uri }} style={styles.photoImage} resizeMode="cover" />
                  <View style={styles.photoOverlay}>
                    <Ionicons name="refresh" size={24} color="#FFF" />
                    <Text style={{ color: '#FFF', fontSize: 12 }}>Change Photo</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={theme.colors.textSecondary} />
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Add Photo Evidence</Text>
                </View>
              )}
            </TouchableOpacity>
            <PrimaryButton title={isBusy ? "Processing..." : "Submit Complaint"} onPress={handleSubmit} disabled={isBusy} gradient />
          </View>
        </ScrollView>
        {isBusy && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingCard, { backgroundColor: theme.colors.surface }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                {uploading ? "Uploading..." : "Saving..."}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, minHeight: 120, textAlignVertical: 'top' },
  photoUpload: { borderWidth: 2, borderStyle: "dashed", borderRadius: 16, minHeight: 160, alignItems: "center", justifyContent: "center", marginBottom: 30, marginTop: 10, overflow: 'hidden' },
  uploadPlaceholder: { alignItems: "center", gap: 8 },
  photoImage: { width: "100%", height: "100%" },
  previewContainer: { width: '100%', height: 160, borderRadius: 14, overflow: 'hidden' },
  photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingCard: { padding: 24, borderRadius: 20, alignItems: 'center', gap: 16, elevation: 8 },
  loadingText: { fontSize: 15, fontWeight: '700' }
});
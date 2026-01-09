import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator
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
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
export default function CreateEventScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [upload, { loading: uploading }] = useUpload();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [regLink, setRegLink] = useState("");
  const [photoAsset, setPhotoAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    checkAdmin();
  }, []);
  const checkAdmin = async () => {
    if (!auth.currentUser?.email) {
      router.replace("/(tabs)");
      return;
    }
    try {
      const q = query(collection(db, 'admins'), where('email', '==', auth.currentUser.email));
      const snap = await getDocs(q);
      if (snap.empty) {
        Alert.alert("Access Denied", "You are not an admin.");
        router.back();
      }
    } catch (e) {
      console.error(e);
      router.back();
    } finally {
      setCheckingAdmin(false);
    }
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) setPhotoAsset(result.assets[0]);
  };
  const handleSubmit = async () => {
    if (!title || !date || !location || !description) {
      Alert.alert("Missing Info", "Please fill all fields marked with *");
      return;
    }
    try {
      setSubmitting(true);
      let photoUrl = null;
      if (photoAsset) {
        const { url, error } = await upload({ reactNativeAsset: photoAsset });
        if (error) throw new Error("Image upload failed");
        photoUrl = url;
      }
      await addDoc(collection(db, 'events'), {
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        description: description.trim(),
        registration_link: regLink.trim() || null,
        photo_url: photoUrl,
        created_by: auth.currentUser.email,
        created_at: serverTimestamp(),
      });
      Alert.alert("Success", "Event published!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not publish event.");
    } finally {
      setSubmitting(false);
    }
  };
  if (checkingAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  const inputStyle = [styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }];
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <ScreenHeader title="Add Event" showBackButton onBackPress={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Title *</Text>
          <TextInput style={inputStyle} placeholder="e.g. Hackathon 2024" placeholderTextColor={theme.colors.textTertiary} value={title} onChangeText={setTitle} />
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date & Time (Text) *</Text>
          <TextInput style={inputStyle} placeholder="e.g. Oct 24, 6:00 PM" placeholderTextColor={theme.colors.textTertiary} value={date} onChangeText={setDate} />
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location *</Text>
          <TextInput style={inputStyle} placeholder="e.g. Main Auditorium" placeholderTextColor={theme.colors.textTertiary} value={location} onChangeText={setLocation} />
          {}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Reference Link (Optional)</Text>
          <TextInput
            style={inputStyle}
            placeholder="https:
            placeholderTextColor={theme.colors.textTertiary}
            value={regLink}
            onChangeText={setRegLink}
            autoCapitalize="none"
          />
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description *</Text>
          <TextInput style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]} placeholder="Event details..." placeholderTextColor={theme.colors.textTertiary} value={description} onChangeText={setDescription} multiline />
          <TouchableOpacity style={[styles.photoUpload, { borderColor: theme.colors.border }]} onPress={pickImage}>
            {photoAsset ? (
              <Image source={{ uri: photoAsset.uri }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={{ alignItems: 'center', gap: 5 }}>
                <Ionicons name="image-outline" size={30} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary }}>Add Banner Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <PrimaryButton title={submitting || uploading ? "Publishing..." : "Publish Event"} onPress={handleSubmit} disabled={submitting || uploading} />
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  photoUpload: { height: 180, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  photo: { width: '100%', height: '100%', borderRadius: 12 },
});
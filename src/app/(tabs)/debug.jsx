import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ScreenHeader from '@/components/ScreenHeader';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useAuth } from '@/utils/auth/useAuth';
import { useAuthModal } from '@/utils/auth/store';
export default function DebugScreen() {
  const insets = useSafeAreaInsets();
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { open } = useAuthModal();
  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComplaints(docs);
    }, (err) => console.error('Debug complaints snapshot error', err));
    const q2 = query(collection(db, 'mess_feedback'), orderBy('created_at', 'desc'));
    const unsub2 = onSnapshot(q2, (snapshot) => {
      setFeedback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('Debug feedback snapshot error', err));
    return () => { unsub(); unsub2(); };
  }, []);
  const seedAllData = async () => {
    if (!auth) {
      Alert.alert("Auth Required", "Please sign in first to seed data.");
      return;
    }
    try {
      setLoading(true);
      const sampleComplaints = [
        { category: "Water", title: "Low pressure in Wing B", hostel: "Hostel A", room_number: "201", status: "Resolved", priority: 1 },
        { category: "WiFi", title: "Router R-402 keeps rebooting", hostel: "Hostel B", room_number: "402", status: "In Progress", priority: 3 },
        { category: "Electricity", title: "Main switch tripping", hostel: "Hostel C", room_number: "Common Room", status: "Pending", priority: 3 },
        { category: "Cleaning", title: "Staircase needs urgent mopping", hostel: "Hostel A", room_number: "Block 2", status: "Resolved", priority: 1 },
        { category: "Other", title: "Washing machine #3 making noise", hostel: "Hostel D", room_number: "Laundry Room", status: "In Progress", priority: 2 },
        { category: "Water", title: "Hot water not available", hostel: "Hostel C", room_number: "310", status: "Pending", priority: 2 },
        { category: "WiFi", title: "No signal in the corner rooms", hostel: "Hostel A", room_number: "112-115", status: "Resolved", priority: 1 },
        { category: "Electricity", title: "Study lamp socket broken", hostel: "Hostel B", room_number: "215", status: "Pending", priority: 1 }
      ];
      for (const item of sampleComplaints) {
        await addDoc(collection(db, 'complaints'), {
          ...item,
          description: "Reported during morning rounds. Requires technical inspection.",
          student_name: "Aditya (Test)",
          student_email: auth.firebaseUser?.email,
          created_at: serverTimestamp(),
        });
      }
      const sampleEvents = [
        { title: "Winter Hackathon 2026", club: "Google DSC", venue: "IT Lab 1", attendees: 145 },
        { title: "Inter-Hostel Basketball", club: "Sports Committee", venue: "South Court", attendees: 89 },
        { title: "Placement Strategy Talk", club: "Career Cell", venue: "Seminar Hall", attendees: 210 },
        { title: "Open Mic Night", club: "Cultural Club", venue: "Amphitheater", attendees: 56 }
      ];
      for (const ev of sampleEvents) {
        await addDoc(collection(db, 'events'), {
          title: ev.title,
          club_name: ev.club,
          venue: ev.venue,
          description: "A major campus highlight! Don't miss out on the prizes and networking opportunities.",
          event_date: serverTimestamp(),
          attendee_count: ev.attendees,
          created_at: serverTimestamp(),
        });
      }
      const mealSamples = [
        { type: "Breakfast", name: "Aloo Paratha", taste: 5, hygiene: 5, quantity: 4 },
        { type: "Lunch", name: "Paneer Butter Masala", taste: 4, hygiene: 4, quantity: 3 },
        { type: "Dinner", name: "Dal Tadka & Jeera Rice", taste: 3, hygiene: 4, quantity: 5 }
      ];
      for (const meal of mealSamples) {
        await addDoc(collection(db, 'mess_feedback'), {
          meal_type: meal.type,
          meal_name: meal.name,
          taste_rating: meal.taste,
          hygiene_rating: meal.hygiene,
          quantity_rating: meal.quantity,
          feedback_text: "Great improvement in quality this week!",
          is_anonymous: false,
          student_email: auth.firebaseUser?.email,
          created_at: serverTimestamp(),
        });
      }
      Alert.alert("Judge-Ready!", "15+ entries added. Check your Dashboard and Feed now.");
    } catch (e) {
      console.error(e);
      Alert.alert("Seeding Failed", "Check your Firestore rules.");
    } finally {
      setLoading(false);
    }
  };
  const createSampleComplaint = async () => {
    if (!auth) {
      open({ mode: 'signin' });
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'complaints'), {
        category: 'WiFi',
        title: 'Debug: sample complaint',
        description: 'This is a test complaint generated from the debug screen.',
        hostel: 'Hostel A',
        room_number: '101',
        student_name: auth.firebaseUser?.email || 'debug',
        student_email: auth.firebaseUser?.email || 'debug@local',
        status: 'Pending',
        priority: 1,
        created_at: serverTimestamp(),
      });
      Alert.alert('Created', `Complaint id: ${docRef.id}`);
    } catch (e) {
      console.error('Create sample complaint failed', e);
      Alert.alert('Error', e?.message || 'Failed to create complaint');
    }
  };
  const createSampleFeedback = async () => {
    if (!auth) {
      open({ mode: 'signin' });
      return;
    }
    try {
      await addDoc(collection(db, 'mess_feedback'), {
        meal_type: 'Lunch',
        meal_name: 'Debug Rice',
        taste_rating: 4,
        hygiene_rating: 4,
        quantity_rating: 4,
        feedback_text: 'Debug feedback from app',
        is_anonymous: false,
        created_at: serverTimestamp(),
      });
      Alert.alert('Created', 'Feedback added');
    } catch (e) {
      console.error('Create sample feedback failed', e);
      Alert.alert('Error', e?.message || 'Failed to create feedback');
    }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="auto" />
      <ScreenHeader title="Debug" subtitle="Firestore smoke tests" />
      {loading && <ActivityIndicator size="large" color="#FF825E" style={styles.loader} />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth</Text>
          <Text>{auth ? `Signed in as ${auth.firebaseUser?.email}` : 'Not signed in'}</Text>
          {!auth && (
            <TouchableOpacity style={styles.button} onPress={() => open({ mode: 'signin' })}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bulk Seed</Text>
          {}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF825E' }]}
            onPress={seedAllData}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🚀 Bulk Seed Fake Data</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Single Entry</Text>
          <TouchableOpacity style={styles.button} onPress={createSampleComplaint}>
            <Text style={styles.buttonText}>Create One Complaint</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={createSampleFeedback}>
            <Text style={styles.buttonText}>Create One Feedback</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Complaints ({complaints.length})</Text>
          {complaints.map((item) => (
            <Text key={item.id} style={styles.listItem}>{item.title} — {item.status}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Feedback ({feedback.length})</Text>
          {feedback.map((item) => (
            <Text key={item.id} style={styles.listItem}>{item.meal_name} — ⭐{item.taste_rating}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
  section: { marginBottom: 24 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, fontSize: 16 },
  button: { padding: 14, backgroundColor: '#007AFF', borderRadius: 12, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  listItem: { paddingVertical: 6, fontSize: 13, borderBottomWidth: 1, borderBottomColor: '#eee' },
  loader: { marginVertical: 10 }
});
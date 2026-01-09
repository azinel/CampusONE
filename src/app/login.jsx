import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/utils/auth/useAuth";
import { useTheme } from "@/utils/theme";
import PrimaryButton from "@/components/PrimaryButton";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleAuthentication = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        await signUpWithEmail(email.trim(), password);
        Alert.alert("Success", "Account created successfully!");
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      Alert.alert("Authentication Failed", error.message || "Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: theme.colors.background }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
          <StatusBar style={theme.colors.statusBarStyle} />
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + "15" }]}>
              <Ionicons name="business" size={40} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: "Lato_700Bold" }]}>
              CampusOne
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: "Lato_400Regular" }]}>
              {isRegistering ? "Create your student account" : "Smart Campus Management"}
            </Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: "Lato_600SemiBold" }]}>
                College Email
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }
                ]}
                placeholder="your.name@college.edu"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: "Lato_600SemiBold" }]}>
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border
                  }
                ]}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <PrimaryButton
              title={loading ? "Processing..." : isRegistering ? "Create Account" : "Sign In"}
              onPress={handleAuthentication}
              disabled={loading}
              gradient
              style={styles.submitButton}
            />
            <TouchableOpacity
              onPress={() => setIsRegistering(!isRegistering)}
              style={styles.toggleContainer}
              disabled={loading}
            >
              <Text style={[styles.toggleText, { color: theme.colors.textSecondary, fontFamily: "Lato_400Regular" }]}>
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <Text style={{ color: theme.colors.primary, fontFamily: "Lato_700Bold" }}>
                  {isRegistering ? "Sign In" : "Register Now"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textTertiary, fontFamily: "Lato_400Regular" }]}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 10,
    height: 56,
    borderRadius: 16,
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 15,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 40,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
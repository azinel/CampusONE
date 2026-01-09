import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/utils/theme";

export default function PrimaryButton({ 
  title, 
  onPress, 
  disabled = false, 
  gradient = false,
  style 
}) {
  const theme = useTheme();

  // If gradient is true, we wrap the content in LinearGradient
  // If false, we use a standard View-like style
  const ButtonContent = () => (
    <>
      {disabled && (title === "Processing..." || title === "Uploading...") ? (
        <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
      ) : null}
      
      <Text style={styles.text}>
        {title}
      </Text>
    </>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.container, style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={[theme.colors.primary, '#4F46E5']} // Adjust secondary color as needed
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container, 
        styles.solid, 
        { backgroundColor: theme.colors.primary }, 
        style, 
        disabled && styles.disabled
      ]}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden', // Ensures gradient respects border radius
    marginVertical: 10,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  solid: {
    paddingVertical: 16, // Use padding on container, not text
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: '100%',
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    // --- THE FIX IS HERE ---
    lineHeight: 22,         // Gives vertical space for the font
    paddingBottom: 2,       // Extra nudge for the 'tails' (p, q, g)
    textAlignVertical: "center", // Android alignment fix
    includeFontPadding: false,   // Android specific fix to remove extra top padding
  },
  disabled: {
    opacity: 0.6,
  },
});
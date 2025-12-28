import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../utils/theme";

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  fontFamily = "Lato_600SemiBold",
  style,
  textStyle,
  gradient = false,
}) {
  const theme = useTheme();

  if (gradient) {
    return (
      <TouchableOpacity
        style={[styles.gradientButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          <Text
            style={[
              styles.gradientText,
              { fontFamily: fontFamily, color: "#FFFFFF" },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        { backgroundColor: theme.colors.primary },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.primaryButtonText,
          {
            fontFamily: fontFamily,
            color: "#FFFFFF",
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
  },
  gradientButton: {
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientContainer: {
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  gradientText: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

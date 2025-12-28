import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../utils/theme";

export default function CategoryBadge({
  category,
  fontFamily = "Lato_400Regular",
}) {
  const theme = useTheme();

  const getCategoryConfig = () => {
    switch (category) {
      case "Water":
        return {
          backgroundColor: theme.colors.water,
          textColor: theme.colors.waterText,
          icon: "water-outline",
        };
      case "Electricity":
        return {
          backgroundColor: theme.colors.electricity,
          textColor: theme.colors.electricityText,
          icon: "flash-outline",
        };
      case "WiFi":
        return {
          backgroundColor: theme.colors.wifi,
          textColor: theme.colors.wifiText,
          icon: "wifi-outline",
        };
      case "Cleaning":
        return {
          backgroundColor: theme.colors.cleaning,
          textColor: theme.colors.cleaningText,
          icon: "sparkles-outline",
        };
      case "Other":
        return {
          backgroundColor: theme.colors.other,
          textColor: theme.colors.otherText,
          icon: "ellipsis-horizontal-circle-outline",
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          textColor: theme.colors.text,
          icon: "help-circle-outline",
        };
    }
  };

  const config = getCategoryConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon} size={14} color={config.textColor} />
      <Text
        style={[
          styles.text,
          { fontFamily: fontFamily, color: config.textColor },
        ]}
      >
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  text: {
    fontSize: 13,
  },
});

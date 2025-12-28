import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../utils/theme";

export default function StatusBadge({
  status,
  fontFamily = "Lato_400Regular",
}) {
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case "Pending":
        return {
          backgroundColor: theme.colors.pending,
          textColor: theme.colors.pendingText,
          icon: "time-outline",
        };
      case "In Progress":
        return {
          backgroundColor: theme.colors.inProgress,
          textColor: theme.colors.inProgressText,
          icon: "hammer-outline",
        };
      case "Resolved":
        return {
          backgroundColor: theme.colors.resolved,
          textColor: theme.colors.resolvedText,
          icon: "checkmark-circle-outline",
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          textColor: theme.colors.text,
          icon: "help-circle-outline",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon} size={12} color={config.textColor} />
      <Text
        style={[
          styles.text,
          { fontFamily: fontFamily, color: config.textColor },
        ]}
      >
        {status}
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
    gap: 4,
  },
  text: {
    fontSize: 12,
  },
});

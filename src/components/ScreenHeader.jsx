import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../utils/theme";
export default function ScreenHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  actions = [],
  showBorder = false,
  titleFontFamily = "Lato_700Bold",
  subtitleFontFamily = "Lato_400Regular",
  style,
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <View
          style={[
            styles.headerInfo,
            showBackButton && styles.headerInfoWithBack,
          ]}
        >
          <Text
            style={[
              styles.title,
              { fontFamily: titleFontFamily, color: theme.colors.text },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  fontFamily: subtitleFontFamily,
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {actions.length > 0 && (
          <View style={styles.headerActions}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                style={[styles.actionButton, action.style]}
              >
                <Ionicons
                  name={action.icon}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  backButton: {
    marginTop: 2,
  },
  headerInfo: {
    flex: 1,
  },
  headerInfoWithBack: {
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 12,
  },
});

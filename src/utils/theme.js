import { useColorScheme } from "react-native";

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    isDark,
    colors: {
      // Backgrounds
      background: isDark ? "#121212" : "#F5F5F5",
      surface: isDark ? "#1E1E1E" : "#FFFFFF",
      elevated: isDark ? "#262626" : "#FFFFFF",

      // Text
      text: isDark ? "#FFFFFF" : "#222222",
      textSecondary: isDark ? "#B3B3B3" : "#929698",
      textTertiary: isDark ? "#999999" : "#6B7280",

      // Primary brand colors
      primary: isDark ? "#FF9A7B" : "#FF825E",
      primaryLight: isDark ? "#FFB399" : "#FF9A7B",

      // Status colors
      success: isDark ? "#4ADE80" : "#1DB35F",
      successLight: isDark ? "#86EFAC" : "#22C55E",
      warning: isDark ? "#FBBF24" : "#F59E0B",
      error: isDark ? "#F87171" : "#EF4444",
      info: isDark ? "#60A5FA" : "#3B82F6",

      // UI elements
      border: isDark ? "#333333" : "#E9E9E9",
      divider: isDark ? "#2A2A2A" : "#E9E9E9",
      outline: isDark ? "#404040" : "#E0E0E0",

      // Cards and badges
      card: isDark ? "#1E1E1E" : "#FFFFFF",

      // Category colors
      water: isDark ? "#1E3A8A" : "#DBEAFE",
      waterText: isDark ? "#93C5FD" : "#1E40AF",
      electricity: isDark ? "#713F12" : "#FEF3C7",
      electricityText: isDark ? "#FCD34D" : "#92400E",
      wifi: isDark ? "#6B21A8" : "#F3E8FF",
      wifiText: isDark ? "#C084FC" : "#6B21A8",
      cleaning: isDark ? "#14532D" : "#DCFCE7",
      cleaningText: isDark ? "#86EFAC" : "#166534",
      other: isDark ? "#7C2D12" : "#FFE2DD",
      otherText: isDark ? "#FB923C" : "#9A3412",

      // Status colors
      pending: isDark ? "#713F12" : "#FEF3C7",
      pendingText: isDark ? "#FCD34D" : "#92400E",
      inProgress: isDark ? "#1E3A8A" : "#DBEAFE",
      inProgressText: isDark ? "#93C5FD" : "#1E40AF",
      resolved: isDark ? "#14532D" : "#DCFCE7",
      resolvedText: isDark ? "#86EFAC" : "#166534",

      // Tab bar
      tabBarBackground: isDark ? "#1E1E1E" : "#FFFFFF",
      tabBarBorder: isDark ? "#333333" : "#E5E7EB",
      tabBarActive: isDark ? "#FFFFFF" : "#222222",
      tabBarInactive: isDark ? "#B3B3B3" : "#929698",

      // Bottom sheet
      bottomSheetBackground: isDark ? "#1E1E1E" : "#FFFFFF",
      bottomSheetHandle: isDark ? "#404040" : "#D1D5DB",

      // Status bar
      statusBarStyle: isDark ? "light" : "dark",
    },
  };

  return theme;
};

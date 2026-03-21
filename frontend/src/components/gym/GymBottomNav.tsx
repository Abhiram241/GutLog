/**
 * GymBottomNav.tsx
 *
 * Bottom navigation bar for Gym Tracker mode.
 * Provides navigation between workout, routines, history, progress, and settings.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { GymTab } from "../../types/gym";

interface GymBottomNavProps {
  activeTab: GymTab;
  onTabPress: (tab: GymTab) => void;
  isDarkMode: boolean;
}

const tabs: Array<{
  key: GymTab;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  { key: "workout", label: "Workout", icon: "play-circle" },
  { key: "routines", label: "Routines", icon: "list" },
  { key: "history", label: "History", icon: "calendar" },
  { key: "progress", label: "Progress", icon: "trending-up" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export function GymBottomNav({
  activeTab,
  onTabPress,
  isDarkMode,
}: GymBottomNavProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? "#4ECDC4" : palette.textMuted}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? "#4ECDC4" : palette.textMuted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    ...theme.shadow.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  iconWrap: {
    padding: 4,
    borderRadius: theme.radius.full,
  },
  iconWrapActive: {
    backgroundColor: "rgba(78, 205, 196, 0.1)",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
});

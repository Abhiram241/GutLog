/**
 * BottomNav.tsx
 *
 * The 5-tab bottom navigation bar.
 * Pure UI component — receives active tab and a callback, renders icons/labels.
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";
import { AppTab } from "../types";

interface BottomNavProps {
  activeTab: AppTab;
  onTabPress: (tab: AppTab) => void;
  isDarkMode?: boolean;
}

const tabs: {
  key: AppTab;
  label: string;
  type: "ion" | "mc";
  activeIcon: string;
  inactiveIcon: string;
}[] = [
  {
    key: "home",
    label: "Home",
    type: "ion",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  {
    key: "meds",
    label: "Meds",
    type: "mc",
    activeIcon: "pill",
    inactiveIcon: "pill-multiple",
  },
  {
    key: "water",
    label: "Water",
    type: "mc",
    activeIcon: "water",
    inactiveIcon: "cup-water",
  },
  {
    key: "stool",
    label: "Stool",
    type: "mc",
    activeIcon: "toilet",
    inactiveIcon: "toilet",
  },
  {
    key: "settings",
    label: "Settings",
    type: "ion",
    activeIcon: "settings",
    inactiveIcon: "settings-outline",
  },
];

export function BottomNav({
  activeTab,
  onTabPress,
  isDarkMode = false,
}: BottomNavProps) {
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {tabs.map((tab) => {
        const isFocused = activeTab === tab.key;
        const tintColor = isFocused
          ? theme.colors.primary
          : isDarkMode
            ? theme.dark.textMuted
            : theme.colors.textMuted;

        return (
          <Pressable
            accessibilityRole="button"
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            {tab.type === "ion" ? (
              <Ionicons
                name={
                  (isFocused ? tab.activeIcon : tab.inactiveIcon) as
                    | "home"
                    | "home-outline"
                    | "settings"
                    | "settings-outline"
                }
                size={22}
                color={tintColor}
              />
            ) : (
              <MaterialCommunityIcons
                name={
                  (isFocused ? tab.activeIcon : tab.inactiveIcon) as
                    | "pill"
                    | "pill-multiple"
                    | "water"
                    | "cup-water"
                    | "toilet"
                }
                size={22}
                color={tintColor}
              />
            )}
            <Text
              style={[
                styles.label,
                isDarkMode && styles.labelDark,
                isFocused && styles.labelFocused,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: "#F1EEEA",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
    borderTopColor: theme.dark.border,
  },
  tab: {
    minHeight: 44,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 3,
    borderRadius: theme.radius.md,
  },
  tabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  labelDark: {
    color: theme.dark.textMuted,
  },
});

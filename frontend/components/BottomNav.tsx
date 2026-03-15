import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { AppTab } from "@/types";

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
  { key: "home", label: "Home", type: "ion", activeIcon: "home", inactiveIcon: "home-outline" },
  {
    key: "meds",
    label: "Meds",
    type: "mc",
    activeIcon: "pill",
    inactiveIcon: "pill-multiple",
  },
  { key: "water", label: "Water", type: "mc", activeIcon: "water", inactiveIcon: "cup-water" },
  { key: "stool", label: "Stool", type: "mc", activeIcon: "toilet", inactiveIcon: "toilet" },
  {
    key: "settings",
    label: "Settings",
    type: "ion",
    activeIcon: "settings",
    inactiveIcon: "settings-outline",
  },
];

export function BottomNav({ activeTab, onTabPress, isDarkMode = false }: BottomNavProps) {
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {tabs.map((tab) => {
        const focused = activeTab === tab.key;
        const tintColor = focused
          ? theme.colors.primary
          : isDarkMode
            ? "#9CA8B8"
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
                name={(focused ? tab.activeIcon : tab.inactiveIcon) as "home" | "home-outline" | "settings" | "settings-outline"}
                size={20}
                color={tintColor}
              />
            ) : (
              <MaterialCommunityIcons
                name={(focused ? tab.activeIcon : tab.inactiveIcon) as
                  | "pill"
                  | "pill-multiple"
                  | "water"
                  | "cup-water"
                  | "toilet"}
                size={20}
                color={tintColor}
              />
            )}
            <Text style={[styles.label, isDarkMode && styles.labelDark, focused && styles.labelFocused]}>
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
    ...theme.shadow.md,
  },
  containerDark: {
    backgroundColor: "#121824",
    borderTopColor: "#273241",
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
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  labelFocused: {
    color: theme.colors.primary,
  },
  labelDark: {
    color: "#9BA9B8",
  },
});

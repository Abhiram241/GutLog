/**
 * ScreenHeader.tsx
 *
 * Reusable screen title + subtitle header used at the top of every screen.
 * Optionally shows an icon beside the title.
 * Uses ThemeContext for colors.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../context/ThemeContext";
import { theme } from "../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isDarkMode?: boolean; // kept for backward compat, ignored
}

export function ScreenHeader({ title, subtitle, icon }: ScreenHeaderProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        {icon ? (
          <Ionicons
            name={icon}
            size={28}
            color={theme.colors.primary}
            style={styles.icon}
          />
        ) : null}
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 2,
  },
});

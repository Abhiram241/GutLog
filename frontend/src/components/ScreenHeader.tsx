/**
 * ScreenHeader.tsx
 *
 * Reusable screen title + subtitle header used at the top of every screen.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  isDarkMode?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  isDarkMode = false,
}: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
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
  title: {
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  titleDark: {
    color: theme.dark.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  subtitleDark: {
    color: theme.dark.textSecondary,
  },
});

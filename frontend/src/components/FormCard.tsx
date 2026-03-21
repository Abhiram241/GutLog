/**
 * FormCard.tsx
 *
 * A styled card container used to group form fields and content sections.
 * Uses ThemeContext so it automatically responds to dark/light mode.
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useAppTheme } from "../context/ThemeContext";
import { theme } from "../constants/theme";

interface FormCardProps {
  children: React.ReactNode;
  isDarkMode?: boolean; // kept for backward compat, ignored — context is source of truth
  style?: ViewStyle;
}

export function FormCard({ children, style }: FormCardProps) {
  const { palette } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});

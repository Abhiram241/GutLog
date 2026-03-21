/**
 * FormCard.tsx
 *
 * A styled card container used to group form fields and content sections.
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { theme } from "../constants/theme";

interface FormCardProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  style?: ViewStyle;
}

export function FormCard({
  children,
  isDarkMode = false,
  style,
}: FormCardProps) {
  return (
    <View style={[styles.card, isDarkMode && styles.cardDark, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: theme.dark.surface,
    borderWidth: 1,
    borderColor: theme.dark.border,
  },
});

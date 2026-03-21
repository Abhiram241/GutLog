/**
 * DateSwitcher.tsx
 *
 * A row with prev/next arrows and a tappable date label that opens the calendar.
 * Uses ThemeContext for colors.
 */

import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../context/ThemeContext";
import { theme } from "../constants/theme";

interface DateSwitcherProps {
  dateKey: string;
  todayKey: string;
  isDarkMode?: boolean; // kept for backward compat, ignored
  onPrev: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
}

export function DateSwitcher({
  dateKey,
  todayKey,
  onPrev,
  onNext,
  onOpenCalendar,
}: DateSwitcherProps) {
  const { palette } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <Pressable
        onPress={onPrev}
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: palette.surfaceMuted },
          pressed && styles.pressed,
        ]}
      >
        <Feather name="chevron-left" size={18} color={palette.textPrimary} />
      </Pressable>

      <Pressable
        onPress={onOpenCalendar}
        style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
      >
        <Text style={[styles.dateText, { color: palette.textPrimary }]}>
          {dateKey}
        </Text>
        <Feather
          name="calendar"
          size={13}
          color={palette.textSecondary}
          style={styles.calendarIcon}
        />
      </Pressable>

      <Pressable
        onPress={onNext}
        disabled={dateKey === todayKey}
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: palette.surfaceMuted },
          pressed && styles.pressed,
        ]}
      >
        <Feather
          name="chevron-right"
          size={18}
          color={dateKey === todayKey ? palette.textMuted : palette.textPrimary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 4,
  },
  dateText: {
    fontWeight: "600",
  },
  calendarIcon: {
    marginLeft: 4,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});

/**
 * DateSwitcher.tsx
 *
 * A row with prev/next arrows and a tappable date label that opens the calendar.
 * Used on Home, Stool, and AI Review screens.
 */

import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";

interface DateSwitcherProps {
  dateKey: string;
  todayKey: string;
  isDarkMode?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
}

export function DateSwitcher({
  dateKey,
  todayKey,
  isDarkMode = false,
  onPrev,
  onNext,
  onOpenCalendar,
}: DateSwitcherProps) {
  const textColor = isDarkMode
    ? theme.dark.textPrimary
    : theme.colors.textPrimary;
  const iconColor = isDarkMode
    ? theme.dark.textSecondary
    : theme.colors.textSecondary;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Pressable
        onPress={onPrev}
        style={({ pressed }) => [
          styles.iconButton,
          isDarkMode && styles.iconButtonDark,
          pressed && styles.pressed,
        ]}
      >
        <Feather name="chevron-left" size={18} color={textColor} />
      </Pressable>

      <Pressable
        onPress={onOpenCalendar}
        style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
      >
        <Text style={[styles.dateText, { color: textColor }]}>{dateKey}</Text>
        <Feather
          name="calendar"
          size={13}
          color={iconColor}
          style={styles.calendarIcon}
        />
      </Pressable>

      <Pressable
        onPress={onNext}
        disabled={dateKey === todayKey}
        style={({ pressed }) => [
          styles.iconButton,
          isDarkMode && styles.iconButtonDark,
          pressed && styles.pressed,
        ]}
      >
        <Feather
          name="chevron-right"
          size={18}
          color={
            dateKey === todayKey
              ? isDarkMode
                ? theme.dark.textMuted
                : theme.colors.textMuted
              : textColor
          }
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "#EEE7DF",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  containerDark: {
    backgroundColor: "#18202D",
    borderColor: "#2A374A",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F5F0",
    minWidth: 44,
    minHeight: 44,
  },
  iconButtonDark: {
    backgroundColor: theme.dark.surfaceMuted,
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

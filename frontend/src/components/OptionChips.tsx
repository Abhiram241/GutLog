/**
 * OptionChips.tsx
 *
 * A row of selectable chip buttons. Used for stool consistency, color,
 * satisfaction, city selection, and theme preference.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";

interface OptionChipsProps<T extends string> {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  isDarkMode?: boolean;
}

export function OptionChips<T extends string>({
  options,
  selected,
  onSelect,
  isDarkMode = false,
}: OptionChipsProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.chip,
              isSelected
                ? styles.chipActive
                : isDarkMode
                  ? styles.chipInactiveDark
                  : styles.chipInactive,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.label,
                isSelected
                  ? styles.labelActive
                  : isDarkMode
                    ? styles.labelInactiveDark
                    : styles.labelInactive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#F9E8E2",
    borderColor: "#E8B6A8",
  },
  chipInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#ECE4DB",
  },
  chipInactiveDark: {
    backgroundColor: theme.dark.surfaceMuted,
    borderColor: theme.dark.border,
  },
  label: {
    fontWeight: "600",
  },
  labelActive: {
    color: theme.colors.primary,
  },
  labelInactive: {
    color: theme.colors.textSecondary,
  },
  labelInactiveDark: {
    color: theme.dark.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
});

/**
 * OptionChips.tsx
 *
 * A row of selectable chip buttons. Uses ThemeContext for colors.
 */

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../context/ThemeContext";
import { theme } from "../constants/theme";

interface OptionChipsProps<T extends string> {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  isDarkMode?: boolean; // kept for backward compat, ignored
}

const BROWN = "#E08E79";
const TEAL = "#4ECDC4";

export function OptionChips<T extends string>({
  options,
  selected,
  onSelect,
}: OptionChipsProps<T>) {
  const { palette } = useAppTheme();

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
                ? { borderColor: BROWN, backgroundColor: "transparent" }
                : {
                    borderColor: palette.inputBorder,
                    backgroundColor: palette.surface,
                  },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? BROWN : palette.textSecondary },
                isSelected && styles.labelActive,
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
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  label: {
    fontWeight: "600",
    fontSize: 13,
  },
  labelActive: {
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});

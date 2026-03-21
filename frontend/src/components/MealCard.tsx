/**
 * MealCard.tsx
 *
 * Displays a single meal section with food items, outside food toggle,
 * add item button, and macro generation.
 * Pure UI component — all actions are passed as callbacks.
 */

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";
import { useAppTheme } from "../context/ThemeContext";
import { MealLog, MealType } from "../types";

interface MealCardProps {
  mealType: MealType;
  title: string;
  color: string;
  meal: MealLog;
  isDarkMode?: boolean;
  hasGeminiKey: boolean;
  isGenerating: boolean;
  onToggleOutsideFood: (mealType: MealType) => void;
  onOpenAddItem: (mealType: MealType) => void;
  onGenerateMacros: (mealType: MealType) => void;
}

export function MealCard({
  mealType,
  title,
  color,
  meal,
  isDarkMode = false,
  hasGeminiKey,
  isGenerating,
  onToggleOutsideFood,
  onOpenAddItem,
  onGenerateMacros,
}: MealCardProps) {
  const { palette } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderWidth: 1,
        },
      ]}
    >
      {/* Colored top accent bar */}
      <View style={[styles.topAccent, { backgroundColor: color }]} />

      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.countText, { color: palette.textSecondary }]}>
          {meal.items.length} items
        </Text>
      </View>

      {/* Outside food toggle */}
      <Pressable
        onPress={() => onToggleOutsideFood(mealType)}
        style={({ pressed }) => [
          styles.checkboxRow,
          {
            backgroundColor: palette.surfaceMuted,
            borderColor: palette.border,
          },
          meal.outsideFoodChecked && styles.checkboxActive,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.checkbox,
            meal.outsideFoodChecked && styles.checkboxTicked,
          ]}
        >
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={14}
            color={meal.outsideFoodChecked ? "#FFFFFF" : palette.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.checkboxLabel,
            { color: palette.textSecondary },
            meal.outsideFoodChecked && styles.checkboxLabelActive,
          ]}
        >
          Outside Food
        </Text>
      </Pressable>

      {/* Food items list */}
      {meal.items.length ? (
        meal.items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              { borderBottomColor: palette.borderSubtle },
            ]}
          >
            <Text style={[styles.itemName, { color: palette.textPrimary }]}>
              {item.name}
              {item.suspicious ? (
                <Text style={styles.suspiciousTag}> · suspicious</Text>
              ) : null}
            </Text>
            <Text style={[styles.itemQty, { color: palette.textSecondary }]}>
              {item.quantity}
              {item.unit}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: palette.textMuted }]}>
          No food items yet.
        </Text>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onOpenAddItem(mealType)}
          style={({ pressed }) => [
            styles.addButton,
            { borderColor: palette.inputBorder },
            pressed && styles.pressed,
          ]}
        >
          <Feather name="plus" size={16} color={theme.colors.primary} />
          <Text style={styles.addButtonLabel}>Add Item</Text>
        </Pressable>

        {hasGeminiKey ? (
          <Pressable
            onPress={() => onGenerateMacros(mealType)}
            disabled={!meal.items.length || isGenerating}
            style={({ pressed }) => [
              styles.macroButton,
              { backgroundColor: palette.surfaceMuted },
              (!meal.items.length || isGenerating) &&
                styles.macroButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={14}
              color={palette.textSecondary}
            />
            <Text
              style={[
                styles.macroButtonLabel,
                { color: palette.textSecondary },
              ]}
            >
              {isGenerating ? "Generating..." : "Macros"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Macro results */}
      {meal.macro ? (
        <View
          style={[
            styles.macroCard,
            {
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.borderSubtle,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.macroTitle, { color: palette.textPrimary }]}>
            Estimated Macros
          </Text>
          <View style={styles.macroGrid}>
            {[
              { label: "Calories", value: `${meal.macro.calories} kcal` },
              { label: "Protein", value: `${meal.macro.protein}g` },
              { label: "Carbs", value: `${meal.macro.carbs}g` },
              { label: "Fat", value: `${meal.macro.fat}g` },
            ].map((m) => (
              <View key={m.label} style={styles.macroItem}>
                <Text
                  style={[
                    styles.macroItemValue,
                    { color: palette.textPrimary },
                  ]}
                >
                  {m.value}
                </Text>
                <Text
                  style={[
                    styles.macroItemLabel,
                    { color: palette.textSecondary },
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {!!meal.macroError && (
        <Text style={styles.errorText}>{meal.macroError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  topAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 4,
  },
  headerRow: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  countText: {
    fontWeight: "500",
    fontSize: 13,
  },
  checkboxRow: {
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.spacing.md,
    minHeight: 44,
  },
  checkboxActive: {
    backgroundColor: "transparent",
    borderColor: theme.colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6CEC5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxTicked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontWeight: "600",
    fontSize: 13,
  },
  checkboxLabelActive: { color: theme.colors.primary },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  suspiciousTag: { color: theme.colors.danger, fontSize: 12 },
  itemQty: {
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    marginBottom: theme.spacing.md,
    fontSize: 13,
  },
  actionRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  addButtonLabel: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  macroButton: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  macroButtonDisabled: { opacity: 0.4 },
  macroButtonLabel: { fontWeight: "600", fontSize: 13 },
  macroCard: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  macroTitle: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  macroItem: {
    flex: 1,
    minWidth: "40%",
    alignItems: "center",
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
  },
  macroItemValue: {
    fontWeight: "700",
    fontSize: 14,
  },
  macroItemLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.danger,
    fontSize: 12,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});

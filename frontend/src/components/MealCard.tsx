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
  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      {/* Colored top accent bar */}
      <View style={[styles.topAccent, { backgroundColor: color }]} />

      <View style={styles.headerRow}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {title}
        </Text>
        <Text style={[styles.countText, isDarkMode && styles.countTextDark]}>
          {meal.items.length} items
        </Text>
      </View>

      {/* Outside food toggle */}
      <Pressable
        onPress={() => onToggleOutsideFood(mealType)}
        style={({ pressed }) => [
          styles.checkboxRow,
          isDarkMode && styles.checkboxRowDark,
          meal.outsideFoodChecked && styles.checkboxActive,
          meal.outsideFoodChecked && isDarkMode && styles.checkboxActiveDark,
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
            color={
              meal.outsideFoodChecked
                ? "#FFFFFF"
                : isDarkMode
                  ? theme.dark.textSecondary
                  : theme.colors.textSecondary
            }
          />
        </View>
        <Text
          style={[
            styles.checkboxLabel,
            isDarkMode && styles.checkboxLabelDark,
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
            style={[styles.itemRow, isDarkMode && styles.itemRowDark]}
          >
            <Text style={[styles.itemName, isDarkMode && styles.itemNameDark]}>
              {item.name}
              {item.suspicious ? (
                <Text style={styles.suspiciousTag}> · suspicious</Text>
              ) : null}
            </Text>
            <Text style={[styles.itemQty, isDarkMode && styles.itemQtyDark]}>
              {item.quantity}
              {item.unit}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
          No food items yet.
        </Text>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onOpenAddItem(mealType)}
          style={({ pressed }) => [
            styles.addButton,
            isDarkMode && styles.addButtonDark,
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
              isDarkMode && styles.macroButtonDark,
              (!meal.items.length || isGenerating) &&
                styles.macroButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.macroButtonLabel,
                isDarkMode && styles.macroButtonLabelDark,
              ]}
            >
              {isGenerating ? "Generating..." : "Macros"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Macro results */}
      {meal.macro ? (
        <View style={[styles.macroCard, isDarkMode && styles.macroCardDark]}>
          <Text
            style={[styles.macroTitle, isDarkMode && styles.macroTitleDark]}
          >
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
                    isDarkMode && styles.macroValueDark,
                  ]}
                >
                  {m.value}
                </Text>
                <Text
                  style={[
                    styles.macroItemLabel,
                    isDarkMode && styles.macroLabelDark,
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
    backgroundColor: theme.colors.surface,
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
  cardDark: {
    backgroundColor: theme.dark.surface,
    borderWidth: 1,
    borderColor: theme.dark.border,
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
    color: theme.colors.textPrimary,
    letterSpacing: 0.1,
  },
  titleDark: { color: theme.dark.textPrimary },
  countText: {
    color: theme.colors.textSecondary,
    fontWeight: "500",
    fontSize: 13,
  },
  countTextDark: { color: theme.dark.textSecondary },
  checkboxRow: {
    borderWidth: 1,
    borderColor: "#F2E5DA",
    borderRadius: theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.spacing.md,
    backgroundColor: "#FFF9F4",
    minHeight: 44,
  },
  checkboxRowDark: {
    backgroundColor: theme.dark.surfaceMuted,
    borderColor: theme.dark.border,
  },
  checkboxActive: { backgroundColor: "#FFF0E9", borderColor: "#F7C8B6" },
  checkboxActiveDark: { backgroundColor: "#2A1F1A", borderColor: "#7A4030" },
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
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  checkboxLabelDark: { color: theme.dark.textSecondary },
  checkboxLabelActive: { color: theme.colors.primary },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F0EB",
  },
  itemRowDark: { borderBottomColor: theme.dark.borderSubtle },
  itemName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  itemNameDark: { color: theme.dark.textPrimary },
  suspiciousTag: { color: theme.colors.danger, fontSize: 12 },
  itemQty: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  itemQtyDark: { color: theme.dark.textSecondary },
  emptyText: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    fontSize: 13,
  },
  emptyTextDark: { color: theme.dark.textMuted },
  actionRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#F0CBC0",
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
  },
  addButtonDark: { borderColor: "#5A3028", backgroundColor: "#1E1410" },
  addButtonLabel: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  macroButton: {
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.sageSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    minHeight: 44,
  },
  macroButtonDark: { backgroundColor: theme.dark.surfaceMuted },
  macroButtonDisabled: { opacity: 0.4 },
  macroButtonLabel: { color: "#4E5D48", fontWeight: "600", fontSize: 13 },
  macroButtonLabelDark: { color: theme.dark.textSecondary },
  macroCard: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: "#FAF8F3",
    padding: theme.spacing.md,
  },
  macroCardDark: {
    backgroundColor: theme.dark.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.dark.borderSubtle,
  },
  macroTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  macroTitleDark: { color: theme.dark.textPrimary },
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  macroItem: {
    flex: 1,
    minWidth: "40%",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
  },
  macroItemValue: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  macroItemLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  macroValueDark: { color: theme.dark.textPrimary },
  macroLabelDark: { color: theme.dark.textSecondary },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.danger,
    fontSize: 12,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});

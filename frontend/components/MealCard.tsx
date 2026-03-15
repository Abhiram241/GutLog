import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import { MealLog, MealType } from "@/types";

interface MealCardProps {
  mealType: MealType;
  title: string;
  color: string;
  meal: MealLog;
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
  hasGeminiKey,
  isGenerating,
  onToggleOutsideFood,
  onOpenAddItem,
  onGenerateMacros,
}: MealCardProps) {
  const totalItems = meal.items.length;

  return (
    <View style={styles.card}>
      <View style={[styles.topAccent, { backgroundColor: color }]} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.countText}>{totalItems} items</Text>
      </View>

      <Pressable
        onPress={() => onToggleOutsideFood(mealType)}
        style={({ pressed }) => [styles.checkboxRow, meal.outsideFoodChecked && styles.checkboxActive, pressed && styles.pressed]}
      >
        <View style={[styles.checkbox, meal.outsideFoodChecked && styles.checkboxTicked]}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={14}
            color={meal.outsideFoodChecked ? "#FFFFFF" : theme.colors.textSecondary}
          />
        </View>
        <Text style={[styles.checkboxLabel, meal.outsideFoodChecked && styles.checkboxLabelActive]}>Outside Food</Text>
      </Pressable>

      {meal.items.length ? (
        meal.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.name}
              {item.suspicious ? " • suspicious" : ""}
            </Text>
            <Text style={styles.itemQty}>
              {item.quantity}
              {item.unit}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No food items yet.</Text>
      )}

      <View style={styles.actionRow}>
        <Pressable onPress={() => onOpenAddItem(mealType)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <Feather name="plus" size={16} color={theme.colors.primary} />
          <Text style={styles.addButtonLabel}>Add Item</Text>
        </Pressable>

        {hasGeminiKey ? (
          <Pressable
            onPress={() => onGenerateMacros(mealType)}
            disabled={!meal.items.length || isGenerating}
            style={({ pressed }) => [
              styles.macroButton,
              (!meal.items.length || isGenerating) && styles.macroButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.macroButtonLabel}>{isGenerating ? "Generating..." : "Generate Macros"}</Text>
          </Pressable>
        ) : null}
      </View>

      {meal.macro ? (
        <View style={styles.macroCard}>
          <Text style={styles.macroTitle}>Estimated Macros</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroValue}>kcal {meal.macro.calories}</Text>
            <Text style={styles.macroValue}>P {meal.macro.protein}g</Text>
            <Text style={styles.macroValue}>C {meal.macro.carbs}g</Text>
            <Text style={styles.macroValue}>F {meal.macro.fat}g</Text>
          </View>
        </View>
      ) : null}

      {!!meal.macroError && <Text style={styles.errorText}>{meal.macroError}</Text>}
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
    ...theme.shadow.md,
  },
  topAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 8,
  },
  headerRow: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  countText: {
    color: theme.colors.textSecondary,
    fontWeight: "500",
    fontSize: 13,
  },
  checkboxRow: {
    borderWidth: 1,
    borderColor: "#F2E5DA",
    borderRadius: theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: theme.spacing.md,
    backgroundColor: "#FFF9F4",
    minHeight: 44,
  },
  checkboxActive: {
    backgroundColor: "#FFF0E9",
    borderColor: "#F7C8B6",
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
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  checkboxLabelActive: {
    color: theme.colors.primary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F0EB",
  },
  itemName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  itemQty: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#F0CBC0",
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
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
    backgroundColor: theme.colors.sageSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    minHeight: 44,
  },
  macroButtonDisabled: {
    opacity: 0.5,
  },
  macroButtonLabel: {
    color: "#4E5D48",
    fontWeight: "600",
    fontSize: 13,
  },
  macroCard: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: "#FAF8F3",
    padding: theme.spacing.md,
  },
  macroTitle: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 6,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  macroValue: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.danger,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});

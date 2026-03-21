/**
 * AddFoodModal.tsx
 *
 * Bottom sheet modal for adding a food item to a meal.
 * Pure UI component — all state and actions are passed as props.
 */

import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { theme } from "../constants/theme";
import { mealMeta } from "../constants/mealMeta";
import { MealType, UnitType } from "../types";

interface AddFoodModalProps {
  visible: boolean;
  mealType: MealType | null;
  itemName: string;
  itemQty: string;
  itemUnit: UnitType;
  isDarkMode: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onQtyChange: (value: string) => void;
  onUnitChange: (unit: UnitType) => void;
  onSubmit: () => void;
}

export function AddFoodModal({
  visible,
  mealType,
  itemName,
  itemQty,
  itemUnit,
  isDarkMode,
  onClose,
  onNameChange,
  onQtyChange,
  onUnitChange,
  onSubmit,
}: AddFoodModalProps) {
  const meal = mealMeta.find((m) => m.key === mealType);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardWrap}>
          <Pressable
            style={[styles.card, isDarkMode && styles.cardDark]}
            onPress={() => undefined}
          >
            {/* Meal label pill */}
            {meal ? (
              <View
                style={[
                  styles.mealPill,
                  { backgroundColor: meal.color + "33" },
                ]}
              >
                <Text style={styles.mealPillText}>
                  {meal.title.toUpperCase()}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.title, isDarkMode && styles.textPrimaryDark]}>
              Add Food Item
            </Text>

            {/* Grouped input surface */}
            <View
              style={[styles.inputGroup, isDarkMode && styles.inputGroupDark]}
            >
              <TextInput
                value={itemName}
                onChangeText={onNameChange}
                placeholder={meal?.placeholder ?? "Food name"}
                placeholderTextColor={
                  isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
                }
                style={[styles.input, isDarkMode && styles.inputDark]}
                returnKeyType="next"
                autoFocus
              />
              <View
                style={[styles.divider, isDarkMode && styles.dividerDark]}
              />
              <View style={styles.qtyRow}>
                <TextInput
                  value={itemQty}
                  onChangeText={onQtyChange}
                  keyboardType="numeric"
                  placeholder="Qty"
                  placeholderTextColor={
                    isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
                  }
                  style={[styles.qtyInput, isDarkMode && styles.inputDark]}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
                <View style={styles.unitToggle}>
                  {(["g", "ml"] as const).map((unit) => (
                    <Pressable
                      key={unit}
                      onPress={() => onUnitChange(unit)}
                      style={[
                        styles.unitBtn,
                        isDarkMode && styles.unitBtnDark,
                        itemUnit === unit &&
                          (isDarkMode
                            ? styles.unitBtnActiveDark
                            : styles.unitBtnActive),
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitLabel,
                          isDarkMode && { color: theme.dark.textSecondary },
                          itemUnit === unit && styles.unitLabelActive,
                        ]}
                      >
                        {unit}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Pressable
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.submitLabel}>Add Item</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  keyboardWrap: { width: "100%", alignItems: "center" },
  card: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
  },
  cardDark: {
    backgroundColor: theme.dark.surface,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.dark.border,
  },
  mealPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  mealPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  inputGroup: {
    backgroundColor: "#F5F2EE",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  inputGroupDark: {
    backgroundColor: theme.dark.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.dark.border,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: "transparent",
  },
  inputDark: { color: theme.dark.textPrimary },
  divider: { height: 1, backgroundColor: "#EAE5DF", marginHorizontal: 16 },
  dividerDark: { backgroundColor: theme.dark.border },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 12,
  },
  qtyInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: theme.radius.full,
    padding: 3,
    gap: 2,
  },
  unitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    minWidth: 44,
    alignItems: "center",
  },
  unitBtnDark: { backgroundColor: "transparent" },
  unitBtnActive: {
    backgroundColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitBtnActiveDark: {
    backgroundColor: theme.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.dark.border,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  unitLabelActive: { color: theme.colors.textPrimary },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52,
  },
  submitLabel: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  textPrimaryDark: { color: theme.dark.textPrimary },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

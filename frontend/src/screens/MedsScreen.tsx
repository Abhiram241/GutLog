/**
 * MedsScreen.tsx
 *
 * Medication and supplement checklist screen.
 * Logic lives in useMeds hook. This component is UI-only.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormCard } from "../components/FormCard";
import { ProgressRing } from "../components/ProgressRing";
import { ScreenHeader } from "../components/ScreenHeader";
import { theme } from "../constants/theme";
import { DayLog, MedItem } from "../types";
import { createEmptyDayLog } from "../utils/logHelpers";

interface MedsScreenProps {
  currentDateKey: string;
  currentLog: DayLog;
  medsMaster: MedItem[];
  isDarkMode: boolean;
  // Form state
  medName: string;
  medTime: string;
  onMedNameChange: (value: string) => void;
  onMedTimeChange: (value: string) => void;
  // Actions
  onAddMed: () => void;
  onDeleteMed: (medId: string) => void;
  onToggleMedTaken: (medId: string) => void;
  onUpdateMedTime: (medId: string, time: string) => void;
}

export function MedsScreen({
  currentLog,
  medsMaster,
  isDarkMode,
  medName,
  medTime,
  onMedNameChange,
  onMedTimeChange,
  onAddMed,
  onDeleteMed,
  onToggleMedTaken,
  onUpdateMedTime,
}: MedsScreenProps) {
  const insets = useSafeAreaInsets();
  const takenCount = medsMaster.filter(
    (med) => currentLog.medsTaken[med.id]?.taken,
  ).length;

  return (
    <FlatList
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 120 },
      ]}
      ListHeaderComponent={
        <>
          <ScreenHeader
            title="Meds & Supplements"
            subtitle="Daily checklist and dosage tracking"
            isDarkMode={isDarkMode}
          />

          {/* Progress ring + hint */}
          <View style={styles.topRow}>
            <ProgressRing
              progress={medsMaster.length ? takenCount / medsMaster.length : 0}
              label={`${takenCount}/${medsMaster.length || 0}`}
              subLabel="Taken"
              color="#A086D3"
              isDarkMode={isDarkMode}
            />
            <View
              style={[
                styles.hintCard,
                isDarkMode && { backgroundColor: theme.dark.surfaceMuted },
              ]}
            >
              <Text
                style={[styles.hintTitle, isDarkMode && styles.textPrimaryDark]}
              >
                Today status
              </Text>
              <Text
                style={[
                  styles.hintBody,
                  isDarkMode && styles.textSecondaryDark,
                ]}
              >
                Stay consistent with your supplements and medicines.
              </Text>
            </View>
          </View>

          {/* Add med form */}
          <FormCard isDarkMode={isDarkMode}>
            <Text
              style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
            >
              Add medication or supplement
            </Text>
            <TextInput
              value={medName}
              onChangeText={onMedNameChange}
              placeholder="Name (ex: Mesalamine)"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, isDarkMode && styles.inputDark]}
            />
            <TextInput
              value={medTime}
              onChangeText={onMedTimeChange}
              placeholder="Time HH:MM"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, isDarkMode && styles.inputDark]}
            />
            <Pressable
              onPress={onAddMed}
              style={({ pressed }) => [
                styles.button,
                isDarkMode && styles.buttonDark,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.buttonLabel,
                  isDarkMode && styles.buttonLabelDark,
                ]}
              >
                Add to checklist
              </Text>
            </Pressable>
          </FormCard>
        </>
      }
      data={medsMaster}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text
          style={[styles.emptyText, isDarkMode && styles.textSecondaryDark]}
        >
          No meds added yet.
        </Text>
      }
      renderItem={({ item: med }) => {
        const state = currentLog.medsTaken[med.id] ?? {
          taken: false,
          timeTaken: med.preferredTime,
        };
        return (
          <View style={[styles.medRow, isDarkMode && styles.medRowDark]}>
            <Pressable
              onPress={() => onToggleMedTaken(med.id)}
              style={({ pressed }) => [
                styles.tick,
                state.taken && styles.tickActive,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={state.taken ? "checkmark" : "ellipse-outline"}
                size={16}
                color={state.taken ? "#FFFFFF" : theme.colors.textSecondary}
              />
            </Pressable>

            <View style={styles.medDetails}>
              <Text
                style={[styles.medName, isDarkMode && styles.textPrimaryDark]}
              >
                {med.name}
              </Text>
              <TextInput
                value={state.timeTaken}
                onChangeText={(value) => onUpdateMedTime(med.id, value)}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.timeInput, isDarkMode && styles.inputDark]}
              />
            </View>

            <Pressable
              onPress={() => onDeleteMed(med.id)}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={theme.colors.danger}
              />
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  hintCard: {
    flex: 1,
    backgroundColor: "#F3ECFF",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    minHeight: 110,
    justifyContent: "center",
  },
  hintTitle: {
    color: "#6A5299",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  hintBody: { color: "#6D6480", fontSize: 13, lineHeight: 19 },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FAF8F6",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    color: theme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 46,
    marginBottom: 8,
  },
  inputDark: {
    backgroundColor: theme.dark.inputBg,
    borderColor: theme.dark.inputBorder,
    color: theme.dark.textPrimary,
  },
  button: {
    marginTop: 10,
    backgroundColor: theme.colors.sageSoft,
    borderRadius: theme.radius.full,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: "center",
  },
  buttonDark: {
    backgroundColor: theme.dark.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.dark.border,
  },
  buttonLabel: { color: "#4A5D4F", fontWeight: "700", fontSize: 14 },
  buttonLabelDark: { color: theme.dark.textPrimary },
  medRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    marginBottom: theme.spacing.sm,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  medRowDark: {
    backgroundColor: theme.dark.surfaceElevated,
    borderColor: theme.dark.border,
  },
  tick: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D3CADF",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  tickActive: { backgroundColor: "#A086D3", borderColor: "#A086D3" },
  medDetails: { flex: 1 },
  medName: { color: theme.colors.textPrimary, fontWeight: "700", fontSize: 15 },
  timeInput: {
    backgroundColor: "#FAF8F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    maxWidth: 96,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  emptyText: { color: theme.colors.textSecondary, fontSize: 13 },
  textPrimaryDark: { color: theme.dark.textPrimary },
  textSecondaryDark: { color: theme.dark.textSecondary },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

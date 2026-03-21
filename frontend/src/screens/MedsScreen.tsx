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
import { useAppTheme } from "../context/ThemeContext";
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
  const { palette } = useAppTheme();
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
            icon="medkit-outline"
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
                { backgroundColor: palette.surfaceMuted },
              ]}
            >
              <Text style={[styles.hintTitle, { color: palette.textPrimary }]}>
                Today status
              </Text>
              <Text style={[styles.hintBody, { color: palette.textSecondary }]}>
                Stay consistent with your supplements and medicines.
              </Text>
            </View>
          </View>

          {/* Add med form */}
          <FormCard isDarkMode={isDarkMode}>
            <View style={styles.cardTitleRow}>
              <Ionicons
                name="add-circle-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
                Add medication or supplement
              </Text>
            </View>
            <TextInput
              value={medName}
              onChangeText={onMedNameChange}
              placeholder="Name (ex: Mesalamine)"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                  color: palette.textPrimary,
                },
              ]}
            />
            <TextInput
              value={medTime}
              onChangeText={onMedTimeChange}
              placeholder="Time HH:MM"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                  color: palette.textPrimary,
                },
              ]}
            />
            <Pressable
              onPress={onAddMed}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={palette.textPrimary}
              />
              <Text
                style={[styles.buttonLabel, { color: palette.textPrimary }]}
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
        <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
          No meds added yet.
        </Text>
      }
      renderItem={({ item: med }) => {
        const state = currentLog.medsTaken[med.id] ?? {
          taken: false,
          timeTaken: med.preferredTime,
        };
        return (
          <View
            style={[
              styles.medRow,
              {
                backgroundColor: palette.surfaceElevated,
                borderColor: palette.border,
              },
            ]}
          >
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
                color={state.taken ? "#FFFFFF" : palette.textSecondary}
              />
            </Pressable>

            <View style={styles.medDetails}>
              <Text style={[styles.medName, { color: palette.textPrimary }]}>
                {med.name}
              </Text>
              <TextInput
                value={state.timeTaken}
                onChangeText={(value) => onUpdateMedTime(med.id, value)}
                placeholder="HH:MM"
                placeholderTextColor={palette.textMuted}
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.inputBorder,
                    color: palette.textPrimary,
                  },
                ]}
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
  hintBody: { fontSize: 13, lineHeight: 19 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  input: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 46,
    marginBottom: 8,
  },
  button: {
    marginTop: 10,
    borderRadius: theme.radius.full,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  buttonLabel: { fontWeight: "700", fontSize: 14 },
  medRow: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
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
  medName: { fontWeight: "700", fontSize: 15 },
  timeInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  emptyText: { fontSize: 13 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

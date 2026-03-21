/**
 * StoolScreen.tsx
 *
 * Stool log entry and 7-day correlation view.
 * Logic lives in useStool hook. This component is UI-only.
 */

import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CalendarPicker } from "../components/CalendarPicker";
import { DateSwitcher } from "../components/DateSwitcher";
import { FormCard } from "../components/FormCard";
import { OptionChips } from "../components/OptionChips";
import { ScreenHeader } from "../components/ScreenHeader";
import {
  colorOptions,
  consistencyOptions,
  mealMeta,
  satisfactionOptions,
} from "../constants/mealMeta";
import { theme } from "../constants/theme";
import { DayLog, MedItem, StoolEntry } from "../types";
import { getPastDateKeys, shiftDateKey } from "../utils/date";
import { createEmptyDayLog } from "../utils/logHelpers";

interface StoolScreenProps {
  stoolTab: "entry" | "correlation";
  stoolDate: string;
  stoolTime: string;
  stoolConsistency: StoolEntry["consistency"];
  stoolColor: StoolEntry["color"];
  stoolSatisfaction: StoolEntry["satisfaction"];
  stoolNotes: string;
  stoolMessage: string;
  todayKey: string;
  allLogs: Record<string, DayLog>;
  medsMaster: MedItem[];
  isDarkMode: boolean;
  onTabChange: (tab: "entry" | "correlation") => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onConsistencyChange: (value: StoolEntry["consistency"]) => void;
  onColorChange: (value: StoolEntry["color"]) => void;
  onSatisfactionChange: (value: StoolEntry["satisfaction"]) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
}

export function StoolScreen({
  stoolTab,
  stoolDate,
  stoolTime,
  stoolConsistency,
  stoolColor,
  stoolSatisfaction,
  stoolNotes,
  stoolMessage,
  todayKey,
  allLogs,
  medsMaster,
  isDarkMode,
  onTabChange,
  onDateChange,
  onTimeChange,
  onConsistencyChange,
  onColorChange,
  onSatisfactionChange,
  onNotesChange,
  onSave,
}: StoolScreenProps) {
  const insets = useSafeAreaInsets();
  const [calendarVisible, setCalendarVisible] = React.useState(false);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 140 },
      ]}
    >
      <ScreenHeader
        title="Stool Log"
        subtitle="Track patterns and correlations"
        isDarkMode={isDarkMode}
      />

      {/* Tab toggle */}
      <View style={[styles.tabToggle, isDarkMode && styles.tabToggleDark]}>
        {(["entry", "correlation"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={({ pressed }) => [
              styles.segment,
              stoolTab === tab && styles.segmentActive,
              stoolTab === tab && isDarkMode && styles.segmentActiveDark,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                isDarkMode && styles.textSecondaryDark,
                stoolTab === tab && styles.segmentLabelActive,
                stoolTab === tab && isDarkMode && styles.textPrimaryDark,
              ]}
            >
              {tab === "entry" ? "Log Entry" : "Correlation View"}
            </Text>
          </Pressable>
        ))}
      </View>

      {stoolTab === "entry" ? (
        <FormCard isDarkMode={isDarkMode}>
          <Text
            style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
          >
            New Entry
          </Text>

          <DateSwitcher
            dateKey={stoolDate}
            todayKey={todayKey}
            isDarkMode={isDarkMode}
            onPrev={() => onDateChange(shiftDateKey(stoolDate, -1))}
            onNext={() =>
              onDateChange(
                stoolDate === todayKey ? stoolDate : shiftDateKey(stoolDate, 1),
              )
            }
            onOpenCalendar={() => setCalendarVisible(true)}
          />

          <TextInput
            value={stoolTime}
            onChangeText={onTimeChange}
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, isDarkMode && styles.inputDark]}
          />

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textSecondaryDark]}
          >
            Consistency
          </Text>
          <OptionChips
            options={consistencyOptions}
            selected={stoolConsistency}
            onSelect={onConsistencyChange}
            isDarkMode={isDarkMode}
          />

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textSecondaryDark]}
          >
            Color
          </Text>
          <OptionChips
            options={colorOptions}
            selected={stoolColor}
            onSelect={onColorChange}
            isDarkMode={isDarkMode}
          />

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textSecondaryDark]}
          >
            Satisfaction
          </Text>
          <OptionChips
            options={satisfactionOptions}
            selected={stoolSatisfaction}
            onSelect={onSatisfactionChange}
            isDarkMode={isDarkMode}
          />

          <TextInput
            value={stoolNotes}
            onChangeText={onNotesChange}
            placeholder="Optional notes (max 200 chars)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            maxLength={200}
            style={[
              styles.input,
              isDarkMode && styles.inputDark,
              styles.notesInput,
            ]}
          />

          <Pressable
            onPress={onSave}
            style={({ pressed }) => [
              styles.button,
              isDarkMode && styles.buttonDark,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.buttonLabel, isDarkMode && styles.buttonLabelDark]}
            >
              Save Stool Entry
            </Text>
          </Pressable>

          {!!stoolMessage && (
            <Text style={[styles.infoText, isDarkMode && { color: "#6FCF97" }]}>
              {stoolMessage}
            </Text>
          )}
        </FormCard>
      ) : (
        <FormCard isDarkMode={isDarkMode}>
          <Text
            style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
          >
            Last 7 days summary
          </Text>
          {getPastDateKeys(7).map((dateKey) => {
            const log = allLogs[dateKey] ?? createEmptyDayLog();
            const lastStool = log.stoolEntries[0];
            const foods = mealMeta
              .flatMap((meal) => log.meals[meal.key].items)
              .map((item) => item.name)
              .slice(0, 4);
            const meds = medsMaster
              .filter((med) => log.medsTaken[med.id]?.taken)
              .map((med) => med.name);
            const hasOutsideFood = mealMeta.some((meal) =>
              log.meals[meal.key].items.some((item) => item.isOutsideFood),
            );

            return (
              <View
                key={dateKey}
                style={[
                  styles.timelineRow,
                  isDarkMode && { borderBottomColor: theme.dark.border },
                ]}
              >
                <View style={styles.dateCol}>
                  <Text
                    style={[
                      styles.dateText,
                      isDarkMode && styles.textPrimaryDark,
                    ]}
                  >
                    {dateKey}
                  </Text>
                  {hasOutsideFood ? <Text style={styles.emoji}>🌮</Text> : null}
                </View>
                <View style={styles.timelineDetails}>
                  <Text
                    style={[
                      styles.timelineMain,
                      isDarkMode && styles.textPrimaryDark,
                    ]}
                  >
                    {lastStool
                      ? `${lastStool.consistency} • ${lastStool.color} • ${lastStool.satisfaction}`
                      : "No stool entry"}
                  </Text>
                  <Text
                    style={[
                      styles.timelineSub,
                      isDarkMode && styles.textSecondaryDark,
                    ]}
                  >
                    Foods: {foods.length ? foods.join(", ") : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.timelineSub,
                      isDarkMode && styles.textSecondaryDark,
                    ]}
                  >
                    Meds: {meds.length ? meds.join(", ") : "-"}
                  </Text>
                </View>
              </View>
            );
          })}
        </FormCard>
      )}

      <CalendarPicker
        visible={calendarVisible}
        selectedDate={stoolDate}
        maxDate={todayKey}
        isDarkMode={isDarkMode}
        onSelect={onDateChange}
        onClose={() => setCalendarVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "#F4EEE7",
    borderRadius: theme.radius.full,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tabToggleDark: { backgroundColor: theme.dark.surfaceMuted },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  segmentActive: { backgroundColor: theme.colors.surface },
  segmentActiveDark: { backgroundColor: theme.dark.surfaceElevated },
  segmentLabel: { color: theme.colors.textSecondary, fontWeight: "600" },
  segmentLabelActive: { color: theme.colors.textPrimary },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: theme.colors.textPrimary,
    fontWeight: "600",
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
  notesInput: { minHeight: 88, textAlignVertical: "top" },
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
  infoText: { marginTop: 12, color: "#55735C", fontWeight: "500" },
  timelineRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8DF",
    paddingVertical: 12,
    gap: 10,
  },
  dateCol: { width: 94 },
  dateText: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 12,
  },
  emoji: { marginTop: 6, fontSize: 17 },
  timelineDetails: { flex: 1 },
  timelineMain: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
  },
  timelineSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  textPrimaryDark: { color: theme.dark.textPrimary },
  textSecondaryDark: { color: theme.dark.textSecondary },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

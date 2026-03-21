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
import { Ionicons } from "@expo/vector-icons";

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
import { useAppTheme } from "../context/ThemeContext";
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
  const { palette } = useAppTheme();
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
        icon="analytics-outline"
        isDarkMode={isDarkMode}
      />

      {/* Tab toggle */}
      <View
        style={[styles.tabToggle, { backgroundColor: palette.surfaceMuted }]}
      >
        {(["entry", "correlation"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={({ pressed }) => [
              styles.segment,
              stoolTab === tab && styles.segmentActive,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: palette.textSecondary },
                stoolTab === tab && styles.segmentLabelActive,
              ]}
            >
              {tab === "entry" ? "Log Entry" : "Correlation View"}
            </Text>
          </Pressable>
        ))}
      </View>

      {stoolTab === "entry" ? (
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
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

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            Consistency
          </Text>
          <OptionChips
            options={consistencyOptions}
            selected={stoolConsistency}
            onSelect={onConsistencyChange}
            isDarkMode={isDarkMode}
          />

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            Color
          </Text>
          <OptionChips
            options={colorOptions}
            selected={stoolColor}
            onSelect={onColorChange}
            isDarkMode={isDarkMode}
          />

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
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
            placeholderTextColor={palette.textMuted}
            multiline
            maxLength={200}
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                color: palette.textPrimary,
              },
              styles.notesInput,
            ]}
          />

          <Pressable
            onPress={onSave}
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
              name="save-outline"
              size={16}
              color={palette.textPrimary}
            />
            <Text style={[styles.buttonLabel, { color: palette.textPrimary }]}>
              Save Stool Entry
            </Text>
          </Pressable>

          {!!stoolMessage && (
            <Text style={[styles.infoText, { color: "#6FCF97" }]}>
              {stoolMessage}
            </Text>
          )}
        </FormCard>
      ) : (
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
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
                  { borderBottomColor: palette.border },
                ]}
              >
                <View style={styles.dateCol}>
                  <Text
                    style={[styles.dateText, { color: palette.textPrimary }]}
                  >
                    {dateKey}
                  </Text>
                  {hasOutsideFood ? <Text style={styles.emoji}>🌮</Text> : null}
                </View>
                <View style={styles.timelineDetails}>
                  <Text
                    style={[
                      styles.timelineMain,
                      { color: palette.textPrimary },
                    ]}
                  >
                    {lastStool
                      ? `${lastStool.consistency} • ${lastStool.color} • ${lastStool.satisfaction}`
                      : "No stool entry"}
                  </Text>
                  <Text
                    style={[
                      styles.timelineSub,
                      { color: palette.textSecondary },
                    ]}
                  >
                    Foods: {foods.length ? foods.join(", ") : "-"}
                  </Text>
                  <Text
                    style={[
                      styles.timelineSub,
                      { color: palette.textSecondary },
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
    borderRadius: theme.radius.full,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  segmentActive: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#E08E79",
  },
  segmentLabel: { fontWeight: "600" },
  segmentLabelActive: {
    color: "#E08E79",
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "600",
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
  notesInput: { minHeight: 88, textAlignVertical: "top" },
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
  infoText: { marginTop: 12, fontWeight: "500" },
  timelineRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 12,
    gap: 10,
  },
  dateCol: { width: 94 },
  dateText: {
    fontWeight: "700",
    fontSize: 12,
  },
  emoji: { marginTop: 6, fontSize: 17 },
  timelineDetails: { flex: 1 },
  timelineMain: {
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
  },
  timelineSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

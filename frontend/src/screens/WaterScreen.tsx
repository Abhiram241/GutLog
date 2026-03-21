/**
 * WaterScreen.tsx
 *
 * Hydration tracking screen with animated water bottle.
 * Logic (addWater, streak) is passed in as props from the parent.
 */

import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormCard } from "../components/FormCard";
import { ScreenHeader } from "../components/ScreenHeader";
import { WaterBottle } from "../components/WaterBottle";
import { theme } from "../constants/theme";
import { DayLog, SettingsData } from "../types";
import { shiftDateKey } from "../utils/date";

interface WaterScreenProps {
  currentLog: DayLog;
  settings: SettingsData;
  allLogs: Record<string, DayLog>;
  todayKey: string;
  isDarkMode: boolean;
  onAddWater: (amount: number) => void;
}

export function WaterScreen({
  currentLog,
  settings,
  allLogs,
  todayKey,
  isDarkMode,
  onAddWater,
}: WaterScreenProps) {
  const insets = useSafeAreaInsets();

  // Calculate hydration streak
  const waterStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const key = shiftDateKey(todayKey, -i);
      const log = allLogs[key];
      if (!log || log.waterMl < settings.dailyWaterGoal) break;
      streak++;
    }
    return streak;
  }, [allLogs, settings.dailyWaterGoal, todayKey]);

  const progress = settings.dailyWaterGoal
    ? currentLog.waterMl / settings.dailyWaterGoal
    : 0;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 120 },
      ]}
    >
      <ScreenHeader
        title="Water Intake"
        subtitle="Hydration helps your gut healing journey"
        isDarkMode={isDarkMode}
      />

      <FormCard
        isDarkMode={isDarkMode}
        style={{
          backgroundColor: isDarkMode ? theme.dark.surfaceMuted : "#F0F8FF",
        }}
      >
        <WaterBottle
          progress={progress}
          amount={currentLog.waterMl}
          goal={settings.dailyWaterGoal}
          isDarkMode={isDarkMode}
        />

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => onAddWater(-250)}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.removeLabel}>−250 ml</Text>
          </Pressable>
          <Pressable
            onPress={() => onAddWater(250)}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addLabel}>+250 ml</Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.streakText,
            isDarkMode && { color: theme.dark.textSecondary },
          ]}
        >
          {waterStreak > 0
            ? `You have hit your water goal ${waterStreak} day${waterStreak > 1 ? "s" : ""} in a row`
            : "Start a hydration streak today."}
        </Text>
      </FormCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginTop: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#1A7A4A",
    borderRadius: theme.radius.full,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  addLabel: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  removeButton: {
    flex: 1,
    backgroundColor: "#C0392B",
    borderRadius: theme.radius.full,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  removeLabel: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  streakText: {
    color: "#466F90",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

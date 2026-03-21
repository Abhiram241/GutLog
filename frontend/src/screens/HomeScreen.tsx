/**
 * HomeScreen.tsx
 *
 * Daily food log screen. Shows a summary strip, macro summary,
 * and a MealCard for each of the 5 meal types.
 *
 * Logic lives in useMeals hook. This component is UI-only.
 */

import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DateSwitcher } from "../components/DateSwitcher";
import { FormCard } from "../components/FormCard";
import { MealCard } from "../components/MealCard";
import { ScreenHeader } from "../components/ScreenHeader";
import { mealMeta } from "../constants/mealMeta";
import { theme } from "../constants/theme";
import { DayLog, MealType, SettingsData } from "../types";
import { friendlyDate, shiftDateKey } from "../utils/date";
import { createEmptyDayLog } from "../utils/logHelpers";

interface HomeScreenProps {
  currentDateKey: string;
  todayKey: string;
  allLogs: Record<string, DayLog>;
  settings: SettingsData;
  medsMaster: { id: string }[];
  isDarkMode: boolean;
  macroLoadingMeal: MealType | null;
  onDateChange: (dateKey: string) => void;
  onOpenCalendar: () => void;
  onToggleOutsideFood: (mealType: MealType) => void;
  onOpenAddItem: (mealType: MealType) => void;
  onGenerateMacros: (mealType: MealType) => void;
}

export function HomeScreen({
  currentDateKey,
  todayKey,
  allLogs,
  settings,
  medsMaster,
  isDarkMode,
  macroLoadingMeal,
  onDateChange,
  onOpenCalendar,
  onToggleOutsideFood,
  onOpenAddItem,
  onGenerateMacros,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const currentLog = allLogs[currentDateKey] ?? createEmptyDayLog();
  const hasGeminiKey = settings.geminiApiKey.trim().length > 0;

  // ─── Derived stats ────────────────────────────────────────────────────────────
  const totalFoodItems = useMemo(
    () =>
      mealMeta.reduce(
        (sum, meal) => sum + currentLog.meals[meal.key].items.length,
        0,
      ),
    [currentLog.meals],
  );

  const todayTakenMedsCount = useMemo(
    () =>
      medsMaster.filter((med) => currentLog.medsTaken[med.id]?.taken).length,
    [currentLog.medsTaken, medsMaster],
  );

  const dailyMacroSummary = useMemo(() => {
    const summary = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      hasGenerated: false,
    };
    mealMeta.forEach((meal) => {
      const macro = currentLog.meals[meal.key].macro;
      if (!macro) return;
      summary.hasGenerated = true;
      summary.calories += Number(macro.calories || 0);
      summary.protein += Number(macro.protein || 0);
      summary.carbohydrates += Number(macro.carbs || 0);
      summary.fat += Number(macro.fat || 0);
    });
    return summary;
  }, [currentLog.meals]);

  // ─── Render ───────────────────────────────────────────────────────────────────
  const summaryItems = [
    { label: "Food items", value: String(totalFoodItems) },
    { label: "Water", value: `${currentLog.waterMl}ml` },
    {
      label: "Supplements",
      value: `${todayTakenMedsCount}/${medsMaster.length || 0}`,
    },
  ];

  return (
    <FlatList
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 120 },
      ]}
      ListHeaderComponent={
        <>
          <ScreenHeader
            title="GutLogs"
            subtitle={friendlyDate(currentDateKey)}
            isDarkMode={isDarkMode}
          />

          <DateSwitcher
            dateKey={currentDateKey}
            todayKey={todayKey}
            isDarkMode={isDarkMode}
            onPrev={() => onDateChange(shiftDateKey(currentDateKey, -1))}
            onNext={() => onDateChange(shiftDateKey(currentDateKey, 1))}
            onOpenCalendar={onOpenCalendar}
          />

          {/* Summary strip */}
          <View style={styles.summaryStrip}>
            {summaryItems.map((item) => (
              <View
                key={item.label}
                style={[
                  styles.summaryCard,
                  isDarkMode && styles.summaryCardDark,
                ]}
              >
                <Text
                  style={[
                    styles.summaryValue,
                    isDarkMode && styles.textPrimaryDark,
                  ]}
                >
                  {item.value}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    isDarkMode && styles.textSecondaryDark,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Daily macro summary */}
          {dailyMacroSummary.hasGenerated ? (
            <FormCard isDarkMode={isDarkMode} style={{ marginTop: 0 }}>
              <Text
                style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
              >
                Daily Macro Summary
              </Text>
              <Text
                style={[
                  styles.macroLine,
                  isDarkMode && styles.textSecondaryDark,
                ]}
              >
                Calories: {dailyMacroSummary.calories} kilocalories
              </Text>
              <Text
                style={[
                  styles.macroLine,
                  isDarkMode && styles.textSecondaryDark,
                ]}
              >
                Protein: {dailyMacroSummary.protein} grams
              </Text>
              <Text
                style={[
                  styles.macroLine,
                  isDarkMode && styles.textSecondaryDark,
                ]}
              >
                Carbohydrates: {dailyMacroSummary.carbohydrates} grams
              </Text>
              <Text
                style={[
                  styles.macroLine,
                  isDarkMode && styles.textSecondaryDark,
                ]}
              >
                Fat: {dailyMacroSummary.fat} grams
              </Text>
            </FormCard>
          ) : null}
        </>
      }
      data={mealMeta}
      keyExtractor={(item) => item.key}
      renderItem={({ item: meal }) => (
        <MealCard
          mealType={meal.key}
          title={meal.title}
          color={meal.color}
          meal={currentLog.meals[meal.key]}
          isDarkMode={isDarkMode}
          hasGeminiKey={hasGeminiKey}
          isGenerating={macroLoadingMeal === meal.key}
          onToggleOutsideFood={onToggleOutsideFood}
          onOpenAddItem={onOpenAddItem}
          onGenerateMacros={onGenerateMacros}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  summaryStrip: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryCardDark: { backgroundColor: theme.dark.surface },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  summaryLabel: {
    marginTop: 2,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  macroLine: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  textPrimaryDark: { color: theme.dark.textPrimary },
  textSecondaryDark: { color: theme.dark.textSecondary },
});

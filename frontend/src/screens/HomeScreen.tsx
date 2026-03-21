/**
 * HomeScreen.tsx
 *
 * Daily food log screen. Shows a summary strip, macro summary,
 * and a MealCard for each of the 5 meal types.
 *
 * Logic lives in useMeals hook. This component is UI-only.
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DateSwitcher } from "../components/DateSwitcher";
import { FormCard } from "../components/FormCard";
import { MealCard } from "../components/MealCard";
import { ScreenHeader } from "../components/ScreenHeader";
import { mealMeta } from "../constants/mealMeta";
import { theme } from "../constants/theme";
import { useAppTheme } from "../context/ThemeContext";
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
  const { palette } = useAppTheme();
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
    {
      label: "Food items",
      value: String(totalFoodItems),
      icon: "restaurant-outline" as const,
      iconLib: "ion" as const,
    },
    {
      label: "Water",
      value: `${currentLog.waterMl}ml`,
      icon: "water-outline" as const,
      iconLib: "ion" as const,
    },
    {
      label: "Supplements",
      value: `${todayTakenMedsCount}/${medsMaster.length || 0}`,
      icon: "medkit-outline" as const,
      iconLib: "ion" as const,
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
            title="NextCore"
            subtitle={friendlyDate(currentDateKey)}
            icon="leaf-outline"
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
                  { backgroundColor: palette.surface },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={theme.colors.primary}
                  style={styles.summaryIcon}
                />
                <Text
                  style={[styles.summaryValue, { color: palette.textPrimary }]}
                >
                  {item.value}
                </Text>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: palette.textSecondary },
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
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="stats-chart-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.cardTitle, { color: palette.textPrimary }]}
                >
                  Daily Macro Summary
                </Text>
              </View>
              <View style={styles.macroGrid}>
                {[
                  {
                    label: "Calories",
                    value: `${dailyMacroSummary.calories} kcal`,
                    icon: "flame-outline" as const,
                  },
                  {
                    label: "Protein",
                    value: `${dailyMacroSummary.protein}g`,
                    icon: "barbell-outline" as const,
                  },
                  {
                    label: "Carbs",
                    value: `${dailyMacroSummary.carbohydrates}g`,
                    icon: "leaf-outline" as const,
                  },
                  {
                    label: "Fat",
                    value: `${dailyMacroSummary.fat}g`,
                    icon: "water-outline" as const,
                  },
                ].map((m) => (
                  <View
                    key={m.label}
                    style={[
                      styles.macroItem,
                      { backgroundColor: palette.surfaceMuted },
                    ]}
                  >
                    <Ionicons
                      name={m.icon}
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.macroValue,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {m.value}
                    </Text>
                    <Text
                      style={[
                        styles.macroLabel,
                        { color: palette.textSecondary },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </View>
                ))}
              </View>
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
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryIcon: { marginBottom: 2 },
  summaryValue: {
    fontWeight: "700",
    fontSize: 15,
  },
  summaryLabel: {
    fontSize: 11,
    textAlign: "center",
  },
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
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  macroItem: {
    flex: 1,
    minWidth: "44%",
    alignItems: "center",
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    gap: 3,
  },
  macroValue: {
    fontWeight: "700",
    fontSize: 14,
  },
  macroLabel: {
    fontSize: 11,
  },
});

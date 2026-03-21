/**
 * SuspiciousFoodsScreen.tsx
 *
 * Shows all foods marked as suspicious across all logs,
 * and lets users toggle the suspicious flag per food item.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FormCard } from "../components/FormCard";
import { ScreenHeader } from "../components/ScreenHeader";
import { mealMeta } from "../constants/mealMeta";
import { theme } from "../constants/theme";
import { useAppTheme } from "../context/ThemeContext";
import { DayLog, MealType } from "../types";

interface SuspiciousFoodsScreenProps {
  allLogs: Record<string, DayLog>;
  isDarkMode: boolean;
  onToggleSuspicious: (
    dateKey: string,
    mealType: MealType,
    itemId: string,
  ) => void;
}

interface SuspiciousSummaryItem {
  name: string;
  count: number;
  lastSeen: string;
}

interface RevisitItem {
  id: string;
  name: string;
  meal: string;
  suspicious: boolean;
}

export function SuspiciousFoodsScreen({
  allLogs,
  isDarkMode,
  onToggleSuspicious,
}: SuspiciousFoodsScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  // ─── Aggregate suspicious items across all logs ────────────────────────────
  const suspiciousItems = useMemo<SuspiciousSummaryItem[]>(() => {
    const grouped: Record<string, SuspiciousSummaryItem> = {};
    Object.entries(allLogs).forEach(([dateKey, log]) => {
      mealMeta.forEach((meal) => {
        log.meals[meal.key].items.forEach((item) => {
          if (!item.suspicious) return;
          const id = item.name.trim().toLowerCase();
          grouped[id] = grouped[id]
            ? {
                ...grouped[id],
                count: grouped[id].count + 1,
                lastSeen:
                  grouped[id].lastSeen > dateKey
                    ? grouped[id].lastSeen
                    : dateKey,
              }
            : { name: item.name, count: 1, lastSeen: dateKey };
        });
      });
    });
    return Object.values(grouped).sort((a, b) =>
      a.lastSeen < b.lastSeen ? 1 : -1,
    );
  }, [allLogs]);

  // ─── Group all food items by date for the revisit section ─────────────────
  const revisitByDate = useMemo(() => {
    return Object.entries(allLogs)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, 7)
      .map(([dateKey, log]) => {
        const items: RevisitItem[] = mealMeta.flatMap((meal) =>
          log.meals[meal.key].items.map((item) => ({
            id: item.id,
            name: item.name,
            meal: meal.title,
            suspicious: item.suspicious ?? false,
          })),
        );
        return { dateKey, items };
      })
      .filter(({ items }) => items.length > 0);
  }, [allLogs]);

  return (
    <FlatList
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 44 },
      ]}
      ListHeaderComponent={
        <>
          <ScreenHeader
            title="Suspicious Foods"
            subtitle="Mark foods that trigger stomach upset"
            icon="warning-outline"
            isDarkMode={isDarkMode}
          />

          {/* Summary of all suspicious foods */}
          <FormCard isDarkMode={isDarkMode}>
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              All suspicious foods
            </Text>
            {suspiciousItems.length ? (
              suspiciousItems.map((item) => (
                <View
                  key={`${item.name}_${item.lastSeen}`}
                  style={[
                    styles.summaryRow,
                    { borderBottomColor: palette.border },
                  ]}
                >
                  <Text
                    style={[styles.summaryName, { color: palette.textPrimary }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.summaryMeta,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {item.count} mark(s) • last {item.lastSeen}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={[styles.emptyText, { color: palette.textSecondary }]}
              >
                No suspicious foods marked yet.
              </Text>
            )}
          </FormCard>
        </>
      }
      data={revisitByDate}
      keyExtractor={({ dateKey }) => dateKey}
      renderItem={({ item: { dateKey, items } }) => (
        <View style={[styles.revisitCard, { borderColor: palette.border }]}>
          <Text style={[styles.revisitDate, { color: palette.textPrimary }]}>
            {dateKey}
          </Text>
          {items.map((item) => {
            const mealType = mealMeta.find((m) =>
              allLogs[dateKey]?.meals[m.key].items.some(
                (i) => i.id === item.id,
              ),
            )?.key;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  mealType && onToggleSuspicious(dateKey, mealType, item.id)
                }
                style={({ pressed }) => [
                  styles.revisitRow,
                  { borderTopColor: palette.borderSubtle },
                  pressed && styles.pressed,
                ]}
              >
                <View>
                  <Text
                    style={[styles.revisitFood, { color: palette.textPrimary }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.revisitMeal,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {item.meal}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={
                    item.suspicious ? "alert-circle" : "alert-circle-outline"
                  }
                  size={22}
                  color={
                    item.suspicious ? theme.colors.danger : palette.textMuted
                  }
                />
              </Pressable>
            );
          })}
        </View>
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
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  summaryRow: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  summaryName: { fontWeight: "700" },
  summaryMeta: {
    marginTop: 2,
    fontSize: 12,
  },
  emptyText: { fontSize: 13 },
  revisitCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 10,
  },
  revisitDate: {
    fontWeight: "700",
    marginBottom: 8,
  },
  revisitRow: {
    borderTopWidth: 1,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revisitFood: { fontWeight: "600" },
  revisitMeal: {
    fontSize: 12,
    textTransform: "capitalize",
    marginTop: 2,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

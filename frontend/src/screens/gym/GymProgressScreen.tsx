/**
 * GymProgressScreen.tsx
 *
 * Progress tracking and analytics screen.
 * Shows exercise progress charts, PRs, and muscle group stats.
 */

import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../../components/ScreenHeader";
import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { muscleGroupColors } from "../../constants/gymTheme";
import {
  Exercise,
  WorkoutSession,
  PersonalRecord,
  BodyMetricEntry,
} from "../../types/gym";
import {
  getExerciseProgressData,
  getMuscleGroupLabel,
} from "../../utils/gymHelpers";

interface GymProgressScreenProps {
  exercises: Exercise[];
  workoutHistory: Record<string, WorkoutSession[]>;
  personalRecords: Record<string, PersonalRecord>;
  bodyMetrics: BodyMetricEntry[];
  isDarkMode: boolean;
  onAddBodyMetric: () => void;
}

type TabType = "exercises" | "records" | "body";

export function GymProgressScreen({
  exercises,
  workoutHistory,
  personalRecords,
  bodyMetrics,
  isDarkMode,
  onAddBodyMetric,
}: GymProgressScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabType>("exercises");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Get PRs list sorted by date
  const prsList = useMemo(() => {
    return Object.values(personalRecords).sort(
      (a, b) =>
        new Date(b.maxWeightDate).getTime() -
        new Date(a.maxWeightDate).getTime(),
    );
  }, [personalRecords]);

  // Get progress data for selected exercise
  const progressData = useMemo(() => {
    if (!selectedExercise) return [];
    return getExerciseProgressData(workoutHistory, selectedExercise, 10);
  }, [workoutHistory, selectedExercise]);

  const renderExercisesTab = () => (
    <View style={styles.tabContent}>
      {/* Exercise selector */}
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
        Select Exercise to View Progress
      </Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseChips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.exerciseChip,
              { backgroundColor: palette.surface },
              selectedExercise === item.id && styles.exerciseChipActive,
            ]}
            onPress={() => setSelectedExercise(item.id)}
          >
            <Text
              style={[
                styles.exerciseChipText,
                { color: palette.textSecondary },
                selectedExercise === item.id && styles.exerciseChipTextActive,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Progress chart (simplified) */}
      {selectedExercise && progressData.length > 0 ? (
        <View style={[styles.chartCard, { backgroundColor: palette.surface }]}>
          <Text style={[styles.chartTitle, { color: palette.textPrimary }]}>
            Weight Progression
          </Text>
          {/* Simple bar chart */}
          <View style={styles.barChart}>
            {progressData.map((point, index) => {
              const maxWeight = Math.max(
                ...progressData.map((p) => p.maxWeight),
              );
              const height =
                maxWeight > 0 ? (point.maxWeight / maxWeight) * 100 : 0;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={[styles.bar, { height: `${height}%` }]} />
                  <Text style={[styles.barLabel, { color: palette.textMuted }]}>
                    {point.maxWeight}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Stats summary */}
          <View
            style={[
              styles.statsSummary,
              { borderTopColor: palette.borderSubtle },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {Math.max(...progressData.map((p) => p.maxWeight))} kg
              </Text>
              <Text
                style={[styles.statLabel, { color: palette.textSecondary }]}
              >
                Best Weight
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {Math.max(...progressData.map((p) => p.maxReps))}
              </Text>
              <Text
                style={[styles.statLabel, { color: palette.textSecondary }]}
              >
                Best Reps
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: palette.textPrimary }]}>
                {Math.max(...progressData.map((p) => p.volume))} kg
              </Text>
              <Text
                style={[styles.statLabel, { color: palette.textSecondary }]}
              >
                Best Volume
              </Text>
            </View>
          </View>
        </View>
      ) : selectedExercise ? (
        <View
          style={[styles.emptyChart, { backgroundColor: palette.surfaceMuted }]}
        >
          <Text
            style={[styles.emptyChartText, { color: palette.textSecondary }]}
          >
            No data yet for this exercise
          </Text>
        </View>
      ) : null}
    </View>
  );

  const renderRecordsTab = () => (
    <FlatList
      data={prsList}
      keyExtractor={(item) => item.exerciseId}
      contentContainerStyle={[
        styles.listContent,
        { paddingBottom: insets.bottom + 100 },
      ]}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
            Complete workouts to track your personal records
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.prCard, { backgroundColor: palette.surface }]}>
          <View style={styles.prHeader}>
            <Feather name="award" size={20} color="#FFD700" />
            <Text style={[styles.prName, { color: palette.textPrimary }]}>
              {item.exerciseName}
            </Text>
          </View>
          <View style={styles.prStats}>
            <View style={styles.prStat}>
              <Text style={styles.prStatValue}>{item.maxWeight} kg</Text>
              <Text
                style={[styles.prStatLabel, { color: palette.textSecondary }]}
              >
                Max Weight
              </Text>
            </View>
            <View style={styles.prStat}>
              <Text style={styles.prStatValue}>{item.maxReps}</Text>
              <Text
                style={[styles.prStatLabel, { color: palette.textSecondary }]}
              >
                Max Reps
              </Text>
            </View>
            <View style={styles.prStat}>
              <Text style={styles.prStatValue}>{item.maxVolume} kg</Text>
              <Text
                style={[styles.prStatLabel, { color: palette.textSecondary }]}
              >
                Max Volume
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );

  const renderBodyTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addMetricButton}
        onPress={onAddBodyMetric}
      >
        <Feather name="plus" size={20} color="#4ECDC4" />
        <Text style={styles.addMetricText}>Add Measurement</Text>
      </TouchableOpacity>

      {bodyMetrics.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
            Track your body measurements to see progress over time
          </Text>
        </View>
      ) : (
        <FlatList
          data={bodyMetrics.slice(0, 10)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View
              style={[styles.metricCard, { backgroundColor: palette.surface }]}
            >
              <Text
                style={[styles.metricDate, { color: palette.textSecondary }]}
              >
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <View style={styles.metricValues}>
                {item.weight && (
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {item.weight} kg
                    </Text>
                    <Text
                      style={[styles.metricLabel, { color: palette.textMuted }]}
                    >
                      Weight
                    </Text>
                  </View>
                )}
                {item.bodyFat && (
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {item.bodyFat}%
                    </Text>
                    <Text
                      style={[styles.metricLabel, { color: palette.textMuted }]}
                    >
                      Body Fat
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.screenPad}>
        <ScreenHeader
          title="Progress"
          subtitle="Track your fitness journey"
          isDarkMode={isDarkMode}
        />
      </View>

      {/* Tab selector */}
      <View style={[styles.tabSelector, { backgroundColor: palette.surface }]}>
        {(["exercises", "records", "body"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: palette.textSecondary },
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "exercises"
                ? "Exercises"
                : tab === "records"
                  ? "Records"
                  : "Body"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {activeTab === "exercises" && renderExercisesTab()}
        {activeTab === "records" && renderRecordsTab()}
        {activeTab === "body" && renderBodyTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenPad: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: 4,
    ...theme.shadow.sm,
  },
  tabSelectorDark: {
    backgroundColor: theme.dark.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: theme.radius.md,
  },
  tabActive: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#4ECDC4",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: "#4ECDC4",
    fontWeight: "700",
  },
  tabTextDark: {
    color: theme.dark.textSecondary,
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  exerciseChips: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  exerciseChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "transparent",
    maxWidth: 150,
  },
  exerciseChipActive: {
    backgroundColor: "transparent",
    borderColor: "#4ECDC4",
  },
  exerciseChipDark: {
    backgroundColor: theme.dark.surface,
  },
  exerciseChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  exerciseChipTextActive: {
    color: "#4ECDC4",
  },
  exerciseChipTextDark: {
    color: theme.dark.textSecondary,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
  },
  chartCardDark: {
    backgroundColor: theme.dark.surface,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  bar: {
    width: "80%",
    backgroundColor: "#4ECDC4",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  statsSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceMuted,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyChart: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  emptyChartDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  emptyChartText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  prCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  prCardDark: {
    backgroundColor: theme.dark.surface,
  },
  prHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  prName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  prStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  prStat: {
    alignItems: "center",
  },
  prStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4ECDC4",
  },
  prStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  textMuted: {
    color: theme.dark.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  addMetricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#4ECDC4",
    borderStyle: "dashed",
  },
  addMetricText: {
    color: "#4ECDC4",
    fontWeight: "600",
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  metricCardDark: {
    backgroundColor: theme.dark.surface,
  },
  metricDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  metricValues: {
    flexDirection: "row",
    gap: theme.spacing.xl,
  },
  metricItem: {},
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});

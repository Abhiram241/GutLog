/**
 * WorkoutDetailScreen.tsx
 *
 * Shows the full details of a completed workout session,
 * including all exercises and every set performed.
 */

import React from "react";
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

import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { WorkoutSession, WorkoutExercise, CompletedSet } from "../../types/gym";
import { setTypeStyles } from "../../constants/gymTheme";
import {
  formatDuration,
  calculateTotalVolume,
  calculateTotalSets,
} from "../../utils/gymHelpers";
import { friendlyDate } from "../../utils/date";

interface WorkoutDetailScreenProps {
  workout: WorkoutSession;
  isDarkMode: boolean;
  onBack: () => void;
}

export function WorkoutDetailScreen({
  workout,
  isDarkMode,
  onBack,
}: WorkoutDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const completedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0,
  );
  const totalSets = calculateTotalSets(workout);
  const totalVolume = calculateTotalVolume(workout);

  const renderSet = (set: CompletedSet, idx: number, unit: string) => {
    const typeStyle = setTypeStyles[set.setType] ?? setTypeStyles["normal"];
    const valueLabel =
      unit === "seconds" ? "s" : unit === "minutes" ? "m" : "reps";

    return (
      <View
        key={set.id}
        style={[
          styles.setRow,
          {
            borderBottomColor:
              palette.borderSubtle ??
              (isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
          },
          !set.completed && styles.setRowSkipped,
        ]}
      >
        <View
          style={[
            styles.setTypeDot,
            { backgroundColor: typeStyle.color + "33" },
          ]}
        >
          <Text style={[styles.setTypeLabel, { color: typeStyle.color }]}>
            {typeStyle.label[0]}
          </Text>
        </View>
        <Text style={[styles.setNum, { color: palette.textMuted }]}>
          Set {idx + 1}
        </Text>
        {set.weight > 0 && (
          <Text style={[styles.setValue, { color: palette.textPrimary }]}>
            {set.weight} kg
          </Text>
        )}
        <Text style={[styles.setValue, { color: palette.textPrimary }]}>
          {set.value} {valueLabel}
        </Text>
        {set.completed ? (
          <Feather
            name="check-circle"
            size={16}
            color="#4ECDC4"
            style={styles.setCheck}
          />
        ) : (
          <Feather
            name="circle"
            size={16}
            color={palette.textMuted}
            style={styles.setCheck}
          />
        )}
      </View>
    );
  };

  const renderExercise = ({
    item,
    index,
  }: {
    item: WorkoutExercise;
    index: number;
  }) => {
    const completedCount = item.sets.filter((s) => s.completed).length;
    return (
      <View style={[styles.exerciseCard, { backgroundColor: palette.surface }]}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseNumBadge}>
            <Text style={styles.exerciseNumText}>{index + 1}</Text>
          </View>
          <View style={styles.exerciseTitleWrap}>
            <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>
              {item.exerciseName}
            </Text>
            <Text style={[styles.exerciseMeta, { color: palette.textMuted }]}>
              {completedCount}/{item.sets.length} sets completed
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.setsContainer,
            {
              borderTopColor:
                palette.borderSubtle ??
                (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
            },
          ]}
        >
          {item.sets.map((set, i) => renderSet(set, i, item.unit))}
        </View>

        {item.notes ? (
          <View
            style={[
              styles.notesRow,
              {
                borderTopColor:
                  palette.borderSubtle ??
                  (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
              },
            ]}
          >
            <Feather name="file-text" size={13} color={palette.textMuted} />
            <Text style={[styles.notesText, { color: palette.textMuted }]}>
              {item.notes}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.surface,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: palette.textPrimary }]}
            numberOfLines={1}
          >
            {workout.routineName}
          </Text>
          <Text style={[styles.headerDate, { color: palette.textMuted }]}>
            {friendlyDate(workout.dateKey)}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Stats bar */}
      <View
        style={[
          styles.statsBar,
          {
            backgroundColor: palette.surface,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <View style={styles.statItem}>
          <Feather name="clock" size={16} color="#4ECDC4" />
          <Text style={[styles.statValue, { color: palette.textPrimary }]}>
            {workout.durationMinutes ? `${workout.durationMinutes} min` : "--"}
          </Text>
          <Text style={[styles.statLabel, { color: palette.textMuted }]}>
            Duration
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: palette.border }]}
        />
        <View style={styles.statItem}>
          <Feather name="layers" size={16} color="#4ECDC4" />
          <Text style={[styles.statValue, { color: palette.textPrimary }]}>
            {completedSets}/{totalSets}
          </Text>
          <Text style={[styles.statLabel, { color: palette.textMuted }]}>
            Sets
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: palette.border }]}
        />
        <View style={styles.statItem}>
          <Feather name="trending-up" size={16} color="#4ECDC4" />
          <Text style={[styles.statValue, { color: palette.textPrimary }]}>
            {totalVolume} kg
          </Text>
          <Text style={[styles.statLabel, { color: palette.textMuted }]}>
            Volume
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: palette.border }]}
        />
        <View style={styles.statItem}>
          <Feather name="activity" size={16} color="#4ECDC4" />
          <Text style={[styles.statValue, { color: palette.textPrimary }]}>
            {workout.exercises.length}
          </Text>
          <Text style={[styles.statLabel, { color: palette.textMuted }]}>
            Exercises
          </Text>
        </View>
      </View>

      {/* Exercise list */}
      <FlatList
        data={workout.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        renderItem={renderExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerDate: {
    fontSize: 12,
    marginTop: 2,
  },

  statsBar: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },

  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  exerciseCard: {
    borderRadius: 16,
    overflow: "hidden",
    ...theme.shadow.sm,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  exerciseNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(78, 205, 196, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseNumText: {
    color: "#4ECDC4",
    fontWeight: "700",
    fontSize: 14,
  },
  exerciseTitleWrap: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "700",
  },
  exerciseMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  setsContainer: {
    borderTopWidth: 1,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  setRowSkipped: {
    opacity: 0.45,
  },
  setTypeDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  setTypeLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  setNum: {
    fontSize: 13,
    width: 44,
  },
  setValue: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  setCheck: {
    marginLeft: "auto",
  },

  notesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  notesText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});

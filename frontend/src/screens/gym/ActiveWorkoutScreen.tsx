/**
 * ActiveWorkoutScreen.tsx
 *
 * Live workout session screen.
 * Tracks sets, weights, reps in real-time with rest timer.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as KeepAwake from "expo-keep-awake";

import { ExerciseCard } from "../../components/gym/ExerciseCard";
import { GymAlert } from "../../components/gym/GymAlert";
import { RestTimer } from "../../components/gym/RestTimer";
import { WorkoutTimer } from "../../components/gym/WorkoutTimer";
import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { useGymAlert } from "../../hooks/useGymAlert";
import { WorkoutSession, CompletedSet, WorkoutExercise } from "../../types/gym";
import {
  createCompletedSet,
  getPreviousWorkoutData,
} from "../../utils/gymHelpers";

interface ActiveWorkoutScreenProps {
  workout: WorkoutSession;
  workoutHistory: Record<string, WorkoutSession[]>;
  keepScreenAwake: boolean;
  autoStartRest: boolean;
  showPreviousWorkout: boolean;
  isDarkMode: boolean;
  onUpdateWorkout: (workout: WorkoutSession) => void;
  onCompleteWorkout: () => void;
  onDiscardWorkout: () => void;
  onBack: () => void;
}

export function ActiveWorkoutScreen({
  workout,
  workoutHistory,
  keepScreenAwake,
  autoStartRest,
  showPreviousWorkout,
  isDarkMode,
  onUpdateWorkout,
  onCompleteWorkout,
  onDiscardWorkout,
  onBack,
}: ActiveWorkoutScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { showAlert, alertProps } = useGymAlert();
  const [expandedExercise, setExpandedExercise] = useState<number>(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);

  useEffect(() => {
    if (keepScreenAwake) {
      KeepAwake.activateKeepAwakeAsync();
    }
    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, [keepScreenAwake]);

  const getPreviousExercise = useCallback(
    (exerciseId: string) => {
      if (!showPreviousWorkout) return null;
      return getPreviousWorkoutData(
        workoutHistory,
        exerciseId,
        workout.dateKey,
      );
    },
    [workoutHistory, workout.dateKey, showPreviousWorkout],
  );

  const handleSetUpdate = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      updates: Partial<CompletedSet>,
    ) => {
      const updatedWorkout = { ...workout };
      const exercise = { ...updatedWorkout.exercises[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], ...updates };
      exercise.sets = sets;
      updatedWorkout.exercises[exerciseIndex] = exercise;
      onUpdateWorkout(updatedWorkout);
    },
    [workout, onUpdateWorkout],
  );

  const handleSetComplete = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const exercise = workout.exercises[exerciseIndex];
      const set = exercise.sets[setIndex];

      const updatedWorkout = { ...workout };
      const updatedExercise = { ...updatedWorkout.exercises[exerciseIndex] };
      const updatedSets = [...updatedExercise.sets];

      updatedSets[setIndex] = {
        ...set,
        completed: !set.completed,
        completedAt: !set.completed ? new Date().toISOString() : undefined,
      };

      updatedExercise.sets = updatedSets;
      updatedWorkout.exercises[exerciseIndex] = updatedExercise;
      onUpdateWorkout(updatedWorkout);

      if (!set.completed && autoStartRest) {
        setRestSeconds(exercise.restSeconds);
        setRestTimerActive(true);
      }
    },
    [workout, onUpdateWorkout, autoStartRest],
  );

  const handleAddSet = useCallback(
    (exerciseIndex: number) => {
      const updatedWorkout = { ...workout };
      const exercise = { ...updatedWorkout.exercises[exerciseIndex] };
      const lastSet = exercise.sets[exercise.sets.length - 1];

      exercise.sets = [
        ...exercise.sets,
        createCompletedSet(
          lastSet?.weight || 0,
          lastSet?.value || 10,
          "normal",
        ),
      ];

      updatedWorkout.exercises[exerciseIndex] = exercise;
      onUpdateWorkout(updatedWorkout);
    },
    [workout, onUpdateWorkout],
  );

  const handleDeleteSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const updatedWorkout = { ...workout };
      const exercise = { ...updatedWorkout.exercises[exerciseIndex] };
      exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
      updatedWorkout.exercises[exerciseIndex] = exercise;
      onUpdateWorkout(updatedWorkout);
    },
    [workout, onUpdateWorkout],
  );

  const handleNotesChange = useCallback(
    (exerciseIndex: number, notes: string) => {
      const updatedWorkout = { ...workout };
      updatedWorkout.exercises[exerciseIndex] = {
        ...updatedWorkout.exercises[exerciseIndex],
        notes,
      };
      onUpdateWorkout(updatedWorkout);
    },
    [workout, onUpdateWorkout],
  );

  const handleRestComplete = useCallback(() => setRestTimerActive(false), []);
  const handleRestSkip = useCallback(() => setRestTimerActive(false), []);
  const handleRestAdjust = useCallback((delta: number) => {
    setRestSeconds((prev) => Math.max(0, prev + delta));
  }, []);

  const confirmDiscard = useCallback(() => {
    showAlert(
      "Discard Workout?",
      "All progress will be lost. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: onDiscardWorkout },
      ],
      "trash-2",
      "#E17055",
    );
  }, [onDiscardWorkout]);

  const confirmFinish = useCallback(() => {
    const completedSets = workout.exercises.reduce(
      (sum, e) => sum + e.sets.filter((s) => s.completed).length,
      0,
    );

    if (completedSets === 0) {
      showAlert(
        "No Sets Completed",
        "Complete at least one set before finishing.",
        [{ text: "OK" }],
        "alert-circle",
        "#FDCB6E",
      );
      return;
    }

    showAlert(
      "Finish Workout?",
      `You completed ${completedSets} set${completedSets !== 1 ? "s" : ""}.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", style: "default", onPress: onCompleteWorkout },
      ],
      "check-circle",
      "#4ECDC4",
    );
  }, [workout, onCompleteWorkout]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.workoutName, { color: palette.textPrimary }]}>
            {workout.routineName}
          </Text>
          <WorkoutTimer startedAt={workout.startedAt} isDarkMode={isDarkMode} />
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={confirmFinish}>
          <Feather name="check" size={20} color="#FFFFFF" />
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer */}
      <RestTimer
        initialSeconds={restSeconds}
        isActive={restTimerActive}
        onComplete={handleRestComplete}
        onSkip={handleRestSkip}
        onAdjust={handleRestAdjust}
        isDarkMode={isDarkMode}
      />

      {/* Exercise list */}
      <FlatList
        data={workout.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        renderItem={({ item, index }) => (
          <ExerciseCard
            exercise={item}
            exerciseIndex={index}
            previousExercise={getPreviousExercise(item.exerciseId)}
            isExpanded={expandedExercise === index}
            isDarkMode={isDarkMode}
            onToggleExpand={() =>
              setExpandedExercise(expandedExercise === index ? -1 : index)
            }
            onSetUpdate={(setIndex, updates) =>
              handleSetUpdate(index, setIndex, updates)
            }
            onSetComplete={(setIndex) => handleSetComplete(index, setIndex)}
            onAddSet={() => handleAddSet(index)}
            onDeleteSet={(setIndex) => handleDeleteSet(index, setIndex)}
            onNotesChange={(notes) => handleNotesChange(index, notes)}
          />
        )}
      />

      {/* Bottom action bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            paddingBottom: insets.bottom + theme.spacing.md,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => {
            setRestSeconds(90);
            setRestTimerActive(true);
          }}
        >
          <Feather name="clock" size={20} color="#4ECDC4" />
          <Text style={styles.timerButtonText}>Start Timer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.discardButton} onPress={confirmDiscard}>
          <Feather name="trash-2" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <GymAlert {...alertProps} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "700",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
  },
  finishText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
  },
  timerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "#4ECDC4",
  },
  timerButtonText: {
    color: "#4ECDC4",
    fontWeight: "600",
  },
  discardButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
});

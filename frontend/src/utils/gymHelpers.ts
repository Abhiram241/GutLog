/**
 * gymHelpers.ts
 *
 * Utility functions for Gym Tracker.
 * Includes ID generation, formatters, and calculation helpers.
 */

import {
  Routine,
  RoutineExercise,
  RoutineSet,
  WorkoutSession,
  WorkoutExercise,
  CompletedSet,
  Exercise,
  MuscleGroup,
  ExerciseUnit,
  SetType,
} from '../types/gym';

// ─── ID Generation ────────────────────────────────────────────────────────────

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ─── Time Formatting ──────────────────────────────────────────────────────────

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatRestTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

// ─── Exercise Creation ────────────────────────────────────────────────────────

export const createExercise = (
  name: string,
  unit: ExerciseUnit,
  muscleGroups: MuscleGroup[] = ['other'],
  notes?: string
): Exercise => ({
  id: generateId(),
  name: name.trim(),
  muscleGroups,
  unit,
  notes,
  createdAt: new Date().toISOString(),
});

// ─── Routine Creation ─────────────────────────────────────────────────────────

export const createEmptyRoutine = (name: string = 'New Routine'): Routine => ({
  id: generateId(),
  name,
  exercises: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createRoutineExercise = (
  exerciseId: string,
  exerciseName: string,
  unit: ExerciseUnit,
  restSeconds: number = 90
): RoutineExercise => ({
  id: generateId(),
  exerciseId,
  exerciseName,
  unit,
  sets: [createRoutineSet()],
  restSeconds,
});

export const createRoutineSet = (
  targetWeight: number = 0,
  targetValue: number = 10,
  setType: SetType = 'normal'
): RoutineSet => ({
  id: generateId(),
  targetWeight,
  targetValue,
  setType,
});

// ─── Workout Session Creation ─────────────────────────────────────────────────

export const createWorkoutFromRoutine = (
  routine: Routine,
  dateKey: string
): WorkoutSession => {
  const exercises: WorkoutExercise[] = routine.exercises.map((re) => ({
    id: generateId(),
    exerciseId: re.exerciseId,
    exerciseName: re.exerciseName,
    unit: re.unit,
    sets: re.sets.map((s) => ({
      id: generateId(),
      weight: s.targetWeight,
      value: s.targetValue,
      setType: s.setType,
      completed: false,
    })),
    notes: re.notes,
    restSeconds: re.restSeconds,
  }));

  return {
    id: generateId(),
    routineId: routine.id,
    routineName: routine.name,
    dateKey,
    startedAt: new Date().toISOString(),
    exercises,
  };
};

export const createCompletedSet = (
  weight: number = 0,
  value: number = 0,
  setType: SetType = 'normal'
): CompletedSet => ({
  id: generateId(),
  weight,
  value,
  setType,
  completed: false,
});

// ─── Workout Calculations ─────────────────────────────────────────────────────

export const calculateTotalVolume = (workout: WorkoutSession): number => {
  return workout.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets
        .filter((s) => s.completed && exercise.unit === 'reps')
        .reduce((sum, set) => sum + set.weight * set.value, 0)
    );
  }, 0);
};

export const calculateTotalSets = (workout: WorkoutSession): number => {
  return workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((s) => s.completed).length,
    0
  );
};

export const calculateCompletionPercentage = (workout: WorkoutSession): number => {
  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const completedSets = workout.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0
  );
  return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
};

// ─── Progress Calculations ────────────────────────────────────────────────────

export const getExerciseProgressData = (
  workoutHistory: Record<string, WorkoutSession[]>,
  exerciseId: string,
  limit: number = 10
): Array<{ date: string; maxWeight: number; maxReps: number; volume: number }> => {
  const dataPoints: Array<{
    date: string;
    maxWeight: number;
    maxReps: number;
    volume: number;
  }> = [];

  // Get all dates sorted
  const dates = Object.keys(workoutHistory).sort();

  for (const dateKey of dates) {
    const sessions = workoutHistory[dateKey];
    for (const session of sessions) {
      const exercise = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise) {
        const completedSets = exercise.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map((s) => s.weight));
          const maxReps = Math.max(...completedSets.map((s) => s.value));
          const volume = completedSets.reduce((sum, s) => sum + s.weight * s.value, 0);
          dataPoints.push({ date: dateKey, maxWeight, maxReps, volume });
        }
      }
    }
  }

  return dataPoints.slice(-limit);
};

// ─── Muscle Group Helpers ─────────────────────────────────────────────────────

export const getMuscleGroupLabel = (group: MuscleGroup): string => {
  const labels: Record<MuscleGroup, string> = {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    biceps: 'Biceps',
    triceps: 'Triceps',
    forearms: 'Forearms',
    core: 'Core',
    quads: 'Quads',
    hamstrings: 'Hamstrings',
    glutes: 'Glutes',
    calves: 'Calves',
    full_body: 'Full Body',
    cardio: 'Cardio',
    other: 'Other',
  };
  return labels[group] || group;
};

export const getMuscleGroupsFromWorkout = (
  workout: WorkoutSession,
  exercises: Exercise[]
): MuscleGroup[] => {
  const groups = new Set<MuscleGroup>();
  workout.exercises.forEach((we) => {
    const exercise = exercises.find((e) => e.id === we.exerciseId);
    if (exercise) {
      exercise.muscleGroups.forEach((g) => groups.add(g));
    }
  });
  return Array.from(groups);
};

// ─── Previous Workout Helpers ─────────────────────────────────────────────────

export const getPreviousWorkoutData = (
  workoutHistory: Record<string, WorkoutSession[]>,
  exerciseId: string,
  currentDateKey: string
): WorkoutExercise | null => {
  const dates = Object.keys(workoutHistory)
    .filter((d) => d < currentDateKey)
    .sort()
    .reverse();

  for (const dateKey of dates) {
    const sessions = workoutHistory[dateKey];
    for (const session of sessions) {
      const exercise = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (exercise && exercise.sets.some((s) => s.completed)) {
        return exercise;
      }
    }
  }

  return null;
};

// ─── Warm-up Suggestions ──────────────────────────────────────────────────────

export const suggestWarmupSets = (
  workingWeight: number
): Array<{ weight: number; reps: number }> => {
  if (workingWeight <= 20) {
    return [{ weight: 0, reps: 15 }];
  }

  const warmups = [];
  // 50% for 10 reps
  warmups.push({ weight: Math.round(workingWeight * 0.5 / 2.5) * 2.5, reps: 10 });
  // 70% for 5 reps
  warmups.push({ weight: Math.round(workingWeight * 0.7 / 2.5) * 2.5, reps: 5 });
  // 85% for 3 reps
  warmups.push({ weight: Math.round(workingWeight * 0.85 / 2.5) * 2.5, reps: 3 });

  return warmups.filter((w) => w.weight > 0);
};

// ─── Plate Calculator ─────────────────────────────────────────────────────────

export const calculatePlates = (
  targetWeight: number,
  barWeight: number = 20,
  availablePlates: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]
): number[] => {
  const weightPerSide = (targetWeight - barWeight) / 2;
  if (weightPerSide <= 0) return [];

  const plates: number[] = [];
  let remaining = weightPerSide;

  for (const plate of availablePlates) {
    while (remaining >= plate) {
      plates.push(plate);
      remaining -= plate;
    }
  }

  return plates;
};

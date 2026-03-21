/**
 * useGymData.ts
 *
 * Central data hook for Gym Tracker.
 * Manages all gym-related state: exercises, routines, workouts, PRs, settings.
 */

import { useCallback, useEffect, useState } from "react";

import {
  Exercise,
  Routine,
  RoutineFolder,
  WorkoutSession,
  PersonalRecord,
  BodyMetricEntry,
  GymSettings,
} from "../types/gym";
import {
  getExercises,
  saveExercises,
  getRoutines,
  saveRoutines,
  getFolders,
  saveFolders,
  getAllWorkoutHistory,
  saveWorkoutsByDate,
  addWorkoutSession as addWorkoutToStorage,
  updateWorkoutSession as updateWorkoutInStorage,
  getPersonalRecords,
  savePersonalRecords,
  getBodyMetrics,
  saveBodyMetrics,
  getGymSettings,
  saveGymSettings,
  getActiveWorkout,
  saveActiveWorkout,
  defaultGymSettings,
  seedPresetExercisesIfNeeded,
} from "../services/gymStorageService";
import { getTodayDateKey } from "../utils/date";

export function useGymData() {
  const todayKey = getTodayDateKey();

  // ─── Loading State ──────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ─── Data State ─────────────────────────────────────────────────────────────
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [folders, setFolders] = useState<RoutineFolder[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<
    Record<string, WorkoutSession[]>
  >({});
  const [personalRecords, setPersonalRecords] = useState<
    Record<string, PersonalRecord>
  >({});
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>([]);
  const [gymSettings, setGymSettingsState] =
    useState<GymSettings>(defaultGymSettings);
  const [activeWorkout, setActiveWorkoutState] =
    useState<WorkoutSession | null>(null);

  // ─── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Seed preset exercises on first launch
        await seedPresetExercisesIfNeeded();

        const [
          storedExercises,
          storedRoutines,
          storedFolders,
          storedHistory,
          storedPRs,
          storedMetrics,
          storedSettings,
          storedActiveWorkout,
        ] = await Promise.all([
          getExercises(),
          getRoutines(),
          getFolders(),
          getAllWorkoutHistory(),
          getPersonalRecords(),
          getBodyMetrics(),
          getGymSettings(),
          getActiveWorkout(),
        ]);

        setExercises(storedExercises);
        setRoutines(storedRoutines);
        setFolders(storedFolders);
        setWorkoutHistory(storedHistory);
        setPersonalRecords(storedPRs);
        setBodyMetrics(storedMetrics);
        setGymSettingsState(storedSettings);
        setActiveWorkoutState(storedActiveWorkout);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  // ─── Exercise Handlers ──────────────────────────────────────────────────────
  const addExercise = useCallback(async (exercise: Exercise) => {
    setExercises((prev) => {
      const next = [...prev, exercise];
      void saveExercises(next);
      return next;
    });
  }, []);

  const updateExercise = useCallback(async (exercise: Exercise) => {
    setExercises((prev) => {
      const next = prev.map((e) => (e.id === exercise.id ? exercise : e));
      void saveExercises(next);
      return next;
    });
  }, []);

  const deleteExercise = useCallback(async (exerciseId: string) => {
    setExercises((prev) => {
      const next = prev.filter((e) => e.id !== exerciseId);
      void saveExercises(next);
      return next;
    });
  }, []);

  // ─── Routine Handlers ───────────────────────────────────────────────────────
  const addRoutine = useCallback(async (routine: Routine) => {
    setRoutines((prev) => {
      const next = [...prev, routine];
      void saveRoutines(next);
      return next;
    });
  }, []);

  const updateRoutine = useCallback(async (routine: Routine) => {
    setRoutines((prev) => {
      const next = prev.map((r) => (r.id === routine.id ? routine : r));
      void saveRoutines(next);
      return next;
    });
  }, []);

  const deleteRoutine = useCallback(async (routineId: string) => {
    setRoutines((prev) => {
      const next = prev.filter((r) => r.id !== routineId);
      void saveRoutines(next);
      return next;
    });
  }, []);

  // ─── Folder Handlers ────────────────────────────────────────────────────────
  const addFolder = useCallback(async (folder: RoutineFolder) => {
    setFolders((prev) => {
      const next = [...prev, folder];
      void saveFolders(next);
      return next;
    });
  }, []);

  const updateFolder = useCallback(async (folder: RoutineFolder) => {
    setFolders((prev) => {
      const next = prev.map((f) => (f.id === folder.id ? folder : f));
      void saveFolders(next);
      return next;
    });
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    setFolders((prev) => {
      const next = prev.filter((f) => f.id !== folderId);
      void saveFolders(next);
      return next;
    });
    // Unassign routines from deleted folder
    setRoutines((prev) => {
      const next = prev.map((r) =>
        r.folderId === folderId ? { ...r, folderId: undefined } : r,
      );
      void saveRoutines(next);
      return next;
    });
  }, []);

  // ─── Workout Session Handlers ───────────────────────────────────────────────
  const addWorkoutSession = useCallback(async (workout: WorkoutSession) => {
    setWorkoutHistory((prev) => {
      const dateWorkouts = prev[workout.dateKey] || [];
      const next = {
        ...prev,
        [workout.dateKey]: [...dateWorkouts, workout],
      };
      void saveWorkoutsByDate(workout.dateKey, next[workout.dateKey]);
      return next;
    });
  }, []);

  const updateWorkoutSession = useCallback(async (workout: WorkoutSession) => {
    setWorkoutHistory((prev) => {
      const dateWorkouts = prev[workout.dateKey] || [];
      const next = {
        ...prev,
        [workout.dateKey]: dateWorkouts.map((w) =>
          w.id === workout.id ? workout : w,
        ),
      };
      void saveWorkoutsByDate(workout.dateKey, next[workout.dateKey]);
      return next;
    });
  }, []);

  // ─── Active Workout Handlers ────────────────────────────────────────────────
  const setActiveWorkout = useCallback(
    async (workout: WorkoutSession | null) => {
      setActiveWorkoutState(workout);
      await saveActiveWorkout(workout);
    },
    [],
  );

  // ─── Personal Records Handlers ──────────────────────────────────────────────
  const checkAndUpdatePR = useCallback(
    async (
      exerciseId: string,
      exerciseName: string,
      weight: number,
      value: number,
      dateKey: string,
    ): Promise<{
      isNewPR: boolean;
      prType: "weight" | "reps" | "volume" | null;
    }> => {
      const volume = weight * value;
      const current = personalRecords[exerciseId];

      let isNewPR = false;
      let prType: "weight" | "reps" | "volume" | null = null;

      const updated: PersonalRecord = current
        ? { ...current }
        : {
            exerciseId,
            exerciseName,
            maxWeight: 0,
            maxWeightDate: "",
            maxReps: 0,
            maxRepsDate: "",
            maxVolume: 0,
            maxVolumeDate: "",
          };

      if (weight > updated.maxWeight) {
        updated.maxWeight = weight;
        updated.maxWeightDate = dateKey;
        isNewPR = true;
        prType = "weight";
      }

      if (value > updated.maxReps) {
        updated.maxReps = value;
        updated.maxRepsDate = dateKey;
        isNewPR = true;
        prType = prType ? "volume" : "reps";
      }

      if (volume > updated.maxVolume) {
        updated.maxVolume = volume;
        updated.maxVolumeDate = dateKey;
        isNewPR = true;
        if (!prType) prType = "volume";
      }

      if (isNewPR) {
        setPersonalRecords((prev) => {
          const next = { ...prev, [exerciseId]: updated };
          void savePersonalRecords(next);
          return next;
        });
      }

      return { isNewPR, prType };
    },
    [personalRecords],
  );

  // ─── Body Metrics Handlers ──────────────────────────────────────────────────
  const addBodyMetric = useCallback(async (metric: BodyMetricEntry) => {
    setBodyMetrics((prev) => {
      const next = [...prev, metric].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      void saveBodyMetrics(next);
      return next;
    });
  }, []);

  const updateBodyMetric = useCallback(async (metric: BodyMetricEntry) => {
    setBodyMetrics((prev) => {
      const next = prev.map((m) => (m.id === metric.id ? metric : m));
      void saveBodyMetrics(next);
      return next;
    });
  }, []);

  const deleteBodyMetric = useCallback(async (metricId: string) => {
    setBodyMetrics((prev) => {
      const next = prev.filter((m) => m.id !== metricId);
      void saveBodyMetrics(next);
      return next;
    });
  }, []);

  // ─── Settings Handlers ──────────────────────────────────────────────────────
  const updateGymSettings = useCallback(async (settings: GymSettings) => {
    setGymSettingsState(settings);
    await saveGymSettings(settings);
  }, []);

  // ─── Reload All Data ────────────────────────────────────────────────────────
  const reloadAllGymData = useCallback(async () => {
    const [
      storedExercises,
      storedRoutines,
      storedFolders,
      storedHistory,
      storedPRs,
      storedMetrics,
      storedSettings,
    ] = await Promise.all([
      getExercises(),
      getRoutines(),
      getFolders(),
      getAllWorkoutHistory(),
      getPersonalRecords(),
      getBodyMetrics(),
      getGymSettings(),
    ]);

    setExercises(storedExercises);
    setRoutines(storedRoutines);
    setFolders(storedFolders);
    setWorkoutHistory(storedHistory);
    setPersonalRecords(storedPRs);
    setBodyMetrics(storedMetrics);
    setGymSettingsState(storedSettings);
  }, []);

  return {
    isLoading,
    todayKey,
    // Data
    exercises,
    routines,
    folders,
    workoutHistory,
    personalRecords,
    bodyMetrics,
    gymSettings,
    activeWorkout,
    // Exercise actions
    addExercise,
    updateExercise,
    deleteExercise,
    // Routine actions
    addRoutine,
    updateRoutine,
    deleteRoutine,
    // Folder actions
    addFolder,
    updateFolder,
    deleteFolder,
    // Workout actions
    addWorkoutSession,
    updateWorkoutSession,
    setActiveWorkout,
    // PR actions
    checkAndUpdatePR,
    // Body metrics actions
    addBodyMetric,
    updateBodyMetric,
    deleteBodyMetric,
    // Settings actions
    updateGymSettings,
    // Utility
    reloadAllGymData,
  };
}

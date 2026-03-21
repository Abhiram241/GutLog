/**
 * gymStorageService.ts
 *
 * Centralized storage service for Gym Tracker data.
 * Handles all AsyncStorage operations for gym-related data.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  Exercise,
  Routine,
  RoutineFolder,
  WorkoutSession,
  PersonalRecord,
  BodyMetricEntry,
  GymSettings,
  GymBackupPayload,
} from "../types/gym";
import { PRESET_EXERCISES } from "../constants/presetExercises";
import { generateId } from "../utils/gymHelpers";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  GYM_MODE: "gym_tracker_mode_enabled",
  EXERCISES: "gym_exercises_v1",
  ROUTINES: "gym_routines_v1",
  FOLDERS: "gym_folders_v1",
  WORKOUT_PREFIX: "gym_workout_",
  PERSONAL_RECORDS: "gym_personal_records_v1",
  BODY_METRICS: "gym_body_metrics_v1",
  GYM_SETTINGS: "gym_settings_v1",
  ACTIVE_WORKOUT: "gym_active_workout_v1",
  PRESETS_SEEDED: "gym_presets_seeded_v1",
};

// ─── Default Values ───────────────────────────────────────────────────────────

export const defaultGymSettings: GymSettings = {
  defaultRestSeconds: 90,
  autoStartRest: true,
  keepScreenAwake: true,
  showPreviousWorkout: true,
  weightUnit: "kg",
  gymTheme: "warm",
};

// ─── Fallback Storage ─────────────────────────────────────────────────────────

const memoryStore: Record<string, string> = {};

const canUseWebStorage = () =>
  Platform.OS === "web" && typeof globalThis?.localStorage !== "undefined";

const fallbackGetItem = (key: string) => {
  if (canUseWebStorage()) return globalThis.localStorage.getItem(key);
  return memoryStore[key] ?? null;
};

const fallbackSetItem = (key: string, value: string) => {
  if (canUseWebStorage()) {
    globalThis.localStorage.setItem(key, value);
    return;
  }
  memoryStore[key] = value;
};

// ─── Safe Wrappers ────────────────────────────────────────────────────────────

const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return fallbackGetItem(key);
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    fallbackSetItem(key, value);
  }
};

const safeGetAllKeys = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch {
    if (canUseWebStorage()) return Object.keys(globalThis.localStorage);
    return Object.keys(memoryStore);
  }
};

// ─── Gym Mode ─────────────────────────────────────────────────────────────────

export const getGymModeEnabled = async (): Promise<boolean> => {
  const raw = await safeGetItem(KEYS.GYM_MODE);
  return raw === "true";
};

export const setGymModeEnabled = async (enabled: boolean): Promise<void> => {
  await safeSetItem(KEYS.GYM_MODE, String(enabled));
};

// ─── Exercises ────────────────────────────────────────────────────────────────

export const getExercises = async (): Promise<Exercise[]> => {
  const raw = await safeGetItem(KEYS.EXERCISES);
  if (!raw) return [];
  return JSON.parse(raw) as Exercise[];
};

export const saveExercises = async (exercises: Exercise[]): Promise<void> => {
  await safeSetItem(KEYS.EXERCISES, JSON.stringify(exercises));
};

export const addExercise = async (exercise: Exercise): Promise<void> => {
  const exercises = await getExercises();
  exercises.push(exercise);
  await saveExercises(exercises);
};

export const updateExercise = async (exercise: Exercise): Promise<void> => {
  const exercises = await getExercises();
  const index = exercises.findIndex((e) => e.id === exercise.id);
  if (index !== -1) {
    exercises[index] = exercise;
    await saveExercises(exercises);
  }
};

export const deleteExercise = async (exerciseId: string): Promise<void> => {
  const exercises = await getExercises();
  await saveExercises(exercises.filter((e) => e.id !== exerciseId));
};

// ─── Routines ─────────────────────────────────────────────────────────────────

export const getRoutines = async (): Promise<Routine[]> => {
  const raw = await safeGetItem(KEYS.ROUTINES);
  if (!raw) return [];
  return JSON.parse(raw) as Routine[];
};

export const saveRoutines = async (routines: Routine[]): Promise<void> => {
  await safeSetItem(KEYS.ROUTINES, JSON.stringify(routines));
};

export const addRoutine = async (routine: Routine): Promise<void> => {
  const routines = await getRoutines();
  routines.push(routine);
  await saveRoutines(routines);
};

export const updateRoutine = async (routine: Routine): Promise<void> => {
  const routines = await getRoutines();
  const index = routines.findIndex((r) => r.id === routine.id);
  if (index !== -1) {
    routines[index] = routine;
    await saveRoutines(routines);
  }
};

export const deleteRoutine = async (routineId: string): Promise<void> => {
  const routines = await getRoutines();
  await saveRoutines(routines.filter((r) => r.id !== routineId));
};

// ─── Folders ──────────────────────────────────────────────────────────────────

export const getFolders = async (): Promise<RoutineFolder[]> => {
  const raw = await safeGetItem(KEYS.FOLDERS);
  if (!raw) return [];
  return JSON.parse(raw) as RoutineFolder[];
};

export const saveFolders = async (folders: RoutineFolder[]): Promise<void> => {
  await safeSetItem(KEYS.FOLDERS, JSON.stringify(folders));
};

// ─── Workout History ──────────────────────────────────────────────────────────

export const getWorkoutsByDate = async (
  dateKey: string,
): Promise<WorkoutSession[]> => {
  const raw = await safeGetItem(`${KEYS.WORKOUT_PREFIX}${dateKey}`);
  if (!raw) return [];
  return JSON.parse(raw) as WorkoutSession[];
};

export const saveWorkoutsByDate = async (
  dateKey: string,
  workouts: WorkoutSession[],
): Promise<void> => {
  await safeSetItem(
    `${KEYS.WORKOUT_PREFIX}${dateKey}`,
    JSON.stringify(workouts),
  );
};

export const addWorkoutSession = async (
  workout: WorkoutSession,
): Promise<void> => {
  const workouts = await getWorkoutsByDate(workout.dateKey);
  workouts.push(workout);
  await saveWorkoutsByDate(workout.dateKey, workouts);
};

export const updateWorkoutSession = async (
  workout: WorkoutSession,
): Promise<void> => {
  const workouts = await getWorkoutsByDate(workout.dateKey);
  const index = workouts.findIndex((w) => w.id === workout.id);
  if (index !== -1) {
    workouts[index] = workout;
    await saveWorkoutsByDate(workout.dateKey, workouts);
  }
};

export const getAllWorkoutHistory = async (): Promise<
  Record<string, WorkoutSession[]>
> => {
  const keys = await safeGetAllKeys();
  const workoutKeys = keys.filter((key) => key.startsWith(KEYS.WORKOUT_PREFIX));

  const result: Record<string, WorkoutSession[]> = {};

  await Promise.all(
    workoutKeys.map(async (key) => {
      const dateKey = key.replace(KEYS.WORKOUT_PREFIX, "");
      const raw = await safeGetItem(key);
      if (raw) {
        result[dateKey] = JSON.parse(raw) as WorkoutSession[];
      }
    }),
  );

  return result;
};

// ─── Personal Records ─────────────────────────────────────────────────────────

export const getPersonalRecords = async (): Promise<
  Record<string, PersonalRecord>
> => {
  const raw = await safeGetItem(KEYS.PERSONAL_RECORDS);
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, PersonalRecord>;
};

export const savePersonalRecords = async (
  records: Record<string, PersonalRecord>,
): Promise<void> => {
  await safeSetItem(KEYS.PERSONAL_RECORDS, JSON.stringify(records));
};

export const updatePersonalRecord = async (
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  dateKey: string,
): Promise<{
  isNewPR: boolean;
  prType: "weight" | "reps" | "volume" | null;
}> => {
  const records = await getPersonalRecords();
  const volume = weight * reps;

  const current = records[exerciseId] || {
    exerciseId,
    exerciseName,
    maxWeight: 0,
    maxWeightDate: "",
    maxReps: 0,
    maxRepsDate: "",
    maxVolume: 0,
    maxVolumeDate: "",
  };

  let isNewPR = false;
  let prType: "weight" | "reps" | "volume" | null = null;

  if (weight > current.maxWeight) {
    current.maxWeight = weight;
    current.maxWeightDate = dateKey;
    isNewPR = true;
    prType = "weight";
  }

  if (reps > current.maxReps) {
    current.maxReps = reps;
    current.maxRepsDate = dateKey;
    isNewPR = true;
    prType = prType ? "volume" : "reps"; // If both, it's likely volume PR
  }

  if (volume > current.maxVolume) {
    current.maxVolume = volume;
    current.maxVolumeDate = dateKey;
    isNewPR = true;
    if (!prType) prType = "volume";
  }

  if (isNewPR) {
    records[exerciseId] = current;
    await savePersonalRecords(records);
  }

  return { isNewPR, prType };
};

// ─── Body Metrics ─────────────────────────────────────────────────────────────

export const getBodyMetrics = async (): Promise<BodyMetricEntry[]> => {
  const raw = await safeGetItem(KEYS.BODY_METRICS);
  if (!raw) return [];
  return JSON.parse(raw) as BodyMetricEntry[];
};

export const saveBodyMetrics = async (
  metrics: BodyMetricEntry[],
): Promise<void> => {
  await safeSetItem(KEYS.BODY_METRICS, JSON.stringify(metrics));
};

export const addBodyMetric = async (metric: BodyMetricEntry): Promise<void> => {
  const metrics = await getBodyMetrics();
  metrics.push(metric);
  // Sort by date descending
  metrics.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  await saveBodyMetrics(metrics);
};

// ─── Gym Settings ─────────────────────────────────────────────────────────────

export const getGymSettings = async (): Promise<GymSettings> => {
  const raw = await safeGetItem(KEYS.GYM_SETTINGS);
  if (!raw) return defaultGymSettings;
  const parsed = JSON.parse(raw) as Partial<GymSettings>;
  return { ...defaultGymSettings, ...parsed };
};

export const saveGymSettings = async (settings: GymSettings): Promise<void> => {
  await safeSetItem(KEYS.GYM_SETTINGS, JSON.stringify(settings));
};

// ─── Active Workout (for crash recovery) ──────────────────────────────────────

export const getActiveWorkout = async (): Promise<WorkoutSession | null> => {
  const raw = await safeGetItem(KEYS.ACTIVE_WORKOUT);
  if (!raw) return null;
  return JSON.parse(raw) as WorkoutSession;
};

export const saveActiveWorkout = async (
  workout: WorkoutSession | null,
): Promise<void> => {
  if (workout) {
    await safeSetItem(KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  } else {
    await AsyncStorage.removeItem(KEYS.ACTIVE_WORKOUT).catch(() => {});
  }
};

// ─── Full Backup Export ───────────────────────────────────────────────────────

export const buildGymBackupPayload = async (): Promise<GymBackupPayload> => {
  const [
    exercises,
    routines,
    folders,
    workoutHistory,
    personalRecords,
    bodyMetrics,
    gymSettings,
  ] = await Promise.all([
    getExercises(),
    getRoutines(),
    getFolders(),
    getAllWorkoutHistory(),
    getPersonalRecords(),
    getBodyMetrics(),
    getGymSettings(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    routines,
    folders,
    workoutHistory,
    personalRecords,
    bodyMetrics,
    gymSettings,
  };
};

// ─── Full Backup Import ───────────────────────────────────────────────────────

export const restoreGymBackup = async (
  payload: GymBackupPayload,
): Promise<void> => {
  if (payload.version !== 1) {
    throw new Error("Unsupported backup version");
  }

  await Promise.all([
    saveExercises(payload.exercises || []),
    saveRoutines(payload.routines || []),
    saveFolders(payload.folders || []),
    savePersonalRecords(payload.personalRecords || {}),
    saveBodyMetrics(payload.bodyMetrics || []),
    saveGymSettings(payload.gymSettings || defaultGymSettings),
  ]);

  // Save workout history by date
  if (payload.workoutHistory) {
    await Promise.all(
      Object.entries(payload.workoutHistory).map(([dateKey, workouts]) =>
        saveWorkoutsByDate(dateKey, workouts),
      ),
    );
  }
};

// ─── Preset Exercise Seeding ──────────────────────────────────────────────────

export const seedPresetExercisesIfNeeded = async (): Promise<void> => {
  const seeded = await safeGetItem(KEYS.PRESETS_SEEDED);
  if (seeded === "true") return;

  const existing = await getExercises();
  if (existing.length > 0) {
    // User already has exercises — mark as seeded without overwriting
    await safeSetItem(KEYS.PRESETS_SEEDED, "true");
    return;
  }

  const now = new Date().toISOString();
  const presets: Exercise[] = PRESET_EXERCISES.map((p) => ({
    ...p,
    id: generateId(),
    createdAt: now,
  }));

  await saveExercises(presets);
  await safeSetItem(KEYS.PRESETS_SEEDED, "true");
};

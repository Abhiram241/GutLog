/**
 * gym.ts
 *
 * Type definitions for the Gym Tracker feature.
 * Defines all data structures for exercises, routines, workouts, and analytics.
 */

// ─── Exercise Types ───────────────────────────────────────────────────────────

/** Unit type for tracking exercise performance */
export type ExerciseUnit = 'reps' | 'seconds' | 'minutes';

/** Set type classification */
export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

/** Muscle groups for categorization */
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'cardio'
  | 'other';

/** User-created exercise definition */
export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  unit: ExerciseUnit;
  notes?: string;
  createdAt: string;
}

// ─── Set & Exercise in Routine ────────────────────────────────────────────────

/** A single set configuration in a routine */
export interface RoutineSet {
  id: string;
  targetWeight: number;
  targetValue: number; // reps or time based on unit
  setType: SetType;
}

/** An exercise within a routine with its sets */
export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  unit: ExerciseUnit;
  sets: RoutineSet[];
  notes?: string;
  restSeconds: number; // Rest time after each set
}

// ─── Routine ──────────────────────────────────────────────────────────────────

/** A workout routine/template */
export interface Routine {
  id: string;
  name: string;
  folderId?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

/** Folder for organizing routines */
export interface RoutineFolder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// ─── Workout Session ──────────────────────────────────────────────────────────

/** A completed set during a workout session */
export interface CompletedSet {
  id: string;
  weight: number;
  value: number; // reps or time
  setType: SetType;
  completed: boolean;
  completedAt?: string;
  isPR?: boolean;
}

/** An exercise being tracked in a workout session */
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  unit: ExerciseUnit;
  sets: CompletedSet[];
  notes?: string;
  restSeconds: number;
}

/** A single workout session */
export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  dateKey: string; // YYYY-MM-DD format
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExercise[];
  notes?: string;
  durationMinutes?: number;
  aiFeedback?: WorkoutAIFeedback;
}

// ─── Analytics & PRs ──────────────────────────────────────────────────────────

/** Personal record for an exercise */
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxWeightDate: string;
  maxReps: number;
  maxRepsDate: string;
  maxVolume: number; // weight × reps
  maxVolumeDate: string;
}

/** AI-generated feedback after workout */
export interface WorkoutAIFeedback {
  summary: string;
  performanceRating: 'excellent' | 'good' | 'average' | 'needs_improvement';
  highlights: string[];
  suggestions: string[];
  muscleGroupsWorked: MuscleGroup[];
  estimatedCalories?: number;
  generatedAt: string;
}

// ─── Body Metrics ─────────────────────────────────────────────────────────────

/** Body measurement entry */
export interface BodyMetricEntry {
  id: string;
  date: string;
  weight?: number; // kg
  bodyFat?: number; // percentage
  chest?: number; // cm
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  notes?: string;
}

// ─── Gym Settings ─────────────────────────────────────────────────────────────

/** Gym-specific settings */
export interface GymSettings {
  defaultRestSeconds: number;
  autoStartRest: boolean;
  keepScreenAwake: boolean;
  showPreviousWorkout: boolean;
  weightUnit: 'kg' | 'lbs';
  gymTheme: 'warm' | 'energetic' | 'dark';
}

// ─── Storage Structure ────────────────────────────────────────────────────────

/** Complete gym data structure for backup/restore */
export interface GymBackupPayload {
  version: 1;
  exportedAt: string;
  exercises: Exercise[];
  routines: Routine[];
  folders: RoutineFolder[];
  workoutHistory: Record<string, WorkoutSession[]>; // dateKey -> sessions
  personalRecords: Record<string, PersonalRecord>; // exerciseId -> PR
  bodyMetrics: BodyMetricEntry[];
  gymSettings: GymSettings;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

/** Gym navigation tabs */
export type GymTab = 'workout' | 'routines' | 'history' | 'progress' | 'settings';

/** Active workout state */
export interface ActiveWorkoutState {
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  workoutDuration: number;
}

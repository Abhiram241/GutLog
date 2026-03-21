/**
 * presetExercises.ts
 *
 * Built-in preset exercises loaded on first launch.
 * Tagged with all relevant muscle groups.
 */

import { Exercise } from "../types/gym";

export const PRESET_EXERCISES: Omit<Exercise, "id" | "createdAt">[] = [
  // ── Chest ──────────────────────────────────────────────────────────────────
  {
    name: "Barbell Bench Press",
    muscleGroups: ["chest", "triceps", "shoulders"],
    unit: "reps",
  },
  {
    name: "Incline Barbell Press",
    muscleGroups: ["chest", "shoulders", "triceps"],
    unit: "reps",
  },
  {
    name: "Decline Barbell Press",
    muscleGroups: ["chest", "triceps"],
    unit: "reps",
  },
  {
    name: "Dumbbell Bench Press",
    muscleGroups: ["chest", "triceps", "shoulders"],
    unit: "reps",
  },
  {
    name: "Incline Dumbbell Press",
    muscleGroups: ["chest", "shoulders"],
    unit: "reps",
  },
  { name: "Dumbbell Flyes", muscleGroups: ["chest"], unit: "reps" },
  { name: "Cable Crossover", muscleGroups: ["chest"], unit: "reps" },
  {
    name: "Push-Up",
    muscleGroups: ["chest", "triceps", "shoulders"],
    unit: "reps",
  },
  { name: "Chest Dip", muscleGroups: ["chest", "triceps"], unit: "reps" },
  { name: "Pec Deck Machine", muscleGroups: ["chest"], unit: "reps" },

  // ── Back ───────────────────────────────────────────────────────────────────
  {
    name: "Deadlift",
    muscleGroups: ["back", "glutes", "hamstrings", "core"],
    unit: "reps",
  },
  {
    name: "Romanian Deadlift",
    muscleGroups: ["back", "hamstrings", "glutes"],
    unit: "reps",
  },
  { name: "Barbell Row", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "Dumbbell Row", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "Pull-Up", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "Chin-Up", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "Lat Pulldown", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "Seated Cable Row", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "T-Bar Row", muscleGroups: ["back", "biceps"], unit: "reps" },
  { name: "Face Pull", muscleGroups: ["back", "shoulders"], unit: "reps" },
  {
    name: "Hyperextension",
    muscleGroups: ["back", "glutes", "hamstrings"],
    unit: "reps",
  },

  // ── Shoulders ──────────────────────────────────────────────────────────────
  {
    name: "Overhead Press (Barbell)",
    muscleGroups: ["shoulders", "triceps"],
    unit: "reps",
  },
  {
    name: "Dumbbell Shoulder Press",
    muscleGroups: ["shoulders", "triceps"],
    unit: "reps",
  },
  { name: "Arnold Press", muscleGroups: ["shoulders"], unit: "reps" },
  { name: "Lateral Raise", muscleGroups: ["shoulders"], unit: "reps" },
  { name: "Front Raise", muscleGroups: ["shoulders"], unit: "reps" },
  { name: "Rear Delt Fly", muscleGroups: ["shoulders", "back"], unit: "reps" },
  { name: "Upright Row", muscleGroups: ["shoulders", "biceps"], unit: "reps" },
  { name: "Shrugs", muscleGroups: ["shoulders", "back"], unit: "reps" },

  // ── Biceps ─────────────────────────────────────────────────────────────────
  { name: "Barbell Curl", muscleGroups: ["biceps", "forearms"], unit: "reps" },
  { name: "Dumbbell Curl", muscleGroups: ["biceps", "forearms"], unit: "reps" },
  { name: "Hammer Curl", muscleGroups: ["biceps", "forearms"], unit: "reps" },
  { name: "Incline Dumbbell Curl", muscleGroups: ["biceps"], unit: "reps" },
  { name: "Preacher Curl", muscleGroups: ["biceps"], unit: "reps" },
  { name: "Cable Curl", muscleGroups: ["biceps"], unit: "reps" },
  { name: "Concentration Curl", muscleGroups: ["biceps"], unit: "reps" },

  // ── Triceps ────────────────────────────────────────────────────────────────
  { name: "Tricep Pushdown", muscleGroups: ["triceps"], unit: "reps" },
  { name: "Skull Crusher", muscleGroups: ["triceps"], unit: "reps" },
  {
    name: "Overhead Tricep Extension",
    muscleGroups: ["triceps"],
    unit: "reps",
  },
  {
    name: "Close-Grip Bench Press",
    muscleGroups: ["triceps", "chest"],
    unit: "reps",
  },
  { name: "Tricep Dip", muscleGroups: ["triceps", "chest"], unit: "reps" },
  { name: "Diamond Push-Up", muscleGroups: ["triceps", "chest"], unit: "reps" },

  // ── Forearms ───────────────────────────────────────────────────────────────
  { name: "Wrist Curl", muscleGroups: ["forearms"], unit: "reps" },
  { name: "Reverse Wrist Curl", muscleGroups: ["forearms"], unit: "reps" },
  {
    name: "Farmer Walk",
    muscleGroups: ["forearms", "core", "back"],
    unit: "seconds",
  },

  // ── Core ───────────────────────────────────────────────────────────────────
  { name: "Plank", muscleGroups: ["core"], unit: "seconds" },
  { name: "Crunch", muscleGroups: ["core"], unit: "reps" },
  { name: "Sit-Up", muscleGroups: ["core"], unit: "reps" },
  { name: "Leg Raise", muscleGroups: ["core"], unit: "reps" },
  { name: "Russian Twist", muscleGroups: ["core"], unit: "reps" },
  { name: "Ab Wheel Rollout", muscleGroups: ["core", "back"], unit: "reps" },
  { name: "Cable Crunch", muscleGroups: ["core"], unit: "reps" },
  { name: "Hanging Knee Raise", muscleGroups: ["core"], unit: "reps" },
  { name: "Side Plank", muscleGroups: ["core"], unit: "seconds" },
  { name: "Mountain Climber", muscleGroups: ["core", "cardio"], unit: "reps" },

  // ── Quads ──────────────────────────────────────────────────────────────────
  {
    name: "Barbell Squat",
    muscleGroups: ["quads", "glutes", "hamstrings", "core"],
    unit: "reps",
  },
  { name: "Front Squat", muscleGroups: ["quads", "core"], unit: "reps" },
  { name: "Goblet Squat", muscleGroups: ["quads", "glutes"], unit: "reps" },
  {
    name: "Leg Press",
    muscleGroups: ["quads", "glutes", "hamstrings"],
    unit: "reps",
  },
  { name: "Leg Extension", muscleGroups: ["quads"], unit: "reps" },
  {
    name: "Lunge",
    muscleGroups: ["quads", "glutes", "hamstrings"],
    unit: "reps",
  },
  {
    name: "Bulgarian Split Squat",
    muscleGroups: ["quads", "glutes"],
    unit: "reps",
  },
  { name: "Hack Squat", muscleGroups: ["quads", "glutes"], unit: "reps" },
  { name: "Step-Up", muscleGroups: ["quads", "glutes"], unit: "reps" },

  // ── Hamstrings ─────────────────────────────────────────────────────────────
  { name: "Leg Curl (Lying)", muscleGroups: ["hamstrings"], unit: "reps" },
  { name: "Leg Curl (Seated)", muscleGroups: ["hamstrings"], unit: "reps" },
  { name: "Nordic Curl", muscleGroups: ["hamstrings"], unit: "reps" },
  {
    name: "Good Morning",
    muscleGroups: ["hamstrings", "back", "glutes"],
    unit: "reps",
  },

  // ── Glutes ─────────────────────────────────────────────────────────────────
  { name: "Hip Thrust", muscleGroups: ["glutes", "hamstrings"], unit: "reps" },
  {
    name: "Glute Bridge",
    muscleGroups: ["glutes", "hamstrings"],
    unit: "reps",
  },
  { name: "Cable Kickback", muscleGroups: ["glutes"], unit: "reps" },
  {
    name: "Sumo Deadlift",
    muscleGroups: ["glutes", "hamstrings", "back"],
    unit: "reps",
  },

  // ── Calves ─────────────────────────────────────────────────────────────────
  { name: "Standing Calf Raise", muscleGroups: ["calves"], unit: "reps" },
  { name: "Seated Calf Raise", muscleGroups: ["calves"], unit: "reps" },
  { name: "Donkey Calf Raise", muscleGroups: ["calves"], unit: "reps" },

  // ── Full Body ──────────────────────────────────────────────────────────────
  { name: "Burpee", muscleGroups: ["full_body", "cardio"], unit: "reps" },
  {
    name: "Clean and Press",
    muscleGroups: ["full_body", "shoulders", "back"],
    unit: "reps",
  },
  {
    name: "Kettlebell Swing",
    muscleGroups: ["full_body", "glutes", "hamstrings"],
    unit: "reps",
  },
  {
    name: "Thruster",
    muscleGroups: ["full_body", "quads", "shoulders"],
    unit: "reps",
  },
  {
    name: "Turkish Get-Up",
    muscleGroups: ["full_body", "core", "shoulders"],
    unit: "reps",
  },

  // ── Cardio ─────────────────────────────────────────────────────────────────
  {
    name: "Treadmill Run",
    muscleGroups: ["cardio", "quads", "calves"],
    unit: "minutes",
  },
  {
    name: "Cycling",
    muscleGroups: ["cardio", "quads", "calves"],
    unit: "minutes",
  },
  { name: "Jump Rope", muscleGroups: ["cardio", "calves"], unit: "seconds" },
  {
    name: "Rowing Machine",
    muscleGroups: ["cardio", "back", "core"],
    unit: "minutes",
  },
  {
    name: "Stair Climber",
    muscleGroups: ["cardio", "quads", "glutes"],
    unit: "minutes",
  },
  {
    name: "Battle Ropes",
    muscleGroups: ["cardio", "shoulders", "core"],
    unit: "seconds",
  },
];

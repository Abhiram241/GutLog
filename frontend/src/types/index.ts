// ─── Navigation ───────────────────────────────────────────────────────────────
export type AppTab = "home" | "meds" | "water" | "stool" | "settings";
export type ExtraPage = "aiFeedback" | "suspiciousFoods";

// ─── Food & Meals ──────────────────────────────────────────────────────────────
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "misc";
export type UnitType = "g" | "ml";

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  isOutsideFood: boolean;
  suspicious?: boolean;
}

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealLog {
  items: FoodItem[];
  outsideFoodChecked: boolean;
  macro: MacroResult | null;
  macroError: string;
}

// ─── Stool ────────────────────────────────────────────────────────────────────
export interface StoolEntry {
  id: string;
  date: string;
  time: string;
  consistency: "Watery" | "Loose" | "Soft" | "Normal" | "Hard" | "Pellets";
  color: "Brown" | "Yellow" | "Green" | "Black" | "Red" | "Pale/Clay";
  satisfaction:
    | "Complete relief"
    | "Partial relief"
    | "Urgent"
    | "Painful"
    | "Incomplete";
  notes: string;
}

// ─── Medications ──────────────────────────────────────────────────────────────
export interface MedItem {
  id: string;
  name: string;
  dosage: string;
  preferredTime: string;
}

// ─── Daily Log ────────────────────────────────────────────────────────────────
export interface DayLog {
  meals: Record<MealType, MealLog>;
  waterMl: number;
  stoolEntries: StoolEntry[];
  medsTaken: Record<string, { taken: boolean; timeTaken: string }>;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface SettingsData {
  geminiApiKey: string;
  city: "Hyderabad" | "Bengaluru";
  dailyWaterGoal: number;
  themePreference: "system" | "light" | "dark";
}

// ─── AI Review ────────────────────────────────────────────────────────────────
export interface AIReviewResult {
  summary: string;
  cautionLevel: "low" | "medium" | "high";
  potentialReactions: string[];
  positivePairs: string[];
  advice: string[];
}

// ─── Backup ───────────────────────────────────────────────────────────────────
export interface BackupPayload {
  version: 1;
  exportedAt: string;
  settings: SettingsData;
  medsMaster: MedItem[];
  logs: Record<string, DayLog>;
}

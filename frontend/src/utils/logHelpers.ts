import { DayLog, MealType } from "../types";

// ─── Log helpers ──────────────────────────────────────────────────────────────

const mealTypes: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
  "misc",
];

/** Create a fresh empty DayLog with all meals initialized */
export const createEmptyDayLog = (): DayLog => ({
  meals: {
    breakfast: {
      items: [],
      outsideFoodChecked: false,
      macro: null,
      macroError: "",
    },
    lunch: {
      items: [],
      outsideFoodChecked: false,
      macro: null,
      macroError: "",
    },
    dinner: {
      items: [],
      outsideFoodChecked: false,
      macro: null,
      macroError: "",
    },
    snacks: {
      items: [],
      outsideFoodChecked: false,
      macro: null,
      macroError: "",
    },
    misc: { items: [], outsideFoodChecked: false, macro: null, macroError: "" },
  },
  waterMl: 0,
  stoolEntries: [],
  medsTaken: {},
});

/** Deep-clone a DayLog to avoid mutating state directly */
export const copyLog = (log: DayLog): DayLog =>
  JSON.parse(JSON.stringify(log)) as DayLog;

/** Normalize a partial/raw log from storage into a full DayLog */
export const normalizeLog = (raw: Partial<DayLog> | null): DayLog => {
  const base = createEmptyDayLog();
  if (!raw) return base;

  const normalizedMeals = mealTypes.reduce(
    (acc, mealType) => {
      const meal = raw.meals?.[mealType];
      acc[mealType] = {
        items: meal?.items ?? [],
        outsideFoodChecked: meal?.outsideFoodChecked ?? false,
        macro: meal?.macro ?? null,
        macroError: meal?.macroError ?? "",
      };
      return acc;
    },
    {} as DayLog["meals"],
  );

  return {
    meals: normalizedMeals,
    waterMl: raw.waterMl ?? 0,
    stoolEntries: raw.stoolEntries ?? [],
    medsTaken: raw.medsTaken ?? {},
  };
};

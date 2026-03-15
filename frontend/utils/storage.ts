import AsyncStorage from "@react-native-async-storage/async-storage";

import { DayLog, MedItem, MealType, SettingsData } from "@/types";

const SETTINGS_KEY = "crohns_diary_settings_v1";
const MEDS_KEY = "crohns_diary_meds_master_v1";
const LOG_PREFIX = "log_";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "misc"];

export const createEmptyDayLog = (): DayLog => ({
  meals: {
    breakfast: { items: [], outsideFoodChecked: false, macro: null, macroError: "" },
    lunch: { items: [], outsideFoodChecked: false, macro: null, macroError: "" },
    dinner: { items: [], outsideFoodChecked: false, macro: null, macroError: "" },
    snacks: { items: [], outsideFoodChecked: false, macro: null, macroError: "" },
    misc: { items: [], outsideFoodChecked: false, macro: null, macroError: "" },
  },
  waterMl: 0,
  stoolEntries: [],
  medsTaken: {},
});

export const defaultSettings: SettingsData = {
  geminiApiKey: "",
  city: "Bengaluru",
  dailyWaterGoal: 2500,
};

const normalizeLog = (raw: Partial<DayLog> | null): DayLog => {
  const base = createEmptyDayLog();
  if (!raw) return base;

  const normalizedMeals = mealTypes.reduce((acc, mealType) => {
    const meal = raw.meals?.[mealType];
    acc[mealType] = {
      items: meal?.items ?? [],
      outsideFoodChecked: meal?.outsideFoodChecked ?? false,
      macro: meal?.macro ?? null,
      macroError: meal?.macroError ?? "",
    };
    return acc;
  }, {} as DayLog["meals"]);

  return {
    meals: normalizedMeals,
    waterMl: raw.waterMl ?? 0,
    stoolEntries: raw.stoolEntries ?? [],
    medsTaken: raw.medsTaken ?? {},
  };
};

export const getSettings = async () => {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  const parsed = JSON.parse(raw) as Partial<SettingsData>;
  return {
    geminiApiKey: parsed.geminiApiKey ?? defaultSettings.geminiApiKey,
    city: parsed.city === "Hyderabad" ? "Hyderabad" : "Bengaluru",
    dailyWaterGoal:
      typeof parsed.dailyWaterGoal === "number" && parsed.dailyWaterGoal > 0
        ? parsed.dailyWaterGoal
        : defaultSettings.dailyWaterGoal,
  } as SettingsData;
};

export const saveSettings = async (settings: SettingsData) => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getMedsMaster = async (): Promise<MedItem[]> => {
  const raw = await AsyncStorage.getItem(MEDS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as MedItem[];
};

export const saveMedsMaster = async (meds: MedItem[]) => {
  await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(meds));
};

export const getDayLog = async (dateKey: string) => {
  const raw = await AsyncStorage.getItem(`${LOG_PREFIX}${dateKey}`);
  if (!raw) return createEmptyDayLog();
  return normalizeLog(JSON.parse(raw) as Partial<DayLog>);
};

export const saveDayLog = async (dateKey: string, log: DayLog) => {
  await AsyncStorage.setItem(`${LOG_PREFIX}${dateKey}`, JSON.stringify(log));
};

export const getAllLogs = async (): Promise<Record<string, DayLog>> => {
  const keys = await AsyncStorage.getAllKeys();
  const logKeys = keys.filter((key) => key.startsWith(LOG_PREFIX));
  if (!logKeys.length) return {};
  const pairs = await AsyncStorage.multiGet(logKeys);

  return pairs.reduce((acc, [key, value]) => {
    if (!value) return acc;
    const dateKey = key.replace(LOG_PREFIX, "");
    acc[dateKey] = normalizeLog(JSON.parse(value) as Partial<DayLog>);
    return acc;
  }, {} as Record<string, DayLog>);
};

export const resetDayLog = async (dateKey: string) => {
  const emptyLog = createEmptyDayLog();
  await saveDayLog(dateKey, emptyLog);
  return emptyLog;
};

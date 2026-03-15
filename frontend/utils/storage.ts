import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { DayLog, MedItem, MealType, SettingsData } from "@/types";

const SETTINGS_KEY = "crohns_diary_settings_v1";
const MEDS_KEY = "crohns_diary_meds_master_v1";
const LOG_PREFIX = "log_";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "misc"];
const memoryStore: Record<string, string> = {};

const canUseWebStorage = () => Platform.OS === "web" && typeof globalThis?.localStorage !== "undefined";

const fallbackGetItem = (key: string) => {
  if (canUseWebStorage()) {
    return globalThis.localStorage.getItem(key);
  }
  return memoryStore[key] ?? null;
};

const fallbackSetItem = (key: string, value: string) => {
  if (canUseWebStorage()) {
    globalThis.localStorage.setItem(key, value);
    return;
  }
  memoryStore[key] = value;
};

const fallbackGetAllKeys = () => {
  if (canUseWebStorage()) {
    return Object.keys(globalThis.localStorage);
  }
  return Object.keys(memoryStore);
};

const safeGetItem = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return fallbackGetItem(key);
  }
};

const safeSetItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    fallbackSetItem(key, value);
  }
};

const safeGetAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch {
    return fallbackGetAllKeys();
  }
};

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
  themePreference: "system",
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
  const raw = await safeGetItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  const parsed = JSON.parse(raw) as Partial<SettingsData>;
  return {
    geminiApiKey: parsed.geminiApiKey ?? defaultSettings.geminiApiKey,
    city: parsed.city === "Hyderabad" ? "Hyderabad" : "Bengaluru",
    dailyWaterGoal:
      typeof parsed.dailyWaterGoal === "number" && parsed.dailyWaterGoal > 0
        ? parsed.dailyWaterGoal
        : defaultSettings.dailyWaterGoal,
    themePreference:
      parsed.themePreference === "dark" || parsed.themePreference === "light"
        ? parsed.themePreference
        : "system",
  } as SettingsData;
};

export const saveSettings = async (settings: SettingsData) => {
  await safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getMedsMaster = async (): Promise<MedItem[]> => {
  const raw = await safeGetItem(MEDS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as MedItem[];
};

export const saveMedsMaster = async (meds: MedItem[]) => {
  await safeSetItem(MEDS_KEY, JSON.stringify(meds));
};

export const getDayLog = async (dateKey: string) => {
  const raw = await safeGetItem(`${LOG_PREFIX}${dateKey}`);
  if (!raw) return createEmptyDayLog();
  return normalizeLog(JSON.parse(raw) as Partial<DayLog>);
};

export const saveDayLog = async (dateKey: string, log: DayLog) => {
  await safeSetItem(`${LOG_PREFIX}${dateKey}`, JSON.stringify(log));
};

export const getAllLogs = async (): Promise<Record<string, DayLog>> => {
  const keys = await safeGetAllKeys();
  const logKeys = keys.filter((key) => key.startsWith(LOG_PREFIX));
  if (!logKeys.length) return {};
  const pairs = await Promise.all(
    logKeys.map(async (key) => [key, await safeGetItem(key)] as [string, string | null])
  );

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

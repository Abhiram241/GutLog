/**
 * storageService.ts
 *
 * Centralized data persistence layer.
 * All reads/writes to AsyncStorage go through here.
 * Components and hooks should never call AsyncStorage directly.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { DayLog, MedItem, SettingsData } from "../types";
import { createEmptyDayLog, normalizeLog } from "../utils/logHelpers";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const SETTINGS_KEY = "crohns_diary_settings_v1";
const MEDS_KEY = "crohns_diary_meds_master_v1";
const LOG_PREFIX = "log_";

// ─── Default values ───────────────────────────────────────────────────────────
export const defaultSettings: SettingsData = {
  geminiApiKey: "",
  city: "Bengaluru",
  dailyWaterGoal: 2500,
  themePreference: "system",
};

// ─── Fallback storage (web / memory) ─────────────────────────────────────────
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

const fallbackGetAllKeys = () => {
  if (canUseWebStorage()) return Object.keys(globalThis.localStorage);
  return Object.keys(memoryStore);
};

// ─── Safe wrappers ────────────────────────────────────────────────────────────
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
    return fallbackGetAllKeys();
  }
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = async (): Promise<SettingsData> => {
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
  };
};

export const saveSettings = async (settings: SettingsData): Promise<void> => {
  await safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
};

// ─── Medications ──────────────────────────────────────────────────────────────
export const getMedsMaster = async (): Promise<MedItem[]> => {
  const raw = await safeGetItem(MEDS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as MedItem[];
};

export const saveMedsMaster = async (meds: MedItem[]): Promise<void> => {
  await safeSetItem(MEDS_KEY, JSON.stringify(meds));
};

// ─── Day Logs ─────────────────────────────────────────────────────────────────
export const getDayLog = async (dateKey: string): Promise<DayLog> => {
  const raw = await safeGetItem(`${LOG_PREFIX}${dateKey}`);
  if (!raw) return createEmptyDayLog();
  return normalizeLog(JSON.parse(raw) as Partial<DayLog>);
};

export const saveDayLog = async (
  dateKey: string,
  log: DayLog,
): Promise<void> => {
  await safeSetItem(`${LOG_PREFIX}${dateKey}`, JSON.stringify(log));
};

export const getAllLogs = async (): Promise<Record<string, DayLog>> => {
  const keys = await safeGetAllKeys();
  const logKeys = keys.filter((key) => key.startsWith(LOG_PREFIX));
  if (!logKeys.length) return {};

  const pairs = await Promise.all(
    logKeys.map(
      async (key) => [key, await safeGetItem(key)] as [string, string | null],
    ),
  );

  return pairs.reduce(
    (acc, [key, value]) => {
      if (!value) return acc;
      const dateKey = key.replace(LOG_PREFIX, "");
      acc[dateKey] = normalizeLog(JSON.parse(value) as Partial<DayLog>);
      return acc;
    },
    {} as Record<string, DayLog>,
  );
};

export const resetDayLog = async (dateKey: string): Promise<DayLog> => {
  const emptyLog = createEmptyDayLog();
  await saveDayLog(dateKey, emptyLog);
  return emptyLog;
};

/**
 * useAppData.ts
 *
 * Central data hook — loads all persisted data on startup and exposes
 * helpers to read and update the day log.
 *
 * This is the single source of truth for allLogs, settings, and medsMaster.
 */

import { useCallback, useEffect, useState } from "react";

import { DayLog, MedItem, SettingsData } from "../types";
import { getTodayDateKey } from "../utils/date";
import { copyLog, createEmptyDayLog } from "../utils/logHelpers";
import {
  defaultSettings,
  getAllLogs,
  getMedsMaster,
  getSettings,
  resetDayLog,
  saveDayLog,
  saveMedsMaster,
  saveSettings,
} from "../services/storageService";

export function useAppData() {
  const todayKey = getTodayDateKey();

  const [isLoading, setIsLoading] = useState(true);
  const [allLogs, setAllLogs] = useState<Record<string, DayLog>>({});
  const [settings, setSettingsState] = useState<SettingsData>(defaultSettings);
  const [medsMaster, setMedsMaster] = useState<MedItem[]>([]);

  // ─── Bootstrap: load everything from storage ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [storedSettings, storedMeds, storedLogs] = await Promise.all([
          getSettings(),
          getMedsMaster(),
          getAllLogs(),
        ]);

        const logs = { ...storedLogs };
        if (!logs[todayKey]) {
          logs[todayKey] = createEmptyDayLog();
          await saveDayLog(todayKey, logs[todayKey]);
        }

        setSettingsState(storedSettings);
        setMedsMaster(storedMeds);
        setAllLogs(logs);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [todayKey]);

  // ─── Log helpers ─────────────────────────────────────────────────────────────

  /** Write a log directly (replaces the existing log for that date) */
  const upsertLog = useCallback(async (dateKey: string, nextLog: DayLog) => {
    setAllLogs((prev) => ({ ...prev, [dateKey]: nextLog }));
    await saveDayLog(dateKey, nextLog);
  }, []);

  /** Apply an updater function to a log and persist the result */
  const updateLog = useCallback(
    async (dateKey: string, updater: (log: DayLog) => DayLog) => {
      setAllLogs((prev) => {
        const baseLog = prev[dateKey] ?? createEmptyDayLog();
        const nextLog = updater(copyLog(baseLog));
        void saveDayLog(dateKey, nextLog);
        return { ...prev, [dateKey]: nextLog };
      });
    },
    [],
  );

  // ─── Settings helpers ────────────────────────────────────────────────────────

  const updateSettings = useCallback((next: SettingsData) => {
    setSettingsState(next);
  }, []);

  const persistSettings = useCallback(async (next: SettingsData) => {
    setSettingsState(next);
    await saveSettings(next);
  }, []);

  // ─── Meds helpers ────────────────────────────────────────────────────────────

  const updateMedsMaster = useCallback(async (meds: MedItem[]) => {
    setMedsMaster(meds);
    await saveMedsMaster(meds);
  }, []);

  // ─── Reset ───────────────────────────────────────────────────────────────────

  const resetToday = useCallback(async () => {
    const emptyLog = await resetDayLog(todayKey);
    setAllLogs((prev) => ({ ...prev, [todayKey]: emptyLog }));
    return emptyLog;
  }, [todayKey]);

  /** Reload all data from storage (used after backup restore) */
  const reloadAllData = useCallback(async () => {
    const [storedSettings, storedMeds, storedLogs] = await Promise.all([
      getSettings(),
      getMedsMaster(),
      getAllLogs(),
    ]);
    setSettingsState(storedSettings);
    setMedsMaster(storedMeds);
    setAllLogs(storedLogs);
  }, []);

  return {
    isLoading,
    allLogs,
    settings,
    medsMaster,
    todayKey,
    updateLog,
    upsertLog,
    updateSettings,
    persistSettings,
    updateMedsMaster,
    resetToday,
    reloadAllData,
  };
}

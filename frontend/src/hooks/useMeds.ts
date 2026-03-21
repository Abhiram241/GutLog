/**
 * useMeds.ts
 *
 * Encapsulates all medication-related logic:
 * - Adding / deleting meds
 * - Toggling taken status
 * - Updating time taken
 */

import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

import { DayLog, MedItem } from "../types";
import { nowTime } from "../utils/date";

interface UseMedsOptions {
  currentDateKey: string;
  medsMaster: MedItem[];
  updateLog: (
    dateKey: string,
    updater: (log: DayLog) => DayLog,
  ) => Promise<void>;
  updateMedsMaster: (meds: MedItem[]) => Promise<void>;
}

export function useMeds({
  currentDateKey,
  medsMaster,
  updateLog,
  updateMedsMaster,
}: UseMedsOptions) {
  // ─── Add med form state ──────────────────────────────────────────────────────
  const [medName, setMedName] = useState("");
  const [medTime, setMedTime] = useState("08:00");

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleAddMed = useCallback(async () => {
    if (!medName.trim() || !medTime.trim()) return;

    const med: MedItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: medName.trim(),
      dosage: "",
      preferredTime: medTime.trim(),
    };

    const nextMeds = [med, ...medsMaster];
    await updateMedsMaster(nextMeds);

    await updateLog(currentDateKey, (log) => {
      log.medsTaken[med.id] = { taken: false, timeTaken: med.preferredTime };
      return log;
    });

    setMedName("");
    setMedTime("08:00");
  }, [
    medName,
    medTime,
    medsMaster,
    currentDateKey,
    updateLog,
    updateMedsMaster,
  ]);

  const handleDeleteMed = useCallback(
    async (medId: string) => {
      const nextMeds = medsMaster.filter((m) => m.id !== medId);
      await updateMedsMaster(nextMeds);
    },
    [medsMaster, updateMedsMaster],
  );

  const toggleMedTaken = useCallback(
    async (medId: string, currentLog: DayLog) => {
      await Haptics.selectionAsync();
      await updateLog(currentDateKey, (log) => {
        const existing = log.medsTaken[medId] ?? {
          taken: false,
          timeTaken: nowTime(),
        };
        log.medsTaken[medId] = {
          taken: !existing.taken,
          timeTaken: existing.timeTaken || nowTime(),
        };
        return log;
      });
    },
    [currentDateKey, updateLog],
  );

  const updateMedTime = useCallback(
    async (medId: string, timeTaken: string) => {
      await updateLog(currentDateKey, (log) => {
        const existing = log.medsTaken[medId] ?? {
          taken: false,
          timeTaken: "",
        };
        log.medsTaken[medId] = { taken: existing.taken, timeTaken };
        return log;
      });
    },
    [currentDateKey, updateLog],
  );

  return {
    medName,
    medTime,
    setMedName,
    setMedTime,
    handleAddMed,
    handleDeleteMed,
    toggleMedTaken,
    updateMedTime,
  };
}

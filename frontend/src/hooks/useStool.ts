/**
 * useStool.ts
 *
 * Encapsulates all stool log entry logic.
 */

import { useCallback, useState } from "react";

import { DayLog, StoolEntry } from "../types";
import { getTodayDateKey, nowTime } from "../utils/date";

interface UseStoolOptions {
  currentDateKey: string;
  updateLog: (
    dateKey: string,
    updater: (log: DayLog) => DayLog,
  ) => Promise<void>;
}

export function useStool({ currentDateKey, updateLog }: UseStoolOptions) {
  const todayKey = getTodayDateKey();

  const [stoolTab, setStoolTab] = useState<"entry" | "correlation">("entry");
  const [stoolDate, setStoolDate] = useState(currentDateKey);
  const [stoolTime, setStoolTime] = useState(nowTime());
  const [stoolConsistency, setStoolConsistency] =
    useState<StoolEntry["consistency"]>("Normal");
  const [stoolColor, setStoolColor] = useState<StoolEntry["color"]>("Brown");
  const [stoolSatisfaction, setStoolSatisfaction] =
    useState<StoolEntry["satisfaction"]>("Complete relief");
  const [stoolNotes, setStoolNotes] = useState("");
  const [stoolMessage, setStoolMessage] = useState("");

  const saveStoolEntry = useCallback(async () => {
    if (stoolNotes.length > 200) {
      setStoolMessage("Notes can be up to 200 characters.");
      return;
    }

    const entry: StoolEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: stoolDate,
      time: stoolTime,
      consistency: stoolConsistency,
      color: stoolColor,
      satisfaction: stoolSatisfaction,
      notes: stoolNotes.trim(),
    };

    await updateLog(stoolDate, (log) => {
      log.stoolEntries.unshift(entry);
      return log;
    });

    setStoolNotes("");
    setStoolMessage("Stool entry saved.");
  }, [
    stoolDate,
    stoolTime,
    stoolConsistency,
    stoolColor,
    stoolSatisfaction,
    stoolNotes,
    updateLog,
  ]);

  return {
    stoolTab,
    setStoolTab,
    stoolDate,
    setStoolDate,
    stoolTime,
    setStoolTime,
    stoolConsistency,
    setStoolConsistency,
    stoolColor,
    setStoolColor,
    stoolSatisfaction,
    setStoolSatisfaction,
    stoolNotes,
    setStoolNotes,
    stoolMessage,
    saveStoolEntry,
    todayKey,
  };
}

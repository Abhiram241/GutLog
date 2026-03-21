// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Format a Date object to "YYYY-MM-DD" */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Get today's date as "YYYY-MM-DD" */
export const getTodayDateKey = (): string => formatDateKey(new Date());

/** Shift a date key by N days (positive = future, negative = past) */
export const shiftDateKey = (dateKey: string, dayShift: number): string => {
  const baseDate = new Date(`${dateKey}T12:00:00`);
  baseDate.setDate(baseDate.getDate() + dayShift);
  return formatDateKey(baseDate);
};

/** Get an array of N date keys going backwards from today (or a given date) */
export const getPastDateKeys = (
  count: number,
  fromDateKey?: string,
): string[] => {
  const base = fromDateKey
    ? new Date(`${fromDateKey}T12:00:00`)
    : new Date(`${getTodayDateKey()}T12:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - index);
    return formatDateKey(date);
  });
};

/** Format a date key to a human-friendly string, e.g. "Mon, Jan 1, 2025" */
export const friendlyDate = (dateKey: string): string => {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** Get current time as "HH:MM" */
export const nowTime = (): string => {
  const date = new Date();
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
};

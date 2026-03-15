export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = () => formatDateKey(new Date());

export const shiftDateKey = (dateKey: string, dayShift: number) => {
  const baseDate = new Date(`${dateKey}T12:00:00`);
  baseDate.setDate(baseDate.getDate() + dayShift);
  return formatDateKey(baseDate);
};

export const getPastDateKeys = (count: number, fromDateKey?: string) => {
  const base = fromDateKey
    ? new Date(`${fromDateKey}T12:00:00`)
    : new Date(`${getTodayDateKey()}T12:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - index);
    return formatDateKey(date);
  });
};

export const friendlyDate = (dateKey: string) => {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * CalendarPicker.tsx
 *
 * A modal calendar for selecting a date.
 * Pure UI component — receives selected date and callbacks.
 */

import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme";
import { useAppTheme } from "../context/ThemeContext";
import { formatDateKey } from "../utils/date";

interface CalendarPickerProps {
  visible: boolean;
  selectedDate: string; // "YYYY-MM-DD"
  maxDate?: string;
  onSelect: (dateKey: string) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarPicker({
  visible,
  selectedDate,
  maxDate,
  onSelect,
  onClose,
  isDarkMode = false,
}: CalendarPickerProps) {
  const { palette } = useAppTheme();

  const parsedSelected = new Date(`${selectedDate}T12:00:00`);
  const isValidDate = !isNaN(parsedSelected.getTime());
  const fallback = new Date();
  const baseDate = isValidDate ? parsedSelected : fallback;
  const [viewYear, setViewYear] = useState(baseDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(baseDate.getMonth());

  const todayKey = formatDateKey(new Date());
  const maxKey = maxDate ?? todayKey;

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const safeFirstDay = Number.isFinite(firstDay) ? firstDay : 0;
  const safeDaysInMonth =
    Number.isFinite(daysInMonth) && daysInMonth > 0 ? daysInMonth : 30;
  const cells: (number | null)[] = [
    ...Array(safeFirstDay).fill(null),
    ...Array.from({ length: safeDaysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
          onPress={() => undefined}
        >
          <View
            style={[styles.header, { backgroundColor: palette.surfaceMuted }]}
          >
            <Pressable
              onPress={() => shiftMonth(-1)}
              style={({ pressed }) => [
                styles.navBtn,
                pressed && styles.pressed,
              ]}
            >
              <Feather
                name="chevron-left"
                size={20}
                color={palette.textPrimary}
              />
            </Pressable>
            <Text style={[styles.monthLabel, { color: palette.textPrimary }]}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              style={({ pressed }) => [
                styles.navBtn,
                pressed && styles.pressed,
              ]}
            >
              <Feather
                name="chevron-right"
                size={20}
                color={palette.textPrimary}
              />
            </Pressable>
          </View>

          <View style={styles.dayHeaderRow}>
            {DAYS.map((d) => (
              <Text
                key={d}
                style={[styles.dayHeader, { color: palette.textSecondary }]}
              >
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, idx) => {
              if (!day) return <View key={`e${idx}`} style={styles.cell} />;
              const dateKey = formatDateKey(new Date(viewYear, viewMonth, day));
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;
              const isFuture = dateKey > maxKey;

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => {
                    if (!isFuture) {
                      onSelect(dateKey);
                      onClose();
                    }
                  }}
                  style={({ pressed }) => [
                    styles.cell,
                    isSelected && styles.cellSelected,
                    isToday && !isSelected && styles.cellToday,
                    pressed && !isFuture && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: isFuture
                          ? palette.textMuted
                          : palette.textPrimary,
                      },
                      isSelected && styles.cellTextSelected,
                      isToday && !isSelected && { color: theme.colors.primary },
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelBtn,
              { borderColor: palette.border },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.cancelLabel, { color: palette.textSecondary }]}
            >
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  dayHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  dayHeader: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  cellSelected: { backgroundColor: theme.colors.primary },
  cellToday: { borderWidth: 1.5, borderColor: theme.colors.primary },
  cellText: { fontSize: 14, fontWeight: "500" },
  cellTextSelected: { color: "#FFFFFF", fontWeight: "700" },
  cancelBtn: {
    margin: 12,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 11,
    alignItems: "center",
  },
  cancelLabel: { fontWeight: "600", fontSize: 14 },
  pressed: { opacity: 0.7 },
});

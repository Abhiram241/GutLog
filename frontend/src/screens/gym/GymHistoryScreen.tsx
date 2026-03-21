/**
 * GymHistoryScreen.tsx
 *
 * Workout history screen with calendar-based navigation.
 * Shows past workouts grouped by date.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ScreenHeader';
import { theme } from '../../constants/theme';
import { WorkoutSession } from '../../types/gym';
import { friendlyDate } from '../../utils/date';
import { formatDuration, calculateTotalVolume, calculateTotalSets } from '../../utils/gymHelpers';

interface GymHistoryScreenProps {
  workoutHistory: Record<string, WorkoutSession[]>;
  isDarkMode: boolean;
  onViewWorkout: (workout: WorkoutSession) => void;
}

export function GymHistoryScreen({
  workoutHistory,
  isDarkMode,
  onViewWorkout,
}: GymHistoryScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Get all dates with workouts
  const workoutDates = useMemo(() => {
    return Object.keys(workoutHistory).sort().reverse();
  }, [workoutHistory]);

  // Filter by selected month
  const filteredDates = useMemo(() => {
    return workoutDates.filter((date) => date.startsWith(selectedMonth));
  }, [workoutDates, selectedMonth]);

  // Get month options
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    workoutDates.forEach((date) => {
      months.add(date.substring(0, 7));
    });
    // Add current month if not present
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonth);
    return Array.from(months).sort().reverse();
  }, [workoutDates]);

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const totalWorkoutsThisMonth = filteredDates.reduce(
    (sum, date) => sum + (workoutHistory[date]?.length || 0),
    0
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="History"
        subtitle={`${totalWorkoutsThisMonth} workout${totalWorkoutsThisMonth !== 1 ? 's' : ''} this month`}
        isDarkMode={isDarkMode}
      />

      {/* Month selector */}
      <View style={styles.monthSelector}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={monthOptions}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.monthChips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.monthChip,
                selectedMonth === item && styles.monthChipActive,
                isDarkMode && styles.monthChipDark,
              ]}
              onPress={() => setSelectedMonth(item)}
            >
              <Text
                style={[
                  styles.monthChipText,
                  selectedMonth === item && styles.monthChipTextActive,
                  isDarkMode && styles.monthChipTextDark,
                ]}
              >
                {formatMonthLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Workout list */}
      {filteredDates.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, isDarkMode && styles.emptyIconDark]}>
            <Feather name="calendar" size={48} color="#4ECDC4" />
          </View>
          <Text style={[styles.emptyTitle, isDarkMode && styles.textPrimary]}>
            No Workouts Yet
          </Text>
          <Text style={[styles.emptyText, isDarkMode && styles.textSecondary]}>
            Complete a workout to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDates}
          keyExtractor={(item) => item}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          renderItem={({ item: dateKey }) => {
            const sessions = workoutHistory[dateKey] || [];
            return (
              <View style={styles.dateGroup}>
                <Text style={[styles.dateLabel, isDarkMode && styles.textSecondary]}>
                  {friendlyDate(dateKey)}
                </Text>
                {sessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={[styles.workoutCard, isDarkMode && styles.workoutCardDark]}
                    onPress={() => onViewWorkout(session)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.workoutHeader}>
                      <Text style={[styles.workoutName, isDarkMode && styles.textPrimary]}>
                        {session.routineName}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={20}
                        color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
                      />
                    </View>
                    <View style={styles.workoutStats}>
                      <View style={styles.stat}>
                        <Feather
                          name="clock"
                          size={14}
                          color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
                        />
                        <Text style={[styles.statText, isDarkMode && styles.textSecondary]}>
                          {session.durationMinutes
                            ? `${session.durationMinutes} min`
                            : '--'}
                        </Text>
                      </View>
                      <View style={styles.stat}>
                        <Feather
                          name="layers"
                          size={14}
                          color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
                        />
                        <Text style={[styles.statText, isDarkMode && styles.textSecondary]}>
                          {calculateTotalSets(session)} sets
                        </Text>
                      </View>
                      <View style={styles.stat}>
                        <Feather
                          name="trending-up"
                          size={14}
                          color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
                        />
                        <Text style={[styles.statText, isDarkMode && styles.textSecondary]}>
                          {calculateTotalVolume(session)} kg
                        </Text>
                      </View>
                    </View>
                    {/* Exercises preview */}
                    <View style={styles.exercisePreview}>
                      {session.exercises.slice(0, 3).map((ex) => (
                        <Text
                          key={ex.id}
                          style={[styles.exerciseText, isDarkMode && styles.textMuted]}
                          numberOfLines={1}
                        >
                          • {ex.exerciseName}
                        </Text>
                      ))}
                      {session.exercises.length > 3 && (
                        <Text style={[styles.exerciseText, isDarkMode && styles.textMuted]}>
                          +{session.exercises.length - 3} more
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthSelector: {
    marginBottom: theme.spacing.md,
  },
  monthChips: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  monthChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthChipActive: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: '#4ECDC4',
  },
  monthChipDark: {
    backgroundColor: theme.dark.surface,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  monthChipTextActive: {
    color: '#4ECDC4',
  },
  monthChipTextDark: {
    color: theme.dark.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  dateGroup: {
    marginBottom: theme.spacing.lg,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  workoutCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  workoutCardDark: {
    backgroundColor: theme.dark.surface,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  exercisePreview: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceMuted,
  },
  exerciseText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  textMuted: {
    color: theme.dark.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyIconDark: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

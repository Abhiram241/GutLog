/**
 * RoutineCard.tsx
 *
 * Card component for displaying a routine in the routines list.
 * Shows name, exercise count, and action buttons.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { Routine } from '../../types/gym';

interface RoutineCardProps {
  routine: Routine;
  isDarkMode: boolean;
  onPress: () => void;
  onStartWorkout: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RoutineCard({
  routine,
  isDarkMode,
  onPress,
  onStartWorkout,
  onEdit,
  onDelete,
}: RoutineCardProps) {
  const exerciseCount = routine.exercises.length;
  const totalSets = routine.exercises.reduce((sum, e) => sum + e.sets.length, 0);

  return (
    <TouchableOpacity
      style={[styles.container, isDarkMode && styles.containerDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="list" size={20} color="#4ECDC4" />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, isDarkMode && styles.textPrimary]}>
              {routine.name}
            </Text>
            <Text style={[styles.stats, isDarkMode && styles.textSecondary]}>
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} • {totalSets} sets
            </Text>
          </View>
        </View>

        {/* Exercise preview */}
        {routine.exercises.length > 0 && (
          <View style={styles.exercisePreview}>
            {routine.exercises.slice(0, 3).map((exercise, index) => (
              <Text
                key={exercise.id}
                style={[styles.exerciseText, isDarkMode && styles.textMuted]}
                numberOfLines={1}
              >
                • {exercise.exerciseName}
              </Text>
            ))}
            {routine.exercises.length > 3 && (
              <Text style={[styles.exerciseText, isDarkMode && styles.textMuted]}>
                +{routine.exercises.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={onStartWorkout}
          >
            <Feather name="play" size={16} color="#FFFFFF" />
            <Text style={styles.startText}>Start Workout</Text>
          </TouchableOpacity>

          <View style={styles.iconButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
              <Feather
                name="edit-2"
                size={18}
                color={isDarkMode ? theme.dark.textSecondary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
              <Feather
                name="trash-2"
                size={18}
                color={theme.colors.danger}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  stats: {
    fontSize: 13,
    color: theme.colors.textSecondary,
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
  exercisePreview: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceMuted,
  },
  exerciseText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceMuted,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
  },
  startText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  iconButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

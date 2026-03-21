/**
 * ExerciseCard.tsx
 *
 * Exercise card showing all sets for an exercise during workout.
 * Includes notes, rest timer trigger, and set management.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { WorkoutExercise, CompletedSet, SetType } from '../../types/gym';
import { SetCard } from './SetCard';
import { createCompletedSet } from '../../utils/gymHelpers';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  previousExercise?: WorkoutExercise | null;
  isExpanded: boolean;
  isDarkMode: boolean;
  onToggleExpand: () => void;
  onSetUpdate: (setIndex: number, updates: Partial<CompletedSet>) => void;
  onSetComplete: (setIndex: number) => void;
  onAddSet: () => void;
  onDeleteSet: (setIndex: number) => void;
  onNotesChange: (notes: string) => void;
}

export function ExerciseCard({
  exercise,
  exerciseIndex,
  previousExercise,
  isExpanded,
  isDarkMode,
  onToggleExpand,
  onSetUpdate,
  onSetComplete,
  onAddSet,
  onDeleteSet,
  onNotesChange,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.exerciseNumber}>
            <Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, isDarkMode && styles.textPrimary]}>
              {exercise.exerciseName}
            </Text>
            <Text style={[styles.setCount, isDarkMode && styles.textSecondary]}>
              {completedSets}/{totalSets} sets completed
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Progress indicator */}
          <View style={[styles.progressRing, isDarkMode && styles.progressRingDark]}>
            <View
              style={[
                styles.progressFill,
                { height: `${progress}%` },
                progress === 100 && styles.progressComplete,
              ]}
            />
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDarkMode ? theme.dark.textSecondary : theme.colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Sets */}
          {exercise.sets.map((set, index) => (
            <SetCard
              key={set.id}
              set={set}
              setIndex={index}
              unit={exercise.unit}
              previousSet={
                previousExercise?.sets[index]
                  ? {
                      weight: previousExercise.sets[index].weight,
                      value: previousExercise.sets[index].value,
                    }
                  : undefined
              }
              isDarkMode={isDarkMode}
              onWeightChange={(weight) => onSetUpdate(index, { weight })}
              onValueChange={(value) => onSetUpdate(index, { value })}
              onComplete={() => onSetComplete(index)}
              onSetTypeChange={(setType) => onSetUpdate(index, { setType })}
              onDelete={totalSets > 1 ? () => onDeleteSet(index) : undefined}
            />
          ))}

          {/* Add set button */}
          <TouchableOpacity
            style={[styles.addSetButton, isDarkMode && styles.addSetButtonDark]}
            onPress={onAddSet}
          >
            <Feather name="plus" size={18} color="#4ECDC4" />
            <Text style={styles.addSetText}>Add Set</Text>
          </TouchableOpacity>

          {/* Notes section */}
          <TouchableOpacity
            style={styles.notesToggle}
            onPress={() => setShowNotes(!showNotes)}
          >
            <Feather
              name="edit-3"
              size={16}
              color={isDarkMode ? theme.dark.textSecondary : theme.colors.textSecondary}
            />
            <Text style={[styles.notesToggleText, isDarkMode && styles.textSecondary]}>
              {showNotes ? 'Hide Notes' : 'Add Notes'}
            </Text>
          </TouchableOpacity>

          {showNotes && (
            <TextInput
              style={[styles.notesInput, isDarkMode && styles.notesInputDark]}
              value={exercise.notes || ''}
              onChangeText={onNotesChange}
              placeholder="Add notes for this exercise..."
              placeholderTextColor={
                isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
              }
              multiline
              numberOfLines={2}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.md,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  exerciseNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  setCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressRing: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  progressRingDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  progressFill: {
    width: '100%',
    backgroundColor: '#4ECDC4',
  },
  progressComplete: {
    backgroundColor: '#00B894',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    marginTop: theme.spacing.sm,
  },
  addSetButtonDark: {
    borderColor: '#4ECDC4',
  },
  addSetText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  notesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  notesToggleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  notesInput: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: theme.spacing.sm,
  },
  notesInputDark: {
    backgroundColor: theme.dark.inputBg,
    color: theme.dark.textPrimary,
  },
});

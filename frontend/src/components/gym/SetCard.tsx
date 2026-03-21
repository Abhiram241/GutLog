/**
 * SetCard.tsx
 *
 * Individual set card for workout tracking.
 * Shows weight, reps/time, set type, and completion status.
 */

import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { setTypeStyles, unitLabels } from '../../constants/gymTheme';
import { CompletedSet, ExerciseUnit, SetType } from '../../types/gym';

interface SetCardProps {
  set: CompletedSet;
  setIndex: number;
  unit: ExerciseUnit;
  previousSet?: { weight: number; value: number };
  isDarkMode: boolean;
  onWeightChange: (weight: number) => void;
  onValueChange: (value: number) => void;
  onComplete: () => void;
  onSetTypeChange: (type: SetType) => void;
  onDelete?: () => void;
}

export function SetCard({
  set,
  setIndex,
  unit,
  previousSet,
  isDarkMode,
  onWeightChange,
  onValueChange,
  onComplete,
  onSetTypeChange,
  onDelete,
}: SetCardProps) {
  const setStyle = setTypeStyles[set.setType];
  const unitLabel = unitLabels[unit];

  return (
    <View
      style={[
        styles.container,
        isDarkMode && styles.containerDark,
        set.completed && styles.containerCompleted,
      ]}
    >
      {/* Set number and type indicator */}
      <View style={styles.setInfo}>
        <View style={[styles.setNumber, { backgroundColor: setStyle.color + '30' }]}>
          <Text style={[styles.setNumberText, { color: setStyle.color }]}>
            {setIndex + 1}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.typeButton}
          onPress={() => {
            const types: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];
            const currentIndex = types.indexOf(set.setType);
            const nextType = types[(currentIndex + 1) % types.length];
            onSetTypeChange(nextType);
          }}
        >
          <Text style={[styles.typeLabel, { color: setStyle.color }]}>
            {setStyle.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Previous workout hint */}
      {previousSet && (
        <View style={styles.previousHint}>
          <Feather
            name="clock"
            size={12}
            color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
          />
          <Text style={[styles.previousText, isDarkMode && styles.textMuted]}>
            {previousSet.weight}kg × {previousSet.value}
          </Text>
        </View>
      )}

      {/* Input fields */}
      <View style={styles.inputs}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, isDarkMode && styles.textSecondary]}>KG</Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.inputDark,
              set.completed && styles.inputCompleted,
            ]}
            value={set.weight > 0 ? String(set.weight) : ''}
            onChangeText={(text) => onWeightChange(Number(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, isDarkMode && styles.textSecondary]}>
            {unitLabel.short.toUpperCase()}
          </Text>
          <TextInput
            style={[
              styles.input,
              isDarkMode && styles.inputDark,
              set.completed && styles.inputCompleted,
            ]}
            value={set.value > 0 ? String(set.value) : ''}
            onChangeText={(text) => onValueChange(Number(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
          />
        </View>

        {/* Complete button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            set.completed && styles.completeButtonDone,
          ]}
          onPress={onComplete}
        >
          <Feather
            name={set.completed ? 'check' : 'circle'}
            size={24}
            color={set.completed ? '#FFFFFF' : '#4ECDC4'}
          />
        </TouchableOpacity>
      </View>

      {/* PR indicator */}
      {set.isPR && (
        <View style={styles.prBadge}>
          <Feather name="award" size={14} color="#FFD700" />
          <Text style={styles.prText}>PR!</Text>
        </View>
      )}

      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Feather
            name="trash-2"
            size={16}
            color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...theme.shadow.sm,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
  },
  containerCompleted: {
    borderLeftColor: '#4ECDC4',
    opacity: 0.9,
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  setNumber: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  previousHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  previousText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  textMuted: {
    color: theme.dark.textMuted,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  inputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    minHeight: 48,
  },
  inputDark: {
    backgroundColor: theme.dark.inputBg,
    color: theme.dark.textPrimary,
  },
  inputCompleted: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  completeButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDone: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  prBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  prText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
  },
});

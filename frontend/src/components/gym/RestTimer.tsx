/**
 * RestTimer.tsx
 *
 * Rest timer component with auto-start capability.
 * Shows countdown timer after completing a set.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { formatDuration } from '../../utils/gymHelpers';

interface RestTimerProps {
  initialSeconds: number;
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onAdjust: (seconds: number) => void;
  isDarkMode: boolean;
}

export function RestTimer({
  initialSeconds,
  isActive,
  onComplete,
  onSkip,
  onAdjust,
  isDarkMode,
}: RestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when initial seconds change
  useEffect(() => {
    setTimeRemaining(initialSeconds);
  }, [initialSeconds]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            Vibration.vibrate([0, 500, 200, 500]);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, onComplete]);

  const progress = initialSeconds > 0 ? timeRemaining / initialSeconds : 0;

  if (!isActive) return null;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.textDark]}>Rest Timer</Text>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Feather name="skip-forward" size={20} color="#4ECDC4" />
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <View style={[styles.progressBg, isDarkMode && styles.progressBgDark]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={[styles.timeText, isDarkMode && styles.textDark]}>
          {formatDuration(timeRemaining)}
        </Text>
      </View>

      <View style={styles.adjustButtons}>
        <TouchableOpacity
          style={[styles.adjustButton, isDarkMode && styles.adjustButtonDark]}
          onPress={() => onAdjust(-15)}
        >
          <Text style={styles.adjustText}>-15s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.adjustButton, isDarkMode && styles.adjustButtonDark]}
          onPress={() => onAdjust(15)}
        >
          <Text style={styles.adjustText}>+15s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.adjustButton, isDarkMode && styles.adjustButtonDark]}
          onPress={() => onAdjust(30)}
        >
          <Text style={styles.adjustText}>+30s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadow.md,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  textDark: {
    color: theme.dark.textPrimary,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  progressBgDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: theme.radius.full,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  adjustButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  adjustButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.full,
  },
  adjustButtonDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  adjustText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
});

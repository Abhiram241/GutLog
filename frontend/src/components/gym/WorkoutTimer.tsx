/**
 * WorkoutTimer.tsx
 *
 * Live workout duration timer displayed at the top of workout session.
 * Shows elapsed time since workout started.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { formatDuration } from '../../utils/gymHelpers';

interface WorkoutTimerProps {
  startedAt: string;
  isDarkMode: boolean;
}

export function WorkoutTimer({ startedAt, isDarkMode }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Feather name="clock" size={18} color="#4ECDC4" />
      <Text style={[styles.time, isDarkMode && styles.timeDark]}>
        {formatDuration(elapsed)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...theme.shadow.sm,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timeDark: {
    color: theme.dark.textPrimary,
  },
});

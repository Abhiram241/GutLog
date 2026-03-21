/**
 * GymModeToggle.tsx
 *
 * Toggle button for switching between Normal app mode and Gym Tracker mode.
 * Displayed in the top-right corner of the home screen header.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

interface GymModeToggleProps {
  isGymMode: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

export function GymModeToggle({ isGymMode, onToggle, isDarkMode }: GymModeToggleProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isGymMode && styles.containerActive,
        isDarkMode && styles.containerDark,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Feather
        name="activity"
        size={16}
        color={isGymMode ? '#FFFFFF' : isDarkMode ? theme.dark.textSecondary : theme.colors.textSecondary}
      />
      <Text
        style={[
          styles.label,
          isGymMode && styles.labelActive,
          isDarkMode && !isGymMode && styles.labelDark,
        ]}
      >
        GYM
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelDark: {
    color: theme.dark.textSecondary,
  },
});

/**
 * GymModeHeader.tsx
 *
 * Header component for Gym Tracker mode with mode toggle button.
 * Shows current screen title and allows switching back to normal mode.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

interface GymModeHeaderProps {
  title: string;
  subtitle?: string;
  isDarkMode: boolean;
  onSwitchToNormal: () => void;
}

export function GymModeHeader({
  title,
  subtitle,
  isDarkMode,
  onSwitchToNormal,
}: GymModeHeaderProps) {
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.titleSection}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
            {subtitle}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.modeToggle, isDarkMode && styles.modeToggleDark]}
        onPress={onSwitchToNormal}
        activeOpacity={0.7}
      >
        <Feather name="home" size={14} color="#E08E79" />
        <Text style={styles.modeText}>NORMAL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceMuted,
  },
  containerDark: {
    backgroundColor: theme.dark.surface,
    borderBottomColor: theme.dark.border,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  titleDark: {
    color: theme.dark.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  subtitleDark: {
    color: theme.dark.textSecondary,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: '#F7E1D7',
    borderWidth: 1,
    borderColor: '#E08E79',
  },
  modeToggleDark: {
    backgroundColor: 'rgba(224, 142, 121, 0.2)',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E08E79',
    letterSpacing: 0.5,
  },
});

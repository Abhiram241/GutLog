/**
 * gymTheme.ts
 *
 * Theme constants for Gym Tracker mode.
 * Supports three theme variants: warm, energetic, and dark.
 */

import { theme } from './theme';

// ─── Gym Color Palettes ───────────────────────────────────────────────────────

export const gymColors = {
  // Warm palette (matches main app)
  warm: {
    primary: '#E08E79',
    primarySoft: '#F7E1D7',
    secondary: '#AAB7A2',
    secondarySoft: '#E2E8DE',
    accent: '#DCD2F7',
    success: '#55EFC4',
    warning: '#F4D06F',
    danger: '#FF7675',
    background: '#FDFBF7',
    surface: '#FFFFFF',
    surfaceMuted: '#F2EFE9',
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    textMuted: '#A6AFB3',
  },
  
  // Energetic palette (blues/greens)
  energetic: {
    primary: '#4ECDC4',
    primarySoft: '#A8E6CF',
    secondary: '#6C5CE7',
    secondarySoft: '#DCD2F7',
    accent: '#FF6B6B',
    success: '#00B894',
    warning: '#FDCB6E',
    danger: '#E17055',
    background: '#F8FFFE',
    surface: '#FFFFFF',
    surfaceMuted: '#E8F5F3',
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    textMuted: '#A6AFB3',
  },
  
  // Dark palette
  dark: {
    primary: '#4ECDC4',
    primarySoft: '#1A3A38',
    secondary: '#6C5CE7',
    secondarySoft: '#2A2550',
    accent: '#FF6B6B',
    success: '#00B894',
    warning: '#FDCB6E',
    danger: '#E17055',
    background: '#0E1117',
    surface: '#161B27',
    surfaceMuted: '#1E2A3A',
    textPrimary: '#EDF2FF',
    textSecondary: '#8FA3BC',
    textMuted: '#526070',
  },
};

// ─── Muscle Group Colors ──────────────────────────────────────────────────────

export const muscleGroupColors: Record<string, string> = {
  chest: '#FF6B6B',
  back: '#4ECDC4',
  shoulders: '#FFE66D',
  biceps: '#95E1D3',
  triceps: '#F38181',
  forearms: '#AA96DA',
  core: '#FCBAD3',
  quads: '#A8D8EA',
  hamstrings: '#DCD2F7',
  glutes: '#F7E1D7',
  calves: '#B5EAD7',
  full_body: '#C7CEEA',
  cardio: '#FFDAC1',
  other: '#E2E8DE',
};

// ─── Set Type Styles ──────────────────────────────────────────────────────────

export const setTypeStyles = {
  normal: {
    color: '#4ECDC4',
    label: 'Normal',
    icon: 'circle',
  },
  warmup: {
    color: '#FFE66D',
    label: 'Warm-up',
    icon: 'sun',
  },
  dropset: {
    color: '#6C5CE7',
    label: 'Drop Set',
    icon: 'trending-down',
  },
  failure: {
    color: '#FF6B6B',
    label: 'Failure',
    icon: 'zap',
  },
};

// ─── Unit Labels ──────────────────────────────────────────────────────────────

export const unitLabels = {
  reps: { singular: 'rep', plural: 'reps', short: 'reps' },
  seconds: { singular: 'second', plural: 'seconds', short: 'sec' },
  minutes: { singular: 'minute', plural: 'minutes', short: 'min' },
};

// ─── Gym Theme Helper ─────────────────────────────────────────────────────────

export function getGymPalette(themeName: 'warm' | 'energetic' | 'dark', isDarkMode: boolean) {
  if (isDarkMode || themeName === 'dark') {
    return gymColors.dark;
  }
  return gymColors[themeName] || gymColors.warm;
}

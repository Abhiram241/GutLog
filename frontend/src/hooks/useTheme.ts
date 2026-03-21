/**
 * useTheme.ts
 *
 * Resolves the active theme (light/dark) based on user preference
 * and the system color scheme.
 */

import { useColorScheme } from "react-native";

import { theme } from "../constants/theme";
import { SettingsData } from "../types";

/** Returns a flat palette object for the current theme */
export function useTheme(themePreference: SettingsData["themePreference"]) {
  const systemColorScheme = useColorScheme();

  const isDarkMode =
    themePreference === "system"
      ? systemColorScheme === "dark"
      : themePreference === "dark";

  const palette = isDarkMode
    ? {
        background: theme.dark.background,
        surface: theme.dark.surface,
        mutedSurface: theme.dark.surfaceMuted,
        textPrimary: theme.dark.textPrimary,
        textSecondary: theme.dark.textSecondary,
        border: theme.dark.border,
      }
    : {
        background: theme.colors.background,
        surface: theme.colors.surface,
        mutedSurface: "#F3EFEA",
        textPrimary: theme.colors.textPrimary,
        textSecondary: theme.colors.textSecondary,
        border: "#E9E1D8",
      };

  return { isDarkMode, palette };
}

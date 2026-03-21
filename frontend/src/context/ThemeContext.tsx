/**
 * ThemeContext.tsx
 *
 * Provides resolved theme values (isDarkMode + palette) to the entire tree
 * so any component can consume them without prop drilling.
 */

import React, { createContext, useContext } from "react";
import { theme } from "../constants/theme";

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  inputBg: string;
  inputBorder: string;
}

export interface ThemeContextValue {
  isDarkMode: boolean;
  palette: ThemePalette;
}

const lightPalette: ThemePalette = {
  background: theme.colors.background,
  surface: theme.colors.surface,
  surfaceMuted: theme.colors.surfaceMuted,
  surfaceElevated: "#F9F6F2",
  textPrimary: theme.colors.textPrimary,
  textSecondary: theme.colors.textSecondary,
  textMuted: theme.colors.textMuted,
  border: "#EEE7DF",
  borderSubtle: "#F4EEE7",
  inputBg: "#FAF8F6",
  inputBorder: "#ECE4DB",
};

const darkPalette: ThemePalette = {
  background: theme.dark.background,
  surface: theme.dark.surface,
  surfaceMuted: theme.dark.surfaceMuted,
  surfaceElevated: theme.dark.surfaceElevated,
  textPrimary: theme.dark.textPrimary,
  textSecondary: theme.dark.textSecondary,
  textMuted: theme.dark.textMuted,
  border: theme.dark.border,
  borderSubtle: theme.dark.borderSubtle,
  inputBg: theme.dark.inputBg,
  inputBorder: theme.dark.inputBorder,
};

export { lightPalette, darkPalette };

const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: false,
  palette: lightPalette,
});

export function ThemeProvider({
  isDarkMode,
  children,
}: {
  isDarkMode: boolean;
  children: React.ReactNode;
}) {
  const palette = isDarkMode ? darkPalette : lightPalette;
  return (
    <ThemeContext.Provider value={{ isDarkMode, palette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

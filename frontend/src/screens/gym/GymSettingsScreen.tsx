/**
 * GymSettingsScreen.tsx
 *
 * Settings screen for Gym Tracker mode.
 * Includes theme preference, default rest time, units, and data management.
 */

import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../../components/ScreenHeader";
import { FormCard } from "../../components/FormCard";
import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { GymSettings } from "../../types/gym";

interface GymSettingsScreenProps {
  gymSettings: GymSettings;
  isDarkMode: boolean;
  onSettingsChange: (settings: GymSettings) => void;
  onExportData: () => void;
  onImportData: () => void;
  onExitGymMode: () => void;
  backupMessage: string;
}

export function GymSettingsScreen({
  gymSettings,
  isDarkMode,
  onSettingsChange,
  onExportData,
  onImportData,
  onExitGymMode,
  backupMessage,
}: GymSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  const updateSetting = <K extends keyof GymSettings>(
    key: K,
    value: GymSettings[K],
  ) => {
    onSettingsChange({ ...gymSettings, [key]: value });
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.screenPad}>
        <ScreenHeader
          title="Gym Settings"
          subtitle="Customize your experience"
          isDarkMode={isDarkMode}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Workout Settings */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Workout Settings
          </Text>

          {/* Default Rest Time */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="clock" size={20} color={palette.textSecondary} />
              <View>
                <Text
                  style={[styles.settingLabel, { color: palette.textPrimary }]}
                >
                  Default Rest Time
                </Text>
                <Text
                  style={[styles.settingDesc, { color: palette.textSecondary }]}
                >
                  {gymSettings.defaultRestSeconds} seconds
                </Text>
              </View>
            </View>
            <View style={styles.restButtons}>
              <TouchableOpacity
                style={[
                  styles.restButton,
                  { backgroundColor: palette.surfaceMuted },
                ]}
                onPress={() =>
                  updateSetting(
                    "defaultRestSeconds",
                    Math.max(15, gymSettings.defaultRestSeconds - 15),
                  )
                }
              >
                <Feather name="minus" size={16} color="#4ECDC4" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.restButton,
                  { backgroundColor: palette.surfaceMuted },
                ]}
                onPress={() =>
                  updateSetting(
                    "defaultRestSeconds",
                    Math.min(300, gymSettings.defaultRestSeconds + 15),
                  )
                }
              >
                <Feather name="plus" size={16} color="#4ECDC4" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Auto Start Rest Timer */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather
                name="play-circle"
                size={20}
                color={palette.textSecondary}
              />
              <View>
                <Text
                  style={[styles.settingLabel, { color: palette.textPrimary }]}
                >
                  Auto-start Rest Timer
                </Text>
                <Text
                  style={[styles.settingDesc, { color: palette.textSecondary }]}
                >
                  Start timer after completing a set
                </Text>
              </View>
            </View>
            <Switch
              value={gymSettings.autoStartRest}
              onValueChange={(value) => updateSetting("autoStartRest", value)}
              trackColor={{ false: palette.surfaceMuted, true: "#4ECDC4" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Keep Screen Awake */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="sun" size={20} color={palette.textSecondary} />
              <View>
                <Text
                  style={[styles.settingLabel, { color: palette.textPrimary }]}
                >
                  Keep Screen Awake
                </Text>
                <Text
                  style={[styles.settingDesc, { color: palette.textSecondary }]}
                >
                  Prevent screen from sleeping during workout
                </Text>
              </View>
            </View>
            <Switch
              value={gymSettings.keepScreenAwake}
              onValueChange={(value) => updateSetting("keepScreenAwake", value)}
              trackColor={{ false: palette.surfaceMuted, true: "#4ECDC4" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Show Previous Workout */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="eye" size={20} color={palette.textSecondary} />
              <View>
                <Text
                  style={[styles.settingLabel, { color: palette.textPrimary }]}
                >
                  Show Previous Values
                </Text>
                <Text
                  style={[styles.settingDesc, { color: palette.textSecondary }]}
                >
                  Display last workout data while tracking
                </Text>
              </View>
            </View>
            <Switch
              value={gymSettings.showPreviousWorkout}
              onValueChange={(value) =>
                updateSetting("showPreviousWorkout", value)
              }
              trackColor={{ false: palette.surfaceMuted, true: "#4ECDC4" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </FormCard>

        {/* Units */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Units
          </Text>

          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[
                styles.unitOption,
                { backgroundColor: palette.surfaceMuted },
                gymSettings.weightUnit === "kg" && styles.unitOptionActive,
              ]}
              onPress={() => updateSetting("weightUnit", "kg")}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: palette.textSecondary },
                  gymSettings.weightUnit === "kg" && styles.unitTextActive,
                ]}
              >
                Kilograms (kg)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitOption,
                { backgroundColor: palette.surfaceMuted },
                gymSettings.weightUnit === "lbs" && styles.unitOptionActive,
              ]}
              onPress={() => updateSetting("weightUnit", "lbs")}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: palette.textSecondary },
                  gymSettings.weightUnit === "lbs" && styles.unitTextActive,
                ]}
              >
                Pounds (lbs)
              </Text>
            </TouchableOpacity>
          </View>
        </FormCard>

        {/* Theme */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Gym Theme
          </Text>

          <View style={styles.themeOptions}>
            {(["warm", "energetic", "dark"] as const).map((themeOption) => (
              <TouchableOpacity
                key={themeOption}
                style={[
                  styles.themeOption,
                  { backgroundColor: palette.surfaceMuted },
                  gymSettings.gymTheme === themeOption &&
                    styles.themeOptionActive,
                ]}
                onPress={() => updateSetting("gymTheme", themeOption)}
              >
                <View
                  style={[
                    styles.themePreview,
                    themeOption === "warm" && { backgroundColor: "#E08E79" },
                    themeOption === "energetic" && {
                      backgroundColor: "#4ECDC4",
                    },
                    themeOption === "dark" && { backgroundColor: "#161B27" },
                  ]}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    { color: palette.textSecondary },
                    gymSettings.gymTheme === themeOption &&
                      styles.themeLabelActive,
                  ]}
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormCard>

        {/* Data Management */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Data Management
          </Text>

          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: palette.surfaceMuted },
            ]}
            onPress={onExportData}
          >
            <Feather name="upload" size={20} color="#4ECDC4" />
            <Text style={styles.dataButtonText}>Export Gym Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dataButton,
              { backgroundColor: palette.surfaceMuted },
            ]}
            onPress={onImportData}
          >
            <Feather name="download" size={20} color="#4ECDC4" />
            <Text style={styles.dataButtonText}>Import Gym Data</Text>
          </TouchableOpacity>

          {backupMessage ? (
            <Text
              style={[styles.backupMessage, { color: palette.textSecondary }]}
            >
              {backupMessage}
            </Text>
          ) : null}
        </FormCard>

        {/* Exit Gym Mode */}
        <TouchableOpacity style={styles.exitButton} onPress={onExitGymMode}>
          <Feather name="log-out" size={20} color={theme.colors.danger} />
          <Text style={styles.exitButtonText}>Exit Gym Mode</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenPad: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceMuted,
  },

  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  settingDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  restButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  restButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  restButtonDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  unitSelector: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  unitOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  unitOptionActive: {
    borderColor: "#4ECDC4",
    backgroundColor: "rgba(78, 205, 196, 0.1)",
  },
  unitOptionDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  unitTextActive: {
    color: "#4ECDC4",
  },
  themeOptions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeOptionActive: {
    borderColor: "#4ECDC4",
  },
  themeOptionDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  themePreview: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.sm,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  themeLabelActive: {
    color: "#4ECDC4",
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    marginBottom: theme.spacing.sm,
  },
  dataButtonDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  dataButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  backupMessage: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  exitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.danger,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.danger,
  },
});

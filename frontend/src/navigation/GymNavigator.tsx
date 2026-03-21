/**
 * GymNavigator.tsx
 *
 * Navigation component for Gym Tracker mode.
 * Manages all gym screens, state, and handles workout flow.
 */

import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { GymBottomNav } from "../components/gym/GymBottomNav";
import { GymAlert } from "../components/gym/GymAlert";
import { InputModal } from "../components/gym/InputModal";
import { theme } from "../constants/theme";
import { useGymData } from "../hooks/useGymData";
import { useGymAlert } from "../hooks/useGymAlert";
import { useTheme } from "../hooks/useTheme";
import {
  GymWorkoutScreen,
  GymRoutinesScreen,
  GymHistoryScreen,
  GymProgressScreen,
  GymSettingsScreen,
  ActiveWorkoutScreen,
  RoutineBuilderScreen,
  WorkoutDetailScreen,
} from "../screens/gym";
import {
  GymTab,
  Routine,
  WorkoutSession,
  BodyMetricEntry,
  GymBackupPayload,
} from "../types/gym";
import {
  createWorkoutFromRoutine,
  generateId,
  calculateCompletionPercentage,
} from "../utils/gymHelpers";
import { getTodayDateKey } from "../utils/date";
import {
  buildGymBackupPayload,
  restoreGymBackup,
} from "../services/gymStorageService";

interface GymNavigatorProps {
  themePreference: "system" | "light" | "dark";
  onExitGymMode: () => void;
  onOpenMenu: () => void;
}

type GymPage =
  | { type: "tabs" }
  | { type: "activeWorkout" }
  | { type: "routineBuilder"; routine: Routine | null }
  | { type: "bodyMetricForm" }
  | { type: "workoutDetail"; workout: WorkoutSession };

export function GymNavigator({
  themePreference,
  onExitGymMode,
  onOpenMenu,
}: GymNavigatorProps) {
  // Theme
  const { isDarkMode, palette } = useTheme(themePreference);

  // Data
  const gymData = useGymData();

  // Navigation state
  const [activeTab, setActiveTab] = useState<GymTab>("workout");
  const [currentPage, setCurrentPage] = useState<GymPage>({ type: "tabs" });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");

  // Custom alert
  const { showAlert, alertProps } = useGymAlert();

  // Input modal state (replaces Alert.prompt)
  const [inputModal, setInputModal] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    placeholder?: string;
    onSubmit: (val: string) => void;
  }>({ visible: false, title: "", onSubmit: () => {} });

  // Check for active workout on mount
  useEffect(() => {
    if (gymData.activeWorkout && currentPage.type === "tabs") {
      showAlert(
        "Workout in Progress",
        "You have an unfinished workout. Would you like to continue?",
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => gymData.setActiveWorkout(null),
          },
          {
            text: "Resume",
            style: "default",
            onPress: () => setCurrentPage({ type: "activeWorkout" }),
          },
        ],
        "play-circle",
        "#4ECDC4",
      );
    }
  }, [gymData.activeWorkout]);

  // Keyboard listener
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Start workout from routine
  const handleStartWorkout = useCallback(
    (routine: Routine) => {
      if (routine.exercises.length === 0) {
        showAlert(
          "Empty Routine",
          "Please add exercises to this routine first.",
          [{ text: "OK" }],
          "alert-circle",
          "#FDCB6E",
        );
        return;
      }

      const todayKey = getTodayDateKey();
      const session = createWorkoutFromRoutine(routine, todayKey);
      gymData.setActiveWorkout(session);
      setCurrentPage({ type: "activeWorkout" });
    },
    [gymData],
  );

  // Complete workout
  const handleCompleteWorkout = useCallback(async () => {
    if (!gymData.activeWorkout) return;

    const now = new Date();
    const startTime = new Date(gymData.activeWorkout.startedAt);
    const durationMinutes = Math.round(
      (now.getTime() - startTime.getTime()) / 60000,
    );

    const completedWorkout: WorkoutSession = {
      ...gymData.activeWorkout,
      completedAt: now.toISOString(),
      durationMinutes,
    };

    // Check for PRs and collect achievements
    const newPRs: string[] = [];
    for (const exercise of completedWorkout.exercises) {
      for (const set of exercise.sets) {
        if (set.completed && set.weight > 0) {
          const { isNewPR, prType } = await gymData.checkAndUpdatePR(
            exercise.exerciseId,
            exercise.exerciseName,
            set.weight,
            set.value,
            completedWorkout.dateKey,
          );
          if (isNewPR && prType) {
            const label =
              prType === "weight"
                ? `${exercise.exerciseName}: ${set.weight}kg new max!`
                : prType === "reps"
                  ? `${exercise.exerciseName}: ${set.value} reps new record!`
                  : `${exercise.exerciseName}: new volume PR!`;
            if (!newPRs.includes(label)) newPRs.push(label);
          }
        }
      }
    }

    // Calculate streak
    const allDates = Object.keys(gymData.workoutHistory).sort();
    const todayKey = completedWorkout.dateKey;
    let streak = 1;
    let checkDate = new Date(todayKey);
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const key = checkDate.toISOString().split("T")[0];
      if (allDates.includes(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Save to history
    await gymData.addWorkoutSession(completedWorkout);
    await gymData.setActiveWorkout(null);

    setCurrentPage({ type: "tabs" });
    setActiveTab("history");

    // Build motivational message
    const completion = calculateCompletionPercentage(completedWorkout);
    const lines: string[] = [
      `${durationMinutes} min · ${completion}% complete`,
    ];
    if (streak > 1) lines.push(`🔥 ${streak}-day streak! Keep it up!`);
    if (newPRs.length > 0) lines.push(`🏆 New PR: ${newPRs[0]}`);
    if (newPRs.length > 1)
      lines.push(
        `+${newPRs.length - 1} more PR${newPRs.length > 2 ? "s" : ""}!`,
      );

    const title =
      newPRs.length > 0
        ? "New Personal Record! 🏆"
        : streak > 2
          ? `${streak}-Day Streak! 🔥`
          : "Workout Complete! 💪";

    showAlert(
      title,
      lines.join("\n"),
      [{ text: "Let's go!" }],
      newPRs.length > 0 ? "award" : streak > 2 ? "zap" : "check-circle",
      newPRs.length > 0 ? "#FFD700" : streak > 2 ? "#FF6B6B" : "#4ECDC4",
    );
  }, [gymData]);

  // Discard workout
  const handleDiscardWorkout = useCallback(async () => {
    await gymData.setActiveWorkout(null);
    setCurrentPage({ type: "tabs" });
  }, [gymData]);

  // Save routine
  const handleSaveRoutine = useCallback(
    async (routine: Routine) => {
      const exists = gymData.routines.find((r) => r.id === routine.id);
      if (exists) {
        await gymData.updateRoutine(routine);
      } else {
        await gymData.addRoutine(routine);
      }
      setCurrentPage({ type: "tabs" });
    },
    [gymData],
  );

  // Delete routine
  const handleDeleteRoutine = useCallback(
    (routineId: string) => {
      showAlert(
        "Delete Routine?",
        "This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => gymData.deleteRoutine(routineId),
          },
        ],
        "trash-2",
        "#E17055",
      );
    },
    [gymData],
  );

  // Add body metric
  const handleAddBodyMetric = useCallback(() => {
    setInputModal({
      visible: true,
      title: "Add Body Weight",
      message: "Enter your weight in kg",
      placeholder: "e.g. 75.5",
      onSubmit: (value) => {
        const weight = parseFloat(value);
        if (weight > 0) {
          const metric: BodyMetricEntry = {
            id: generateId(),
            date: new Date().toISOString(),
            weight,
          };
          gymData.addBodyMetric(metric);
        }
        setInputModal((prev) => ({ ...prev, visible: false }));
      },
    });
  }, [gymData]);

  // Export data
  const handleExportData = useCallback(async () => {
    try {
      setBackupMessage("Exporting...");
      const payload = await buildGymBackupPayload();

      const hasData =
        payload.exercises.length > 0 ||
        payload.routines.length > 0 ||
        Object.keys(payload.workoutHistory).length > 0;

      if (!hasData) {
        setBackupMessage("Nothing to export yet.");
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setBackupMessage("Sharing is not available on this device.");
        return;
      }

      const cacheDir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory!;
      const cacheFile = `${cacheDir}gym_backup.json`;
      await FileSystem.writeAsStringAsync(
        cacheFile,
        JSON.stringify(payload, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 },
      );

      await Sharing.shareAsync(cacheFile, {
        mimeType: "application/json",
        dialogTitle: "Export Gym Data",
        UTI: "public.json",
      });

      setBackupMessage("Export completed!");
    } catch (e) {
      setBackupMessage(e instanceof Error ? e.message : "Export failed.");
    }
  }, []);

  // Import data
  const handleImportData = useCallback(async () => {
    try {
      setBackupMessage("Importing...");

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setBackupMessage("Import cancelled.");
        return;
      }

      const uri = result.assets[0].uri;
      const raw = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = JSON.parse(raw) as GymBackupPayload;
      if (parsed.version !== 1) {
        setBackupMessage("Unsupported backup version.");
        return;
      }

      await restoreGymBackup(parsed);
      await gymData.reloadAllGymData();
      setBackupMessage("Import successful! Data restored.");
    } catch (e) {
      setBackupMessage(e instanceof Error ? e.message : "Import failed.");
    }
  }, [gymData]);

  // Loading state
  if (gymData.isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: palette.background }]}
      >
        <StatusBar
          style={isDarkMode ? "light" : "dark"}
          backgroundColor={palette.background}
        />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text
            style={[
              styles.loaderText,
              isDarkMode && { color: theme.dark.textSecondary },
            ]}
          >
            Loading Gym Mode...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render current page
  const renderPage = () => {
    // Active workout screen
    if (currentPage.type === "activeWorkout" && gymData.activeWorkout) {
      return (
        <ActiveWorkoutScreen
          workout={gymData.activeWorkout}
          workoutHistory={gymData.workoutHistory}
          keepScreenAwake={gymData.gymSettings.keepScreenAwake}
          autoStartRest={gymData.gymSettings.autoStartRest}
          showPreviousWorkout={gymData.gymSettings.showPreviousWorkout}
          isDarkMode={isDarkMode}
          onUpdateWorkout={(workout) => gymData.setActiveWorkout(workout)}
          onCompleteWorkout={handleCompleteWorkout}
          onDiscardWorkout={handleDiscardWorkout}
          onBack={() => setCurrentPage({ type: "tabs" })}
        />
      );
    }

    // Routine builder screen
    if (currentPage.type === "routineBuilder") {
      return (
        <RoutineBuilderScreen
          routine={currentPage.routine}
          exercises={gymData.exercises}
          isDarkMode={isDarkMode}
          onSave={handleSaveRoutine}
          onCancel={() => setCurrentPage({ type: "tabs" })}
          onAddExercise={gymData.addExercise}
        />
      );
    }

    // Workout detail (history view)
    if (currentPage.type === "workoutDetail") {
      return (
        <WorkoutDetailScreen
          workout={currentPage.workout}
          isDarkMode={isDarkMode}
          onBack={() => setCurrentPage({ type: "tabs" })}
        />
      );
    }

    // Tab screens
    switch (activeTab) {
      case "workout":
        return (
          <GymWorkoutScreen
            routines={gymData.routines}
            hasActiveWorkout={!!gymData.activeWorkout}
            isDarkMode={isDarkMode}
            onStartWorkout={handleStartWorkout}
            onResumeWorkout={() => setCurrentPage({ type: "activeWorkout" })}
            onEditRoutine={(routine) =>
              setCurrentPage({ type: "routineBuilder", routine })
            }
            onDeleteRoutine={handleDeleteRoutine}
            onCreateRoutine={() =>
              setCurrentPage({ type: "routineBuilder", routine: null })
            }
          />
        );

      case "routines":
        return (
          <GymRoutinesScreen
            routines={gymData.routines}
            folders={gymData.folders}
            isDarkMode={isDarkMode}
            onCreateRoutine={() =>
              setCurrentPage({ type: "routineBuilder", routine: null })
            }
            onEditRoutine={(routine) =>
              setCurrentPage({ type: "routineBuilder", routine })
            }
            onDeleteRoutine={handleDeleteRoutine}
            onStartWorkout={handleStartWorkout}
            onCreateFolder={() => {
              setInputModal({
                visible: true,
                title: "Create Folder",
                message: "Enter folder name",
                placeholder: "e.g. Push Days",
                onSubmit: (name) => {
                  if (name?.trim()) {
                    gymData.addFolder({
                      id: generateId(),
                      name: name.trim(),
                      color: "#4ECDC4",
                      createdAt: new Date().toISOString(),
                    });
                  }
                  setInputModal((prev) => ({ ...prev, visible: false }));
                },
              });
            }}
          />
        );

      case "history":
        return (
          <GymHistoryScreen
            workoutHistory={gymData.workoutHistory}
            isDarkMode={isDarkMode}
            onViewWorkout={(workout) =>
              setCurrentPage({ type: "workoutDetail", workout })
            }
          />
        );

      case "progress":
        return (
          <GymProgressScreen
            exercises={gymData.exercises}
            workoutHistory={gymData.workoutHistory}
            personalRecords={gymData.personalRecords}
            bodyMetrics={gymData.bodyMetrics}
            isDarkMode={isDarkMode}
            onAddBodyMetric={handleAddBodyMetric}
          />
        );

      case "settings":
        return (
          <GymSettingsScreen
            gymSettings={gymData.gymSettings}
            isDarkMode={isDarkMode}
            onSettingsChange={gymData.updateGymSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onExitGymMode={onExitGymMode}
            backupMessage={backupMessage}
          />
        );

      default:
        return null;
    }
  };

  const showBottomNav = currentPage.type === "tabs" && !keyboardVisible;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={palette.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
        style={styles.safeArea}
      >
        <View
          style={[styles.container, { backgroundColor: palette.background }]}
        >
          {renderPage()}

          {/* Floating menu button - always visible */}
          {currentPage.type !== "activeWorkout" && (
            <View style={styles.menuButtonWrap} pointerEvents="box-none">
              <Pressable
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
                ]}
                onPress={onOpenMenu}
              >
                <Feather name="grid" size={18} color="#4ECDC4" />
              </Pressable>
            </View>
          )}

          {showBottomNav && (
            <GymBottomNav
              activeTab={activeTab}
              onTabPress={setActiveTab}
              isDarkMode={isDarkMode}
            />
          )}

          <GymAlert {...alertProps} isDarkMode={isDarkMode} />

          <InputModal
            visible={inputModal.visible}
            title={inputModal.title}
            message={inputModal.message}
            placeholder={inputModal.placeholder}
            isDarkMode={isDarkMode}
            onCancel={() =>
              setInputModal((prev) => ({ ...prev, visible: false }))
            }
            onSubmit={inputModal.onSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  menuButtonWrap: {
    position: "absolute",
    top: 11,
    right: theme.spacing.lg,
    zIndex: 100,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(78, 205, 196, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#4ECDC4",
  },
});

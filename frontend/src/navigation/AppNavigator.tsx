/**
 * AppNavigator.tsx
 *
 * Root navigation component. Wires all screens, hooks, and shared state together.
 * Now includes Gym Tracker mode toggle and integration.
 *
 * Architecture:
 *   AppNavigator (state + hooks)
 *     ├── GymNavigator (when gym mode is active)
 *     └── GutLogs Screens:
 *         ├── HomeScreen (UI only)
 *         ├── MedsScreen (UI only)
 *         ├── WaterScreen (UI only)
 *         ├── StoolScreen (UI only)
 *         ├── SettingsScreen (UI only)
 *         ├── AIFeedbackScreen (UI only)
 *         └── SuspiciousFoodsScreen (UI only)
 */

import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddFoodModal } from "../components/AddFoodModal";
import { BottomNav } from "../components/BottomNav";
import { CalendarPicker } from "../components/CalendarPicker";
import { GymAlert } from "../components/gym/GymAlert";
import { ThemeProvider } from "../context/ThemeContext";
import { useAIReview } from "../hooks/useAIReview";
import { useAppData } from "../hooks/useAppData";
import { useMeals } from "../hooks/useMeals";
import { useMeds } from "../hooks/useMeds";
import { useStool } from "../hooks/useStool";
import { useTheme } from "../hooks/useTheme";
import { AIFeedbackScreen } from "../screens/AIFeedbackScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { MedsScreen } from "../screens/MedsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StoolScreen } from "../screens/StoolScreen";
import { SuspiciousFoodsScreen } from "../screens/SuspiciousFoodsScreen";
import { WaterScreen } from "../screens/WaterScreen";
import { GymNavigator } from "./GymNavigator";
import {
  exportBackup,
  importBackup,
  writeBackup,
} from "../services/backupService";
import {
  getGymModeEnabled,
  setGymModeEnabled,
} from "../services/gymStorageService";
import { AppTab, ExtraPage } from "../types";
import { shiftDateKey } from "../utils/date";
import { createEmptyDayLog } from "../utils/logHelpers";
import { theme } from "../constants/theme";

export function AppNavigator() {
  // ─── Global state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [extraPage, setExtraPage] = useState<ExtraPage | null>(null);
  const [showBootSpinner] = useState(false); // removed artificial delay
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState("");
  const [calendarTarget, setCalendarTarget] = useState<
    "home" | "review" | null
  >(null);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");

  // ─── Gym Mode State ────────────────────────────────────────────────────────────
  const [isGymMode, setIsGymMode] = useState(false);
  const [gymModeLoaded, setGymModeLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  // ─── Data & theme hooks ──────────────────────────────────────────────────────
  const {
    isLoading,
    allLogs,
    settings,
    medsMaster,
    todayKey,
    updateLog,
    updateSettings,
    persistSettings,
    updateMedsMaster,
    resetToday,
    reloadAllData,
  } = useAppData();

  const { isDarkMode, palette } = useTheme(settings.themePreference);

  // Set currentDateKey once todayKey is available
  useEffect(() => {
    if (todayKey && !currentDateKey) setCurrentDateKey(todayKey);
  }, [todayKey, currentDateKey]);

  // Load gym mode state on mount
  useEffect(() => {
    const loadGymMode = async () => {
      try {
        const enabled = await getGymModeEnabled();
        setIsGymMode(enabled);
      } finally {
        setGymModeLoaded(true);
      }
    };
    void loadGymMode();
  }, []);

  // ─── Feature hooks ───────────────────────────────────────────────────────────
  const meals = useMeals({ currentDateKey, settings, updateLog });
  const meds = useMeds({
    currentDateKey,
    medsMaster,
    updateLog,
    updateMedsMaster,
  });
  const stool = useStool({ currentDateKey, updateLog });
  const aiReview = useAIReview({ allLogs, medsMaster, settings });

  // ─── Boot spinner ────────────────────────────────────────────────────────────
  // Removed artificial delay - app loads as soon as data is ready

  // ─── Keyboard listener ───────────────────────────────────────────────────────
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

  // ─── Gym Mode Toggle ─────────────────────────────────────────────────────────
  const handleToggleGymMode = useCallback(async () => {
    const newValue = !isGymMode;
    setIsGymMode(newValue);
    await setGymModeEnabled(newValue);
  }, [isGymMode]);

  const handleOpenGym = useCallback(async () => {
    setMenuVisible(false);
    setIsGymMode(true);
    await setGymModeEnabled(true);
  }, []);

  const handleExitGymMode = useCallback(async () => {
    setIsGymMode(false);
    await setGymModeEnabled(false);
  }, []);

  // ─── Settings handlers ───────────────────────────────────────────────────────
  const handleSaveApiKey = useCallback(async () => {
    const next = { ...settings, geminiApiKey: settings.geminiApiKey.trim() };
    await persistSettings(next);
    setSettingsMessage("API key saved.");
  }, [settings, persistSettings]);

  const handleSaveSettings = useCallback(async () => {
    const safeGoal = Number(settings.dailyWaterGoal);
    const next = {
      ...settings,
      dailyWaterGoal:
        Number.isFinite(safeGoal) && safeGoal > 0 ? safeGoal : 2500,
    };
    await persistSettings(next);
    setSettingsMessage("Settings saved locally on this device.");
  }, [settings, persistSettings]);

  // ─── Water handler ───────────────────────────────────────────────────────────
  const handleAddWater = useCallback(
    async (amount: number) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateLog(currentDateKey, (log) => {
        log.waterMl = Math.max(0, Math.min(10000, log.waterMl + amount));
        return log;
      });
    },
    [currentDateKey, updateLog],
  );

  // ─── Backup handlers ─────────────────────────────────────────────────────────
  const handleManualBackup = useCallback(async () => {
    try {
      setBackupMessage("Saving backup...");
      await writeBackup();
      setBackupMessage("Backup saved to Documents/GutLogs/gutlogs_backup.json");
    } catch (e) {
      setBackupMessage(e instanceof Error ? e.message : "Backup failed.");
    }
  }, []);

  const handleExportBackup = useCallback(async () => {
    try {
      setBackupMessage("Exporting...");
      const result = await exportBackup();
      setBackupMessage(result.message);
    } catch (e) {
      setBackupMessage(e instanceof Error ? e.message : "Export failed.");
    }
  }, []);

  const handleImportBackup = useCallback(async () => {
    try {
      setBackupMessage("Importing...");
      const result = await importBackup();
      setBackupMessage(result.message);
      if (result.success) await reloadAllData();
    } catch (e) {
      setBackupMessage(e instanceof Error ? e.message : "Import failed.");
    }
  }, [reloadAllData]);

  const handleResetToday = useCallback(async () => {
    await resetToday();
    setCurrentDateKey(todayKey);
    setSettingsMessage("Today's log has been reset.");
  }, [resetToday, todayKey]);

  // ─── Menu renderer ───────────────────────────────────────────────────────────
  const renderMenu = () => (
    <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
      <View
        style={[
          styles.menuCard,
          { backgroundColor: isDarkMode ? "#161B27" : "#FFFFFF" },
        ]}
      >
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {[
            {
              label: "Food Diary",
              icon: "book-open" as const,
              onPress: () => {
                setMenuVisible(false);
                if (isGymMode) handleExitGymMode();
                setActiveTab("home");
              },
            },
            {
              label: "Gym",
              icon: "activity" as const,
              onPress: () => {
                setMenuVisible(false);
                handleOpenGym();
              },
            },
            {
              label: "Habit Tracker",
              icon: "check-square" as const,
              onPress: () => {
                setMenuVisible(false);
                setComingSoonVisible(true);
              },
            },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                i < arr.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDarkMode
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(0,0,0,0.07)",
                },
                pressed && styles.pressed,
              ]}
              onPress={item.onPress}
            >
              <Feather name={item.icon} size={18} color="#4ECDC4" />
              <Text
                style={[
                  styles.menuItemText,
                  { color: isDarkMode ? "#EDF2FF" : "#2D3436" },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Pressable>
  );

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (isLoading || !currentDateKey || !gymModeLoaded) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: palette.background }]}
      >
        <StatusBar
          style={isDarkMode ? "light" : "dark"}
          backgroundColor={palette.background}
        />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loaderText,
              isDarkMode && { color: theme.dark.textSecondary },
            ]}
          >
            Loading NextCore...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Gym Mode ────────────────────────────────────────────────────────────────
  if (isGymMode) {
    return (
      <ThemeProvider isDarkMode={isDarkMode}>
        <View style={{ flex: 1 }}>
          <GymNavigator
            themePreference={settings.themePreference}
            onExitGymMode={handleExitGymMode}
            onOpenMenu={() => setMenuVisible(true)}
          />
          {/* Menu overlay rendered on top of gym mode too */}
          {menuVisible && renderMenu()}
          <GymAlert
            visible={comingSoonVisible}
            title="Coming Soon"
            message="Habit Tracker is under development. Stay tuned!"
            buttons={[{ text: "Got it", style: "default" }]}
            isDarkMode={isDarkMode}
            icon="clock"
            iconColor="#4ECDC4"
            onDismiss={() => setComingSoonVisible(false)}
          />
        </View>
      </ThemeProvider>
    );
  }

  const currentLog = allLogs[currentDateKey] ?? createEmptyDayLog();

  // ─── Screen renderer ─────────────────────────────────────────────────────────
  const renderScreen = () => {
    if (extraPage === "aiFeedback") {
      return (
        <AIFeedbackScreen
          reviewDateKey={aiReview.reviewDateKey}
          todayKey={todayKey}
          isReviewLoading={aiReview.isReviewLoading}
          reviewError={aiReview.reviewError}
          reviewData={aiReview.reviewData}
          isDarkMode={isDarkMode}
          onDateChange={aiReview.setReviewDateKey}
          onOpenCalendar={() => setCalendarTarget("review")}
          onGenerateReview={aiReview.triggerAIReview}
        />
      );
    }

    if (extraPage === "suspiciousFoods") {
      return (
        <SuspiciousFoodsScreen
          allLogs={allLogs}
          isDarkMode={isDarkMode}
          onToggleSuspicious={meals.toggleSuspicious}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            currentDateKey={currentDateKey}
            todayKey={todayKey}
            allLogs={allLogs}
            settings={settings}
            medsMaster={medsMaster}
            isDarkMode={isDarkMode}
            macroLoadingMeal={meals.macroLoadingMeal}
            onDateChange={setCurrentDateKey}
            onOpenCalendar={() => setCalendarTarget("home")}
            onToggleOutsideFood={meals.toggleOutsideFood}
            onOpenAddItem={meals.openAddItem}
            onGenerateMacros={(mealType) =>
              meals.handleGenerateMacros(mealType, currentLog)
            }
          />
        );
      case "meds":
        return (
          <MedsScreen
            currentDateKey={currentDateKey}
            currentLog={currentLog}
            medsMaster={medsMaster}
            isDarkMode={isDarkMode}
            medName={meds.medName}
            medTime={meds.medTime}
            onMedNameChange={meds.setMedName}
            onMedTimeChange={meds.setMedTime}
            onAddMed={meds.handleAddMed}
            onDeleteMed={meds.handleDeleteMed}
            onToggleMedTaken={(medId) => meds.toggleMedTaken(medId, currentLog)}
            onUpdateMedTime={meds.updateMedTime}
          />
        );
      case "water":
        return (
          <WaterScreen
            currentLog={currentLog}
            settings={settings}
            allLogs={allLogs}
            todayKey={todayKey}
            isDarkMode={isDarkMode}
            onAddWater={handleAddWater}
          />
        );
      case "stool":
        return (
          <StoolScreen
            stoolTab={stool.stoolTab}
            stoolDate={stool.stoolDate}
            stoolTime={stool.stoolTime}
            stoolConsistency={stool.stoolConsistency}
            stoolColor={stool.stoolColor}
            stoolSatisfaction={stool.stoolSatisfaction}
            stoolNotes={stool.stoolNotes}
            stoolMessage={stool.stoolMessage}
            todayKey={todayKey}
            allLogs={allLogs}
            medsMaster={medsMaster}
            isDarkMode={isDarkMode}
            onTabChange={stool.setStoolTab}
            onDateChange={stool.setStoolDate}
            onTimeChange={stool.setStoolTime}
            onConsistencyChange={stool.setStoolConsistency}
            onColorChange={stool.setStoolColor}
            onSatisfactionChange={stool.setStoolSatisfaction}
            onNotesChange={stool.setStoolNotes}
            onSave={stool.saveStoolEntry}
          />
        );
      case "settings":
      default:
        return (
          <SettingsScreen
            settings={settings}
            settingsMessage={settingsMessage}
            backupMessage={backupMessage}
            isDarkMode={isDarkMode}
            onSettingsChange={updateSettings}
            onSaveApiKey={handleSaveApiKey}
            onSaveSettings={handleSaveSettings}
            onManualBackup={handleManualBackup}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetToday={handleResetToday}
            onOpenAIReview={() => setExtraPage("aiFeedback")}
            onOpenSuspiciousFoods={() => setExtraPage("suspiciousFoods")}
          />
        );
    }
  };

  return (
    <ThemeProvider isDarkMode={isDarkMode}>
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
            {/* Options Menu button - always visible on home screen */}
            {activeTab === "home" && !extraPage && (
              <View style={styles.gymToggleContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.menuButton,
                    isDarkMode && styles.menuButtonDark,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setMenuVisible(true)}
                >
                  <Feather
                    name="grid"
                    size={18}
                    color={isDarkMode ? "#EDF2FF" : "#E08E79"}
                  />
                </Pressable>
              </View>
            )}

            {/* Options dropdown menu */}
            {menuVisible && renderMenu()}

            {/* Coming Soon alert */}
            <GymAlert
              visible={comingSoonVisible}
              title="Coming Soon"
              message="Habit Tracker is under development. Stay tuned!"
              buttons={[{ text: "Got it", style: "default" }]}
              isDarkMode={isDarkMode}
              icon="clock"
              iconColor="#4ECDC4"
              onDismiss={() => setComingSoonVisible(false)}
            />

            {/* Back button for extra pages */}
            {extraPage ? (
              <View
                style={[
                  styles.extraHeader,
                  { backgroundColor: palette.background },
                ]}
              >
                <Pressable
                  onPress={() => setExtraPage(null)}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather
                    name="arrow-left"
                    size={18}
                    color={palette.textPrimary}
                  />
                  <Text
                    style={[styles.backLabel, { color: palette.textPrimary }]}
                  >
                    Back
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {renderScreen()}

            {/* Bottom nav — hidden when keyboard is open or on extra pages */}
            {!extraPage && !keyboardVisible ? (
              <BottomNav
                activeTab={activeTab}
                onTabPress={setActiveTab}
                isDarkMode={isDarkMode}
              />
            ) : null}
          </View>

          {/* Add food item modal */}
          <AddFoodModal
            visible={!!meals.itemModalMeal}
            mealType={meals.itemModalMeal}
            itemName={meals.itemName}
            itemQty={meals.itemQty}
            itemUnit={meals.itemUnit}
            isDarkMode={isDarkMode}
            onClose={meals.closeAddItem}
            onNameChange={meals.setItemName}
            onQtyChange={meals.setItemQty}
            onUnitChange={meals.setItemUnit}
            onSubmit={() => meals.handleAddFoodItem(currentLog)}
          />

          {/* Calendar picker */}
          <CalendarPicker
            visible={calendarTarget !== null}
            selectedDate={
              calendarTarget === "home"
                ? currentDateKey
                : aiReview.reviewDateKey
            }
            maxDate={todayKey}
            isDarkMode={isDarkMode}
            onSelect={(dateKey) => {
              if (calendarTarget === "home") setCurrentDateKey(dateKey);
              else if (calendarTarget === "review")
                aiReview.setReviewDateKey(dateKey);
            }}
            onClose={() => setCalendarTarget(null)}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: { color: theme.colors.textSecondary, fontSize: 14 },
  gymToggleContainer: {
    position: "absolute",
    top: 11,
    right: theme.spacing.lg,
    zIndex: 100,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7E1D7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#D4806A",
  },
  menuButtonDark: {
    backgroundColor: "#1E2A3A",
    borderColor: "rgba(255,255,255,0.12)",
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  menuCard: {
    position: "absolute",
    top: theme.spacing.lg + 48,
    right: theme.spacing.lg,
    borderRadius: 14,
    minWidth: 180,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
  extraHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "#EADFD4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  backLabel: { fontWeight: "600" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

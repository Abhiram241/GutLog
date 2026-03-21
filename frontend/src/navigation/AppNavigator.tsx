/**
 * AppNavigator.tsx
 *
 * Root navigation component. Wires all screens, hooks, and shared state together.
 * This is the single place where hooks are called and props are distributed to screens.
 *
 * Architecture:
 *   AppNavigator (state + hooks)
 *     ├── HomeScreen (UI only)
 *     ├── MedsScreen (UI only)
 *     ├── WaterScreen (UI only)
 *     ├── StoolScreen (UI only)
 *     ├── SettingsScreen (UI only)
 *     ├── AIFeedbackScreen (UI only)
 *     └── SuspiciousFoodsScreen (UI only)
 */

import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddFoodModal } from "../components/AddFoodModal";
import { BottomNav } from "../components/BottomNav";
import { CalendarPicker } from "../components/CalendarPicker";
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
import {
  exportBackup,
  importBackup,
  writeBackup,
} from "../services/backupService";
import { saveSettings } from "../services/storageService";
import { AppTab, ExtraPage } from "../types";
import { shiftDateKey } from "../utils/date";
import { createEmptyDayLog } from "../utils/logHelpers";
import { theme } from "../constants/theme";

export function AppNavigator() {
  // ─── Global state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [extraPage, setExtraPage] = useState<ExtraPage | null>(null);
  const [showBootSpinner, setShowBootSpinner] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState("");
  const [calendarTarget, setCalendarTarget] = useState<
    "home" | "review" | null
  >(null);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [backupMessage, setBackupMessage] = useState("");

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
  useEffect(() => {
    const timer = setTimeout(() => setShowBootSpinner(false), 900);
    return () => clearTimeout(timer);
  }, []);

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

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (isLoading || showBootSpinner || !currentDateKey) {
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
            Loading GutLogs...
          </Text>
        </View>
      </SafeAreaView>
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
            calendarTarget === "home" ? currentDateKey : aiReview.reviewDateKey
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

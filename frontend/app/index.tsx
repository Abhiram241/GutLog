import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNav } from "@/components/BottomNav";
import { MealCard } from "@/components/MealCard";
import { ProgressRing } from "@/components/ProgressRing";
import { WaterBottle } from "@/components/WaterBottle";
import { emptyStateIllustration, theme } from "@/constants/theme";
import { friendlyDate, getPastDateKeys, getTodayDateKey, shiftDateKey } from "@/utils/date";
import { generateMacros, generateReview } from "@/utils/gemini";
import {
  createEmptyDayLog,
  defaultSettings,
  getAllLogs,
  getMedsMaster,
  getSettings,
  resetDayLog,
  saveDayLog,
  saveMedsMaster,
  saveSettings,
} from "@/utils/storage";
import {
  AIReviewResult,
  AppTab,
  DayLog,
  ExtraPage,
  FoodItem,
  MealType,
  MedItem,
  StoolEntry,
  UnitType,
} from "@/types";

const mealMeta: {
  key: MealType;
  title: string;
  color: string;
  placeholder: string;
}[] = [
  { key: "breakfast", title: "Breakfast", color: theme.colors.meal.breakfast, placeholder: "Ex: 2 idli" },
  { key: "lunch", title: "Lunch", color: theme.colors.meal.lunch, placeholder: "Ex: dal chawal" },
  { key: "dinner", title: "Dinner", color: theme.colors.meal.dinner, placeholder: "Ex: veg biryani" },
  { key: "snacks", title: "Snacks", color: theme.colors.meal.snacks, placeholder: "Ex: upma" },
  { key: "misc", title: "Misc", color: theme.colors.meal.misc, placeholder: "Ex: probiotic drink" },
];

const consistencyOptions: StoolEntry["consistency"][] = [
  "Watery",
  "Loose",
  "Soft",
  "Normal",
  "Hard",
  "Pellets",
];

const colorOptions: StoolEntry["color"][] = ["Brown", "Yellow", "Green", "Black", "Red", "Pale/Clay"];
const satisfactionOptions: StoolEntry["satisfaction"][] = [
  "Complete relief",
  "Partial relief",
  "Urgent",
  "Painful",
  "Incomplete",
];

const nowTime = () => {
  const date = new Date();
  return `${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
};

const copyLog = (log: DayLog): DayLog => JSON.parse(JSON.stringify(log)) as DayLog;

const chipColor = {
  activeBg: "#F9E8E2",
  activeBorder: "#E8B6A8",
  activeText: theme.colors.primary,
  inactiveBg: "#FFFFFF",
  inactiveBorder: "#ECE4DB",
  inactiveText: theme.colors.textSecondary,
};

const darkPalette = {
  background: "#0E141E",
  surface: "#18202D",
  mutedSurface: "#202A38",
  textPrimary: "#EDF4FF",
  textSecondary: "#C2CEDF",
  border: "#2A374A",
};

export default function Index() {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();

  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [extraPage, setExtraPage] = useState<ExtraPage | null>(null);

  const [loading, setLoading] = useState(true);
  const [allLogs, setAllLogs] = useState<Record<string, DayLog>>({});
  const [settings, setSettingsState] = useState(defaultSettings);
  const [medsMaster, setMedsMaster] = useState<MedItem[]>([]);

  const todayKey = getTodayDateKey();
  const [currentDateKey, setCurrentDateKey] = useState(todayKey);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [showBootSpinner, setShowBootSpinner] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [itemModalMeal, setItemModalMeal] = useState<MealType | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("40");
  const [itemUnit, setItemUnit] = useState<UnitType>("g");

  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medTime, setMedTime] = useState("08:00");

  const [macroLoadingMeal, setMacroLoadingMeal] = useState<MealType | null>(null);

  const [stoolTab, setStoolTab] = useState<"entry" | "correlation">("entry");
  const [stoolDate, setStoolDate] = useState(todayKey);
  const [stoolTime, setStoolTime] = useState(nowTime());
  const [stoolConsistency, setStoolConsistency] = useState<StoolEntry["consistency"]>("Normal");
  const [stoolColor, setStoolColor] = useState<StoolEntry["color"]>("Brown");
  const [stoolSatisfaction, setStoolSatisfaction] = useState<StoolEntry["satisfaction"]>("Complete relief");
  const [stoolNotes, setStoolNotes] = useState("");
  const [stoolMessage, setStoolMessage] = useState("");

  const [reviewDateKey, setReviewDateKey] = useState(todayKey);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewData, setReviewData] = useState<AIReviewResult | null>(null);

  const currentLog = allLogs[currentDateKey] ?? createEmptyDayLog();
  const isDarkMode =
    settings.themePreference === "system"
      ? systemColorScheme === "dark"
      : settings.themePreference === "dark";
  const currentPalette = isDarkMode
    ? darkPalette
    : {
        background: theme.colors.background,
        surface: theme.colors.surface,
        mutedSurface: "#F3EFEA",
        textPrimary: theme.colors.textPrimary,
        textSecondary: theme.colors.textSecondary,
        border: "#E9E1D8",
      };

  const upsertLog = useCallback(async (dateKey: string, nextLog: DayLog) => {
    setAllLogs((prev) => ({ ...prev, [dateKey]: nextLog }));
    await saveDayLog(dateKey, nextLog);
  }, []);

  const updateLog = useCallback(
    async (dateKey: string, updater: (log: DayLog) => DayLog) => {
      const baseLog = allLogs[dateKey] ?? createEmptyDayLog();
      const nextLog = updater(copyLog(baseLog));
      await upsertLog(dateKey, nextLog);
    },
    [allLogs, upsertLog]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const [storedSettings, storedMeds, storedLogs] = await Promise.all([
          getSettings(),
          getMedsMaster(),
          getAllLogs(),
        ]);

        const logs = { ...storedLogs };
        if (!logs[todayKey]) {
          logs[todayKey] = createEmptyDayLog();
          await saveDayLog(todayKey, logs[todayKey]);
        }
        setSettingsState(storedSettings);
        setMedsMaster(storedMeds);
        setAllLogs(logs);
        setCurrentDateKey(todayKey);
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [todayKey]);

  useEffect(() => {
    const timer = setTimeout(() => setShowBootSpinner(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    setStoolDate(currentDateKey);
  }, [currentDateKey]);

  const hasGeminiKey = settings.geminiApiKey.trim().length > 0;

  const totalFoodItems = useMemo(
    () => mealMeta.reduce((sum, meal) => sum + currentLog.meals[meal.key].items.length, 0),
    [currentLog.meals]
  );

  const todayTakenMedsCount = useMemo(
    () => medsMaster.filter((med) => currentLog.medsTaken[med.id]?.taken).length,
    [currentLog.medsTaken, medsMaster]
  );

  const dailyMacroSummary = useMemo(() => {
    const summary = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      hasGenerated: false,
    };

    mealMeta.forEach((meal) => {
      const macro = currentLog.meals[meal.key].macro;
      if (!macro) return;
      summary.hasGenerated = true;
      summary.calories += Number(macro.calories || 0);
      summary.protein += Number(macro.protein || 0);
      summary.carbohydrates += Number(macro.carbs || 0);
      summary.fat += Number(macro.fat || 0);
    });

    return summary;
  }, [currentLog.meals]);

  const waterStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i += 1) {
      const key = shiftDateKey(todayKey, -i);
      const log = allLogs[key];
      if (!log || log.waterMl < settings.dailyWaterGoal) break;
      streak += 1;
    }
    return streak;
  }, [allLogs, settings.dailyWaterGoal, todayKey]);

  const suspiciousItems = useMemo(() => {
    const grouped: Record<string, { name: string; count: number; lastSeen: string }> = {};
    Object.entries(allLogs).forEach(([dateKey, log]) => {
      mealMeta.forEach((meal) => {
        log.meals[meal.key].items.forEach((item) => {
          if (!item.suspicious) return;
          const id = item.name.trim().toLowerCase();
          grouped[id] = grouped[id]
            ? {
                ...grouped[id],
                count: grouped[id].count + 1,
                lastSeen: grouped[id].lastSeen > dateKey ? grouped[id].lastSeen : dateKey,
              }
            : { name: item.name, count: 1, lastSeen: dateKey };
        });
      });
    });

    return Object.values(grouped).sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
  }, [allLogs]);

  const setSettings = (next: typeof settings) => {
    setSettingsState(next);
    setSettingsMessage("");
  };

  const openAddItem = (mealType: MealType) => {
    setItemModalMeal(mealType);
    setItemName("");
    setItemQty("40");
    setItemUnit("g");
  };

  const handleAddFoodItem = async () => {
    if (!itemModalMeal || !itemName.trim()) return;
    const quantity = Number(itemQty);
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await Haptics.selectionAsync();
    await updateLog(currentDateKey, (log) => {
      const mealLog = log.meals[itemModalMeal];
      const newItem: FoodItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: itemName.trim(),
        quantity,
        unit: itemUnit,
        isOutsideFood: mealLog.outsideFoodChecked,
        suspicious: false,
      };
      mealLog.items.unshift(newItem);
      mealLog.macro = null;
      mealLog.macroError = "";
      return log;
    });

    setItemModalMeal(null);
    Keyboard.dismiss();
  };

  const toggleOutsideFood = async (mealType: MealType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await Haptics.selectionAsync();
    await updateLog(currentDateKey, (log) => {
      log.meals[mealType].outsideFoodChecked = !log.meals[mealType].outsideFoodChecked;
      return log;
    });
  };

  const handleGenerateMacros = async (mealType: MealType) => {
    if (!hasGeminiKey) return;
    const mealLog = currentLog.meals[mealType];
    if (!mealLog.items.length) return;

    setMacroLoadingMeal(mealType);
    await updateLog(currentDateKey, (log) => {
      log.meals[mealType].macroError = "";
      return log;
    });

    try {
      const result = await generateMacros(
        settings.geminiApiKey,
        settings.city,
        mealMeta.find((meal) => meal.key === mealType)?.title ?? mealType,
        mealLog.items
      );
      await updateLog(currentDateKey, (log) => {
        log.meals[mealType].macro = result;
        log.meals[mealType].macroError = "";
        return log;
      });
    } catch (error) {
      await updateLog(currentDateKey, (log) => {
        log.meals[mealType].macroError =
          error instanceof Error ? error.message : "Could not generate macros right now.";
        return log;
      });
    } finally {
      setMacroLoadingMeal(null);
    }
  };

  const handleAddMed = async () => {
    if (!medName.trim() || !medDose.trim() || !medTime.trim()) return;

    const med: MedItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: medName.trim(),
      dosage: medDose.trim(),
      preferredTime: medTime.trim(),
    };
    const nextMeds = [med, ...medsMaster];
    setMedsMaster(nextMeds);
    await saveMedsMaster(nextMeds);

    await updateLog(currentDateKey, (log) => {
      log.medsTaken[med.id] = { taken: false, timeTaken: med.preferredTime };
      return log;
    });

    setMedName("");
    setMedDose("");
    setMedTime("08:00");
  };

  const toggleMedTaken = async (medId: string) => {
    await Haptics.selectionAsync();
    await updateLog(currentDateKey, (log) => {
      const existing = log.medsTaken[medId] ?? { taken: false, timeTaken: nowTime() };
      log.medsTaken[medId] = {
        taken: !existing.taken,
        timeTaken: existing.timeTaken || nowTime(),
      };
      return log;
    });
  };

  const updateMedTime = async (medId: string, timeTaken: string) => {
    await updateLog(currentDateKey, (log) => {
      const existing = log.medsTaken[medId] ?? { taken: false, timeTaken: "" };
      log.medsTaken[medId] = {
        taken: existing.taken,
        timeTaken,
      };
      return log;
    });
  };

  const addWater = async (amount: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await updateLog(currentDateKey, (log) => {
      log.waterMl = Math.max(0, Math.min(10000, log.waterMl + amount));
      return log;
    });
  };

  const saveStoolEntry = async () => {
    if (stoolNotes.length > 200) {
      setStoolMessage("Notes can be up to 200 characters.");
      return;
    }
    const entry: StoolEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: stoolDate,
      time: stoolTime,
      consistency: stoolConsistency,
      color: stoolColor,
      satisfaction: stoolSatisfaction,
      notes: stoolNotes.trim(),
    };

    await updateLog(stoolDate, (log) => {
      log.stoolEntries.unshift(entry);
      return log;
    });
    setStoolNotes("");
    setStoolMessage("Stool entry saved.");
  };

  const saveAllSettings = async () => {
    const safeGoal = Number(settings.dailyWaterGoal);
    const next = {
      ...settings,
      dailyWaterGoal: Number.isFinite(safeGoal) && safeGoal > 0 ? safeGoal : 2500,
    };
    setSettingsState(next);
    await saveSettings(next);
    setSettingsMessage("Settings saved locally on this device.");
  };

  const saveApiKeyOnly = async () => {
    const next = { ...settings, geminiApiKey: settings.geminiApiKey.trim() };
    setSettingsState(next);
    await saveSettings(next);
    setSettingsMessage("API key saved.");
  };

  const handleResetToday = async () => {
    const resetLog = await resetDayLog(todayKey);
    setAllLogs((prev) => ({ ...prev, [todayKey]: resetLog }));
    setCurrentDateKey(todayKey);
    setSettingsMessage("Today's log has been reset.");
  };

  const triggerAIReview = async () => {
    const log = allLogs[reviewDateKey] ?? createEmptyDayLog();
    const foods = mealMeta.flatMap((meal) => log.meals[meal.key].items);
    const medsTaken = medsMaster.filter((med) => log.medsTaken[med.id]?.taken);

    if (!foods.length && !medsTaken.length) {
      setReviewError("Nothing logged for this day yet.");
      setReviewData(null);
      return;
    }
    if (!settings.geminiApiKey.trim()) {
      setReviewError("Add Gemini API key in Settings to generate review.");
      setReviewData(null);
      return;
    }

    setReviewError("");
    setReviewLoading(true);
    try {
      const result = await generateReview(settings.geminiApiKey, settings.city, reviewDateKey, foods, medsTaken);
      setReviewData(result);
    } catch (error) {
      setReviewData(null);
      setReviewError(error instanceof Error ? error.message : "Could not generate review.");
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleSuspicious = async (dateKey: string, mealType: MealType, itemId: string) => {
    await updateLog(dateKey, (log) => {
      const item = log.meals[mealType].items.find((mealItem) => mealItem.id === itemId);
      if (item) item.suspicious = !item.suspicious;
      return log;
    });
  };

  const renderScreenHeader = (title: string, subtitle?: string) => (
    <View style={styles.headerWrap}>
      <Text style={[styles.screenTitle, isDarkMode && styles.titleDark]}>{title}</Text>
      {subtitle ? <Text style={[styles.screenSubtitle, isDarkMode && styles.textSecondaryDark]}>{subtitle}</Text> : null}
    </View>
  );

  const renderOptionChips = <T extends string>(
    options: T[],
    selected: T,
    onSelect: (value: T) => void
  ) => (
    <View style={styles.chipWrap}>
      {options.map((option) => {
        const selectedOption = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.chip,
              selectedOption ? styles.chipActive : styles.chipInactive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipLabel, selectedOption ? styles.chipLabelActive : styles.chipLabelInactive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const homeScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, { paddingBottom: insets.bottom + 120 }]}>
      {renderScreenHeader("GutLogs", friendlyDate(currentDateKey))}

      <View style={[styles.dateSwitcher, isDarkMode && styles.dateSwitcherDark]}>
        <Pressable
          onPress={() => setCurrentDateKey((prev) => shiftDateKey(prev, -1))}
          style={({ pressed }) => [styles.circleIconButton, isDarkMode && styles.circleIconButtonDark, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={18} color={currentPalette.textPrimary} />
        </Pressable>
        <Text style={[styles.switcherText, isDarkMode && styles.titleDark]}>{currentDateKey}</Text>
        <Pressable
          onPress={() => setCurrentDateKey((prev) => (prev === todayKey ? prev : shiftDateKey(prev, 1)))}
          style={({ pressed }) => [styles.circleIconButton, isDarkMode && styles.circleIconButtonDark, pressed && styles.pressed]}
        >
          <Feather name="chevron-right" size={18} color={currentPalette.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.summaryStrip}>
        <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
          <Text style={[styles.summaryValue, isDarkMode && styles.titleDark]}>{totalFoodItems}</Text>
          <Text style={[styles.summaryLabel, isDarkMode && styles.textSecondaryDark]}>Food items</Text>
        </View>
        <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
          <Text style={[styles.summaryValue, isDarkMode && styles.titleDark]}>{currentLog.waterMl}ml</Text>
          <Text style={[styles.summaryLabel, isDarkMode && styles.textSecondaryDark]}>Water</Text>
        </View>
        <View style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
          <Text style={[styles.summaryValue, isDarkMode && styles.titleDark]}>
            {todayTakenMedsCount}/{medsMaster.length || 0}
          </Text>
          <Text style={[styles.summaryLabel, isDarkMode && styles.textSecondaryDark]}>Supplements</Text>
        </View>
      </View>

      {dailyMacroSummary.hasGenerated ? (
        <View style={[styles.formCard, isDarkMode && styles.formCardDark, { marginTop: 0 }]}> 
          <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>Daily Macro Summary</Text>
          <Text style={[styles.timelineSub, isDarkMode && styles.textSecondaryDark]}>
            Calories: {dailyMacroSummary.calories} kilocalories
          </Text>
          <Text style={[styles.timelineSub, isDarkMode && styles.textSecondaryDark]}>
            Protein: {dailyMacroSummary.protein} grams
          </Text>
          <Text style={[styles.timelineSub, isDarkMode && styles.textSecondaryDark]}>
            Carbohydrates: {dailyMacroSummary.carbohydrates} grams
          </Text>
          <Text style={[styles.timelineSub, isDarkMode && styles.textSecondaryDark]}>
            Fat: {dailyMacroSummary.fat} grams
          </Text>
        </View>
      ) : null}

      {!totalFoodItems ? (
        <View style={[styles.emptyStateCard, isDarkMode && styles.formCardDark]}>
          <Image source={{ uri: emptyStateIllustration }} style={styles.emptyIllustration} />
          <Text style={[styles.emptyTitle, isDarkMode && styles.titleDark]}>
            Nothing logged yet — start tracking your day!
          </Text>
          <Pressable onPress={() => openAddItem("breakfast")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonLabel}>Add Meal</Text>
          </Pressable>
        </View>
      ) : null}

      {mealMeta.map((meal) => (
        <MealCard
          key={meal.key}
          mealType={meal.key}
          title={meal.title}
          color={meal.color}
          meal={currentLog.meals[meal.key]}
          isDarkMode={isDarkMode}
          hasGeminiKey={hasGeminiKey}
          isGenerating={macroLoadingMeal === meal.key}
          onToggleOutsideFood={toggleOutsideFood}
          onOpenAddItem={openAddItem}
          onGenerateMacros={handleGenerateMacros}
        />
      ))}
    </ScrollView>
  );

  const medsScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, { paddingBottom: insets.bottom + 120 }]}>
      {renderScreenHeader("Meds & Supplements", "Daily checklist and dosage tracking")}

      <View style={styles.medsTopRow}>
        <ProgressRing
          progress={medsMaster.length ? todayTakenMedsCount / medsMaster.length : 0}
          label={`${todayTakenMedsCount}/${medsMaster.length || 0}`}
          subLabel="Taken"
          color="#A086D3"
        />
        <View style={styles.medsHintCard}>
          <Text style={styles.medsHintTitle}>Today status</Text>
          <Text style={styles.medsHintBody}>
            Stay consistent with your supplements and medicines.
          </Text>
        </View>
      </View>

      <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>Add medication or supplement</Text>
        <TextInput
          value={medName}
          onChangeText={setMedName}
          placeholder="Name (ex: Mesalamine)"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, isDarkMode && styles.inputDark]}
        />
        <TextInput
          value={medDose}
          onChangeText={setMedDose}
          placeholder="Dosage (ex: 500mg)"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, isDarkMode && styles.inputDark]}
        />
        <TextInput
          value={medTime}
          onChangeText={setMedTime}
          placeholder="Time HH:MM"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, isDarkMode && styles.inputDark]}
        />

        <Pressable onPress={handleAddMed} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonLabel}>Add to checklist</Text>
        </Pressable>
      </View>

      {medsMaster.map((med) => {
        const state = currentLog.medsTaken[med.id] ?? { taken: false, timeTaken: med.preferredTime };
        return (
          <View key={med.id} style={[styles.medRowCard, isDarkMode && styles.medRowCardDark]}>
            <Pressable
              onPress={() => toggleMedTaken(med.id)}
              style={({ pressed }) => [styles.medTick, state.taken && styles.medTickActive, pressed && styles.pressed]}
            >
              <Ionicons
                name={state.taken ? "checkmark" : "ellipse-outline"}
                size={16}
                color={state.taken ? "#FFFFFF" : theme.colors.textSecondary}
              />
            </Pressable>

            <View style={styles.medDetails}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDose}>{med.dosage}</Text>
              <TextInput
                value={state.timeTaken}
                onChangeText={(value) => updateMedTime(med.id, value)}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.timeInput}
              />
            </View>
          </View>
        );
      })}

      {!medsMaster.length ? <Text style={styles.emptyInfo}>No meds added yet.</Text> : null}
    </ScrollView>
  );

  const waterScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, { paddingBottom: insets.bottom + 120 }]}>
      {renderScreenHeader("Water Intake", "Hydration helps your gut healing journey")}

      <View style={[styles.formCard, isDarkMode && styles.formCardDark, { backgroundColor: isDarkMode ? darkPalette.mutedSurface : "#F0F8FF" }]}>
        <WaterBottle
          progress={settings.dailyWaterGoal ? currentLog.waterMl / settings.dailyWaterGoal : 0}
          amount={currentLog.waterMl}
          goal={settings.dailyWaterGoal}
        />
        <View style={styles.waterButtonRow}>
          {[250, 500].map((value) => (
            <Pressable
              key={value}
              onPress={() => addWater(value)}
              style={({ pressed }) => [styles.waterQuickButton, pressed && styles.pressed]}
            >
              <Text style={styles.waterQuickLabel}>+{value}ml</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => addWater(-250)} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}>
          <Text style={styles.ghostButtonLabel}>Undo -250ml</Text>
        </Pressable>

        <Text style={styles.streakText}>
          {waterStreak > 0
            ? `You have hit your water goal ${waterStreak} day${waterStreak > 1 ? "s" : ""} in a row`
            : "Start a hydration streak today."}
        </Text>
      </View>
    </ScrollView>
  );

  const stoolScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, styles.stoolContentWrap, { paddingBottom: insets.bottom + 140 }]}>
      {renderScreenHeader("Stool Log", "Track patterns and correlations")}

      <View style={styles.tabToggleWrap}>
        {(["entry", "correlation"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setStoolTab(tab)}
            style={({ pressed }) => [
              styles.segmentButton,
              stoolTab === tab && styles.segmentButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.segmentLabel, stoolTab === tab && styles.segmentLabelActive]}>
              {tab === "entry" ? "Log Entry" : "Correlation View"}
            </Text>
          </Pressable>
        ))}
      </View>

      {stoolTab === "entry" ? (
        <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>New Entry</Text>
          <TextInput
            value={stoolDate}
            onChangeText={setStoolDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, isDarkMode && styles.inputDark]}
          />
          <TextInput
            value={stoolTime}
            onChangeText={setStoolTime}
            placeholder="HH:MM"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, isDarkMode && styles.inputDark]}
          />

          <Text style={styles.inputLabel}>Consistency</Text>
          {renderOptionChips(consistencyOptions, stoolConsistency, setStoolConsistency)}

          <Text style={styles.inputLabel}>Color</Text>
          {renderOptionChips(colorOptions, stoolColor, setStoolColor)}

          <Text style={styles.inputLabel}>Satisfaction</Text>
          {renderOptionChips(satisfactionOptions, stoolSatisfaction, setStoolSatisfaction)}

          <TextInput
            value={stoolNotes}
            onChangeText={setStoolNotes}
            placeholder="Optional notes (max 200 chars)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            maxLength={200}
            style={[styles.input, isDarkMode && styles.inputDark, styles.notesInput]}
          />

          <Pressable onPress={saveStoolEntry} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonLabel}>Save Stool Entry</Text>
          </Pressable>
          {!!stoolMessage ? <Text style={styles.infoText}>{stoolMessage}</Text> : null}
        </View>
      ) : (
        <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>Last 7 days summary</Text>
          {getPastDateKeys(7).map((dateKey) => {
            const log = allLogs[dateKey] ?? createEmptyDayLog();
            const lastStool = log.stoolEntries[0];
            const foods = mealMeta
              .flatMap((meal) => log.meals[meal.key].items)
              .map((item) => item.name)
              .slice(0, 4);
            const meds = medsMaster.filter((med) => log.medsTaken[med.id]?.taken).map((med) => med.name);
            const outsideFood = mealMeta.some((meal) =>
              log.meals[meal.key].items.some((item) => item.isOutsideFood)
            );

            return (
              <View key={dateKey} style={styles.timelineRow}>
                <View style={styles.timelineDateCol}>
                  <Text style={styles.timelineDate}>{dateKey}</Text>
                  {outsideFood ? <Text style={styles.timelineEmoji}>🌮</Text> : null}
                </View>

                <View style={styles.timelineDetails}>
                  <Text style={styles.timelineMain}>
                    {lastStool
                      ? `${lastStool.consistency} • ${lastStool.color} • ${lastStool.satisfaction}`
                      : "No stool entry"}
                  </Text>
                  <Text style={styles.timelineSub}>Foods: {foods.length ? foods.join(", ") : "-"}</Text>
                  <Text style={styles.timelineSub}>Meds: {meds.length ? meds.join(", ") : "-"}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  const settingsScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, { paddingBottom: insets.bottom + 120 }]}>
      {renderScreenHeader("Settings", "GutLogs • Know your gut, heal your life")}

      <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
        <Text style={styles.inputLabel}>Gemini API Key</Text>
        <TextInput
          value={settings.geminiApiKey}
          onChangeText={(value) => setSettings({ ...settings, geminiApiKey: value })}
          placeholder="Paste your Gemini API key"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, isDarkMode && styles.inputDark]}
          autoCapitalize="none"
        />
        <Text style={styles.helperText}>Stored only on this device via AsyncStorage.</Text>

        <Pressable onPress={saveApiKeyOnly} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonLabel}>Save API Key</Text>
        </Pressable>

        <Text style={styles.inputLabel}>City</Text>
        <View style={styles.cityRow}>
          {(["Hyderabad", "Bengaluru"] as const).map((city) => (
            <Pressable
              key={city}
              onPress={() => setSettings({ ...settings, city })}
              style={({ pressed }) => [
                styles.cityButton,
                settings.city === city && styles.cityButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.cityButtonLabel, settings.city === city && styles.cityButtonLabelActive]}>
                {city}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.inputLabel}>Daily water goal (ml)</Text>
        <TextInput
          value={String(settings.dailyWaterGoal)}
          onChangeText={(value) => {
            const parsed = Number(value.replace(/[^0-9]/g, ""));
            setSettings({ ...settings, dailyWaterGoal: parsed || 0 });
          }}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, isDarkMode && styles.inputDark]}
        />

        <Text style={styles.inputLabel}>Appearance</Text>
        <View style={styles.cityRow}>
          {([
            { key: "system", label: "System" },
            { key: "light", label: "Light" },
            { key: "dark", label: "Dark" },
          ] as const).map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setSettings({ ...settings, themePreference: option.key })}
              style={({ pressed }) => [
                styles.cityButton,
                settings.themePreference === option.key && styles.cityButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.cityButtonLabel,
                  settings.themePreference === option.key && styles.cityButtonLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={saveAllSettings} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonLabel}>Save Settings</Text>
        </Pressable>

        <Pressable onPress={handleResetToday} style={({ pressed }) => [styles.ghostDangerButton, pressed && styles.pressed]}>
          <Text style={styles.ghostDangerLabel}>{"Reset Today’s Log"}</Text>
        </Pressable>

        {!!settingsMessage ? <Text style={styles.infoText}>{settingsMessage}</Text> : null}
      </View>

      <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>Extra insights</Text>

        <Pressable onPress={() => setExtraPage("aiFeedback")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonLabel}>Open AI Food & Med Review</Text>
        </Pressable>

        <Pressable onPress={() => setExtraPage("suspiciousFoods")} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonLabel}>Open Suspicious Foods Tracker</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const aiFeedbackScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, { paddingBottom: insets.bottom + 44 }]}>
      {renderScreenHeader("AI Feedback", "Food + meds reaction review")}
      <View style={styles.dateSwitcher}>
        <Pressable
          onPress={() => setReviewDateKey((prev) => shiftDateKey(prev, -1))}
          style={({ pressed }) => [styles.circleIconButton, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={18} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={styles.switcherText}>{reviewDateKey}</Text>
        <Pressable
          onPress={() => setReviewDateKey((prev) => (prev === todayKey ? prev : shiftDateKey(prev, 1)))}
          style={({ pressed }) => [styles.circleIconButton, pressed && styles.pressed]}
        >
          <Feather name="chevron-right" size={18} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      <Pressable onPress={triggerAIReview} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Text style={styles.primaryButtonLabel}>{reviewLoading ? "Generating Review..." : "Generate Daily Review"}</Text>
      </Pressable>

      {!!reviewError ? <Text style={styles.errorTextGlobal}>{reviewError}</Text> : null}

      {reviewData ? (
        <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
          <View style={styles.cautionRow}>
            <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>Review</Text>
            <View
              style={[
                styles.cautionBadge,
                reviewData.cautionLevel === "high"
                  ? styles.cautionHigh
                  : reviewData.cautionLevel === "medium"
                    ? styles.cautionMedium
                    : styles.cautionLow,
              ]}
            >
              <Text style={styles.cautionLabel}>{reviewData.cautionLevel.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.reviewSummary}>{reviewData.summary}</Text>

          <Text style={styles.reviewSectionTitle}>Potential reactions</Text>
          {reviewData.potentialReactions.length ? (
            reviewData.potentialReactions.map((line) => (
              <Text key={line} style={styles.reviewBullet}>
                • {line}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyInfo}>No specific reactions flagged.</Text>
          )}

          <Text style={styles.reviewSectionTitle}>Helpful pairs</Text>
          {reviewData.positivePairs.length ? (
            reviewData.positivePairs.map((line) => (
              <Text key={line} style={styles.reviewBullet}>
                • {line}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyInfo}>No positive pair suggestions yet.</Text>
          )}

          <Text style={styles.reviewSectionTitle}>Advice</Text>
          {reviewData.advice.map((line) => (
            <Text key={line} style={styles.reviewBullet}>
              • {line}
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );

  const suspiciousScreen = (
    <ScrollView contentContainerStyle={[styles.contentWrap, { paddingBottom: insets.bottom + 44 }]}>
      {renderScreenHeader("Suspicious Foods", "Mark foods that trigger stomach upset")}

      <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>All suspicious foods together</Text>
        {suspiciousItems.length ? (
          suspiciousItems.map((item) => (
            <View key={`${item.name}_${item.lastSeen}`} style={styles.suspiciousSummaryRow}>
              <Text style={styles.suspiciousSummaryName}>{item.name}</Text>
              <Text style={styles.suspiciousSummaryMeta}>
                {item.count} mark(s) • last {item.lastSeen}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyInfo}>No suspicious foods marked yet.</Text>
        )}
      </View>

      <View style={[styles.formCard, isDarkMode && styles.formCardDark]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.titleDark]}>Revisit old logs (last 14 days)</Text>
        {getPastDateKeys(14).map((dateKey) => {
          const log = allLogs[dateKey];
          if (!log) return null;
          const items = mealMeta.flatMap((meal) =>
            log.meals[meal.key].items.map((item) => ({ ...item, meal: meal.key }))
          );
          if (!items.length) return null;

          return (
            <View key={dateKey} style={styles.revisitCard}>
              <Text style={styles.revisitDate}>{dateKey}</Text>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => toggleSuspicious(dateKey, item.meal, item.id)}
                  style={({ pressed }) => [styles.revisitRow, pressed && styles.pressed]}
                >
                  <View>
                    <Text style={styles.revisitFood}>{item.name}</Text>
                    <Text style={styles.revisitMeal}>{item.meal}</Text>
                  </View>

                  <MaterialCommunityIcons
                    name={item.suspicious ? "alert-circle" : "alert-circle-outline"}
                    size={22}
                    color={item.suspicious ? theme.colors.danger : theme.colors.textMuted}
                  />
                </Pressable>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const getMainScreen = () => {
    if (extraPage === "aiFeedback") return aiFeedbackScreen;
    if (extraPage === "suspiciousFoods") return suspiciousScreen;

    if (activeTab === "home") return homeScreen;
    if (activeTab === "meds") return medsScreen;
    if (activeTab === "water") return waterScreen;
    if (activeTab === "stool") return stoolScreen;
    return settingsScreen;
  };

  if (loading || showBootSpinner) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentPalette.background }]}> 
        <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={currentPalette.background} />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loaderText, isDarkMode && styles.textSecondaryDark]}>Loading GutLogs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentPalette.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={currentPalette.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
        style={styles.safeArea}
      >
        <View style={[styles.container, { backgroundColor: currentPalette.background }]}> 
          {extraPage ? (
            <View style={[styles.extraHeader, { backgroundColor: currentPalette.background }]}>
              <Pressable onPress={() => setExtraPage(null)} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                <Feather name="arrow-left" size={18} color={currentPalette.textPrimary} />
                <Text style={[styles.backButtonLabel, isDarkMode && styles.titleDark]}>Back</Text>
              </Pressable>
            </View>
          ) : null}

          {getMainScreen()}

          {!extraPage && !keyboardVisible ? (
            <BottomNav activeTab={activeTab} onTabPress={setActiveTab} isDarkMode={isDarkMode} />
          ) : null}
        </View>

        <Modal visible={!!itemModalMeal} animationType="fade" transparent onRequestClose={() => setItemModalMeal(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setItemModalMeal(null)}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalKeyboardWrap}>
              <Pressable style={[styles.modalCard, isDarkMode && styles.modalCardDark]} onPress={() => undefined}>
                <Text style={[styles.modalTitle, isDarkMode && styles.titleDark]}>Add Food Item</Text>
                <Text style={[styles.modalSubtitle, isDarkMode && styles.textSecondaryDark]}>
                  {mealMeta.find((meal) => meal.key === itemModalMeal)?.title}
                </Text>

                <TextInput
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder={mealMeta.find((meal) => meal.key === itemModalMeal)?.placeholder ?? "Food name"}
                  placeholderTextColor={isDarkMode ? "#95A7BC" : theme.colors.textMuted}
                  style={[styles.input, isDarkMode && styles.inputDark]}
                />

                <TextInput
                  value={itemQty}
                  onChangeText={setItemQty}
                  keyboardType="numeric"
                  placeholder="Quantity"
                  placeholderTextColor={isDarkMode ? "#95A7BC" : theme.colors.textMuted}
                  style={[styles.input, isDarkMode && styles.inputDark]}
                />

                <View style={styles.unitWrap}>
                  {(["g", "ml"] as const).map((unit) => (
                    <Pressable
                      key={unit}
                      onPress={() => setItemUnit(unit)}
                      style={({ pressed }) => [
                        styles.unitChip,
                        isDarkMode && styles.unitChipDark,
                        itemUnit === unit && styles.unitChipActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.unitChipLabel, itemUnit === unit && styles.unitChipLabelActive]}>
                        {unit}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable onPress={handleAddFoodItem} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                  <Text style={styles.primaryButtonLabel}>Save Item</Text>
                </Pressable>
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  stoolContentWrap: {
    paddingTop: theme.spacing.xl,
  },
  headerWrap: {
    marginBottom: theme.spacing.md,
  },
  screenTitle: {
    fontSize: 32,
    color: theme.colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  screenSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  dateSwitcher: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "#EEE7DF",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  dateSwitcherDark: {
    backgroundColor: "#18202D",
    borderColor: "#2A374A",
  },
  switcherText: {
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  circleIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F5F0",
    minWidth: 44,
    minHeight: 44,
  },
  circleIconButtonDark: {
    backgroundColor: "#202B3A",
  },
  summaryStrip: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    ...theme.shadow.sm,
  },
  summaryCardDark: {
    backgroundColor: "#18202D",
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  summaryLabel: {
    marginTop: 2,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  emptyStateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  emptyIllustration: {
    width: "100%",
    height: 170,
    borderRadius: theme.radius.md,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: theme.colors.sageSoft,
    borderRadius: theme.radius.full,
    paddingVertical: 13,
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonLabel: {
    color: "#4A5D4F",
    fontWeight: "700",
    fontSize: 14,
  },
  ghostButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D0E6FA",
    borderRadius: theme.radius.full,
    paddingVertical: 11,
    minHeight: 44,
    alignItems: "center",
  },
  ghostButtonLabel: {
    color: "#3F6A8F",
    fontWeight: "600",
  },
  ghostDangerButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F6C8C7",
    borderRadius: theme.radius.full,
    paddingVertical: 11,
    minHeight: 44,
    alignItems: "center",
  },
  ghostDangerLabel: {
    color: "#D85D5B",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  medsTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  medsHintCard: {
    flex: 1,
    backgroundColor: "#F3ECFF",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    minHeight: 110,
    justifyContent: "center",
  },
  medsHintTitle: {
    color: "#6A5299",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  medsHintBody: {
    color: "#6D6480",
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.md,
  },
  formCardDark: {
    backgroundColor: "#18202D",
    borderWidth: 1,
    borderColor: "#2A374A",
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FAF8F6",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    color: theme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 46,
    marginBottom: 8,
  },
  inputDark: {
    backgroundColor: "#202A38",
    borderColor: "#34445A",
    color: "#EDF4FF",
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  medRowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    marginBottom: theme.spacing.sm,
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  medRowCardDark: {
    backgroundColor: "#202A38",
    borderColor: "#334258",
  },
  medTick: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D3CADF",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  medTickActive: {
    backgroundColor: "#A086D3",
    borderColor: "#A086D3",
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  medDose: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 2,
  },
  timeInput: {
    backgroundColor: "#FAF8F6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: theme.colors.textPrimary,
    maxWidth: 96,
  },
  emptyInfo: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  waterButtonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  waterQuickButton: {
    flex: 1,
    backgroundColor: "#D6ECFF",
    borderRadius: theme.radius.full,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  waterQuickLabel: {
    color: "#366D9F",
    fontWeight: "700",
  },
  streakText: {
    color: "#466F90",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  tabToggleWrap: {
    flexDirection: "row",
    backgroundColor: "#F4EEE7",
    borderRadius: theme.radius.full,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  segmentButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.full,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.surface,
  },
  segmentLabel: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  segmentLabelActive: {
    color: theme.colors.textPrimary,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: chipColor.activeBg,
    borderColor: chipColor.activeBorder,
  },
  chipInactive: {
    backgroundColor: chipColor.inactiveBg,
    borderColor: chipColor.inactiveBorder,
  },
  chipPressed: {
    opacity: 0.75,
  },
  chipLabel: {
    fontWeight: "600",
  },
  chipLabelActive: {
    color: chipColor.activeText,
  },
  chipLabelInactive: {
    color: chipColor.inactiveText,
  },
  timelineRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8DF",
    paddingVertical: 12,
    gap: 10,
  },
  timelineDateCol: {
    width: 94,
  },
  timelineDate: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 12,
  },
  timelineEmoji: {
    marginTop: 6,
    fontSize: 17,
  },
  timelineDetails: {
    flex: 1,
  },
  timelineMain: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
  },
  timelineSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: -2,
  },
  titleDark: {
    color: "#EDF4FF",
  },
  textSecondaryDark: {
    color: "#C2CEDF",
  },
  cityRow: {
    flexDirection: "row",
    gap: 10,
  },
  cityButton: {
    flex: 1,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cityButtonActive: {
    backgroundColor: "#F9E8E2",
    borderColor: "#E8B6A8",
  },
  cityButtonLabel: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  cityButtonLabelActive: {
    color: theme.colors.primary,
  },
  infoText: {
    marginTop: 12,
    color: "#55735C",
    fontWeight: "500",
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
  backButtonLabel: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  cautionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cautionBadge: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cautionLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  cautionLow: {
    backgroundColor: "#58C28F",
  },
  cautionMedium: {
    backgroundColor: "#DBA840",
  },
  cautionHigh: {
    backgroundColor: "#D8605E",
  },
  reviewSummary: {
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: 10,
  },
  reviewSectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  reviewBullet: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  errorTextGlobal: {
    color: theme.colors.danger,
    marginTop: 10,
    marginBottom: 6,
  },
  suspiciousSummaryRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3ECE3",
    paddingVertical: 10,
  },
  suspiciousSummaryName: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  suspiciousSummaryMeta: {
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  revisitCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFE7DE",
    borderRadius: theme.radius.md,
    padding: 10,
  },
  revisitDate: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    marginBottom: 8,
  },
  revisitRow: {
    borderTopWidth: 1,
    borderTopColor: "#F3ECE3",
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revisitFood: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  revisitMeal: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: "capitalize",
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  modalKeyboardWrap: {
    width: "100%",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 20,
    minHeight: 300,
    width: "92%",
    maxWidth: 440,
  },
  modalCardDark: {
    backgroundColor: "#18202D",
    borderWidth: 1,
    borderColor: "#2A374A",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  unitWrap: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  unitChip: {
    flex: 1,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: "#EFE6DC",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  unitChipDark: {
    borderColor: "#3B4B62",
    backgroundColor: "#202A38",
  },
  unitChipActive: {
    backgroundColor: "#F9E8E2",
    borderColor: "#E8B6A8",
  },
  unitChipLabel: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  unitChipLabelActive: {
    color: theme.colors.primary,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loaderText: {
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
});

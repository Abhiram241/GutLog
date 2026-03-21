/**
 * useMeals.ts
 *
 * Encapsulates all meal-related logic:
 * - Adding food items
 * - Toggling outside food
 * - Generating macros via Gemini
 */

import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { Keyboard, LayoutAnimation } from "react-native";

import { mealMeta } from "../constants/mealMeta";
import { generateMacros } from "../services/geminiService";
import { DayLog, FoodItem, MealType, SettingsData, UnitType } from "../types";

interface UseMealsOptions {
  currentDateKey: string;
  settings: SettingsData;
  updateLog: (
    dateKey: string,
    updater: (log: DayLog) => DayLog,
  ) => Promise<void>;
}

export function useMeals({
  currentDateKey,
  settings,
  updateLog,
}: UseMealsOptions) {
  // ─── Add item modal state ────────────────────────────────────────────────────
  const [itemModalMeal, setItemModalMeal] = useState<MealType | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("40");
  const [itemUnit, setItemUnit] = useState<UnitType>("g");

  // ─── Macro generation state ──────────────────────────────────────────────────
  const [macroLoadingMeal, setMacroLoadingMeal] = useState<MealType | null>(
    null,
  );

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const openAddItem = useCallback((mealType: MealType) => {
    setItemModalMeal(mealType);
    setItemName("");
    setItemQty("40");
    setItemUnit("g");
  }, []);

  const closeAddItem = useCallback(() => {
    setItemModalMeal(null);
  }, []);

  const handleAddFoodItem = useCallback(
    async (currentLog: DayLog) => {
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
    },
    [itemModalMeal, itemName, itemQty, itemUnit, currentDateKey, updateLog],
  );

  const toggleOutsideFood = useCallback(
    async (mealType: MealType) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await Haptics.selectionAsync();
      await updateLog(currentDateKey, (log) => {
        log.meals[mealType].outsideFoodChecked =
          !log.meals[mealType].outsideFoodChecked;
        return log;
      });
    },
    [currentDateKey, updateLog],
  );

  const handleGenerateMacros = useCallback(
    async (mealType: MealType, currentLog: DayLog) => {
      if (!settings.geminiApiKey.trim()) return;
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
          mealMeta.find((m) => m.key === mealType)?.title ?? mealType,
          mealLog.items,
        );
        await updateLog(currentDateKey, (log) => {
          log.meals[mealType].macro = result;
          log.meals[mealType].macroError = "";
          return log;
        });
      } catch (error) {
        await updateLog(currentDateKey, (log) => {
          log.meals[mealType].macroError =
            error instanceof Error
              ? error.message
              : "Could not generate macros right now.";
          return log;
        });
      } finally {
        setMacroLoadingMeal(null);
      }
    },
    [settings, currentDateKey, updateLog],
  );

  const toggleSuspicious = useCallback(
    async (dateKey: string, mealType: MealType, itemId: string) => {
      await updateLog(dateKey, (log) => {
        const item = log.meals[mealType].items.find((i) => i.id === itemId);
        if (item) item.suspicious = !item.suspicious;
        return log;
      });
    },
    [updateLog],
  );

  return {
    // Modal state
    itemModalMeal,
    itemName,
    itemQty,
    itemUnit,
    setItemName,
    setItemQty,
    setItemUnit,
    // Macro state
    macroLoadingMeal,
    // Actions
    openAddItem,
    closeAddItem,
    handleAddFoodItem,
    toggleOutsideFood,
    handleGenerateMacros,
    toggleSuspicious,
  };
}

/**
 * useAIReview.ts
 *
 * Encapsulates AI review generation logic.
 * Keeps all Gemini-related state and calls out of the screen component.
 */

import { useCallback, useState } from "react";

import { mealMeta } from "../constants/mealMeta";
import { generateReview } from "../services/geminiService";
import { AIReviewResult, DayLog, MedItem, SettingsData } from "../types";
import { getTodayDateKey } from "../utils/date";
import { createEmptyDayLog } from "../utils/logHelpers";

interface UseAIReviewOptions {
  allLogs: Record<string, DayLog>;
  medsMaster: MedItem[];
  settings: SettingsData;
}

export function useAIReview({
  allLogs,
  medsMaster,
  settings,
}: UseAIReviewOptions) {
  const todayKey = getTodayDateKey();

  const [reviewDateKey, setReviewDateKey] = useState(todayKey);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewData, setReviewData] = useState<AIReviewResult | null>(null);

  const triggerAIReview = useCallback(async () => {
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
    setIsReviewLoading(true);

    try {
      const result = await generateReview(
        settings.geminiApiKey,
        settings.city,
        reviewDateKey,
        foods,
        medsTaken,
      );
      setReviewData(result);
    } catch (error) {
      setReviewData(null);
      setReviewError(
        error instanceof Error ? error.message : "Could not generate review.",
      );
    } finally {
      setIsReviewLoading(false);
    }
  }, [allLogs, medsMaster, settings, reviewDateKey]);

  return {
    reviewDateKey,
    setReviewDateKey,
    isReviewLoading,
    reviewError,
    reviewData,
    triggerAIReview,
  };
}

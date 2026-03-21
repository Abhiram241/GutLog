/**
 * AIFeedbackScreen.tsx
 *
 * AI-powered daily review of food and medication interactions.
 * Logic lives in useAIReview hook. This component is UI-only.
 */

import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { DateSwitcher } from "../components/DateSwitcher";
import { FormCard } from "../components/FormCard";
import { ScreenHeader } from "../components/ScreenHeader";
import { theme } from "../constants/theme";
import { useAppTheme } from "../context/ThemeContext";
import { AIReviewResult } from "../types";
import { shiftDateKey } from "../utils/date";

interface AIFeedbackScreenProps {
  reviewDateKey: string;
  todayKey: string;
  isReviewLoading: boolean;
  reviewError: string;
  reviewData: AIReviewResult | null;
  isDarkMode: boolean;
  onDateChange: (dateKey: string) => void;
  onOpenCalendar: () => void;
  onGenerateReview: () => void;
}

export function AIFeedbackScreen({
  reviewDateKey,
  todayKey,
  isReviewLoading,
  reviewError,
  reviewData,
  isDarkMode,
  onDateChange,
  onOpenCalendar,
  onGenerateReview,
}: AIFeedbackScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 44 },
      ]}
    >
      <ScreenHeader
        title="AI Feedback"
        subtitle="Food + meds reaction review"
        icon="sparkles-outline"
        isDarkMode={isDarkMode}
      />

      <DateSwitcher
        dateKey={reviewDateKey}
        todayKey={todayKey}
        isDarkMode={isDarkMode}
        onPrev={() => onDateChange(shiftDateKey(reviewDateKey, -1))}
        onNext={() =>
          onDateChange(
            reviewDateKey === todayKey
              ? reviewDateKey
              : shiftDateKey(reviewDateKey, 1),
          )
        }
        onOpenCalendar={onOpenCalendar}
      />

      <Pressable
        onPress={onGenerateReview}
        style={({ pressed }) => [styles.generateBtn, pressed && styles.pressed]}
      >
        <Ionicons
          name={isReviewLoading ? "hourglass-outline" : "sparkles-outline"}
          size={18}
          color="#FFFFFF"
        />
        <Text style={styles.generateBtnLabel}>
          {isReviewLoading ? "Generating..." : "Generate Daily Review"}
        </Text>
      </Pressable>

      {!!reviewError && <Text style={styles.errorText}>{reviewError}</Text>}

      {reviewData ? (
        <FormCard isDarkMode={isDarkMode}>
          <View style={styles.cautionRow}>
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              Review
            </Text>
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
              <Text style={styles.cautionLabel}>
                {reviewData.cautionLevel.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={[styles.summary, { color: palette.textPrimary }]}>
            {reviewData.summary}
          </Text>

          <ReviewSection
            title="Potential reactions"
            items={reviewData.potentialReactions}
            emptyText="No specific reactions flagged."
            isDarkMode={isDarkMode}
          />
          <ReviewSection
            title="Helpful pairs"
            items={reviewData.positivePairs}
            emptyText="No positive pair suggestions yet."
            isDarkMode={isDarkMode}
          />
          <ReviewSection
            title="Advice"
            items={reviewData.advice}
            isDarkMode={isDarkMode}
          />
        </FormCard>
      ) : null}
    </ScrollView>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface ReviewSectionProps {
  title: string;
  items: string[];
  emptyText?: string;
  isDarkMode: boolean;
}

function ReviewSection({
  title,
  items,
  emptyText,
  isDarkMode,
}: ReviewSectionProps) {
  const { palette } = useAppTheme();
  return (
    <>
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
        {title}
      </Text>
      {items.length ? (
        items.map((line) => (
          <Text
            key={line}
            style={[styles.bullet, { color: palette.textSecondary }]}
          >
            • {line}
          </Text>
        ))
      ) : emptyText ? (
        <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
          {emptyText}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  generateBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  generateBtnLabel: { color: "#FFFFFF", fontWeight: "700" },
  errorText: { color: theme.colors.danger, marginTop: 10, marginBottom: 6 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
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
  cautionLabel: { color: "#fff", fontWeight: "700", fontSize: 11 },
  cautionLow: { backgroundColor: "#58C28F" },
  cautionMedium: { backgroundColor: "#DBA840" },
  cautionHigh: { backgroundColor: "#D8605E" },
  summary: {
    lineHeight: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "700",
  },
  bullet: { lineHeight: 20 },
  emptyText: { fontSize: 13 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

/**
 * WaterBottle.tsx
 *
 * Animated water bottle visualization showing hydration progress.
 * Uses Reanimated for smooth fill animation.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { theme } from "../constants/theme";

interface WaterBottleProps {
  progress: number; // 0 to 1
  amount: number; // current ml
  goal: number; // goal ml
  isDarkMode?: boolean;
}

const BOTTLE_HEIGHT = 220;

export function WaterBottle({
  progress,
  amount,
  goal,
  isDarkMode = false,
}: WaterBottleProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(progress, 1)), {
      duration: 650,
    });
  }, [animatedProgress, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: Math.max(8, animatedProgress.value * (BOTTLE_HEIGHT - 8)),
  }));

  return (
    <View style={styles.wrap}>
      <View style={[styles.cap, isDarkMode && styles.capDark]} />
      <View style={[styles.bottle, isDarkMode && styles.bottleDark]}>
        <Animated.View
          style={[styles.fill, isDarkMode && styles.fillDark, fillStyle]}
        />
        <View style={styles.overlay}>
          <Text
            style={[styles.amountText, isDarkMode && styles.amountTextDark]}
          >
            {amount} ml
          </Text>
          <Text style={[styles.goalText, isDarkMode && styles.goalTextDark]}>
            Goal {goal} ml
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  cap: {
    width: 56,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#A5C8E8",
  },
  capDark: { backgroundColor: "#2A4A6A" },
  bottle: {
    width: 170,
    height: BOTTLE_HEIGHT,
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: "#A5C8E8",
    backgroundColor: "#EEF7FF",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bottleDark: {
    borderColor: "#2A4A6A",
    backgroundColor: theme.dark.surfaceMuted,
  },
  fill: {
    width: "100%",
    backgroundColor: theme.colors.skyDeep,
    opacity: 0.85,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    position: "absolute",
    bottom: 0,
  },
  fillDark: { backgroundColor: "#2E6EA6", opacity: 0.9 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  amountText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  amountTextDark: { color: theme.dark.textPrimary },
  goalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  goalTextDark: { color: theme.dark.textSecondary },
});

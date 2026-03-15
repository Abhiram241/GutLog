import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { theme } from "@/constants/theme";

interface WaterBottleProps {
  progress: number;
  amount: number;
  goal: number;
}

const BOTTLE_HEIGHT = 220;

export function WaterBottle({ progress, amount, goal }: WaterBottleProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(progress, 1)), { duration: 650 });
  }, [animatedProgress, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: Math.max(8, animatedProgress.value * (BOTTLE_HEIGHT - 8)),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.cap} />
      <View style={styles.bottle}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <View style={styles.overlay}>
          <Text style={styles.amountText}>{amount} ml</Text>
          <Text style={styles.goalText}>Goal {goal} ml</Text>
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
  fill: {
    width: "100%",
    backgroundColor: theme.colors.skyDeep,
    opacity: 0.85,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    position: "absolute",
    bottom: 0,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  amountText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  goalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
});

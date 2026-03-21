/**
 * ProgressRing.tsx
 *
 * SVG circular progress indicator with a centered label.
 * Used on the Meds screen to show daily completion.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { theme } from "../constants/theme";

interface ProgressRingProps {
  progress: number; // 0 to 1
  label: string;
  subLabel: string;
  color?: string;
  isDarkMode?: boolean;
}

export function ProgressRing({
  progress,
  label,
  subLabel,
  color,
  isDarkMode = false,
}: ProgressRingProps) {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(progress, 1));
  const offset = circumference * (1 - normalized);
  const trackColor = isDarkMode ? theme.dark.border : "#EFEAE4";

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color ?? theme.colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.centerLabel}>
        <Text style={[styles.valueText, isDarkMode && styles.valueTextDark]}>
          {label}
        </Text>
        <Text style={[styles.subText, isDarkMode && styles.subTextDark]}>
          {subLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
  },
  valueText: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  valueTextDark: { color: theme.dark.textPrimary },
  subText: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  subTextDark: { color: theme.dark.textSecondary },
});

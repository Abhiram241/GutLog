import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { theme } from "@/constants/theme";

interface ProgressRingProps {
  progress: number;
  label: string;
  subLabel: string;
  color?: string;
}

export function ProgressRing({ progress, label, subLabel, color }: ProgressRingProps) {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(progress, 1));
  const offset = circumference * (1 - normalized);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EFEAE4"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
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
        <Text style={styles.valueText}>{label}</Text>
        <Text style={styles.subText}>{subLabel}</Text>
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
  subText: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

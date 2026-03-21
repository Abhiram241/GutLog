/**
 * GymWorkoutScreen.tsx
 *
 * Main workout screen - start workouts from routines or view active workout.
 * Shows available routines if no workout is active, or the live workout session.
 */

import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../../components/ScreenHeader";
import { RoutineCard } from "../../components/gym/RoutineCard";
import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { Routine } from "../../types/gym";

interface GymWorkoutScreenProps {
  routines: Routine[];
  hasActiveWorkout: boolean;
  isDarkMode: boolean;
  onStartWorkout: (routine: Routine) => void;
  onResumeWorkout: () => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onCreateRoutine: () => void;
}

export function GymWorkoutScreen({
  routines,
  hasActiveWorkout,
  isDarkMode,
  onStartWorkout,
  onResumeWorkout,
  onEditRoutine,
  onDeleteRoutine,
  onCreateRoutine,
}: GymWorkoutScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.screenPad}>
        <ScreenHeader
          title="Workout"
          subtitle={
            hasActiveWorkout ? "Resume your workout" : "Choose a routine"
          }
          isDarkMode={isDarkMode}
        />
      </View>

      {/* Active workout banner */}
      {hasActiveWorkout && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={onResumeWorkout}
          activeOpacity={0.8}
        >
          <View style={styles.activeBannerContent}>
            <Feather name="play-circle" size={24} color="#FFFFFF" />
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerTitle}>Workout in Progress</Text>
              <Text style={styles.activeBannerSubtitle}>Tap to resume</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {routines.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, isDarkMode && styles.emptyIconDark]}>
            <Feather name="list" size={48} color="#4ECDC4" />
          </View>
          <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
            No Routines Yet
          </Text>
          <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
            Create your first workout routine to get started
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={onCreateRoutine}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Routine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Routines list */
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          renderItem={({ item }) => (
            <RoutineCard
              routine={item}
              isDarkMode={isDarkMode}
              onPress={() => onEditRoutine(item)}
              onStartWorkout={() => onStartWorkout(item)}
              onEdit={() => onEditRoutine(item)}
              onDelete={() => onDeleteRoutine(item.id)}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.addRoutineButton]}
              onPress={onCreateRoutine}
            >
              <Feather name="plus" size={20} color="#4ECDC4" />
              <Text style={styles.addRoutineText}>Create New Routine</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenPad: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4ECDC4",
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  activeBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  activeBannerText: {},
  activeBannerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  activeBannerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  emptyIconDark: {
    backgroundColor: "rgba(78, 205, 196, 0.2)",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  addRoutineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    borderStyle: "dashed",
  },
  addRoutineButtonDark: {
    borderColor: "#4ECDC4",
  },
  addRoutineText: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
});

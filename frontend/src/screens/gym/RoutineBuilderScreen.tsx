/**
 * RoutineBuilderScreen.tsx
 *
 * Create or edit a workout routine.
 */

import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";
import { useAppTheme } from "../../context/ThemeContext";
import { GymAlert } from "../../components/gym/GymAlert";
import { useGymAlert } from "../../hooks/useGymAlert";
import { setTypeStyles, unitLabels } from "../../constants/gymTheme";
import {
  Routine,
  RoutineExercise,
  RoutineSet,
  Exercise,
  ExerciseUnit,
  SetType,
  MuscleGroup,
} from "../../types/gym";
import {
  generateId,
  createRoutineExercise,
  createRoutineSet,
  createExercise,
  getMuscleGroupLabel,
} from "../../utils/gymHelpers";

interface RoutineBuilderScreenProps {
  routine: Routine | null;
  exercises: Exercise[];
  isDarkMode: boolean;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
  onAddExercise: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "full_body",
  "cardio",
  "other",
];

const SET_TYPES: SetType[] = ["normal", "warmup", "dropset", "failure"];

export function RoutineBuilderScreen({
  routine: initialRoutine,
  exercises,
  isDarkMode,
  onSave,
  onCancel,
  onAddExercise,
}: RoutineBuilderScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { showAlert, alertProps } = useGymAlert();
  const isEditing = !!initialRoutine;

  const [routineName, setRoutineName] = useState(initialRoutine?.name || "");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>(
    initialRoutine?.exercises ?? [],
  );

  // Exercise picker modal
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(
    null,
  );

  // New exercise modal
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExUnit, setNewExUnit] = useState<ExerciseUnit>("reps");
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>("other");

  // Expanded exercise index
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // ─── Exercise management ──────────────────────────────────────────────────

  const handleAddExerciseToRoutine = useCallback((exercise: Exercise) => {
    const re = createRoutineExercise(exercise.id, exercise.name, exercise.unit);
    setRoutineExercises((prev) => [...prev, re]);
    setShowExercisePicker(false);
    setExerciseSearch("");
    setSelectedMuscle(null);
  }, []);

  const handleRemoveExercise = useCallback((idx: number) => {
    showAlert(
      "Remove Exercise?",
      "This will remove it from the routine.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setRoutineExercises((prev) => prev.filter((_, i) => i !== idx));
            setExpandedIdx(null);
          },
        },
      ],
      "minus-circle",
      "#E17055",
    );
  }, []);

  const handleMoveExercise = useCallback(
    (idx: number, direction: "up" | "down") => {
      setRoutineExercises((prev) => {
        const next = [...prev];
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= next.length) return prev;
        [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
        return next;
      });
    },
    [],
  );

  const handleUpdateNotes = useCallback((idx: number, notes: string) => {
    setRoutineExercises((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], notes };
      return next;
    });
  }, []);

  const handleUpdateRest = useCallback((idx: number, seconds: number) => {
    setRoutineExercises((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], restSeconds: seconds };
      return next;
    });
  }, []);

  // ─── Set management ───────────────────────────────────────────────────────

  const handleAddSet = useCallback((exIdx: number) => {
    setRoutineExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets = [
        ...ex.sets,
        createRoutineSet(
          lastSet?.targetWeight ?? 0,
          lastSet?.targetValue ?? 10,
        ),
      ];
      next[exIdx] = ex;
      return next;
    });
  }, []);

  const handleRemoveSet = useCallback((exIdx: number, setIdx: number) => {
    setRoutineExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      if (ex.sets.length <= 1) return prev;
      ex.sets = ex.sets.filter((_, i) => i !== setIdx);
      next[exIdx] = ex;
      return next;
    });
  }, []);

  const handleUpdateSet = useCallback(
    (
      exIdx: number,
      setIdx: number,
      field: keyof RoutineSet,
      value: string | SetType,
    ) => {
      setRoutineExercises((prev) => {
        const next = [...prev];
        const ex = { ...next[exIdx] };
        const sets = [...ex.sets];
        if (field === "setType") {
          sets[setIdx] = { ...sets[setIdx], setType: value as SetType };
        } else {
          const num = parseFloat(value as string);
          sets[setIdx] = { ...sets[setIdx], [field]: isNaN(num) ? 0 : num };
        }
        ex.sets = sets;
        next[exIdx] = ex;
        return next;
      });
    },
    [],
  );

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const name = routineName.trim();
    if (!name) {
      showAlert(
        "Name Required",
        "Please enter a routine name.",
        [{ text: "OK" }],
        "edit-2",
        "#FDCB6E",
      );
      return;
    }
    if (routineExercises.length === 0) {
      showAlert(
        "No Exercises",
        "Add at least one exercise to the routine.",
        [{ text: "OK" }],
        "activity",
        "#FDCB6E",
      );
      return;
    }

    const now = new Date().toISOString();
    const routine: Routine = {
      id: initialRoutine?.id ?? generateId(),
      name,
      folderId: initialRoutine?.folderId,
      exercises: routineExercises,
      createdAt: initialRoutine?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(routine);
  }, [routineName, routineExercises, initialRoutine, onSave]);

  // ─── Create new exercise ──────────────────────────────────────────────────

  const handleCreateExercise = useCallback(() => {
    const name = newExName.trim();
    if (!name) {
      showAlert(
        "Name Required",
        "Please enter an exercise name.",
        [{ text: "OK" }],
        "edit-2",
        "#FDCB6E",
      );
      return;
    }
    const ex = createExercise(name, newExUnit, [newExMuscle]);
    onAddExercise(ex);
    handleAddExerciseToRoutine(ex);
    setShowNewExercise(false);
    setNewExName("");
    setNewExUnit("reps");
    setNewExMuscle("other");
  }, [
    newExName,
    newExUnit,
    newExMuscle,
    onAddExercise,
    handleAddExerciseToRoutine,
  ]);

  // ─── Filtered exercises ───────────────────────────────────────────────────

  const filteredExercises = exercises.filter((ex) => {
    const matchSearch = ex.name
      .toLowerCase()
      .includes(exerciseSearch.toLowerCase());
    const matchMuscle =
      !selectedMuscle || ex.muscleGroups.includes(selectedMuscle);
    return matchSearch && matchMuscle;
  });

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderSetRow = (
    set: RoutineSet,
    setIdx: number,
    exIdx: number,
    unit: ExerciseUnit,
  ) => {
    const typeStyle = setTypeStyles[set.setType];
    const valueLabel = unitLabels[unit]?.short ?? "reps";

    return (
      <View key={set.id} style={styles.setRow}>
        {/* Set type indicator */}
        <TouchableOpacity
          style={[
            styles.setTypeBadge,
            { backgroundColor: typeStyle.color + "22" },
          ]}
          onPress={() => {
            const idx = SET_TYPES.indexOf(set.setType);
            const next = SET_TYPES[(idx + 1) % SET_TYPES.length];
            handleUpdateSet(exIdx, setIdx, "setType", next);
          }}
        >
          <Text style={[styles.setTypeText, { color: typeStyle.color }]}>
            {typeStyle.label[0]}
          </Text>
        </TouchableOpacity>

        {/* Weight */}
        <View
          style={[
            styles.setInputWrap,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.inputBorder,
            },
          ]}
        >
          <TextInput
            style={[styles.setInput, { color: palette.textPrimary }]}
            value={set.targetWeight > 0 ? String(set.targetWeight) : ""}
            onChangeText={(v) =>
              handleUpdateSet(exIdx, setIdx, "targetWeight", v)
            }
            placeholder="0"
            placeholderTextColor={palette.textMuted}
            keyboardType="numeric"
          />
          <Text style={[styles.setInputLabel, { color: palette.textMuted }]}>
            kg
          </Text>
        </View>

        {/* Value (reps/time) */}
        <View
          style={[
            styles.setInputWrap,
            {
              backgroundColor: palette.inputBg,
              borderColor: palette.inputBorder,
            },
          ]}
        >
          <TextInput
            style={[styles.setInput, { color: palette.textPrimary }]}
            value={set.targetValue > 0 ? String(set.targetValue) : ""}
            onChangeText={(v) =>
              handleUpdateSet(exIdx, setIdx, "targetValue", v)
            }
            placeholder="10"
            placeholderTextColor={palette.textMuted}
            keyboardType="numeric"
          />
          <Text style={[styles.setInputLabel, { color: palette.textMuted }]}>
            {valueLabel}
          </Text>
        </View>

        {/* Remove set */}
        <TouchableOpacity
          style={styles.removeSetBtn}
          onPress={() => handleRemoveSet(exIdx, setIdx)}
        >
          <Feather name="minus-circle" size={18} color={palette.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderExerciseItem = ({
    item,
    index,
  }: {
    item: RoutineExercise;
    index: number;
  }) => {
    const isExpanded = expandedIdx === index;

    return (
      <View
        style={[
          styles.exerciseCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {/* Exercise header */}
        <TouchableOpacity
          style={styles.exerciseHeader}
          onPress={() => setExpandedIdx(isExpanded ? null : index)}
          activeOpacity={0.7}
        >
          <View style={styles.exerciseHeaderLeft}>
            <View style={styles.exerciseOrderBadge}>
              <Text style={styles.exerciseOrderText}>{index + 1}</Text>
            </View>
            <View>
              <Text
                style={[styles.exerciseName, { color: palette.textPrimary }]}
              >
                {item.exerciseName}
              </Text>
              <Text style={[styles.exerciseMeta, { color: palette.textMuted }]}>
                {item.sets.length} set{item.sets.length !== 1 ? "s" : ""} ·{" "}
                {item.restSeconds}s rest
              </Text>
            </View>
          </View>
          <View style={styles.exerciseHeaderRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleMoveExercise(index, "up")}
              disabled={index === 0}
            >
              <Feather
                name="chevron-up"
                size={18}
                color={index === 0 ? palette.textMuted : palette.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleMoveExercise(index, "down")}
              disabled={index === routineExercises.length - 1}
            >
              <Feather
                name="chevron-down"
                size={18}
                color={
                  index === routineExercises.length - 1
                    ? palette.textMuted
                    : palette.textSecondary
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleRemoveExercise(index)}
            >
              <Feather name="trash-2" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={palette.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.exerciseBody}>
            {/* Set header labels */}
            <View style={styles.setHeaderRow}>
              <Text
                style={[
                  styles.setHeaderLabel,
                  { color: palette.textMuted, width: 32 },
                ]}
              >
                Type
              </Text>
              <Text
                style={[
                  styles.setHeaderLabel,
                  { color: palette.textMuted, flex: 1 },
                ]}
              >
                Weight
              </Text>
              <Text
                style={[
                  styles.setHeaderLabel,
                  { color: palette.textMuted, flex: 1 },
                ]}
              >
                {unitLabels[item.unit]?.short ?? "Reps"}
              </Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Sets */}
            {item.sets.map((set, setIdx) =>
              renderSetRow(set, setIdx, index, item.unit),
            )}

            {/* Add set */}
            <TouchableOpacity
              style={[styles.addSetBtn, { borderColor: "#4ECDC4" }]}
              onPress={() => handleAddSet(index)}
            >
              <Feather name="plus" size={16} color="#4ECDC4" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>

            {/* Rest time */}
            <View style={styles.restRow}>
              <Text
                style={[styles.restLabel, { color: palette.textSecondary }]}
              >
                Rest time
              </Text>
              <View style={styles.restControls}>
                {[30, 60, 90, 120, 180].map((sec) => (
                  <TouchableOpacity
                    key={sec}
                    style={[
                      styles.restChip,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: palette.inputBorder,
                      },
                      item.restSeconds === sec && styles.restChipActive,
                    ]}
                    onPress={() => handleUpdateRest(index, sec)}
                  >
                    <Text
                      style={[
                        styles.restChipText,
                        { color: palette.textSecondary },
                        item.restSeconds === sec && styles.restChipTextActive,
                      ]}
                    >
                      {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                  color: palette.textPrimary,
                },
              ]}
              value={item.notes ?? ""}
              onChangeText={(v) => handleUpdateNotes(index, v)}
              placeholder="Exercise notes (optional)"
              placeholderTextColor={palette.textMuted}
              multiline
            />
          </View>
        )}
      </View>
    );
  };

  // ─── Exercise picker modal ────────────────────────────────────────────────

  const renderExercisePicker = () => (
    <Modal
      visible={showExercisePicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowExercisePicker(false)}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: palette.background }]}
      >
        {/* Modal header */}
        <View
          style={[styles.modalHeader, { borderBottomColor: palette.border }]}
        >
          <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
            Add Exercise
          </Text>
          <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
            <Feather name="x" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Exercise list — takes all available space */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exercisePickerList}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="search" size={32} color={palette.textMuted} />
              <Text
                style={[styles.emptyText, { color: palette.textSecondary }]}
              >
                No exercises found
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.exercisePickerItem,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
              onPress={() => handleAddExerciseToRoutine(item)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.exercisePickerName,
                    { color: palette.textPrimary },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.exercisePickerMeta,
                    { color: palette.textMuted },
                  ]}
                >
                  {item.muscleGroups.map(getMuscleGroupLabel).join(", ")} ·{" "}
                  {item.unit}
                </Text>
              </View>
              <Feather name="plus-circle" size={22} color="#4ECDC4" />
            </TouchableOpacity>
          )}
        />

        {/* ── Bottom controls — thumb-reachable zone ── */}
        <View
          style={[
            styles.pickerBottom,
            {
              borderTopColor: palette.border,
              backgroundColor: palette.surface,
            },
          ]}
        >
          {/* Muscle group filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.muscleFilterScroll}
            contentContainerStyle={styles.muscleFilterContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={[
                styles.muscleChip,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.inputBorder,
                },
                !selectedMuscle && styles.muscleChipActive,
              ]}
              onPress={() => setSelectedMuscle(null)}
            >
              <Text
                style={[
                  styles.muscleChipText,
                  { color: palette.textSecondary },
                  !selectedMuscle && styles.muscleChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {MUSCLE_GROUPS.map((mg) => (
              <TouchableOpacity
                key={mg}
                style={[
                  styles.muscleChip,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.inputBorder,
                  },
                  selectedMuscle === mg && styles.muscleChipActive,
                ]}
                onPress={() =>
                  setSelectedMuscle(selectedMuscle === mg ? null : mg)
                }
              >
                <Text
                  style={[
                    styles.muscleChipText,
                    { color: palette.textSecondary },
                    selectedMuscle === mg && styles.muscleChipTextActive,
                  ]}
                >
                  {getMuscleGroupLabel(mg)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search */}
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
              },
            ]}
          >
            <Feather name="search" size={16} color={palette.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: palette.textPrimary }]}
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              placeholder="Search exercises..."
              placeholderTextColor={palette.textMuted}
            />
            {exerciseSearch.length > 0 && (
              <TouchableOpacity onPress={() => setExerciseSearch("")}>
                <Feather name="x-circle" size={16} color={palette.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Create new exercise button */}
          <TouchableOpacity
            style={styles.createExBtn}
            onPress={() => {
              setShowExercisePicker(false);
              setShowNewExercise(true);
            }}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.createExBtnText}>Create New Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─── New exercise modal ───────────────────────────────────────────────────

  const renderNewExerciseModal = () => (
    <Modal
      visible={showNewExercise}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowNewExercise(false)}
    >
      <ScrollView
        style={[styles.modalContainer, { backgroundColor: palette.background }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={[styles.modalHeader, { borderBottomColor: palette.border }]}
        >
          <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
            New Exercise
          </Text>
          <TouchableOpacity onPress={() => setShowNewExercise(false)}>
            <Feather name="x" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.newExForm}>
          {/* Name */}
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
            Exercise Name
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                color: palette.textPrimary,
              },
            ]}
            value={newExName}
            onChangeText={setNewExName}
            placeholder="e.g. Bench Press"
            placeholderTextColor={palette.textMuted}
            autoFocus
          />

          {/* Unit */}
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
            Tracking Unit
          </Text>
          <View style={styles.unitRow}>
            {(["reps", "seconds", "minutes"] as ExerciseUnit[]).map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                  newExUnit === u && styles.unitChipActive,
                ]}
                onPress={() => setNewExUnit(u)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    newExUnit === u && styles.unitChipTextActive,
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Muscle group */}
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
            Primary Muscle
          </Text>
          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map((mg) => (
              <TouchableOpacity
                key={mg}
                style={[
                  styles.muscleGridChip,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                  newExMuscle === mg && styles.muscleChipActive,
                ]}
                onPress={() => setNewExMuscle(mg)}
              >
                <Text
                  style={[
                    styles.muscleChipText,
                    newExMuscle === mg && styles.muscleChipTextActive,
                  ]}
                >
                  {getMuscleGroupLabel(mg)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save */}
          <TouchableOpacity
            style={styles.saveExBtn}
            onPress={handleCreateExercise}
          >
            <Feather name="check" size={18} color="#FFFFFF" />
            <Text style={styles.saveExBtnText}>Create Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.surface,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.headerBtn} onPress={onCancel}>
          <Feather name="x" size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
          {isEditing ? "Edit Routine" : "New Routine"}
        </Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={routineExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Routine name input */}
            <TextInput
              style={[
                styles.routineNameInput,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="Routine name..."
              placeholderTextColor={palette.textMuted}
              maxLength={60}
            />
            {routineExercises.length > 0 && (
              <Text
                style={[styles.exerciseCount, { color: palette.textMuted }]}
              >
                {routineExercises.length} exercise
                {routineExercises.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="activity" size={40} color={palette.textMuted} />
            <Text style={[styles.emptyTitle, { color: palette.textSecondary }]}>
              No exercises yet
            </Text>
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>
              Tap the button below to add exercises
            </Text>
          </View>
        }
        renderItem={renderExerciseItem}
      />

      {/* Add exercise FAB */}
      <View style={[styles.fabWrap, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowExercisePicker(true)}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {renderExercisePicker()}
      {renderNewExerciseModal()}
      <GymAlert {...alertProps} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  // List
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  listHeader: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  routineNameInput: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  exerciseCount: {
    fontSize: 13,
    paddingLeft: 4,
  },

  // Exercise card
  exerciseCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
  },
  exerciseHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    flex: 1,
  },
  exerciseOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4ECDC4",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseOrderText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
  },
  exerciseMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // Exercise body
  exerciseBody: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  setHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingBottom: 4,
  },
  setHeaderLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Set row
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  setTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  setTypeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  setInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
  },
  setInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  setInputLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  removeSetBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  // Add set
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  addSetText: {
    color: "#4ECDC4",
    fontWeight: "600",
    fontSize: 14,
  },

  // Rest
  restRow: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  restLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  restControls: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    flexWrap: "wrap",
  },
  restChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  restChipActive: {
    backgroundColor: "transparent",
    borderColor: "#4ECDC4",
  },
  restChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  restChipTextActive: {
    color: "#4ECDC4",
    fontWeight: "700",
  },

  // Notes
  notesInput: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.sm,
    fontSize: 14,
    minHeight: 60,
    marginTop: theme.spacing.sm,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

  // FAB
  fabWrap: {
    position: "absolute",
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    alignItems: "center",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    ...theme.shadow.md,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
  },
  pickerBottom: {
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
    color: theme.colors.textPrimary, // fallback; overridden by inline style
  },

  // Muscle filter
  muscleFilterScroll: {
    maxHeight: 44,
  },
  muscleFilterContent: {
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  muscleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  muscleChipActive: {
    backgroundColor: "transparent",
    borderColor: "#4ECDC4",
  },
  muscleChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#636E72",
  },
  muscleChipTextActive: {
    color: "#4ECDC4",
    fontWeight: "700",
  },

  // Exercise picker list
  exercisePickerList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  exercisePickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
  },
  exercisePickerName: {
    fontSize: 15,
    fontWeight: "600",
  },
  exercisePickerMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Create exercise button
  createExBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingVertical: 14,
    borderRadius: theme.radius.full,
  },
  createExBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // New exercise form
  newExForm: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    fontSize: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  unitRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  unitChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  unitChipActive: {
    backgroundColor: "transparent",
    borderColor: "#4ECDC4",
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#636E72",
  },
  unitChipTextActive: {
    color: "#4ECDC4",
    fontWeight: "700",
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  muscleGridChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  saveExBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4ECDC4",
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.md,
  },
  saveExBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

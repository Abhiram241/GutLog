/**
 * RoutineBuilderScreen.tsx
 *
 * Create or edit a workout routine.
 * Add exercises, configure sets, weights, reps/time, and notes.
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../constants/theme';
import { setTypeStyles, unitLabels } from '../../constants/gymTheme';
import {
  Routine,
  RoutineExercise,
  RoutineSet,
  Exercise,
  ExerciseUnit,
  SetType,
  MuscleGroup,
} from '../../types/gym';
import {
  generateId,
  createRoutineExercise,
  createRoutineSet,
  createExercise,
  getMuscleGroupLabel,
} from '../../utils/gymHelpers';

interface RoutineBuilderScreenProps {
  routine: Routine | null;
  exercises: Exercise[];
  isDarkMode: boolean;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
  onAddExercise: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'core', 'quads', 'hamstrings', 'glutes', 'calves', 'full_body', 'cardio', 'other',
];

export function RoutineBuilderScreen({
  routine: initialRoutine,
  exercises,
  isDarkMode,
  onSave,
  onCancel,
  onAddExercise,
}: RoutineBuilderScreenProps) {
  const insets = useSafeAreaInsets();
  const isEditing = !!initialRoutine;

  // Routine state
  const [routineName, setRoutineName] = useState(initialRoutine?.name || '');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>(
    initialRoutine?.exercises || []
  );

  // Modal states
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  // New exercise form
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseUnit, setNewExerciseUnit] = useState<ExerciseUnit>('reps');
  const [newExerciseMuscles, setNewExerciseMuscles] = useState<MuscleGroup[]>(['other']);

  // Filter exercises based on search
  const filteredExercises = exercises.filter((e) =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  // Add exercise to routine
  const handleAddExerciseToRoutine = useCallback((exercise: Exercise) => {
    const routineExercise = createRoutineExercise(
      exercise.id,
      exercise.name,
      exercise.unit,
      90
    );
    setRoutineExercises((prev) => [...prev, routineExercise]);
    setShowAddExercise(false);
    setExerciseSearch('');
  }, []);

  // Create new exercise
  const handleCreateExercise = useCallback(() => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const exercise = createExercise(
      newExerciseName.trim(),
      newExerciseUnit,
      newExerciseMuscles
    );

    onAddExercise(exercise);
    handleAddExerciseToRoutine(exercise);
    setShowCreateExercise(false);
    setNewExerciseName('');
    setNewExerciseUnit('reps');
    setNewExerciseMuscles(['other']);
  }, [newExerciseName, newExerciseUnit, newExerciseMuscles, onAddExercise, handleAddExerciseToRoutine]);

  // Remove exercise from routine
  const handleRemoveExercise = useCallback((index: number) => {
    Alert.alert(
      'Remove Exercise?',
      'This will remove the exercise and all its sets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  }, []);

  // Update exercise
  const updateExercise = useCallback(
    (index: number, updates: Partial<RoutineExercise>) => {
      setRoutineExercises((prev) =>
        prev.map((e, i) => (i === index ? { ...e, ...updates } : e))
      );
    },
    []
  );

  // Add set to exercise
  const handleAddSet = useCallback((exerciseIndex: number) => {
    setRoutineExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exerciseIndex) return e;
        const lastSet = e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            createRoutineSet(
              lastSet?.targetWeight || 0,
              lastSet?.targetValue || 10,
              'normal'
            ),
          ],
        };
      })
    );
  }, []);

  // Remove set from exercise
  const handleRemoveSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setRoutineExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exerciseIndex || e.sets.length <= 1) return e;
        return {
          ...e,
          sets: e.sets.filter((_, si) => si !== setIndex),
        };
      })
    );
  }, []);

  // Update set
  const handleUpdateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updates: Partial<RoutineSet>) => {
      setRoutineExercises((prev) =>
        prev.map((e, i) => {
          if (i !== exerciseIndex) return e;
          return {
            ...e,
            sets: e.sets.map((s, si) =>
              si === setIndex ? { ...s, ...updates } : s
            ),
          };
        })
      );
    },
    []
  );

  // Save routine
  const handleSave = useCallback(() => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    if (routineExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const now = new Date().toISOString();
    const savedRoutine: Routine = {
      id: initialRoutine?.id || generateId(),
      name: routineName.trim(),
      exercises: routineExercises,
      createdAt: initialRoutine?.createdAt || now,
      updatedAt: now,
    };

    onSave(savedRoutine);
  }, [routineName, routineExercises, initialRoutine, onSave]);

  // Move exercise up/down
  const moveExercise = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= routineExercises.length) return;

    setRoutineExercises((prev) => {
      const newList = [...prev];
      [newList[fromIndex], newList[toIndex]] = [newList[toIndex], newList[fromIndex]];
      return newList;
    });
  }, [routineExercises.length]);

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelText, isDarkMode && styles.cancelTextDark]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textPrimary]}>
          {isEditing ? 'Edit Routine' : 'New Routine'}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Routine name */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionLabel, isDarkMode && styles.textSecondary]}>
            Routine Name
          </Text>
          <TextInput
            style={[styles.nameInput, isDarkMode && styles.nameInputDark]}
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="e.g., Push Day, Leg Day, Upper Body"
            placeholderTextColor={
              isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
            }
          />
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textPrimary]}>
            Exercises ({routineExercises.length})
          </Text>

          {routineExercises.map((exercise, index) => (
            <View
              key={exercise.id}
              style={[styles.exerciseCard, isDarkMode && styles.exerciseCardDark]}
            >
              {/* Exercise header */}
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseNumber, { color: '#4ECDC4' }]}>
                    {index + 1}
                  </Text>
                  <View style={styles.exerciseNameWrap}>
                    <Text
                      style={[styles.exerciseName, isDarkMode && styles.textPrimary]}
                      numberOfLines={1}
                    >
                      {exercise.exerciseName}
                    </Text>
                    <Text style={[styles.exerciseUnit, isDarkMode && styles.textSecondary]}>
                      {unitLabels[exercise.unit].plural}
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => moveExercise(index, 'up')}
                    disabled={index === 0}
                  >
                    <Feather
                      name="chevron-up"
                      size={20}
                      color={index === 0 ? theme.colors.textMuted : '#4ECDC4'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => moveExercise(index, 'down')}
                    disabled={index === routineExercises.length - 1}
                  >
                    <Feather
                      name="chevron-down"
                      size={20}
                      color={
                        index === routineExercises.length - 1
                          ? theme.colors.textMuted
                          : '#4ECDC4'
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveExercise(index)}
                  >
                    <Feather name="trash-2" size={18} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Rest time */}
              <View style={styles.restTimeRow}>
                <Text style={[styles.restLabel, isDarkMode && styles.textSecondary]}>
                  Rest Time:
                </Text>
                <View style={styles.restControls}>
                  <TouchableOpacity
                    style={[styles.restButton, isDarkMode && styles.restButtonDark]}
                    onPress={() =>
                      updateExercise(index, {
                        restSeconds: Math.max(15, exercise.restSeconds - 15),
                      })
                    }
                  >
                    <Feather name="minus" size={14} color="#4ECDC4" />
                  </TouchableOpacity>
                  <Text style={[styles.restValue, isDarkMode && styles.textPrimary]}>
                    {exercise.restSeconds}s
                  </Text>
                  <TouchableOpacity
                    style={[styles.restButton, isDarkMode && styles.restButtonDark]}
                    onPress={() =>
                      updateExercise(index, {
                        restSeconds: Math.min(300, exercise.restSeconds + 15),
                      })
                    }
                  >
                    <Feather name="plus" size={14} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sets */}
              <View style={styles.setsContainer}>
                <View style={styles.setsHeader}>
                  <Text style={[styles.setHeaderText, { width: 40 }]}>Set</Text>
                  <Text style={[styles.setHeaderText, { flex: 1 }]}>Weight</Text>
                  <Text style={[styles.setHeaderText, { flex: 1 }]}>
                    {unitLabels[exercise.unit].short.charAt(0).toUpperCase() +
                      unitLabels[exercise.unit].short.slice(1)}
                  </Text>
                  <Text style={[styles.setHeaderText, { width: 70 }]}>Type</Text>
                  <View style={{ width: 30 }} />
                </View>

                {exercise.sets.map((set, setIndex) => {
                  const setStyle = setTypeStyles[set.setType];
                  return (
                    <View key={set.id} style={styles.setRow}>
                      <Text style={[styles.setNumber, { color: setStyle.color }]}>
                        {setIndex + 1}
                      </Text>
                      <TextInput
                        style={[styles.setInput, isDarkMode && styles.setInputDark]}
                        value={set.targetWeight > 0 ? String(set.targetWeight) : ''}
                        onChangeText={(text) =>
                          handleUpdateSet(index, setIndex, {
                            targetWeight: Number(text) || 0,
                          })
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                      <TextInput
                        style={[styles.setInput, isDarkMode && styles.setInputDark]}
                        value={set.targetValue > 0 ? String(set.targetValue) : ''}
                        onChangeText={(text) =>
                          handleUpdateSet(index, setIndex, {
                            targetValue: Number(text) || 0,
                          })
                        }
                        keyboardType="numeric"
                        placeholder="10"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                      <TouchableOpacity
                        style={[
                          styles.typeButton,
                          { backgroundColor: setStyle.color + '20' },
                        ]}
                        onPress={() => {
                          const types: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];
                          const currentIndex = types.indexOf(set.setType);
                          const nextType = types[(currentIndex + 1) % types.length];
                          handleUpdateSet(index, setIndex, { setType: nextType });
                        }}
                      >
                        <Text style={[styles.typeText, { color: setStyle.color }]}>
                          {setStyle.label.substring(0, 4)}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteSetButton}
                        onPress={() => handleRemoveSet(index, setIndex)}
                        disabled={exercise.sets.length <= 1}
                      >
                        <Feather
                          name="x"
                          size={16}
                          color={
                            exercise.sets.length <= 1
                              ? theme.colors.textMuted
                              : theme.colors.danger
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={[styles.addSetButton, isDarkMode && styles.addSetButtonDark]}
                  onPress={() => handleAddSet(index)}
                >
                  <Feather name="plus" size={16} color="#4ECDC4" />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <TextInput
                style={[styles.notesInput, isDarkMode && styles.notesInputDark]}
                value={exercise.notes || ''}
                onChangeText={(notes) => updateExercise(index, { notes })}
                placeholder="Notes (optional)"
                placeholderTextColor={
                  isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
                }
                multiline
              />
            </View>
          ))}

          {/* Add exercise button */}
          <TouchableOpacity
            style={[styles.addExerciseButton, isDarkMode && styles.addExerciseButtonDark]}
            onPress={() => setShowAddExercise(true)}
          >
            <Feather name="plus" size={24} color="#4ECDC4" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExercise}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddExercise(false)}
      >
        <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
            <TouchableOpacity onPress={() => setShowAddExercise(false)}>
              <Feather
                name="x"
                size={24}
                color={isDarkMode ? theme.dark.textPrimary : theme.colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isDarkMode && styles.textPrimary]}>
              Add Exercise
            </Text>
            <TouchableOpacity onPress={() => {
              setShowAddExercise(false);
              setShowCreateExercise(true);
            }}>
              <Text style={styles.createNewText}>Create New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={18}
              color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
            />
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              placeholder="Search exercises..."
              placeholderTextColor={
                isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
              }
              autoFocus
            />
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.exerciseList}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={[styles.emptyText, isDarkMode && styles.textSecondary]}>
                  {exerciseSearch
                    ? 'No exercises found'
                    : 'No exercises yet. Create one!'}
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => {
                    setShowAddExercise(false);
                    setShowCreateExercise(true);
                    setNewExerciseName(exerciseSearch);
                  }}
                >
                  <Feather name="plus" size={18} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Exercise</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.exerciseOption,
                  isDarkMode && styles.exerciseOptionDark,
                ]}
                onPress={() => handleAddExerciseToRoutine(item)}
              >
                <View>
                  <Text
                    style={[styles.exerciseOptionName, isDarkMode && styles.textPrimary]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.exerciseOptionMeta, isDarkMode && styles.textSecondary]}
                  >
                    {item.muscleGroups.map((g) => getMuscleGroupLabel(g)).join(', ')} •{' '}
                    {unitLabels[item.unit].plural}
                  </Text>
                </View>
                <Feather name="plus" size={20} color="#4ECDC4" />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Create Exercise Modal */}
      <Modal
        visible={showCreateExercise}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateExercise(false)}
      >
        <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
          <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
            <TouchableOpacity onPress={() => setShowCreateExercise(false)}>
              <Feather
                name="x"
                size={24}
                color={isDarkMode ? theme.dark.textPrimary : theme.colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isDarkMode && styles.textPrimary]}>
              Create Exercise
            </Text>
            <TouchableOpacity onPress={handleCreateExercise}>
              <Text style={styles.createNewText}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.createForm}>
            <Text style={[styles.formLabel, isDarkMode && styles.textSecondary]}>
              Exercise Name *
            </Text>
            <TextInput
              style={[styles.formInput, isDarkMode && styles.formInputDark]}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="e.g., Bench Press, Squats"
              placeholderTextColor={
                isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
              }
              autoFocus
            />

            <Text style={[styles.formLabel, isDarkMode && styles.textSecondary]}>
              Tracking Unit *
            </Text>
            <View style={styles.unitOptions}>
              {(['reps', 'seconds', 'minutes'] as ExerciseUnit[]).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitOption,
                    newExerciseUnit === unit && styles.unitOptionActive,
                    isDarkMode && styles.unitOptionDark,
                  ]}
                  onPress={() => setNewExerciseUnit(unit)}
                >
                  <Text
                    style={[
                      styles.unitOptionText,
                      newExerciseUnit === unit && styles.unitOptionTextActive,
                    ]}
                  >
                    {unitLabels[unit].plural.charAt(0).toUpperCase() +
                      unitLabels[unit].plural.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.formLabel, isDarkMode && styles.textSecondary]}>
              Muscle Groups
            </Text>
            <View style={styles.muscleOptions}>
              {MUSCLE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.muscleOption,
                    newExerciseMuscles.includes(group) && styles.muscleOptionActive,
                    isDarkMode && styles.muscleOptionDark,
                  ]}
                  onPress={() => {
                    setNewExerciseMuscles((prev) =>
                      prev.includes(group)
                        ? prev.filter((g) => g !== group)
                        : [...prev, group]
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      newExerciseMuscles.includes(group) && styles.muscleOptionTextActive,
                    ]}
                  >
                    {getMuscleGroupLabel(group)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceMuted,
  },
  headerDark: {
    backgroundColor: theme.dark.surface,
    borderBottomColor: theme.dark.border,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  cancelTextDark: {
    color: theme.dark.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  sectionDark: {
    backgroundColor: theme.dark.surface,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    padding: 0,
  },
  nameInputDark: {
    color: theme.dark.textPrimary,
  },
  exercisesSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  exerciseCardDark: {
    backgroundColor: theme.dark.surface,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: theme.spacing.md,
  },
  exerciseNameWrap: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  exerciseUnit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 4,
  },
  moveButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  restLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  restControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  restButton: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restButtonDark: {
    backgroundColor: theme.dark.surfaceMuted,
  },
  restValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  setsContainer: {
    marginBottom: theme.spacing.md,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  setHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  setNumber: {
    width: 32,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    minHeight: 40,
  },
  setInputDark: {
    backgroundColor: theme.dark.inputBg,
    color: theme.dark.textPrimary,
  },
  typeButton: {
    width: 60,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteSetButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
  },
  addSetButtonDark: {
    borderColor: '#4ECDC4',
  },
  addSetText: {
    color: '#4ECDC4',
    fontWeight: '600',
    fontSize: 13,
  },
  notesInput: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 40,
  },
  notesInputDark: {
    backgroundColor: theme.dark.inputBg,
    color: theme.dark.textPrimary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    marginTop: theme.spacing.md,
  },
  addExerciseButtonDark: {
    borderColor: '#4ECDC4',
  },
  addExerciseText: {
    color: '#4ECDC4',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalContainerDark: {
    backgroundColor: theme.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceMuted,
  },
  modalHeaderDark: {
    backgroundColor: theme.dark.surface,
    borderBottomColor: theme.dark.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  createNewText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  searchInputDark: {
    color: theme.dark.textPrimary,
  },
  exerciseList: {
    paddingHorizontal: theme.spacing.lg,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.full,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
  },
  exerciseOptionDark: {
    backgroundColor: theme.dark.surface,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  exerciseOptionMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  createForm: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  formInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  formInputDark: {
    backgroundColor: theme.dark.surface,
    color: theme.dark.textPrimary,
  },
  unitOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  unitOption: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  unitOptionActive: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  unitOptionDark: {
    backgroundColor: theme.dark.surface,
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  unitOptionTextActive: {
    color: '#4ECDC4',
  },
  muscleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  muscleOption: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  muscleOptionActive: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  muscleOptionDark: {
    backgroundColor: theme.dark.surface,
  },
  muscleOptionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  muscleOptionTextActive: {
    color: '#4ECDC4',
  },
});

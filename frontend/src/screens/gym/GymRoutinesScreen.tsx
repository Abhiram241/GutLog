/**
 * GymRoutinesScreen.tsx
 *
 * Routines management screen.
 * Browse, create, edit, and organize workout routines.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ScreenHeader';
import { RoutineCard } from '../../components/gym/RoutineCard';
import { theme } from '../../constants/theme';
import { Routine, RoutineFolder } from '../../types/gym';

interface GymRoutinesScreenProps {
  routines: Routine[];
  folders: RoutineFolder[];
  isDarkMode: boolean;
  onCreateRoutine: () => void;
  onEditRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onStartWorkout: (routine: Routine) => void;
  onCreateFolder: () => void;
}

export function GymRoutinesScreen({
  routines,
  folders,
  isDarkMode,
  onCreateRoutine,
  onEditRoutine,
  onDeleteRoutine,
  onStartWorkout,
  onCreateFolder,
}: GymRoutinesScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Filter routines based on search and folder
  const filteredRoutines = useMemo(() => {
    return routines.filter((routine) => {
      const matchesSearch = routine.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFolder =
        selectedFolderId === null ||
        (selectedFolderId === 'uncategorized' && !routine.folderId) ||
        routine.folderId === selectedFolderId;
      return matchesSearch && matchesFolder;
    });
  }, [routines, searchQuery, selectedFolderId]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Routines"
        subtitle={`${routines.length} routine${routines.length !== 1 ? 's' : ''}`}
        isDarkMode={isDarkMode}
      />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, isDarkMode && styles.searchBoxDark]}>
          <Feather
            name="search"
            size={18}
            color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
          />
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search routines..."
            placeholderTextColor={
              isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
            }
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather
                name="x"
                size={18}
                color={isDarkMode ? theme.dark.textMuted : theme.colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Folder filter chips */}
      {folders.length > 0 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: null, name: 'All', color: '#4ECDC4' },
              ...folders,
              { id: 'uncategorized', name: 'Uncategorized', color: theme.colors.textMuted },
            ]}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.filterChips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFolderId === item.id && styles.filterChipActive,
                  isDarkMode && styles.filterChipDark,
                ]}
                onPress={() => setSelectedFolderId(item.id)}
              >
                <View
                  style={[
                    styles.folderDot,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFolderId === item.id && styles.filterChipTextActive,
                    isDarkMode && styles.filterChipTextDark,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Routines list */}
      <FlatList
        data={filteredRoutines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, isDarkMode && styles.textSecondary]}>
              {searchQuery
                ? 'No routines match your search'
                : 'No routines in this folder'}
            </Text>
          </View>
        }
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
      />

      {/* Floating action buttons */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 90 }]}>
        <TouchableOpacity
          style={[styles.fabSecondary, isDarkMode && styles.fabSecondaryDark]}
          onPress={onCreateFolder}
        >
          <Feather name="folder-plus" size={20} color="#4ECDC4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={onCreateRoutine}>
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  searchBoxDark: {
    backgroundColor: theme.dark.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.sm,
  },
  searchInputDark: {
    color: theme.dark.textPrimary,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  filterChips: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  filterChipDark: {
    backgroundColor: theme.dark.surface,
  },
  folderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#4ECDC4',
  },
  filterChipTextDark: {
    color: theme.dark.textSecondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  fabSecondaryDark: {
    backgroundColor: theme.dark.surface,
  },
});

/**
 * SettingsScreen.tsx
 *
 * App settings: API key, city, water goal, theme, backup/restore, danger zone.
 * All persistence logic is handled by the parent via callbacks.
 */

import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";

import { FormCard } from "../components/FormCard";
import { OptionChips } from "../components/OptionChips";
import { ScreenHeader } from "../components/ScreenHeader";
import { theme } from "../constants/theme";
import { useAppTheme } from "../context/ThemeContext";
import { SettingsData } from "../types";

interface SettingsScreenProps {
  settings: SettingsData;
  settingsMessage: string;
  backupMessage: string;
  isDarkMode: boolean;
  onSettingsChange: (settings: SettingsData) => void;
  onSaveApiKey: () => void;
  onSaveSettings: () => void;
  onManualBackup: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetToday: () => void;
  onOpenAIReview: () => void;
  onOpenSuspiciousFoods: () => void;
}

export function SettingsScreen({
  settings,
  settingsMessage,
  backupMessage,
  isDarkMode,
  onSettingsChange,
  onSaveApiKey,
  onSaveSettings,
  onManualBackup,
  onExportBackup,
  onImportBackup,
  onResetToday,
  onOpenAIReview,
  onOpenSuspiciousFoods,
}: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isBackupError =
    backupMessage.toLowerCase().includes("fail") ||
    backupMessage.toLowerCase().includes("invalid");

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        <ScreenHeader
          title="Settings"
          subtitle="NextCore • Know your gut, heal your life"
          icon="settings-outline"
          isDarkMode={isDarkMode}
        />

        {/* AI & Preferences */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
            AI & Preferences
          </Text>

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            Gemini API Key
          </Text>
          <TextInput
            value={settings.geminiApiKey}
            onChangeText={(value) =>
              onSettingsChange({ ...settings, geminiApiKey: value })
            }
            placeholder="Paste your Gemini API key"
            placeholderTextColor={palette.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                color: palette.textPrimary,
              },
            ]}
            autoCapitalize="none"
          />
          <Text style={[styles.helperText, { color: palette.textSecondary }]}>
            Stored only on this device via AsyncStorage.
          </Text>
          <Pressable
            onPress={onSaveApiKey}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="key-outline"
              size={16}
              color={palette.textPrimary}
            />
            <Text style={[styles.buttonLabel, { color: palette.textPrimary }]}>
              Save API Key
            </Text>
          </Pressable>

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            City
          </Text>
          <OptionChips
            options={["Hyderabad", "Bengaluru"] as const}
            selected={settings.city}
            onSelect={(city) => onSettingsChange({ ...settings, city })}
            isDarkMode={isDarkMode}
          />

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            Daily water goal (ml)
          </Text>
          <TextInput
            value={String(settings.dailyWaterGoal)}
            onChangeText={(value) => {
              const parsed = Number(value.replace(/[^0-9]/g, ""));
              onSettingsChange({ ...settings, dailyWaterGoal: parsed || 0 });
            }}
            keyboardType="numeric"
            placeholder="2500"
            placeholderTextColor={palette.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                color: palette.textPrimary,
              },
            ]}
          />

          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            Appearance
          </Text>
          <OptionChips
            options={["system", "light", "dark"] as const}
            selected={settings.themePreference}
            onSelect={(themePreference) =>
              onSettingsChange({ ...settings, themePreference })
            }
            isDarkMode={isDarkMode}
          />

          <Pressable
            onPress={onSaveSettings}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: palette.surfaceMuted,
                borderColor: palette.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={palette.textPrimary}
            />
            <Text style={[styles.buttonLabel, { color: palette.textPrimary }]}>
              Save Settings
            </Text>
          </Pressable>

          {!!settingsMessage && (
            <Text style={[styles.infoText, { color: "#6FCF97" }]}>
              {settingsMessage}
            </Text>
          )}
        </FormCard>

        {/* Insights */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
            Insights
          </Text>
          <View style={styles.insightRow}>
            <Pressable
              onPress={onOpenAIReview}
              style={({ pressed }) => [
                styles.insightBtn,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="sparkles-outline" size={16} color="#FFFFFF" />
              <Text style={styles.insightBtnLabel}>AI Review</Text>
            </Pressable>
            <Pressable
              onPress={onOpenSuspiciousFoods}
              style={({ pressed }) => [
                styles.insightBtn,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
              <Text style={styles.insightBtnLabel}>Suspicious Foods</Text>
            </Pressable>
          </View>
        </FormCard>

        {/* Backup & Restore */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
            Backup & Restore
          </Text>
          <Text
            style={[
              styles.helperText,
              { color: palette.textSecondary, marginBottom: 14 },
            ]}
          >
            {
              "Tap 'Save Backup Now' to pick a folder and save gutlogs_backup.json there. Use 'Export' to share the file directly."
            }
          </Text>
          {[
            {
              label: "Save Backup Now",
              onPress: onManualBackup,
              icon: "save-outline" as const,
            },
            {
              label: "Export / Share Backup File",
              onPress: onExportBackup,
              icon: "share-outline" as const,
            },
            {
              label: "Import & Restore from Backup",
              onPress: onImportBackup,
              icon: "download-outline" as const,
            },
          ].map(({ label, onPress, icon }) => (
            <Pressable
              key={label}
              onPress={onPress}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name={icon} size={16} color={palette.textPrimary} />
              <Text
                style={[styles.buttonLabel, { color: palette.textPrimary }]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
          {!!backupMessage && (
            <Text
              style={[
                styles.infoText,
                isBackupError && { color: theme.colors.danger },
              ]}
            >
              {backupMessage}
            </Text>
          )}
        </FormCard>

        {/* Danger Zone */}
        <FormCard isDarkMode={isDarkMode}>
          <Text style={[styles.cardTitle, { color: theme.colors.danger }]}>
            Danger Zone
          </Text>
          <Pressable
            onPress={() => setShowResetConfirm(true)}
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.dangerLabel}>{"Reset Today's Log"}</Text>
          </Pressable>
        </FormCard>
      </ScrollView>

      {/* Reset confirmation modal */}
      <Modal
        visible={showResetConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowResetConfirm(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowResetConfirm(false)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
            onPress={() => undefined}
          >
            <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
              Reset Today?
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: palette.textSecondary }]}
            >
              This will permanently clear all of today's food, water, meds and
              stool entries. This cannot be undone.
            </Text>
            <Pressable
              onPress={() => {
                setShowResetConfirm(false);
                onResetToday();
              }}
              style={({ pressed }) => [
                styles.dangerButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.dangerLabel}>Yes, reset today</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowResetConfirm(false)}
              style={({ pressed }) => [
                styles.button,
                { marginTop: 8 },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonLabel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 46,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: -2,
  },
  button: {
    marginTop: 10,
    borderRadius: theme.radius.full,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  buttonLabel: { fontWeight: "700", fontSize: 14 },
  insightRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  insightBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  insightBtnLabel: { color: "#FFFFFF", fontWeight: "700" },
  infoText: { marginTop: 12, color: "#55735C", fontWeight: "500" },
  dangerButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F6C8C7",
    borderRadius: theme.radius.full,
    paddingVertical: 11,
    minHeight: 44,
    alignItems: "center",
  },
  dangerLabel: { color: "#D85D5B", fontWeight: "600" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalSubtitle: {
    marginBottom: 20,
    fontWeight: "500",
    fontSize: 14,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

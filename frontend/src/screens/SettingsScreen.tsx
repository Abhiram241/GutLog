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

import { FormCard } from "../components/FormCard";
import { OptionChips } from "../components/OptionChips";
import { ScreenHeader } from "../components/ScreenHeader";
import { theme } from "../constants/theme";
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
          subtitle="GutLogs • Know your gut, heal your life"
          isDarkMode={isDarkMode}
        />

        {/* AI & Preferences */}
        <FormCard isDarkMode={isDarkMode}>
          <Text
            style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
          >
            AI & Preferences
          </Text>

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textPrimaryDark]}
          >
            Gemini API Key
          </Text>
          <TextInput
            value={settings.geminiApiKey}
            onChangeText={(value) =>
              onSettingsChange({ ...settings, geminiApiKey: value })
            }
            placeholder="Paste your Gemini API key"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, isDarkMode && styles.inputDark]}
            autoCapitalize="none"
          />
          <Text
            style={[styles.helperText, isDarkMode && styles.textSecondaryDark]}
          >
            Stored only on this device via AsyncStorage.
          </Text>
          <Pressable
            onPress={onSaveApiKey}
            style={({ pressed }) => [
              styles.button,
              isDarkMode && styles.buttonDark,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.buttonLabel, isDarkMode && styles.buttonLabelDark]}
            >
              Save API Key
            </Text>
          </Pressable>

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textPrimaryDark]}
          >
            City
          </Text>
          <OptionChips
            options={["Hyderabad", "Bengaluru"] as const}
            selected={settings.city}
            onSelect={(city) => onSettingsChange({ ...settings, city })}
            isDarkMode={isDarkMode}
          />

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textPrimaryDark]}
          >
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
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, isDarkMode && styles.inputDark]}
          />

          <Text
            style={[styles.inputLabel, isDarkMode && styles.textPrimaryDark]}
          >
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
              isDarkMode && styles.buttonDark,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.buttonLabel, isDarkMode && styles.buttonLabelDark]}
            >
              Save Settings
            </Text>
          </Pressable>

          {!!settingsMessage && (
            <Text style={[styles.infoText, isDarkMode && { color: "#6FCF97" }]}>
              {settingsMessage}
            </Text>
          )}
        </FormCard>

        {/* Insights */}
        <FormCard isDarkMode={isDarkMode}>
          <Text
            style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
          >
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
              <Text style={styles.insightBtnLabel}>AI Review</Text>
            </Pressable>
            <Pressable
              onPress={onOpenSuspiciousFoods}
              style={({ pressed }) => [
                styles.insightBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.insightBtnLabel}>Suspicious Foods</Text>
            </Pressable>
          </View>
        </FormCard>

        {/* Backup & Restore */}
        <FormCard isDarkMode={isDarkMode}>
          <Text
            style={[styles.cardTitle, isDarkMode && styles.textPrimaryDark]}
          >
            Backup & Restore
          </Text>
          <Text
            style={[
              styles.helperText,
              isDarkMode && styles.textSecondaryDark,
              { marginBottom: 14 },
            ]}
          >
            {
              "Tap 'Save Backup Now' to pick a folder and save gutlogs_backup.json there. Use 'Export' to share the file directly."
            }
          </Text>
          {[
            { label: "Save Backup Now", onPress: onManualBackup },
            { label: "Export / Share Backup File", onPress: onExportBackup },
            { label: "Import & Restore from Backup", onPress: onImportBackup },
          ].map(({ label, onPress }) => (
            <Pressable
              key={label}
              onPress={onPress}
              style={({ pressed }) => [
                styles.button,
                isDarkMode && styles.buttonDark,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.buttonLabel,
                  isDarkMode && styles.buttonLabelDark,
                ]}
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
            style={[styles.modalCard, isDarkMode && styles.modalCardDark]}
            onPress={() => undefined}
          >
            <Text
              style={[styles.modalTitle, isDarkMode && styles.textPrimaryDark]}
            >
              Reset Today?
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                isDarkMode && styles.textSecondaryDark,
              ]}
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
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputLabel: {
    marginTop: 12,
    marginBottom: 8,
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FAF8F6",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#ECE4DB",
    color: theme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 46,
    marginBottom: 8,
  },
  inputDark: {
    backgroundColor: theme.dark.inputBg,
    borderColor: theme.dark.inputBorder,
    color: theme.dark.textPrimary,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: -2,
  },
  button: {
    marginTop: 10,
    backgroundColor: theme.colors.sageSoft,
    borderRadius: theme.radius.full,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: "center",
  },
  buttonDark: {
    backgroundColor: theme.dark.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.dark.border,
  },
  buttonLabel: { color: "#4A5D4F", fontWeight: "700", fontSize: 14 },
  buttonLabelDark: { color: theme.dark.textPrimary },
  insightRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  insightBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 600,
  },
  modalCardDark: {
    backgroundColor: theme.dark.surface,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.dark.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    marginBottom: 20,
    fontWeight: "500",
    fontSize: 14,
  },
  textPrimaryDark: { color: theme.dark.textPrimary },
  textSecondaryDark: { color: theme.dark.textSecondary },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

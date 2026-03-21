/**
 * InputModal.tsx
 *
 * Cross-platform text input modal (replacement for Alert.prompt which is iOS-only).
 */

import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { theme } from "../../constants/theme";

interface InputModalProps {
  visible: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  isDarkMode: boolean;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export function InputModal({
  visible,
  title,
  message,
  placeholder,
  defaultValue = "",
  isDarkMode,
  onCancel,
  onSubmit,
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = () => {
    onSubmit(value);
    setValue("");
  };

  const handleCancel = () => {
    onCancel();
    setValue("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.backdrop}>
          <View style={[styles.content, isDarkMode && styles.contentDark]}>
            <Text style={[styles.title, isDarkMode && styles.textPrimary]}>
              {title}
            </Text>
            {message && (
              <Text
                style={[styles.message, isDarkMode && styles.textSecondary]}
              >
                {message}
              </Text>
            )}
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={
                isDarkMode ? theme.dark.textMuted : theme.colors.textMuted
              }
              autoFocus
              onSubmitEditing={handleSubmit}
            />
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    width: "100%",
    maxWidth: 340,
    ...theme.shadow.md,
  },
  contentDark: {
    backgroundColor: theme.dark.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  textPrimary: {
    color: theme.dark.textPrimary,
  },
  textSecondary: {
    color: theme.dark.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    minHeight: 48,
  },
  inputDark: {
    backgroundColor: theme.dark.inputBg,
    color: theme.dark.textPrimary,
  },
  buttons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#4ECDC4",
  },
  submitText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

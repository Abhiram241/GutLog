/**
 * GymAlert.tsx
 *
 * Beautiful dark-themed alert/confirm dialog for gym mode.
 * Replaces native Alert.alert() calls with a styled modal.
 */

import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { theme } from "../../constants/theme";

export interface GymAlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

interface GymAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: GymAlertButton[];
  isDarkMode: boolean;
  icon?: React.ComponentProps<typeof Feather>["name"];
  iconColor?: string;
  onDismiss?: () => void;
}

export function GymAlert({
  visible,
  title,
  message,
  buttons,
  isDarkMode,
  icon,
  iconColor = "#4ECDC4",
  onDismiss,
}: GymAlertProps) {
  const bg = isDarkMode ? "#161B27" : "#FFFFFF";
  const textPrimary = isDarkMode ? "#EDF2FF" : "#2D3436";
  const textSecondary = isDarkMode ? "#8FA3BC" : "#636E72";
  const borderColor = isDarkMode
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.backdrop}>
          <View style={[styles.card, { backgroundColor: bg, borderColor }]}>
            {icon && (
              <View
                style={[styles.iconWrap, { backgroundColor: iconColor + "22" }]}
              >
                <Feather name={icon} size={28} color={iconColor} />
              </View>
            )}

            <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>

            {message ? (
              <Text style={[styles.message, { color: textSecondary }]}>
                {message}
              </Text>
            ) : null}

            <View style={[styles.divider, { backgroundColor: borderColor }]} />

            <View style={styles.buttons}>
              {buttons.map((btn, i) => {
                const isDestructive = btn.style === "destructive";
                const isCancel = btn.style === "cancel";
                const isLast = i === buttons.length - 1;

                return (
                  <React.Fragment key={i}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        isDestructive && styles.buttonDestructive,
                        isCancel && [styles.buttonCancel, { borderColor }],
                        !isDestructive && !isCancel && styles.buttonPrimary,
                      ]}
                      onPress={() => {
                        btn.onPress?.();
                        onDismiss?.();
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isDestructive && styles.buttonTextDestructive,
                          isCancel && { color: textSecondary },
                          !isDestructive &&
                            !isCancel &&
                            styles.buttonTextPrimary,
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                    {!isLast && <View style={{ width: 8 }} />}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    ...theme.shadow.md,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 20,
  },
  buttons: {
    flexDirection: "row",
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: "#4ECDC4",
  },
  buttonDestructive: {
    backgroundColor: "rgba(225, 112, 85, 0.15)",
    borderWidth: 1,
    borderColor: "#E17055",
  },
  buttonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextPrimary: {
    color: "#FFFFFF",
  },
  buttonTextDestructive: {
    color: "#E17055",
  },
});

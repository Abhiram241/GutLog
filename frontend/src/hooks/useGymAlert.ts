/**
 * useGymAlert.ts
 *
 * Imperative hook for showing GymAlert dialogs.
 * Usage: const { alertProps, showAlert } = useGymAlert();
 * Then render <GymAlert {...alertProps} /> and call showAlert(...) anywhere.
 */

import { useState, useCallback } from "react";
import type { ComponentProps } from "react";
import { GymAlertButton } from "../components/gym/GymAlert";
import type { Feather } from "@expo/vector-icons";

type FeatherIconName = ComponentProps<typeof Feather>["name"];

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: GymAlertButton[];
  icon?: FeatherIconName;
  iconColor?: string;
}

const DEFAULT_STATE: AlertState = {
  visible: false,
  title: "",
  buttons: [],
};

export function useGymAlert() {
  const [state, setState] = useState<AlertState>(DEFAULT_STATE);

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: GymAlertButton[],
      icon?: FeatherIconName,
      iconColor?: string,
    ) => {
      setState({
        visible: true,
        title,
        message,
        buttons: buttons ?? [{ text: "OK", style: "default" }],
        icon,
        iconColor,
      });
    },
    [],
  );

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    showAlert,
    alertProps: {
      ...state,
      onDismiss: dismiss,
    },
  };
}

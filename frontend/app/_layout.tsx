/**
 * app/_layout.tsx
 *
 * Root layout for Expo Router.
 * Registers the nightly backup background task on app start.
 */

import { Stack } from "expo-router";
import { useEffect } from "react";

import { registerBackupTask } from "@/src/services/scheduledBackupService";

export default function RootLayout() {
  useEffect(() => {
    void registerBackupTask();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

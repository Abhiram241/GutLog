/**
 * scheduledBackupService.ts
 *
 * Registers a background task that silently writes a backup nightly.
 */

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { writeBackup } from "./backupService";

export const BACKUP_TASK = "GUTLOGS_NIGHTLY_BACKUP";

// Define the background task (must be called at module level, outside components)
TaskManager.defineTask(BACKUP_TASK, async () => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Only write if it's between 23:50 and 23:59
    if (hour === 23 && minute >= 50) {
      await writeBackup();
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/** Register the nightly backup background task */
export const registerBackupTask = async (): Promise<void> => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKUP_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKUP_TASK, {
        minimumInterval: 15 * 60, // OS decides actual frequency
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch {
    // Background fetch not available on all devices — fail silently
  }
};

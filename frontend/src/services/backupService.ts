/**
 * backupService.ts
 *
 * Handles all backup/restore operations (file system, sharing, import).
 * Components should never call file system APIs directly.
 */

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { BackupPayload } from "../types";
import {
  getAllLogs,
  getMedsMaster,
  getSettings,
  saveDayLog,
  saveMedsMaster,
  saveSettings,
} from "./storageService";

export const BACKUP_DIR = `${FileSystem.documentDirectory}GutLogs/`;
export const BACKUP_FILE = `${BACKUP_DIR}gutlogs_backup.json`;

// ─── Internal helpers ─────────────────────────────────────────────────────────

const ensureDir = async (): Promise<void> => {
  const info = await FileSystem.getInfoAsync(BACKUP_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
  }
};

const buildPayload = async (): Promise<BackupPayload> => {
  const [settings, medsMaster, logs] = await Promise.all([
    getSettings(),
    getMedsMaster(),
    getAllLogs(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    medsMaster,
    logs,
  };
};

const writeToCacheFile = async (payload: BackupPayload): Promise<string> => {
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory!;
  const cacheFile = `${cacheDir}gutlogs_backup.json`;
  await FileSystem.writeAsStringAsync(
    cacheFile,
    JSON.stringify(payload, null, 2),
    {
      encoding: FileSystem.EncodingType.UTF8,
    },
  );
  return cacheFile;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** Write backup to the user-selected folder */
export const writeBackup = async (): Promise<void> => {
  const payload = await buildPayload();

  if (Platform.OS === "android") {
    const SAF = FileSystem.StorageAccessFramework;
    const permissions = await SAF.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
      throw new Error(
        "Storage permission denied. Please grant access to a folder.",
      );
    }
    const dirUri = permissions.directoryUri;
    let fileUri: string;
    try {
      fileUri = await SAF.createFileAsync(
        dirUri,
        "gutlogs_backup",
        "application/json",
      );
    } catch {
      const files = await SAF.readDirectoryAsync(dirUri);
      const existing = files.find((f) => f.includes("gutlogs_backup"));
      if (existing) {
        fileUri = existing;
      } else {
        throw new Error("Could not create backup file in the selected folder.");
      }
    }
    await SAF.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } else {
    await ensureDir();
    await FileSystem.writeAsStringAsync(
      BACKUP_FILE,
      JSON.stringify(payload, null, 2),
      {
        encoding: FileSystem.EncodingType.UTF8,
      },
    );
  }
};

/** Export backup via the system share sheet */
export const exportBackup = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const payload = await buildPayload();

  const hasData =
    Object.keys(payload.logs).length > 0 || payload.medsMaster.length > 0;
  if (!hasData) {
    return {
      success: false,
      message: "Nothing to export yet — log some data first.",
    };
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return {
      success: false,
      message: "Sharing is not available on this device.",
    };
  }

  const cacheFile = await writeToCacheFile(payload);
  await Sharing.shareAsync(cacheFile, {
    mimeType: "application/json",
    dialogTitle: "Export GutLogs Backup",
    UTI: "public.json",
  });
  return { success: true, message: "Backup exported successfully." };
};

/** Import and restore from a backup file */
export const importBackup = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", "*/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return { success: false, message: "Import cancelled." };
    }

    const uri = result.assets[0].uri;
    const raw = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsed = JSON.parse(raw) as Partial<BackupPayload>;
    if (parsed.version !== 1 || !parsed.logs || !parsed.settings) {
      return { success: false, message: "Invalid backup file format." };
    }

    await saveSettings(parsed.settings);
    await saveMedsMaster(parsed.medsMaster ?? []);
    await Promise.all(
      Object.entries(parsed.logs).map(([dateKey, log]) =>
        saveDayLog(dateKey, log),
      ),
    );

    return {
      success: true,
      message: "Backup restored successfully. Please restart the app.",
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to import backup.",
    };
  }
};

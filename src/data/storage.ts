import AsyncStorage from '@react-native-async-storage/async-storage';

/** Fail-soft JSON wrapper over AsyncStorage (web private mode safe). */
export const KEYS = {
  settings: 'sh:settings',
  favorites: 'sh:favorites',
} as const;

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // non-fatal
  }
}

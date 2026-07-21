import { ThemeKey } from '../types/os';

const STORAGE_KEY = 'sudhi_os_settings_v3';

interface SavedState {
  theme?: ThemeKey;
  wallpaper?: string;
  matrixOn?: boolean;
  notes?: string;
}

export function loadSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to load OS state from localStorage:', e);
    return {};
  }
}

export function saveState(data: Partial<SavedState>) {
  try {
    const current = loadSavedState();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save OS state to localStorage:', e);
  }
}

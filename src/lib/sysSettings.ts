// ─── SUDHI OS — Reactive System Settings Store (v4) ──────────────────────────
// Central, localStorage-persisted, event-driven store for OS-wide toggles.
// Consumed by QuickSettings, Taskbar, Settings app and the Desktop root.

export interface SystemSettings {
  /** Screen brightness 40..100 (dim overlay strength) */
  brightness: number;
  /** Master UI sound volume 0..100 */
  volume: number;
  /** Warm night-light overlay */
  nightLight: boolean;
  /** Animated aurora backdrop */
  aurora: boolean;
  /** UI sound effects enabled */
  sounds: boolean;
  /** Do Not Disturb (focus mode) */
  dnd: boolean;
  /** Glass / backdrop blur effects */
  glassBlur: boolean;
}

type SettingsKey = keyof SystemSettings;

const STORAGE_MAP: Record<SettingsKey, string> = {
  brightness: 'sudhi_brightness',
  volume: 'sudhi_vol',
  nightLight: 'sudhi_night',
  aurora: 'sudhi_aurora',
  sounds: 'sudhi_sound',
  dnd: 'sudhi_dnd',
  glassBlur: 'sudhi_blur',
};

const DEFAULTS: SystemSettings = {
  brightness: 100,
  volume: 60,
  nightLight: false,
  aurora: true,
  sounds: true,
  dnd: false,
  glassBlur: true,
};

function readKey(key: SettingsKey): SystemSettings[SettingsKey] {
  try {
    const raw = localStorage.getItem(STORAGE_MAP[key]);
    if (raw === null) return DEFAULTS[key];
    switch (key) {
      case 'brightness': {
        const n = Number(raw);
        return (Number.isFinite(n) ? Math.min(100, Math.max(40, n)) : 100) as SystemSettings[SettingsKey];
      }
      case 'volume': {
        const n = Number(raw);
        return (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 60) as SystemSettings[SettingsKey];
      }
      default:
        return (raw !== 'false') as SystemSettings[SettingsKey];
    }
  } catch {
    return DEFAULTS[key];
  }
}

let cache: SystemSettings = {
  brightness: readKey('brightness') as number,
  volume: readKey('volume') as number,
  nightLight: readKey('nightLight') as boolean,
  aurora: readKey('aurora') as boolean,
  sounds: readKey('sounds') as boolean,
  dnd: readKey('dnd') as boolean,
  glassBlur: readKey('glassBlur') as boolean,
};

const listeners = new Set<() => void>();

export function getSystemSettings(): SystemSettings {
  return cache;
}

export function setSystemSetting<K extends SettingsKey>(key: K, value: SystemSettings[K]): void {
  if (cache[key] === value) return;
  cache = { ...cache, [key]: value };
  try {
    localStorage.setItem(STORAGE_MAP[key], String(value));
  } catch { /* quota / private mode — ignore */ }
  listeners.forEach(l => { try { l(); } catch { /* noop */ } });
}

export function toggleSystemSetting(key: SettingsKey): void {
  setSystemSetting(key, !cache[key] as never);
}

export function subscribeSystemSettings(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): SystemSettings {
  return cache;
}

import { useSyncExternalStore } from 'react';
import { getSnapshot, subscribeSystemSettings, SystemSettings } from '../lib/sysSettings';

/** Reactive hook over the OS-wide system settings store. */
export function useSystemSettings(): SystemSettings {
  return useSyncExternalStore(subscribeSystemSettings, getSnapshot, getSnapshot);
}

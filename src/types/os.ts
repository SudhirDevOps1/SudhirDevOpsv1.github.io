import { ProjectData, AboutData, TerminalData } from '../data';

export type ThemeKey = 'green' | 'blue' | 'amber' | 'purple' | 'crimson' | 'cyan' | 'mono';
export type PowerState = 'booting' | 'running' | 'sleeping' | 'shutdown';
export type WinId =
  | 'terminal' | 'about' | 'skills' | 'projects' | 'contact' | 'settings'
  | 'youtube' | 'browser' | 'games' | 'gallery' | 'videoplayer' | 'notepad'
  | 'file-explorer' | 'music-player' | 'paint' | 'calendar' | 'map'
  | 'weather' | 'crypto' | 'space' | 'countries' | 'email' | 'matrix'
  | string;

export interface WinState {
  id: WinId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  size: { w: number; h: number };
  zIndex: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface OSNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  time: number;
}

export interface LoadedJsonData {
  projects: ProjectData[];
  about: AboutData | null;
  terminal: TerminalData | null;
}

export interface OSContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  activeWallpaper: string;
  setWallpaper: (w: string) => void;
  matrixOn: boolean;
  toggleMatrix: () => void;
  windows: WinState[];
  openWindow: (id: WinId) => void;
  closeWindow: (id: WinId) => void;
  minimizeWindow: (id: WinId) => void;
  maximizeWindow: (id: WinId) => void;
  focusWindow: (id: WinId) => void;
  updateWindowPos: (id: WinId, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: WinId, size: { w: number; h: number }) => void;
  powerState: PowerState;
  setPowerState: (s: PowerState) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
  startupTime: number;
  visitorCount: number;
  konamiActive: boolean;
  jsonData: LoadedJsonData;
  notifications: OSNotification[];
  pushNotification: (title: string, body: string, icon?: string) => void;
  clearNotifications: () => void;
  dnd: boolean;
  setDnd: (v: boolean) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

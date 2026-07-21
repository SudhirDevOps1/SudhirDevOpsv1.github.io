import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { THEMES, loadAllData } from '../data';
import { ThemeKey, PowerState, WinId, WinState, Toast, LoadedJsonData, OSContextType } from '../types/os';
import { loadSavedState, saveState } from '../lib/storage';

const OSContext = createContext<OSContextType>(null!);
export const useOS = () => useContext(OSContext);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = loadSavedState();
  const [theme, setThemeState] = useState<ThemeKey>(saved.theme || 'green');
  const [activeWallpaper, setActiveWallpaper] = useState<string>(saved.wallpaper || '');
  const [matrixOn, setMatrixOn] = useState<boolean>(saved.matrixOn !== undefined ? saved.matrixOn : true);
  const [windows, setWindows] = useState<WinState[]>([]);
  const [powerState, setPowerStateRaw] = useState<PowerState>('booting');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const startupTime = React.useRef(Date.now());

  const [jsonData, setJsonData] = useState<LoadedJsonData>({
    projects: [],
    about: null,
    terminal: null
  });

  useEffect(() => {
    loadAllData().then(data => setJsonData(data)).catch(err => console.warn(err));
  }, []);

  useEffect(() => {
    const t = THEMES[theme];
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-rgb', t.rgb);
    saveState({ theme });
  }, [theme]);

  const setTheme = useCallback((t: ThemeKey) => setThemeState(t), []);
  const setWallpaper = useCallback((w: string) => {
    setActiveWallpaper(w);
    saveState({ wallpaper: w });
  }, []);

  const toggleMatrix = useCallback(() => {
    setMatrixOn(prev => {
      const next = !prev;
      saveState({ matrixOn: next });
      return next;
    });
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const openWindow = useCallback((id: WinId) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: Math.max(...prev.map(x => x.zIndex), 10) + 1 } : w);
      }
      return [...prev, {
        id,
        title: id,
        minimized: false,
        maximized: false,
        position: { x: 100, y: 80 },
        size: { w: 700, h: 500 },
        zIndex: Math.max(...prev.map(x => x.zIndex), 10) + 1
      }];
    });
  }, []);

  const closeWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  }, []);

  const maximizeWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  }, []);

  const focusWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: Math.max(...prev.map(x => x.zIndex), 10) + 1 } : w));
  }, []);

  const updateWindowPos = useCallback((id: WinId, pos: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos } : w));
  }, []);

  const updateWindowSize = useCallback((id: WinId, size: { w: number; h: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  const osValue = useMemo<OSContextType>(() => ({
    theme, setTheme, activeWallpaper, setWallpaper, matrixOn, toggleMatrix,
    windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow,
    updateWindowPos, updateWindowSize, powerState, setPowerState: setPowerStateRaw,
    addToast, startupTime: startupTime.current, visitorCount: 1, konamiActive: false, jsonData
  }), [theme, setTheme, activeWallpaper, setWallpaper, matrixOn, toggleMatrix, windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, powerState, addToast, jsonData]);

  return (
    <OSContext.Provider value={osValue}>
      {children}
    </OSContext.Provider>
  );
};

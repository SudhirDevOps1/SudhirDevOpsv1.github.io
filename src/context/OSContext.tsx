import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { THEMES, loadAllData } from '../data';
import { ThemeKey, PowerState, WinId, WinState, Toast, LoadedJsonData, OSContextType, OSNotification } from '../types/os';
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
  const [notifications, setNotifications] = useState<OSNotification[]>([]);
  const [dnd, setDndState] = useState<boolean>(() => localStorage.getItem('sudhi_dnd') === 'true');
  const [konamiActive, setKonamiActive] = useState(false);
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

  // ─── Notification Center (v4) ─────────────────────────────────────────────
  const pushNotification = useCallback((title: string, body: string, icon?: string) => {
    if (localStorage.getItem('sudhi_dnd') === 'true') return; // Focus mode: swallow
    const id = Math.random().toString(36).substring(2, 10);
    setNotifications(prev => [{ id, title, body, icon, time: Date.now() }, ...prev].slice(0, 30));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const setDnd = useCallback((v: boolean) => {
    setDndState(v);
    localStorage.setItem('sudhi_dnd', String(v));
  }, []);

  // ─── Konami Code → Party Mode (v4) ────────────────────────────────────────
  useEffect(() => {
    const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQ[progress]) {
        progress++;
        if (progress === SEQ.length) {
          progress = 0;
          setKonamiActive(true);
          setToasts(prev => [...prev.slice(-4), { id: 'konami', message: '🎉 KONAMI PARTY MODE! 30s of pure neon chaos!', type: 'success' }]);
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => setKonamiActive(false), 30000);
        }
      } else {
        progress = key === SEQ[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const openWindow = useCallback((id: WinId) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id
          ? { ...w, minimized: false, zIndex: Math.max(...prev.map(x => x.zIndex), 1000) + 1 }
          : w
        );
      }


      // App-specific default sizes
      const APP_SIZES: Partial<Record<WinId, { w: number; h: number }>> = {
        terminal:     { w: 720, h: 480 },
        about:        { w: 660, h: 520 },
        skills:       { w: 700, h: 540 },
        projects:     { w: 860, h: 580 },
        youtube:      { w: 940, h: 580 },
        browser:      { w: 980, h: 640 },
        gallery:      { w: 820, h: 560 },
        videoplayer:  { w: 900, h: 560 },
        'music-player': { w: 480, h: 580 },
        games:        { w: 680, h: 520 },
        'file-explorer': { w: 800, h: 540 },
        paint:        { w: 840, h: 580 },
        notepad:      { w: 700, h: 520 },
        calendar:     { w: 820, h: 580 },
        map:          { w: 900, h: 580 },
        weather:      { w: 480, h: 580 },
        crypto:       { w: 820, h: 580 },
        space:        { w: 800, h: 580 },
        countries:    { w: 900, h: 580 },
        email:        { w: 720, h: 520 },
        contact:      { w: 600, h: 480 },
        settings:     { w: 680, h: 520 },
        focus:        { w: 760, h: 540 },
        typing:       { w: 820, h: 560 },
        toolbox:      { w: 820, h: 560 },
        converter:    { w: 720, h: 540 },
        news:         { w: 920, h: 600 },
      };

      const size = APP_SIZES[id] || { w: 760, h: 520 };

      // Center on screen with cascade offset based on open window count
      const cascade = prev.length * 28;
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const x = Math.max(10, Math.round((vw - size.w) / 2) + cascade) ;
      const y = Math.max(10, Math.round((vh - size.h) / 4) + cascade);

      // Pretty window title
      const TITLES: Partial<Record<WinId, string>> = {
        terminal: '> TERMINAL.cmd', about: '👤 ABOUT.exe', skills: '⚡ SKILLS.sh',
        projects: '📁 PROJECTS', youtube: '▶ YouTube', browser: '🌍 Browser',
        gallery: '🖼️ Gallery', videoplayer: '🎬 Video Player', 'music-player': '🎵 Music Player',
        games: '🎮 Games', 'file-explorer': '📂 File Explorer', paint: '🎨 Paint',
        notepad: '📋 Notepad', calendar: '📅 Calendar', map: '🗺️ Maps',
        weather: '⛅ Weather', crypto: '₿ Crypto', space: '🚀 Space', countries: '🌐 Globe',
        email: '📧 Email', contact: '✉ Contact', settings: '⚙ Settings',
        focus: '⏱ Focus Timer', typing: '⌨ TYPE.RUN', toolbox: '🧰 DEV.TOOLBOX',
        converter: '📐 Unit Converter', news: '📰 DEV.WIRE',
      };

      return [...prev, {
        id,
        title: TITLES[id] || id,
        minimized: false,
        maximized: false,
        position: { x, y },
        size,
        zIndex: Math.max(...prev.map(x => x.zIndex), 1000) + 1,
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
    addToast, startupTime: startupTime.current, visitorCount: 1, konamiActive, jsonData,
    notifications, pushNotification, clearNotifications, dnd, setDnd, toasts, removeToast
  }), [theme, setTheme, activeWallpaper, setWallpaper, matrixOn, toggleMatrix, windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, powerState, addToast, jsonData, konamiActive, notifications, pushNotification, clearNotifications, dnd, setDnd, toasts, removeToast]);

  return (
    <OSContext.Provider value={osValue}>
      {children}
    </OSContext.Provider>
  );
};

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { OSProvider, useOS } from './context/OSContext';
import { MatrixRain } from './components/common/MatrixRain';
import { WindowFrame } from './components/common/WindowFrame';
import { Taskbar } from './components/common/Taskbar';
import { StartMenu } from './components/common/StartMenu';
import { DesktopIcon } from './components/common/DesktopIcon';
import { ContextMenu, SleepScreen, ShutdownScreen } from './components/common/Screens';
import { LockScreen } from './components/common/LockScreen';
import { QuickSettings } from './components/common/QuickSettings';
import { NotificationCenter } from './components/common/NotificationCenter';
import { ShortcutsOverlay } from './components/common/ShortcutsOverlay';
import { ToastStack } from './components/common/ToastStack';
import { useSystemSettings } from './hooks/useSystemSettings';
import { setSystemSetting } from './lib/sysSettings';
import { sfx } from './lib/sfx';
import { DESKTOP_ICONS, THEMES } from './data';
import { getAppIcon } from './iconMeta';
import { ThemeKey, WinId } from './types/os';

// ─── Code Splitting / Lazy Loaded Window Components ─────────────────────────
const TerminalWindow = lazy(() => import('./components/windows/Terminal'));
const AboutWindow = lazy(() => import('./components/windows/About'));
const SkillsWindow = lazy(() => import('./components/windows/Skills'));
const ProjectsWindow = lazy(() => import('./components/windows/Projects'));
const FormForgeContactWindow = lazy(() => import('./components/windows/FormForgeContact'));
const SettingsWindow = lazy(() => import('./components/windows/Settings'));
const YoutubeWindow = lazy(() => import('./components/windows/Youtube'));
const BrowserWindow = lazy(() => import('./components/windows/Browser'));
const GamesWindow = lazy(() => import('./components/windows/Games'));
const GalleryWindow = lazy(() => import('./components/windows/Gallery'));
const VideoPlayerWindow = lazy(() => import('./components/windows/VideoPlayer'));
const NotepadWindow = lazy(() => import('./components/windows/Notepad'));
const FileExplorerWindow = lazy(() => import('./components/windows/FileExplorer'));
const MusicPlayerWindow = lazy(() => import('./components/windows/MusicPlayer'));
const PaintWindow = lazy(() => import('./components/windows/Paint'));
const CalendarWindow = lazy(() => import('./components/windows/Calendar'));
const MapWindow = lazy(() => import('./components/windows/Map'));
const WeatherWindow = lazy(() => import('./components/windows/Weather'));
const CryptoWindow = lazy(() => import('./components/windows/Crypto'));
const SpaceWindow = lazy(() => import('./components/windows/Space'));
const CountriesWindow = lazy(() => import('./components/windows/Countries'));
const SystemInfoWindow = lazy(() => import('./components/windows/SystemInfo'));
const AIAssistantWindow = lazy(() => import('./components/windows/AIAssistant'));
const DevOpsMonitorWindow = lazy(() => import('./components/windows/DevOpsMonitor'));
const WorkspacesWindow = lazy(() => import('./components/windows/Workspaces'));
const CalculatorWindow = lazy(() => import('./components/windows/Calculator'));
const QuotesWindow = lazy(() => import('./components/windows/Quotes'));
const GmailWindow = lazy(() => import('./components/windows/Gmail'));
const FocusTimerWindow = lazy(() => import('./components/windows/FocusTimer'));
const TypingTestWindow = lazy(() => import('./components/windows/TypingTest'));
const ToolboxWindow = lazy(() => import('./components/windows/Toolbox'));
const ConverterWindow = lazy(() => import('./components/windows/Converter'));
const NewsWindow = lazy(() => import('./components/windows/News'));

import { DesktopWidgets } from './components/common/DesktopWidgets';

function DesktopContent() {
  const {
    theme, setTheme, activeWallpaper, matrixOn, toggleMatrix,
    windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow,
    updateWindowPos, updateWindowSize, powerState, setPowerState, addToast,
    pushNotification, konamiActive
  } = useOS();
  const sys = useSystemSettings();

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [, forceSettingsRender] = useState(0);

  // Re-render when Quick Settings mutates localStorage-backed toggles (grid/CRT)
  useEffect(() => {
    const onChange = () => forceSettingsRender(v => v + 1);
    window.addEventListener('sudhi-settings-changed', onChange);
    return () => window.removeEventListener('sudhi-settings-changed', onChange);
  }, []);

  // Glass blur master switch (Settings → Effects + Quick Settings)
  useEffect(() => {
    document.documentElement.classList.toggle('no-blur', !sys.glassBlur);
  }, [sys.glassBlur]);

  // Window open/close UI sounds (v4)
  const prevWinCount = React.useRef(windows.length);
  useEffect(() => {
    const prev = prevWinCount.current;
    if (windows.length > prev) sfx.play('open');
    else if (windows.length < prev) sfx.play('close');
    prevWinCount.current = windows.length;
  }, [windows.length]);

  // Konami party mode — cycling themes + frame while active
  useEffect(() => {
    if (!konamiActive) return;
    const keys: ThemeKey[] = ['crimson', 'cyan', 'purple', 'green', 'amber', 'blue', 'mono'];
    let i = 0;
    const t = setInterval(() => { setTheme(keys[i % keys.length]); i++; }, 1200);
    return () => clearInterval(t);
  }, [konamiActive, setTheme]);


  // Send a desktop notification helper
  const sendNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: icon || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23080a10'/%3E%3Ctext x='32' y='42' font-family='monospace' font-size='28' font-weight='bold' fill='%2300FF88' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" });
    }
  }, []);

  const handleLogin = useCallback((mode: 'user' | 'guest') => {
    setIsLoggedIn(true);
    sfx.play('unlock');
    // Send welcome notification
    setTimeout(() => {
      sfx.play('boot');
      sendNotification('🖥️ SUDHI OS Ready!', `Welcome ${mode === 'user' ? 'Sudhir' : 'Guest'}! ${DESKTOP_ICONS.length} apps loaded.`);
      pushNotification('🖥️ Welcome to SUDHI OS v4', `${DESKTOP_ICONS.length} apps loaded • Press F1 for the shortcuts guide`, '🖥️');
    }, 1500);
    setTimeout(() => {
      sendNotification('📧 3 New Messages', 'You have unread messages in Email.');
      pushNotification('📧 3 New Messages', 'You have unread messages in the Mailbox app.', '📧');
    }, 4000);
    setTimeout(() => {
      sendNotification('⛅ Weather Update', 'Bihar: 32°C, Partly Cloudy. Open Weather app for details.');
      pushNotification('⚡ Pro tip', 'Hover any maximize button for Snap Layouts, or drag windows to screen corners.', '💡');
    }, 7000);
  }, [sendNotification, pushNotification]);

  // ─── Alt+Tab & Command Palette Overlay States ─────────────────────────────
  const [showAltTab, setShowAltTab] = useState(false);
  const [altTabIndex, setAltTabIndex] = useState(0);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const availableHeight = vh - 60; // 60px taskbar + padding margin
    const ROW_H = 76;   // vertical step between rows
    const COL_W = 84;   // horizontal step between columns
    const START_X = 12; // left margin
    const START_Y = 12; // top margin

    // Dynamically calculate how many icons can fit vertically on THIS screen height!
    const ITEMS_PER_COL = Math.max(3, Math.floor(availableHeight / ROW_H));

    DESKTOP_ICONS.forEach((icon, index) => {
      const col = Math.floor(index / ITEMS_PER_COL);
      const row = index % ITEMS_PER_COL;
      positions[icon.id] = {
        x: START_X + col * COL_W,
        y: START_Y + row * ROW_H,
      };
    });
    return positions;
  });

  // Re-calculate layout on window resize so icons never hide when browser is resized
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const availableHeight = vh - 60;
      const ROW_H = 76;
      const COL_W = 84;
      const START_X = 12;
      const START_Y = 12;
      const ITEMS_PER_COL = Math.max(3, Math.floor(availableHeight / ROW_H));

      setIconPositions(prev => {
        const next = { ...prev };
        DESKTOP_ICONS.forEach((icon, index) => {
          const col = Math.floor(index / ITEMS_PER_COL);
          const row = index % ITEMS_PER_COL;
          // Only auto-layout if position was default left-side column grid
          next[icon.id] = {
            x: START_X + col * COL_W,
            y: START_Y + row * ROW_H,
          };
        });
        return next;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // ─── Keyboard Shortcuts: Palette, Alt+Tab, Lock, Overlays ─────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'p') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setShowCmdPalette(v => !v);
        setCmdSearch('');
      }

      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        if (windows.length > 0) {
          setShowAltTab(true);
          setAltTabIndex(prev => (prev + 1) % windows.length);
        }
      }

      // Win+L = Lock screen
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLoggedIn(false);
      }

      // F1 = Shortcuts & gestures overlay
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }

      // Ctrl+Alt+Q = Quick Settings • Ctrl+Alt+N = Notification Center
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setShowQuickSettings(v => !v);
        setShowNotifications(false);
      }
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNotifications(v => !v);
        setShowQuickSettings(false);
      }

      // Escape closes overlays
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowQuickSettings(false);
        setShowNotifications(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && showAltTab) {
        setShowAltTab(false);
        if (windows[altTabIndex]) {
          focusWindow(windows[altTabIndex].id as WinId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [windows, altTabIndex, showAltTab, focusWindow]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleLogoClick = useCallback(() => {
    setLogoClickCount(c => {
      const next = c + 1;
      if (next >= 5) {
        addToast('🔓 Secret Unlocked! Developer mode!', 'success');
        return 0;
      }
      return next;
    });
  }, [addToast]);

  const topWindowId = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

  const filteredCmdApps = DESKTOP_ICONS.filter(i =>
    i.label.toLowerCase().includes(cmdSearch.toLowerCase()) || i.id.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  // Command palette v4 — inline math engine
  const cmdQuery = cmdSearch.trim();
  const mathResult: number | null = (() => {
    if (!/^[-+*/().\d\s%^]+$/.test(cmdQuery) || !/\d/.test(cmdQuery) || !/[-+*/%^]/.test(cmdQuery)) return null;
    try {
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict";return (${cmdQuery.replace(/%/g, '/100')})`)();
      return typeof r === 'number' && Number.isFinite(r) ? r : null;
    } catch { return null; }
  })();

  // Command palette v4 — system commands
  const SYSTEM_CMDS: { id: string; label: string; desc: string; action: () => void }[] = [
    { id: 'lock',    label: '🔒 Lock screen',        desc: 'Ctrl+L',              action: () => setIsLoggedIn(false) },
    { id: 'sleep',   label: '💤 Sleep',              desc: 'Dim system',          action: () => setPowerState('sleeping') },
    { id: 'restart', label: '🔄 Restart',            desc: 'Reboot SUDHI OS',     action: () => setPowerState('booting') },
    { id: 'shutdown',label: '⏻ Shutdown',            desc: 'Power off',           action: () => setPowerState('shutdown') },
    { id: 'matrix',  label: '🌐 Toggle Matrix Rain', desc: 'Desktop effect',      action: () => toggleMatrix() },
    { id: 'aurora',  label: '✨ Toggle Aurora',      desc: 'Animated backdrop',   action: () => setSystemSetting('aurora', !sys.aurora) },
    { id: 'shortcuts', label: '⌨ Shortcuts overlay', desc: 'F1',                  action: () => setShowShortcuts(true) },
  ].filter(c => !cmdQuery || c.label.toLowerCase().includes(cmdQuery.toLowerCase()) || c.id.includes(cmdQuery.toLowerCase()));

  const renderWindowContent = (id: WinId) => {
    return (
      <Suspense fallback={<div style={{ padding: 20, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Loading app module...</div>}>
        {(() => {
          switch (id) {
            case 'terminal': return <TerminalWindow />;
            case 'about': return <AboutWindow />;
            case 'skills': return <SkillsWindow />;
            case 'projects': return <ProjectsWindow />;
            case 'contact': return <FormForgeContactWindow />;
            case 'settings': return <SettingsWindow />;
            case 'youtube': return <YoutubeWindow />;
            case 'browser': return <BrowserWindow />;
            case 'games': return <GamesWindow />;
            case 'gallery': return <GalleryWindow />;
            case 'videoplayer': return <VideoPlayerWindow />;
            case 'notepad': return <NotepadWindow />;
            case 'file-explorer': return <FileExplorerWindow />;
            case 'music-player': return <MusicPlayerWindow />;
            case 'paint': return <PaintWindow />;
            case 'calendar': return <CalendarWindow />;
            case 'map': return <MapWindow />;
            case 'weather': return <WeatherWindow />;
            case 'crypto': return <CryptoWindow />;
            case 'space': return <SpaceWindow />;
            case 'countries': return <CountriesWindow />;
            case 'sysinfo': return <SystemInfoWindow />;
            case 'ai-assistant': return <AIAssistantWindow />;
            case 'devops-monitor': return <DevOpsMonitorWindow />;
            case 'workspaces': return <WorkspacesWindow />;
            case 'calculator': return <CalculatorWindow />;
            case 'quotes': return <QuotesWindow />;
            case 'email': return <GmailWindow />;
            case 'focus': return <FocusTimerWindow />;
            case 'typing': return <TypingTestWindow />;
            case 'toolbox': return <ToolboxWindow />;
            case 'converter': return <ConverterWindow />;
            case 'news': return <NewsWindow />;
            default: return <div style={{ padding: 20, color: '#666' }}>App window module: {id}</div>;
          }
        })()}
      </Suspense>
    );
  };

  if (powerState === 'shutdown') {
    return <ShutdownScreen onWake={() => setPowerState('booting')} />;
  }

  // Show Lock Screen before desktop
  if (!isLoggedIn) {
    return <LockScreen onLogin={handleLogin} />;
  }

  return (
    <div className={`desktop-only${konamiActive ? ' konami-party' : ''}`} style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <MatrixRain active={matrixOn} accent={THEMES[theme].accent} />

      {/* Animated aurora backdrop (v4 premium) */}
      {sys.aurora && !activeWallpaper && <div className="aurora-bg" aria-hidden />}

      {activeWallpaper && (
        <div
          className="desktop-wp-layer"
          style={{
            position: 'fixed', inset: 0,
            backgroundImage: /^(url\(|data:|blob:|https?:|\/)/.test(activeWallpaper) ? `url(${activeWallpaper})` : activeWallpaper,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: (Number(localStorage.getItem('sudhi_wp_op') || 90) / 100),
            zIndex: 1, pointerEvents: 'none', transition: 'background-image 0.5s, opacity 0.2s',
          }}
        />
      )}

      {/* Konami party glow frame */}
      {konamiActive && <div className="konami-frame" aria-hidden />}

      {/* Night light (warm tint) + brightness dimmer — v4 */}
      {sys.nightLight && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999994, pointerEvents: 'none', background: 'rgba(255, 140, 40, 0.13)', mixBlendMode: 'multiply' }} aria-hidden />
      )}
      {sys.brightness < 100 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999995, pointerEvents: 'none', background: `rgba(0,0,0,${((100 - sys.brightness) / 100) * 0.8})`, transition: 'background 0.2s' }} aria-hidden />
      )}

      <div className="bg-grid" style={{ display: localStorage.getItem('sudhi_grid') === 'true' ? 'block' : 'none' }} />
      <div className="crt-overlay" style={{ display: localStorage.getItem('sudhi_crt') === 'true' ? 'block' : 'none' }} />


      {/* Live Desktop Widgets (top-right) */}
      <DesktopWidgets />

      {powerState === 'sleeping' && (
        <SleepScreen onWake={() => { setPowerState('running'); addToast('System Resumed', 'success'); }} />
      )}

      <div
        style={{ position: 'fixed', inset: 0, bottom: 48, zIndex: 3 }}
        onContextMenu={handleContextMenu}
        onClick={() => { setStartMenuOpen(false); setContextMenu(null); setSelectedIcon(null); }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 3 }} onClick={e => e.stopPropagation()}>
          {DESKTOP_ICONS.map(icon => (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              selected={selectedIcon === icon.id}
              position={iconPositions[icon.id] || { x: 8, y: 8 }}
              onPositionChange={(id, pos) => setIconPositions(prev => ({ ...prev, [id]: pos }))}
              onSingleClick={() => setSelectedIcon(icon.id)}
              onDoubleClick={() => {
                if (icon.id === 'matrix') {
                  toggleMatrix();
                  addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info');
                } else {
                  openWindow(icon.id as WinId);
                  addToast(`${icon.label} loaded`, 'success');
                }
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {windows.filter(w => !w.minimized).map(win => (
          <WindowFrame
            key={win.id}
            win={win}
            isActive={win.id === topWindowId}
            onClose={() => closeWindow(win.id as WinId)}
            onMinimize={() => minimizeWindow(win.id as WinId)}
            onMaximize={() => maximizeWindow(win.id as WinId)}
            onFocus={() => focusWindow(win.id as WinId)}
            onMove={pos => updateWindowPos(win.id as WinId, pos)}
            onResize={size => updateWindowSize(win.id as WinId, size)}
          >
            {renderWindowContent(win.id)}
          </WindowFrame>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showAltTab && windows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 99999,
              display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)'
            }}
          >
            <div style={{ background: 'rgba(15,17,24,0.95)', border: '1px solid var(--accent)', borderRadius: 12, padding: 24, display: 'flex', gap: 16, boxShadow: '0 0 40px rgba(var(--accent-rgb),0.3)' }}>
              {windows.map((win, idx) => (
                <div
                  key={win.id}
                  style={{
                    padding: 16, border: `2px solid ${idx === altTabIndex ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, background: idx === altTabIndex ? 'rgba(var(--accent-rgb),0.2)' : 'rgba(0,0,0,0.5)',
                    textAlign: 'center', width: 110, transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🪟</div>
                  <div style={{ color: idx === altTabIndex ? 'var(--accent)' : '#aaa', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCmdPalette && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 100 }}
            onClick={() => setShowCmdPalette(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 500, maxWidth: '90vw', background: 'rgba(15,17,24,0.95)', border: '1px solid var(--accent)',
                borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(var(--accent-rgb),0.3)',
                fontFamily: 'var(--font-mono)', backdropFilter: 'blur(20px)'
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Search size={18} color="var(--accent)" />
                <input
                  type="text"
                  value={cmdSearch}
                  onChange={e => setCmdSearch(e.target.value)}
                  placeholder="Type to search apps or commands... (e.g. Explorer, Music, Paint)"
                  autoFocus
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ maxHeight: 340, overflowY: 'auto', padding: 8 }}>
                {/* Inline calculator result */}
                {mathResult !== null && (
                  <div
                    onClick={() => {
                      navigator.clipboard?.writeText(String(mathResult)).catch(() => {});
                      addToast(`Copied: ${mathResult}`, 'success');
                      setShowCmdPalette(false);
                    }}
                    style={{
                      padding: '10px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(var(--accent-rgb),0.18)', marginBottom: 4, border: '1px solid rgba(var(--accent-rgb),0.4)',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🧮</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>= {mathResult}</div>
                      <div style={{ color: '#666', fontSize: 10 }}>Click to copy result</div>
                    </div>
                  </div>
                )}

                {/* System commands */}
                {SYSTEM_CMDS.map(cmd => (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      setShowCmdPalette(false);
                      sfx.play('click');
                      addToast(`⚡ ${cmd.label}`, 'info');
                    }}
                    style={{
                      padding: '10px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(255,255,255,0.03)', marginBottom: 4, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <span style={{ fontSize: 16 }}>{cmd.label.split(' ')[0]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#ddd', fontSize: 12, fontWeight: 'bold' }}>{cmd.label.replace(/^\S+\s/, '')}</div>
                      <div style={{ color: '#666', fontSize: 10 }}>System command • {cmd.desc}</div>
                    </div>
                  </div>
                ))}

                {filteredCmdApps.map(app => (
                  <div
                    key={app.id}
                    onClick={() => {
                      if (app.id === 'matrix') toggleMatrix();
                      else openWindow(app.id as WinId);
                      setShowCmdPalette(false);
                      addToast(`Opened ${app.label}`, 'success');
                    }}
                    style={{
                      padding: '10px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(255,255,255,0.03)', marginBottom: 4, transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0, position: 'relative', overflow: 'hidden',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: `linear-gradient(135deg, ${getAppIcon(app.id).from} 0%, ${getAppIcon(app.id).to} 100%)`,
                      boxShadow: `0 3px 8px rgba(0,0,0,0.35), 0 5px 12px ${getAppIcon(app.id).glow}`,
                    }}>
                      <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 45%)' }} />
                      {React.createElement(getAppIcon(app.id).glyph, { size: 18, color: '#fff', strokeWidth: 2 })}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 'bold' }}>{app.label}</div>
                      <div style={{ color: '#666', fontSize: 10 }}>App identifier: {app.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRefresh={() => addToast('Desktop Refreshed', 'info')}
          onTheme={(k: ThemeKey) => setTheme(k)}
          onToggleMatrix={toggleMatrix}
        />
      )}

      <StartMenu
        open={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        logoClickCount={logoClickCount}
        onLogoClick={handleLogoClick}
      />

      {/* v4 shell overlays */}
      <AnimatePresence>
        {showQuickSettings && (
          <QuickSettings
            open={showQuickSettings}
            onClose={() => setShowQuickSettings(false)}
            anchorRight={16}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
            anchorRight={16}
          />
        )}
      </AnimatePresence>

      <ShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <ToastStack />

      <Taskbar
        onStartClick={() => { sfx.play('click'); setStartMenuOpen(v => !v); }}
        onOpenQuickSettings={() => { setShowQuickSettings(v => !v); setShowNotifications(false); }}
        onOpenNotifications={() => { setShowNotifications(v => !v); setShowQuickSettings(false); }}
      />
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <DesktopContent />
    </OSProvider>
  );
}

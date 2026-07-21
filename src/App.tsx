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
import { DESKTOP_ICONS, THEMES } from './data';
import { ThemeKey, WinId } from './types/os';

// ─── Code Splitting / Lazy Loaded Window Components ─────────────────────────
const TerminalWindow = lazy(() => import('./components/windows/Terminal'));
const AboutWindow = lazy(() => import('./components/windows/About'));
const SkillsWindow = lazy(() => import('./components/windows/Skills'));
const ProjectsWindow = lazy(() => import('./components/windows/Projects'));
const ContactWindow = lazy(() => import('./components/windows/Contact'));
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

function DesktopContent() {
  const {
    theme, setTheme, activeWallpaper, matrixOn, toggleMatrix,
    windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow,
    updateWindowPos, updateWindowSize, powerState, setPowerState, addToast
  } = useOS();

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // ─── Alt+Tab & Command Palette Overlay States ─────────────────────────────
  const [showAltTab, setShowAltTab] = useState(false);
  const [altTabIndex, setAltTabIndex] = useState(0);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const itemsPerCol = 6;
    DESKTOP_ICONS.forEach((icon, index) => {
      const col = Math.floor(index / itemsPerCol);
      const row = index % itemsPerCol;
      positions[icon.id] = { x: 12 + col * 94, y: 12 + row * 92 };
    });
    return positions;
  });

  // ─── Keyboard Shortcuts: Alt+Tab & Ctrl+P Command Palette ──────────────────
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

  const renderWindowContent = (id: WinId) => {
    return (
      <Suspense fallback={<div style={{ padding: 20, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Loading app module...</div>}>
        {(() => {
          switch (id) {
            case 'terminal': return <TerminalWindow />;
            case 'about': return <AboutWindow />;
            case 'skills': return <SkillsWindow />;
            case 'projects': return <ProjectsWindow />;
            case 'contact': return <ContactWindow />;
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
            default: return <div style={{ padding: 20, color: '#666' }}>App window module: {id}</div>;
          }
        })()}
      </Suspense>
    );
  };

  if (powerState === 'shutdown') {
    return <ShutdownScreen onWake={() => setPowerState('booting')} />;
  }

  return (
    <div className="desktop-only" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <MatrixRain active={matrixOn} accent={THEMES[theme].accent} />

      {activeWallpaper && (
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${activeWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6, zIndex: 1, pointerEvents: 'none', transition: 'background-image 0.5s' }} />
      )}

      <div className="bg-grid" />
      <div className="crt-overlay" />

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

              <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
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
                    <span style={{ fontSize: 20 }}>{app.emoji || '🪟'}</span>
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

      <Taskbar onStartClick={() => setStartMenuOpen(v => !v)} />
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

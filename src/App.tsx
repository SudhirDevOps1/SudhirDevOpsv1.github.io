import React, { useState, useCallback, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

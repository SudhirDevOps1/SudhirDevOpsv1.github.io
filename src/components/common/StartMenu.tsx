import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { THEMES } from '../../data';
import { ThemeKey, WinId } from '../../types/os';

interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  logoClickCount: number;
  onLogoClick: () => void;
}

export const StartMenu = memo(({ open, onClose, logoClickCount, onLogoClick }: StartMenuProps) => {
  const { openWindow, theme, setTheme, matrixOn, toggleMatrix, setPowerState, addToast } = useOS();

  const handleApp = (id: WinId) => { openWindow(id); onClose(); };

  const themeAction = (k: ThemeKey) => {
    setTheme(k);
    addToast(`Theme: ${THEMES[k].name}`, 'success');
    onClose();
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '7px 16px',
    background: 'none', border: 'none', color: '#ccc',
    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
    textAlign: 'left', transition: 'all 0.15s',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 899 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', bottom: 52, left: 4, width: 280, zIndex: 900,
              background: '#080808', border: '1px solid var(--accent)', borderRadius: 6,
              overflow: 'hidden', boxShadow: '0 0 30px rgba(var(--accent-rgb),0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div
              style={{ background: 'rgba(var(--accent-rgb),0.1)', padding: '12px 16px', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', cursor: 'pointer' }}
              onClick={onLogoClick}
            >
              <div style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 14, letterSpacing: 2 }}>▓▓ SUDHI OS v2.0</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>sudhi@portfolio</div>
              {logoClickCount >= 3 && <div style={{ color: '#FFB300', fontSize: 10, marginTop: 4 }}>{5 - logoClickCount} more clicks for secret...</div>}
            </div>

            <div style={{ borderBottom: '1px solid #1a1a1a', maxHeight: 220, overflowY: 'auto' }}>
              <div style={{ padding: '6px 16px 2px', color: '#444', fontSize: 10, letterSpacing: 2 }}>APPLICATIONS</div>
              {[
                { id: 'youtube' as WinId, label: '▶ YOUTUBE.app' },
                { id: 'browser' as WinId, label: '🌍 BROWSER.net' },
                { id: 'gallery' as WinId, label: '🖼️ GALLERY.photos' },
                { id: 'videoplayer' as WinId, label: '🎬 MEDIA.video' },
                { id: 'games' as WinId, label: '🎮 GAMES.exe' },
                { id: 'terminal' as WinId, label: '>_ TERMINAL.cmd' },
                { id: 'about' as WinId, label: '👤 ABOUT.exe' },
                { id: 'skills' as WinId, label: '⚡ SKILLS.sh' },
                { id: 'projects' as WinId, label: '📁 PROJECTS/' },
                { id: 'contact' as WinId, label: '✉ CONTACT.mail' },
              ].map(a => (
                <button key={a.id} style={menuItemStyle} onClick={() => handleApp(a.id)}>
                  {'> '}{a.label}
                </button>
              ))}
            </div>

            <div style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '6px 16px 2px', color: '#444', fontSize: 10, letterSpacing: 2 }}>THEMES</div>
              {Object.entries(THEMES).map(([k, v]) => (
                <button key={k} style={{ ...menuItemStyle, color: theme === k ? 'var(--accent)' : '#ccc' }} onClick={() => themeAction(k as ThemeKey)}>
                  {theme === k ? '● ' : '○ '}{v.name}
                </button>
              ))}
            </div>

            <div style={{ padding: '4px 0' }}>
              {[
                { label: '💤 Sleep', action: () => { setPowerState('sleeping'); addToast('Entering Sleep Mode...', 'info'); onClose(); } },
                { label: '🔄 Restart', action: () => { setPowerState('booting'); onClose(); } },
                { label: '⏻  Shutdown', action: () => { setPowerState('shutdown'); onClose(); } },
              ].map(item => (
                <button key={item.label} style={menuItemStyle} onClick={item.action}>
                  {'> '}{item.label}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

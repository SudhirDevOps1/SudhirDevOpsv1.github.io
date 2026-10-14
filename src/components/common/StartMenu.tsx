import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { THEMES, DESKTOP_ICONS } from '../../data';
import { ThemeKey, WinId } from '../../types/os';
import { sfx } from '../../lib/sfx';

interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  logoClickCount: number;
  onLogoClick: () => void;
}

export const StartMenu = memo(({ open, onClose, logoClickCount, onLogoClick }: StartMenuProps) => {
  const { openWindow, theme, setTheme, matrixOn, toggleMatrix, setPowerState, addToast } = useOS();
  const [query, setQuery] = useState('');

  const handleApp = (id: WinId) => { sfx.play('open'); openWindow(id); onClose(); };

  // Deduped, searchable app list
  const allApps = useMemo(() => {
    const seen = new Set<string>();
    return DESKTOP_ICONS.filter(i => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allApps.filter(i => i.label.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [query, allApps]);

  const themeAction = (k: ThemeKey) => {
    setTheme(k);
    addToast(`Theme: ${THEMES[k].name}`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 899 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed', bottom: 58, left: '50%', transform: 'translateX(-50%)',
              width: 360, zIndex: 900,
              background: 'rgba(15, 17, 23, 0.94)', border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(var(--accent-rgb),0.2)',
              fontFamily: 'var(--font-mono)', backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div
              style={{ background: 'rgba(var(--accent-rgb),0.12)', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={onLogoClick}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/image/logo.png" alt="SUDHI OS Logo" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--accent)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 15, letterSpacing: 2, fontWeight: 'bold' }}>SUDHI OS PRO</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>SudhirDevOps1</div>
                </div>
              </div>
              {logoClickCount >= 3 && <div style={{ color: '#FFB300', fontSize: 10 }}>{5 - logoClickCount} clicks secret</div>}
            </div>

            {/* Search box */}
            <div style={{ padding: '10px 14px 6px' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="🔍  Search apps, tools, games..."
                autoFocus={open}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.35)',
                  color: '#fff', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
            </div>

            {/* Applications Grid */}
            <div style={{ padding: '6px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {query.trim() ? (
                <>
                  <div style={{ padding: '0 4px 10px', color: '#666', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' }}>
                    {searchResults.length > 0 ? `${searchResults.length} RESULT${searchResults.length > 1 ? 'S' : ''}` : 'NO MATCHES'}
                  </div>
                  <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {searchResults.map(a => (
                      <div
                        key={a.id}
                        onClick={() => { if (a.id === 'matrix') { toggleMatrix(); onClose(); } else handleApp(a.id); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>{a.emoji || a.icon || '🪟'}</span>
                        <span style={{ color: '#ddd', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{a.label}</span>
                        <span style={{ color: '#444', fontSize: 9, marginLeft: 'auto' }}>{a.id}</span>
                      </div>
                    ))}
                    {searchResults.length === 0 && (
                      <div style={{ color: '#555', fontSize: 11, textAlign: 'center', padding: '18px 0' }}>
                        No app found for “{query}”
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: '0 4px 10px', color: '#666', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' }}>PINNED APPS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
                    {[
                      { id: 'youtube' as WinId, label: 'YouTube', icon: '▶' },
                      { id: 'browser' as WinId, label: 'Browser', icon: '🌍' },
                      { id: 'gallery' as WinId, label: 'Gallery', icon: '🖼️' },
                      { id: 'videoplayer' as WinId, label: 'Media', icon: '🎬' },
                      { id: 'games' as WinId, label: 'Snake Arcade', icon: '🎮' },
                      { id: 'terminal' as WinId, label: 'Terminal', icon: '>_' },
                      { id: 'focus' as WinId, label: 'Focus Timer', icon: '⏱️' },
                      { id: 'news' as WinId, label: 'DEV.WIRE', icon: '📰' },
                      { id: 'toolbox' as WinId, label: 'Dev Toolbox', icon: '🧰' },
                      { id: 'converter' as WinId, label: 'Converter', icon: '📐' },
                      { id: 'typing' as WinId, label: 'Typing Test', icon: '⌨️' },
                      { id: 'about' as WinId, label: 'About', icon: '👤' },
                      { id: 'skills' as WinId, label: 'Skills', icon: '⚡' },
                      { id: 'projects' as WinId, label: 'Projects', icon: '📁' },
                      { id: 'contact' as WinId, label: 'Contact', icon: '✉' },
                      { id: 'notepad' as WinId, label: 'Notepad', icon: '📋' },
                      { id: 'settings' as WinId, label: 'Settings', icon: '⚙' },
                    ].map(a => (
                      <div
                        key={a.id}
                        onClick={() => handleApp(a.id)}
                        style={{
                          padding: 10, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.2)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
                        <div style={{ color: '#ccc', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* All apps list */}
                  <div style={{ padding: '12px 4px 8px', color: '#666', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' }}>
                    ALL APPS ({allApps.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 108, overflowY: 'auto', paddingBottom: 2 }}>
                    {allApps.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { if (a.id === 'matrix') { toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); onClose(); } else handleApp(a.id); }}
                        title={a.label}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 6,
                          border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)',
                          color: '#bbb', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10,
                          transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.18)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#bbb'; }}
                      >
                        <span>{a.emoji || a.icon || '🪟'}</span>
                        <span>{a.label.split('.')[0]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Themes Selector */}
            <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#666', fontSize: 10, letterSpacing: 2, marginBottom: 8, fontWeight: 'bold' }}>COLOR THEME</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(THEMES).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => themeAction(k as ThemeKey)}
                    style={{
                      flex: 1, padding: '6px', border: `1px solid ${theme === k ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 6, background: theme === k ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                      color: theme === k ? 'var(--accent)' : '#aaa', cursor: 'pointer', fontSize: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.accent }} />
                    {v.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Power options */}
            <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
              <button
                onClick={() => { toggleMatrix(); addToast(`Matrix: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); onClose(); }}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}
              >
                🌐 Matrix Rain: {matrixOn ? 'ON' : 'OFF'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: '💤', action: () => { setPowerState('sleeping'); onClose(); } },
                  { label: '🔄', action: () => { setPowerState('booting'); onClose(); } },
                  { label: '⏻', action: () => { setPowerState('shutdown'); onClose(); } },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    style={{ width: 32, height: 32, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer', fontSize: 14 }}
                  >{item.label}</button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

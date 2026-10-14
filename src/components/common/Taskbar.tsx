import React, { memo, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { WinId } from '../../types/os';
import { sfx } from '../../lib/sfx';

interface TaskbarProps {
  onStartClick: () => void;
  onOpenQuickSettings?: () => void;
  onOpenNotifications?: () => void;
}

const PINNED: { id: WinId; glyph: string; label: string }[] = [
  { id: 'terminal',     glyph: '>_', label: 'Terminal' },
  { id: 'browser',      glyph: '🌍', label: 'Browser' },
  { id: 'projects',     glyph: '📁', label: 'Projects' },
  { id: 'news',         glyph: '📰', label: 'DEV.WIRE' },
  { id: 'toolbox',      glyph: '🧰', label: 'DEV.TOOLBOX' },
  { id: 'settings',     glyph: '⚙',  label: 'Settings' },
];

export const Taskbar = memo(({ onStartClick, onOpenQuickSettings, onOpenNotifications }: TaskbarProps) => {
  const { windows, focusWindow, minimizeWindow, closeWindow, openWindow, notifications, dnd } = useOS();
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [tabMenu, setTabMenu] = useState<string | null>(null);
  const activeWinId = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Real battery via Battery Status API (fallback: baked 92%)
  useEffect(() => {
    let bat: { level: number; charging: boolean; addEventListener: (t: string, cb: () => void) => void } | null = null;
    let mounted = true;
    const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean; addEventListener: (t: string, cb: () => void) => void }> };
    if (nav.getBattery) {
      nav.getBattery().then(b => {
        if (!mounted) return;
        bat = b;
        const sync = () => mounted && setBattery({ level: Math.round(b.level * 100), charging: b.charging });
        sync();
        b.addEventListener('levelchange', sync);
        b.addEventListener('chargingchange', sync);
      }).catch(() => {});
    }
    return () => { mounted = false; void bat; };
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleTabClick = (winId: string) => {
    const win = windows.find(w => w.id === winId);
    sfx.play('click');
    if (!win) { openWindow(winId as WinId); return; }
    if (win.minimized) focusWindow(winId as WinId);
    else if (win.id === activeWinId) minimizeWindow(winId as WinId);
    else focusWindow(winId as WinId);
  };

  const trayBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '5px 7px', borderRadius: 7, border: 'none', background: 'transparent',
    color: '#bbb', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
    transition: 'all 0.15s', position: 'relative',
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 48, zIndex: 1000,
      background: 'rgba(15, 17, 23, 0.82)', borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px',
      backdropFilter: 'blur(20px) saturate(180%)', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Pinned quick-launch (left) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {PINNED.map(p => {
          const isOpen = windows.some(w => w.id === p.id);
          return (
            <button
              key={p.id}
              onClick={() => { sfx.play('click'); openWindow(p.id); }}
              title={p.label}
              style={{
                width: 34, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', color: isOpen ? 'var(--accent)' : '#bbb',
                fontSize: p.glyph.length > 1 ? 15 : 11, fontWeight: 'bold', fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {p.glyph}
              {isOpen && (
                <span style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 12, height: 2.5, borderRadius: 2, background: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Windows 11 Center Dock */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => { sfx.play('click'); onStartClick(); }}
          title="Start Menu"
          style={{
            width: 40, height: 40, border: 'none', borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.35), rgba(var(--accent-rgb),0.12))',
            color: 'var(--accent)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            transition: 'all 0.2s', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 0 14px rgba(var(--accent-rgb),0.25)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.45)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--accent-rgb),0.35), rgba(var(--accent-rgb),0.12))'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          🪟
        </button>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Windows Taskbar Tabs */}
        {windows.map(win => {
          const isActive = win.id === activeWinId && !win.minimized;
          return (
            <div key={win.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleTabClick(win.id)}
                onContextMenu={e => { e.preventDefault(); setTabMenu(tabMenu === win.id ? null : win.id); }}
                style={{
                  height: 40, padding: '0 12px', border: 'none',
                  borderRadius: 8, background: isActive ? 'rgba(var(--accent-rgb), 0.25)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'var(--accent)' : win.minimized ? '#666' : '#ccc',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                  display: 'flex', alignItems: 'center', gap: 6,
                  maxWidth: 160, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? 'inset 0 0 8px rgba(var(--accent-rgb),0.3), 0 2px 8px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                <span>{win.title}</span>
              </button>
              {tabMenu === win.id && (
                <div style={{
                  position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(15, 17, 23, 0.95)', border: '1px solid var(--accent)', borderRadius: 8,
                  zIndex: 2000, minWidth: 130, overflow: 'hidden', backdropFilter: 'blur(12px)',
                }}>
                  {[
                    ['Restore', () => focusWindow(win.id as WinId)],
                    ['Minimize', () => minimizeWindow(win.id as WinId)],
                    ['Close', () => closeWindow(win.id as WinId)],
                  ].map(([label, action]) => (
                    <button key={label as string}
                      onClick={() => { (action as () => void)(); setTabMenu(null); }}
                      style={{
                        display: 'block', width: '100%', padding: '8px 12px',
                        background: 'none', border: 'none', color: '#ccc',
                        cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'left',
                      }}
                    >{label as string}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Windows 11 Right System Tray */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
        {/* Quick action icons → Quick Settings */}
        <div
          onClick={() => { sfx.play('click'); onOpenQuickSettings?.(); }}
          title="Quick Settings"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <span title="Wi-Fi: SUDHI-5G">📶</span>
          <span title={dnd ? 'Focus mode ON — audio muted' : 'Audio Volume'}>{dnd ? '🔇' : '🔊'}</span>
          <span
            title={`Battery: ${battery ? `${battery.level}%${battery.charging ? ' (charging)' : ''}` : '92% (est.)'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 3 }}
          >
            {battery?.charging && <span className="battery-charging">⚡</span>}
            🔋 {battery ? `${battery.level}%` : '92%'}
          </span>
          {dnd && <span title="Focus mode active" style={{ filter: 'drop-shadow(0 0 4px #BF00FF)' }}>🌙</span>}
        </div>

        {/* Notification bell with unread badge */}
        <button
          onClick={() => { sfx.play('click'); onOpenNotifications?.(); }}
          title="Notification Center"
          style={trayBtn}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          🔔
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0, minWidth: 14, height: 14, padding: '0 3px',
              borderRadius: 999, background: 'var(--accent)', color: '#000', fontSize: 8.5, fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 8px rgba(var(--accent-rgb),0.8)',
            }}>
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>

        <button
          title="Lock Screen (Ctrl+L)"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l', ctrlKey: true, bubbles: true }))}
          style={trayBtn}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >🔒</button>

        {/* Clock */}
        <button
          onClick={() => { sfx.play('click'); onOpenNotifications?.(); }}
          style={{
            textAlign: 'right', display: 'flex', flexDirection: 'column', cursor: 'pointer',
            padding: '2px 6px', minWidth: 68, background: 'transparent', border: 'none',
            fontFamily: 'var(--font-mono)', borderRadius: 7, transition: 'all 0.15s',
          }}
          title={now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 12 }}>{formatTime(now)}</span>
          <span style={{ color: '#888', fontSize: 9 }}>{formatDate(now)}</span>
        </button>
      </div>
    </div>
  );
});

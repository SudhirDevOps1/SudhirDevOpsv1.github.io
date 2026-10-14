import React, { memo, useState, useEffect } from 'react';
import { Wifi, Volume2, VolumeX, Battery, BatteryCharging, Bell, Lock, Moon } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { WinId } from '../../types/os';
import { sfx } from '../../lib/sfx';
import { getAppIcon } from '../../iconMeta';

/** SUDHI OS start-button mark — a real vector logo, not an emoji. */
const StartMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <defs>
      <linearGradient id="sudhiStart" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="var(--accent)" />
        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.65" />
      </linearGradient>
    </defs>
    <rect x="2.5" y="2.5" width="8.4" height="8.4" rx="2.4" fill="url(#sudhiStart)" />
    <rect x="13.1" y="2.5" width="8.4" height="8.4" rx="2.4" fill="url(#sudhiStart)" opacity="0.75" />
    <rect x="2.5" y="13.1" width="8.4" height="8.4" rx="2.4" fill="url(#sudhiStart)" opacity="0.75" />
    <rect x="13.1" y="13.1" width="8.4" height="8.4" rx="2.4" fill="url(#sudhiStart)" opacity="0.55" />
  </svg>
);

interface TaskbarProps {
  onStartClick: () => void;
  onOpenQuickSettings?: () => void;
  onOpenNotifications?: () => void;
}

const PINNED: { id: WinId; label: string }[] = [
  { id: 'terminal',     label: 'Terminal' },
  { id: 'browser',      label: 'Browser' },
  { id: 'projects',     label: 'Projects' },
  { id: 'news',         label: 'DEV.WIRE' },
  { id: 'toolbox',      label: 'DEV.TOOLBOX' },
  { id: 'settings',     label: 'Settings' },
];

export const Taskbar = memo(({ onStartClick, onOpenQuickSettings, onOpenNotifications }: TaskbarProps) => {
  const { windows, focusWindow, minimizeWindow, closeWindow, openWindow, notifications, dnd } = useOS();
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [tabMenu, setTabMenu] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<string | null>(null);
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
      {/* Pinned quick-launch (left) — macOS-style dock with magnification */}
      <div
        style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: '100%' }}
        onMouseLeave={() => setHovered(null)}
      >
        {PINNED.map((p, i) => {
          const isOpen = windows.some(w => w.id === p.id);
          const meta = getAppIcon(p.id);
          const Glyph = meta.glyph;
          // pointer-distance magnification: hovered = biggest, neighbours slightly larger
          const dist = hovered === null ? 99 : Math.abs(i - hovered);
          const scale = dist === 0 ? 1.4 : dist === 1 ? 1.15 : 1;
          return (
            <button
              key={p.id}
              onClick={() => {
                sfx.play('click');
                openWindow(p.id);
                // launch bounce
                setBouncing(p.id);
                setTimeout(() => setBouncing(cur => (cur === p.id ? null : cur)), 620);
              }}
              onMouseEnter={() => setHovered(i)}
              style={{
                width: 34, height: 34, border: 'none', borderRadius: 8, cursor: 'pointer',
                background: 'transparent', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'transform 0.2s cubic-bezier(0.2,0.8,0.2,1)',
                transform: `scale(${scale})`,
                transformOrigin: 'bottom center',
                zIndex: hovered === i ? 60 : 10,
              }}
            >
              <span className={`dock-tile${bouncing === p.id ? ' dock-bounce' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${meta.from} 0%, ${meta.to} 100%)`,
                  boxShadow: `0 3px 8px rgba(0,0,0,0.4), 0 6px 14px ${meta.glow}`,
                }}>
                <Glyph size={18} strokeWidth={2} color="#fff" />
              </span>
              {isOpen && (
                <span style={{
                  position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }} />
              )}
              {hovered === i && <span className="dock-tip">{p.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Windows 11 Center Dock */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => { sfx.play('click'); onStartClick(); }}
          title="Start Menu"
          className="start-btn"
          style={{
            width: 42, height: 42, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.30), rgba(var(--accent-rgb),0.08))',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.18s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.2s, border-color 0.2s',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.18), 0 4px 12px rgba(var(--accent-rgb),0.22)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.6)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.2), 0 6px 18px rgba(var(--accent-rgb),0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.18), 0 4px 12px rgba(var(--accent-rgb),0.22)'; }}
        >
          <StartMark size={22} />
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
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
        {/* Quick Settings pill — network / volume / battery (real vector glyphs) */}
        <div
          onClick={() => { sfx.play('click'); onOpenQuickSettings?.(); }}
          title="Quick Settings"
          className="tray-pill"
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '6px 11px', borderRadius: 9,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.16)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <span title="Wi-Fi: SUDHI-5G" style={{ display: 'flex' }}><Wifi size={15} strokeWidth={2} /></span>
          <span title={dnd ? 'Focus mode ON — audio muted' : 'Audio Volume'} style={{ display: 'flex' }}>
            {dnd ? <VolumeX size={15} strokeWidth={2} /> : <Volume2 size={15} strokeWidth={2} />}
          </span>
          <span
            title={`Battery: ${battery ? `${battery.level}%${battery.charging ? ' (charging)' : ''}` : '92% (est.)'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 3 }}
          >
            {battery?.charging
              ? <span className="battery-charging" style={{ display: 'flex' }}><BatteryCharging size={15} strokeWidth={2} /></span>
              : <Battery size={15} strokeWidth={2} />}
            <span style={{ fontSize: 10.5, color: '#e2e8f0' }}>{battery ? `${battery.level}%` : '92%'}</span>
          </span>
          {dnd && <span title="Focus mode active" style={{ display: 'flex', color: '#BF00FF' }}><Moon size={14} strokeWidth={2} /></span>}
        </div>

        {/* Notification bell with unread badge */}
        <button
          onClick={() => { sfx.play('click'); onOpenNotifications?.(); }}
          title="Notification Center"
          style={trayBtn}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Bell size={15} strokeWidth={2} />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 3, minWidth: 14, height: 14, padding: '0 3px',
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
        ><Lock size={15} strokeWidth={2} /></button>

        {/* Clock */}
        <button
          onClick={() => { sfx.play('click'); onOpenNotifications?.(); }}
          style={{
            textAlign: 'right', display: 'flex', flexDirection: 'column', cursor: 'pointer',
            padding: '2px 8px', minWidth: 70, background: 'transparent', border: 'none',
            fontFamily: 'var(--font-mono)', borderRadius: 7, transition: 'all 0.15s', lineHeight: 1.25,
          }}
          title={now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12 }}>{formatTime(now)}</span>
          <span style={{ color: '#888', fontSize: 9 }}>{formatDate(now)}</span>
        </button>
      </div>
    </div>
  );
});

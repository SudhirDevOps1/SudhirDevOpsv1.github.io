import React, { memo, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { WinId } from '../../types/os';

export const Taskbar = memo(({ onStartClick }: { onStartClick: () => void }) => {
  const { windows, focusWindow, minimizeWindow, closeWindow, openWindow } = useOS();
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState(87);
  const [visitorCount, setVisitorCount] = useState(0);
  const [tabMenu, setTabMenu] = useState<string | null>(null);
  const activeWinId = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let isCharging = false;
    const t = setInterval(() => {
      setBattery(b => {
        if (isCharging) {
          const next = Math.min(100, b + 0.8);
          if (next >= 98) isCharging = false;
          return next;
        } else {
          const next = Math.max(8, b - 0.12);
          if (next <= 12) isCharging = true;
          return next;
        }
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const key = 'sudhi_os_visitors';
    const count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(count));
    setVisitorCount(count);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const handleTabClick = (winId: string) => {
    const win = windows.find(w => w.id === winId);
    if (!win) { openWindow(winId as WinId); return; }
    if (win.minimized) focusWindow(winId as WinId);
    else if (win.id === activeWinId) minimizeWindow(winId as WinId);
    else focusWindow(winId as WinId);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 48, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)', borderTop: '1px solid rgba(var(--accent-rgb),0.3)',
      display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
      backdropFilter: 'blur(8px)',
    }}>
      <button
        onClick={onStartClick}
        style={{
          padding: '4px 14px', border: '1px solid var(--accent)', borderRadius: 4,
          background: 'transparent', color: 'var(--accent)', cursor: 'pointer',
          fontFamily: 'var(--font-title)', fontSize: 11, letterSpacing: 1,
          whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: '0 0 8px rgba(var(--accent-rgb),0.3)',
        }}
      >
        ▶ START
      </button>

      <div style={{ width: 1, height: 28, background: '#333', margin: '0 4px' }} />

      <div style={{ flex: 1, display: 'flex', gap: 4, overflowX: 'auto', alignItems: 'center' }}>
        {windows.map(win => {
          const isActive = win.id === activeWinId && !win.minimized;
          return (
            <div key={win.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleTabClick(win.id)}
                onContextMenu={e => { e.preventDefault(); setTabMenu(tabMenu === win.id ? null : win.id); }}
                style={{
                  padding: '4px 10px', border: `1px solid ${isActive ? 'var(--accent)' : '#333'}`,
                  borderRadius: 3, background: isActive ? 'rgba(var(--accent-rgb),0.15)' : 'transparent',
                  color: isActive ? 'var(--accent)' : win.minimized ? '#444' : '#888',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                  whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
                  transition: 'all 0.15s',
                }}
              >
                {win.title}
              </button>
              {tabMenu === win.id && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, background: '#0a0a0a',
                  border: '1px solid var(--accent)', borderRadius: 4, zIndex: 2000,
                  minWidth: 140, overflow: 'hidden',
                }}>
                  {[
                    ['Restore', () => focusWindow(win.id as WinId)],
                    ['Minimize', () => minimizeWindow(win.id as WinId)],
                    ['Close', () => closeWindow(win.id as WinId)],
                  ].map(([label, action]) => (
                    <button key={label as string}
                      onClick={() => { (action as () => void)(); setTabMenu(null); }}
                      style={{
                        display: 'block', width: '100%', padding: '7px 12px',
                        background: 'none', border: 'none', color: '#aaa',
                        cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'left',
                      }}
                    >{label as string}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ width: 1, height: 28, background: '#333', margin: '0 4px' }} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: battery < 20 ? '#FF4444' : '#aaa', cursor: 'default' }}>
          🔋 {battery.toFixed(0)}%
        </span>
        <span style={{ color: '#aaa', cursor: 'default' }}>
          📶 SUDHI_NET
        </span>
        <span title={formatDate(now)} style={{ color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 1 }}>
          {formatTime(now)}
        </span>
        <span style={{ color: '#666', cursor: 'default' }}>
          👁 {visitorCount}
        </span>
      </div>
    </div>
  );
});

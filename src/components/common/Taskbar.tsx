import React, { memo, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { WinId } from '../../types/os';

export const Taskbar = memo(({ onStartClick }: { onStartClick: () => void }) => {
  const { windows, focusWindow, minimizeWindow, closeWindow, openWindow } = useOS();
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState(92);
  const [tabMenu, setTabMenu] = useState<string | null>(null);
  const activeWinId = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
      background: 'rgba(15, 17, 23, 0.82)', borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px',
      backdropFilter: 'blur(20px) saturate(180%)', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
    }}>
      {/* Windows 11 Center Dock */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onStartClick}
          title="Start Menu"
          style={{
            width: 40, height: 40, border: 'none', borderRadius: 8,
            background: 'rgba(255,255,255,0.06)', color: 'var(--accent)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            transition: 'all 0.2s', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.25)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
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
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}>
          <span title="Wi-Fi Connected">📶</span>
          <span title="Audio Volume">🔊</span>
          <span title="Battery Status">🔋 {battery}%</span>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', cursor: 'default' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 11 }}>{formatTime(now)}</span>
          <span style={{ color: '#888', fontSize: 9 }}>{formatDate(now)}</span>
        </div>
      </div>
    </div>
  );
});

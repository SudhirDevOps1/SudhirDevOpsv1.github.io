import React, { memo, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { THEMES } from '../../data';
import { ThemeKey } from '../../types/os';

export const ContextMenu = memo(({ x, y, onClose, onRefresh, onTheme, onToggleMatrix }: {
  x: number; y: number;
  onClose: () => void;
  onRefresh: () => void;
  onTheme: (k: ThemeKey) => void;
  onToggleMatrix: () => void;
}) => {
  const { addToast } = useOS();
  const [themeSub, setThemeSub] = useState(false);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 800 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 801,
        background: '#080808', border: '1px solid var(--accent)', borderRadius: 4,
        minWidth: 180, overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        {[
          { label: 'Refresh Desktop', action: () => { onRefresh(); onClose(); } },
          { label: 'Change Theme ▶', action: () => setThemeSub(v => !v) },
          { label: 'Toggle Matrix Rain', action: () => { onToggleMatrix(); onClose(); } },
          { label: 'Toggle Fullscreen', action: () => {
            if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); addToast('Fullscreen Enabled', 'info'); }
            else { document.exitFullscreen(); addToast('Fullscreen Disabled', 'info'); }
            onClose();
          }},
          { label: 'System Info', action: () => { addToast('SUDHI OS v2.0 | React 19.x', 'info'); onClose(); } },
        ].map(item => (
          <button key={item.label}
            style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s' }}
            onClick={item.action}
          >{item.label}</button>
        ))}
        {themeSub && (
          <div style={{ borderTop: '1px solid #222', padding: '4px 0' }}>
            {Object.entries(THEMES).map(([k, v]) => (
              <button key={k}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 14px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                onClick={() => { onTheme(k as ThemeKey); onClose(); }}
              >
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: v.accent }} />
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
});

export const SleepScreen = memo(({ onWake }: { onWake: () => void }) => {
  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="sleep-overlay" onClick={onWake} tabIndex={0}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 72, color: 'var(--accent)', letterSpacing: 4, marginBottom: 16 }}>
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#444', fontSize: 14 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#222', fontSize: 12, marginTop: 32 }}>
          Press any key or click to wake
        </div>
      </div>
    </div>
  );
});

export const ShutdownScreen = memo(({ onWake }: { onWake: () => void }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
    onClick={onWake}
    tabIndex={0}
  >
    <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: '#333', fontSize: 14, marginBottom: 12 }}>It is now safe to turn off your computer.</div>
      <div style={{ color: '#222', fontSize: 12 }}>SYSTEM HALTED.</div>
      <div style={{ color: '#111', fontSize: 11, marginTop: 40 }}>Click anywhere to restart</div>
    </div>
  </div>
));

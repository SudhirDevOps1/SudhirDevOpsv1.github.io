import React, { memo } from 'react';
import { useOS } from '../../context/OSContext';
import { THEMES } from '../../data';
import { ThemeKey } from '../../types/os';

export const WALLPAPERS = [
  { id: 'win11-bloom', name: 'Windows 11 Bloom (Local Asset)', url: '/wallpaper/win11_bloom.png' },
  { id: 'default', name: 'Cyber Matrix Grid', url: '' },
  { id: 'cyberpunk-city', name: 'Cyberpunk Neon City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&auto=format&fit=crop' },
  { id: 'neon-code', name: 'Neon Matrix Code', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop' },
  { id: 'synthwave-sun', name: 'Retro Synthwave Sun', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop' },
  { id: 'deep-space', name: 'Deep Space Galaxy', url: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1600&auto=format&fit=crop' },
  { id: 'dark-mountains', name: 'Dark Mountain Dusk', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop' },
  { id: 'abstract-lines', name: 'Abstract Blue Glow', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop' },
  { id: 'cyber-circuit', name: 'Cyber Circuit Board', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop' },
  { id: 'tokyo-night', name: 'Tokyo Neon Lights', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&auto=format&fit=crop' },
  { id: 'minimal-dark', name: 'Minimal Dark Mesh', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop' },
  { id: 'sunset-grid', name: '80s Grid Horizon', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop' },
  { id: 'code-editor', name: 'Dark Code IDE', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop' },
];

export const SettingsWindow = memo(() => {
  const { theme, setTheme, matrixOn, toggleMatrix, activeWallpaper, setWallpaper, addToast } = useOS();
  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      <div style={{ color: 'var(--accent)', marginBottom: 16, fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 2 }}>SYSTEM SETTINGS</div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, marginBottom: 12, fontSize: 11, letterSpacing: 2 }}>DESKTOP WALLPAPERS (LOCAL & REMOTE)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {WALLPAPERS.map(w => (
            <div
              key={w.id}
              onClick={() => { setWallpaper(w.url); addToast(`Wallpaper set: ${w.name}`, 'success'); }}
              style={{
                border: activeWallpaper === w.url ? '2px solid var(--accent)' : '1px solid #222',
                borderRadius: 6, cursor: 'pointer', overflow: 'hidden', background: '#0a0a0a',
                boxShadow: activeWallpaper === w.url ? '0 0 10px rgba(var(--accent-rgb),0.3)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ height: 60, background: w.url ? `url(${w.url}) center/cover no-repeat` : 'linear-gradient(135deg, #05150c, #000)', position: 'relative' }}>
                {!w.url && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 10 }}>DEFAULT GRID</div>}
              </div>
              <div style={{ padding: '6px 8px', fontSize: 10, color: activeWallpaper === w.url ? 'var(--accent)' : '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {w.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, marginBottom: 12, fontSize: 11, letterSpacing: 2 }}>THEME</div>
        {Object.entries(THEMES).map(([k, v]) => (
          <div key={k} onClick={() => { setTheme(k as ThemeKey); addToast(`Theme: ${v.name}`, 'success'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
              marginBottom: 4, border: `1px solid ${theme === k ? 'var(--accent)' : '#222'}`,
              borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s',
              background: theme === k ? 'rgba(var(--accent-rgb),0.08)' : 'transparent',
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.accent, boxShadow: `0 0 8px ${v.accent}` }} />
            <span style={{ color: theme === k ? 'var(--accent)' : '#aaa' }}>{v.name}</span>
            {theme === k && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>●</span>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, marginBottom: 12, fontSize: 11, letterSpacing: 2 }}>MATRIX RAIN</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid #222', borderRadius: 4 }}>
          <span style={{ color: '#aaa' }}>Matrix Rain Effect</span>
          <button onClick={() => { toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); }}
            style={{
              padding: '4px 16px', border: `1px solid ${matrixOn ? 'var(--accent)' : '#444'}`,
              background: matrixOn ? 'rgba(var(--accent-rgb),0.15)' : 'transparent',
              color: matrixOn ? 'var(--accent)' : '#666', borderRadius: 4, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 12,
            }}
          >{matrixOn ? 'ON' : 'OFF'}</button>
        </div>
      </div>
    </div>
  );
});
export default SettingsWindow;

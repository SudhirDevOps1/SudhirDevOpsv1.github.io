import React, { memo, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { THEMES } from '../../data';
import { ThemeKey } from '../../types/os';
import { Image, Palette, Eye, Bell, Sliders, Volume2, Sparkles, Monitor, RotateCcw, Check } from 'lucide-react';

export const WALLPAPERS = [
  { id: 'win11-bloom', name: 'Windows 11 Bloom (Local)', url: '/wallpaper/win11_bloom.png' },
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
];

export const SettingsWindow = memo(() => {
  const { theme, setTheme, matrixOn, toggleMatrix, activeWallpaper, setWallpaper, addToast } = useOS();
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'themes' | 'effects' | 'sound' | 'display'>('wallpaper');

  // Customization Settings State (persisted in localStorage)
  const [soundEffects, setSoundEffects] = useState<boolean>(() => localStorage.getItem('sudhi_sound') !== 'false');
  const [crtScanlines, setCrtScanlines] = useState<boolean>(() => localStorage.getItem('sudhi_crt') === 'true'); // Default to clean FALSE so no annoying lines by default!
  const [glassBlur, setGlassBlur] = useState<boolean>(() => localStorage.getItem('sudhi_blur') !== 'false');
  const [bgGridLines, setBgGridLines] = useState<boolean>(() => localStorage.getItem('sudhi_grid') === 'true'); // Default to clean OFF lines!
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(() => Number(localStorage.getItem('sudhi_wp_op') || 90)); // Default 90% high clarity
  const [customWallpaperInput, setCustomWallpaperInput] = useState('');
  const [accentBrightness, setAccentBrightness] = useState<number>(() => Number(localStorage.getItem('sudhi_brightness') || 100));

  useEffect(() => {
    localStorage.setItem('sudhi_sound', String(soundEffects));
  }, [soundEffects]);

  useEffect(() => {
    localStorage.setItem('sudhi_crt', String(crtScanlines));
    const crtEl = document.querySelector('.crt-overlay') as HTMLElement;
    if (crtEl) crtEl.style.display = crtScanlines ? 'block' : 'none';
  }, [crtScanlines]);

  useEffect(() => {
    localStorage.setItem('sudhi_grid', String(bgGridLines));
    const gridEl = document.querySelector('.bg-grid') as HTMLElement;
    if (gridEl) gridEl.style.display = bgGridLines ? 'block' : 'none';
  }, [bgGridLines]);

  useEffect(() => {
    localStorage.setItem('sudhi_wp_op', String(wallpaperOpacity));
    const wpEl = document.querySelector('.desktop-wp-layer') as HTMLElement;
    if (wpEl) wpEl.style.opacity = (wallpaperOpacity / 100).toString();
  }, [wallpaperOpacity]);

  useEffect(() => {
    localStorage.setItem('sudhi_blur', String(glassBlur));
    document.documentElement.style.setProperty('--glass-blur', glassBlur ? '16px' : '0px');
  }, [glassBlur]);

  useEffect(() => {
    localStorage.setItem('sudhi_brightness', String(accentBrightness));
    document.documentElement.style.filter = `brightness(${accentBrightness}%)`;
  }, [accentBrightness]);


  const setCustomWallpaper = () => {
    if (!customWallpaperInput.trim()) return;
    setWallpaper(customWallpaperInput.trim());
    addToast('Custom wallpaper applied', 'success');
    setCustomWallpaperInput('');
  };

  const resetAllSettings = () => {
    setTheme('green');
    setWallpaper('/wallpaper/win11_bloom.png');
    setSoundEffects(true);
    setCrtScanlines(true);
    setGlassBlur(true);
    setAccentBrightness(100);
    if (!matrixOn) toggleMatrix();
    addToast('All settings reset to default', 'info');
  };

  const tabs = [
    { id: 'wallpaper' as const, label: '🖼️ Wallpaper', icon: Image },
    { id: 'themes' as const, label: '🎨 Color Themes', icon: Palette },
    { id: 'effects' as const, label: '✨ Visual Effects', icon: Sparkles },
    { id: 'display' as const, label: '🖥️ Display & Brightness', icon: Monitor },
    { id: 'sound' as const, label: '🔊 Audio & System', icon: Volume2 },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', background: '#090b11', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* Sidebar Navigation */}
      <div style={{ width: 180, borderRight: '1px solid #141724', background: '#06070c', padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ padding: '6px 10px', fontSize: 10, color: 'var(--accent)', fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={14} /> CONTROL CENTER
        </div>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                padding: '9px 12px', border: 'none', borderRadius: 6,
                background: isActive ? 'rgba(var(--accent-rgb),0.18)' : 'transparent',
                color: isActive ? 'var(--accent)' : '#888',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                fontWeight: isActive ? 'bold' : 'normal',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={14} />
              {t.label.split(' ')[1]}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />
        <button onClick={resetAllSettings}
          style={{ padding: '8px 10px', border: '1px solid #222', background: '#0f111a', color: '#888', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <RotateCcw size={12} /> Reset Defaults
        </button>
      </div>

      {/* Main Settings Panel */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>

        {/* TAB 1: WALLPAPERS */}
        {activeTab === 'wallpaper' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>Desktop Wallpapers & Backgrounds</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>Select a high-resolution wallpaper or paste your own custom image URL</div>

            {/* Custom URL Input */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#0f111a', border: '1px solid #1e2235', borderRadius: 8, padding: 6 }}>
              <input
                value={customWallpaperInput}
                onChange={e => setCustomWallpaperInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setCustomWallpaper()}
                placeholder="Paste any custom image URL (https://...)"
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 8px' }}
              />
              <button onClick={setCustomWallpaper}
                style={{ padding: '6px 14px', background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 'bold' }}>
                Apply URL
              </button>
            </div>

            {/* Wallpaper Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
              {WALLPAPERS.map(w => (
                <div
                  key={w.id}
                  onClick={() => { setWallpaper(w.url); addToast(`Wallpaper set: ${w.name}`, 'success'); }}
                  style={{
                    border: activeWallpaper === w.url ? '2px solid var(--accent)' : '1px solid #1a1e2e',
                    borderRadius: 8, cursor: 'pointer', overflow: 'hidden', background: '#080a10',
                    boxShadow: activeWallpaper === w.url ? '0 0 16px rgba(var(--accent-rgb),0.35)' : 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = activeWallpaper === w.url ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = activeWallpaper === w.url ? 'var(--accent)' : '#1a1e2e'}
                >
                  <div style={{ height: 90, background: w.url ? `url(${w.url}) center/cover no-repeat` : 'linear-gradient(135deg, #05150c, #000)', position: 'relative' }}>
                    {!w.url && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 10, fontWeight: 'bold' }}>DEFAULT GRID</div>}
                    {activeWallpaper === w.url && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px', fontSize: 10, color: activeWallpaper === w.url ? 'var(--accent)' : '#aaa', fontWeight: activeWallpaper === w.url ? 'bold' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: THEMES */}
        {activeTab === 'themes' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>System Color Themes</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>Choose accent palette for window glow, icons, and desktop accents</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {Object.entries(THEMES).map(([k, v]) => {
                const isSel = theme === k;
                return (
                  <div key={k} onClick={() => { setTheme(k as ThemeKey); addToast(`Theme: ${v.name}`, 'success'); }}
                    style={{
                      padding: 16, border: `2px solid ${isSel ? 'var(--accent)' : '#1a1e2e'}`,
                      borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                      background: isSel ? 'rgba(var(--accent-rgb),0.12)' : 'rgba(255,255,255,0.02)',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = '#1a1e2e'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: v.accent, boxShadow: `0 0 16px ${v.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                      {isSel ? '✓' : ''}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 'bold', color: isSel ? 'var(--accent)' : '#fff' }}>{v.name}</div>
                      <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Accent HEX: {v.accent}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: VISUAL EFFECTS */}
        {activeTab === 'effects' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>Visual Effects & Shaders</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>Toggle GPU animations, glassmorphic blur, and CRT scanlines</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Matrix Rain Toggle */}
              <div style={{ padding: 14, border: '1px solid #1a1e2e', borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Matrix Rain Canvas Shader</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Animated green digital rain background layer</div>
                </div>
                <button onClick={() => { toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); }}
                  style={{
                    padding: '6px 18px', border: `1px solid ${matrixOn ? 'var(--accent)' : '#333'}`,
                    background: matrixOn ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                    color: matrixOn ? 'var(--accent)' : '#666', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold',
                  }}
                >
                  {matrixOn ? '🟢 ENABLED' : '🔴 DISABLED'}
                </button>
              </div>

              {/* CRT Scanlines Overlay Toggle */}
              <div style={{ padding: 14, border: '1px solid #1a1e2e', borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>CRT Scanlines Overlay (Horizonal Lines)</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Turn OFF to completely remove horizontal screen lines</div>
                </div>
                <button onClick={() => { setCrtScanlines(v => !v); addToast(`CRT Lines: ${!crtScanlines ? 'ON' : 'OFF'}`, 'info'); }}
                  style={{
                    padding: '6px 18px', border: `1px solid ${crtScanlines ? 'var(--accent)' : '#333'}`,
                    background: crtScanlines ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                    color: crtScanlines ? 'var(--accent)' : '#666', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold',
                  }}
                >
                  {crtScanlines ? '🟢 ENABLED' : '🔴 DISABLED (CLEAN)'}
                </button>
              </div>

              {/* Background Cyber Grid Lines Toggle */}
              <div style={{ padding: 14, border: '1px solid #1a1e2e', borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Background Grid Lines</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Turn OFF to remove cyber background grid pattern for clear wallpaper</div>
                </div>
                <button onClick={() => { setBgGridLines(v => !v); addToast(`Background Grid: ${!bgGridLines ? 'ON' : 'OFF'}`, 'info'); }}
                  style={{
                    padding: '6px 18px', border: `1px solid ${bgGridLines ? 'var(--accent)' : '#333'}`,
                    background: bgGridLines ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                    color: bgGridLines ? 'var(--accent)' : '#666', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold',
                  }}
                >
                  {bgGridLines ? '🟢 ENABLED' : '🔴 DISABLED (CLEAN)'}
                </button>
              </div>

              {/* Wallpaper Opacity Slider */}
              <div style={{ padding: 14, border: '1px solid #1a1e2e', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Wallpaper Clarity & Visibility Opacity</span>
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 'bold' }}>{wallpaperOpacity}%</span>
                </div>
                <input
                  type="range" min="30" max="100" value={wallpaperOpacity}
                  onChange={e => setWallpaperOpacity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginTop: 4 }}>
                  <span>30% (Subtle)</span>
                  <span>70% (Balanced)</span>
                  <span>100% (Vibrant Ultra HD)</span>
                </div>
              </div>


              {/* Glassmorphism Blur */}
              <div style={{ padding: 14, border: '1px solid #1a1e2e', borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Glassmorphism Backdrop Blur</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Translucent window glass blur filter (16px)</div>
                </div>
                <button onClick={() => { setGlassBlur(v => !v); addToast(`Glass Blur: ${!glassBlur ? 'ON' : 'OFF'}`, 'info'); }}
                  style={{
                    padding: '6px 18px', border: `1px solid ${glassBlur ? 'var(--accent)' : '#333'}`,
                    background: glassBlur ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                    color: glassBlur ? 'var(--accent)' : '#666', borderRadius: 20, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold',
                  }}
                >
                  {glassBlur ? '🟢 ENABLED' : '🔴 DISABLED'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DISPLAY & BRIGHTNESS */}
        {activeTab === 'display' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>Display & Brightness Settings</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>Adjust OS brightness filter and screen layout scaling</div>

            <div style={{ padding: 16, border: '1px solid #1a1e2e', borderRadius: 10, background: 'rgba(255,255,255,0.02)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Display Brightness Filter</span>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 'bold' }}>{accentBrightness}%</span>
              </div>
              <input
                type="range" min="40" max="130" value={accentBrightness}
                onChange={e => setAccentBrightness(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginTop: 6 }}>
                <span>40% (Dim)</span>
                <span>100% (Normal)</span>
                <span>130% (High Brightness)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIO & SYSTEM */}
        {activeTab === 'sound' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>Audio & System Feedback</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>Configure audio feedback sounds and desktop notifications</div>

            <div style={{ padding: 14, border: '1px solid #1a1e2e', borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>System Audio Effects & Beeps</div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>Enable UI clicks, window open sounds, and audio feedback</div>
              </div>
              <button onClick={() => { setSoundEffects(v => !v); addToast(`Sound: ${!soundEffects ? 'ON' : 'OFF'}`, 'info'); }}
                style={{
                  padding: '6px 18px', border: `1px solid ${soundEffects ? 'var(--accent)' : '#333'}`,
                  background: soundEffects ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                  color: soundEffects ? 'var(--accent)' : '#666', borderRadius: 20, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold',
                }}
              >
                {soundEffects ? '🔊 ENABLED' : '🔇 MUTED'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
export default SettingsWindow;

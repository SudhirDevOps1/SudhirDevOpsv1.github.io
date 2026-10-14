import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Volume2, Moon, Sun, Bell, BellOff, Grid3x3, ScanLine, Droplets, Sparkles, TestTube, Palette, Activity } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { setSystemSetting } from '../../lib/sysSettings';
import { sfx } from '../../lib/sfx';
import { THEMES } from '../../data';
import { ThemeKey } from '../../types/os';

interface QuickSettingsProps {
  open: boolean;
  onClose: () => void;
  anchorRight?: number;
}

interface TileProps {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

const Tile = ({ icon, label, sub, active, onClick, color }: TileProps) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 10, cursor: 'pointer', textAlign: 'left',
      border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
      background: active ? 'rgba(var(--accent-rgb),0.16)' : 'rgba(255,255,255,0.03)',
      transition: 'all 0.18s', color: '#ddd', fontFamily: 'var(--font-mono)', width: '100%',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.5)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
  >
    <span style={{ color: active ? (color || 'var(--accent)') : '#777', display: 'flex', transition: 'color 0.18s' }}>{icon}</span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: active ? '#fff' : '#bbb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      {sub && <span style={{ display: 'block', fontSize: 9, color: '#666', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</span>}
    </span>
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: active ? (color || 'var(--accent)') : '#333',
      boxShadow: active ? `0 0 8px ${color || 'var(--accent)'}` : 'none',
    }} />
  </button>
);

const Slider = ({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
    <span style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</span>
    <span style={{ fontSize: 10, color: '#888', width: 62, fontFamily: 'var(--font-mono)' }}>{label}</span>
    <input
      type="range" min={label === 'BRIGHT' ? 40 : 0} max={100} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        flex: 1, accentColor: 'var(--accent)', height: 4, cursor: 'pointer',
      }}
    />
    <span style={{ fontSize: 11, color: 'var(--accent)', width: 36, textAlign: 'right', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
  </div>
);

export const QuickSettings = memo(({ open, onClose, anchorRight = 16 }: QuickSettingsProps) => {
  const { theme, setTheme, matrixOn, toggleMatrix, addToast, dnd, setDnd } = useOS();
  const sys = useSystemSettings();
  const [net] = useState(() => {
    const conn = (navigator as unknown as { connection?: { effectiveType?: string; downlink?: number } }).connection;
    return { type: conn?.effectiveType?.toUpperCase() || 'WIFI', downlink: conn?.downlink ?? 10 };
  });

  if (!open) return null;

  const toggle = (key: 'nightLight' | 'aurora' | 'sounds' | 'dnd' | 'glassBlur', label: string) => () => {
    const next = !sys[key];
    setSystemSetting(key, next);
    sfx.play('click');
    addToast(`${label}: ${next ? 'ON' : 'OFF'}`, 'info');
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1198 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'fixed', bottom: 56, right: anchorRight, width: 336, zIndex: 1200,
          background: 'rgba(13, 15, 22, 0.96)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 14, overflow: 'hidden', fontFamily: 'var(--font-mono)',
          boxShadow: '0 16px 50px rgba(0,0,0,0.8), 0 0 24px rgba(var(--accent-rgb),0.18)',
          backdropFilter: 'blur(26px) saturate(180%)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(var(--accent-rgb),0.08)' }}>
          <span style={{ color: 'var(--accent)', fontSize: 12, letterSpacing: 2, fontWeight: 'bold' }}>⚡ QUICK SETTINGS</span>
          <span style={{ fontSize: 9, color: '#666' }}>{net.type} • {net.downlink}Mb/s</span>
        </div>

        {/* Toggle tiles */}
        <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Tile icon={<Wifi size={15} />} label="Wi-Fi" sub="SUDHI-5G connected" active onClick={() => addToast('Wi-Fi: SUDHI-5G — stable 5GHz link', 'info')} />
          <Tile icon={<Moon size={15} />} label="Night Light" sub="Warm screen tint" active={sys.nightLight} onClick={toggle('nightLight', 'Night Light')} color="#FFB300" />
          <Tile icon={<BellOff size={15} />} label="Focus (DND)" sub={dnd ? 'Notifications paused' : 'Notifications on'} active={dnd} onClick={() => { const n = !dnd; setDnd(n); sfx.play('click'); addToast(`Focus mode: ${n ? 'ON — notifications paused' : 'OFF'}`, 'info'); }} color="#BF00FF" />
          <Tile icon={<Sparkles size={15} />} label="Aurora" sub="Animated backdrop" active={sys.aurora} onClick={toggle('aurora', 'Aurora')} color="#00BFFF" />
          <Tile icon={<Activity size={15} />} label="Matrix Rain" sub="Digital rain canvas" active={matrixOn} onClick={() => { toggleMatrix(); sfx.play('click'); addToast(`Matrix Rain: ${!matrixOn ? 'ON' : 'OFF'}`, 'info'); }} color="#00C853" />
          <Tile icon={<Grid3x3 size={15} />} label="Grid Lines" sub="Desktop grid overlay" active={localStorage.getItem('sudhi_grid') === 'true'} onClick={() => { const n = localStorage.getItem('sudhi_grid') !== 'true'; localStorage.setItem('sudhi_grid', String(n)); sfx.play('click'); window.dispatchEvent(new Event('sudhi-settings-changed')); addToast(`Grid lines: ${n ? 'ON' : 'OFF'}`, 'info'); }} />
          <Tile icon={<ScanLine size={15} />} label="CRT Scanlines" sub="Retro overlay" active={localStorage.getItem('sudhi_crt') === 'true'} onClick={() => { const n = localStorage.getItem('sudhi_crt') !== 'true'; localStorage.setItem('sudhi_crt', String(n)); sfx.play('click'); addToast(`CRT scanlines: ${n ? 'ON' : 'OFF'}`, 'info'); }} />
          <Tile icon={<Droplets size={15} />} label="Glass Blur" sub="Window translucency" active={sys.glassBlur} onClick={toggle('glassBlur', 'Glass blur')} />
          <Tile icon={sys.sounds ? <Volume2 size={15} /> : <Bell size={15} />} label="Sounds" sub="UI sound effects" active={sys.sounds} onClick={() => { toggle('sounds', 'Sounds')(); }} color="#00E5FF" />
        </div>

        {/* Sliders */}
        <div style={{ padding: '4px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Slider icon={<Sun size={14} />} label="BRIGHT" value={sys.brightness} onChange={v => setSystemSetting('brightness', v)} />
          <Slider icon={<Volume2 size={14} />} label="VOLUME" value={sys.volume} onChange={v => setSystemSetting('volume', v)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <button
              onClick={() => sfx.play('notify')}
              style={{
                fontSize: 10, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                border: '1px solid rgba(var(--accent-rgb),0.4)', background: 'rgba(var(--accent-rgb),0.1)',
                color: 'var(--accent)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6,
              }}
              title="Test UI sound at current volume"
            >
              <TestTube size={11} /> TEST SOUND
            </button>
          </div>
        </div>

        {/* Theme picker */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#666', marginBottom: 8, letterSpacing: 1 }}>
            <Palette size={11} /> ACCENT THEME
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(THEMES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => { setTheme(k as ThemeKey); sfx.play('click'); addToast(`Theme: ${v.name}`, 'success'); }}
                title={v.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${theme === k ? v.accent : 'rgba(255,255,255,0.1)'}`,
                  background: theme === k ? `rgba(${v.rgb}, 0.18)` : 'transparent',
                  color: theme === k ? v.accent : '#999', fontSize: 9, fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.accent, boxShadow: theme === k ? `0 0 6px ${v.accent}` : 'none' }} />
                {v.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Footer status */}
        <div style={{ padding: '9px 16px', background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#666' }}>
          <span>SUDHI OS v4 • Quick Settings</span>
          <span>{dnd ? '🌙 DND ACTIVE' : '🔔 ALERTS ON'}</span>
        </div>
      </motion.div>
    </>
  );
});

export default QuickSettings;

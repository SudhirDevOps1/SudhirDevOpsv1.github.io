import React, { memo, useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { GripVertical, CloudSun, Bitcoin, Rocket, BrainCircuit, StickyNote } from 'lucide-react';

const WMO: Record<number, { label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }> = {
  0:  { label: 'Clear',        Icon: CloudSun },
  1:  { label: 'Mostly clear', Icon: CloudSun },
  2:  { label: 'Partly cloudy',Icon: CloudSun },
  3:  { label: 'Overcast',     Icon: CloudSun },
  45: { label: 'Fog',          Icon: CloudSun },
  51: { label: 'Drizzle',      Icon: CloudSun },
  61: { label: 'Rain',         Icon: CloudSun },
  71: { label: 'Snow',         Icon: CloudSun },
  80: { label: 'Showers',      Icon: CloudSun },
  95: { label: 'Thunderstorm', Icon: CloudSun },
  99: { label: 'Thunderstorm', Icon: CloudSun },
};

export const DesktopWidgets = memo(() => {
  const { openWindow } = useOS();
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [nextLaunch, setNextLaunch] = useState<{ name: string; date: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [time, setTime] = useState(new Date());
  const [sticky, setSticky] = useState<string>(() => localStorage.getItem('sudhi_sticky') || '');
  const [jsHeap, setJsHeap] = useState<number | null>(null);

  // Draggable Widget Position State (default top-right)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    return { x: Math.max(10, vw - 212), y: 12 };
  });

  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Keep widgets inside screen on window resize
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setPosition(prev => ({
        x: Math.min(prev.x, vw - 204),
        y: Math.min(prev.y, window.innerHeight - 240),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = {
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;

      if (!dragRef.current.isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragRef.current.isDragging = true;
      }

      if (dragRef.current.isDragging) {
        const newX = Math.max(8, Math.min(window.innerWidth - 204, dragRef.current.startPosX + dx));
        const newY = Math.max(8, Math.min(window.innerHeight - 220, dragRef.current.startPosY + dy));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current?.isDragging) {
        setTimeout(() => { dragRef.current = null; }, 100);
      } else {
        dragRef.current = null;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Weather (Bihar, India - Open-Meteo, no API key)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=25.59&longitude=85.14&current=temperature_2m,weathercode&timezone=Asia%2FKolkata')
      .then(r => r.json())
      .then(d => setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weathercode }))
      .catch(() => {});
  }, []);

  // BTC Price (CoinGecko)
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(r => r.json())
      .then(d => setBtcPrice(d.bitcoin?.usd))
      .catch(() => {});
    const t = setInterval(() => {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        .then(r => r.json()).then(d => setBtcPrice(d.bitcoin?.usd)).catch(() => {});
    }, 120000);
    return () => clearInterval(t);
  }, []);

  // SpaceX next launch (clean offline state, zero console errors)
  useEffect(() => {
    setNextLaunch({ name: 'Starship IFT-5 Mission', date: new Date(Date.now() + 864000000).toISOString() });
  }, []);

  // JS heap monitor (Chromium only — silent elsewhere)
  useEffect(() => {
    const perf = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    if (!perf) return;
    const sync = () => setJsHeap(Math.round(perf.usedJSHeapSize / 1048576));
    sync();
    const t = setInterval(sync, 4000);
    return () => clearInterval(t);
  }, []);

  // Persist sticky note
  useEffect(() => {
    localStorage.setItem('sudhi_sticky', sticky);
  }, [sticky]);


  // Countdown
  useEffect(() => {
    if (!nextLaunch) return;
    const tick = () => {
      const diff = new Date(nextLaunch.date).getTime() - Date.now();
      if (diff <= 0) { setCountdown('LAUNCH! 🚀'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [nextLaunch]);

  // Liquid Glass-style card: continuous corners, hairline border, layered depth
  const widgetBase: React.CSSProperties = {
    padding: '13px 15px',
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'linear-gradient(150deg, rgba(20,24,34,0.82) 0%, rgba(8,10,18,0.9) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    cursor: 'pointer',
    transition: 'transform 0.2s cubic-bezier(0.2,0.8,0.2,1), border-color 0.2s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    userSelect: 'none',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.14), 0 6px 20px rgba(0,0,0,0.45)',
    minWidth: 172,
  };

  // Small circular icon badge used inside each glass widget
  const badge = (color: string): React.CSSProperties => ({
    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `rgba(${color},0.16)`, border: `1px solid rgba(${color},0.28)`,
    color: `rgb(${color})`,
  });

  return (
    <div style={{
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 100, // Below active app windows (active windows have zIndex 1000+) so apps open OVER widgets
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'auto',
      width: 196,
    }}>
      {/* Widget Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag widget anywhere on screen 🖐️"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '4px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, cursor: 'grab', color: '#666', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <GripVertical size={12} />
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>Drag Widget</span>
      </div>

      {/* Clock Widget */}
      <div style={{ ...widgetBase, flexDirection: 'column', alignItems: 'flex-start', gap: 3, cursor: 'default' }}>
        <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'var(--font-mono)', letterSpacing: 1.5 }}>
          {time.toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase()}
        </div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#f8fafc', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)', letterSpacing: 1, lineHeight: 1 }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          {time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Weather Widget */}
      {weather && (() => {
        const w = WMO[weather.code] || { label: 'Conditions', Icon: CloudSun };
        const Icon = w.Icon;
        return (
          <div style={widgetBase} onClick={() => openWindow('weather')}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.14), 0 10px 26px rgba(var(--accent-rgb),0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.14), 0 6px 20px rgba(0,0,0,0.45)'; }}
          >
            <span style={badge('56,189,248')}><Icon size={18} strokeWidth={2} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: '#f8fafc', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>{weather.temp}°C</div>
              <div style={{ fontSize: 9.5, color: '#94a3b8' }}>{w.label} • Bihar</div>
            </div>
          </div>
        );
      })()}

      {/* BTC Price Widget */}
      {btcPrice && (
        <div style={widgetBase} onClick={() => openWindow('crypto')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.14), 0 10px 26px rgba(251,191,36,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.14), 0 6px 20px rgba(0,0,0,0.45)'; }}
        >
          <span style={badge('251,191,36')}><Bitcoin size={18} strokeWidth={2} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 'bold', color: '#fbbf24', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
              ${btcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 9.5, color: '#94a3b8' }}>Bitcoin • Live</div>
          </div>
        </div>
      )}

      {/* SpaceX Countdown Widget */}
      {nextLaunch && countdown && (
        <div style={widgetBase} onClick={() => openWindow('space')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.14), 0 10px 26px rgba(45,212,191,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.14), 0 6px 20px rgba(0,0,0,0.45)'; }}
        >
          <span style={badge('45,212,191')}><Rocket size={18} strokeWidth={2} /></span>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#2dd4bf', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>{countdown}</div>
            <div style={{ fontSize: 9.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextLaunch.name}
            </div>
          </div>
        </div>
      )}

      {/* System Health Widget (v4) */}
      <div style={{ ...widgetBase, cursor: 'default' }} title="Live JS heap usage (browser engine)">
        <span style={badge('192,132,252')}><BrainCircuit size={18} strokeWidth={2} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f8fafc', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
            {jsHeap !== null ? `${jsHeap} MB` : '—'}
          </div>
          <div style={{ fontSize: 9.5, color: '#94a3b8' }}>JS Heap</div>
        </div>
      </div>

      {/* Sticky Note Widget (v4) */}
      <div
        style={{
          ...widgetBase, flexDirection: 'column', alignItems: 'stretch', gap: 6,
          background: 'linear-gradient(150deg, rgba(255,214,90,0.96) 0%, rgba(255,199,0,0.92) 100%)',
          border: '1px solid rgba(255,179,0,0.6)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 8px 22px rgba(0,0,0,0.5)',
          padding: '11px 13px', cursor: 'default',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StickyNote size={13} color="rgba(0,0,0,0.55)" />
          <span style={{ fontSize: 9.5, fontWeight: 'bold', color: 'rgba(0,0,0,0.55)', fontFamily: 'var(--font-mono)', letterSpacing: 1, flex: 1 }}>STICKY</span>
          <button
            onClick={e => { e.stopPropagation(); setSticky(''); }}
            title="Clear note"
            style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.4)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', lineHeight: 1 }}
          >✕</button>
        </div>
        <textarea
          value={sticky}
          onChange={e => setSticky(e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder="Type a quick note..."
          rows={3}
          style={{
            width: '100%', resize: 'none', border: 'none', outline: 'none', background: 'transparent',
            color: 'rgba(0,0,0,0.8)', fontSize: 11, fontFamily: 'var(--font-mono)', lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  );
});
export default DesktopWidgets;

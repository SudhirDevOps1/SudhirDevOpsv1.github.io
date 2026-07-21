import React, { memo, useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { GripVertical } from 'lucide-react';

const WMO: Record<number, string> = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌦️', 61: '🌧️', 71: '❄️', 80: '🌦️', 95: '⛈️', 99: '⛈️' };

export const DesktopWidgets = memo(() => {
  const { openWindow } = useOS();
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [nextLaunch, setNextLaunch] = useState<{ name: string; date: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [time, setTime] = useState(new Date());

  // Draggable Widget Position State (default top-right)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    return { x: Math.max(10, vw - 170), y: 12 };
  });

  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Keep widgets inside screen on window resize
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setPosition(prev => ({
        x: Math.min(prev.x, vw - 160),
        y: Math.min(prev.y, window.innerHeight - 200),
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
        const newX = Math.max(8, Math.min(window.innerWidth - 160, dragRef.current.startPosX + dx));
        const newY = Math.max(8, Math.min(window.innerHeight - 180, dragRef.current.startPosY + dy));
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

  // SpaceX next launch (with CORS-safe fallback)
  useEffect(() => {
    const defaultLaunch = { name: 'Starship IFT-5 Mission', date: new Date(Date.now() + 864000000).toISOString() };
    fetch('https://api.spacexdata.com/v4/launches/upcoming')
      .then(r => {
        if (!r.ok) throw new Error('SpaceX API failed');
        return r.json();
      })
      .then((data: { name: string; date_utc: string }[]) => {
        if (!Array.isArray(data)) throw new Error('Invalid SpaceX data');
        const sorted = data.sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime());
        if (sorted[0]) setNextLaunch({ name: sorted[0].name, date: sorted[0].date_utc });
        else setNextLaunch(defaultLaunch);
      })
      .catch(() => {
        fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.spacexdata.com/v4/launches/upcoming'))
          .then(r => r.json())
          .then((data: { name: string; date_utc: string }[]) => {
            if (Array.isArray(data) && data[0]) setNextLaunch({ name: data[0].name, date: data[0].date_utc });
            else setNextLaunch(defaultLaunch);
          })
          .catch(() => setNextLaunch(defaultLaunch));
      });
  }, []);

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

  const widgetBase: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(5,7,14,0.88)',
    backdropFilter: 'blur(14px)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    userSelect: 'none',
  };

  return (
    <div style={{
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 100, // Below active app windows (active windows have zIndex 1000+) so apps open OVER widgets
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'auto',
    }}>
      {/* Widget Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag widget anywhere on screen 🖐️"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '3px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, cursor: 'grab', color: '#666', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <GripVertical size={12} />
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', marginLeft: 4 }}>Drag Widget</span>
      </div>

      {/* Clock Widget */}
      <div style={{ ...widgetBase, flexDirection: 'column', alignItems: 'flex-end', minWidth: 130, gap: 2 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
        <div style={{ fontSize: 9, color: '#555', fontFamily: 'var(--font-mono)' }}>
          {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* Weather Widget */}
      {weather && (
        <div style={{ ...widgetBase }} onClick={() => openWindow('weather')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.4)'; e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(5,7,14,0.88)'; }}
        >
          <span style={{ fontSize: 20 }}>{WMO[weather.code] || '🌡️'}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)' }}>{weather.temp}°C</div>
            <div style={{ fontSize: 9, color: '#555' }}>Bihar, India</div>
          </div>
        </div>
      )}

      {/* BTC Price Widget */}
      {btcPrice && (
        <div style={{ ...widgetBase }} onClick={() => openWindow('crypto')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,179,0,0.4)'; e.currentTarget.style.background = 'rgba(255,179,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(5,7,14,0.88)'; }}
        >
          <span style={{ fontSize: 16 }}>₿</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#FFB300', fontFamily: 'var(--font-mono)' }}>
              ${btcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 9, color: '#555' }}>Bitcoin • Live</div>
          </div>
        </div>
      )}

      {/* SpaceX Countdown Widget */}
      {nextLaunch && countdown && (
        <div style={{ ...widgetBase }} onClick={() => openWindow('space')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,191,255,0.4)'; e.currentTarget.style.background = 'rgba(0,191,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(5,7,14,0.88)'; }}
        >
          <span style={{ fontSize: 16 }}>🚀</span>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 'bold', color: '#00BFFF', fontFamily: 'var(--font-mono)' }}>{countdown}</div>
            <div style={{ fontSize: 9, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
              {nextLaunch.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
export default DesktopWidgets;

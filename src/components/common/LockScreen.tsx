import React, { memo, useState, useEffect, useCallback, useRef } from 'react';

interface LockScreenProps {
  onLogin: (mode: 'user' | 'guest') => void;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  speed: Math.random() * 0.4 + 0.1,
  opacity: Math.random() * 0.4 + 0.1,
}));

export const LockScreen = memo(({ onLogin }: LockScreenProps) => {
  const [now, setNow] = useState(new Date());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mode, setMode] = useState<'clock' | 'login'>('clock');
  const [loginType, setLoginType] = useState<'user' | 'guest'>('guest');
  const [loading, setLoading] = useState(false);
  const [fullscreenAsked, setFullscreenAsked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Click anywhere on clock screen → go to login
  const handleScreenClick = () => {
    if (mode === 'clock') setMode('login');
  };

  useEffect(() => {
    if (mode === 'login') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [mode]);

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}
    setFullscreenAsked(true);
  }, []);

  const requestNotifications = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setTimeout(() => {
          new Notification('🖥️ Welcome to SUDHI OS!', {
            body: 'Your personal developer desktop OS is ready.',
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23080a10'/%3E%3Ctext x='32' y='42' font-family='monospace' font-size='28' font-weight='bold' fill='%2300FF88' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E",
          });
        }, 1000);
      }
    }
  }, []);

  const doLogin = useCallback(async (type: 'user' | 'guest') => {
    setLoading(true);

    // Request fullscreen on login
    await requestFullscreen();
    await requestNotifications();

    // Simulate brief loading
    await new Promise(r => setTimeout(r, 800));

    if (type === 'user') {
      // Password: "sudhir" or empty (demo)
      if (password !== '' && password.toLowerCase() !== 'sudhir' && password !== '1234') {
        setError('Wrong password. Try: sudhir or leave empty');
        setShake(true);
        setLoading(false);
        setTimeout(() => setShake(false), 600);
        return;
      }
    }

    setLoading(false);
    onLogin(type);
  }, [password, requestFullscreen, requestNotifications, onLogin]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doLogin(loginType);
    if (e.key === 'Escape') setMode('clock');
  };

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      onClick={mode === 'clock' ? handleScreenClick : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'radial-gradient(ellipse at 30% 40%, #0d1a2e 0%, #050709 60%, #000 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display, "Orbitron"), monospace',
        cursor: mode === 'clock' ? 'pointer' : 'default',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Animated Background Particles */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {PARTICLES.map(p => (
          <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size}
            fill="var(--accent, #00FF88)" opacity={p.opacity}>
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; ${(Math.random() - 0.5) * 60},${-p.speed * 200}; 0,0`}
              dur={`${8 + p.id * 1.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`}
            stroke="rgba(0,255,136,0.04)" strokeWidth="1" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 6.25}%`} y1="0" x2={`${i * 6.25}%`} y2="100%"
            stroke="rgba(0,255,136,0.03)" strokeWidth="1" />
        ))}
      </svg>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,191,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* OS Logo top */}
      <div style={{ position: 'absolute', top: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent,#00FF88)', fontSize: 16 }}>S</div>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 3 }}>SUDHI OS v3.0</span>
      </div>

      {/* CLOCK MODE */}
      {mode === 'clock' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          {/* Big clock */}
          <div style={{
            fontSize: 'clamp(72px, 12vw, 130px)', fontWeight: 900,
            color: '#fff', letterSpacing: 4, lineHeight: 1,
            fontFamily: '"Orbitron", monospace',
            textShadow: '0 0 40px rgba(0,255,136,0.4), 0 0 80px rgba(0,255,136,0.15)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {timeStr}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginTop: 14, letterSpacing: 2, fontFamily: 'var(--font-mono, monospace)' }}>
            {dateStr}
          </div>
          <div style={{ marginTop: 48, color: 'rgba(255,255,255,0.25)', fontSize: 12, letterSpacing: 3, animation: 'pulse 2s infinite' }}>
            CLICK ANYWHERE TO UNLOCK
          </div>

          {/* Notification dots */}
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
            {[{ icon: '📧', label: '3', color: '#00BFFF' }, { icon: '🔔', label: '1', color: '#FFB300' }, { icon: '💬', label: '5', color: '#00FF88' }].map(n => (
              <div key={n.icon} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px', backdropFilter: 'blur(8px)' }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>
                <span style={{ color: n.color, fontSize: 12, fontWeight: 'bold' }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGIN MODE */}
      {mode === 'login' && (
        <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease', width: '100%', maxWidth: 420, padding: '0 20px' }}>
          {/* Avatar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #0d3a6e, #1a0533)',
              border: '3px solid var(--accent, #00FF88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: '0 0 30px rgba(0,255,136,0.3)',
              overflow: 'hidden',
            }}>
              {/* Try to load real avatar, fallback to emoji */}
              <img
                src="https://avatars.githubusercontent.com/u/SudhirDevOps1?v=4"
                alt="Sudhir Singh"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML += '👨‍💻'; }}
              />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>Sudhir Singh</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>@SudhirDevOps1 · BCA Student · DevOps Engineer</div>
          </div>

          {/* Login Type Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 30, padding: 3, marginBottom: 18, gap: 2 }}>
            {(['user', 'guest'] as const).map(t => (
              <button key={t} onClick={() => setLoginType(t)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 24,
                  background: loginType === t ? 'rgba(var(--accent-rgb,0,255,136),0.2)' : 'transparent',
                  color: loginType === t ? 'var(--accent,#00FF88)' : '#666',
                  cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: loginType === t ? 'bold' : 'normal',
                  border: loginType === t ? '1px solid rgba(var(--accent-rgb,0,255,136),0.4)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}>
                {t === 'user' ? '🔐 Login' : '👤 Guest Mode'}
              </button>
            ))}
          </div>

          {/* Password field (only for user) */}
          {loginType === 'user' && (
            <div style={{ position: 'relative', marginBottom: 14, animation: shake ? 'shake 0.4s ease' : 'none' }}>
              <input
                ref={inputRef}
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Password (or press Enter to skip)"
                style={{
                  width: '100%', padding: '13px 44px 13px 16px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.07)', border: `1px solid ${error ? '#FF4444' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none',
                  fontFamily: 'var(--font-mono)', backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent,#00FF88)'}
                onBlur={e => e.target.style.borderColor = error ? '#FF4444' : 'rgba(255,255,255,0.15)'}
              />
              <button onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: '#FF4444', fontSize: 12, marginBottom: 12, padding: '6px 12px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8 }}>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={() => doLogin(loginType)}
            disabled={loading}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 12,
              background: loading ? 'rgba(var(--accent-rgb,0,255,136),0.3)' : 'rgba(var(--accent-rgb,0,255,136),0.2)',
              color: 'var(--accent,#00FF88)', fontSize: 15, fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'var(--font-mono)', letterSpacing: 2,
              border: '1px solid rgba(var(--accent-rgb,0,255,136),0.5)',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,136,0.2)',
              transition: 'all 0.2s',
            }}
          >

            {loading ? '⏳ Entering System...' : loginType === 'guest' ? '🚀 ENTER AS GUEST' : '🔓 LOGIN'}
          </button>

          {/* Hint */}
          <div style={{ marginTop: 12, fontSize: 10, color: '#444', lineHeight: 1.6 }}>
            Guest Mode — full access, no password needed<br />
            Login — password: <span style={{ color: '#666' }}>sudhir</span> (or press Enter)
          </div>

          {/* Fullscreen hint */}
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
              style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              ⛶ Enter Fullscreen
            </button>
            <button onClick={() => setMode('clock')}
              style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#555', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              ← Back to Clock
            </button>
          </div>
        </div>
      )}

      {/* Bottom system info */}
      <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 24, alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <span>⚡ Power</span>
        <span>🔇 Sound</span>
        <span>📶 WiFi</span>
        <span style={{ color: 'rgba(0,255,136,0.3)' }}>SUDHI OS 3.0 · Bihar, India</span>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes pulse { 0%,100%{opacity:0.25} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
});
export default LockScreen;

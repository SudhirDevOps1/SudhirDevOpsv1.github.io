import React, { memo, useEffect, useRef, useState } from 'react';
import { Timer, Play, Pause, RotateCcw, SkipForward, Flag, Globe } from 'lucide-react';
import { useOS } from '../../context/OSContext';

type Tab = 'pomodoro' | 'stopwatch' | 'world';
type Phase = 'work' | 'short' | 'long';

interface FocusStats {
  sessions: number;
  minutes: number;
}

interface Zone {
  city: string;
  tz: string;
  flag: string;
}

const PHASES: Record<Phase, { label: string; seconds: number; color: string }> = {
  work: { label: 'WORK', seconds: 25 * 60, color: 'var(--accent)' },
  short: { label: 'SHORT BREAK', seconds: 5 * 60, color: '#00FF88' },
  long: { label: 'LONG BREAK', seconds: 15 * 60, color: '#FFB020' },
};

const ZONES: Zone[] = [
  { city: 'INDIA', tz: 'Asia/Kolkata', flag: '🇮🇳' },
  { city: 'USA', tz: 'America/New_York', flag: '🇺🇸' },
  { city: 'UTC', tz: 'UTC', flag: '🌐' },
  { city: 'JAPAN', tz: 'Asia/Tokyo', flag: '🇯🇵' },
];

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

const fmtClock = (sec: number) => `${pad2(sec / 60)}:${pad2(sec % 60)}`;

const fmtMs = (ms: number) => {
  const total = Math.max(0, ms);
  return `${pad2(total / 60000)}:${pad2((total / 1000) % 60)}.${pad2((total / 10) % 100)}`;
};

const dayKey = (date: Date, tz?: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

const dayDiffLabel = (target: string, local: string) => {
  const diff = Math.round((Date.parse(`${target}T00:00:00Z`) - Date.parse(`${local}T00:00:00Z`)) / 86400000);
  if (diff === 0) return 'same day';
  const unit = Math.abs(diff) === 1 ? 'day' : 'days';
  return `${diff > 0 ? '+' : ''}${diff} ${unit}`;
};

const loadStats = (): FocusStats => {
  try {
    const raw = localStorage.getItem('sudhi_focus_stats');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FocusStats>;
      return { sessions: Number(parsed.sessions) || 0, minutes: Number(parsed.minutes) || 0 };
    }
  } catch {
    /* corrupted storage -> fall through to fresh stats */
  }
  return { sessions: 0, minutes: 0 };
};

export const FocusTimer = memo(() => {
  const { addToast } = useOS();
  const [tab, setTab] = useState<Tab>('pomodoro');

  // ---------------- POMODORO ----------------
  const [phase, setPhase] = useState<Phase>('work');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number>(PHASES.work.seconds);
  const [cycle, setCycle] = useState(0); // completed work sessions in current 4-session cycle
  const [autoStart, setAutoStart] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sudhi_focus_auto') !== 'false';
    } catch {
      return true;
    }
  });
  const [stats, setStats] = useState<FocusStats>(loadStats);
  const deadlineRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem('sudhi_focus_auto', String(autoStart));
    } catch {
      /* storage unavailable */
    }
  }, [autoStart]);

  // Enter a phase; when `auto` is true the countdown keeps running into it
  const enterPhase = (p: Phase, auto: boolean) => {
    const dur = PHASES[p].seconds;
    if (p === 'work' && cycle >= 4) setCycle(0);
    setPhase(p);
    setRemaining(dur);
    if (auto) {
      deadlineRef.current = Date.now() + dur * 1000;
      setRunning(true);
    } else {
      setRunning(false);
    }
  };

  // Deadline based countdown tick (cleared on unmount / tab change)
  useEffect(() => {
    if (!running || tab !== 'pomodoro') return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, tab]);

  // Phase completion: toast, stats, auto-advance
  useEffect(() => {
    if (!running || remaining > 0) return;

    if (phase === 'work') {
      const nextCycle = cycle + 1;
      const nextPhase: Phase = nextCycle % 4 === 0 ? 'long' : 'short';
      setCycle(nextCycle);
      setStats(prev => {
        const next = { sessions: prev.sessions + 1, minutes: prev.minutes + Math.round(PHASES.work.seconds / 60) };
        try {
          localStorage.setItem('sudhi_focus_stats', JSON.stringify(next));
        } catch {
          /* storage unavailable */
        }
        return next;
      });
      addToast(`⏰ WORK SESSION COMPLETE → ${PHASES[nextPhase].label} (${fmtClock(PHASES[nextPhase].seconds)})`, 'success');
      enterPhase(nextPhase, autoStart);
    } else {
      addToast(`${PHASES[phase].label} COMPLETE → FRESH WORK SESSION`, 'info');
      enterPhase('work', autoStart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running, phase, cycle, autoStart, addToast]);

  const handleStartPause = () => {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
      setRunning(false);
    } else {
      deadlineRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(PHASES[phase].seconds);
  };

  const handleSkip = () => {
    const next: Phase = phase === 'work' ? 'short' : 'work';
    addToast(`⏭ SKIPPED ${PHASES[phase].label} → ${PHASES[next].label}`, 'info');
    enterPhase(next, running);
  };

  // ---------------- STOPWATCH ----------------
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swBaseRef = useRef(0);
  const swStartRef = useRef(0);

  useEffect(() => {
    if (!swRunning || tab !== 'stopwatch') return;
    const id = window.setInterval(() => {
      setSwMs(swBaseRef.current + (performance.now() - swStartRef.current));
    }, 33);
    return () => window.clearInterval(id);
  }, [swRunning, tab]);

  const swToggle = () => {
    if (swRunning) {
      const total = swBaseRef.current + (performance.now() - swStartRef.current);
      swBaseRef.current = total;
      setSwMs(total);
      setSwRunning(false);
    } else {
      swStartRef.current = performance.now();
      setSwMs(swBaseRef.current);
      setSwRunning(true);
    }
  };

  const swReset = () => {
    swBaseRef.current = 0;
    swStartRef.current = 0;
    setSwMs(0);
    setSwRunning(false);
    setLaps([]);
  };

  const swLap = () => {
    const total = swBaseRef.current + (swRunning ? performance.now() - swStartRef.current : 0);
    if (total <= 0) return;
    setLaps(prev => [total, ...prev]);
  };

  // ---------------- WORLD CLOCKS ----------------
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (tab !== 'world') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [tab]);

  // ---------------- STYLES ----------------
  const panel: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
  };

  const segStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '7px 8px',
    border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
    background: active ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(255,255,255,0.03)',
    color: active ? 'var(--accent)' : '#777',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.15s',
  });

  const btnStyle = (primary: boolean): React.CSSProperties => ({
    padding: '9px 14px',
    border: primary ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.12)',
    background: primary ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
    color: primary ? '#000' : '#ccc',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.15s',
  });

  const statBox: React.CSSProperties = {
    flex: 1,
    padding: '10px 6px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    textAlign: 'center',
    minWidth: 0,
  };

  const nextLabel = phase === 'work'
    ? ((cycle + 1) % 4 === 0 ? 'LONG BREAK' : 'SHORT BREAK')
    : 'WORK';

  const ringR = 66;
  const ringC = 2 * Math.PI * ringR;
  const ringProgress = Math.min(1, Math.max(0, 1 - remaining / PHASES[phase].seconds));
  const filledDots = Math.min(cycle, 4);
  const date = new Date(now);

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono)', background: '#0a0c12', padding: 16 }}>
      <style>{`
        .ft-btn { transition: all 0.15s ease; }
        .ft-btn:hover:not(.ft-primary):not(:disabled) { background: rgba(var(--accent-rgb),0.15) !important; border-color: var(--accent) !important; color: var(--accent) !important; }
        .ft-btn:active:not(:disabled) { transform: translateY(1px); }
        .ft-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ft-primary:hover:not(:disabled) { filter: brightness(1.15); }
        .ft-seg:hover:not(.ft-seg-on) { color: #ccc !important; border-color: rgba(var(--accent-rgb),0.45) !important; }
        .ft-card:hover { border-color: rgba(var(--accent-rgb),0.5) !important; background: rgba(var(--accent-rgb),0.06) !important; }
        .ft-lap { transition: background 0.12s; }
        .ft-lap:hover { background: rgba(var(--accent-rgb),0.1); }
        .ft-ring { transition: stroke-dashoffset 0.35s linear, stroke 0.3s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', display: 'flex' }}>
          <Timer size={14} color="var(--accent)" />
        </div>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 2 }}>FOCUS.SUITE</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, color: '#4a4f5e', letterSpacing: 1 }}>PRODUCTIVITY TIMER OS</div>
      </div>

      {/* Segmented tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className={`ft-seg ${tab === 'pomodoro' ? 'ft-seg-on' : ''}`} onClick={() => setTab('pomodoro')} style={segStyle(tab === 'pomodoro')}>
          <Timer size={12} /> POMODORO
        </button>
        <button className={`ft-seg ${tab === 'stopwatch' ? 'ft-seg-on' : ''}`} onClick={() => setTab('stopwatch')} style={segStyle(tab === 'stopwatch')}>
          <Flag size={12} /> STOPWATCH
        </button>
        <button className={`ft-seg ${tab === 'world' ? 'ft-seg-on' : ''}`} onClick={() => setTab('world')} style={segStyle(tab === 'world')}>
          <Globe size={12} /> WORLD
        </button>
      </div>

      {/* ---------- POMODORO ---------- */}
      {tab === 'pomodoro' && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          {/* Ring */}
          <div style={{ ...panel, flex: '0 0 236px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 168, height: 168 }}>
              <svg width={168} height={168} viewBox="0 0 168 168">
                <circle cx={84} cy={84} r={ringR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9} />
                <circle
                  className="ft-ring"
                  cx={84}
                  cy={84}
                  r={ringR}
                  fill="none"
                  stroke={PHASES[phase].color}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringC * (1 - ringProgress)}
                  transform="rotate(-90 84 84)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <div style={{ fontSize: 9, color: '#666', letterSpacing: 2 }}>{PHASES[phase].label}</div>
                <div style={{ fontSize: 38, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtClock(remaining)}
                </div>
                <div style={{ fontSize: 8, color: running ? '#00FF88' : '#555', letterSpacing: 1 }}>
                  {running ? '● RUNNING' : '❚❚ PAUSED'}
                </div>
              </div>
            </div>

            {/* Session dots */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 8,
                    borderRadius: 4,
                    background: i < filledDots ? 'var(--accent)' : 'transparent',
                    border: i < filledDots ? 'none' : '1px solid rgba(255,255,255,0.18)',
                    transition: 'all 0.25s',
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: 1 }}>CYCLE {filledDots}/4 · NEXT: {nextLabel}</div>
          </div>

          {/* Controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ft-btn ft-primary" onClick={handleStartPause} style={{ ...btnStyle(true), flex: 1 }}>
                {running ? <Pause size={14} /> : <Play size={14} />} {running ? 'PAUSE' : 'START'}
              </button>
              <button className="ft-btn" onClick={handleReset} style={btnStyle(false)}>
                <RotateCcw size={13} /> RESET
              </button>
              <button className="ft-btn" onClick={handleSkip} style={btnStyle(false)}>
                <SkipForward size={13} /> SKIP
              </button>
            </div>

            {/* Auto-start toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: '#aaa', letterSpacing: 1 }}>
                AUTO-START NEXT
                <div style={{ fontSize: 8, color: '#4a4f5e', marginTop: 2, letterSpacing: 0 }}>{autoStart ? 'chain phases automatically' : 'wait for manual start'}</div>
              </div>
              <button
                onClick={() => setAutoStart(prev => !prev)}
                aria-pressed={autoStart}
                style={{
                  width: 52,
                  height: 24,
                  padding: 0,
                  borderRadius: 12,
                  position: 'relative',
                  cursor: 'pointer',
                  border: `1px solid ${autoStart ? 'var(--accent)' : 'rgba(255,255,255,0.18)'}`,
                  background: autoStart ? 'rgba(var(--accent-rgb),0.28)' : 'rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ position: 'absolute', top: 3, left: autoStart ? 31 : 3, width: 16, height: 16, borderRadius: '50%', background: autoStart ? 'var(--accent)' : '#666', transition: 'left 0.2s' }} />
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={statBox}>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--accent)' }}>{stats.sessions}</div>
                <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>SESSIONS DONE</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#00FF88' }}>{stats.minutes}</div>
                <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>TODAY'S FOCUS (MIN)</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#FFB020' }}>{filledDots}/4</div>
                <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>CYCLE PROGRESS</div>
              </div>
            </div>

            <div style={{ fontSize: 9, color: '#4a4f5e', lineHeight: 1.6, padding: '0 2px' }}>
              25:00 WORK → 05:00 SHORT BREAK → long 15:00 break after every 4th session.
              Stats persist locally on this device.
            </div>
          </div>
        </div>
      )}

      {/* ---------- STOPWATCH ---------- */}
      {tab === 'stopwatch' && (
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 46, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 2, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {fmtMs(swMs)}
          </div>
          <div style={{ fontSize: 9, color: swRunning ? '#00FF88' : '#555', letterSpacing: 2 }}>
            {swRunning ? '● RECORDING · CENTISECOND PRECISION' : swMs > 0 ? '❚❚ PAUSED' : 'READY · CENTISECOND PRECISION'}
          </div>

          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="ft-btn ft-primary" onClick={swToggle} style={{ ...btnStyle(true), flex: 1 }}>
              {swRunning ? <Pause size={14} /> : <Play size={14} />} {swRunning ? 'PAUSE' : 'START'}
            </button>
            <button className="ft-btn" onClick={swLap} disabled={!swRunning && swMs === 0} style={btnStyle(false)}>
              <Flag size={13} /> LAP
            </button>
            <button className="ft-btn" onClick={swReset} disabled={swMs === 0 && laps.length === 0} style={btnStyle(false)}>
              <RotateCcw size={13} /> RESET
            </button>
          </div>

          {/* Laps */}
          <div style={{ width: '100%', maxHeight: 150, overflowY: 'auto', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '6px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#4a4f5e', letterSpacing: 1, padding: '2px 6px 6px' }}>
              <span>LAP</span>
              <span>SPLIT (+)</span>
              <span>TOTAL</span>
            </div>
            {laps.length === 0 ? (
              <div style={{ fontSize: 10, color: '#444', textAlign: 'center', padding: '14px 0' }}>NO LAPS YET — HIT LAP TO SPLIT</div>
            ) : (
              laps.map((total, i) => {
                const prevTotal = i + 1 < laps.length ? laps[i + 1] : 0;
                return (
                  <div key={`${i}-${total}`} className="ft-lap" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '5px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: 6 }}>
                    <span style={{ color: 'var(--accent)' }}>LAP {laps.length - i}</span>
                    <span style={{ color: '#888' }}>+{fmtMs(total - prevTotal)}</span>
                    <span style={{ color: '#eee' }}>{fmtMs(total)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---------- WORLD ---------- */}
      {tab === 'world' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {ZONES.map(z => {
            const time = date.toLocaleTimeString('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
            const dateStr = date.toLocaleDateString('en-US', { timeZone: z.tz, weekday: 'short', month: 'short', day: 'numeric' });
            const diff = dayDiffLabel(dayKey(date, z.tz), dayKey(date));
            const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: z.tz, hour: '2-digit', hourCycle: 'h23' }).format(date));
            const isDay = Number.isFinite(hour) ? hour >= 6 && hour < 18 : true;
            return (
              <div key={z.tz} className="ft-card" style={{ ...panel, padding: 14, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{z.flag}</span>
                  <span style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 1 }}>{z.city}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 14 }}>{isDay ? '☀️' : '🌙'}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                  {time}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 9, color: '#666' }}>
                  <span>{dateStr}</span>
                  <span style={{ color: diff === 'same day' ? '#00FF88' : 'var(--accent)', fontWeight: 'bold' }}>{diff}</span>
                </div>
                <div style={{ fontSize: 8, color: '#444', marginTop: 4, letterSpacing: 1 }}>{z.tz}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
export default FocusTimer;

import React, { memo, useEffect, useRef, useState } from 'react';
import { Keyboard, RotateCcw, Trophy } from 'lucide-react';
import { useOS } from '../../context/OSContext';

type Status = 'idle' | 'running' | 'done';

interface RunResult {
  wpm: number;
  raw: number;
  accuracy: number;
  errors: number;
  consistency: string;
  samples: number[];
  elapsed: number;
  isBest: boolean;
  best: number;
}

const PASSAGES: string[] = [
  'The best error message is the one that never shows up. Write code that fails loudly, but never silently.',
  'Every great system started as a small script that someone refused to throw away.',
  'Premature optimization is the root of all evil, but measured performance is the fruit of wise engineering.',
  "Commit often, deploy on Friday if your tests are green, and never trust a cache you have never invalidated.",
  'A passing test suite is a promise; a flaky test is only a rumor.',
  "const ship = async () => { await review(); await ci(); return deploy('production'); };",
  'git log --oneline --graph --decorate --all tells a better story than any standup meeting ever could.',
  'Containers made deployment boring, and boring is the highest compliment you can pay an infrastructure.',
  'Latency is a feature. Treat every unnecessary millisecond like a bug filed against your future self.',
  'Readable code is a kindness to your teammates and a gift to the maintainer you will become in six months.',
  "The cloud is just someone else's computer, and Kubernetes is how you apologize to it.",
  'Simplicity is a prerequisite for reliability. First solve the problem, then write the code.',
  'function fib(n) {\n  if (n < 2) return n;\n  return fib(n - 1) + fib(n - 2);\n}',
  'if (bug.reproduce()) {\n  fix.theRootCause();\n  // never silence the symptom\n}',
  '$ ssh deploy@production\n$ systemctl restart sudhi-os\n> all systems nominal',
];

const DURATIONS = [15, 30, 60, 120];

const countCorrect = (typed: string, passage: string) => {
  let correct = 0;
  const n = Math.min(typed.length, passage.length);
  for (let i = 0; i < n; i++) {
    if (typed[i] === passage[i]) correct++;
  }
  return correct;
};

const pickPassage = (exclude?: string) => {
  const pool = exclude ? PASSAGES.filter(p => p !== exclude) : PASSAGES;
  const list = pool.length > 0 ? pool : PASSAGES;
  return list[Math.floor(Math.random() * list.length)];
};

const loadBest = () => {
  try {
    return Number(localStorage.getItem('sudhi_type_best')) || 0;
  } catch {
    return 0;
  }
};

const consistencyLabel = (samples: number[]) => {
  if (samples.length < 3) return 'Steady';
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return 'Rusty';
  const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  const cv = Math.sqrt(variance) / mean;
  if (cv <= 0.15) return 'Laser';
  if (cv <= 0.35) return 'Steady';
  return 'Rusty';
};

export const TypingTest = memo(() => {
  const { addToast } = useOS();

  const [passage, setPassage] = useState<string>(() => pickPassage());
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [duration, setDuration] = useState(30);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [best, setBest] = useState<number>(() => loadBest());

  const typedRef = useRef('');
  const erroredRef = useRef<Set<number>>(new Set<number>());
  const startRef = useRef(0);
  const samplesRef = useRef<number[]>([]);
  const lastSecRef = useRef(0);
  const finishedRef = useRef(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const currentRef = useRef<HTMLSpanElement | null>(null);

  const finishRun = (secs: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const t = typedRef.current;
    const usedSecs = Math.max(secs, 0.5);
    const minutes = usedSecs / 60;
    const correct = countCorrect(t, passage);
    const wpm = Math.round((correct / 5) / minutes);
    const raw = Math.round((t.length / 5) / minutes);
    const accuracy = t.length > 0 ? Math.round((correct / t.length) * 100) : 100;
    const errorCount = erroredRef.current.size;
    const samples = [...samplesRef.current];
    const prevBest = loadBest();
    const isBest = wpm > prevBest;

    if (isBest) {
      try {
        localStorage.setItem('sudhi_type_best', String(wpm));
      } catch {
        /* storage unavailable */
      }
      setBest(wpm);
      addToast(`NEW PERSONAL BEST — ${wpm} WPM 🏆`, 'success');
    }

    setResult({
      wpm,
      raw,
      accuracy,
      errors: errorCount,
      consistency: consistencyLabel(samples),
      samples,
      elapsed: usedSecs,
      isBest,
      best: Math.max(prevBest, wpm),
    });
    setStatus('done');
  };

  const resetTest = (nextPassage: string) => {
    finishedRef.current = false;
    typedRef.current = '';
    erroredRef.current = new Set<number>();
    samplesRef.current = [];
    lastSecRef.current = 0;
    startRef.current = 0;
    setTyped('');
    setErrors(0);
    setElapsed(0);
    setResult(null);
    setPassage(nextPassage);
    setStatus('idle');
  };

  const handleRestart = () => resetTest(pickPassage(passage));

  const changeDuration = (d: number) => {
    if (d === duration) return;
    setDuration(d);
    resetTest(passage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (result) return;
    let val = e.target.value;
    if (val.length > passage.length) val = val.slice(0, passage.length);

    if (status === 'idle' && val.length > 0) {
      startRef.current = performance.now();
      finishedRef.current = false;
      samplesRef.current = [];
      lastSecRef.current = 0;
      setElapsed(0);
      setStatus('running');
    }

    if (val.length > typed.length) {
      for (let i = typed.length; i < val.length; i++) {
        if (val[i] !== passage[i] && !erroredRef.current.has(i)) {
          erroredRef.current.add(i);
          setErrors(erroredRef.current.size);
        }
      }
    }

    typedRef.current = val;
    setTyped(val);

    if (val.length === passage.length) {
      finishRun((performance.now() - startRef.current) / 1000);
    }
  };

  const handleAreaClick = () => {
    const el = taRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') e.preventDefault();
  };

  // Keep the input focused whenever the test is in an inputable state
  useEffect(() => {
    if (!result) taRef.current?.focus();
  }, [result]);

  // Countdown + per-second WPM sampling (cleared on unmount / finish)
  useEffect(() => {
    if (status !== 'running') return;
    const id = window.setInterval(() => {
      if (finishedRef.current) return;
      const secs = (performance.now() - startRef.current) / 1000;
      setElapsed(secs);

      const sec = Math.floor(secs);
      if (sec >= 1 && sec !== lastSecRef.current) {
        lastSecRef.current = sec;
        const c = countCorrect(typedRef.current, passage);
        samplesRef.current.push(Math.round((c / 5) / (secs / 60)));
      }

      if (secs >= duration) finishRun(secs);
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, duration, passage]);

  // Keep the caret position visible while typing
  useEffect(() => {
    if (status === 'running') currentRef.current?.scrollIntoView({ block: 'nearest' });
  }, [typed, status]);

  const correct = countCorrect(typed, passage);
  const minutes = elapsed > 0 ? elapsed / 60 : 0;
  const wpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0;
  const rawWpm = minutes > 0 ? Math.round((typed.length / 5) / minutes) : 0;
  const acc = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  const timeLeft = Math.max(0, Math.ceil(duration - elapsed));

  const liveStats = [
    { label: 'WPM', value: String(wpm), color: 'var(--accent)' },
    { label: 'ACCURACY', value: `${acc}%`, color: '#00FF88' },
    { label: 'RAW WPM', value: String(rawWpm), color: '#ccc' },
    { label: 'TIME LEFT', value: `${timeLeft}s`, color: timeLeft <= 5 && status === 'running' ? '#FF3B30' : '#fff' },
    { label: 'ERRORS', value: String(errors), color: errors > 0 ? '#FF3B30' : '#777' },
  ];

  const samples = result ? result.samples : [];
  const sampleMax = Math.max(1, ...samples);
  const sampleAvg = samples.length > 0 ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0;
  const SPARK_W = 300;
  const SPARK_H = 56;
  const sparkPoints = samples
    .map((w, i) => {
      const x = (i / Math.max(samples.length - 1, 1)) * SPARK_W;
      const y = SPARK_H - 4 - (w / sampleMax) * (SPARK_H - 10);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const panel: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 'bold',
    border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
    background: active ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(255,255,255,0.03)',
    color: active ? 'var(--accent)' : '#777',
    transition: 'all 0.15s',
  });

  const primaryBtn: React.CSSProperties = {
    padding: '10px 22px',
    border: '1px solid var(--accent)',
    background: 'var(--accent)',
    color: '#000',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.15s',
  };

  const resultBox: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: '9px 4px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    textAlign: 'center',
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono)', background: '#0a0c12', padding: 16 }}>
      <style>{`
        @keyframes ttBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes ttPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        .tt-current { animation: ttPulse 0.8s ease-in-out infinite; }
        .tt-caret { animation: ttBlink 1s steps(1, end) infinite; }
        .tt-btn { transition: all 0.15s ease; }
        .tt-btn:hover:not(.tt-primary) { background: rgba(var(--accent-rgb),0.15) !important; border-color: var(--accent) !important; color: var(--accent) !important; }
        .tt-btn:active { transform: translateY(1px); }
        .tt-primary:hover { filter: brightness(1.15); }
        .tt-chip:hover:not(.tt-chip-on) { border-color: rgba(var(--accent-rgb),0.5) !important; color: #ccc !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', display: 'flex' }}>
          <Keyboard size={14} color="var(--accent)" />
        </div>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 2 }}>TYPE.RUN</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 9, color: '#4a4f5e', letterSpacing: 1, marginRight: 4 }}>DURATION</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DURATIONS.map(d => (
            <button
              key={d}
              className={`tt-chip ${duration === d ? 'tt-chip-on' : ''}`}
              onClick={() => changeDuration(d)}
              style={chipStyle(duration === d)}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {!result && (
        <>
          {/* Live stats */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {liveStats.map(s => (
              <div key={s.label} style={{ flex: 1, minWidth: 0, padding: '8px 4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Time progress */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (elapsed / duration) * 100)}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.1s linear' }} />
          </div>

          {/* Passage + invisible input */}
          <div onClick={handleAreaClick} style={{ ...panel, position: 'relative', height: 210, padding: 0, overflow: 'hidden', cursor: 'text' }}>
            <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: 16, fontSize: 16, lineHeight: 1.8, color: '#555', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {passage.split('').map((ch, i) => {
                const typedCh = i < typed.length ? typed[i] : null;
                const isTyped = typedCh !== null;
                const isCorrect = isTyped && typedCh === ch;
                const isCurrent = i === typed.length;
                const spanStyle: React.CSSProperties = {
                  color: !isTyped ? '#555' : isCorrect ? 'var(--accent)' : '#FF3B30',
                  background: isTyped && !isCorrect ? 'rgba(255,59,48,0.18)' : isCurrent ? 'rgba(var(--accent-rgb),0.14)' : 'transparent',
                  borderRadius: 3,
                  borderBottom: `2px solid ${isCurrent ? 'var(--accent)' : 'transparent'}`,
                };
                return (
                  <span
                    key={i}
                    ref={isCurrent ? currentRef : undefined}
                    className={isCurrent ? 'tt-current' : undefined}
                    style={spanStyle}
                  >
                    {ch === '\n' ? '↵' : ch}
                  </span>
                );
              })}
            </div>

            <textarea
              ref={taRef}
              value={typed}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) => e.preventDefault()}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              aria-label="typing test input"
              maxLength={passage.length}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                color: 'transparent',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 0,
                margin: 0,
                caretColor: 'transparent',
                fontFamily: 'var(--font-mono)',
                fontSize: 16,
                lineHeight: 1.8,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                zIndex: 2,
                cursor: 'text',
              }}
            />

            {status === 'idle' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3, background: 'rgba(10,12,18,0.72)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--accent)', letterSpacing: 1, fontWeight: 'bold' }}>
                  <span className="tt-caret" style={{ display: 'inline-block', width: 9, height: 17, background: 'var(--accent)' }} />
                  CLICK / PRESS ANY KEY TO START{best > 0 ? ` · BEST ${best} WPM` : ''}
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#444', letterSpacing: 1, marginTop: 8 }}>
            <span>BACKSPACE ALLOWED · ↵ = ENTER · ERRORS COUNT ONCE PER KEY</span>
            <span>{best > 0 ? `PERSONAL BEST: ${best} WPM` : 'NO PERSONAL BEST YET'}</span>
          </div>
        </>
      )}

      {/* ---------- RESULTS ---------- */}
      {result && (
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 16 }}>
          {result.isBest && (
            <div style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={13} /> NEW PERSONAL BEST 🏆
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ fontSize: 60, fontWeight: 'bold', color: 'var(--accent)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{result.wpm}</div>
            <div style={{ fontSize: 13, color: '#888', letterSpacing: 2 }}>WPM</div>
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <div style={resultBox}>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: '#00FF88' }}>{result.accuracy}%</div>
              <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>ACCURACY</div>
            </div>
            <div style={resultBox}>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: result.errors > 0 ? '#FF3B30' : '#777' }}>{result.errors}</div>
              <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>ERRORS</div>
            </div>
            <div style={resultBox}>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: result.consistency === 'Laser' ? '#00FF88' : result.consistency === 'Steady' ? 'var(--accent)' : '#FF3B30' }}>{result.consistency}</div>
              <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>CONSISTENCY</div>
            </div>
            <div style={resultBox}>
              <div style={{ fontSize: 17, fontWeight: 'bold', color: 'var(--accent)' }}>{result.best}</div>
              <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, marginTop: 2 }}>PERSONAL BEST</div>
            </div>
          </div>

          {/* Per-second WPM sparkline */}
          <div style={{ width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#4a4f5e', letterSpacing: 1, marginBottom: 6 }}>
              <span>WPM PER SECOND</span>
              <span>PEAK {sampleMax} · AVG {sampleAvg} · RAW {result.raw} · {Math.round(result.elapsed)}S</span>
            </div>
            {samples.length >= 2 ? (
              <svg width="100%" height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                <line x1={0} y1={SPARK_H - 1} x2={SPARK_W} y2={SPARK_H - 1} stroke="rgba(255,255,255,0.1)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : (
              <div style={{ fontSize: 10, color: '#444', textAlign: 'center', padding: '14px 0' }}>NOT ENOUGH DATA FOR A SPARKLINE</div>
            )}
          </div>

          <button className="tt-btn tt-primary" onClick={handleRestart} style={primaryBtn}>
            <RotateCcw size={14} /> RESTART · NEW PASSAGE
          </button>
        </div>
      )}
    </div>
  );
});
export default TypingTest;

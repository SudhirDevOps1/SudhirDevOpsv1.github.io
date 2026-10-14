import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Braces, Binary, Link2, Hash, KeyRound, Lock, Clock, Copy, Check, Sparkles, RefreshCw, type LucideIcon } from 'lucide-react';
import { useOS } from '../../context/OSContext';

type ToolId = 'json' | 'base64' | 'url' | 'hash' | 'uuid' | 'password' | 'time';

const TOOLS: { id: ToolId; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'json', label: 'JSON', hint: 'Format & minify', icon: Braces },
  { id: 'base64', label: 'BASE64', hint: 'Encode / decode', icon: Binary },
  { id: 'url', label: 'URL', hint: 'Percent-encoding', icon: Link2 },
  { id: 'hash', label: 'HASH', hint: 'SHA-256 / SHA-512', icon: Hash },
  { id: 'uuid', label: 'UUID', hint: 'v4 generator', icon: KeyRound },
  { id: 'password', label: 'PASSWORD', hint: 'Secure generator', icon: Lock },
  { id: 'time', label: 'TIME', hint: 'Unix & clocks', icon: Clock },
];

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'fortress';
const STRENGTH: Record<StrengthLevel, { label: string; color: string }> = {
  weak: { label: 'WEAK', color: '#ff4d4d' },
  fair: { label: 'FAIR', color: '#ff9f43' },
  strong: { label: 'STRONG', color: '#2ee6a8' },
  fortress: { label: 'FORTRESS', color: 'var(--accent)' },
};

const CopyButton = ({ onClick, disabled, active }: { onClick: () => void; disabled?: boolean; active?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title="Copy to clipboard"
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; } }}
    onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--accent)' : '#aaa'; e.currentTarget.style.borderColor = active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'; }}
    style={{
      padding: '5px 8px',
      border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
      background: active ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
      color: active ? 'var(--accent)' : '#aaa',
      borderRadius: 8,
      cursor: disabled ? 'default' : 'pointer',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      opacity: disabled ? 0.4 : 1,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      transition: 'all 0.15s',
      flexShrink: 0,
    }}
  >
    {active ? <Check size={13} /> : <Copy size={13} />}
    {active ? 'Copied' : 'Copy'}
  </button>
);

const relTime = (ms: number): string => {
  const diff = ms - Date.now();
  const sec = Math.floor(Math.abs(diff) / 1000);
  if (sec < 5) return 'just now';
  const units: [number, string][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Number.MAX_SAFE_INTEGER, 'year'],
  ];
  let val = sec;
  let name = 'second';
  for (const [size, u] of units) {
    if (val < size) { name = u; break; }
    val = Math.floor(val / size);
  }
  const plural = val === 1 ? '' : 's';
  return diff >= 0 ? `in ${val} ${name}${plural}` : `${val} ${name}${plural} ago`;
};

export const Toolbox = memo(() => {
  const { addToast } = useOS();
  const [active, setActive] = useState<ToolId>('json');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => { if (copyTimer.current) window.clearTimeout(copyTimer.current); }, []);

  const copyText = async (text: string, label: string): Promise<void> => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      addToast(`${label} copied to clipboard`, 'success');
      setCopiedKey(label);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedKey(null), 1400);
    } catch {
      addToast('Clipboard write failed', 'error');
    }
  };

  // ── 1. JSON ─────────────────────────────────────────────────────────────
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOut, setJsonOut] = useState('');

  const jsonError = useMemo(() => {
    if (!jsonInput.trim()) return '';
    try { JSON.parse(jsonInput); return ''; }
    catch (e) { return e instanceof Error ? e.message : 'Invalid JSON'; }
  }, [jsonInput]);

  const jsonLines = jsonInput ? jsonInput.split('\n').length : 0;

  const runJson = (mode: 'format' | 'minify') => {
    if (!jsonInput.trim()) { addToast('Paste some JSON first', 'info'); return; }
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOut(mode === 'format' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
    } catch (e) {
      setJsonOut('');
      addToast(e instanceof Error ? e.message : 'Invalid JSON', 'error');
    }
  };

  // ── 2. BASE64 ───────────────────────────────────────────────────────────
  const [b64In, setB64In] = useState('');
  const [b64Out, setB64Out] = useState('');

  const b64Encode = () => {
    if (!b64In) { addToast('Enter text to encode', 'info'); return; }
    const bytes = new TextEncoder().encode(b64In);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    setB64Out(btoa(bin));
  };

  const b64Decode = () => {
    if (!b64In.trim()) { addToast('Enter Base64 to decode', 'info'); return; }
    try {
      const bin = atob(b64In.trim());
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
      setB64Out(new TextDecoder().decode(bytes));
    } catch {
      setB64Out('');
      addToast('Invalid Base64 input', 'error');
    }
  };

  // ── 3. URL ──────────────────────────────────────────────────────────────
  const [urlIn, setUrlIn] = useState('');
  const [urlOut, setUrlOut] = useState('');
  const [urlMode, setUrlMode] = useState<'query' | 'full'>('query');

  const urlEncode = () => {
    if (!urlIn) { addToast('Enter a string or URL', 'info'); return; }
    setUrlOut(urlMode === 'query' ? encodeURIComponent(urlIn) : encodeURI(urlIn));
  };

  const urlDecode = () => {
    if (!urlIn.trim()) { addToast('Enter an encoded string', 'info'); return; }
    try {
      setUrlOut(urlMode === 'query' ? decodeURIComponent(urlIn) : decodeURI(urlIn));
    } catch {
      setUrlOut('');
      addToast('Malformed encoded string', 'error');
    }
  };

  // ── 4. HASH ─────────────────────────────────────────────────────────────
  const [hashIn, setHashIn] = useState('');
  const [hashes, setHashes] = useState<{ 'SHA-256': string; 'SHA-512': string }>({ 'SHA-256': '', 'SHA-512': '' });

  const runHash = async (algo: 'SHA-256' | 'SHA-512') => {
    if (!hashIn) { addToast('Enter text to hash', 'info'); return; }
    try {
      const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(hashIn));
      const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      setHashes(prev => ({ ...prev, [algo]: hex }));
    } catch {
      addToast('Hashing unavailable (secure context required)', 'error');
    }
  };

  // ── 5. UUID ─────────────────────────────────────────────────────────────
  const [uuid, setUuid] = useState('');
  const [uuidHistory, setUuidHistory] = useState<string[]>([]);

  const genUUID = () => {
    let id = '';
    if (typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = Array.from(b).map(x => x.toString(16).padStart(2, '0'));
      id = `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10, 16).join('')}`;
    }
    setUuid(id);
    setUuidHistory(prev => [id, ...prev].slice(0, 10));
  };

  // ── 6. PASSWORD ─────────────────────────────────────────────────────────
  const [pwLen, setPwLen] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwDigits, setPwDigits] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(false);
  const [pw, setPw] = useState('');

  const pwPool = (pwUpper ? UPPER : '') + (pwLower ? LOWER : '') + (pwDigits ? DIGITS : '') + (pwSymbols ? SYMBOLS : '');

  const generatePassword = () => {
    if (!pwPool) { addToast('Select at least one character set', 'error'); return; }
    const rand = new Uint32Array(pwLen);
    crypto.getRandomValues(rand);
    let out = '';
    for (let i = 0; i < pwLen; i++) out += pwPool[rand[i] % pwPool.length];
    setPw(out);
  };

  const pwEntropy = pw && pwPool ? Math.round(pw.length * Math.log2(pwPool.length)) : 0;
  const pwLevel: StrengthLevel = pwEntropy >= 90 ? 'fortress' : pwEntropy >= 65 ? 'strong' : pwEntropy >= 40 ? 'fair' : 'weak';
  const pwBarPct = Math.min(100, Math.round((pwEntropy / 128) * 100));

  // ── 7. TIME ─────────────────────────────────────────────────────────────
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = window.setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(t);
  }, []);

  const [unixIn, setUnixIn] = useState('');
  const [dtLocal, setDtLocal] = useState('');

  const unixNum = Number(unixIn);
  const unixValid = unixIn.trim() !== '' && Number.isFinite(unixNum);
  const unixMs = unixValid ? (Math.abs(unixNum) > 1e11 ? unixNum : unixNum * 1000) : 0;

  const dtMs = dtLocal ? new Date(dtLocal).getTime() : NaN;
  const dtValid = Number.isFinite(dtMs);

  // ── shared bits ─────────────────────────────────────────────────────────
  const sectionTitle = (label: string, desc: string) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 'bold', letterSpacing: 2 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#555' }}>{desc}</span>
    </div>
  );

  const fieldLabel: React.CSSProperties = { fontSize: 10, color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, display: 'block' };

  const btn = (kind: 'ghost' | 'accent'): React.CSSProperties => ({
    padding: '6px 12px',
    border: kind === 'accent' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
    background: kind === 'accent' ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
    color: kind === 'accent' ? 'var(--accent)' : '#ccc',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    transition: 'all 0.15s',
  });

  const hover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)';
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.color = 'var(--accent)';
  };
  const unhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.color = '#ccc';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    background: '#05060c',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#e5e5e5',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
  };
  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: 84,
    lineHeight: 1.5,
    caretColor: 'var(--accent)',
  };
  const outputPane: React.CSSProperties = {
    ...inputStyle,
    background: '#05060c',
    color: 'var(--accent)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    minHeight: 64,
    maxHeight: 190,
    overflow: 'auto',
    padding: 10,
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono)', background: '#0a0c12', padding: 16, display: 'flex', gap: 12, color: '#e5e5e5' }}>
      {/* Left tool rail */}
      <div style={{ width: 146, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 9, color: '#555', letterSpacing: 2, padding: '0 6px 6px' }}>DEV.TOOLBOX</div>
        {TOOLS.map(t => {
          const isActive = active === t.id;
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => setActive(t.id)}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; e.currentTarget.style.borderColor = 'var(--accent)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
              style={{
                padding: '8px 10px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent)' : '#777'} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 'bold', color: isActive ? 'var(--accent)' : '#ccc', letterSpacing: 1 }}>{t.label}</div>
                <div style={{ fontSize: 8, color: isActive ? '#999' : '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.hint}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content pane */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* 1. JSON */}
        {active === 'json' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('JSON FORMATTER', 'pretty-print & minify with live error checking')}
            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              spellCheck={false}
              placeholder={'{\n  "sudhi": "os"\n}'}
              style={textareaStyle}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => runJson('format')} onMouseEnter={hover} onMouseLeave={unhover} style={btn('accent')}>Format</button>
              <button onClick={() => runJson('minify')} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>Minify</button>
              <button onClick={() => { setJsonInput(''); setJsonOut(''); }} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>Clear</button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: '#555' }}>{jsonInput.length} chars · {jsonLines} lines</span>
            </div>
            {jsonError && (
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.35)', color: '#ff6b6b', fontSize: 11, wordBreak: 'break-word' }}>
                ⚠ {jsonError}
              </div>
            )}
            {jsonOut && (
              <div style={{ position: 'relative' }}>
                <div style={outputPane}>{jsonOut}</div>
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  <CopyButton onClick={() => copyText(jsonOut, 'JSON result')} active={copiedKey === 'JSON result'} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. BASE64 */}
        {active === 'base64' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('BASE64 CODEC', 'UTF-8 safe encode & decode')}
            <textarea
              value={b64In}
              onChange={e => setB64In(e.target.value)}
              spellCheck={false}
              placeholder="Text or Base64 payload..."
              style={textareaStyle}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={b64Encode} onMouseEnter={hover} onMouseLeave={unhover} style={btn('accent')}>Encode →</button>
              <button onClick={b64Decode} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>← Decode</button>
              <button onClick={() => { setB64In(''); setB64Out(''); }} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>Clear</button>
            </div>
            {b64Out && (
              <div style={{ position: 'relative' }}>
                <div style={outputPane}>{b64Out}</div>
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  <CopyButton onClick={() => copyText(b64Out, 'Base64 result')} active={copiedKey === 'Base64 result'} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. URL */}
        {active === 'url' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('URL ENCODER', 'percent-encode query strings or full URLs')}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['query', 'full'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setUrlMode(m)}
                  onMouseEnter={e => { if (urlMode !== m) { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; e.currentTarget.style.borderColor = 'var(--accent)'; } }}
                  onMouseLeave={e => { if (urlMode !== m) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
                  style={{
                    padding: '5px 12px',
                    border: `1px solid ${urlMode === m ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                    background: urlMode === m ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
                    color: urlMode === m ? 'var(--accent)' : '#aaa',
                    borderRadius: 8, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                  }}
                >
                  {m === 'query' ? 'Query string' : 'Full URL'}
                </button>
              ))}
            </div>
            <textarea
              value={urlIn}
              onChange={e => setUrlIn(e.target.value)}
              spellCheck={false}
              placeholder={urlMode === 'query' ? 'q=sudhi os&mode=dark' : 'https://sudhir.dev/?q=sudhi os'}
              style={textareaStyle}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={urlEncode} onMouseEnter={hover} onMouseLeave={unhover} style={btn('accent')}>Encode →</button>
              <button onClick={urlDecode} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>← Decode</button>
              <button onClick={() => { setUrlIn(''); setUrlOut(''); }} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>Clear</button>
            </div>
            {urlOut && (
              <div style={{ position: 'relative' }}>
                <div style={outputPane}>{urlOut}</div>
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  <CopyButton onClick={() => copyText(urlOut, 'URL result')} active={copiedKey === 'URL result'} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. HASH */}
        {active === 'hash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('SHA HASH', 'cryptographic digests via WebCrypto')}
            <textarea
              value={hashIn}
              onChange={e => setHashIn(e.target.value)}
              spellCheck={false}
              placeholder="Text to hash..."
              style={textareaStyle}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => runHash('SHA-256')} onMouseEnter={hover} onMouseLeave={unhover} style={btn('accent')}>SHA-256</button>
              <button onClick={() => runHash('SHA-512')} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>SHA-512</button>
              <button onClick={() => { setHashIn(''); setHashes({ 'SHA-256': '', 'SHA-512': '' }); }} onMouseEnter={hover} onMouseLeave={unhover} style={btn('ghost')}>Clear</button>
            </div>
            {(['SHA-256', 'SHA-512'] as const).map(algo => (
              hashes[algo] ? (
                <div key={algo} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>{algo}</span>
                    <div style={{ flex: 1 }} />
                    <CopyButton onClick={() => copyText(hashes[algo], algo)} active={copiedKey === algo} />
                  </div>
                  <div style={{ ...outputPane, border: 'none', background: 'transparent', padding: 0, minHeight: 0, maxHeight: 80 }}>{hashes[algo]}</div>
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* 5. UUID */}
        {active === 'uuid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('UUID v4', 'RFC 4122 identifiers via crypto.getRandomValues')}
            <div style={{ padding: 14, borderRadius: 10, background: '#05060c', border: '1px solid rgba(var(--accent-rgb),0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 'bold', color: 'var(--accent)', wordBreak: 'break-all' }}>
                {uuid || '— click generate —'}
              </div>
              {uuid && <CopyButton onClick={() => copyText(uuid, 'UUID')} active={copiedKey === 'UUID'} />}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={genUUID} onMouseEnter={hover} onMouseLeave={unhover} style={btn('accent')}><RefreshCw size={12} style={{ marginRight: 4 }} />Generate</button>
            </div>
            <div style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>HISTORY (last {uuidHistory.length}/10 · click to copy)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 150, overflow: 'auto' }}>
              {uuidHistory.length === 0 && <div style={{ fontSize: 11, color: '#444' }}>No UUIDs generated yet</div>}
              {uuidHistory.map((u, i) => (
                <div
                  key={`${u}-${i}`}
                  onClick={() => copyText(u, 'UUID')}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  style={{
                    padding: '5px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)', color: '#aaa', fontSize: 11,
                    cursor: 'pointer', wordBreak: 'break-all', transition: 'all 0.15s',
                  }}
                >
                  {u}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PASSWORD */}
        {active === 'password' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('PASSWORD GENERATOR', 'CSPRNG-based, never leaves your browser')}
            <div style={{ padding: 14, borderRadius: 10, background: '#05060c', border: '1px solid rgba(var(--accent-rgb),0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 'bold', color: 'var(--accent)', wordBreak: 'break-all' }}>
                {pw || '— click generate —'}
              </div>
              {pw && <CopyButton onClick={() => copyText(pw, 'Password')} active={copiedKey === 'Password'} />}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={fieldLabel}>Length: {pwLen}</span>
                <span style={{ fontSize: 10, color: '#555' }}>~{pwEntropy} bits entropy</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={pwLen}
                onChange={e => setPwLen(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {([
                ['Uppercase (A-Z)', pwUpper, setPwUpper],
                ['Lowercase (a-z)', pwLower, setPwLower],
                ['Digits (0-9)', pwDigits, setPwDigits],
                ['Symbols (!@#…)', pwSymbols, setPwSymbols],
              ] as [string, boolean, (v: boolean) => void][]).map(([label, checked, set]) => (
                <label
                  key={label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${checked ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                    cursor: 'pointer', fontSize: 11, color: checked ? '#e5e5e5' : '#888', transition: 'all 0.15s', userSelect: 'none',
                  }}
                >
                  <input type="checkbox" checked={checked} onChange={e => set(e.target.checked)} style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
                  {label}
                </label>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
                <span style={{ color: STRENGTH[pwLevel].color, fontWeight: 'bold', letterSpacing: 1 }}>{STRENGTH[pwLevel].label}</span>
                <span style={{ color: '#555' }}>strength</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${pwBarPct}%`, height: '100%', borderRadius: 3, background: STRENGTH[pwLevel].color, transition: 'all 0.25s' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={generatePassword} onMouseEnter={hover} onMouseLeave={unhover} style={btn('accent')}><Sparkles size={12} style={{ marginRight: 4 }} />Generate</button>
            </div>
          </div>
        )}

        {/* 7. TIME */}
        {active === 'time' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sectionTitle('TIME MACHINE', 'unix clocks, conversions & relative time')}
            <div style={{ padding: 14, borderRadius: 10, background: '#05060c', border: '1px solid rgba(var(--accent-rgb),0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>NOW (UNIX SECONDS)</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 1 }}>{nowSec}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{new Date(nowSec * 1000).toLocaleString()}</div>
              </div>
              <CopyButton onClick={() => copyText(String(nowSec), 'Unix timestamp')} active={copiedKey === 'Unix timestamp'} />
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={fieldLabel}>Unix → Human</span>
              <input
                value={unixIn}
                onChange={e => setUnixIn(e.target.value)}
                spellCheck={false}
                placeholder="Paste unix seconds (or ms)..."
                style={inputStyle}
              />
              {unixValid && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#666', width: 34 }}>LOCAL</span><span style={{ color: '#ddd', wordBreak: 'break-all' }}>{new Date(unixMs).toLocaleString()}</span></div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#666', width: 34 }}>UTC</span><span style={{ color: '#ddd', wordBreak: 'break-all' }}>{new Date(unixMs).toUTCString()}</span></div>
                  <div style={{ display: 'flex', gap: 8 }}><span style={{ color: '#666', width: 34 }}>IST</span><span style={{ color: '#ddd', wordBreak: 'break-all' }}>{new Date(unixMs).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span></div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#666', width: 34 }}>AGO</span>
                    <span style={{ color: 'var(--accent)' }}>{relTime(unixMs)}</span>
                    <div style={{ flex: 1 }} />
                    <CopyButton onClick={() => copyText(String(unixMs), 'Date string')} active={copiedKey === 'Date string'} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={fieldLabel}>Human → Unix</span>
              <input
                type="datetime-local"
                value={dtLocal}
                onChange={e => setDtLocal(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
              />
              {dtValid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--accent)' }}>{Math.floor(dtMs / 1000)}</span>
                  <span style={{ fontSize: 10, color: '#555' }}>{relTime(dtMs)}</span>
                  <div style={{ flex: 1 }} />
                  <CopyButton onClick={() => copyText(String(Math.floor(dtMs / 1000)), 'Unix result')} active={copiedKey === 'Unix result'} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Toolbox;

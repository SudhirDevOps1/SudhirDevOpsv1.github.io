import React, { memo, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, RefreshCw, ArrowRight } from 'lucide-react';
import { useOS } from '../../context/OSContext';

type CategoryId = 'length' | 'mass' | 'temperature' | 'speed' | 'data' | 'time' | 'currency';

interface UnitDef { id: string; label: string; factor: number }

const CATEGORIES: { id: CategoryId; label: string; base: string }[] = [
  { id: 'length', label: 'Length', base: 'meters' },
  { id: 'mass', label: 'Mass', base: 'kilograms' },
  { id: 'temperature', label: 'Temperature', base: 'Celsius' },
  { id: 'speed', label: 'Speed', base: 'm/s' },
  { id: 'data', label: 'Data', base: 'bytes · 1024' },
  { id: 'time', label: 'Time', base: 'seconds' },
  { id: 'currency', label: 'Currency', base: 'per 1 USD' },
];

const UNITS: Record<CategoryId, UnitDef[]> = {
  length: [
    { id: 'm', label: 'Meter (m)', factor: 1 },
    { id: 'km', label: 'Kilometer (km)', factor: 1000 },
    { id: 'cm', label: 'Centimeter (cm)', factor: 0.01 },
    { id: 'mm', label: 'Millimeter (mm)', factor: 0.001 },
    { id: 'mi', label: 'Mile (mi)', factor: 1609.344 },
    { id: 'yd', label: 'Yard (yd)', factor: 0.9144 },
    { id: 'ft', label: 'Foot (ft)', factor: 0.3048 },
    { id: 'in', label: 'Inch (in)', factor: 0.0254 },
  ],
  mass: [
    { id: 'kg', label: 'Kilogram (kg)', factor: 1 },
    { id: 'g', label: 'Gram (g)', factor: 0.001 },
    { id: 'mg', label: 'Milligram (mg)', factor: 0.000001 },
    { id: 'lb', label: 'Pound (lb)', factor: 0.45359237 },
    { id: 'oz', label: 'Ounce (oz)', factor: 0.028349523125 },
    { id: 't', label: 'Ton (t)', factor: 1000 },
  ],
  temperature: [
    { id: 'C', label: 'Celsius (°C)', factor: 1 },
    { id: 'F', label: 'Fahrenheit (°F)', factor: 1 },
    { id: 'K', label: 'Kelvin (K)', factor: 1 },
  ],
  speed: [
    { id: 'ms', label: 'Meters/second (m/s)', factor: 1 },
    { id: 'kmh', label: 'Kilometers/hour (km/h)', factor: 1 / 3.6 },
    { id: 'mph', label: 'Miles/hour (mph)', factor: 0.44704 },
    { id: 'kt', label: 'Knots (kn)', factor: 0.514444444444 },
  ],
  data: [
    { id: 'B', label: 'Byte (B)', factor: 1 },
    { id: 'KB', label: 'Kilobyte (KB)', factor: 1024 },
    { id: 'MB', label: 'Megabyte (MB)', factor: 1024 ** 2 },
    { id: 'GB', label: 'Gigabyte (GB)', factor: 1024 ** 3 },
    { id: 'TB', label: 'Terabyte (TB)', factor: 1024 ** 4 },
    { id: 'PB', label: 'Petabyte (PB)', factor: 1024 ** 5 },
  ],
  time: [
    { id: 'sec', label: 'Second (s)', factor: 1 },
    { id: 'min', label: 'Minute (min)', factor: 60 },
    { id: 'hr', label: 'Hour (h)', factor: 3600 },
    { id: 'day', label: 'Day (d)', factor: 86400 },
    { id: 'week', label: 'Week (wk)', factor: 604800 },
  ],
  currency: [
    { id: 'USD', label: 'US Dollar (USD)', factor: 1 },
    { id: 'EUR', label: 'Euro (EUR)', factor: 1 },
    { id: 'INR', label: 'Indian Rupee (INR)', factor: 1 },
    { id: 'GBP', label: 'British Pound (GBP)', factor: 1 },
    { id: 'JPY', label: 'Japanese Yen (JPY)', factor: 1 },
    { id: 'AED', label: 'UAE Dirham (AED)', factor: 1 },
    { id: 'BTC', label: 'Bitcoin (BTC)', factor: 1 },
  ],
};

// Indicative static rates: units per 1 USD (offline fallback)
const BAKED_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, INR: 84.0, GBP: 0.79, JPY: 152.0, AED: 3.6725, BTC: 0.0000093,
};
const CURRENCY_CODES = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AED', 'BTC'];

interface QuickPair { from: string; to: string }
const QUICK: Record<CategoryId, QuickPair[]> = {
  length: [{ from: 'km', to: 'mi' }, { from: 'mi', to: 'km' }, { from: 'm', to: 'ft' }, { from: 'ft', to: 'm' }, { from: 'cm', to: 'in' }, { from: 'in', to: 'cm' }],
  mass: [{ from: 'kg', to: 'lb' }, { from: 'lb', to: 'kg' }, { from: 'g', to: 'oz' }, { from: 'oz', to: 'g' }, { from: 't', to: 'kg' }, { from: 'kg', to: 'g' }],
  temperature: [{ from: 'C', to: 'F' }, { from: 'F', to: 'C' }, { from: 'C', to: 'K' }, { from: 'K', to: 'C' }, { from: 'F', to: 'K' }, { from: 'K', to: 'F' }],
  speed: [{ from: 'kmh', to: 'mph' }, { from: 'mph', to: 'kmh' }, { from: 'ms', to: 'kmh' }, { from: 'kmh', to: 'ms' }, { from: 'kt', to: 'kmh' }, { from: 'ms', to: 'mph' }],
  data: [{ from: 'GB', to: 'MB' }, { from: 'MB', to: 'GB' }, { from: 'TB', to: 'GB' }, { from: 'GB', to: 'TB' }, { from: 'KB', to: 'B' }, { from: 'PB', to: 'TB' }],
  time: [{ from: 'min', to: 'hr' }, { from: 'hr', to: 'day' }, { from: 'day', to: 'week' }, { from: 'sec', to: 'min' }, { from: 'week', to: 'day' }, { from: 'day', to: 'hr' }],
  currency: [{ from: 'USD', to: 'EUR' }, { from: 'EUR', to: 'USD' }, { from: 'USD', to: 'INR' }, { from: 'INR', to: 'USD' }, { from: 'USD', to: 'GBP' }, { from: 'USD', to: 'JPY' }],
};

const toCelsius = (value: number, from: string): number =>
  from === 'C' ? value : from === 'F' ? ((value - 32) * 5) / 9 : value - 273.15;

const fromCelsius = (celsius: number, to: string): number =>
  to === 'C' ? celsius : to === 'F' ? (celsius * 9) / 5 + 32 : celsius + 273.15;

const convertValue = (value: number, from: UnitDef, to: UnitDef, cat: CategoryId, rates: Record<string, number>): number => {
  if (cat === 'temperature') return fromCelsius(toCelsius(value, from.id), to.id);
  if (cat === 'currency') {
    const rf = rates[from.id];
    const rt = rates[to.id];
    if (!rf || !rt) return NaN;
    return (value / rf) * rt;
  }
  return (value * from.factor) / to.factor;
};

const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && abs < 0.000001) return n.toExponential(6);
  if (abs >= 1e15) return n.toExponential(6);
  return (Math.round(n * 1e10) / 1e10).toLocaleString('en-US', { maximumFractionDigits: 10 });
};

const CopyButton = ({ onClick, disabled, active }: { onClick: () => void; disabled?: boolean; active?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title="Copy result"
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; } }}
    onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--accent)' : '#aaa'; e.currentTarget.style.borderColor = active ? 'var(--accent)' : 'rgba(255,255,255,0.08)'; }}
    style={{
      padding: '6px 10px',
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

export const Converter = memo(() => {
  const { addToast } = useOS();
  const [category, setCategory] = useState<CategoryId>('length');
  const [fromId, setFromId] = useState('km');
  const [toId, setToId] = useState('mi');
  const [value, setValue] = useState('1');
  const [copied, setCopied] = useState(false);

  // Optional live FX refresh — silently falls back to baked rates
  const [rates, setRates] = useState<Record<string, number>>(BAKED_RATES);
  const [ratesLive, setRatesLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error('request failed'))))
      .then((data: { rates?: Record<string, unknown> }) => {
        if (cancelled) return;
        const next: Record<string, number> = {};
        Object.entries(data.rates ?? {}).forEach(([code, r]) => {
          if (typeof r === 'number' && Number.isFinite(r) && r > 0) next[code] = r;
        });
        const complete = CURRENCY_CODES.every(c => typeof next[c] === 'number');
        if (complete) {
          setRates(next);
          setRatesLive(true);
        }
      })
      .catch(() => { /* offline: keep baked rates */ });
    return () => { cancelled = true; };
  }, []);

  const units = UNITS[category];
  const fromUnit = units.find(u => u.id === fromId) ?? units[0];
  const toUnit = units.find(u => u.id === toId) ?? units[1] ?? units[0];

  const numValue = Number(value);
  const valueValid = value.trim() !== '' && Number.isFinite(numValue);
  const result = valueValid ? convertValue(numValue, fromUnit, toUnit, category, rates) : NaN;
  const resultValid = Number.isFinite(result);
  const resultText = resultValid ? fmt(result) : '—';
  const perUnit = useMemo(
    () => convertValue(1, fromUnit, toUnit, category, rates),
    [fromUnit, toUnit, category, rates],
  );

  const selectCategory = (id: CategoryId) => {
    const list = UNITS[id];
    setCategory(id);
    setFromId(list[0].id);
    setToId((list[1] ?? list[0]).id);
    setValue('1');
  };

  const swap = () => { setFromId(toId); setToId(fromId); };

  const loadQuick = (q: QuickPair) => { setFromId(q.from); setToId(q.to); };

  const copyResult = async () => {
    if (!resultValid) return;
    try {
      await navigator.clipboard.writeText(String(Math.round(result * 1e10) / 1e10));
      addToast('Result copied to clipboard', 'success');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      addToast('Clipboard write failed', 'error');
    }
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
    colorScheme: 'dark',
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono)', background: '#0a0c12', padding: 16, color: '#e5e5e5' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 2 }}>UNIT.CONVERTER</span>
        <span style={{ fontSize: 10, color: '#555' }}>base: {CATEGORIES.find(c => c.id === category)?.base}</span>
        <div style={{ flex: 1 }} />
        {category === 'currency' && (
          <span
            title={ratesLive ? 'Live rates from open.er-api.com' : 'Using baked indicative rates (offline)'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20,
              border: `1px solid ${ratesLive ? 'rgba(46,230,168,0.4)' : 'rgba(255,159,67,0.4)'}`,
              background: ratesLive ? 'rgba(46,230,168,0.1)' : 'rgba(255,159,67,0.1)',
              color: ratesLive ? '#2ee6a8' : '#ff9f43', fontSize: 9, letterSpacing: 1,
            }}
          >
            <RefreshCw size={10} />{ratesLive ? 'LIVE RATES' : 'OFFLINE RATES'}
          </span>
        )}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATEGORIES.map(c => {
          const isActive = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => selectCategory(c.id)}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; e.currentTarget.style.borderColor = 'var(--accent)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
              style={{
                padding: '6px 12px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                background: isActive ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
                color: isActive ? 'var(--accent)' : '#aaa',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Unit selectors + swap */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: '#666', letterSpacing: 1, display: 'block', marginBottom: 4 }}>FROM</span>
          <select value={fromId} onChange={e => setFromId(e.target.value)} style={inputStyle}>
            {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
        <button
          onClick={swap}
          title="Swap units"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ccc'; }}
          style={{
            width: 38, height: 38, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#ccc',
            borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
          }}
        >
          <ArrowLeftRight size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 10, color: '#666', letterSpacing: 1, display: 'block', marginBottom: 4 }}>TO</span>
          <select value={toId} onChange={e => setToId(e.target.value)} style={inputStyle}>
            {units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
      </div>

      {/* From input */}
      <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: '#666', letterSpacing: 1, display: 'block', marginBottom: 4 }}>VALUE</span>
        <input
          value={value}
          onChange={e => { const v = e.target.value; if (v === '' || /^-?\d*\.?\d*$/.test(v)) setValue(v); }}
          inputMode="decimal"
          spellCheck={false}
          placeholder="0"
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 'bold',
            caretColor: 'var(--accent)', boxSizing: 'border-box',
          }}
        />
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{fromUnit.label}</div>
      </div>

      {/* Result card */}
      <div style={{
        padding: '14px 16px', borderRadius: 12, background: 'rgba(var(--accent-rgb),0.1)',
        border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#666', letterSpacing: 1 }}>RESULT</div>
          <div style={{ fontSize: 30, fontWeight: 'bold', color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
            {resultText}
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>{toUnit.label}</div>
        </div>
        <CopyButton onClick={copyResult} disabled={!resultValid} active={copied} />
      </div>

      {/* Rate line */}
      <div style={{ fontSize: 10, color: '#555', marginBottom: 14 }}>
        1 {fromUnit.id} = {fmt(perUnit)} {toUnit.id}
        {category === 'currency' && !ratesLive ? ' · indicative rates' : ''}
      </div>

      {/* Quick conversions */}
      <div style={{ fontSize: 10, color: '#666', letterSpacing: 1, marginBottom: 6 }}>QUICK CONVERSIONS</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {QUICK[category].map(q => {
          const label = `${q.from} → ${q.to}`;
          return (
            <button
              key={label}
              onClick={() => loadQuick(q)}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ccc'; }}
              style={{
                padding: '8px 6px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                color: '#ccc',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              {q.from} <ArrowRight size={11} style={{ opacity: 0.6 }} /> {q.to}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default Converter;

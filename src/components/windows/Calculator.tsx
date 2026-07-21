import React, { memo, useState } from 'react';
import { Delete, History, Cpu } from 'lucide-react';

export const CalculatorWindow = memo(() => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [hasResult, setHasResult] = useState(false);
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleNum = (n: string) => {
    if (display === '0' || hasResult) {
      setDisplay(n);
      setHasResult(false);
    } else {
      if (display.length < 16) setDisplay(prev => prev + n);
    }
  };

  const handleOp = (op: string) => {
    setHasResult(false);
    setEquation(`${display} ${op} `);
    setDisplay('0');
  };

  const handleDecimal = () => {
    if (hasResult) {
      setDisplay('0.');
      setHasResult(false);
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setHasResult(false);
  };

  const handleBackspace = () => {
    if (hasResult) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleToggleSign = () => {
    if (display !== '0') {
      setDisplay(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    }
  };

  const handlePercent = () => {
    try {
      const val = parseFloat(display) / 100;
      setDisplay(val.toString());
    } catch {}
  };

  // Scientific functions
  const handleScientific = (fn: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      if (fn === 'sin') res = Math.sin((val * Math.PI) / 180);
      else if (fn === 'cos') res = Math.cos((val * Math.PI) / 180);
      else if (fn === 'tan') res = Math.tan((val * Math.PI) / 180);
      else if (fn === 'sqrt') res = Math.sqrt(val);
      else if (fn === 'sq') res = Math.pow(val, 2);
      else if (fn === 'cube') res = Math.pow(val, 3);
      else if (fn === 'log') res = Math.log10(val);
      else if (fn === 'ln') res = Math.log(val);

      const rounded = Math.round(res * 100000000) / 100000000;
      setDisplay(rounded.toString());
      setEquation(`${fn}(${display})`);
      setHasResult(true);
      setHistory(prev => [`${fn}(${display}) = ${rounded}`, ...prev.slice(0, 9)]);
    } catch {
      setDisplay('Error');
    }
  };

  const handleEquals = () => {
    if (!equation) return;
    try {
      const full = equation + display;
      const sanitized = full.replace(/×/g, '*').replace(/÷/g, '/');

      // Safe evaluation without eval using Function constructor
      // eslint-disable-next-line no-new-func
      const res = new Function(`return ${sanitized}`)();
      const rounded = Math.round(res * 100000000) / 100000000;
      setDisplay(rounded.toString());
      setEquation(`${full} =`);
      setHasResult(true);
      setHistory(prev => [`${full} = ${rounded}`, ...prev.slice(0, 9)]);
    } catch {
      setDisplay('Error');
      setHasResult(true);
    }
  };

  const btnStyle = (bg = '#141724', color = '#fff', fontSize = 14): React.CSSProperties => ({
    padding: '12px 0',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    background: bg,
    color,
    fontSize,
    fontFamily: 'var(--font-mono)',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#090b14', fontFamily: 'var(--font-mono)', color: '#fff', padding: 14 }}>
      {/* Top Mode Bar & History Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode('standard')}
          style={{ padding: '4px 10px', border: `1px solid ${mode === 'standard' ? 'var(--accent)' : '#222'}`, background: mode === 'standard' ? 'rgba(var(--accent-rgb),0.2)' : '#111', color: mode === 'standard' ? 'var(--accent)' : '#888', borderRadius: 6, cursor: 'pointer', fontSize: 10 }}>
          Standard
        </button>
        <button onClick={() => setMode('scientific')}
          style={{ padding: '4px 10px', border: `1px solid ${mode === 'scientific' ? 'var(--accent)' : '#222'}`, background: mode === 'scientific' ? 'rgba(var(--accent-rgb),0.2)' : '#111', color: mode === 'scientific' ? 'var(--accent)' : '#888', borderRadius: 6, cursor: 'pointer', fontSize: 10 }}>
          Scientific
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowHistory(prev => !prev)}
          style={{ padding: '4px 8px', border: '1px solid #333', background: showHistory ? 'rgba(var(--accent-rgb),0.15)' : '#111', color: showHistory ? 'var(--accent)' : '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
          <History size={12} /> History
        </button>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div style={{ maxHeight: 100, overflowY: 'auto', background: '#05060c', border: '1px solid rgba(var(--accent-rgb),0.2)', borderRadius: 8, padding: 8, marginBottom: 10, fontSize: 10, color: '#aaa' }}>
          <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 'bold', marginBottom: 4 }}>CALCULATOR HISTORY</div>
          {history.length > 0 ? (
            history.map((h, i) => <div key={i} style={{ borderBottom: '1px solid #111', padding: '2px 0' }}>{h}</div>)
          ) : (
            <div style={{ color: '#444' }}>No previous calculations</div>
          )}
        </div>
      )}

      {/* Display Screen */}
      <div style={{ padding: '12px 16px', borderRadius: 10, background: '#04050a', border: '1px solid rgba(var(--accent-rgb),0.3)', marginBottom: 12, textAlign: 'right', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }}>
        <div style={{ fontSize: 11, color: '#666', height: 16, overflow: 'hidden' }}>{equation}</div>
        <div style={{ fontSize: 26, fontWeight: 'bold', color: 'var(--accent)', marginTop: 2, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Scientific Row */}
        {mode === 'scientific' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            <button onClick={() => handleScientific('sin')} style={btnStyle('#181b29', '#00E5FF', 11)}>sin</button>
            <button onClick={() => handleScientific('cos')} style={btnStyle('#181b29', '#00E5FF', 11)}>cos</button>
            <button onClick={() => handleScientific('tan')} style={btnStyle('#181b29', '#00E5FF', 11)}>tan</button>
            <button onClick={() => handleScientific('sqrt')} style={btnStyle('#181b29', '#00E5FF', 11)}>√x</button>
            <button onClick={() => handleScientific('sq')} style={btnStyle('#181b29', '#00E5FF', 11)}>x²</button>
            <button onClick={() => handleScientific('cube')} style={btnStyle('#181b29', '#00E5FF', 11)}>x³</button>
            <button onClick={() => handleScientific('log')} style={btnStyle('#181b29', '#00E5FF', 11)}>log</button>
            <button onClick={() => handleScientific('ln')} style={btnStyle('#181b29', '#00E5FF', 11)}>ln</button>
            <button onClick={() => { setDisplay(Math.PI.toString()); setHasResult(true); }} style={btnStyle('#181b29', '#00E5FF', 11)}>π</button>
            <button onClick={() => { setDisplay(Math.E.toString()); setHasResult(true); }} style={btnStyle('#181b29', '#00E5FF', 11)}>e</button>
          </div>
        )}

        {/* Standard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, flex: 1 }}>
          <button onClick={handleClear} style={btnStyle('rgba(255,68,68,0.15)', '#FF5555')}>C</button>
          <button onClick={handleBackspace} style={btnStyle('#141724', '#aaa')}><Delete size={16} /></button>
          <button onClick={handlePercent} style={btnStyle('#141724', '#aaa')}>%</button>
          <button onClick={() => handleOp('÷')} style={btnStyle('rgba(var(--accent-rgb),0.15)', 'var(--accent)')}>÷</button>

          <button onClick={() => handleNum('7')} style={btnStyle()}>7</button>
          <button onClick={() => handleNum('8')} style={btnStyle()}>8</button>
          <button onClick={() => handleNum('9')} style={btnStyle()}>9</button>
          <button onClick={() => handleOp('×')} style={btnStyle('rgba(var(--accent-rgb),0.15)', 'var(--accent)')}>×</button>

          <button onClick={() => handleNum('4')} style={btnStyle()}>4</button>
          <button onClick={() => handleNum('5')} style={btnStyle()}>5</button>
          <button onClick={() => handleNum('6')} style={btnStyle()}>6</button>
          <button onClick={() => handleOp('-')} style={btnStyle('rgba(var(--accent-rgb),0.15)', 'var(--accent)')}>-</button>

          <button onClick={() => handleNum('1')} style={btnStyle()}>1</button>
          <button onClick={() => handleNum('2')} style={btnStyle()}>2</button>
          <button onClick={() => handleNum('3')} style={btnStyle()}>3</button>
          <button onClick={() => handleOp('+')} style={btnStyle('rgba(var(--accent-rgb),0.15)', 'var(--accent)')}>+</button>

          <button onClick={handleToggleSign} style={btnStyle()}>±</button>
          <button onClick={() => handleNum('0')} style={btnStyle()}>0</button>
          <button onClick={handleDecimal} style={btnStyle()}>.</button>
          <button onClick={handleEquals} style={btnStyle('var(--accent)', '#000')}>=</button>
        </div>
      </div>
    </div>
  );
});
export default CalculatorWindow;

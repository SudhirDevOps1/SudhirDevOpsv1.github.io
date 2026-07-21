import React, { memo, useState } from 'react';
import { Calculator as CalcIcon, Delete, RotateCcw } from 'lucide-react';

export const CalculatorWindow = memo(() => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [hasResult, setHasResult] = useState(false);

  const handleNum = (n: string) => {
    if (display === '0' || hasResult) {
      setDisplay(n);
      setHasResult(false);
    } else {
      if (display.length < 14) setDisplay(prev => prev + n);
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

  const handleEquals = () => {
    if (!equation) return;
    try {
      const full = equation + display;
      // Safe math evaluator replacing symbols
      const sanitized = full.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      const rounded = Math.round(res * 100000000) / 100000000;
      setDisplay(rounded.toString());
      setEquation(`${full} =`);
      setHasResult(true);
    } catch {
      setDisplay('Error');
      setHasResult(true);
    }
  };

  const btnStyle = (bg = '#161925', color = '#fff', hoverBg = '#22273a'): React.CSSProperties => ({
    padding: '14px 0',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    background: bg,
    color,
    fontSize: 16,
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0d16', fontFamily: 'var(--font-mono)', color: '#fff', padding: 16 }}>
      {/* Display Screen */}
      <div style={{ padding: '14px 16px', borderRadius: 10, background: '#05060b', border: '1px solid rgba(var(--accent-rgb),0.3)', marginBottom: 16, textAlign: 'right', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)' }}>
        <div style={{ fontSize: 11, color: '#666', height: 16, overflow: 'hidden' }}>{equation}</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: 'var(--accent)', marginTop: 4, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, flex: 1 }}>
        <button onClick={handleClear} style={btnStyle('rgba(255,68,68,0.15)', '#FF5555')}>C</button>
        <button onClick={handleBackspace} style={btnStyle('#161925', '#aaa')}><Delete size={18} /></button>
        <button onClick={handlePercent} style={btnStyle('#161925', '#aaa')}>%</button>
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
  );
});
export default CalculatorWindow;

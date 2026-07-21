import React, { memo, useState, useRef, useEffect } from 'react';

export const PaintWindow = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill'>('pencil');
  const [color, setColor] = useState('#00FF88');
  const [isDrawing, setIsDrawing] = useState(false);

  const tools = [
    { id: 'pencil' as const, icon: '✏️', label: 'Pencil' },
    { id: 'eraser' as const, icon: '🧹', label: 'Eraser' },
    { id: 'fill' as const, icon: '🪣', label: 'Fill' },
  ];

  const colors = ['#00FF88', '#00BFFF', '#FFB300', '#BF00FF', '#FF0088', '#FFFFFF', '#000000'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil') {
      ctx.fillStyle = color;
      ctx.fillRect(x - 2, y - 2, 6, 6);
    } else if (tool === 'eraser') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 8, y - 8, 16, 16);
    } else if (tool === 'fill') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#0a0d14' }}>
      <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8, background: '#101420', alignItems: 'center' }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{ padding: '6px 12px', border: `1px solid ${tool === t.id ? 'var(--accent)' : '#333'}`, background: tool === t.id ? 'rgba(var(--accent-rgb),0.2)' : '#0a0a0a', color: tool === t.id ? 'var(--accent)' : '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
            {t.icon} {t.label}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: '#222', margin: '0 8px' }} />
        {colors.map(c => (
          <div key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, background: c, border: `2px solid ${color === c ? 'var(--accent)' : '#222'}`, borderRadius: 4, cursor: 'pointer' }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05070a' }}>
        <canvas ref={canvasRef} width={680} height={420} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} style={{ border: '2px solid rgba(var(--accent-rgb),0.3)', borderRadius: 6, cursor: 'crosshair', background: '#000' }} />
      </div>
    </div>
  );
});
export default PaintWindow;

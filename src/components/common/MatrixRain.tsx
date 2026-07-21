import React, { memo, useRef, useEffect } from 'react';

export const MatrixRain = memo(({ active, accent }: { active: boolean; accent: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF@#$%^&*()';
    const fontSize = 14;
    let cols = Math.floor(window.innerWidth / fontSize);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    dropsRef.current = Array(cols).fill(1);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(window.innerWidth / fontSize);
      dropsRef.current = Array(cols).fill(1);
    };
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!active) { rafRef.current = requestAnimationFrame(draw); return; }
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accent;
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
      dropsRef.current.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) dropsRef.current[i] = 0;
        dropsRef.current[i]++;
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    if (active) draw();
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, accent]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: active ? 1 : 0, transition: 'opacity 0.5s' }}
    />
  );
});

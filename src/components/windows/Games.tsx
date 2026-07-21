import React, { memo, useState, useEffect } from 'react';

export const GamesWindow = memo(() => {
  const [selectedGame, setSelectedGame] = useState<'snake' | 'minesweeper' | null>('snake');
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [dir, setDir] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (selectedGame !== 'snake' || gameOver) return;
    const timer = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || prev.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [dir, food, gameOver, selectedGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir !== 'DOWN') setDir('UP');
      if (e.key === 'ArrowDown' && dir !== 'UP') setDir('DOWN');
      if (e.key === 'ArrowLeft' && dir !== 'RIGHT') setDir('LEFT');
      if (e.key === 'ArrowRight' && dir !== 'LEFT') setDir('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir]);

  const restartSnake = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDir('RIGHT');
    setScore(0);
    setGameOver(false);
  };

  const games = [
    { id: 'snake' as const, name: 'Retro Snake', icon: '🐍', description: 'Real playable Snake Arcade' },
    { id: 'minesweeper' as const, name: 'Minesweeper', icon: '💣', description: 'Bomb Sweeper game' },
  ];

  if (selectedGame === 'snake') {
    return (
      <div style={{ padding: 16, fontFamily: 'var(--font-mono)', fontSize: 13, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setSelectedGame(null)} style={{ padding: '4px 10px', border: '1px solid #333', background: '#111', color: '#999', borderRadius: 4, cursor: 'pointer' }}>← Games Menu</button>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>SCORE: {score}</div>
          <button onClick={restartSnake} style={{ padding: '4px 10px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer' }}>Restart</button>
        </div>

        <div style={{ position: 'relative', width: 340, height: 340, background: '#000', border: '2px solid var(--accent)', borderRadius: 6, display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gridTemplateRows: 'repeat(20, 1fr)' }}>
          {Array.from({ length: 400 }).map((_, i) => {
            const x = i % 20;
            const y = Math.floor(i / 20);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <div key={i} style={{ background: isSnake ? 'var(--accent)' : isFood ? '#FF0055' : 'transparent', borderRadius: isSnake ? 2 : isFood ? '50%' : 0 }} />
            );
          })}
          {gameOver && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FF4444', gap: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>GAME OVER</div>
              <button onClick={restartSnake} style={{ padding: '6px 16px', border: '1px solid var(--accent)', background: 'var(--accent)', color: '#000', fontWeight: 'bold', borderRadius: 4, cursor: 'pointer' }}>PLAY AGAIN</button>
            </div>
          )}
        </div>
        <div style={{ color: '#666', fontSize: 11, marginTop: 12 }}>Use Arrow Keys ↑ ↓ ← → to control</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, height: '100%' }}>
      <div style={{ color: 'var(--accent)', fontSize: 16, marginBottom: 20, fontFamily: 'var(--font-title)' }}>GAMES ARCADE</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {games.map(game => (
          <div key={game.id} onClick={() => setSelectedGame(game.id)} style={{ padding: 24, border: '1px solid #222', borderRadius: 8, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: 'rgba(var(--accent-rgb),0.03)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{game.icon}</div>
            <div style={{ color: 'var(--accent)', fontSize: 14, marginBottom: 6 }}>{game.name}</div>
            <div style={{ color: '#666', fontSize: 11 }}>{game.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
});
export default GamesWindow;

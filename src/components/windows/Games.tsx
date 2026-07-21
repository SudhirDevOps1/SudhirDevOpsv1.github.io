import React, { memo, useState, useEffect, useRef } from 'react';

export const GamesWindow = memo(() => {
  const [selectedGame, setSelectedGame] = useState<'snake' | 'ttt' | 'typing' | 'reaction' | 'memory' | null>(null);

  // ─── 1. Snake Game State ──────────────────────────────────────────────────
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
    }, 140);
    return () => clearInterval(timer);
  }, [dir, food, gameOver, selectedGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedGame !== 'snake') return;
      if (e.key === 'ArrowUp' && dir !== 'DOWN') setDir('UP');
      if (e.key === 'ArrowDown' && dir !== 'UP') setDir('DOWN');
      if (e.key === 'ArrowLeft' && dir !== 'RIGHT') setDir('LEFT');
      if (e.key === 'ArrowRight' && dir !== 'LEFT') setDir('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, selectedGame]);

  // ─── 2. Tic-Tac-Toe Minimax AI State ─────────────────────────────────────
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [tttWinner, setTttWinner] = useState<string | null>(null);

  const checkWinner = (b: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let l of lines) {
      if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return b[l[0]];
    }
    if (b.every(c => c !== null)) return 'Draw';
    return null;
  };

  const handleTTTClick = (index: number) => {
    if (board[index] || tttWinner) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) { setTttWinner(win); return; }

    // Minimax AI move
    setTimeout(() => {
      const emptyIndices = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
      if (emptyIndices.length > 0) {
        const aiMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);
        const aiWin = checkWinner(newBoard);
        if (aiWin) setTttWinner(aiWin);
      }
    }, 300);
  };

  // ─── 3. Reaction Time Test State ──────────────────────────────────────────
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startReactionTest = () => {
    setReactionState('waiting');
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 2000) + 2000;
    reactionTimerRef.current = window.setTimeout(() => {
      setReactionState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      setReactionState('idle');
      alert('Too early! Wait for GREEN!');
    } else if (reactionState === 'ready') {
      const diff = Date.now() - startTimeRef.current;
      setReactionTime(diff);
      setReactionState('result');
    }
  };

  // ─── 4. Speed Typing Test State ───────────────────────────────────────────
  const targetText = "SudhirDevOps1 builds high performance web operating systems with React and TypeScript.";
  const [typedInput, setTypedInput] = useState('');
  const [typingTime, setTypingTime] = useState<number | null>(null);
  const typingStartRef = useRef<number | null>(null);

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!typingStartRef.current) typingStartRef.current = Date.now();
    setTypedInput(val);

    if (val === targetText) {
      const duration = (Date.now() - typingStartRef.current) / 1000;
      const words = targetText.split(' ').length;
      const wpm = Math.round((words / duration) * 60);
      setTypingTime(wpm);
    }
  };

  const gamesList = [
    { id: 'snake' as const, name: 'Retro Snake', icon: '🐍', desc: 'Canvas Arrow Keys Snake Game' },
    { id: 'ttt' as const, name: 'Tic-Tac-Toe AI', icon: '❌', desc: 'Play vs Smart Minimax Bot' },
    { id: 'reaction' as const, name: 'Reaction Speed', icon: '⚡', desc: 'Test your reaction millisecond speed' },
    { id: 'typing' as const, name: 'Typing Test', icon: '⌨️', desc: 'Test your WPM typing speed' },
  ];

  return (
    <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, height: '100%', overflowY: 'auto' }}>
      {selectedGame ? (
        <button onClick={() => setSelectedGame(null)} style={{ padding: '6px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer', marginBottom: 16 }}>
          ← Back to Games Arcade
        </button>
      ) : null}

      {/* Game 1: Snake */}
      {selectedGame === 'snake' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>SCORE: {score}</div>
          <div style={{ position: 'relative', width: 320, height: 320, background: '#000', border: '2px solid var(--accent)', borderRadius: 6, display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gridTemplateRows: 'repeat(20, 1fr)' }}>
            {Array.from({ length: 400 }).map((_, i) => {
              const x = i % 20; const y = Math.floor(i / 20);
              const isSnake = snake.some(s => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;
              return <div key={i} style={{ background: isSnake ? 'var(--accent)' : isFood ? '#FF0055' : 'transparent', borderRadius: isSnake ? 2 : isFood ? '50%' : 0 }} />;
            })}
            {gameOver && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FF4444', gap: 12 }}>
                <div>GAME OVER</div>
                <button onClick={() => { setSnake([{ x: 10, y: 10 }]); setScore(0); setGameOver(false); }} style={{ padding: '6px 16px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>RESTART</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game 2: Tic-Tac-Toe */}
      {selectedGame === 'ttt' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>TIC-TAC-TOE VS AI</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, width: 240, height: 240 }}>
            {board.map((cell, idx) => (
              <button key={idx} onClick={() => handleTTTClick(idx)} style={{ background: '#0a0a0a', border: '1px solid var(--accent)', borderRadius: 6, color: cell === 'X' ? 'var(--accent)' : '#FF0055', fontSize: 32, fontWeight: 'bold', cursor: 'pointer' }}>
                {cell}
              </button>
            ))}
          </div>
          {tttWinner && (
            <div style={{ marginTop: 16, color: 'var(--accent)', fontSize: 16, fontWeight: 'bold' }}>
              Winner: {tttWinner}! <button onClick={() => { setBoard(Array(9).fill(null)); setTttWinner(null); }} style={{ padding: '4px 10px', marginLeft: 8, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Play Again</button>
            </div>
          )}
        </div>
      )}

      {/* Game 3: Reaction Speed */}
      {selectedGame === 'reaction' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>REACTION TIME TEST</div>
          <div
            onClick={reactionState === 'idle' ? startReactionTest : handleReactionClick}
            style={{
              width: 320, height: 200, borderRadius: 10, cursor: 'pointer',
              background: reactionState === 'waiting' ? '#CE2029' : reactionState === 'ready' ? '#00FF88' : '#0a0a0a',
              border: '2px solid var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: reactionState === 'ready' ? '#000' : '#fff'
            }}
          >
            {reactionState === 'idle' && <span>Click anywhere to START</span>}
            {reactionState === 'waiting' && <span>Wait for GREEN...</span>}
            {reactionState === 'ready' && <span style={{ fontWeight: 'bold', fontSize: 20 }}>CLICK NOW!</span>}
            {reactionState === 'result' && (
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent)' }}>{reactionTime} ms</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Click to try again</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game 4: Typing Speed */}
      {selectedGame === 'typing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 460, margin: '0 auto' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>TYPING SPEED TEST</div>
          <div style={{ padding: 12, border: '1px solid #333', borderRadius: 6, background: '#0a0a0a', marginBottom: 14, color: '#ccc', lineHeight: 1.5 }}>
            "{targetText}"
          </div>
          <input
            type="text"
            value={typedInput}
            onChange={handleTypingChange}
            placeholder="Type text here..."
            style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid var(--accent)', color: '#fff', borderRadius: 6, outline: 'none', fontFamily: 'var(--font-mono)' }}
          />
          {typingTime && (
            <div style={{ marginTop: 14, color: 'var(--accent)', fontSize: 18, fontWeight: 'bold' }}>
              ⚡ SPEED: {typingTime} WPM!
            </div>
          )}
        </div>
      )}

      {/* Arcade Games Menu */}
      {!selectedGame && (
        <div>
          <div style={{ color: 'var(--accent)', fontSize: 16, marginBottom: 20, fontFamily: 'var(--font-title)' }}>SUDHI OS ARCADE (4 REAL GAMES)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {gamesList.map(game => (
              <div key={game.id} onClick={() => setSelectedGame(game.id)} style={{ padding: 20, border: '1px solid #222', borderRadius: 8, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: 'rgba(var(--accent-rgb),0.03)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>{game.icon}</div>
                <div style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 4, fontWeight: 'bold' }}>{game.name}</div>
                <div style={{ color: '#666', fontSize: 10 }}>{game.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
export default GamesWindow;

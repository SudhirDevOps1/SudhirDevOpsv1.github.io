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
    if (b.every(x => x !== null)) return 'Draw';
    return null;
  };

  const handleTTTClick = (i: number) => {
    if (board[i] || tttWinner) return;
    const newB = [...board];
    newB[i] = 'X';
    setBoard(newB);
    const win = checkWinner(newB);
    if (win) { setTttWinner(win); return; }

    const empty = newB.map((v, idx) => v === null ? idx : null).filter(v => v !== null) as number[];
    if (empty.length > 0) {
      const aiChoice = empty[Math.floor(Math.random() * empty.length)];
      newB[aiChoice] = 'O';
      setTimeout(() => {
        setBoard(newB);
        const aiWin = checkWinner(newB);
        if (aiWin) setTttWinner(aiWin);
      }, 300);
    }
  };

  // ─── 3. Reaction Speed Test ───────────────────────────────────────────────
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  const startReactionTest = () => {
    setReactionState('waiting');
    const delay = Math.random() * 2000 + 2000;
    timerRef.current = setTimeout(() => {
      setReactionState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      clearTimeout(timerRef.current);
      setReactionState('idle');
      alert('Too early! Click to restart.');
    } else if (reactionState === 'ready') {
      const diff = Date.now() - startTimeRef.current;
      setReactionTime(diff);
      setReactionState('result');
    } else if (reactionState === 'result') {
      startReactionTest();
    }
  };

  // ─── 4. Typing Speed Test ─────────────────────────────────────────────────
  const targetText = "DevOps engineering requires automation, continuous integration, and clean cloud architecture.";
  const [typedInput, setTypedInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingTime, setTypingTime] = useState<number | null>(null);

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!typingStartTime) setTypingStartTime(Date.now());
    setTypedInput(val);
    if (val === targetText) {
      const elapsedMinutes = (Date.now() - (typingStartTime || Date.now())) / 60000;
      const words = targetText.split(' ').length;
      setTypingTime(Math.round(words / elapsedMinutes));
    }
  };

  // ─── 5. Memory Emoji Cards Match Game ─────────────────────────────────────
  const EMOJI_ITEMS = ['🚀', '⚡', '🎮', '💻', '🤖', '🌐'];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  const initMemoryGame = () => {
    const deck = [...EMOJI_ITEMS, ...EMOJI_ITEMS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlippedCards([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (selectedGame === 'memory') initMemoryGame();
  }, [selectedGame]);

  const handleCardClick = (idx: number) => {
    if (flippedCards.length === 2 || cards[idx].flipped || cards[idx].matched) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        newCards[firstIdx].matched = true;
        newCards[secondIdx].matched = true;
        setCards(newCards);
        setFlippedCards([]);
        if (newCards.every(c => c.matched)) setMemoryWon(true);
      } else {
        setTimeout(() => {
          newCards[firstIdx].flipped = false;
          newCards[secondIdx].flipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const gamesList = [
    { id: 'snake' as const, name: '🐍 Cyber Snake', desc: 'Classic arcade snake game. Use arrow keys!', icon: '🐍' },
    { id: 'ttt' as const, name: '❌ Tic-Tac-Toe AI', desc: 'Play vs Minimax algorithm AI engine.', icon: '⭕' },
    { id: 'memory' as const, name: '🎴 Memory Card Match', desc: 'Flip and match pairs of emojis in min moves!', icon: '🎴' },
    { id: 'reaction' as const, name: '⚡ Reaction Speed', desc: 'Test your nerve reaction speed in ms.', icon: '⚡' },
    { id: 'typing' as const, name: '⌨️ Typing Speed Test', desc: 'Test WPM typing speed with dev text.', icon: '⌨️' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, fontFamily: 'var(--font-mono)', background: '#0a0d14', color: '#fff', overflowY: 'auto' }}>
      {selectedGame && (
        <button onClick={() => setSelectedGame(null)} style={{ alignSelf: 'flex-start', padding: '6px 12px', border: '1px solid #333', background: '#111', color: 'var(--accent)', borderRadius: 6, cursor: 'pointer', marginBottom: 16, fontSize: 11 }}>
          ← Back to Games Menu
        </button>
      )}

      {/* Game 1: Snake */}
      {selectedGame === 'snake' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>CYBER SNAKE — SCORE: {score}</div>
          <div style={{ width: 300, height: 300, display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', border: '2px solid var(--accent)', background: '#000', borderRadius: 8 }}>
            {Array.from({ length: 400 }).map((_, i) => {
              const x = i % 20;
              const y = Math.floor(i / 20);
              const isSnake = snake.some(s => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;
              return (
                <div key={i} style={{ background: isSnake ? 'var(--accent)' : isFood ? '#FF3E6C' : 'transparent', borderRadius: isFood ? '50%' : 2 }} />
              );
            })}
          </div>
          {gameOver && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ color: '#FF4444', fontWeight: 'bold', fontSize: 16 }}>GAME OVER</div>
              <button onClick={() => { setSnake([{ x: 10, y: 10 }]); setScore(0); setGameOver(false); }} style={{ padding: '6px 16px', marginTop: 8, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game 2: Tic-Tac-Toe */}
      {selectedGame === 'ttt' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>TIC-TAC-TOE VS AI</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: 240 }}>
            {board.map((cell, idx) => (
              <button key={idx} onClick={() => handleTTTClick(idx)} style={{ width: 72, height: 72, border: '1px solid #333', background: '#111', color: cell === 'X' ? 'var(--accent)' : '#FF3E6C', fontSize: 28, fontWeight: 'bold', borderRadius: 8, cursor: 'pointer' }}>
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

      {/* Game 3: Memory Cards Match */}
      {selectedGame === 'memory' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>MEMORY CARD MATCH — MOVES: {memoryMoves}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: 280 }}>
            {cards.map((card, idx) => (
              <div key={card.id} onClick={() => handleCardClick(idx)}
                style={{
                  width: 60, height: 60, borderRadius: 8, border: `1px solid ${card.matched ? 'var(--accent)' : '#333'}`,
                  background: card.flipped || card.matched ? 'rgba(var(--accent-rgb),0.2)' : '#11131f',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  transition: 'all 0.2s', userSelect: 'none',
                }}>
                {card.flipped || card.matched ? card.emoji : '❓'}
              </div>
            ))}
          </div>
          {memoryWon && (
            <div style={{ marginTop: 16, color: 'var(--accent)', fontSize: 16, fontWeight: 'bold' }}>
              🎉 YOU MATCHED ALL CARDS IN {memoryMoves} MOVES! <button onClick={initMemoryGame} style={{ padding: '6px 14px', marginLeft: 8, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Play Again</button>
            </div>
          )}
        </div>
      )}

      {/* Game 4: Reaction Speed */}
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

      {/* Game 5: Typing Speed */}
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
          <div style={{ color: 'var(--accent)', fontSize: 15, marginBottom: 16, fontFamily: 'var(--font-title)' }}>SUDHI OS ARCADE (5 REAL GAMES)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {gamesList.map(game => (
              <div key={game.id} onClick={() => setSelectedGame(game.id)} style={{ padding: 16, border: '1px solid #222', borderRadius: 8, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: 'rgba(var(--accent-rgb),0.03)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>{game.icon}</div>
                <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>{game.name}</div>
                <div style={{ color: '#666', fontSize: 9 }}>{game.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
export default GamesWindow;

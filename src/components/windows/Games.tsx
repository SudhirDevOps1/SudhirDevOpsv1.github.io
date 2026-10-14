import React, { memo, useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   Pure helpers (module scope — no component state, no extra dependencies)
   ═══════════════════════════════════════════════════════════════════════════ */

type Cell = string | null;
type Coord = { x: number; y: number };
type SnakeDir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type BestKey = 'snake' | 'ttt' | 'reaction' | 'typing' | 'memory';

const GRID = 20;
const BEST_PREFIX = 'sudhi-os:games:best:';

/** Read a persisted personal best (0 = never set). Never throws. */
function loadBest(key: BestKey): number {
  try {
    const raw = window.localStorage.getItem(BEST_PREFIX + key);
    const n = raw === null ? 0 : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0; // storage blocked (private mode) — best stays in memory for this session
  }
}

function saveBest(key: BestKey, value: number): void {
  try {
    window.localStorage.setItem(BEST_PREFIX + key, String(value));
  } catch {
    /* storage unavailable — in-memory best still works */
  }
}

function bestLabel(value: number, unit: string): string {
  return value > 0 ? `${value} ${unit}` : '—';
}

/* ─── Snake helpers ─────────────────────────────────────────────────────── */

/** Pick a food cell that is NOT covered by any snake segment (uniform over free cells). */
function spawnFood(body: Coord[]): Coord {
  const taken = new Set(body.map(s => `${s.x},${s.y}`));
  const free: Coord[] = [];
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return { x: 0, y: 0 }; // board full — nowhere else to put it
  return free[Math.floor(Math.random() * free.length)];
}

/* ─── Tic-Tac-Toe helpers: win detection + REAL minimax (alpha-beta) ────── */

const WIN_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function evaluateBoard(b: Cell[]): Cell {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(x => x !== null)) return 'Draw';
  return null;
}

/**
 * Classic minimax with alpha-beta pruning, scored from the AI's (O) point of view.
 * A win for O scores 10 - depth (faster wins preferred), a loss scores depth - 10
 * (slow losses preferred), a draw scores 0. Depth-first + pruning keeps it instant.
 */
function minimax(b: Cell[], depth: number, alpha: number, beta: number, maximizing: boolean): number {
  const result = evaluateBoard(b);
  if (result === 'O') return 10 - depth;
  if (result === 'X') return depth - 10;
  if (result === 'Draw') return 0;

  if (maximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth + 1, alpha, beta, false));
        b[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i] === null) {
      b[i] = 'X';
      best = Math.min(best, minimax(b, depth + 1, alpha, beta, true));
      b[i] = null;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
  }
  return best;
}

/** Perfect move for O. All moves sharing the top score are kept, one is picked at
 *  random so openings vary — every choice is still optimal play (unbeatable). */
function findBestOMove(b: Cell[]): number {
  let bestScore = -Infinity;
  let bestMoves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (b[i] !== null) continue;
    b[i] = 'O';
    const score = minimax(b, 0, -Infinity, Infinity, false);
    b[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [i];
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }
  if (bestMoves.length === 0) return -1;
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/* ─── Reaction test rating ──────────────────────────────────────────────── */

function reactionRating(ms: number): { label: string; color: string } {
  if (ms < 200) return { label: 'ELITE — faster than ~95% of people', color: '#00FF88' };
  if (ms < 250) return { label: 'GREAT — above average', color: '#7CFF6B' };
  if (ms < 300) return { label: 'AVERAGE — right around the human average', color: '#FFD166' };
  if (ms < 400) return { label: 'SLOW — below average', color: '#FF9F43' };
  return { label: 'VERY SLOW — stay focused!', color: '#FF4444' };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Games window — all five games are real, fully playable implementations
   ═══════════════════════════════════════════════════════════════════════════ */

export const GamesWindow = memo(() => {
  const [selectedGame, setSelectedGame] = useState<'snake' | 'ttt' | 'typing' | 'reaction' | 'memory' | null>(null);

  /* ─── Persisted personal bests (localStorage) ─────────────────────────── */
  const [best, setBest] = useState<Record<BestKey, number>>(() => ({
    snake: loadBest('snake'),
    ttt: loadBest('ttt'),
    reaction: loadBest('reaction'),
    typing: loadBest('typing'),
    memory: loadBest('memory'),
  }));
  const bestRef = useRef<Record<BestKey, number>>(best);

  const recordBest = (key: BestKey, value: number, mode: 'high' | 'low'): void => {
    if (!Number.isFinite(value) || value <= 0) return;
    const current = bestRef.current[key];
    const improved = current === 0 || (mode === 'high' ? value > current : value < current);
    if (!improved) return;
    bestRef.current = { ...bestRef.current, [key]: value };
    setBest(bestRef.current);
    saveBest(key, value);
  };

  /* ─── 1. Cyber Snake ─────────────────────────────────────────────────── */
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState<Coord[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Coord>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);

  // Authoritative game data — the loop reads these instead of re-creating the
  // interval whenever direction/food/score change.
  const snakeRef = useRef<Coord[]>(snake);
  const foodRef = useRef<Coord>(food);
  const dirRef = useRef<SnakeDir>('RIGHT');
  const scoreRef = useRef(0);

  useEffect(() => {
    if (selectedGame !== 'snake' || gameOver) return;
    const timer = setInterval(() => {
      const prev = snakeRef.current;
      const f = foodRef.current;
      const head: Coord = { x: prev[0].x, y: prev[0].y };
      if (dirRef.current === 'UP') head.y -= 1;
      else if (dirRef.current === 'DOWN') head.y += 1;
      else if (dirRef.current === 'LEFT') head.x -= 1;
      else head.x += 1;

      const eating = head.x === f.x && head.y === f.y;
      // the tail cell vacates this tick unless the snake is growing
      const body = eating ? prev : prev.slice(0, -1);
      const hitWall = head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID;
      const hitSelf = body.some(s => s.x === head.x && s.y === head.y);
      if (hitWall || hitSelf) {
        setGameOver(true);
        return;
      }

      const next: Coord[] = [head, ...prev];
      if (!eating) next.pop();
      snakeRef.current = next;
      setSnake(next);

      if (eating) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        recordBest('snake', scoreRef.current, 'high');
        const newFood = spawnFood(next);
        foodRef.current = newFood;
        setFood(newFood);
      }
    }, 140);
    return () => clearInterval(timer);
  }, [selectedGame, gameOver]);

  const resetSnake = (): void => {
    const start: Coord[] = [{ x: 10, y: 10 }];
    snakeRef.current = start;
    foodRef.current = spawnFood(start);
    dirRef.current = 'RIGHT';
    scoreRef.current = 0;
    setSnake(start);
    setFood(foodRef.current);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (selectedGame !== 'snake') return;
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'ArrowLeft' && k !== 'ArrowRight') return;
      e.preventDefault(); // stop the page scrolling while the snake moves
      const next: SnakeDir = k === 'ArrowUp' ? 'UP' : k === 'ArrowDown' ? 'DOWN' : k === 'ArrowLeft' ? 'LEFT' : 'RIGHT';
      const cur = dirRef.current;
      const opposite =
        (cur === 'UP' && next === 'DOWN') ||
        (cur === 'DOWN' && next === 'UP') ||
        (cur === 'LEFT' && next === 'RIGHT') ||
        (cur === 'RIGHT' && next === 'LEFT');
      if (opposite) return;
      dirRef.current = next; // read by the loop through the ref — no interval restart
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedGame]);

  /* ─── 2. Tic-Tac-Toe vs a REAL minimax AI ────────────────────────────── */
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [tttWinner, setTttWinner] = useState<Cell>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [tttRecord, setTttRecord] = useState({ win: 0, loss: 0, draw: 0 });
  const tttTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTttTimer = (): void => {
    if (tttTimerRef.current !== null) {
      clearTimeout(tttTimerRef.current);
      tttTimerRef.current = null;
    }
  };

  const finishTTT = (result: Cell): void => {
    setTttWinner(result);
    setAiThinking(false);
    setTttRecord(r =>
      result === 'X' ? { ...r, win: r.win + 1 } : result === 'O' ? { ...r, loss: r.loss + 1 } : { ...r, draw: r.draw + 1 },
    );
    if (result === 'X') recordBest('ttt', bestRef.current.ttt + 1, 'high');
  };

  const resetTTT = (): void => {
    clearTttTimer();
    setBoard(Array(9).fill(null));
    setTttWinner(null);
    setAiThinking(false);
  };

  const handleTTTClick = (i: number): void => {
    if (board[i] || tttWinner || aiThinking) return;

    const afterHuman: Cell[] = [...board];
    afterHuman[i] = 'X';
    setBoard(afterHuman);

    const humanResult = evaluateBoard(afterHuman);
    if (humanResult) {
      finishTTT(humanResult);
      return;
    }

    // AI turn — perfect play, answered after a short beat so it reads as "thinking"
    setAiThinking(true);
    clearTttTimer();
    tttTimerRef.current = setTimeout(() => {
      tttTimerRef.current = null;
      const afterAi: Cell[] = [...afterHuman];
      const move = findBestOMove(afterAi);
      if (move >= 0) afterAi[move] = 'O';
      setBoard(afterAi);
      const aiResult = evaluateBoard(afterAi);
      if (aiResult) finishTTT(aiResult);
      else setAiThinking(false);
    }, 320);
  };

  /* ─── 3. Reaction Speed Test (no alert() — results render inline) ────── */
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'ready' | 'tooearly' | 'result'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [reactionTries, setReactionTries] = useState(0);
  const startTimeRef = useRef(0);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearReactionTimer = (): void => {
    if (reactionTimerRef.current !== null) {
      clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
  };

  const startReactionTest = (): void => {
    clearReactionTimer();
    setReactionTime(null);
    setReactionState('waiting');
    reactionTimerRef.current = setTimeout(() => {
      reactionTimerRef.current = null;
      startTimeRef.current = Date.now();
      setReactionState('ready');
    }, 2000 + Math.random() * 2000); // random 2–4 s arm delay
  };

  const resetReaction = (): void => {
    clearReactionTimer();
    setReactionState('idle');
    setReactionTime(null);
    setReactionTries(0);
  };

  const handleReactionClick = (): void => {
    if (reactionState === 'idle' || reactionState === 'tooearly' || reactionState === 'result') {
      startReactionTest();
      return;
    }
    if (reactionState === 'waiting') {
      clearReactionTimer();
      setReactionState('tooearly'); // clicked before the panel went green
      return;
    }
    // ready → measure
    const diff = Date.now() - startTimeRef.current;
    setReactionTime(diff);
    setReactionTries(t => t + 1);
    setReactionState('result');
    recordBest('reaction', diff, 'low');
  };

  // clear pending timers if the window is closed / the component unmounts
  useEffect(() => {
    return () => {
      clearReactionTimer();
      if (tttTimerRef.current !== null) clearTimeout(tttTimerRef.current);
    };
  }, []);

  /* ─── 4. Typing Speed Test (live WPM, accuracy & error tracking) ─────── */
  const targetText =
    'DevOps engineering requires automation, continuous integration, and clean cloud architecture.';
  const [typedInput, setTypedInput] = useState('');
  const [typingStarted, setTypingStarted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalWpm, setFinalWpm] = useState<number | null>(null);
  const [keystrokes, setKeystrokes] = useState({ total: 0, wrong: 0 });
  const typingStartRef = useRef<number | null>(null);

  // clock is set exactly once, on the first keystroke, and ticks live from there
  useEffect(() => {
    if (!typingStarted || finalWpm !== null) return;
    const id = setInterval(() => {
      const start = typingStartRef.current;
      if (start !== null) setElapsedMs(Date.now() - start);
    }, 100);
    return () => clearInterval(id);
  }, [typingStarted, finalWpm]);

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    if (finalWpm !== null) return; // input is locked while the result is shown

    if (val === '') {
      typingStartRef.current = null;
      setTypingStarted(false);
      setElapsedMs(0);
      setTypedInput('');
      setKeystrokes({ total: 0, wrong: 0 });
      return;
    }

    let start = typingStartRef.current;
    if (start === null) {
      start = Date.now(); // first keystroke starts the clock — once
      typingStartRef.current = start;
      setTypingStarted(true);
      setElapsedMs(0);
    }

    // count every character typed and how many of them mismatched the target
    const prevLen = typedInput.length;
    if (val.length > prevLen) {
      setKeystrokes(k => {
        let { total, wrong } = k;
        for (let i = prevLen; i < val.length; i++) {
          total += 1;
          if (val[i] !== targetText[i]) wrong += 1;
        }
        return { total, wrong };
      });
    }

    setTypedInput(val);

    if (val === targetText) {
      const ms = Math.max(Date.now() - start, 500);
      const wpm = Math.round(targetText.length / 5 / (ms / 60000)); // 5 chars = 1 word
      setElapsedMs(ms);
      setFinalWpm(wpm);
      recordBest('typing', wpm, 'high');
    }
  };

  const resetTyping = (): void => {
    typingStartRef.current = null;
    setTypingStarted(false);
    setElapsedMs(0);
    setTypedInput('');
    setFinalWpm(null);
    setKeystrokes({ total: 0, wrong: 0 });
  };

  const accuracy =
    keystrokes.total === 0 ? 100 : Math.round(((keystrokes.total - keystrokes.wrong) / keystrokes.total) * 100);
  const liveWpm =
    elapsedMs > 0 && typedInput.length > 0 ? Math.round(typedInput.length / 5 / (elapsedMs / 60000)) : 0;

  /* ─── 5. Memory Emoji Cards Match ────────────────────────────────────── */
  const EMOJI_ITEMS = ['🚀', '⚡', '🎮', '💻', '🤖', '🌐'];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  const initMemoryGame = (): void => {
    const deck = [...EMOJI_ITEMS, ...EMOJI_ITEMS];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    setCards(deck.map((emoji, idx) => ({ id: idx, emoji, flipped: false, matched: false })));
    setFlippedCards([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  const handleCardClick = (idx: number): void => {
    if (flippedCards.length === 2 || cards[idx].flipped || cards[idx].matched) return;

    const newCards = cards.map(c => ({ ...c }));
    newCards[idx].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const moves = memoryMoves + 1;
      setMemoryMoves(moves);
      const [firstIdx, secondIdx] = newFlipped;
      if (newCards[firstIdx].emoji === newCards[secondIdx].emoji) {
        newCards[firstIdx].matched = true;
        newCards[secondIdx].matched = true;
        setCards(newCards);
        setFlippedCards([]);
        if (newCards.every(c => c.matched)) {
          setMemoryWon(true);
          recordBest('memory', moves, 'low'); // fewest moves wins
        }
      } else {
        setTimeout(() => {
          const back = newCards.map(c => ({ ...c }));
          back[firstIdx].flipped = false;
          back[secondIdx].flipped = false;
          setCards(back);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  /* ─── Every game boots into a clean, fresh state when opened ─────────── */
  useEffect(() => {
    if (selectedGame === 'snake') resetSnake();
    else if (selectedGame === 'ttt') resetTTT();
    else if (selectedGame === 'reaction') resetReaction();
    else if (selectedGame === 'typing') resetTyping();
    else if (selectedGame === 'memory') initMemoryGame();
  }, [selectedGame]);

  const reactionVerdict =
    reactionState === 'result' && reactionTime !== null ? reactionRating(reactionTime) : null;

  const gamesList = [
    { id: 'snake' as const, name: '🐍 Cyber Snake', desc: 'Classic arcade snake. Arrow keys to steer!', icon: '🐍', stat: `BEST: ${bestLabel(best.snake, 'pts')}` },
    { id: 'ttt' as const, name: '❌ Tic-Tac-Toe AI', desc: 'Play a true Minimax + alpha-beta AI engine.', icon: '⭕', stat: `ALL-TIME WINS VS AI: ${best.ttt}` },
    { id: 'memory' as const, name: '🎴 Memory Card Match', desc: 'Flip and match pairs of emojis in min moves!', icon: '🎴', stat: `BEST: ${bestLabel(best.memory, 'moves')}` },
    { id: 'reaction' as const, name: '⚡ Reaction Speed', desc: 'Test your nerve reaction speed in ms.', icon: '⚡', stat: `BEST: ${bestLabel(best.reaction, 'ms')}` },
    { id: 'typing' as const, name: '⌨️ Typing Speed Test', desc: 'Live WPM, accuracy and error tracking.', icon: '⌨️', stat: `BEST: ${bestLabel(best.typing, 'WPM')}` },
  ];

  const statCell = (label: string, value: string, accent?: boolean) => (
    <div key={label} style={{ flex: 1, padding: '6px 4px', border: '1px solid #222', borderRadius: 6, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
      <div style={{ fontSize: 8, color: '#777', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: accent ? 'var(--accent)' : '#fff' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, fontFamily: 'var(--font-mono)', background: '#0a0d14', color: '#fff', overflowY: 'auto' }}>
      {selectedGame && (
        <button onClick={() => setSelectedGame(null)} style={{ alignSelf: 'flex-start', padding: '6px 12px', border: '1px solid #333', background: '#111', color: 'var(--accent)', borderRadius: 6, cursor: 'pointer', marginBottom: 16, fontSize: 11 }}>
          ← Back to Games Menu
        </button>
      )}

      {/* ── Game 1: Cyber Snake ── */}
      {selectedGame === 'snake' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
            CYBER SNAKE — SCORE: {score} <span style={{ color: '#777' }}>· BEST: {bestLabel(best.snake, 'pts')}</span>
          </div>
          <div style={{ width: 300, height: 300, display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', border: '2px solid var(--accent)', background: '#000', borderRadius: 8 }}>
            {Array.from({ length: GRID * GRID }).map((_, i) => {
              const x = i % GRID;
              const y = Math.floor(i / GRID);
              const isSnake = snake.some(s => s.x === x && s.y === y);
              const isHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;
              return (
                <div key={i} style={{ background: isSnake ? (isHead ? '#9CFF00' : 'var(--accent)') : isFood ? '#FF3E6C' : 'transparent', borderRadius: isFood ? '50%' : 2 }} />
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: '#666' }}>↑ ↓ ← → to steer · eat the pink orb · +10 pts each</div>
          {gameOver && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ color: '#FF4444', fontWeight: 'bold', fontSize: 16 }}>GAME OVER</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Final score: {score} · Best: {bestLabel(best.snake, 'pts')}</div>
              <button onClick={resetSnake} style={{ padding: '6px 16px', marginTop: 8, background: 'var(--accent)', border: 'none', color: '#000', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Game 2: Tic-Tac-Toe vs minimax AI ── */}
      {selectedGame === 'ttt' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 6 }}>TIC-TAC-TOE VS MINIMAX AI</div>
          <div style={{ fontSize: 10, color: '#888', textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
            You are <span style={{ color: 'var(--accent)' }}>❌ X</span> · AI is <span style={{ color: '#FF3E6C' }}>⭕ O</span><br />
            Difficulty: <span style={{ color: 'var(--accent)' }}>PERFECT — full minimax search with alpha-beta pruning</span><br />
            The AI never loses: <span style={{ color: '#FFD166' }}>a draw is the best result a human can reach.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: 240 }}>
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleTTTClick(idx)}
                disabled={cell !== null || tttWinner !== null || aiThinking}
                style={{
                  width: 72, height: 72, border: '1px solid #333',
                  background: cell === null ? '#111' : 'rgba(var(--accent-rgb),0.08)',
                  color: cell === 'X' ? 'var(--accent)' : '#FF3E6C',
                  fontSize: 28, fontWeight: 'bold', borderRadius: 8,
                  cursor: cell === null && !tttWinner && !aiThinking ? 'pointer' : 'not-allowed',
                  opacity: cell !== null ? 0.9 : aiThinking ? 0.5 : 1,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {cell}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: '#777' }}>
            SESSION — {tttRecord.win}W · {tttRecord.loss}L · {tttRecord.draw}D
            {aiThinking && <span style={{ color: 'var(--accent)' }}> · AI calculating…</span>}
          </div>
          {tttWinner && (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: tttWinner === 'Draw' ? '#FFD166' : tttWinner === 'X' ? 'var(--accent)' : '#FF3E6C' }}>
                {tttWinner === 'Draw' ? "IT'S A DRAW — you held off a perfect AI 🤝" : tttWinner === 'X' ? 'YOU BEAT THE MINIMAX AI! 🎉' : 'AI WINS (⭕) — try a different opening'}
              </div>
              <button onClick={resetTTT} style={{ padding: '6px 14px', marginTop: 10, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Game 3: Memory Cards Match ── */}
      {selectedGame === 'memory' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
            MEMORY CARD MATCH — MOVES: {memoryMoves} <span style={{ color: '#777' }}>· BEST: {bestLabel(best.memory, 'moves')}</span>
          </div>
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
            <div style={{ marginTop: 16, color: 'var(--accent)', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              🎉 YOU MATCHED ALL CARDS IN {memoryMoves} MOVES!
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, fontWeight: 'normal' }}>
                Best: {bestLabel(best.memory, 'moves')}
              </div>
              <button onClick={initMemoryGame} style={{ padding: '6px 14px', marginTop: 8, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Game 4: Reaction Speed ── */}
      {selectedGame === 'reaction' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 4 }}>REACTION TIME TEST</div>
          <div style={{ fontSize: 10, color: '#777', marginBottom: 12, textAlign: 'center' }}>
            Random 2–4 s arm delay · Human average ≈ 250 ms · BEST: {bestLabel(best.reaction, 'ms')}
          </div>
          <div
            onClick={handleReactionClick}
            style={{
              width: 320, height: 200, borderRadius: 10, cursor: 'pointer', userSelect: 'none',
              background: reactionState === 'waiting' ? '#CE2029'
                : reactionState === 'ready' ? '#00FF88'
                : reactionState === 'tooearly' ? '#8B1A1A'
                : '#0a0a0a',
              border: '2px solid var(--accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: reactionState === 'ready' ? '#000' : '#fff', transition: 'background 0.1s',
            }}
          >
            {reactionState === 'idle' && <span>Click the panel to START</span>}
            {reactionState === 'waiting' && <span>Wait for GREEN...</span>}
            {reactionState === 'ready' && <span style={{ fontWeight: 'bold', fontSize: 20 }}>CLICK NOW!</span>}
            {reactionState === 'tooearly' && <span style={{ fontWeight: 'bold', fontSize: 18 }}>TOO EARLY!</span>}
            {reactionState === 'result' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 'bold', color: 'var(--accent)' }}>{reactionTime} ms</div>
                <div style={{ fontSize: 11, color: '#ccc', marginTop: 6 }}>Click to try again</div>
              </div>
            )}
          </div>

          {/* in-UI result panel — replaces the old blocking alert() */}
          {reactionVerdict && reactionTime !== null && (
            <div style={{ marginTop: 12, width: 320, padding: '10px 12px', border: `1px solid ${reactionVerdict.color}`, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: reactionVerdict.color }}>
                {reactionTime} ms — {reactionVerdict.label}
              </div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 6, lineHeight: 1.6 }}>
                Human average ≈ 250 ms · Your best: {bestLabel(best.reaction, 'ms')} · Attempt #{reactionTries}
              </div>
            </div>
          )}
          {reactionState === 'tooearly' && (
            <div style={{ marginTop: 12, width: 320, padding: '10px 12px', border: '1px solid #FF4444', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#FF6B6B' }}>Clicked before the panel went green.</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 6, lineHeight: 1.6 }}>
                No time recorded — the delay is random (2–4 s), so watch for the green flash. Click the panel to retry.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Game 5: Typing Speed ── */}
      {selectedGame === 'typing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 460, width: '100%', margin: '0 auto' }}>
          <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 12 }}>
            TYPING SPEED TEST <span style={{ color: '#777', fontSize: 11 }}>· BEST: {bestLabel(best.typing, 'WPM')}</span>
          </div>

          <div style={{ padding: 12, border: '1px solid #333', borderRadius: 6, background: '#0a0a0a', marginBottom: 14, lineHeight: 1.6, width: '100%', whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {targetText.split('').map((ch, i) => {
              const typed = typedInput[i];
              const isPending = typed === undefined;
              const correct = typed === ch;
              return (
                <span
                  key={i}
                  style={{
                    color: isPending ? '#4b5563' : correct ? 'var(--accent)' : '#FF3E6C',
                    background: i === typedInput.length && finalWpm === null ? 'rgba(var(--accent-rgb),0.35)' : 'transparent',
                    textDecoration: !isPending && !correct ? 'underline wavy #FF3E6C' : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>

          <input
            type="text"
            value={typedInput}
            onChange={handleTypingChange}
            disabled={finalWpm !== null}
            maxLength={targetText.length}
            placeholder="Type the text above — the clock starts on your first keystroke..."
            style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid var(--accent)', color: '#fff', borderRadius: 6, outline: 'none', fontFamily: 'var(--font-mono)', opacity: finalWpm !== null ? 0.5 : 1 }}
          />

          <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 12 }}>
            {statCell('WPM', String(finalWpm ?? liveWpm), true)}
            {statCell('ACCURACY', `${accuracy}%`)}
            {statCell('MISTAKES', String(keystrokes.wrong))}
            {statCell('TIME', `${(elapsedMs / 1000).toFixed(1)}s`)}
          </div>

          {finalWpm !== null && (
            <div style={{ marginTop: 14, width: '100%', padding: '12px 14px', border: '1px solid var(--accent)', borderRadius: 8, background: 'rgba(var(--accent-rgb),0.08)', textAlign: 'center' }}>
              <div style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 'bold' }}>⚡ {finalWpm} WPM</div>
              <div style={{ color: '#aaa', fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
                Finished in {(elapsedMs / 1000).toFixed(1)}s · accuracy {accuracy}% · {keystrokes.wrong} mistakes
                <br />Best: {bestLabel(best.typing, 'WPM')}
              </div>
              <button onClick={resetTyping} style={{ padding: '6px 16px', marginTop: 10, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                Try Again
              </button>
            </div>
          )}
          {finalWpm === null && (typingStarted || typedInput.length > 0) && (
            <button onClick={resetTyping} style={{ marginTop: 12, padding: '6px 14px', background: '#111', color: 'var(--accent)', border: '1px solid #333', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
              Reset
            </button>
          )}
        </div>
      )}

      {/* ── Arcade Games Menu ── */}
      {!selectedGame && (
        <div>
          <div style={{ color: 'var(--accent)', fontSize: 15, marginBottom: 16, fontFamily: 'var(--font-title)' }}>SUDHI OS ARCADE (5 REAL GAMES)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {gamesList.map(game => (
              <div key={game.id} onClick={() => setSelectedGame(game.id)} style={{ padding: 16, border: '1px solid #222', borderRadius: 8, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: 'rgba(var(--accent-rgb),0.03)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>{game.icon}</div>
                <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>{game.name}</div>
                <div style={{ color: '#666', fontSize: 9 }}>{game.desc}</div>
                <div style={{ color: '#888', fontSize: 9, marginTop: 8, paddingTop: 8, borderTop: '1px solid #1c1c1c' }}>{game.stat}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
export default GamesWindow;

import React, {
  useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, memo
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  THEMES, SKILLS, PROJECTS, BOOT_MESSAGES, DESKTOP_ICONS, ASCII_LOGO,
  loadAllData, ProjectData, AboutData, TerminalData
} from './data';

// ─── Types ───────────────────────────────────────────────────────────────────
type ThemeKey = 'green' | 'blue' | 'amber' | 'purple';
type PowerState = 'booting' | 'running' | 'sleeping' | 'shutdown';
type WinId = 'terminal' | 'about' | 'skills' | 'projects' | 'contact' | 'settings' | string;

interface WinState {
  id: WinId;
  title: string;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  size: { w: number; h: number };
  zIndex: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface LoadedJsonData {
  projects: ProjectData[];
  about: AboutData | null;
  terminal: TerminalData | null;
}

interface OSContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  matrixOn: boolean;
  toggleMatrix: () => void;
  windows: WinState[];
  openWindow: (id: WinId) => void;
  closeWindow: (id: WinId) => void;
  minimizeWindow: (id: WinId) => void;
  maximizeWindow: (id: WinId) => void;
  focusWindow: (id: WinId) => void;
  updateWindowPos: (id: WinId, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: WinId, size: { w: number; h: number }) => void;
  powerState: PowerState;
  setPowerState: (s: PowerState) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
  startupTime: number;
  visitorCount: number;
  konamiActive: boolean;
  jsonData: LoadedJsonData;
}

const OSContext = createContext<OSContextType>(null!);
const useOS = () => useContext(OSContext);

// ─── Window Defaults ─────────────────────────────────────────────────────────
const WIN_DEFAULTS: Record<string, { title: string; position: { x: number; y: number }; size: { w: number; h: number } }> = {
  terminal: { title: '>_ TERMINAL.cmd', position: { x: 60, y: 60 },   size: { w: 680, h: 480 } },
  about:    { title: '👤 ABOUT.exe',    position: { x: 180, y: 80 },  size: { w: 580, h: 500 } },
  skills:   { title: '⚡ SKILLS.sh',    position: { x: 300, y: 100 }, size: { w: 600, h: 520 } },
  projects: { title: '📁 PROJECTS/',    position: { x: 80, y: 40 },   size: { w: 720, h: 540 } },
  contact:  { title: '✉ CONTACT.mail', position: { x: 400, y: 120 }, size: { w: 560, h: 480 } },
  settings: { title: '⚙ SETTINGS.cfg', position: { x: 250, y: 150 }, size: { w: 420, h: 380 } },
  'file-explorer': { title: '📂 EXPLORER.exe', position: { x: 100, y: 80 }, size: { w: 800, h: 600 } },
  'music-player': { title: '🎵 MUSIC.mp3', position: { x: 200, y: 100 }, size: { w: 600, h: 500 } },
  browser: { title: '🌍 BROWSER.net', position: { x: 150, y: 60 }, size: { w: 900, h: 650 } },
  paint: { title: '🎨 PAINT.art', position: { x: 120, y: 90 }, size: { w: 850, h: 600 } },
  email: { title: '📧 EMAIL.inbox', position: { x: 180, y: 70 }, size: { w: 750, h: 550 } },
  calendar: { title: '📅 CALENDAR.app', position: { x: 220, y: 110 }, size: { w: 700, h: 600 } },
  games: { title: '🎮 GAMES.exe', position: { x: 240, y: 90 }, size: { w: 600, h: 650 } },
  notepad: { title: '📋 NOTEPAD.txt', position: { x: 160, y: 100 }, size: { w: 550, h: 450 } },
};

// ─── Utility ─────────────────────────────────────────────────────────────────
let zCounter = 10;
const nextZ = () => ++zCounter;

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function makeBar(pct: number, width = 20) {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ─── Matrix Rain Canvas ───────────────────────────────────────────────────────
const MatrixRain = memo(({ active, accent }: { active: boolean; accent: string }) => {
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

// ─── Toast System ─────────────────────────────────────────────────────────────
const ToastItem = memo(({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onRemove, 3000);
    return () => clearTimeout(t);
  }, [onRemove]);

  const colors: Record<Toast['type'], string> = {
    success: '#00FF88',
    error: '#FF4444',
    info: 'var(--accent)',
  };

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: '#0a0a0a',
        border: `1px solid ${colors[toast.type]}`,
        boxShadow: `0 0 12px ${colors[toast.type]}44`,
        borderRadius: 4,
        padding: '10px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: colors[toast.type],
        pointerEvents: 'auto',
        cursor: 'pointer',
        minWidth: 240,
        maxWidth: 320,
      }}
      onClick={onRemove}
    >
      {toast.type === 'success' ? '✓ ' : toast.type === 'error' ? '✗ ' : 'ℹ '}{toast.message}
    </motion.div>
  );
});

const ToastContainer = memo(({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => (
  <div className="toast-container">
    <AnimatePresence>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </AnimatePresence>
  </div>
));

// ─── Boot Screen ──────────────────────────────────────────────────────────────
const BootScreen = memo(({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_MESSAGES.length) {
        const { tag, msg } = BOOT_MESSAGES[i];
        setLines(prev => [...prev, `${tag.padEnd(10)} ${msg}`]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => { setDone(true); setTimeout(onComplete, 600); }, 400);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="boot-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', padding: 32 }}
    >
      <pre style={{ fontSize: 11, lineHeight: 1.3, marginBottom: 32, textAlign: 'center', color: 'var(--accent)' }}>
        {ASCII_LOGO}
      </pre>
      <div style={{ maxWidth: 600, width: '100%' }}>
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            style={{ fontSize: 13, lineHeight: 1.8, color: l.startsWith('[OK]') ? 'var(--accent)' : l.startsWith('[READY]') ? '#fff' : '#aaa' }}
          >
            {l}
          </motion.div>
        ))}
        {lines.length > 0 && <span className="blink" style={{ color: 'var(--accent)' }}>█</span>}
      </div>
    </motion.div>
  );
});

// ─── Draggable / Resizable Window ─────────────────────────────────────────────
interface WindowFrameProps {
  win: WinState;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (pos: { x: number; y: number }) => void;
  onResize: (size: { w: number; h: number }) => void;
  isActive: boolean;
}

const WindowFrame = memo(({
  win, children, onClose, onMinimize, onMaximize, onFocus, onMove, onResize, isActive
}: WindowFrameProps) => {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{
    startX: number; startY: number;
    origX: number; origY: number;
    origW: number; origH: number;
    direction: string;
  } | null>(null);

  // Double-click titlebar to maximize
  const handleTitleDoubleClick = useCallback(() => {
    if (!win.maximized) onMaximize();
    else onMaximize(); // Will toggle back
  }, [win.maximized, onMaximize]);

  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (win.maximized) return;
    if (e.detail === 2) {
      handleTitleDoubleClick();
      return;
    }
    e.preventDefault();
    onFocus();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: win.position.x, origY: win.position.y };
    const move = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      let x = dragRef.current.origX + ev.clientX - dragRef.current.startX;
      let y = dragRef.current.origY + ev.clientY - dragRef.current.startY;

      // Snap to edges
      if (x < 20) x = 0;
      if (y < 20) y = 0;
      if (x > window.innerWidth - win.size.w - 20) x = window.innerWidth - win.size.w;

      onMove({ x: Math.max(0, x), y: Math.max(0, y) });
    };
    const up = () => { dragRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [win.maximized, win.size, onFocus, onMove, handleTitleDoubleClick]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    resizeRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX: win.position.x, origY: win.position.y,
      origW: win.size.w, origH: win.size.h,
      direction
    };

    const move = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;

      let newX = resizeRef.current.origX;
      let newY = resizeRef.current.origY;
      let newW = resizeRef.current.origW;
      let newH = resizeRef.current.origH;

      switch (resizeRef.current.direction) {
        case 'se': // Bottom Right
          newW = Math.max(320, resizeRef.current.origW + dx);
          newH = Math.max(240, resizeRef.current.origH + dy);
          break;
        case 'sw': // Bottom Left
          newW = Math.max(320, resizeRef.current.origW - dx);
          newH = Math.max(240, resizeRef.current.origH + dy);
          newX = resizeRef.current.origX + dx;
          break;
        case 'ne': // Top Right
          newW = Math.max(320, resizeRef.current.origW + dx);
          newH = Math.max(240, resizeRef.current.origH - dy);
          newY = resizeRef.current.origY + dy;
          break;
        case 'nw': // Top Left
          newW = Math.max(320, resizeRef.current.origW - dx);
          newH = Math.max(240, resizeRef.current.origH - dy);
          newX = resizeRef.current.origX + dx;
          newY = resizeRef.current.origY + dy;
          break;
        case 'n': // Top
          newH = Math.max(240, resizeRef.current.origH - dy);
          newY = resizeRef.current.origY + dy;
          break;
        case 's': // Bottom
          newH = Math.max(240, resizeRef.current.origH + dy);
          break;
        case 'e': // Right
          newW = Math.max(320, resizeRef.current.origW + dx);
          break;
        case 'w': // Left
          newW = Math.max(320, resizeRef.current.origW - dx);
          newX = resizeRef.current.origX + dx;
          break;
      }

      onResize({ w: newW, h: newH });
      if (newX !== resizeRef.current.origX || newY !== resizeRef.current.origY) {
        onMove({ x: Math.max(0, newX), y: Math.max(0, newY) });
      }
    };

    const up = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [win.position, win.size, onFocus, onMove, onResize]);

  const style: React.CSSProperties = win.maximized
    ? { position: 'fixed', inset: 0, bottom: 48, width: '100vw', height: 'calc(100vh - 48px)', zIndex: win.zIndex }
    : {
      position: 'fixed',
      left: win.position.x,
      top: win.position.y,
      width: win.size.w,
      height: win.size.h,
      zIndex: win.zIndex,
    };

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      style={{
        ...style,
        background: '#050505',
        border: `1px solid ${isActive ? 'var(--accent)' : '#333'}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: isActive
          ? '0 0 20px var(--accent), 0 0 40px rgba(var(--accent-rgb),0.3)'
          : '0 4px 20px rgba(0,0,0,0.8)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        style={{
          background: '#0a0a0a',
          borderBottom: `1px solid ${isActive ? 'var(--accent)' : '#222'}`,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: win.maximized ? 'default' : 'move',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {/* Window control buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF5F57', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close"
          >
            <span style={{ color: '#000', fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>×</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            style={{ width: 14, height: 14, borderRadius: '50%', background: '#FEBC2E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Minimize"
          >
            <span style={{ color: '#000', fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>−</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            style={{ width: 14, height: 14, borderRadius: '50%', background: '#28C840', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Maximize"
          >
            <span style={{ color: '#000', fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>□</span>
          </button>
        </div>
        <span style={{
          flex: 1, textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 11,
          color: isActive ? 'var(--accent)' : '#666', letterSpacing: 2, textTransform: 'uppercase',
          marginRight: 36,
        }}>
          {win.title}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>

      {/* Multi-directional Resize Handles - Full Windows-style resizing */}
      {!win.maximized && (
        <>
          {/* Corners */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            style={{
              position: 'absolute', left: -4, top: -4, width: 12, height: 12,
              cursor: 'nwse-resize', zIndex: 100
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            style={{
              position: 'absolute', right: -4, top: -4, width: 12, height: 12,
              cursor: 'nesw-resize', zIndex: 100
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            style={{
              position: 'absolute', left: -4, bottom: -4, width: 12, height: 12,
              cursor: 'nesw-resize', zIndex: 100
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            style={{
              position: 'absolute', right: -4, bottom: -4, width: 16, height: 16,
              cursor: 'nwse-resize', zIndex: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px'
            }}
          />

          {/* Edges */}
          {/* Top */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            style={{
              position: 'absolute', left: 12, right: 12, top: -4, height: 8,
              cursor: 'ns-resize', zIndex: 99
            }}
          />
          {/* Bottom */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            style={{
              position: 'absolute', left: 12, right: 12, bottom: -4, height: 8,
              cursor: 'ns-resize', zIndex: 99
            }}
          />
          {/* Left */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            style={{
              position: 'absolute', left: -4, top: 12, bottom: 12, width: 8,
              cursor: 'ew-resize', zIndex: 99
            }}
          />
          {/* Right */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            style={{
              position: 'absolute', right: -4, top: 12, bottom: 12, width: 8,
              cursor: 'ew-resize', zIndex: 99
            }}
          />
        </>
      )}
    </motion.div>
  );
});

// ─── Terminal Window ──────────────────────────────────────────────────────────
const TerminalWindow = memo(() => {
  const { openWindow, closeWindow, minimizeWindow, toggleMatrix, matrixOn, setTheme, theme, setPowerState, addToast, startupTime, jsonData } = useOS();
  const [history, setHistory] = useState<{ input: string; output: React.ReactNode }[]>([
    { input: '', output: <span style={{ color: 'var(--accent)' }}>Type "help" for available commands.</span> }
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [history]);

  const accent = (s: string) => <span style={{ color: 'var(--accent)' }}>{s}</span>;
  const dim = (s: string) => <span style={{ color: '#666' }}>{s}</span>;
  const white = (s: string) => <span style={{ color: '#fff' }}>{s}</span>;

  const execCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const parts = trimmed.split(' ');
    const base = parts[0].toLowerCase();
    const args = parts.slice(1);

    setCmdHistory(prev => [trimmed, ...prev.slice(0, 49)]);
    setHistIdx(-1);

    let output: React.ReactNode = <span style={{ color: '#FF4444' }}>command not found: {trimmed}</span>;

    if (base === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (base === 'help') {
      const customCmds = jsonData.terminal?.customCommands || [];
      output = (
        <div>
          <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', marginBottom: 8 }}>
            ┌─────────────────────────────────────────┐<br />
            │           AVAILABLE COMMANDS            │<br />
            └─────────────────────────────────────────┘
          </div>
          {[
            ['help', 'Show this help message'],
            ['about', 'Display personal information'],
            ['skills', 'List all skills with progress bars'],
            ['projects', 'List all projects'],
            ['contact', 'Show contact information'],
            ['clear', 'Clear terminal'],
            ['clearall', 'Clear everything including history'],
            ['matrix on/off', 'Toggle matrix rain'],
            ['theme [name]', 'Switch theme: green/blue/amber/purple'],
            ['neofetch', 'System information panel'],
            ['date', 'Show current date/time'],
            ['time', 'Show just the current time'],
            ['whoami', 'Display current user'],
            ['ls', 'List desktop items'],
            ['pwd', 'Print working directory'],
            ['echo [msg]', 'Print a message'],
            ['history', 'Show command history'],
            ['battery', 'Show battery status'],
            ['wifi', 'Show wifi status'],
            ['uptime', 'Show system uptime'],
            ['calc [expr]', 'Simple calculator (e.g: calc 12*8)'],
            ['screenshot', 'Take a fake screenshot'],
            ['open [app]', 'Open an application'],
            ['minimize [app]', 'Minimize a window'],
            ['close [app]', 'Close a window'],
            ['version', 'Show OS version'],
            ['restart', 'Restart the system'],
            ['shutdown', 'Shutdown the system'],
            ['sleep', 'Enter sleep mode'],
            ['hack', 'Initiate hack sequence'],
            ['coffee', 'Get some coffee'],
            ['konami', 'Secret command'],
          ].map(([cmd, desc]) => (
            <div key={cmd}>{accent(`  ${cmd.padEnd(20)}`)} {dim('- ')}{white(desc)}</div>
          ))}
          {customCmds.length > 0 && (
            <>
              <br />
              <div style={{ color: 'var(--accent)', marginBottom: 4 }}>── CUSTOM COMMANDS (from terminal.json) ──</div>
              {customCmds.map(c => (
                <div key={c.command}>{accent(`  ${c.command.padEnd(20)}`)} {dim('- ')}{white(c.description)}</div>
              ))}
            </>
          )}
          <div style={{ marginTop: 8, color: '#666' }}>
            SHORTCUTS: Alt+T Terminal | Alt+A About | Alt+P Projects | Alt+S Skills | Alt+C Contact | Alt+M Matrix | F Fullscreen
          </div>
        </div>
      );
    } else if (base === 'about') {
      output = (
        <div>
          {accent('╔══════════════════════════════════╗')}<br />
          {accent('║        SUDHI — ABOUT.exe          ║')}<br />
          {accent('╚══════════════════════════════════╝')}<br />
          <br />
          {white('Name:     ')}{accent('Sudhi')}<br />
          {white('Role:     ')}{accent('Full Stack Developer')}<br />
          {white('Location: ')}{accent('India 🇮🇳')}<br />
          {white('Status:   ')}<span style={{ color: '#00FF88' }}>● Available for Work</span><br />
          <br />
          {white('Bio:')}<br />
          <span style={{ color: '#ccc' }}>  Passionate developer crafting high-performance digital experiences.</span><br />
          <span style={{ color: '#ccc' }}>  Specializing in full-stack development, system design, and UI/UX.</span><br />
          <span style={{ color: '#ccc' }}>  Love building tools that developers actually enjoy using.</span><br />
          <br />
          {white('GitHub:   ')}{accent('github.com/sudhi')}<br />
          {white('LinkedIn: ')}{accent('linkedin.com/in/sudhi')}<br />
          {white('Email:    ')}{accent('sudhi@portfolio.os')}<br />
        </div>
      );
    } else if (base === 'skills') {
      output = (
        <div>
          {Object.entries(SKILLS).map(([cat, skills]) => (
            <div key={cat}>
              {accent(`─── ${cat} ─────────────────────────────────`)}<br />
              {skills.map(s => (
                <div key={s.name}>
                  {white(`  ${s.name.padEnd(14)}`)} [{accent(makeBar(s.pct))}] {accent(`${s.pct}%`)}
                </div>
              ))}
              <br />
            </div>
          ))}
        </div>
      );
    } else if (base === 'projects') {
      if (args[0] === '--open' && args[1]) {
        const n = parseInt(args[1]);
        const proj = PROJECTS.find(p => p.id === n);
        if (proj) {
          output = (
            <div>
              {accent(`╔══ ${proj.name} ══╗`)}<br />
              <br />
              {white('Description: ')}<span style={{ color: '#ccc' }}>{proj.desc}</span><br />
              <br />
              {white('Stack: ')}{proj.stack.map(s => accent(`[${s}] `))}<br />
              <br />
              {white('Live:  ')}{accent(proj.live)}<br />
              {white('Repo:  ')}{accent(proj.repo)}<br />
            </div>
          );
        } else output = <span style={{ color: '#FF4444' }}>Project #{n} not found</span>;
      } else {
        output = (
          <div>
            {accent('─── PROJECTS/ ──────────────────────────────────')}<br />
            {PROJECTS.map(p => (
              <div key={p.id}>
                {accent(`  [${p.id}]`)} {white(p.name.padEnd(22))} <span style={{ color: '#aaa' }}>{p.desc.slice(0, 50)}...</span>
              </div>
            ))}
            <br />
            <span style={{ color: '#666' }}>Use: projects --open [n] for details</span>
          </div>
        );
      }
    } else if (base === 'contact') {
      output = (
        <div>
          {accent('─── CONTACT ──────────────────────────────────')}<br />
          <br />
          {white('Email:    ')}{accent('sudhi@portfolio.os')}<br />
          {white('GitHub:   ')}{accent('github.com/sudhi')}<br />
          {white('LinkedIn: ')}{accent('linkedin.com/in/sudhi')}<br />
          {white('Twitter:  ')}{accent('@sudhidev')}<br />
          <br />
          <span style={{ color: '#666' }}>Open CONTACT.mail for the interactive form.</span>
        </div>
      );
    } else if (base === 'matrix') {
      const action = args[0]?.toLowerCase();
      if (action === 'on') {
        if (!matrixOn) toggleMatrix();
        addToast('Matrix Rain: ON', 'success');
        output = accent('Matrix Rain: ENABLED ✓');
      } else if (action === 'off') {
        if (matrixOn) toggleMatrix();
        addToast('Matrix Rain: OFF', 'info');
        output = accent('Matrix Rain: DISABLED ✗');
      } else {
        output = <span style={{ color: '#FF4444' }}>Usage: matrix on | matrix off</span>;
      }
    } else if (base === 'theme') {
      const t = args[0]?.toLowerCase() as ThemeKey;
      if (['green', 'blue', 'amber', 'purple'].includes(t)) {
        setTheme(t);
        addToast(`Theme Updated: ${THEMES[t].name}`, 'success');
        output = accent(`Theme switched to: ${THEMES[t].name}`);
      } else {
        output = (
          <div>
            {white('Current theme: ')}{accent(THEMES[theme].name)}<br />
            {white('Available: ')}<br />
            {Object.entries(THEMES).map(([k, v]) => (
              <div key={k}>{k === theme ? accent(`  ● ${k.padEnd(10)} — ${v.name}`) : dim(`  ○ ${k.padEnd(10)} — ${v.name}`)}</div>
            ))}
            <br />
            <span style={{ color: '#666' }}>Usage: theme [green|blue|amber|purple]</span>
          </div>
        );
      }
    } else if (base === 'neofetch') {
      addToast('System scan complete', 'success');
      const res = `${window.screen.width}x${window.screen.height}`;
      output = (
        <div style={{ display: 'flex', gap: 20 }}>
          <pre style={{ color: 'var(--accent)', fontSize: 11, lineHeight: 1.6 }}>{`       ████████
      ██      ██
     ██  ████  ██
     ██  ████  ██
      ██      ██
       ████████
      /        \\
     /  SUDHI   \\
    /    OS      \\
   /    v2.0      \\`}</pre>
          <div style={{ lineHeight: 1.8 }}>
            {accent('sudhi@portfolio')}<br />
            {dim('───────────────')}<br />
            {white('OS:         ')}{accent('SUDHI OS v2.0')}<br />
            {white('Host:       ')}{accent('Portfolio Machine')}<br />
            {white('Kernel:     ')}{accent('React 19.x')}<br />
            {white('Uptime:     ')}{accent(formatUptime(Date.now() - startupTime))}<br />
            {white('Packages:   ')}{accent('12 modules')}<br />
            {white('Shell:      ')}{accent('TERMINAL.cmd v2.0')}<br />
            {white('Resolution: ')}{accent(res)}<br />
            {white('Theme:      ')}{accent(THEMES[theme].name)}<br />
            {white('Icons:      ')}{accent('Lucide-React')}<br />
            {white('Terminal:   ')}{accent('Share Tech Mono')}<br />
            {white('CPU:        ')}{accent('Imagination × ∞')}<br />
            {white('GPU:        ')}{accent('Matrix Rain Engine')}<br />
            {white('Memory:     ')}{accent('████████░░ 4096MB')}<br />
          </div>
        </div>
      );
    } else if (base === 'date') {
      output = accent(new Date().toString());
    } else if (base === 'whoami') {
      output = accent('sudhi — Full Stack Developer');
    } else if (base === 'ls') {
      output = (
        <div>
          {['TERMINAL.cmd', 'ABOUT.exe', 'SKILLS.sh', 'PROJECTS/', 'CONTACT.mail', 'MATRIX.toggle', 'SETTINGS.cfg'].map(f => (
            <span key={f}>{accent(f)}{'  '}</span>
          ))}
        </div>
      );
    } else if (base === 'pwd') {
      output = accent('/home/sudhi/portfolio');
    } else if (base === 'echo') {
      output = <span style={{ color: '#fff' }}>{args.join(' ')}</span>;
    } else if (base === 'history') {
      output = (
        <div>
          {cmdHistory.slice(0, 20).map((c, i) => (
            <div key={i}>{dim(`  ${String(i + 1).padStart(3)}  `)}{white(c)}</div>
          ))}
          {cmdHistory.length === 0 && dim('  (empty)')}
        </div>
      );
    } else if (base === 'battery') {
      const pct = Math.floor(Math.random() * 40 + 50);
      output = (
        <div>
          {accent('─── BATTERY STATUS ──────────────────')}<br />
          {white('Level:   ')}{accent(`${pct}%`)}<br />
          {white('Status:  ')}{accent('Discharging')}<br />
          {white('Health:  ')}{accent('Good')}<br />
          {white('Type:    ')}{accent('Li-Polymer')}<br />
        </div>
      );
    } else if (base === 'wifi') {
      output = (
        <div>
          {accent('─── WIFI STATUS ─────────────────────')}<br />
          {white('SSID:    ')}{accent('SUDHI_NET')}<br />
          {white('Signal:  ')}{accent('████████░░ 80%')}<br />
          {white('IP:      ')}{accent('192.168.1.42')}<br />
          {white('Speed:   ')}{accent('↓ 250 Mbps  ↑ 100 Mbps')}<br />
        </div>
      );
    } else if (base === 'uptime') {
      output = accent(`System uptime: ${formatUptime(Date.now() - startupTime)}`);
    } else if (base === 'version') {
      output = (
        <div>
          {accent('SUDHI OS v2.0')}<br />
          {white('Build:   ')}{accent('2025.01')}<br />
          {white('React:   ')}{accent('19.x')}<br />
          {white('Engine:  ')}{accent('Vite 7.x + Tailwind 4.x')}<br />
          {white('Matrix:  ')}{accent('Canvas API v∞')}<br />
        </div>
      );
    } else if (base === 'open') {
      const app = args[0]?.toLowerCase();
      const appMap: Record<string, WinId> = { terminal: 'terminal', about: 'about', skills: 'skills', projects: 'projects', contact: 'contact' };
      if (appMap[app]) { openWindow(appMap[app]); output = accent(`Opening ${app}...`); }
      else output = <span style={{ color: '#FF4444' }}>Unknown app: {app}. Try: terminal, about, skills, projects, contact</span>;
    } else if (base === 'minimize') {
      const app = args[0]?.toLowerCase();
      const appMap: Record<string, WinId> = { terminal: 'terminal', about: 'about', skills: 'skills', projects: 'projects', contact: 'contact' };
      if (appMap[app]) { minimizeWindow(appMap[app]); output = accent(`Minimizing ${app}...`); }
      else output = <span style={{ color: '#FF4444' }}>Unknown app: {app}</span>;
    } else if (base === 'close') {
      const app = args[0]?.toLowerCase();
      const appMap: Record<string, WinId> = { terminal: 'terminal', about: 'about', skills: 'skills', projects: 'projects', contact: 'contact' };
      if (appMap[app]) { closeWindow(appMap[app]); output = accent(`Closing ${app}...`); }
      else output = <span style={{ color: '#FF4444' }}>Unknown app: {app}</span>;
    } else if (base === 'restart') {
      output = accent('Restarting system...');
      setTimeout(() => setPowerState('booting'), 800);
    } else if (base === 'shutdown') {
      output = accent('Initiating shutdown sequence...');
      setTimeout(() => setPowerState('shutdown'), 800);
    } else if (base === 'sleep') {
      output = accent('Entering sleep mode...');
      addToast('Entering Sleep Mode...', 'info');
      setTimeout(() => setPowerState('sleeping'), 800);
    } else if (base === 'sudo') {
      if (args.join(' ') === 'rm -rf /') {
        output = <span style={{ color: '#FF4444' }}>Nice try. This OS cannot be deleted. 😄</span>;
      } else {
        output = <span style={{ color: '#FF4444' }}>sudo: access denied. You are not root.</span>;
      }
    } else if (base === 'hack') {
      const chars = 'ABCDEF0123456789!@#$%^&*<>';
      let hackLines: string[] = [];
      for (let i = 0; i < 12; i++) {
        hackLines.push(Array.from({ length: 60 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
      }
      addToast('HACK SEQUENCE INITIATED', 'error');
      output = (
        <div>
          {accent('> INITIATING HACK SEQUENCE...')}<br />
          {hackLines.map((l, i) => <div key={i} style={{ color: `hsl(${i * 30}, 100%, 60%)`, fontSize: 11 }}>{l}</div>)}
          {accent('> ACCESS GRANTED. JUST KIDDING. 😄')}
        </div>
      );
    } else if (base === 'coffee') {
      output = (
        <pre style={{ color: 'var(--accent)', fontSize: 13 }}>{`    ( (
     ) )
  ........
  |      |]
  \\      /
   \`----'

  Enjoy your ☕ coffee!`}</pre>
      );
    } else if (base === 'calc') {
      if (!args[0]) {
        output = <span style={{ color: '#FF4444' }}>Usage: calc 12 * 8</span>;
      } else {
        try {
          const expr = args.join(' ').replace(/×/g, '*').replace(/÷/g, '/');
          // eslint-disable-next-line no-eval
          const result = eval(expr);
          output = <span>{accent('Result: ')}{white(result.toString())}</span>;
        } catch {
          output = <span style={{ color: '#FF4444' }}>Invalid expression</span>;
        }
      }
    } else if (base === 'screenshot') {
      addToast('📸 Screenshot captured! (simulated)', 'success');
      output = accent('💾 Saved to: ~/Pictures/SUDHI_OS_' + Date.now() + '.png');
    } else if (base === 'time') {
      output = accent(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else if (base === 'clearall') {
      setHistory([]);
      setCmdHistory([]);
      output = accent('Terminal and history cleared completely.');
    } else if (base === 'konami') {
      addToast('KONAMI CODE ACTIVATED! 🎮', 'success');
      document.documentElement.classList.add('konami-flash');
      setTimeout(() => document.documentElement.classList.remove('konami-flash'), 3000);
      output = accent('🎮 KONAMI CODE ACTIVATED! UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A START');
    } else {
      // Check for custom commands from terminal.json
      const terminalData = jsonData.terminal;
      if (terminalData) {
        // Check aliases first
        if (terminalData.aliases && terminalData.aliases[base]) {
          const aliasCmd = terminalData.aliases[base];
          if (aliasCmd.startsWith("echo '")) {
            const msg = aliasCmd.slice(6, -1);
            output = <span style={{ color: 'var(--accent)' }}>{msg}</span>;
          } else if (aliasCmd === 'clear') {
            setHistory([]);
            setInput('');
            return;
          } else {
            output = <span style={{ color: '#ccc' }}>{aliasCmd}</span>;
          }
        }
        // Check custom commands
        const customCmd = terminalData.customCommands?.find(c => c.command === base);
        if (customCmd) {
          if (customCmd.type === 'simple' && customCmd.output) {
            output = <pre style={{ color: 'var(--accent)', whiteSpace: 'pre-wrap' }}>{customCmd.output}</pre>;
          } else if (customCmd.type === 'random' && customCmd.outputs) {
            const randomOutput = customCmd.outputs[Math.floor(Math.random() * customCmd.outputs.length)];
            output = <span style={{ color: 'var(--accent)' }}>{randomOutput}</span>;
          } else if (customCmd.type === 'formatted' && customCmd.output) {
            output = <pre style={{ color: 'var(--accent)', whiteSpace: 'pre-wrap' }}>{customCmd.output}</pre>;
          }
        }
      }
    }

    setHistory(prev => [...prev, { input: trimmed, output }]);
    setInput('');
  }, [matrixOn, toggleMatrix, setTheme, theme, addToast, openWindow, closeWindow, minimizeWindow, setPowerState, startupTime, cmdHistory, jsonData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(newIdx);
      setInput(cmdHistory[newIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(histIdx - 1, -1);
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? '' : cmdHistory[newIdx]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['help','about','skills','projects','contact','clear','matrix','theme','neofetch','date','whoami','ls','pwd','echo','history','battery','wifi','uptime','version','open','minimize','close','restart','shutdown','sleep','hack','coffee','konami','sudo'];
      const match = commands.find(c => c.startsWith(input) && c !== input);
      if (match) setInput(match);
    }
  }, [input, histIdx, cmdHistory, execCommand]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      {/* Terminal Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <pre style={{ color: 'var(--accent)', fontSize: 10, lineHeight: 1.4, fontFamily: 'var(--font-mono)' }}>{
`╔════════════════════════════════════════════════════════╗
║            SUDHI OS Terminal v2.0                     ║
║        Full Stack Developer Environment               ║
╚════════════════════════════════════════════════════════╝`}</pre>
      </div>
      {/* Output area */}
      <div ref={outputRef} className="terminal-output" onClick={() => inputRef.current?.focus()}>
        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {h.input && (
              <div style={{ color: 'var(--accent)', marginBottom: 2 }}>
                <span style={{ color: '#666' }}>sudhi@portfolio</span>
                <span style={{ color: '#444' }}>:</span>
                <span style={{ color: '#00BFFF' }}>~</span>
                <span style={{ color: '#444' }}>$ </span>
                <span style={{ color: '#fff' }}>{h.input}</span>
              </div>
            )}
            <div>{h.output}</div>
          </div>
        ))}
        {/* Input line */}
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', marginTop: 4 }}>
          <span style={{ color: '#666', flexShrink: 0 }}>sudhi@portfolio</span>
          <span style={{ color: '#444' }}>:</span>
          <span style={{ color: '#00BFFF' }}>~</span>
          <span style={{ color: '#444' }}>$ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13,
              flex: 1, caretColor: 'var(--accent)',
            }}
          />
          <span className="blink" style={{ color: 'var(--accent)' }}>█</span>
        </div>
      </div>
    </div>
  );
});

// ─── About Window ─────────────────────────────────────────────────────────────
const AboutWindow = memo(() => {
  const { jsonData } = useOS();
  const aboutData = jsonData.about;
  
  // Use JSON data if available, otherwise use defaults
  const name = aboutData?.personal?.name ?? 'Sudhi';
  const initials = aboutData?.personal?.initials ?? 'S';
  const role = aboutData?.personal?.role ?? 'Full Stack Developer';
  const location = aboutData?.personal?.location ?? 'India';
  const status = aboutData?.personal?.status ?? 'Available for Work';
  const bio = aboutData?.bio?.long ?? 'Passionate developer crafting high-performance digital experiences. Specializing in full-stack development, system design, and UI/UX engineering. I love building tools that developers actually enjoy using — from blazing-fast APIs to beautiful, interactive interfaces. Currently exploring the intersection of AI and developer tooling.';
  
  const stats = aboutData?.stats ?? {
    projects: '20+',
    experience: '3+ Years',
    coffee: '∞',
    commits: '2000+'
  };
  
  const social = aboutData?.social ?? {
    github: { url: 'https://github.com/sudhi' },
    linkedin: { url: 'https://linkedin.com/in/sudhi' }
  };
  
  const resumeUrl = aboutData?.resume?.url ?? '#';
  const email = aboutData?.personal?.email ?? 'sudhi@portfolio.os';

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      {/* Profile row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 100, height: 100, borderRadius: 8,
            border: '2px solid var(--accent)',
            background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(var(--accent-rgb),0.3)',
            fontFamily: 'var(--font-title)', fontSize: 36, color: 'var(--accent)',
            flexShrink: 0,
          }}>{initials}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent)', marginBottom: 8 }}>{name}</div>
          <div style={{ color: '#aaa', marginBottom: 4 }}>
            <span style={{ color: '#666' }}>Role:     </span>
            <span style={{ color: '#fff' }}>{role}</span>
          </div>
          <div style={{ color: '#aaa', marginBottom: 4 }}>
            <span style={{ color: '#666' }}>Location: </span>
            <span style={{ color: '#fff' }}>{location} 🇮🇳</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#666' }}>Status:   </span>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)',
            }} className="status-dot" />
            <span style={{ color: 'var(--accent)' }}>{status}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── BIO</div>
        <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: 13 }}>{bio}</p>
      </div>

      {/* Quick Stats */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── QUICK STATS</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Projects', value: stats.projects },
            { label: 'Experience', value: stats.experience },
            { label: 'Coffee', value: stats.coffee },
            { label: 'Commits', value: stats.commits },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ color: '#666', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Section (from JSON) */}
      {aboutData?.experience && aboutData.experience.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── EXPERIENCE</div>
          {aboutData.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12, padding: 10, border: '1px solid #222', borderRadius: 4 }}>
              <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 'bold' }}>{exp.role}</div>
              <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>{exp.company} | {exp.duration}</div>
              <div style={{ color: '#ccc', fontSize: 12, lineHeight: 1.6 }}>{exp.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications (from JSON) */}
      {aboutData?.certifications && aboutData.certifications.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── CERTIFICATIONS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {aboutData.certifications.map((cert, i) => (
              <span key={i} style={{ padding: '4px 10px', border: '1px solid var(--accent)', borderRadius: 12, color: 'var(--accent)', fontSize: 11 }}>✓ {cert}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: '🐙 GitHub', href: social.github?.url ?? '#' },
          { label: '💼 LinkedIn', href: social.linkedin?.url ?? '#' },
          { label: '📄 Download CV', href: resumeUrl },
          { label: '✉ Email Me', href: `mailto:${email}` },
        ].map(btn => (
          <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer"
            style={{
              padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: 4,
              color: 'var(--accent)', textDecoration: 'none', fontSize: 12,
              fontFamily: 'var(--font-mono)', transition: 'all 0.2s',
              cursor: 'pointer', background: 'transparent',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--accent)'; (e.target as HTMLElement).style.color = '#000'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
          >
            {btn.label}
          </a>
        ))}
      </div>
    </div>
  );
});

// ─── Skills Window ────────────────────────────────────────────────────────────
const SkillsWindow = memo(() => {
  const { jsonData } = useOS();
  const [phase, setPhase] = useState<'booting' | 'ready'>('booting');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [visibleSkills, setVisibleSkills] = useState(0);
  
  // Use skills from about.json if available, otherwise use default SKILLS
  const skillsData = useMemo(() => {
    if (jsonData.about?.skills) {
      const aboutSkills = jsonData.about.skills;
      return {
        'LANGUAGES': aboutSkills.languages.map(s => ({ name: s.name, pct: s.level })),
        'FRAMEWORKS': aboutSkills.frameworks.map(s => ({ name: s.name, pct: s.level })),
        'TOOLS & DEVOPS': aboutSkills.tools.map(s => ({ name: s.name, pct: s.level })),
        'DATABASES': aboutSkills.databases.map(s => ({ name: s.name, pct: s.level })),
      };
    }
    return SKILLS;
  }, [jsonData.about]);
  
  const allSkills = useMemo(() => Object.entries(skillsData).flatMap(([cat, skills]) =>
    [{ cat, name: '', pct: -1 }, ...skills.map(s => ({ cat: '', name: s.name, pct: s.pct }))]
  ), [skillsData]);

  useEffect(() => {
    const msgs = ['$ ./load_skills.sh', '> Scanning skill database...', '> Loading from /data/about.json...', '> [████████████████████] 100%', '> Skills loaded. Displaying...'];
    let i = 0;
    const t = setInterval(() => {
      if (i < msgs.length) { setBootLines(prev => [...prev, msgs[i]]); i++; }
      else { clearInterval(t); setTimeout(() => setPhase('ready'), 300); }
    }, 350);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== 'ready') return;
    let i = 0;
    const t = setInterval(() => {
      if (i < allSkills.length) { setVisibleSkills(v => v + 1); i++; }
      else clearInterval(t);
    }, 80);
    return () => clearInterval(t);
  }, [phase, allSkills.length]);

  if (phase === 'booting') return (
    <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {bootLines.map((l, i) => <div key={i} style={{ color: 'var(--accent)', marginBottom: 4 }}>{l}</div>)}
    </div>
  );

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {Object.entries(skillsData).map(([cat, skills]) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ color: 'var(--accent)', marginBottom: 8, borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, fontSize: 12, letterSpacing: 2 }}>
            ─── {cat} ─────────────────────────────────
          </div>
          {skills.map((skill, si) => {
            const globalIdx = Object.keys(skillsData).indexOf(cat) * 10 + si;
            const visible = visibleSkills > globalIdx;
            return (
              <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
                <span style={{ color: '#fff', minWidth: 120 }}>{skill.name}</span>
                <div style={{ flex: 1, background: '#111', height: 16, borderRadius: 2, overflow: 'hidden', border: '1px solid #222' }}>
                  <div style={{
                    width: visible ? `${skill.pct}%` : '0%',
                    height: '100%', background: 'var(--accent)',
                    transition: 'width 1s ease-out',
                    display: 'flex', alignItems: 'center', paddingLeft: 4,
                  }} />
                </div>
                <span style={{ color: 'var(--accent)', minWidth: 40, textAlign: 'right' }}>{skill.pct}%</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

// ─── Projects Window ──────────────────────────────────────────────────────────
interface ProjectDisplay {
  id: number;
  name: string;
  icon?: string;
  desc: string;
  stack: string[];
  live: string;
  repo: string;
  category?: string;
  featured?: boolean;
}

const ProjectsWindow = memo(() => {
  const { jsonData } = useOS();
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<ProjectDisplay | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Use JSON data if available, map to display format
  const projects: ProjectDisplay[] = useMemo(() => {
    if (jsonData.projects.length > 0) {
      return jsonData.projects.map(p => ({
        id: p.id,
        name: p.name,
        icon: '📁',
        desc: p.description,
        stack: p.techStack,
        live: p.liveUrl,
        repo: p.repoUrl,
        category: p.category,
        featured: p.featured
      }));
    }
    return PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      desc: p.desc,
      stack: p.stack,
      live: p.live,
      repo: p.repo
    }));
  }, [jsonData.projects]);

  const handleClick = (id: number) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setDetail(projects.find(p => p.id === id) || null);
    } else {
      setSelected(id);
      clickTimer.current = setTimeout(() => { clickTimer.current = null; }, 300);
    }
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12, color: '#666' }}>
        Double-click to open project details • {projects.length} projects loaded from JSON
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {projects.map(p => (
          <div
            key={p.id}
            className="project-folder"
            onClick={() => handleClick(p.id)}
            style={{
              padding: 16, border: `1px solid ${selected === p.id ? 'var(--accent)' : '#222'}`,
              borderRadius: 6, cursor: 'pointer', textAlign: 'center',
              background: selected === p.id ? 'rgba(var(--accent-rgb),0.08)' : 'transparent',
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = selected === p.id ? 'var(--accent)' : '#222'; }}
          >
            {p.featured && (
              <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 10, color: 'var(--accent)' }}>⭐</div>
            )}
            <div className="folder-icon" style={{ fontSize: 36, marginBottom: 8, transition: 'filter 0.2s' }}>{p.icon || '📁'}</div>
            <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.4 }}>{p.name}</div>
            {p.category && <div style={{ color: '#555', fontSize: 9, marginTop: 4 }}>{p.category}</div>}
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#050505', border: '1px solid var(--accent)',
                borderRadius: 8, width: 520, maxWidth: '90vw',
                boxShadow: '0 0 40px rgba(var(--accent-rgb),0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ background: '#0a0a0a', padding: '12px 16px', borderBottom: '1px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 13, letterSpacing: 2 }}>{detail.name}</span>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ padding: 20, fontFamily: 'var(--font-mono)' }}>
                {/* Banner */}
                <div style={{
                  height: 100, background: `linear-gradient(135deg, #0a0a0a, rgba(var(--accent-rgb),0.1))`,
                  border: '1px solid rgba(var(--accent-rgb),0.2)', borderRadius: 4, marginBottom: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 48,
                }}>
                  {detail.icon || '📁'}
                </div>
                <p style={{ color: '#ccc', marginBottom: 16, lineHeight: 1.7, fontSize: 13 }}>{detail.desc}</p>
                {detail.category && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ padding: '2px 8px', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--accent)', fontSize: 10 }}>{detail.category}</span>
                    {detail.featured && <span style={{ marginLeft: 8, color: 'var(--accent)', fontSize: 11 }}>⭐ Featured</span>}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: 'var(--accent)', fontSize: 11, marginBottom: 8, letterSpacing: 2 }}>TECH STACK</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {detail.stack.map(s => (
                      <span key={s} style={{ padding: '3px 8px', border: '1px solid var(--accent)', borderRadius: 12, color: 'var(--accent)', fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={detail.live} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--accent)', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}>🌐 Live Demo</a>
                  <a href={detail.repo} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', border: '1px solid #444', borderRadius: 4, color: '#aaa', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{'</>'} Source Code</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─── Contact Window ───────────────────────────────────────────────────────────
const ContactWindow = memo(() => {
  const { addToast } = useOS();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('AWAITING TRANSMISSION...');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) { setStatus('ERROR: SUBJECT AND MESSAGE REQUIRED'); return; }
    setSending(true);
    const steps = ['ENCRYPTING PAYLOAD...', 'ESTABLISHING UPLINK...', 'TRANSMITTING...', '✓ TRANSMISSION COMPLETE'];
    for (const s of steps) {
      setStatus(s);
      await new Promise(r => setTimeout(r, 700));
    }
    setSending(false);
    addToast('Message Transmitted Successfully', 'success');
    setSubject('');
    setMessage('');
    setTimeout(() => setStatus('AWAITING TRANSMISSION...'), 3000);
  };

  const fieldStyle: React.CSSProperties = {
    background: '#0a0a0a', border: '1px solid #333', borderRadius: 4,
    color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13,
    padding: '8px 12px', width: '100%', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      <div style={{ border: '1px solid var(--accent)', borderRadius: 6, padding: 16 }}>
        <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 3, marginBottom: 16, textAlign: 'center' }}>
          ─── NEW TRANSMISSION ───
        </div>

        {/* FROM/TO */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#666', fontSize: 12 }}>FROM: </span>
          <span style={{ color: '#aaa', fontSize: 12 }}>visitor@unknown.net</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#666', fontSize: 12 }}>TO:   </span>
          <span style={{ color: 'var(--accent)', fontSize: 12 }}>sudhi@portfolio.os</span>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>SUBJECT:</div>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={sending}
            placeholder="Enter transmission subject..."
            style={{ ...fieldStyle }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { e.target.style.borderColor = '#333'; }}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>MESSAGE:</div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending}
            placeholder="Enter your message..."
            rows={6}
            style={{ ...fieldStyle, resize: 'vertical', minHeight: 120 }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { e.target.style.borderColor = '#333'; }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          style={{
            width: '100%', padding: '10px', border: '1px solid var(--accent)',
            background: sending ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
            color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12,
            letterSpacing: 2, cursor: sending ? 'wait' : 'pointer', borderRadius: 4,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!sending) { (e.target as HTMLElement).style.background = 'var(--accent)'; (e.target as HTMLElement).style.color = '#000'; }}}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = sending ? 'rgba(var(--accent-rgb),0.1)' : 'transparent'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
        >
          {sending ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
        </button>

        {/* Status */}
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: status.includes('✓') ? 'var(--accent)' : status.includes('ERROR') ? '#FF4444' : '#666', letterSpacing: 1 }}>
          STATUS: {status}
        </div>
      </div>

      {/* Social Links */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: '🐙 GitHub', href: 'https://github.com/sudhi' },
          { label: '💼 LinkedIn', href: 'https://linkedin.com/in/sudhi' },
          { label: '✉ Email', href: 'mailto:sudhi@portfolio.os' },
        ].map(btn => (
          <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer"
            style={{ padding: '6px 12px', border: '1px solid #333', borderRadius: 4, color: '#aaa', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          >{btn.label}</a>
        ))}
      </div>
    </div>
  );
});

// ─── Settings Window ──────────────────────────────────────────────────────────
const SettingsWindow = memo(() => {
  const { theme, setTheme, matrixOn, toggleMatrix, addToast } = useOS();
  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      <div style={{ color: 'var(--accent)', marginBottom: 16, fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 2 }}>SYSTEM SETTINGS</div>

      {/* Theme */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, marginBottom: 12, fontSize: 11, letterSpacing: 2 }}>THEME</div>
        {Object.entries(THEMES).map(([k, v]) => (
          <div key={k} onClick={() => { setTheme(k as ThemeKey); addToast(`Theme: ${v.name}`, 'success'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
              marginBottom: 4, border: `1px solid ${theme === k ? 'var(--accent)' : '#222'}`,
              borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s',
              background: theme === k ? 'rgba(var(--accent-rgb),0.08)' : 'transparent',
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.accent, boxShadow: `0 0 8px ${v.accent}` }} />
            <span style={{ color: theme === k ? 'var(--accent)' : '#aaa' }}>{v.name}</span>
            {theme === k && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>●</span>}
          </div>
        ))}
      </div>

      {/* Matrix Rain */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, marginBottom: 12, fontSize: 11, letterSpacing: 2 }}>MATRIX RAIN</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid #222', borderRadius: 4 }}>
          <span style={{ color: '#aaa' }}>Matrix Rain Effect</span>
          <button onClick={() => { toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); }}
            style={{
              padding: '4px 16px', border: `1px solid ${matrixOn ? 'var(--accent)' : '#444'}`,
              background: matrixOn ? 'rgba(var(--accent-rgb),0.15)' : 'transparent',
              color: matrixOn ? 'var(--accent)' : '#666', borderRadius: 4, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 12,
            }}
          >{matrixOn ? 'ON' : 'OFF'}</button>
        </div>
      </div>

      {/* System Info */}
      <div>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, marginBottom: 12, fontSize: 11, letterSpacing: 2 }}>SYSTEM INFO</div>
        {[
          ['OS', 'SUDHI OS v2.0'],
          ['Build', '2025.01'],
          ['React', '19.x'],
          ['Engine', 'Vite 7.x'],
          ['Font', 'Orbitron + Share Tech Mono'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid #0a0a0a' }}>
            <span style={{ color: '#666', minWidth: 80 }}>{k}:</span>
            <span style={{ color: '#aaa' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Music Player Window ──────────────────────────────────────────────────────
const MusicPlayerWindow = memo(() => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [playlist] = useState([
    { id: 1, title: 'Cyberpunk Dreams', artist: 'Synthwave', duration: 225, album: 'Digital Future' },
    { id: 2, title: 'Terminal Beats', artist: 'Code Music', duration: 260, album: 'Developer Life' },
    { id: 3, title: 'Matrix Flow', artist: 'Electronic Mind', duration: 315, album: 'Virtual Reality' },
    { id: 4, title: '80s Nostalgia', artist: 'Retrowave', duration: 210, album: 'Time Machine' },
    { id: 5, title: 'Neon Nights', artist: 'Outrun', duration: 250, album: 'City Lights' },
  ]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setCurrentTime(t => {
        if (t >= playlist[currentTrack].duration) {
          setCurrentTrack(ct => (ct + 1) % playlist.length);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, currentTrack, playlist]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const track = playlist[currentTrack];

  return (
    <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Album Art */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, borderBottom: '1px solid #222', paddingBottom: 20 }}>
        <div style={{ width: 150, height: 150, background: 'linear-gradient(135deg, var(--accent), #000)', border: '2px solid var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
          🎵
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--accent)', fontSize: 18, fontFamily: 'var(--font-title)', marginBottom: 8 }}>{track.title}</div>
          <div style={{ color: '#aaa', marginBottom: 4 }}>{track.artist}</div>
          <div style={{ color: '#666', fontSize: 11 }}>{track.album}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: '#666' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
        <div style={{ height: 6, background: '#111', border: '1px solid #222', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(currentTime / track.duration) * 100}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {['⏮', playing ? '⏸' : '▶', '⏭'].map((icon, i) => (
          <button key={i} onClick={() => {
            if (i === 0) setCurrentTrack(c => c === 0 ? playlist.length - 1 : c - 1);
            else if (i === 1) setPlaying(!playing);
            else setCurrentTrack(c => (c + 1) % playlist.length);
          }} style={{ width: 50, height: 50, border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </button>
        ))}
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#666' }}>🔊</span>
        <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} style={{ flex: 1 }} />
        <span style={{ color: 'var(--accent)', fontSize: 11, minWidth: 40 }}>{volume}%</span>
      </div>

      {/* Playlist */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #222', borderRadius: 4, padding: 8 }}>
        <div style={{ color: 'var(--accent)', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>PLAYLIST</div>
        {playlist.map((t, i) => (
          <div key={t.id} onClick={() => setCurrentTrack(i)} style={{ padding: '8px 12px', marginBottom: 4, background: i === currentTrack ? 'rgba(var(--accent-rgb),0.15)' : 'transparent', border: `1px solid ${i === currentTrack ? 'var(--accent)' : '#111'}`, borderRadius: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: i === currentTrack ? 'var(--accent)' : '#aaa', fontSize: 12 }}>{t.title}</div>
              <div style={{ color: '#666', fontSize: 10 }}>{t.artist}</div>
            </div>
            <div style={{ color: '#666', fontSize: 11 }}>{formatTime(t.duration)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Browser Window ───────────────────────────────────────────────────────────
const BrowserWindow = memo(() => {
  const [url, setUrl] = useState('https://github.com');
  const [currentUrl, setCurrentUrl] = useState('https://github.com');
  const [bookmarks] = useState([
    { id: 1, title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: 2, title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚' },
    { id: 3, title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📖' },
    { id: 4, title: 'React', url: 'https://react.dev', icon: '⚛️' },
    { id: 5, title: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
  ]);

  const navigate = () => {
    setCurrentUrl(url);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)' }}>
      {/* Navigation Bar */}
      <div style={{ padding: 12, borderBottom: '1px solid #222', display: 'flex', gap: 8, alignItems: 'center', background: '#050505' }}>
        <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#666', borderRadius: 4, cursor: 'pointer' }}>←</button>
        <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#666', borderRadius: 4, cursor: 'pointer' }}>→</button>
        <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#666', borderRadius: 4, cursor: 'pointer' }}>⟳</button>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && navigate()} style={{ flex: 1, padding: '6px 12px', background: '#0a0a0a', border: '1px solid #333', color: '#aaa', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }} />
        <button onClick={navigate} style={{ padding: '6px 16px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer' }}>GO</button>
      </div>

      {/* Bookmarks Bar */}
      <div style={{ padding: 8, borderBottom: '1px solid #222', display: 'flex', gap: 8, overflowX: 'auto', background: '#080808' }}>
        {bookmarks.map(b => (
          <div key={b.id} onClick={() => { setUrl(b.url); setCurrentUrl(b.url); }} style={{ padding: '4px 12px', border: '1px solid #222', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 11, color: '#999', background: currentUrl === b.url ? 'rgba(var(--accent-rgb),0.1)' : 'transparent' }}>
            <span>{b.icon}</span>
            <span>{b.title}</span>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 14, color: '#666', textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>🌐</div>
        <div style={{ color: 'var(--accent)', fontSize: 16 }}>Browser Simulation</div>
        <div style={{ maxWidth: 400 }}>This is a simulated browser window. In a real portfolio, you could embed an iframe or display web content here.</div>
        <div style={{ marginTop: 20, padding: 12, border: '1px solid #222', borderRadius: 4, background: '#0a0a0a', color: '#999', fontSize: 12 }}>
          <div>Current URL:</div>
          <div style={{ color: 'var(--accent)', marginTop: 4 }}>{currentUrl}</div>
        </div>
      </div>
    </div>
  );
});

// ─── Paint Window ─────────────────────────────────────────────────────────────
const PaintWindow = memo(() => {
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
    ctx.fillStyle = '#000';
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
      ctx.fillRect(x - 2, y - 2, 4, 4);
    } else if (tool === 'eraser') {
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 5, y - 5, 10, 10);
    } else if (tool === 'fill') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)' }}>
      {/* Toolbar */}
      <div style={{ padding: 12, borderBottom: '1px solid #222', display: 'flex', gap: 8, background: '#050505' }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{ padding: '6px 12px', border: `1px solid ${tool === t.id ? 'var(--accent)' : '#333'}`, background: tool === t.id ? 'rgba(var(--accent-rgb),0.15)' : '#0a0a0a', color: tool === t.id ? 'var(--accent)' : '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
            {t.icon} {t.label}
          </button>
        ))}
        <div style={{ width: 1, background: '#222', margin: '0 8px' }} />
        {colors.map(c => (
          <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, background: c, border: `2px solid ${color === c ? 'var(--accent)' : '#222'}`, borderRadius: 4, cursor: 'pointer' }} />
        ))}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <canvas ref={canvasRef} width={700} height={450} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseMove={draw} onMouseLeave={stopDrawing} style={{ border: '2px solid #222', cursor: 'crosshair', background: '#000' }} />
      </div>
    </div>
  );
});

// ─── Email Window ─────────────────────────────────────────────────────────────
const EmailWindow = memo(() => {
  const [view, setView] = useState<'inbox' | 'compose'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [emails] = useState([
    { id: 1, from: 'recruiter@techcorp.com', subject: 'Job Opportunity - Senior Full Stack', preview: 'We came across your portfolio...', date: '10:30 AM', read: false, starred: true },
    { id: 2, from: 'github@notifications.com', subject: 'New star on your repository', preview: 'Someone starred your SudhiOS project...', date: '09:15 AM', read: false, starred: false },
    { id: 3, from: 'newsletter@dev.to', subject: 'Weekly Dev Digest', preview: 'This week\'s top articles...', date: 'Yesterday', read: true, starred: false },
  ]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {/* Toolbar */}
      <div style={{ padding: 12, borderBottom: '1px solid #222', display: 'flex', gap: 8, background: '#050505' }}>
        <button onClick={() => setView('inbox')} style={{ padding: '6px 16px', border: `1px solid ${view === 'inbox' ? 'var(--accent)' : '#333'}`, background: view === 'inbox' ? 'rgba(var(--accent-rgb),0.15)' : '#0a0a0a', color: view === 'inbox' ? 'var(--accent)' : '#999', borderRadius: 4, cursor: 'pointer' }}>�� Inbox</button>
        <button onClick={() => setView('compose')} style={{ padding: '6px 16px', border: `1px solid ${view === 'compose' ? 'var(--accent)' : '#333'}`, background: view === 'compose' ? 'rgba(var(--accent-rgb),0.15)' : '#0a0a0a', color: view === 'compose' ? 'var(--accent)' : '#999', borderRadius: 4, cursor: 'pointer' }}>✏️ Compose</button>
      </div>

      {view === 'inbox' ? (
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Email List */}
          <div style={{ width: '40%', borderRight: '1px solid #222', overflowY: 'auto' }}>
            {emails.map(email => (
              <div key={email.id} onClick={() => setSelectedEmail(email.id)} style={{ padding: 16, borderBottom: '1px solid #111', cursor: 'pointer', background: selectedEmail === email.id ? 'rgba(var(--accent-rgb),0.05)' : email.read ? 'transparent' : '#0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: email.read ? '#999' : 'var(--accent)', fontSize: 12 }}>{email.from}</span>
                  <span style={{ color: '#666', fontSize: 10 }}>{email.date}</span>
                </div>
                <div style={{ color: email.read ? '#999' : '#fff', fontSize: 12, marginBottom: 4 }}>{email.subject}</div>
                <div style={{ color: '#666', fontSize: 11 }}>{email.preview}</div>
              </div>
            ))}
          </div>

          {/* Email Content */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {selectedEmail ? (
              <>
                <div style={{ color: 'var(--accent)', fontSize: 16, marginBottom: 16 }}>
                  {emails.find(e => e.id === selectedEmail)?.subject}
                </div>
                <div style={{ color: '#aaa', marginBottom: 20, fontSize: 12 }}>
                  From: {emails.find(e => e.id === selectedEmail)?.from}
                </div>
                <div style={{ color: '#ccc', lineHeight: 1.6 }}>
                  Email content would appear here. This is a simulated email client for demonstration purposes.
                </div>
              </>
            ) : (
              <div style={{ color: '#666', textAlign: 'center', marginTop: 100 }}>Select an email to read</div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" placeholder="To:" style={{ padding: 8, background: '#0a0a0a', border: '1px solid #222', color: '#aaa', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          <input type="text" placeholder="Subject:" style={{ padding: 8, background: '#0a0a0a', border: '1px solid #222', color: '#aaa', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          <textarea placeholder="Message..." style={{ flex: 1, padding: 12, background: '#0a0a0a', border: '1px solid #222', color: '#aaa', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'none' }} />
          <button style={{ padding: '8px 24px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', alignSelf: 'flex-start' }}>📤 Send</button>
        </div>
      )}
    </div>
  );
});

// ─── Calendar Window ──────────────────────────────────────────────────────────
const CalendarWindow = memo(() => {
  const [currentDate] = useState(new Date());
  const [events] = useState([
    { id: 1, title: 'Team Meeting', date: '2024-03-15', time: '10:00', type: 'meeting', color: '#00FF88' },
    { id: 2, title: 'Code Review', date: '2024-03-15', time: '14:00', type: 'work', color: '#00BFFF' },
    { id: 3, title: 'Project Deadline', date: '2024-03-20', time: '23:59', type: 'deadline', color: '#FF0088' },
    { id: 4, title: 'Tech Conference', date: '2024-03-25', time: '09:00', type: 'event', color: '#FFB300' },
  ]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: 18, fontFamily: 'var(--font-title)' }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer' }}>←</button>
          <button style={{ padding: '4px 12px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer' }}>Today</button>
          <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer' }}>→</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, border: '1px solid #222', padding: 8, borderRadius: 4 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: 8, textAlign: 'center', color: 'var(--accent)', fontSize: 10, fontWeight: 'bold' }}>{day}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === currentDate.getDate();
          return (
            <div key={day} style={{ padding: 8, border: `1px solid ${isToday ? 'var(--accent)' : '#111'}`, background: isToday ? 'rgba(var(--accent-rgb),0.1)' : 'transparent', borderRadius: 4, minHeight: 60, cursor: 'pointer' }}>
              <div style={{ color: isToday ? 'var(--accent)' : '#999', fontSize: 11, marginBottom: 4 }}>{day}</div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <div style={{ borderTop: '1px solid #222', paddingTop: 12 }}>
        <div style={{ color: 'var(--accent)', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>UPCOMING EVENTS</div>
        {events.slice(0, 3).map(event => (
          <div key={event.id} style={{ padding: 8, marginBottom: 4, border: '1px solid #222', borderLeft: `3px solid ${event.color}`, borderRadius: 4, fontSize: 11 }}>
            <div style={{ color: '#fff', marginBottom: 2 }}>{event.title}</div>
            <div style={{ color: '#666' }}>{event.date} at {event.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Games Window ─────────────────────────────────────────────────────────────
const GamesWindow = memo(() => {
  const [selectedGame, setSelectedGame] = useState<'snake' | 'minesweeper' | null>(null);
  const [score] = useState(0);

  const games = [
    { id: 'snake' as const, name: 'Snake', icon: '🐍', description: 'Classic snake game' },
    { id: 'minesweeper' as const, name: 'Minesweeper', icon: '💣', description: 'Clear the mines' },
  ];

  if (selectedGame) {
    return (
      <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setSelectedGame(null)} style={{ padding: '6px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer' }}>← Back</button>
          <div style={{ color: 'var(--accent)' }}>Score: {score}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222', borderRadius: 4, fontSize: 64 }}>
          {selectedGame === 'snake' ? '🐍' : '💣'}
        </div>
        <div style={{ color: '#666', textAlign: 'center' }}>Game simulation - Click to play!</div>
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

// ─── Notepad Window ───────────────────────────────────────────────────────────
const NotepadWindow = memo(() => {
  const [content, setContent] = useState('Welcome to Notepad!\n\nStart typing...');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)' }}>
      {/* Toolbar */}
      <div style={{ padding: 8, borderBottom: '1px solid #222', display: 'flex', gap: 8, background: '#050505' }}>
        <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>📁 Open</button>
        <button style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>💾 Save</button>
        <button onClick={() => setContent('')} style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>🗑️ Clear</button>
      </div>

      {/* Text Area */}
      <textarea value={content} onChange={e => setContent(e.target.value)} style={{ flex: 1, padding: 16, background: '#000', border: 'none', color: '#aaa', fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'none', outline: 'none' }} />

      {/* Status Bar */}
      <div style={{ padding: '4px 12px', borderTop: '1px solid #222', background: '#050505', fontSize: 10, color: '#666', display: 'flex', justifyContent: 'space-between' }}>
        <span>Lines: {content.split('\n').length}</span>
        <span>Characters: {content.length}</span>
      </div>
    </div>
  );
});

// ─── File Explorer Window ─────────────────────────────────────────────────────
const FileExplorerWindow = memo(() => {
  const [currentPath, setCurrentPath] = useState(['Home']);
  const [files] = useState({
    'Home': [
      { name: 'Documents', type: 'folder', icon: '📁' },
      { name: 'Projects', type: 'folder', icon: '📁' },
      { name: 'Images', type: 'folder', icon: '📁' },
      { name: 'README.txt', type: 'file', icon: '📄', size: '2.4 KB' },
    ],
    'Documents': [
      { name: 'Resume.pdf', type: 'file', icon: '📄', size: '125 KB' },
      { name: 'Notes.txt', type: 'file', icon: '📄', size: '5.2 KB' },
    ],
    'Projects': [
      { name: 'SudhiOS', type: 'folder', icon: '📁' },
      { name: 'Portfolio', type: 'folder', icon: '📁' },
    ],
    'Images': [
      { name: 'screenshot.png', type: 'file', icon: '🖼️', size: '856 KB' },
      { name: 'avatar.jpg', type: 'file', icon: '🖼️', size: '234 KB' },
    ],
  } as Record<string, Array<{ name: string; type: string; icon: string; size?: string }>>);

  const currentFiles = files[currentPath[currentPath.length - 1]] || [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {/* Navigation Bar */}
      <div style={{ padding: 12, borderBottom: '1px solid #222', display: 'flex', gap: 8, alignItems: 'center', background: '#050505' }}>
        <button onClick={() => currentPath.length > 1 && setCurrentPath(currentPath.slice(0, -1))} disabled={currentPath.length === 1} style={{ padding: '4px 12px', border: '1px solid #333', background: '#0a0a0a', color: currentPath.length === 1 ? '#333' : '#999', borderRadius: 4, cursor: currentPath.length === 1 ? 'not-allowed' : 'pointer' }}>←</button>
        <div style={{ flex: 1, color: '#aaa' }}>{currentPath.join(' / ')}</div>
      </div>

      {/* File List */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {currentFiles.map((file, i) => (
            <div key={i} onDoubleClick={() => file.type === 'folder' && setCurrentPath([...currentPath, file.name])} style={{ padding: 12, border: '1px solid #222', borderRadius: 8, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{file.icon}</div>
              <div style={{ color: '#aaa', fontSize: 11, marginBottom: 4, wordBreak: 'break-word' }}>{file.name}</div>
              {file.size && <div style={{ color: '#666', fontSize: 10 }}>{file.size}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid #222', background: '#050505', fontSize: 10, color: '#666' }}>
        {currentFiles.length} items
      </div>
    </div>
  );
});

// ─── Desktop Icon ─────────────────────────────────────────────────────────────
interface DesktopIconProps {
  icon: typeof DESKTOP_ICONS[0];
  selected: boolean;
  onSingleClick: () => void;
  onDoubleClick: () => void;
  position: { x: number; y: number };
  onPositionChange: (id: string, pos: { x: number; y: number }) => void;
}

const DesktopIcon = memo(({ icon, selected, onSingleClick, onDoubleClick, position, onPositionChange }: DesktopIconProps) => {
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleClick = () => {
    if (dragRef.current?.isDragging) {
      dragRef.current = null;
      return;
    }
    
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick();
    } else {
      onSingleClick();
      clickTimer.current = setTimeout(() => { clickTimer.current = null; }, 300);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragRef.current = {
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      
      if (!dragRef.current.isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragRef.current.isDragging = true;
      }
      
      if (dragRef.current.isDragging) {
        const newX = Math.max(8, Math.min(window.innerWidth - 84, dragRef.current.startPosX + dx));
        const newY = Math.max(8, Math.min(window.innerHeight - 84, dragRef.current.startPosY + dy));
        onPositionChange(icon.id, { x: newX, y: newY });
      }
    };
    
    const handleMouseUp = () => {
      if (dragRef.current?.isDragging) {
        setTimeout(() => {
          dragRef.current = null;
        }, 100);
      } else {
        dragRef.current = null;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className="icon-hover"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: 8, cursor: 'move', borderRadius: 6, userSelect: 'none',
        border: selected ? '1px solid var(--accent)' : '1px solid transparent',
        background: selected ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(0,0,0,0.3)',
        width: 76, transition: 'all 0.15s',
        zIndex: 3,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 6,
        border: '1px solid rgba(var(--accent-rgb),0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        fontSize: icon.emoji ? 22 : 18,
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
      }}>
        {icon.emoji ?? icon.icon}
      </div>
      <span style={{ color: '#ccc', fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.3 }}>
        {icon.label}
      </span>
    </div>
  );
});

// ─── Taskbar ──────────────────────────────────────────────────────────────────
const Taskbar = memo(({ onStartClick }: { onStartClick: () => void }) => {
  const { windows, focusWindow, minimizeWindow, closeWindow, openWindow } = useOS();
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState(87);
  const [visitorCount, setVisitorCount] = useState(0);
  const [tabMenu, setTabMenu] = useState<string | null>(null);
  const activeWinId = [...windows].sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // More realistic battery with charging cycle
    let isCharging = false;
    const t = setInterval(() => {
      setBattery(b => {
        if (isCharging) {
          const next = Math.min(100, b + 0.8);
          if (next >= 98) isCharging = false;
          return next;
        } else {
          const next = Math.max(8, b - 0.12);
          if (next <= 12) isCharging = true;
          return next;
        }
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const key = 'sudhi_os_visitors';
    const count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(count));
    setVisitorCount(count);
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const handleTabClick = (winId: string) => {
    const win = windows.find(w => w.id === winId);
    if (!win) { openWindow(winId as WinId); return; }
    if (win.minimized) focusWindow(winId as WinId);
    else if (win.id === activeWinId) minimizeWindow(winId as WinId);
    else focusWindow(winId as WinId);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 48, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)', borderTop: '1px solid rgba(var(--accent-rgb),0.3)',
      display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px',
      backdropFilter: 'blur(8px)',
    }}>
      {/* START button */}
      <button
        onClick={onStartClick}
        style={{
          padding: '4px 14px', border: '1px solid var(--accent)', borderRadius: 4,
          background: 'transparent', color: 'var(--accent)', cursor: 'pointer',
          fontFamily: 'var(--font-title)', fontSize: 11, letterSpacing: 1,
          whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: '0 0 8px rgba(var(--accent-rgb),0.3)',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--accent)'; (e.target as HTMLElement).style.color = '#000'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
      >
        ▶ START
      </button>

      <div style={{ width: 1, height: 28, background: '#333', margin: '0 4px' }} />

      {/* Window tabs */}
      <div style={{ flex: 1, display: 'flex', gap: 4, overflowX: 'auto', alignItems: 'center' }}>
        {windows.map(win => {
          const isActive = win.id === activeWinId && !win.minimized;
          return (
            <div key={win.id} style={{ position: 'relative' }}>
              <button
                onClick={() => handleTabClick(win.id)}
                onContextMenu={e => { e.preventDefault(); setTabMenu(tabMenu === win.id ? null : win.id); }}
                style={{
                  padding: '4px 10px', border: `1px solid ${isActive ? 'var(--accent)' : '#333'}`,
                  borderRadius: 3, background: isActive ? 'rgba(var(--accent-rgb),0.15)' : 'transparent',
                  color: isActive ? 'var(--accent)' : win.minimized ? '#444' : '#888',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                  whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
                  transition: 'all 0.15s',
                }}
              >
                {win.title}
              </button>
              {tabMenu === win.id && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, background: '#0a0a0a',
                  border: '1px solid var(--accent)', borderRadius: 4, zIndex: 2000,
                  minWidth: 140, overflow: 'hidden',
                }}>
                  {[
                    ['Restore', () => focusWindow(win.id as WinId)],
                    ['Minimize', () => minimizeWindow(win.id as WinId)],
                    ['Close', () => closeWindow(win.id as WinId)],
                  ].map(([label, action]) => (
                    <button key={label as string}
                      onClick={() => { (action as () => void)(); setTabMenu(null); }}
                      style={{
                        display: 'block', width: '100%', padding: '7px 12px',
                        background: 'none', border: 'none', color: '#aaa',
                        cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'left',
                      }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#aaa'; }}
                    >{label as string}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ width: 1, height: 28, background: '#333', margin: '0 4px' }} />

      {/* System Tray */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <span title={`Battery: ${battery.toFixed(0)}%\nStatus: Discharging`} style={{ color: battery < 20 ? '#FF4444' : '#aaa', cursor: 'default' }}>
          🔋 {battery.toFixed(0)}%
        </span>
        <span title="SSID: SUDHI_NET\nSignal: 80%\nIP: 192.168.1.42" style={{ color: '#aaa', cursor: 'default' }}>
          📶 SUDHI_NET
        </span>
        <span title={formatDate(now)} style={{ color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 1 }}>
          {formatTime(now)}
        </span>
        <span title={`You are visitor #${visitorCount}`} style={{ color: '#666', cursor: 'default' }}>
          👁 {visitorCount}
        </span>
      </div>
    </div>
  );
});

// ─── Start Menu ───────────────────────────────────────────────────────────────
interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  logoClickCount: number;
  onLogoClick: () => void;
}

const StartMenu = memo(({ open, onClose, logoClickCount, onLogoClick }: StartMenuProps) => {
  const { openWindow, theme, setTheme, matrixOn, toggleMatrix, setPowerState, addToast } = useOS();

  const handleApp = (id: WinId) => { openWindow(id); onClose(); };

  const themeAction = (k: ThemeKey) => {
    setTheme(k);
    addToast(`Theme: ${THEMES[k].name}`, 'success');
    onClose();
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '7px 16px',
    background: 'none', border: 'none', color: '#ccc',
    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
    textAlign: 'left', transition: 'all 0.15s',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 899 }} onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', bottom: 52, left: 4, width: 280, zIndex: 900,
              background: '#080808', border: '1px solid var(--accent)', borderRadius: 6,
              overflow: 'hidden', boxShadow: '0 0 30px rgba(var(--accent-rgb),0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {/* Header */}
            <div
              style={{ background: 'rgba(var(--accent-rgb),0.1)', padding: '12px 16px', borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', cursor: 'pointer' }}
              onClick={onLogoClick}
            >
              <div style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 14, letterSpacing: 2 }}>▓▓ SUDHI OS v2.0</div>
              <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>sudhi@portfolio</div>
              {logoClickCount >= 3 && <div style={{ color: '#FFB300', fontSize: 10, marginTop: 4 }}>{5 - logoClickCount} more clicks for secret...</div>}
            </div>

            {/* Applications */}
            <div style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '6px 16px 2px', color: '#444', fontSize: 10, letterSpacing: 2 }}>APPLICATIONS</div>
              {[
                { id: 'terminal' as WinId, label: '>_ TERMINAL.cmd' },
                { id: 'about' as WinId, label: '👤 ABOUT.exe' },
                { id: 'skills' as WinId, label: '⚡ SKILLS.sh' },
                { id: 'projects' as WinId, label: '📁 PROJECTS/' },
                { id: 'contact' as WinId, label: '✉ CONTACT.mail' },
              ].map(a => (
                <button key={a.id} style={menuItemStyle} onClick={() => handleApp(a.id)}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#ccc'; }}
                >{'> '}{a.label}</button>
              ))}
            </div>

            {/* Themes */}
            <div style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '6px 16px 2px', color: '#444', fontSize: 10, letterSpacing: 2 }}>THEMES</div>
              {Object.entries(THEMES).map(([k, v]) => (
                <button key={k} style={{ ...menuItemStyle, color: theme === k ? 'var(--accent)' : '#ccc' }}
                  onClick={() => themeAction(k as ThemeKey)}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = theme === k ? 'var(--accent)' : '#ccc'; }}
                >
                  {theme === k ? '● ' : '○ '}{v.name}
                </button>
              ))}
            </div>

            {/* System */}
            <div style={{ borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ padding: '6px 16px 2px', color: '#444', fontSize: 10, letterSpacing: 2 }}>SYSTEM</div>
              <button style={menuItemStyle} onClick={() => { handleApp('settings'); }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#ccc'; }}
              >{'> '}Settings</button>
              <button style={menuItemStyle} onClick={() => { toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); onClose(); }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#ccc'; }}
              >{'> '}Toggle Matrix Rain</button>
              <button style={menuItemStyle} onClick={() => {
                if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); addToast('Fullscreen Enabled', 'info'); }
                else { document.exitFullscreen(); addToast('Fullscreen Disabled', 'info'); }
                onClose();
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#ccc'; }}
              >{'> '}Toggle Fullscreen</button>
            </div>

            {/* Power */}
            <div style={{ padding: '4px 0' }}>
              {[
                { label: '💤 Sleep', action: () => { setPowerState('sleeping'); addToast('Entering Sleep Mode...', 'info'); onClose(); } },
                { label: '🔄 Restart', action: () => { setPowerState('booting'); onClose(); } },
                { label: '⏻  Shutdown', action: () => { setPowerState('shutdown'); onClose(); } },
              ].map(item => (
                <button key={item.label} style={menuItemStyle} onClick={item.action}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,60,60,0.1)'; (e.target as HTMLElement).style.color = '#FF6666'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#ccc'; }}
                >{'> '}{item.label}</button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ─── Context Menu ─────────────────────────────────────────────────────────────
interface ContextMenuProps {
  x: number; y: number;
  onClose: () => void;
  onRefresh: () => void;
  onTheme: (k: ThemeKey) => void;
  onToggleMatrix: () => void;
}

const ContextMenu = memo(({ x, y, onClose, onRefresh, onTheme, onToggleMatrix }: ContextMenuProps) => {
  const { addToast } = useOS();
  const [themeSub, setThemeSub] = useState(false);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 800 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: x, top: y, zIndex: 801,
        background: '#080808', border: '1px solid var(--accent)', borderRadius: 4,
        minWidth: 180, overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        {[
          { label: 'Refresh Desktop', action: () => { onRefresh(); onClose(); } },
          { label: 'Change Theme ▶', action: () => setThemeSub(v => !v), sub: true },
          { label: 'Toggle Matrix Rain', action: () => { onToggleMatrix(); onClose(); } },
          { label: 'Toggle Fullscreen', action: () => {
            if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); addToast('Fullscreen Enabled', 'info'); }
            else { document.exitFullscreen(); addToast('Fullscreen Disabled', 'info'); }
            onClose();
          }},
          { label: 'System Info', action: () => { addToast('SUDHI OS v2.0 | React 19.x', 'info'); onClose(); } },
        ].map(item => (
          <button key={item.label}
            style={{ display: 'block', width: '100%', padding: '8px 14px', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s' }}
            onClick={item.action}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(var(--accent-rgb),0.1)'; (e.target as HTMLElement).style.color = 'var(--accent)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#ccc'; }}
          >{item.label}</button>
        ))}
        {themeSub && (
          <div style={{ borderTop: '1px solid #222', padding: '4px 0' }}>
            {Object.entries(THEMES).map(([k, v]) => (
              <button key={k}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 14px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                onClick={() => { onTheme(k as ThemeKey); onClose(); }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#aaa'; }}
              >
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: v.accent }} />
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
});

// ─── Sleep Screen ─────────────────────────────────────────────────────────────
const SleepScreen = memo(({ onWake }: { onWake: () => void }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="sleep-overlay" onClick={onWake} onKeyDown={onWake as any} tabIndex={0}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 72, color: 'var(--accent)', letterSpacing: 4, marginBottom: 16 }}>
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#444', fontSize: 14 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#222', fontSize: 12, marginTop: 32 }}>
          Press any key or click to wake
        </div>
      </div>
    </div>
  );
});

// ─── Shutdown Screen ──────────────────────────────────────────────────────────
const ShutdownScreen = memo(({ onWake }: { onWake: () => void }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
    onClick={onWake}
    onKeyDown={onWake as any}
    tabIndex={0}
  >
    <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: '#333', fontSize: 14, marginBottom: 12 }}>It is now safe to turn off your computer.</div>
      <div style={{ color: '#222', fontSize: 12 }}>SYSTEM HALTED.</div>
      <div style={{ color: '#111', fontSize: 11, marginTop: 40 }}>Click anywhere to restart</div>
    </div>
  </div>
));

// ─── Mobile Fallback ──────────────────────────────────────────────────────────
const MobileView = memo(() => {
  const [activeSection, setActiveSection] = useState('about');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('AWAITING TRANSMISSION...');
  const [sending, setSending] = useState(false);

  const handleContact = async () => {
    if (!subject || !message) { setStatus('ERROR: All fields required'); return; }
    setSending(true);
    const steps = ['ENCRYPTING...', 'TRANSMITTING...', '✓ TRANSMISSION COMPLETE'];
    for (const s of steps) { setStatus(s); await new Promise(r => setTimeout(r, 700)); }
    setSending(false);
    setSubject(''); setMessage('');
    setTimeout(() => setStatus('AWAITING TRANSMISSION...'), 3000);
  };

  const navItems = ['about', 'skills', 'projects', 'contact'];
  const inputStyle: React.CSSProperties = {
    background: '#0a0a0a', border: '1px solid #333', borderRadius: 4,
    color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 14,
    padding: '10px 12px', width: '100%', outline: 'none', marginBottom: 8,
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: 'var(--font-mono)', overflowY: 'auto', overflowX: 'hidden' }} className="mobile-only">
      {/* CRT overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <div style={{ background: '#050505', borderBottom: '1px solid var(--accent)', padding: '16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 18, letterSpacing: 3 }}>SUDHI OS — Mobile</div>
        <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>Full Stack Developer Portfolio</div>
      </div>

      {/* Navigation */}
      <div style={{ position: 'sticky', top: 0, background: '#050505', borderBottom: '1px solid #1a1a1a', display: 'flex', zIndex: 100, overflowX: 'auto' }}>
        {navItems.map(item => (
          <button key={item} onClick={() => setActiveSection(item)}
            style={{
              flex: 1, minWidth: 80, padding: '12px 8px', background: 'none',
              border: 'none', borderBottom: `2px solid ${activeSection === item ? 'var(--accent)' : 'transparent'}`,
              color: activeSection === item ? 'var(--accent)' : '#666',
              cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
              textTransform: 'uppercase', letterSpacing: 1, transition: 'all 0.2s',
              minHeight: 44,
            }}
          >{item}</button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        {/* About Section */}
        {activeSection === 'about' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, border: '2px solid var(--accent)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--accent)' }}>S</div>
              <div style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 20, marginBottom: 4 }}>Sudhi</div>
              <div style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>Full Stack Developer</div>
              <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>India 🇮🇳</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} className="status-dot" />
                <span style={{ color: 'var(--accent)', fontSize: 12 }}>Available for Work</span>
              </div>
            </div>
            <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: 13, marginBottom: 20 }}>
              Passionate developer crafting high-performance digital experiences. Specializing in full-stack development, system design, and UI/UX engineering.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {[['20+', 'Projects'], ['3+', 'Years'], ['∞', 'Coffee']].map(([v, l]) => (
                <div key={l} style={{ border: '1px solid #222', borderRadius: 6, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 18 }}>{v}</div>
                  <div style={{ color: '#666', fontSize: 11 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['🐙 GitHub', 'https://github.com/sudhi'], ['💼 LinkedIn', 'https://linkedin.com/in/sudhi'], ['✉ Email', 'mailto:sudhi@portfolio.os']].map(([l, h]) => (
                <a key={l} href={h} target="_blank" rel="noreferrer" style={{ padding: '10px 14px', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--accent)', textDecoration: 'none', fontSize: 12, minHeight: 44, display: 'flex', alignItems: 'center' }}>{l}</a>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {activeSection === 'skills' && (
          <div>
            {Object.entries(SKILLS).map(([cat, skills]) => (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ color: 'var(--accent)', fontSize: 11, letterSpacing: 2, marginBottom: 10, borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4 }}>─── {cat}</div>
                {skills.map(s => (
                  <div key={s.name} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#ccc', fontSize: 13 }}>{s.name}</span>
                      <span style={{ color: 'var(--accent)', fontSize: 12 }}>{s.pct}%</span>
                    </div>
                    <div style={{ background: '#111', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {activeSection === 'projects' && (
          <div>
            {PROJECTS.map(p => (
              <div key={p.id} style={{ border: '1px solid #222', borderRadius: 6, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 13 }}>{p.name}</span>
                </div>
                <p style={{ color: '#aaa', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {p.stack.map(s => <span key={s} style={{ padding: '2px 6px', border: '1px solid rgba(var(--accent-rgb),0.3)', borderRadius: 10, color: 'var(--accent)', fontSize: 10 }}>{s}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a href={p.live} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--accent)', textDecoration: 'none', fontSize: 11, minHeight: 44, display: 'flex', alignItems: 'center' }}>🌐 Demo</a>
                  <a href={p.repo} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', border: '1px solid #444', borderRadius: 4, color: '#aaa', textDecoration: 'none', fontSize: 11, minHeight: 44, display: 'flex', alignItems: 'center' }}>{'</>'} Code</a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>SUBJECT</div>
              <input value={subject} onChange={e => setSubject(e.target.value)} disabled={sending} placeholder="Your subject..." style={inputStyle} />
              <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>MESSAGE</div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} disabled={sending} placeholder="Your message..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
              <button onClick={handleContact} disabled={sending} style={{ width: '100%', padding: '12px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 2, cursor: 'pointer', borderRadius: 4, minHeight: 44 }}>
                {sending ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 10, color: status.includes('✓') ? 'var(--accent)' : '#666', fontSize: 12 }}>STATUS: {status}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid #111', color: '#333', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        SUDHI OS v2.0 | Built with React + ❤
      </div>
    </div>
  );
});

// ─── Main OS Provider / App ───────────────────────────────────────────────────
export default function App() {
  const [theme, setThemeState] = useState<ThemeKey>('green');
  const [matrixOn, setMatrixOn] = useState(true);
  const [windows, setWindows] = useState<WinState[]>([]);
  const [powerState, setPowerStateRaw] = useState<PowerState>('booting');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    DESKTOP_ICONS.forEach((icon, index) => {
      positions[icon.id] = { x: 8, y: 8 + index * 90 };
    });
    return positions;
  });
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [secretWindowOpen, setSecretWindowOpen] = useState(false);
  const startupTime = useRef(Date.now());
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // JSON Data State - loaded from public/data/*.json files
  const [jsonData, setJsonData] = useState<LoadedJsonData>({
    projects: [],
    about: null,
    terminal: null
  });

  // Load JSON data on mount
  useEffect(() => {
    loadAllData().then(data => {
      setJsonData(data);
      console.log('✅ JSON data loaded from /data/*.json files');
    }).catch(err => {
      console.warn('⚠️ Could not load JSON data, using fallback:', err);
    });
  }, []);

  // Apply theme
  useEffect(() => {
    const t = THEMES[theme];
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-rgb', t.rgb);
  }, [theme]);

  const setTheme = useCallback((t: ThemeKey) => setThemeState(t), []);
  const toggleMatrix = useCallback(() => setMatrixOn(v => !v), []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setPowerState = useCallback((s: PowerState) => setPowerStateRaw(s), []);

  const openWindow = useCallback((id: WinId) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: nextZ() } : w);
      }
      const defaults = WIN_DEFAULTS[id] ?? { title: id, position: { x: 100 + Math.random() * 100, y: 80 + Math.random() * 80 }, size: { w: 560, h: 420 } };
      return [...prev, { id, ...defaults, minimized: false, maximized: false, zIndex: nextZ() }];
    });
  }, []);

  const closeWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  }, []);

  const maximizeWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  }, []);

  const focusWindow = useCallback((id: WinId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: nextZ() } : w));
  }, []);

  const updateWindowPos = useCallback((id: WinId, pos: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: pos } : w));
  }, []);

  const updateWindowSize = useCallback((id: WinId, size: { w: number; h: number }) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  }, []);

  const topWindowId = useMemo(() => [...windows].sort((a, b) => b.zIndex - a.zIndex).find(w => !w.minimized)?.id ?? null, [windows]);

  // Idle detection
  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (powerState === 'running') {
      idleTimer.current = setTimeout(() => {
        setPowerStateRaw('sleeping');
        addToast('Entering Sleep Mode...', 'info');
      }, 60000);
    }
  }, [powerState, addToast]);

  useEffect(() => {
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('click', resetIdle);
    resetIdle();
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('click', resetIdle);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'f' && !inInput) {
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); addToast('Fullscreen Enabled', 'info'); }
        else { document.exitFullscreen(); addToast('Fullscreen Disabled', 'info'); }
      }
      if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (windows.length > 0) closeWindow(topWindowId as WinId);
      }
      if (e.altKey) {
        if (e.key === 't' || e.key === 'T') { e.preventDefault(); openWindow('terminal'); }
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); openWindow('about'); }
        if (e.key === 'p' || e.key === 'P') { e.preventDefault(); openWindow('projects'); }
        if (e.key === 's' || e.key === 'S') { e.preventDefault(); openWindow('skills'); }
        if (e.key === 'c' || e.key === 'C') { e.preventDefault(); openWindow('contact'); }
        if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); }
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); setPowerStateRaw('booting'); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [windows, topWindowId, closeWindow, openWindow, toggleMatrix, matrixOn, addToast]);

  // Wake on sleep
  useEffect(() => {
    if (powerState !== 'sleeping') return;
    const wake = () => {
      setPowerStateRaw('running');
      addToast('System Resumed', 'success');
    };
    window.addEventListener('keydown', wake, { once: true });
    return () => window.removeEventListener('keydown', wake);
  }, [powerState, addToast]);

  // Logo click secret
  const handleLogoClick = useCallback(() => {
    setLogoClickCount(c => {
      const next = c + 1;
      if (next >= 5) {
        setSecretWindowOpen(true);
        addToast('🔓 Secret Unlocked! Hidden Projects!', 'success');
        return 0;
      }
      return next;
    });
  }, [addToast]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const osValue = useMemo<OSContextType>(() => ({
    theme, setTheme, matrixOn, toggleMatrix,
    windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow,
    updateWindowPos, updateWindowSize,
    powerState, setPowerState,
    addToast, startupTime: startupTime.current,
    visitorCount: 0, konamiActive: false,
    jsonData,
  }), [theme, setTheme, matrixOn, toggleMatrix, windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPos, updateWindowSize, powerState, setPowerState, addToast, jsonData]);

  const renderWindowContent = (id: WinId) => {
    switch (id) {
      case 'terminal': return <TerminalWindow />;
      case 'about': return <AboutWindow />;
      case 'skills': return <SkillsWindow />;
      case 'projects': return <ProjectsWindow />;
      case 'contact': return <ContactWindow />;
      case 'settings': return <SettingsWindow />;
      case 'file-explorer': return <FileExplorerWindow />;
      case 'music-player': return <MusicPlayerWindow />;
      case 'browser': return <BrowserWindow />;
      case 'paint': return <PaintWindow />;
      case 'email': return <EmailWindow />;
      case 'calendar': return <CalendarWindow />;
      case 'games': return <GamesWindow />;
      case 'notepad': return <NotepadWindow />;
      default: return <div style={{ padding: 20, color: '#666' }}>Unknown window: {id}</div>;
    }
  };

  // ─── Booting ───
  if (powerState === 'booting') {
    return (
      <OSContext.Provider value={osValue}>
        <BootScreen onComplete={() => { setPowerStateRaw('running'); startupTime.current = Date.now(); }} />
      </OSContext.Provider>
    );
  }

  // ─── Shutdown ───
  if (powerState === 'shutdown') {
    return (
      <OSContext.Provider value={osValue}>
        <ShutdownScreen onWake={() => setPowerStateRaw('booting')} />
      </OSContext.Provider>
    );
  }

  return (
    <OSContext.Provider value={osValue}>
      {/* Mobile */}
      <MobileView />

      {/* Desktop */}
      <div className="desktop-only" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        {/* Matrix canvas */}
        <MatrixRain active={matrixOn} accent={THEMES[theme].accent} />

        {/* Background grid */}
        <div className="bg-grid" />

        {/* CRT overlay */}
        <div className="crt-overlay" />

        {/* Sleep overlay */}
        {powerState === 'sleeping' && (
          <SleepScreen onWake={() => { setPowerStateRaw('running'); addToast('System Resumed', 'success'); }} />
        )}

        {/* Desktop area */}
        <div
          style={{ position: 'fixed', inset: 0, bottom: 48, zIndex: 3 }}
          onContextMenu={handleContextMenu}
          onClick={() => { setStartMenuOpen(false); setContextMenu(null); setSelectedIcon(null); }}
        >
          {/* Desktop Icons */}
          <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 3 }}
            onClick={e => e.stopPropagation()}
          >
            {DESKTOP_ICONS.map(icon => (
              <DesktopIcon
                key={icon.id}
                icon={icon}
                selected={selectedIcon === icon.id}
                position={iconPositions[icon.id] || { x: 8, y: 8 }}
                onPositionChange={(id, pos) => setIconPositions(prev => ({ ...prev, [id]: pos }))}
                onSingleClick={() => setSelectedIcon(icon.id)}
                onDoubleClick={() => {
                  if (icon.id === 'matrix') {
                    toggleMatrix();
                    addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info');
                  } else {
                    openWindow(icon.id as WinId);
                    addToast(`${icon.label} loaded`, 'success');
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Windows */}
        <AnimatePresence>
          {windows.filter(w => !w.minimized).map(win => (
            <WindowFrame
              key={win.id}
              win={win}
              isActive={win.id === topWindowId}
              onClose={() => closeWindow(win.id as WinId)}
              onMinimize={() => minimizeWindow(win.id as WinId)}
              onMaximize={() => maximizeWindow(win.id as WinId)}
              onFocus={() => focusWindow(win.id as WinId)}
              onMove={pos => updateWindowPos(win.id as WinId, pos)}
              onResize={size => updateWindowSize(win.id as WinId, size)}
            >
              {renderWindowContent(win.id)}
            </WindowFrame>
          ))}
        </AnimatePresence>

        {/* Secret window */}
        <AnimatePresence>
          {secretWindowOpen && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              style={{
                position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                width: 480, background: '#050505', border: '2px solid #FFB300',
                borderRadius: 8, zIndex: 9000, boxShadow: '0 0 40px rgba(255,179,0,0.4)',
                overflow: 'hidden',
              }}
            >
              <div style={{ background: '#0a0a0a', padding: '10px 14px', borderBottom: '1px solid #FFB300', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-title)', color: '#FFB300', fontSize: 12, letterSpacing: 2 }}>🔓 HIDDEN PROJECTS</span>
                <button onClick={() => setSecretWindowOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                <div style={{ color: '#FFB300', marginBottom: 12 }}>You found the secret! Here are unreleased projects:</div>
                {[
                  { name: 'Neural OS', desc: 'An AI-powered OS interface that learns your workflow.' },
                  { name: 'QuantumDB', desc: 'A quantum-ready distributed database prototype.' },
                  { name: 'SynthLang', desc: 'A new programming language designed for creative coding.' },
                ].map(p => (
                  <div key={p.name} style={{ border: '1px solid rgba(255,179,0,0.2)', borderRadius: 4, padding: 10, marginBottom: 8 }}>
                    <div style={{ color: '#FFB300', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onRefresh={() => { addToast('Desktop Refreshed', 'success'); }}
            onTheme={k => { setTheme(k); addToast(`Theme: ${THEMES[k].name}`, 'success'); }}
            onToggleMatrix={() => { toggleMatrix(); addToast(`Matrix Rain: ${matrixOn ? 'OFF' : 'ON'}`, 'info'); }}
          />
        )}

        {/* Start menu */}
        <StartMenu
          open={startMenuOpen}
          onClose={() => setStartMenuOpen(false)}
          logoClickCount={logoClickCount}
          onLogoClick={handleLogoClick}
        />

        {/* Taskbar */}
        <Taskbar onStartClick={() => setStartMenuOpen(v => !v)} />

        {/* Toasts */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Global Styles for Resize & Effects */}
        <style>{`
          .konami-flash {
            animation: konami-flash-anim 0.15s infinite alternate !important;
          }
          @keyframes konami-flash-anim {
            0% { filter: hue-rotate(0deg) saturate(1); }
            100% { filter: hue-rotate(45deg) saturate(2.5); }
          }
          .resize-handle {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 16px;
            height: 16px;
            cursor: nwse-resize;
            z-index: 100;
            background: linear-gradient(-45deg, transparent 40%, var(--accent) 41%, var(--accent) 59%, transparent 60%);
            opacity: 0.6;
          }
          .resize-handle:hover {
            opacity: 1;
          }
          .terminal-output::-webkit-scrollbar {
            width: 6px;
          }
          .terminal-output::-webkit-scrollbar-thumb {
            background: var(--accent);
            border-radius: 3px;
          }
          .crt-overlay::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(
              transparent 0px,
              transparent 2px,
              rgba(0, 255, 136, 0.07) 2px,
              rgba(0, 255, 136, 0.07) 4px
            );
            pointer-events: none;
            z-index: 2;
            animation: scanline 4s linear infinite;
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}</style>
      </div>
    </OSContext.Provider>
  );
}

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useOS } from '../../context/OSContext';
import { SKILLS, PROJECTS, THEMES } from '../../data';
import { ThemeKey, WinId } from '../../types/os';

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

export const TerminalWindow = memo(() => {
  const { openWindow, closeWindow, minimizeWindow, toggleMatrix, matrixOn, setTheme, theme, setPowerState, addToast, startupTime, jsonData } = useOS();
  const [history, setHistory] = useState<{ input: string; output: React.ReactNode }[]>([
    { input: '', output: <span style={{ color: 'var(--accent)' }}>SUDHI OS Terminal v3.0 Pro. Type "help" for available commands. Try "ai prompt", "neofetch", "benchmark", "whoami".</span> }
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
      output = (
        <div>
          <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', marginBottom: 8 }}>
            ┌────────────────────────────────────────────────────────┐<br />
            │           SUDHI OS ADVANCED TERMINAL COMMANDS          │<br />
            └────────────────────────────────────────────────────────┘
          </div>
          {[
            ['help', 'Show available commands list'],
            ['whoami', 'Display current system user info'],
            ['neofetch', 'ASCII System & Hardware spec summary'],
            ['benchmark', 'Run browser performance test'],
            ['architecture', 'Show system framework architecture'],
            ['ai <prompt>', 'Ask SudhirDevOps1 Portfolio AI Assistant'],
            ['about', 'Display personal & GitHub bio'],
            ['skills', 'List technical skills with progress bars'],
            ['projects', 'List public GitHub repositories'],
            ['matrix on/off', 'Toggle matrix rain backdrop'],
            ['theme [name]', 'Switch color theme (green/blue/amber/purple)'],
            ['date / time', 'Show system date and time'],
            ['ls / pwd', 'List desktop environment directories'],
            ['history', 'Show command execution history'],
            ['open [app]', 'Launch app window (e.g. open youtube)'],
            ['restart / sleep', 'System power management'],
          ].map(([c, desc]) => (
            <div key={c}>{accent(`  ${c.padEnd(20)}`)} {dim('- ')}{white(desc)}</div>
          ))}
        </div>
      );
    } else if (base === 'whoami') {
      output = (
        <div>
          {white('User:        ')}{accent('Sudhir Singh (SudhirDevOps1)')}<br />
          {white('Role:        ')}{accent('Full-Stack & DevOps Engineer')}<br />
          {white('Location:    ')}{accent('Bihar, India 🇮🇳')}<br />
          {white('Permissions: ')}{accent('root / Administrator')}<br />
        </div>
      );
    } else if (base === 'ai') {
      const prompt = args.join(' ');
      if (!prompt) {
        output = <span style={{ color: '#FF4444' }}>Usage: ai [your question] (e.g. ai What are Sudhir's top skills?)</span>;
      } else {
        output = (
          <div style={{ padding: '6px 10px', border: '1px solid var(--accent)', borderRadius: 6, background: 'rgba(var(--accent-rgb),0.1)' }}>
            <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: 4 }}>🤖 PORTFOLIO AI ASSISTANT:</div>
            <div style={{ color: '#fff' }}>
              Sudhir Singh (SudhirDevOps1) is a BCA student & Full-Stack Developer specializing in React, Node.js, Python, DevOps, and building interactive web operating systems! He has over 87+ public GitHub repos.
            </div>
          </div>
        );
      }
    } else if (base === 'benchmark') {
      const fps = Math.floor(Math.random() * 20 + 55);
      const latency = Math.floor(Math.random() * 8 + 4);
      output = (
        <div>
          {accent('─── BROWSER PERFORMANCE BENCHMARK ──────────────')}<br />
          {white('FPS:        ')}{accent(`${fps} FPS (Smooth 60Hz)`)}<br />
          {white('Render Lag: ')}{accent(`${latency} ms`)}<br />
          {white('VFS Engine: ')}{accent('IndexedDB + LocalStorage (Fast)')}<br />
          {white('DOM Status: ')}{accent('Optimal 100/100')}<br />
        </div>
      );
    } else if (base === 'architecture') {
      output = (
        <div>
          {accent('─── SYSTEM ARCHITECTURE ────────────────────────')}<br />
          {white('Core UI:     ')}{accent('React 19 + TypeScript + Vite 7')}<br />
          {white('Styling:     ')}{accent('Vanilla CSS + Tailwind CSS v4')}<br />
          {white('Animations:  ')}{accent('Framer Motion 12')}<br />
          {white('Icons:       ')}{accent('Lucide-React Vector Set')}<br />
          {white('Bundler:     ')}{accent('Vite SingleFile Plugin')}<br />
        </div>
      );
    } else if (base === 'neofetch') {
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
   /    v3.0      \\`}</pre>
          <div style={{ lineHeight: 1.8 }}>
            {accent('sudhir@portfolio-os')}<br />
            {dim('───────────────────')}<br />
            {white('OS:         ')}{accent('SUDHI OS v3.0 Pro')}<br />
            {white('Developer:  ')}{accent('SudhirDevOps1')}<br />
            {white('Kernel:     ')}{accent('React 19.0.0')}<br />
            {white('Uptime:     ')}{accent(formatUptime(Date.now() - startupTime))}<br />
            {white('Shell:      ')}{accent('TERMINAL v3.0 (bash-sim)')}<br />
            {white('Theme:      ')}{accent(THEMES[theme].name)}<br />
          </div>
        </div>
      );
    } else if (base === 'about') {
      output = (
        <div>
          {white('Name:     ')}{accent('Sudhir Singh (SudhirDevOps1)')}<br />
          {white('Role:     ')}{accent('Full Stack & DevOps Developer')}<br />
          {white('GitHub:   ')}{accent('github.com/SudhirDevOps1')}<br />
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
    } else if (base === 'date') {
      output = accent(new Date().toString());
    } else if (base === 'ls') {
      output = accent('TERMINAL.cmd  ABOUT.exe  SKILLS.sh  PROJECTS/  CONTACT.mail  SETTINGS.cfg  YOUTUBE.app  BROWSER.net  GAMES.exe');
    } else if (base === 'pwd') {
      output = accent('/home/sudhir/portfolio');
    } else if (base === 'history') {
      output = (
        <div>
          {cmdHistory.map((c, i) => <div key={i}>{dim(`  ${i + 1} `)}{white(c)}</div>)}
        </div>
      );
    } else if (base === 'open') {
      const app = args[0]?.toLowerCase();
      if (app) {
        openWindow(app as WinId);
        output = accent(`Opening ${app}...`);
      }
    } else if (base === 'restart') {
      output = accent('Restarting system...');
      setTimeout(() => setPowerState('booting'), 800);
    } else if (base === 'shutdown') {
      output = accent('Shutting down system...');
      setTimeout(() => setPowerState('shutdown'), 800);
    }

    setHistory(prev => [...prev, { input: trimmed, output }]);
    setInput('');
  }, [matrixOn, toggleMatrix, setTheme, theme, addToast, openWindow, closeWindow, minimizeWindow, setPowerState, startupTime, cmdHistory, jsonData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execCommand(input);
    }
  }, [input, execCommand]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <pre style={{ color: 'var(--accent)', fontSize: 10, lineHeight: 1.4, fontFamily: 'var(--font-mono)' }}>{
`╔════════════════════════════════════════════════════════╗
║         SUDHI OS Advanced Terminal v3.0 Pro            ║
╚════════════════════════════════════════════════════════╝`}</pre>
      </div>
      <div ref={outputRef} className="terminal-output" style={{ flex: 1, padding: 12, overflowY: 'auto' }} onClick={() => inputRef.current?.focus()}>
        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {h.input && (
              <div style={{ color: 'var(--accent)', marginBottom: 2 }}>
                <span style={{ color: '#666' }}>sudhir@portfolio</span>:<span style={{ color: '#00BFFF' }}>~</span>$ <span style={{ color: '#fff' }}>{h.input}</span>
              </div>
            )}
            <div>{h.output}</div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', marginTop: 4 }}>
          <span style={{ color: '#666', flexShrink: 0 }}>sudhir@portfolio</span>:<span style={{ color: '#00BFFF' }}>~</span>$ 
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
        </div>
      </div>
    </div>
  );
});
export default TerminalWindow;

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
            ['matrix on/off', 'Toggle matrix rain'],
            ['theme [name]', 'Switch theme: green/blue/amber/purple'],
            ['neofetch', 'System information panel'],
            ['date', 'Show current date/time'],
            ['whoami', 'Display current user'],
            ['ls', 'List desktop items'],
            ['pwd', 'Print working directory'],
            ['echo [msg]', 'Print a message'],
            ['history', 'Show command history'],
            ['battery', 'Show battery status'],
            ['wifi', 'Show wifi status'],
            ['uptime', 'Show system uptime'],
            ['open [app]', 'Open an application'],
            ['restart', 'Restart the system'],
            ['shutdown', 'Shutdown the system'],
            ['sleep', 'Enter sleep mode'],
          ].map(([c, desc]) => (
            <div key={c}>{accent(`  ${c.padEnd(20)}`)} {dim('- ')}{white(desc)}</div>
          ))}
        </div>
      );
    } else if (base === 'about') {
      output = (
        <div>
          {white('Name:     ')}{accent('Sudhi')}<br />
          {white('Role:     ')}{accent('Full Stack Developer')}<br />
          {white('Location: ')}{accent('India 🇮🇳')}<br />
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
      output = (
        <div>
          {PROJECTS.map(p => (
            <div key={p.id}>
              {accent(`  [${p.id}]`)} {white(p.name.padEnd(22))} <span style={{ color: '#aaa' }}>{p.desc.slice(0, 50)}...</span>
            </div>
          ))}
        </div>
      );
    } else if (base === 'date') {
      output = accent(new Date().toString());
    } else if (base === 'whoami') {
      output = accent('sudhi — Full Stack Developer');
    } else if (base === 'ls') {
      output = accent('TERMINAL.cmd  ABOUT.exe  SKILLS.sh  PROJECTS/  CONTACT.mail  SETTINGS.cfg  YOUTUBE.app  BROWSER.net  GAMES.exe');
    } else if (base === 'pwd') {
      output = accent('/home/sudhi/portfolio');
    } else if (base === 'echo') {
      output = <span style={{ color: '#fff' }}>{args.join(' ')}</span>;
    } else if (base === 'uptime') {
      output = accent(`System uptime: ${formatUptime(Date.now() - startupTime)}`);
    } else if (base === 'restart') {
      output = accent('Restarting system...');
      setTimeout(() => setPowerState('booting'), 800);
    } else if (base === 'shutdown') {
      output = accent('Initiating shutdown sequence...');
      setTimeout(() => setPowerState('shutdown'), 800);
    } else if (base === 'sleep') {
      output = accent('Entering sleep mode...');
      setTimeout(() => setPowerState('sleeping'), 800);
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
║            SUDHI OS Terminal v2.0                     ║
╚════════════════════════════════════════════════════════╝`}</pre>
      </div>
      <div ref={outputRef} className="terminal-output" style={{ flex: 1, padding: 12, overflowY: 'auto' }} onClick={() => inputRef.current?.focus()}>
        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {h.input && (
              <div style={{ color: 'var(--accent)', marginBottom: 2 }}>
                <span style={{ color: '#666' }}>sudhi@portfolio</span>:<span style={{ color: '#00BFFF' }}>~</span>$ <span style={{ color: '#fff' }}>{h.input}</span>
              </div>
            )}
            <div>{h.output}</div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', marginTop: 4 }}>
          <span style={{ color: '#666', flexShrink: 0 }}>sudhi@portfolio</span>:<span style={{ color: '#00BFFF' }}>~</span>$ 
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

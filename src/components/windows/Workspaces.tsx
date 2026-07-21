import React, { memo, useState, useEffect } from 'react';
import { Layout, Save, RefreshCw, Layers, Check, Sparkles, Move } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { WinId } from '../../types/os';

export const WorkspacesWindow = memo(() => {
  const { openWindow, focusWindow, closeWindow, windows, addToast } = useOS();

  const WORKSPACE_PRESETS = [
    {
      id: 'devops-suite',
      name: '⚡ DevOps & Cloud Suite',
      desc: 'Opens Terminal, DevOps Monitor, and System Specs',
      apps: ['terminal', 'devops-monitor', 'sysinfo'] as WinId[],
      icon: '⚡',
      color: '#00FF88',
    },
    {
      id: 'developer-hub',
      name: '📁 Full-Stack Portfolio Hub',
      desc: 'Opens Projects Showcase, About Sudhir, and Skills Matrix',
      apps: ['projects', 'about', 'skills'] as WinId[],
      icon: '💼',
      color: '#00BFFF',
    },
    {
      id: 'media-center',
      name: '🎵 Media & Entertainment',
      desc: 'Opens YouTube Player, Music Player, and Photo Gallery',
      apps: ['youtube', 'music-player', 'gallery'] as WinId[],
      icon: '▶️',
      color: '#FF3E6C',
    },
    {
      id: 'live-telemetry',
      name: '🌐 Live Data & Crypto Dashboard',
      desc: 'Opens Weather Live, Crypto Tracker, and Space Monitor',
      apps: ['weather', 'crypto', 'space'] as WinId[],
      icon: '₿',
      color: '#FFB300',
    },
    {
      id: 'ai-workspace',
      name: '🤖 AI & Productivity Suite',
      desc: 'Opens AI Assistant Bot, Notepad Editor, and File Explorer',
      apps: ['ai-assistant', 'notepad', 'file-explorer'] as WinId[],
      icon: '🤖',
      color: '#BF00FF',
    },
  ];

  const launchWorkspace = (apps: WinId[], name: string) => {
    apps.forEach(appId => {
      openWindow(appId);
    });
    addToast(`Workspace Activated: ${name}`, 'success');
  };

  const closeAllOpenWindows = () => {
    windows.forEach(w => closeWindow(w.id));
    addToast('All open windows closed', 'info');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#090b11', fontFamily: 'var(--font-mono)', color: '#fff', padding: 18, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: 10, borderRadius: 10, background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)' }}>
          <Layout size={24} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
            WORKSPACES & SPACES LAUNCHER <span style={{ fontSize: 9, background: '#00FF8822', color: '#00FF88', padding: '1px 6px', borderRadius: 4, border: '1px solid #00FF8844' }}>2026 FEATURE</span>
          </div>
          <div style={{ fontSize: 11, color: '#666' }}>One-click multi-window app grouping & workspace automation</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={closeAllOpenWindows}
          style={{ padding: '6px 12px', border: '1px solid #FF444444', background: 'rgba(255,68,68,0.1)', color: '#FF4444', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          ✕ Close All Windows
        </button>
      </div>

      {/* Preset Workspaces */}
      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#aaa', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkles size={14} color="var(--accent)" /> PRESET APP WORKSPACES
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
        {WORKSPACE_PRESETS.map(ws => (
          <div key={ws.id} onClick={() => launchWorkspace(ws.apps, ws.name)}
            style={{
              padding: 16, borderRadius: 10, background: '#0e111a', border: `1px solid ${ws.color}44`,
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ws.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${ws.color}44`; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{ws.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: ws.color }}>{ws.name}</div>
            </div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 14, lineHeight: 1.5 }}>{ws.desc}</div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ws.apps.map(app => (
                <span key={app} style={{ fontSize: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4, color: '#ccc' }}>
                  {app}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Active Windows Summary */}
      <div style={{ padding: 14, borderRadius: 10, background: 'rgba(var(--accent-rgb),0.05)', border: '1px solid rgba(var(--accent-rgb),0.2)' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} /> Currently Active Windows ({windows.length})
        </div>
        {windows.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {windows.map(w => (
              <span key={w.id} onClick={() => focusWindow(w.id)}
                style={{ padding: '4px 10px', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer' }}>
                {w.title}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>No open windows. Click any workspace above to auto-group app windows!</div>
        )}
      </div>
    </div>
  );
});
export default WorkspacesWindow;

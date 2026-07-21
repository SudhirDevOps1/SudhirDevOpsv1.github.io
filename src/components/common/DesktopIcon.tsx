import React, { memo, useRef } from 'react';
import {
  Terminal, User, Zap, FolderGit2, Youtube, Globe, Globe2, Image as ImageIcon, Video,
  Gamepad2, Folder, Music, Palette, Mail, Calendar, FileText, Settings, Send, Activity,
  Map, Cloud, TrendingUp, Rocket, BookOpen, Bot, Server, Shield, Cpu, Layout
} from 'lucide-react';

import { DESKTOP_ICONS } from '../../data';

interface DesktopIconProps {
  icon: typeof DESKTOP_ICONS[0];
  selected: boolean;
  onSingleClick: () => void;
  onDoubleClick: () => void;
  position: { x: number; y: number };
  onPositionChange: (id: string, pos: { x: number; y: number }) => void;
}

export const DesktopIcon = memo(({ icon, selected, onSingleClick, onDoubleClick, position, onPositionChange }: DesktopIconProps) => {
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleClick = () => {
    if (dragRef.current?.isDragging) { dragRef.current = null; return; }
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick();
    } else {
      onSingleClick();
      clickTimer.current = setTimeout(() => { clickTimer.current = null; }, 260);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = { isDragging: false, startX: e.clientX, startY: e.clientY, startPosX: position.x, startPosY: position.y };
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      if (!dragRef.current.isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) dragRef.current.isDragging = true;
      if (dragRef.current.isDragging) {
        const newX = Math.max(6, Math.min(window.innerWidth - 80, dragRef.current.startPosX + dx));
        const newY = Math.max(6, Math.min(window.innerHeight - 90, dragRef.current.startPosY + dy));
        onPositionChange(icon.id, { x: newX, y: newY });
      }
    };
    const handleMouseUp = () => {
      if (dragRef.current?.isDragging) setTimeout(() => { dragRef.current = null; }, 100);
      else dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Modern Windows 11 Fluent 3D/Glass Icon Styling
  const getAppMeta = (name?: string, id?: string) => {
    const s = 22;
    switch (name || id) {
      case 'Terminal':
      case 'terminal':
        return { icon: <Terminal size={s} color="#4AF626" />, gradient: 'linear-gradient(135deg, #0d1e14 0%, #06110a 100%)', glow: 'rgba(74,246,38,0.35)', border: 'rgba(74,246,38,0.4)' };
      case 'User':
      case 'about':
        return { icon: <User size={s} color="#00D2FF" />, gradient: 'linear-gradient(135deg, #092537 0%, #03101a 100%)', glow: 'rgba(0,210,255,0.35)', border: 'rgba(0,210,255,0.4)' };
      case 'Zap':
      case 'skills':
        return { icon: <Zap size={s} color="#FFD700" />, gradient: 'linear-gradient(135deg, #2e2405 0%, #151001 100%)', glow: 'rgba(255,215,0,0.35)', border: 'rgba(255,215,0,0.4)' };
      case 'FolderGit2':
      case 'projects':
        return { icon: <FolderGit2 size={s} color="#FF3E6C" />, gradient: 'linear-gradient(135deg, #330814 0%, #150308 100%)', glow: 'rgba(255,62,108,0.35)', border: 'rgba(255,62,108,0.4)' };
      case 'Youtube':
      case 'youtube':
        return { icon: <Youtube size={s} color="#FF0000" />, gradient: 'linear-gradient(135deg, #3a0000 0%, #150000 100%)', glow: 'rgba(255,0,0,0.35)', border: 'rgba(255,0,0,0.4)' };
      case 'Globe':
      case 'browser':
        return { icon: <Globe size={s} color="#00E5FF" />, gradient: 'linear-gradient(135deg, #002b36 0%, #001217 100%)', glow: 'rgba(0,229,255,0.35)', border: 'rgba(0,229,255,0.4)' };
      case 'Globe2':
      case 'countries':
        return { icon: <Globe2 size={s} color="#00F0FF" />, gradient: 'linear-gradient(135deg, #002733 0%, #001017 100%)', glow: 'rgba(0,240,255,0.35)', border: 'rgba(0,240,255,0.4)' };
      case 'Image':
      case 'gallery':
        return { icon: <ImageIcon size={s} color="#FFB300" />, gradient: 'linear-gradient(135deg, #2d1f00 0%, #140d00 100%)', glow: 'rgba(255,179,0,0.35)', border: 'rgba(255,179,0,0.4)' };
      case 'Video':
      case 'videoplayer':
        return { icon: <Video size={s} color="#D000FF" />, gradient: 'linear-gradient(135deg, #280033 0%, #100014 100%)', glow: 'rgba(208,0,255,0.35)', border: 'rgba(208,0,255,0.4)' };
      case 'Gamepad2':
      case 'games':
        return { icon: <Gamepad2 size={s} color="#00FF88" />, gradient: 'linear-gradient(135deg, #002e18 0%, #001209 100%)', glow: 'rgba(0,255,136,0.35)', border: 'rgba(0,255,136,0.4)' };
      case 'Folder':
      case 'file-explorer':
        return { icon: <Folder size={s} color="#FFC700" />, gradient: 'linear-gradient(135deg, #302400 0%, #140f00 100%)', glow: 'rgba(255,199,0,0.35)', border: 'rgba(255,199,0,0.4)' };
      case 'Music':
      case 'music-player':
        return { icon: <Music size={s} color="#FF2D55" />, gradient: 'linear-gradient(135deg, #30060e 0%, #140205 100%)', glow: 'rgba(255,45,85,0.35)', border: 'rgba(255,45,85,0.4)' };
      case 'Palette':
      case 'paint':
        return { icon: <Palette size={s} color="#FF5E00" />, gradient: 'linear-gradient(135deg, #301000 0%, #140600 100%)', glow: 'rgba(255,94,0,0.35)', border: 'rgba(255,94,0,0.4)' };
      case 'FileText':
      case 'notepad':
        return { icon: <FileText size={s} color="#E0E0E0" />, gradient: 'linear-gradient(135deg, #222530 0%, #0e0f14 100%)', glow: 'rgba(220,220,220,0.25)', border: 'rgba(220,220,220,0.3)' };
      case 'Calendar':
      case 'calendar':
        return { icon: <Calendar size={s} color="#5E5CE6" />, gradient: 'linear-gradient(135deg, #111030 0%, #060514 100%)', glow: 'rgba(94,92,230,0.35)', border: 'rgba(94,92,230,0.4)' };
      case 'Map':
      case 'map':
        return { icon: <Map size={s} color="#30D158" />, gradient: 'linear-gradient(135deg, #08260f 0%, #031006 100%)', glow: 'rgba(48,209,88,0.35)', border: 'rgba(48,209,88,0.4)' };
      case 'Cloud':
      case 'weather':
        return { icon: <Cloud size={s} color="#64D2FF" />, gradient: 'linear-gradient(135deg, #092330 0%, #030e14 100%)', glow: 'rgba(100,210,255,0.35)', border: 'rgba(100,210,255,0.4)' };
      case 'TrendingUp':
      case 'crypto':
        return { icon: <TrendingUp size={s} color="#FF9500" />, gradient: 'linear-gradient(135deg, #301b00 0%, #140b00 100%)', glow: 'rgba(255,149,0,0.35)', border: 'rgba(255,149,0,0.4)' };
      case 'Rocket':
      case 'space':
        return { icon: <Rocket size={s} color="#00C7BE" />, gradient: 'linear-gradient(135deg, #002624 0%, #00100f 100%)', glow: 'rgba(0,199,190,0.35)', border: 'rgba(0,199,190,0.4)' };
      case 'Bot':
      case 'ai-assistant':
        return { icon: <Bot size={s} color="#32ADE6" />, gradient: 'linear-gradient(135deg, #05202e 0%, #020d14 100%)', glow: 'rgba(50,173,230,0.35)', border: 'rgba(50,173,230,0.4)' };
      case 'Server':
      case 'devops-monitor':
        return { icon: <Server size={s} color="#34C759" />, gradient: 'linear-gradient(135deg, #072410 0%, #020e06 100%)', glow: 'rgba(52,199,89,0.35)', border: 'rgba(52,199,89,0.4)' };
      case 'Cpu':
      case 'sysinfo':
        return { icon: <Cpu size={s} color="#BF5AF2" />, gradient: 'linear-gradient(135deg, #250933 0%, #0f0314 100%)', glow: 'rgba(191,90,242,0.35)', border: 'rgba(191,90,242,0.4)' };
      case 'Mail':
      case 'email':
        return { icon: <Mail size={s} color="#007AFF" />, gradient: 'linear-gradient(135deg, #001633 0%, #000814 100%)', glow: 'rgba(0,122,255,0.35)', border: 'rgba(0,122,255,0.4)' };
      case 'Settings':
      case 'settings':
        return { icon: <Settings size={s} color="#8E8E93" />, gradient: 'linear-gradient(135deg, #1c1c1e 0%, #0b0b0c 100%)', glow: 'rgba(142,142,147,0.25)', border: 'rgba(142,142,147,0.3)' };
      default:
        return { icon: <Activity size={s} color="#00FF88" />, gradient: 'linear-gradient(135deg, #0a1f14 0%, #030d08 100%)', glow: 'rgba(0,255,136,0.35)', border: 'rgba(0,255,136,0.4)' };
    }
  };

  const meta = getAppMeta((icon as any).lucide, icon.id);
  const short = icon.label.split('.')[0]; // e.g. "TERMINAL" from "TERMINAL.cmd"

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        padding: '6px 4px 6px 4px',
        cursor: 'pointer', borderRadius: 10, userSelect: 'none',
        border: selected ? `1.5px solid ${meta.border}` : '1px solid rgba(255,255,255,0.06)',
        background: selected ? 'rgba(255,255,255,0.1)' : 'rgba(10,12,18,0.65)',
        backdropFilter: 'blur(12px) saturate(180%)',
        width: 74, minHeight: 74,
        transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s, border-color 0.2s',
        boxShadow: selected ? `0 0 16px ${meta.glow}, 0 4px 12px rgba(0,0,0,0.6)` : '0 4px 10px rgba(0,0,0,0.45)',
        zIndex: 3,
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.border = `1.5px solid ${meta.border}`;
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.06)';
          e.currentTarget.style.boxShadow = `0 6px 20px ${meta.glow}, 0 4px 12px rgba(0,0,0,0.5)`;
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
          e.currentTarget.style.transform = 'translateY(0px) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.45)';
        }
      }}
    >
      {/* 3D Realistic Icon Box with Dynamic Color Gradient & Glass Glow */}
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: meta.gradient,
        border: `1px solid ${meta.border}`,
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 12px ${meta.glow}`,
        transition: 'all 0.2s',
      }}>
        {meta.icon}
      </div>

      {/* Label with Soft Shadow */}
      <span style={{
        color: selected ? '#fff' : '#e2e8f0',
        fontSize: 9,
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: '0 1px 3px rgba(0,0,0,0.95)',
        wordBreak: 'break-all',
        maxWidth: '100%',
        fontWeight: 600,
        letterSpacing: 0.2,
      }}>
        {short}
      </span>
    </div>
  );
});

import React, { memo, useRef } from 'react';
import {
  Terminal, User, Zap, FolderGit2, Youtube, Globe, Globe2, Image as ImageIcon, Video,
  Gamepad2, Folder, Music, Palette, Mail, Calendar, FileText, Settings, Send, Activity,
  Map, Cloud, TrendingUp, Rocket, BookOpen
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

  const getLucideIcon = (name?: string) => {
    const s = 22;
    switch (name) {
      case 'Terminal':    return <Terminal size={s} color="#00FF88" />;
      case 'User':        return <User size={s} color="#00BFFF" />;
      case 'Zap':         return <Zap size={s} color="#FFB300" />;
      case 'FolderGit2':  return <FolderGit2 size={s} color="#FF69B4" />;
      case 'Youtube':     return <Youtube size={s} color="#FF0000" />;
      case 'Globe':       return <Globe size={s} color="#00BFFF" />;
      case 'Globe2':      return <Globe2 size={s} color="#00BFFF" />;
      case 'Image':       return <ImageIcon size={s} color="#FFB300" />;
      case 'Video':       return <Video size={s} color="#BF00FF" />;
      case 'Gamepad2':    return <Gamepad2 size={s} color="#00FF88" />;
      case 'Folder':      return <Folder size={s} color="#FFD700" />;
      case 'Music':       return <Music size={s} color="#FF69B4" />;
      case 'Palette':     return <Palette size={s} color="#FF4500" />;
      case 'Mail':        return <Mail size={s} color="#00E5FF" />;
      case 'Calendar':    return <Calendar size={s} color="#7C4DFF" />;
      case 'FileText':    return <FileText size={s} color="#9E9E9E" />;
      case 'Settings':    return <Settings size={s} color="#aaa" />;
      case 'Send':        return <Send size={s} color="#00B0FF" />;
      case 'Activity':    return <Activity size={s} color="#00FF88" />;
      case 'Bot':         return <Bot size={s} color="#00FF88" />;
      case 'Map':         return <Map size={s} color="#00E676" />;
      case 'Cloud':       return <Cloud size={s} color="#87CEEB" />;
      case 'TrendingUp':  return <TrendingUp size={s} color="#FFB300" />;
      case 'Rocket':      return <Rocket size={s} color="#00BFFF" />;
      case 'BookOpen':    return <BookOpen size={s} color="#FF8800" />;
      default:            return null;
    }
  };

  const iconNode = getLucideIcon((icon as any).lucide);
  const short = icon.label.split('.')[0]; // e.g. "TERMINAL" from "TERMINAL.cmd"

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '6px 4px 6px 4px',
        cursor: 'pointer', borderRadius: 8, userSelect: 'none',
        border: selected ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.07)',
        background: selected ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        width: 72, minHeight: 72,
        transition: 'transform 0.12s, box-shadow 0.15s, border-color 0.15s',
        boxShadow: selected ? '0 0 14px rgba(var(--accent-rgb),0.5)' : '0 2px 8px rgba(0,0,0,0.5)',
        zIndex: 3,
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.border = '1.5px solid rgba(var(--accent-rgb),0.5)';
          e.currentTarget.style.transform = 'scale(1.06)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {/* Icon Box */}
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(0,0,0,0.6))',
        border: '1px solid rgba(var(--accent-rgb),0.2)',
        fontSize: icon.emoji ? 20 : 16,
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
      }}>
        {iconNode ?? (icon.emoji ?? icon.icon)}
      </div>
      {/* Label */}
      <span style={{
        color: selected ? 'var(--accent)' : '#e0e0e0',
        fontSize: 9,
        fontFamily: 'var(--font-mono)',
        textAlign: 'center',
        lineHeight: 1.2,
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        wordBreak: 'break-all',
        maxWidth: '100%',
        fontWeight: selected ? 'bold' : 'normal',
      }}>
        {short}
      </span>
    </div>
  );
});

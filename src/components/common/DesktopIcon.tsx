import React, { memo, useRef } from 'react';
import {
  Terminal, User, Zap, FolderGit2, Youtube, Globe, Image as ImageIcon, Video, Gamepad2,
  Folder, Music, Palette, Mail, Calendar, FileText, Settings, Send, Activity
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
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
      }, 250);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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
        setTimeout(() => { dragRef.current = null; }, 100);
      } else {
        dragRef.current = null;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getLucideIcon = (name?: string) => {
    switch (name) {
      case 'Terminal': return <Terminal size={24} />;
      case 'User': return <User size={24} />;
      case 'Zap': return <Zap size={24} />;
      case 'FolderGit2': return <FolderGit2 size={24} />;
      case 'Youtube': return <Youtube size={24} color="#FF0000" />;
      case 'Globe': return <Globe size={24} color="#00BFFF" />;
      case 'Image': return <ImageIcon size={24} color="#FFB300" />;
      case 'Video': return <Video size={24} color="#BF00FF" />;
      case 'Gamepad2': return <Gamepad2 size={24} color="#00FF88" />;
      case 'Folder': return <Folder size={24} color="#FFD700" />;
      case 'Music': return <Music size={24} color="#FF69B4" />;
      case 'Palette': return <Palette size={24} color="#FF4500" />;
      case 'Mail': return <Mail size={24} color="#00E5FF" />;
      case 'Calendar': return <Calendar size={24} color="#7C4DFF" />;
      case 'FileText': return <FileText size={24} color="#9E9E9E" />;
      case 'Settings': return <Settings size={24} color="#00E676" />;
      case 'Send': return <Send size={24} color="#00B0FF" />;
      case 'Activity': return <Activity size={24} color="#00FF88" />;
      default: return null;
    }
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
        padding: 8, cursor: 'move', borderRadius: 8, userSelect: 'none',
        border: selected ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
        background: selected ? 'rgba(var(--accent-rgb),0.2)' : 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        width: 80, transition: 'transform 0.1s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 12px rgba(var(--accent-rgb),0.4)' : '0 2px 8px rgba(0,0,0,0.4)',
        zIndex: 3,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        border: '1px solid rgba(var(--accent-rgb),0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(0,0,0,0.7))',
        fontSize: icon.emoji ? 22 : 18,
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
      }}>
        {(icon as any).lucide ? getLucideIcon((icon as any).lucide) : (icon.emoji ?? icon.icon)}
      </div>
      <span style={{ color: '#eee', fontSize: 10, fontFamily: 'var(--font-mono)', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2, textShadow: '0 1px 2px #000' }}>
        {icon.label}
      </span>
    </div>
  );
});

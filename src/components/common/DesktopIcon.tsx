import React, { memo, useRef } from 'react';

import { DESKTOP_ICONS } from '../../data';
import { getAppIcon } from '../../iconMeta';

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

  const meta = getAppIcon(icon.id);
  const Glyph = meta.glyph;
  // Real-OS style: readable name derived from the label prefix (e.g. "TERMINAL" -> "Terminal")
  const short = icon.label.split('.')[0];
  const displayName = short.charAt(0).toUpperCase() + short.slice(1).toLowerCase();

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={`sudhi-dicon${selected ? ' sudhi-dicon--selected' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
    >
      {/* App tile: bright gradient squircle with white glyph + drop shadow */}
      <div
        className="sudhi-dicon__tile"
        style={{
          background: `linear-gradient(135deg, ${meta.from} 0%, ${meta.to} 100%)`,
          boxShadow: selected
            ? `0 0 0 2px rgba(255,255,255,0.85), 0 6px 18px ${meta.glow}, 0 10px 24px rgba(0,0,0,0.5)`
            : `0 4px 10px rgba(0,0,0,0.4), 0 8px 20px ${meta.glow}`,
        }}
      >
        <span
          className="sudhi-dicon__glyph"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}
        >
          <Glyph size={24} strokeWidth={2} color="#ffffff" />
        </span>
      </div>

      {/* Label: normal case, legible over any wallpaper */}
      <span
        className="sudhi-dicon__label"
        style={{ color: selected ? '#ffffff' : 'rgba(255,255,255,0.92)' }}
      >
        {displayName}
      </span>
    </div>
  );
});

import React, { memo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WinState } from '../../types/os';

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

export const WindowFrame = memo(({
  win, children, onClose, onMinimize, onMaximize, onFocus, onMove, onResize, isActive
}: WindowFrameProps) => {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{
    startX: number; startY: number;
    origX: number; origY: number;
    origW: number; origH: number;
    direction: string;
  } | null>(null);

  const handleTitleDoubleClick = useCallback(() => {
    onMaximize();
  }, [onMaximize]);

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
        case 'se':
          newW = Math.max(320, resizeRef.current.origW + dx);
          newH = Math.max(240, resizeRef.current.origH + dy);
          break;
        case 'sw':
          newW = Math.max(320, resizeRef.current.origW - dx);
          newH = Math.max(240, resizeRef.current.origH + dy);
          newX = resizeRef.current.origX + dx;
          break;
        case 'ne':
          newW = Math.max(320, resizeRef.current.origW + dx);
          newH = Math.max(240, resizeRef.current.origH - dy);
          newY = resizeRef.current.origY + dy;
          break;
        case 'nw':
          newW = Math.max(320, resizeRef.current.origW - dx);
          newH = Math.max(240, resizeRef.current.origH - dy);
          newX = resizeRef.current.origX + dx;
          newY = resizeRef.current.origY + dy;
          break;
        case 'n':
          newH = Math.max(240, resizeRef.current.origH - dy);
          newY = resizeRef.current.origY + dy;
          break;
        case 's':
          newH = Math.max(240, resizeRef.current.origH + dy);
          break;
        case 'e':
          newW = Math.max(320, resizeRef.current.origW + dx);
          break;
        case 'w':
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF5F57', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Close">
            <span style={{ color: '#000', fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>×</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} style={{ width: 14, height: 14, borderRadius: '50%', background: '#FEBC2E', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Minimize">
            <span style={{ color: '#000', fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>−</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} style={{ width: 14, height: 14, borderRadius: '50%', background: '#28C840', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Maximize">
            <span style={{ color: '#000', fontSize: 8, fontWeight: 'bold', lineHeight: 1 }}>□</span>
          </button>
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 11, color: isActive ? 'var(--accent)' : '#666', letterSpacing: 2, textTransform: 'uppercase', marginRight: 36 }}>
          {win.title}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>

      {!win.maximized && (
        <>
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} style={{ position: 'absolute', left: -4, top: -4, width: 12, height: 12, cursor: 'nwse-resize', zIndex: 100 }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} style={{ position: 'absolute', right: -4, top: -4, width: 12, height: 12, cursor: 'nesw-resize', zIndex: 100 }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} style={{ position: 'absolute', left: -4, bottom: -4, width: 12, height: 12, cursor: 'nesw-resize', zIndex: 100 }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'se')} style={{ position: 'absolute', right: -4, bottom: -4, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'n')} style={{ position: 'absolute', left: 12, right: 12, top: -4, height: 8, cursor: 'ns-resize', zIndex: 99 }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 's')} style={{ position: 'absolute', left: 12, right: 12, bottom: -4, height: 8, cursor: 'ns-resize', zIndex: 99 }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'w')} style={{ position: 'absolute', top: 12, bottom: 12, left: -4, width: 8, cursor: 'ew-resize', zIndex: 99 }} />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'e')} style={{ position: 'absolute', top: 12, bottom: 12, right: -4, width: 8, cursor: 'ew-resize', zIndex: 99 }} />
        </>
      )}
    </motion.div>
  );
});

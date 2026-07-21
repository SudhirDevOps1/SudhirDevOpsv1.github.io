import React, { memo, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, X, Copy, Pin, Sparkles } from 'lucide-react';
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

  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | null>(null);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

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

      // Snap preview calculation (Windows 11 snap zone)
      if (ev.clientX < 20) {
        setSnapPreview('left');
      } else if (ev.clientX > window.innerWidth - 20) {
        setSnapPreview('right');
      } else if (ev.clientY < 20) {
        setSnapPreview('top');
      } else {
        setSnapPreview(null);
      }

      onMove({ x: Math.max(0, x), y: Math.max(0, y) });
    };

    const up = (ev: MouseEvent) => {
      dragRef.current = null;
      setSnapPreview(null);

      // Perform Snap action if released on edge
      if (ev.clientX < 20) {
        // Snap Left Half
        onMove({ x: 0, y: 0 });
        onResize({ w: Math.floor(window.innerWidth / 2), h: window.innerHeight - 48 });
      } else if (ev.clientX > window.innerWidth - 20) {
        // Snap Right Half
        onMove({ x: Math.floor(window.innerWidth / 2), y: 0 });
        onResize({ w: Math.floor(window.innerWidth / 2), h: window.innerHeight - 48 });
      } else if (ev.clientY < 20) {
        // Snap Full Maximize
        onMaximize();
      }

      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [win.maximized, win.size, onFocus, onMove, onResize, onMaximize, handleTitleDoubleClick]);

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
          newW = Math.max(340, resizeRef.current.origW + dx);
          newH = Math.max(240, resizeRef.current.origH + dy);
          break;
        case 'sw':
          newW = Math.max(340, resizeRef.current.origW - dx);
          newH = Math.max(240, resizeRef.current.origH + dy);
          newX = resizeRef.current.origX + dx;
          break;
        case 'ne':
          newW = Math.max(340, resizeRef.current.origW + dx);
          newH = Math.max(240, resizeRef.current.origH - dy);
          newY = resizeRef.current.origY + dy;
          break;
        case 'nw':
          newW = Math.max(340, resizeRef.current.origW - dx);
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
          newW = Math.max(340, resizeRef.current.origW + dx);
          break;
        case 'w':
          newW = Math.max(340, resizeRef.current.origW - dx);
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

  const effectiveZIndex = isAlwaysOnTop ? win.zIndex + 500 : win.zIndex;

  const style: React.CSSProperties = win.maximized
    ? { position: 'fixed', inset: 0, bottom: 48, width: '100vw', height: 'calc(100vh - 48px)', zIndex: effectiveZIndex, borderRadius: 0 }
    : {
      position: 'fixed',
      left: win.position.x,
      top: win.position.y,
      width: win.size.w,
      height: win.size.h,
      zIndex: effectiveZIndex,
      borderRadius: 10,
    };

  return (
    <>
      {/* Translucent Snap Preview Overlay */}
      {snapPreview === 'left' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '50vw', height: 'calc(100vh - 48px)', background: 'rgba(var(--accent-rgb), 0.15)', border: '2px dashed var(--accent)', zIndex: 9998, backdropFilter: 'blur(4px)' }} />
      )}
      {snapPreview === 'right' && (
        <div style={{ position: 'fixed', right: 0, top: 0, width: '50vw', height: 'calc(100vh - 48px)', background: 'rgba(var(--accent-rgb), 0.15)', border: '2px dashed var(--accent)', zIndex: 9998, backdropFilter: 'blur(4px)' }} />
      )}
      {snapPreview === 'top' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: 'calc(100vh - 48px)', background: 'rgba(var(--accent-rgb), 0.15)', border: '2px dashed var(--accent)', zIndex: 9998, backdropFilter: 'blur(4px)' }} />
      )}

      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          ...style,
          background: 'rgba(12, 14, 20, 0.95)',
          border: `1px solid ${isActive ? 'rgba(var(--accent-rgb),0.8)' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: isActive
            ? '0 12px 40px rgba(0,0,0,0.8), 0 0 25px rgba(var(--accent-rgb),0.35)'
            : '0 8px 30px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseDown={onFocus}
      >
        {/* Windows 11 Title Bar */}
        <div
          onMouseDown={handleTitleMouseDown}
          style={{
            background: isActive ? 'rgba(18, 22, 34, 0.98)' : 'rgba(13, 15, 22, 0.92)',
            borderBottom: `1px solid ${isActive ? 'rgba(var(--accent-rgb),0.35)' : 'rgba(255,255,255,0.06)'}`,
            padding: '0 6px 0 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: win.maximized ? 'default' : 'move',
            userSelect: 'none',
            flexShrink: 0,
            height: 34,
            minHeight: 34,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <span style={{ fontSize: 13 }}>{win.title.split(' ')[0]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isActive ? '#fff' : '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500, flex: 1, minWidth: 0 }}>
              {win.title.includes(' ') ? win.title.slice(win.title.indexOf(' ') + 1) : win.title}
            </span>
          </div>

          {/* Window Controls: macOS-inspired + Windows style */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {/* Always on Top Pin */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsAlwaysOnTop(v => !v); }}
              title={isAlwaysOnTop ? 'Unpin Always on Top' : 'Always on Top'}
              style={{
                width: 24, height: 24, border: 'none',
                background: isAlwaysOnTop ? 'rgba(var(--accent-rgb),0.25)' : 'transparent',
                color: isAlwaysOnTop ? 'var(--accent)' : '#555',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 4, transition: 'all 0.15s', marginRight: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = isAlwaysOnTop ? 'var(--accent)' : '#555'; }}
            >
              <Pin size={11} style={{ transform: isAlwaysOnTop ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Minimize — yellow dot */}
            <button
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              title="Minimize (–)"
              style={{
                width: 13, height: 13, border: 'none',
                background: '#FFB300', color: 'transparent',
                cursor: 'pointer', borderRadius: '50%',
                transition: 'filter 0.15s', flexShrink: 0,
                boxShadow: '0 0 4px rgba(255,179,0,0.4)',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.3)'; e.currentTarget.textContent = '–'; e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.fontSize = '10px'; e.currentTarget.style.fontWeight = 'bold'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.textContent = ''; }}
            />

            {/* Maximize — green dot */}
            <button
              onClick={(e) => { e.stopPropagation(); onMaximize(); }}
              title={win.maximized ? 'Restore' : 'Maximize (⛶)'}
              style={{
                width: 13, height: 13, border: 'none',
                background: '#00C853', color: 'transparent',
                cursor: 'pointer', borderRadius: '50%',
                transition: 'filter 0.15s', flexShrink: 0,
                boxShadow: '0 0 4px rgba(0,200,83,0.4)',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.3)'; e.currentTarget.textContent = win.maximized ? '⊡' : '⛶'; e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.fontSize = '9px'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.textContent = ''; }}
            />

            {/* Close — red dot */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              title="Close (×)"
              style={{
                width: 13, height: 13, border: 'none',
                background: '#FF3B30', color: 'transparent',
                cursor: 'pointer', borderRadius: '50%',
                transition: 'filter 0.15s', flexShrink: 0,
                boxShadow: '0 0 4px rgba(255,59,48,0.4)',
                marginLeft: 2,
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.3)'; e.currentTarget.textContent = '×'; e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.fontSize = '12px'; e.currentTarget.style.fontWeight = 'bold'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.textContent = ''; }}
            />
          </div>
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
    </>
  );
});

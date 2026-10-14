import { memo, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Minus, Square, Copy, X } from 'lucide-react';
import { WinState } from '../../types/os';
import { sfx } from '../../lib/sfx';

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

  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | 'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const snapRef = useRef<'left' | 'right' | 'top' | 'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const setSnap = useCallback((v: 'left' | 'right' | 'top' | 'tl' | 'tr' | 'bl' | 'br' | null) => {
    snapRef.current = v;
    setSnapPreview(v);
  }, []);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const snapHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Snap Layouts (Windows 11 style flyout on maximize-button hover) ──────
  const applySnap = useCallback((kind: 'left' | 'right' | 'top' | 'halfBottom' | 'tl' | 'tr' | 'bl' | 'br') => {
    const W = window.innerWidth;
    const H = window.innerHeight - 48; // taskbar
    const hw = Math.floor(W / 2);
    const hh = Math.floor(H / 2);

    if (win.maximized) onMaximize(); // restore first so snap geometry is visible

    const geo: Record<string, { x: number; y: number; w: number; h: number }> = {
      left:      { x: 0,          y: 0,   w: hw, h: H },
      right:     { x: hw,         y: 0,   w: hw, h: H },
      top:       { x: 0,          y: 0,   w: W,  h: H },
      halfBottom:{ x: 0,          y: hh,  w: W,  h: hh },
      tl:        { x: 0,          y: 0,   w: hw, h: hh },
      tr:        { x: hw,         y: 0,   w: hw, h: hh },
      bl:        { x: 0,          y: hh,  w: hw, h: hh },
      br:        { x: hw,         y: hh,  w: hw, h: hh },
    };
    const g = geo[kind];
    onMove({ x: g.x, y: g.y });
    onResize({ w: g.w, h: g.h });
    setShowSnapMenu(false);
    sfx.play('snap');
    onFocus();
  }, [win.maximized, onMaximize, onMove, onResize, onFocus]);

  const openSnapMenuDelayed = useCallback(() => {
    if (snapHoverTimer.current) clearTimeout(snapHoverTimer.current);
    snapHoverTimer.current = setTimeout(() => setShowSnapMenu(true), 320);
  }, []);

  // Grace period close: lets the pointer travel from the button into the flyout without it vanishing
  const closeSnapMenuDelayed = useCallback(() => {
    if (snapHoverTimer.current) clearTimeout(snapHoverTimer.current);
    snapHoverTimer.current = setTimeout(() => setShowSnapMenu(false), 220);
  }, []);

  const keepSnapMenuOpen = useCallback(() => {
    if (snapHoverTimer.current) clearTimeout(snapHoverTimer.current);
    snapHoverTimer.current = null;
    setShowSnapMenu(true);
  }, []);

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

      // Snap preview calculation (Windows 11 snap zone — edges + corners)
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (ev.clientX < 24 && ev.clientY < 24) {
        setSnap('tl');
      } else if (ev.clientX > W - 24 && ev.clientY < 24) {
        setSnap('tr');
      } else if (ev.clientX < 24 && ev.clientY > H - 72) {
        setSnap('bl');
      } else if (ev.clientX > W - 24 && ev.clientY > H - 72) {
        setSnap('br');
      } else if (ev.clientX < 20) {
        setSnap('left');
      } else if (ev.clientX > W - 20) {
        setSnap('right');
      } else if (ev.clientY < 20) {
        setSnap('top');
      } else {
        setSnap(null);
      }

      onMove({ x: Math.max(0, x), y: Math.max(0, y) });
    };

    const up = (ev: MouseEvent) => {
      dragRef.current = null;
      const preview = snapRef.current;
      setSnap(null);

      // Quarter-corner snaps take priority
      if (preview === 'tl' || preview === 'tr' || preview === 'bl' || preview === 'br') {
        applySnap(preview);
      } else if (ev.clientX < 20) {
        // Snap Left Half
        onMove({ x: 0, y: 0 });
        onResize({ w: Math.floor(window.innerWidth / 2), h: window.innerHeight - 48 });
        sfx.play('snap');
      } else if (ev.clientX > window.innerWidth - 20) {
        // Snap Right Half
        onMove({ x: Math.floor(window.innerWidth / 2), y: 0 });
        onResize({ w: Math.floor(window.innerWidth / 2), h: window.innerHeight - 48 });
        sfx.play('snap');
      } else if (ev.clientY < 20) {
        // Snap Full Maximize
        onMaximize();
      }

      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [win.maximized, win.size, onFocus, onMove, onResize, onMaximize, handleTitleDoubleClick, applySnap, setSnap]);

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
      {snapPreview === 'tl' && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '50vw', height: 'calc((100vh - 48px) / 2)', background: 'rgba(var(--accent-rgb), 0.18)', border: '2px dashed var(--accent)', zIndex: 9998, borderRadius: '0 0 12px 0', backdropFilter: 'blur(4px)' }} />
      )}
      {snapPreview === 'tr' && (
        <div style={{ position: 'fixed', right: 0, top: 0, width: '50vw', height: 'calc((100vh - 48px) / 2)', background: 'rgba(var(--accent-rgb), 0.18)', border: '2px dashed var(--accent)', zIndex: 9998, borderRadius: '0 0 0 12px', backdropFilter: 'blur(4px)' }} />
      )}
      {snapPreview === 'bl' && (
        <div style={{ position: 'fixed', left: 0, bottom: 48, width: '50vw', height: 'calc((100vh - 48px) / 2)', background: 'rgba(var(--accent-rgb), 0.18)', border: '2px dashed var(--accent)', zIndex: 9998, borderRadius: '0 12px 0 0', backdropFilter: 'blur(4px)' }} />
      )}
      {snapPreview === 'br' && (
        <div style={{ position: 'fixed', right: 0, bottom: 48, width: '50vw', height: 'calc((100vh - 48px) / 2)', background: 'rgba(var(--accent-rgb), 0.18)', border: '2px dashed var(--accent)', zIndex: 9998, borderRadius: '12px 0 0 0', backdropFilter: 'blur(4px)' }} />
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

            {/* Minimize — premium custom control */}
            <button
              className="win-ctl win-ctl--min"
              onClick={(e) => { e.stopPropagation(); onMinimize(); sfx.play('minimize'); }}
              title="Minimize"
              aria-label="Minimize"
            >
              <Minus size={9} strokeWidth={3} color="rgba(60,35,0,0.85)" />
            </button>

            {/* Maximize — premium custom control + Snap Layouts flyout */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={openSnapMenuDelayed}
              onMouseLeave={closeSnapMenuDelayed}
            >
              <button
                className="win-ctl win-ctl--max"
                onClick={(e) => { e.stopPropagation(); onMaximize(); sfx.play(win.maximized ? 'minimize' : 'maximize'); }}
                title={win.maximized ? 'Restore' : 'Maximize — hover for Snap Layouts'}
                aria-label={win.maximized ? 'Restore' : 'Maximize'}
              >
                {win.maximized
                  ? <Copy size={8} strokeWidth={2.5} color="rgba(0,45,20,0.85)" />
                  : <Square size={8} strokeWidth={3} color="rgba(0,45,20,0.85)" fill="rgba(0,45,20,0.15)" />}
              </button>

              {/* Windows 11 Snap Layouts menu */}
              {showSnapMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.14 }}
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                  onMouseEnter={keepSnapMenuOpen}
                  onMouseLeave={closeSnapMenuDelayed}
                  style={{
                    position: 'absolute', bottom: '150%', right: -8, zIndex: 3000,
                    background: 'rgba(13,15,22,0.97)', border: '1px solid rgba(var(--accent-rgb),0.45)',
                    borderRadius: 10, padding: 10, width: 196,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(var(--accent-rgb),0.25)',
                    backdropFilter: 'blur(20px)', fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ fontSize: 8.5, color: '#666', letterSpacing: 1.5, marginBottom: 8 }}>SNAP LAYOUTS</div>
                  {([
                    [
                      { kind: 'left', cells: [{ w: '50%', h: '100%' }] },
                      { kind: 'right', cells: [{ w: '50%', h: '100%' }] },
                      { kind: 'top', cells: [{ w: '100%', h: '100%' }] },
                      { kind: 'halfBottom', cells: [{ w: '100%', h: '100%' }] },
                    ],
                    [
                      { kind: 'tl', cells: [{ w: '50%', h: '50%' }] },
                      { kind: 'tr', cells: [{ w: '50%', h: '50%' }] },
                      { kind: 'bl', cells: [{ w: '50%', h: '50%' }] },
                      { kind: 'br', cells: [{ w: '50%', h: '50%' }] },
                    ],
                  ] as { kind: 'left' | 'right' | 'top' | 'halfBottom' | 'tl' | 'tr' | 'bl' | 'br'; cells: { w: string; h: string }[] }[][]).map((row, ri) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: ri === 0 ? 6 : 0 }}>
                      {row.map(tile => {
                        const RECT: Record<string, { left: number; top: number; width: number; height: number }> = {
                          left:       { left: 2,  top: 2,  width: 16, height: 22 },
                          right:      { left: 21, top: 2,  width: 16, height: 22 },
                          top:        { left: 2,  top: 2,  width: 35, height: 10 },
                          halfBottom: { left: 2,  top: 15, width: 35, height: 10 },
                          tl:         { left: 2,  top: 2,  width: 16, height: 10 },
                          tr:         { left: 21, top: 2,  width: 16, height: 10 },
                          bl:         { left: 2,  top: 15, width: 16, height: 10 },
                          br:         { left: 21, top: 15, width: 16, height: 10 },
                        };
                        return (
                          <button
                            key={tile.kind}
                            onClick={() => applySnap(tile.kind)}
                            title={`Snap ${tile.kind.toUpperCase()}`}
                            style={{
                              position: 'relative', width: 40, height: 28, padding: 0, cursor: 'pointer',
                              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4,
                              background: 'rgba(255,255,255,0.03)', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                          >
                            <span style={{
                              position: 'absolute', ...RECT[tile.kind],
                              background: 'var(--accent)', borderRadius: 2, opacity: 0.85, pointerEvents: 'none',
                            }} />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  <div style={{ fontSize: 8, color: '#444', marginTop: 8, textAlign: 'center' }}>or drag window to any edge / corner</div>
                </motion.div>
              )}
            </div>

            {/* Close — premium custom control */}
            <button
              className="win-ctl win-ctl--close"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              title="Close"
              aria-label="Close"
              style={{ marginLeft: 2 }}
            >
              <X size={9} strokeWidth={3} color="rgba(60,0,0,0.85)" />
            </button>
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

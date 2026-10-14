import { memo } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
}

interface Group { title: string; items: [string, string][] }

const GROUPS: Group[] = [
  {
    title: '🪟 WINDOW MANAGEMENT',
    items: [
      ['Alt + Tab', 'Switch between open windows'],
      ['Drag to screen edge', 'Snap window left / right half'],
      ['Drag to corner', 'Snap window to quarter'],
      ['Drag to top edge', 'Maximize window'],
      ['Hover ⊡ button', 'Snap Layouts menu (6 zones)'],
      ['Double-click title', 'Maximize / restore'],
      ['Titlebar Pin 📌', 'Keep window always on top'],
    ],
  },
  {
    title: '⚡ SYSTEM',
    items: [
      ['Ctrl + P  or  /', 'Command Palette (apps + math + system)'],
      ['F1', 'This shortcuts overlay'],
      ['Ctrl + Alt + Q', 'Quick Settings panel'],
      ['Ctrl + Alt + N', 'Notification Center'],
      ['Ctrl + L', 'Lock screen'],
      ['Right-click desktop', 'Context menu'],
      ['↑↑↓↓←→←→ B A', 'Konami party mode 🎉'],
    ],
  },
  {
    title: '🚀 PRODUCTIVITY',
    items: [
      ['Double-click icon', 'Launch desktop app'],
      ['Drag widgets', 'Move the widget stack anywhere'],
      ['Start menu search', 'Find any app instantly'],
      ['Taskbar right-click', 'Restore / minimize / close'],
      ['Tray clock', 'Open Notification Center'],
      ['Tray icons', 'Open Quick Settings'],
    ],
  },
];

export const ShortcutsOverlay = memo(({ open, onClose }: ShortcutsOverlayProps) => {
  if (!open) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 780, maxWidth: '92vw', maxHeight: '84vh', overflowY: 'auto', zIndex: 100000,
          background: 'rgba(13, 15, 22, 0.97)', border: '1px solid rgba(var(--accent-rgb), 0.5)',
          borderRadius: 16, fontFamily: 'var(--font-mono)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(var(--accent-rgb),0.25)',
        }}
      >
        <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(var(--accent-rgb),0.08)', backdropFilter: 'blur(12px)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', letterSpacing: 2, fontSize: 13, fontWeight: 'bold' }}>
            <Keyboard size={16} /> KEYBOARD SHORTCUTS & GESTURES
          </span>
          <button
            onClick={onClose}
            title="Close (F1)"
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#aaa', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF3B30'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {GROUPS.map(g => (
            <div key={g.title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}>
              <div style={{ color: '#fff', fontSize: 11, letterSpacing: 1.5, marginBottom: 12, fontWeight: 'bold' }}>{g.title}</div>
              {g.items.map(([key, desc]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                  <kbd style={{
                    background: 'rgba(var(--accent-rgb),0.12)', border: '1px solid rgba(var(--accent-rgb),0.45)',
                    color: 'var(--accent)', borderRadius: 6, padding: '3px 8px', fontSize: 9.5, whiteSpace: 'nowrap', flexShrink: 0,
                    boxShadow: '0 2px 0 rgba(var(--accent-rgb),0.25)',
                  }}>{key}</kbd>
                  <span style={{ color: '#999', fontSize: 10.5, lineHeight: 1.35 }}>{desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '0 20px 16px', textAlign: 'center', color: '#444', fontSize: 9 }}>
          Press <span style={{ color: 'var(--accent)' }}>F1</span> anytime to reopen this overlay • SUDHI OS v4
        </div>
      </motion.div>
    </>
  );
});

export default ShortcutsOverlay;

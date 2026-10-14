import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Trash2, Moon, CalendarDays } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  anchorRight?: number;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const NotificationCenter = memo(({ open, onClose, anchorRight = 16 }: NotificationCenterProps) => {
  const { notifications, clearNotifications, dnd, setDnd, addToast } = useOS();
  const now = useMemo(() => new Date(), []);

  const calendar = useMemo(() => {
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    return cells;
  }, [now]);

  if (!open) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1198 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'fixed', bottom: 56, right: anchorRight, width: 340, maxHeight: 560, zIndex: 1200,
          background: 'rgba(13, 15, 22, 0.96)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 14, overflow: 'hidden', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column',
          boxShadow: '0 16px 50px rgba(0,0,0,0.8), 0 0 24px rgba(var(--accent-rgb),0.18)',
          backdropFilter: 'blur(26px) saturate(180%)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(var(--accent-rgb),0.08)' }}>
          <span style={{ color: 'var(--accent)', fontSize: 12, letterSpacing: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={13} /> NOTIFICATIONS
            {notifications.length > 0 && (
              <span style={{ background: 'var(--accent)', color: '#000', borderRadius: 999, fontSize: 9, padding: '1px 7px', fontWeight: 'bold' }}>{notifications.length}</span>
            )}
          </span>
          {notifications.length > 0 && (
            <button
              onClick={() => { clearNotifications(); addToast('Notifications cleared', 'info'); }}
              style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FF3B30'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#777'; }}
            >
              <Trash2 size={11} /> CLEAR
            </button>
          )}
        </div>

        {/* Notification list */}
        <div style={{ overflowY: 'auto', padding: 10, minHeight: 120, maxHeight: 260 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#555', padding: '28px 12px', fontSize: 11 }}>
              <BellRing size={26} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <div>No new notifications</div>
              <div style={{ fontSize: 9, marginTop: 4, color: '#444' }}>You're all caught up ✨</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  display: 'flex', gap: 10, padding: '10px 12px', marginBottom: 6, borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.1)'; e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <span style={{ fontSize: 18, lineHeight: '22px' }}>{n.icon || '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: '#eee', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                    <span style={{ color: '#555', fontSize: 8, flexShrink: 0 }}>{timeAgo(n.time)}</span>
                  </div>
                  <div style={{ color: '#888', fontSize: 10, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Focus mode row */}
        <div
          onClick={() => { const n = !dnd; setDnd(n); addToast(`Focus mode: ${n ? 'ON' : 'OFF'}`, 'info'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${dnd ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
            background: dnd ? 'rgba(var(--accent-rgb),0.14)' : 'rgba(255,255,255,0.03)',
          }}
        >
          <Moon size={14} color={dnd ? 'var(--accent)' : '#777'} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#ddd', fontWeight: 600 }}>Focus mode</div>
            <div style={{ fontSize: 9, color: '#666' }}>{dnd ? 'Notifications are paused' : 'Pause incoming notifications'}</div>
          </div>
          <span style={{
            width: 32, height: 17, borderRadius: 999, position: 'relative', transition: 'all 0.2s', flexShrink: 0,
            background: dnd ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
          }}>
            <span style={{
              position: 'absolute', top: 2, left: dnd ? 17 : 2, width: 13, height: 13, borderRadius: '50%',
              background: dnd ? '#000' : '#888', transition: 'left 0.2s',
            }} />
          </span>
        </div>

        {/* Mini calendar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px 12px', background: 'rgba(0,0,0,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#888', marginBottom: 8 }}>
            <CalendarDays size={11} color="var(--accent)" />
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 9, textAlign: 'center' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ color: '#555', padding: '2px 0', fontWeight: 'bold' }}>{d}</div>
            ))}
            {calendar.map((d, i) => (
              <div
                key={i}
                style={{
                  padding: '3px 0', borderRadius: 4, color: d === now.getDate() ? '#000' : d ? '#aaa' : 'transparent',
                  background: d === now.getDate() ? 'var(--accent)' : 'transparent',
                  fontWeight: d === now.getDate() ? 'bold' : 400,
                  boxShadow: d === now.getDate() ? '0 0 10px rgba(var(--accent-rgb),0.6)' : 'none',
                }}
              >
                {d ?? '·'}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default NotificationCenter;

import { memo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { Toast } from '../../types/os';

const TOAST_META: Record<Toast['type'], { icon: string; color: string; rgb: string }> = {
  success: { icon: '✓', color: '#00C853', rgb: '0, 200, 83' },
  error:   { icon: '✕', color: '#FF3B30', rgb: '255, 59, 48' },
  info:    { icon: 'i', color: 'var(--accent)', rgb: 'var(--accent-rgb)' },
};

const ToastItem = ({ toast, onDone }: { toast: Toast; onDone: (id: string) => void }) => {
  useEffect(() => {
    const t = setTimeout(() => onDone(toast.id), 3800);
    return () => clearTimeout(t);
  }, [toast.id, onDone]);

  const meta = TOAST_META[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => onDone(toast.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: 'rgba(13, 15, 22, 0.95)',
        border: `1px solid rgba(${meta.rgb}, 0.55)`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 10, minWidth: 240, maxWidth: 340, cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        boxShadow: `0 8px 28px rgba(0,0,0,0.7), 0 0 16px rgba(${meta.rgb}, 0.18)`,
        backdropFilter: 'blur(18px) saturate(160%)',
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: `rgba(${meta.rgb}, 0.18)`, color: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 'bold',
      }}>{meta.icon}</span>
      <span style={{ color: '#e8e8e8', fontSize: 11.5, lineHeight: 1.4 }}>{toast.message}</span>
    </motion.div>
  );
};

/** System toast notifications (finally visible! v4) */
export const ToastStack = memo(() => {
  const { toasts, removeToast } = useOS();

  return (
    <div className="toast-container" style={{ zIndex: 999996 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDone={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
});

export default ToastStack;

import React, { memo, useState } from 'react';
import { useOS } from '../../context/OSContext';

export const ContactWindow = memo(() => {
  const { addToast } = useOS();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('AWAITING TRANSMISSION...');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) { setStatus('ERROR: SUBJECT AND MESSAGE REQUIRED'); return; }
    setSending(true);
    const steps = ['ENCRYPTING PAYLOAD...', 'ESTABLISHING UPLINK...', 'TRANSMITTING...', '✓ TRANSMISSION COMPLETE'];
    for (const s of steps) {
      setStatus(s);
      await new Promise(r => setTimeout(r, 700));
    }
    setSending(false);
    addToast('Message Transmitted Successfully', 'success');
    setSubject('');
    setMessage('');
    setTimeout(() => setStatus('AWAITING TRANSMISSION...'), 3000);
  };

  const fieldStyle: React.CSSProperties = {
    background: '#0a0a0a', border: '1px solid #333', borderRadius: 4,
    color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13,
    padding: '8px 12px', width: '100%', outline: 'none',
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', color: 'var(--accent)', fontSize: 11, marginBottom: 4, letterSpacing: 2 }}>SUBJECT</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} disabled={sending} placeholder="Enter message subject..." style={fieldStyle} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', color: 'var(--accent)', fontSize: 11, marginBottom: 4, letterSpacing: 2 }}>MESSAGE BODY</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} disabled={sending} placeholder="Enter your message..." rows={6} style={{ ...fieldStyle, resize: 'vertical' }} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={sending}
        style={{
          width: '100%', padding: '10px', border: '1px solid var(--accent)',
          background: sending ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
          color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12,
          letterSpacing: 2, cursor: sending ? 'wait' : 'pointer', borderRadius: 4,
        }}
      >
        {sending ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
      </button>

      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: status.includes('✓') ? 'var(--accent)' : status.includes('ERROR') ? '#FF4444' : '#666', letterSpacing: 1 }}>
        STATUS: {status}
      </div>
    </div>
  );
});
export default ContactWindow;

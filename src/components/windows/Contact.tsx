import React, { memo, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Send, Shield, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactWindow = memo(() => {
  const { addToast } = useOS();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('AWAITING TRANSMISSION...');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Honeypot bot trap check
    if (!email || !subject || !message) {
      setStatus('error');
      setStatusText('ERROR: EMAIL, SUBJECT AND MESSAGE REQUIRED');
      return;
    }

    setSending(true);
    setStatusText('TRANSMITTING TO FORMEDGE ENDPOINT...');

    try {
      const res = await fetch('https://apnaform.sudhirdevops1.workers.dev/api/submit/endpoint_8dLZd2lDlxREhGhfgDVJ7ix9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message }),
      });

      if (res.ok) {
        setStatus('success');
        setStatusText('✓ TRANSMISSION SENT SUCCESSFULLY TO SUDHIR SINGH');
        addToast('Message sent to Sudhir Singh via FormForge', 'success');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error('Endpoint returned error status');
      }
    } catch {
      // Fallback via URLSearchParams form submit if JSON mode blocked
      try {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);

        await fetch('https://apnaform.sudhirdevops1.workers.dev/api/submit/endpoint_8dLZd2lDlxREhGhfgDVJ7ix9', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        setStatus('success');
        setStatusText('✓ TRANSMISSION SENT SUCCESSFULLY');
        addToast('Message sent successfully', 'success');
        setEmail('');
        setSubject('');
        setMessage('');
      } catch {
        setStatus('error');
        setStatusText('ERROR TRANSMITTING MESSAGE');
      }
    }
    setSending(false);
  };

  const fieldStyle: React.CSSProperties = {
    background: '#05070d', border: '1px solid #1a1e2e', borderRadius: 8,
    color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '10px 14px', width: '100%', outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', background: '#090b14', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #141724', paddingBottom: 12 }}>
        <Mail size={20} color="var(--accent)" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)' }}>SEND MESSAGE TO SUDHIR SINGH</div>
          <div style={{ fontSize: 10, color: '#666' }}>FormForge Cloudflare Worker Uplink Endpoint</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', color: 'var(--accent)', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>EMAIL ADDRESS</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={sending}
            placeholder="Enter your email..."
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--accent)', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>SUBJECT</label>
          <input
            type="text"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={sending}
            placeholder="Enter subject..."
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--accent)', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>MESSAGE BODY</label>
          <textarea
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending}
            placeholder="Type your message here..."
            rows={5}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {/* Honeypot Bot Trap */}
        <input
          name="website"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
        />

        <button
          type="submit"
          disabled={sending}
          style={{
            padding: '12px', border: '1px solid var(--accent)',
            background: sending ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(var(--accent-rgb),0.2)',
            color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12,
            letterSpacing: 2, cursor: sending ? 'wait' : 'pointer', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 'bold',
          }}
        >
          <Send size={14} /> {sending ? 'TRANSMITTING...' : 'SEND MESSAGE VIA FORMS'}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: status === 'success' ? '#00FF88' : status === 'error' ? '#FF4444' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {status === 'success' ? <CheckCircle2 size={14} color="#00FF88" /> : status === 'error' ? <AlertCircle size={14} color="#FF4444" /> : <Shield size={14} color="#444" />}
        STATUS: {statusText}
      </div>
    </div>
  );
});
export default ContactWindow;

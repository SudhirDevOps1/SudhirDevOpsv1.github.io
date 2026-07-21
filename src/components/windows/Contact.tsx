import React, { memo, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Send, Shield, Mail, CheckCircle2, AlertCircle, ExternalLink, Copy } from 'lucide-react';

export const ContactWindow = memo(() => {
  const { addToast } = useOS();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('AWAITING TRANSMISSION...');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const TARGET_GMAIL = 'SudhirDevOps100@gmail.com';

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
        setStatusText(`✓ MESSAGE TRANSMITTED TO ${TARGET_GMAIL}`);
        addToast(`Message sent to ${TARGET_GMAIL} via FormForge`, 'success');
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
        setStatusText(`✓ TRANSMISSION SENT TO ${TARGET_GMAIL}`);
        addToast(`Message sent to ${TARGET_GMAIL}`, 'success');
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

  const openDirectGmail = () => {
    const mailtoUrl = `mailto:${TARGET_GMAIL}?subject=${encodeURIComponent(subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(message || 'Hi Sudhir,')}`;
    window.open(mailtoUrl, '_blank');
    addToast(`Opening native mail client for ${TARGET_GMAIL}`, 'info');
  };

  const copyGmail = () => {
    navigator.clipboard.writeText(TARGET_GMAIL);
    setCopiedEmail(true);
    addToast('Copied email to clipboard', 'success');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const fieldStyle: React.CSSProperties = {
    background: '#05070d', border: '1px solid #1a1e2e', borderRadius: 8,
    color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '10px 14px', width: '100%', outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', background: '#090b14', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #141724', paddingBottom: 12 }}>
        <Mail size={22} color="var(--accent)" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--accent)' }}>GMAIL INBOX & CONTACT ENDPOINT</div>
          <div style={{ fontSize: 10, color: '#aaa', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            Target Email: <span style={{ color: '#00FF88', fontWeight: 'bold' }}>{TARGET_GMAIL}</span>
          </div>
        </div>
      </div>

      {/* Direct Quick Mail Bar */}
      <div style={{ padding: '10px 14px', background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.2)', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 11, color: '#ccc' }}>
          📬 Direct Mail: <strong style={{ color: 'var(--accent)' }}>{TARGET_GMAIL}</strong>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={copyGmail} style={{ padding: '5px 10px', border: '1px solid #333', background: '#111', color: '#ccc', borderRadius: 6, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Copy size={11} /> {copiedEmail ? 'Copied' : 'Copy'}
          </button>
          <button onClick={openDirectGmail} style={{ padding: '5px 10px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.2)', color: 'var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ExternalLink size={11} /> Open Gmail App
          </button>
        </div>
      </div>

      {/* FormForge Endpoint Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', color: 'var(--accent)', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>YOUR EMAIL ADDRESS</label>
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
            placeholder="Enter message subject..."
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
            placeholder="Type your message here for Sudhir..."
            rows={4}
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

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={sending}
            style={{
              flex: 1, padding: '12px', border: '1px solid var(--accent)',
              background: sending ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(var(--accent-rgb),0.2)',
              color: 'var(--accent)', fontFamily: 'var(--font-title)', fontSize: 12,
              letterSpacing: 2, cursor: sending ? 'wait' : 'pointer', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 'bold',
            }}
          >
            <Send size={14} /> {sending ? 'TRANSMITTING...' : 'SEND TO SUDHIRGMAIL'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: status === 'success' ? '#00FF88' : status === 'error' ? '#FF4444' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {status === 'success' ? <CheckCircle2 size={14} color="#00FF88" /> : status === 'error' ? <AlertCircle size={14} color="#FF4444" /> : <Shield size={14} color="#444" />}
        STATUS: {statusText}
      </div>
    </div>
  );
});
export default ContactWindow;

import React, { memo, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Send, Shield, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const FormForgeContactWindow = memo(() => {
  const { addToast } = useOS();
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('AWAITING SUBMISSION...');

  const FORMEDGE_ENDPOINT = 'https://apnaform.sudhirdevops1.workers.dev/api/submit/endpoint_8dLZd2lDlxREhGhfgDVJ7ix9';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Honeypot bot trap check
    if (!email || !subject || !message) {
      setStatus('error');
      setStatusText('ERROR: EMAIL, SUBJECT AND MESSAGE REQUIRED');
      return;
    }

    setSending(true);
    setStatusText('SUBMITTING TO FORMEDGE CLOUDFLARE WORKER...');

    try {
      const res = await fetch(FORMEDGE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message }),
      });

      if (res.ok) {
        setStatus('success');
        setStatusText('✓ FORM SUBMITTED SUCCESSFULLY VIA FORMEDGE!');
        addToast('Form submission sent via FormForge Worker', 'success');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error('Endpoint error');
      }
    } catch {
      try {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);

        await fetch(FORMEDGE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        setStatus('success');
        setStatusText('✓ FORM SUBMITTED SUCCESSFULLY!');
        addToast('Form submission sent', 'success');
        setEmail('');
        setSubject('');
        setMessage('');
      } catch {
        setStatus('error');
        setStatusText('ERROR SUBMITTING FORM');
      }
    }
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#05070f', border: '1px solid #1e2436',
    borderRadius: 10, color: '#fff', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none'
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', background: '#090b14', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #141724', paddingBottom: 12 }}>
        <div style={{ padding: 8, background: 'rgba(244,63,94,0.15)', border: '1px solid #F43F5E', borderRadius: 8 }}>
          <Sparkles size={20} color="#F43F5E" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: 6 }}>
            FORMFORGE CONTACT FORM <span style={{ fontSize: 9, background: '#F43F5E22', color: '#F43F5E', padding: '1px 6px', borderRadius: 4 }}>WORKER API</span>
          </div>
          <div style={{ fontSize: 10, color: '#666' }}>Cloudflare Worker FormForge Direct Submission</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#aaa', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Email Address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={sending} placeholder="Enter your email" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#aaa', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Subject</label>
          <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} disabled={sending} placeholder="Enter subject" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#aaa', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Message</label>
          <textarea required value={message} onChange={e => setMessage(e.target.value)} disabled={sending} placeholder="Type your message here..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {/* Honeypot Bot Trap */}
        <input name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />

        <button type="submit" disabled={sending}
          style={{
            padding: '12px', border: 'none', background: 'linear-gradient(90deg, #F43F5E 0%, #E11D48 100%)',
            color: '#fff', fontWeight: 'bold', fontSize: 12, borderRadius: 10, cursor: sending ? 'wait' : 'pointer',
            boxShadow: '0 4px 14px rgba(244,63,94,0.3)', transition: 'all 0.2s', marginTop: 4
          }}>
          {sending ? 'SUBMITTING...' : 'Send Message (FormForge API)'}
        </button>
      </form>

      <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10, color: status === 'success' ? '#00FF88' : status === 'error' ? '#FF4444' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {status === 'success' ? <CheckCircle2 size={12} color="#00FF88" /> : status === 'error' ? <AlertCircle size={12} color="#FF4444" /> : <Shield size={12} color="#444" />}
        {statusText}
      </div>
    </div>
  );
});
export default FormForgeContactWindow;

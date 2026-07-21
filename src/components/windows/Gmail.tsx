import React, { memo, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Mail, Send, ExternalLink, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export const GmailWindow = memo(() => {
  const { addToast } = useOS();
  const GMAIL_ADDRESS = 'SudhirDevOps100@gmail.com';
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSendViaGmailApp = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${GMAIL_ADDRESS}?subject=${encodeURIComponent(subject || 'Portfolio Connection')}&body=${encodeURIComponent(message || 'Hello Sudhir,')}`;
    window.open(mailtoUrl, '_blank');
    addToast(`Opening native Mail / Gmail app for ${GMAIL_ADDRESS}`, 'success');
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(GMAIL_ADDRESS);
    setCopied(true);
    addToast('Copied SudhirDevOps100@gmail.com to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#05070f', border: '1px solid #1e2436',
    borderRadius: 8, color: '#fff', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none'
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', background: '#090b14', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #141724', paddingBottom: 12 }}>
        <div style={{ padding: 8, background: 'rgba(234,67,53,0.15)', border: '1px solid #EA4335', borderRadius: 8 }}>
          <Mail size={22} color="#EA4335" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#EA4335' }}>SUDHIR'S GMAIL MAILBOX</div>
          <div style={{ fontSize: 10, color: '#aaa' }}>Official Gmail: <strong style={{ color: '#00FF88' }}>{GMAIL_ADDRESS}</strong></div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div style={{ padding: 14, background: 'rgba(234,67,53,0.06)', border: '1px solid rgba(234,67,53,0.2)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Official Email Address</div>
          <div style={{ fontSize: 11, color: '#EA4335', fontWeight: 'bold', marginTop: 2 }}>{GMAIL_ADDRESS}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyEmail} style={{ padding: '6px 12px', border: '1px solid #333', background: '#111', color: '#ccc', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Copy size={12} /> {copied ? 'Copied!' : 'Copy Email'}
          </button>
          <button onClick={handleSendViaGmailApp} style={{ padding: '6px 12px', border: '1px solid #EA4335', background: 'rgba(234,67,53,0.2)', color: '#EA4335', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'bold' }}>
            <ExternalLink size={12} /> Open Gmail App
          </button>
        </div>
      </div>

      {/* Compose Email Form */}
      <form onSubmit={handleSendViaGmailApp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#aaa', fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 }}>TO GMAIL ADDRESS</label>
          <input type="text" readOnly value={GMAIL_ADDRESS} style={{ ...inputStyle, background: '#0e111a', color: '#00FF88', fontWeight: 'bold' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#aaa', fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 }}>SUBJECT</label>
          <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter email subject..." style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 10, color: '#aaa', fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 }}>MESSAGE</label>
          <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="Type message to send to SudhirDevOps100@gmail.com..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <button type="submit"
          style={{
            padding: '12px', border: 'none', background: 'linear-gradient(90deg, #EA4335 0%, #C5221F 100%)',
            color: '#fff', fontWeight: 'bold', fontSize: 12, borderRadius: 10, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(234,67,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
          <Send size={14} /> Send via Gmail / Native Mail Client
        </button>
      </form>
    </div>
  );
});
export default GmailWindow;

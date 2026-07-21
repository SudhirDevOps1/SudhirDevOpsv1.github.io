import React, { memo, useState, useEffect, useCallback } from 'react';
import { Quote, Sparkles, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

interface Advice {
  id: number;
  advice: string;
}

export const QuotesWindow = memo(() => {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const FALLBACK_QUOTES = [
    { id: 1, advice: "The best error message is the one that never shows up." },
    { id: 2, advice: "Simplicity is prerequisite for reliability." },
    { id: 3, advice: "First, solve the problem. Then, write the code." },
    { id: 4, advice: "Code is like humor. When you have to explain it, it’s bad." },
    { id: 5, advice: "Fix the cause, not the symptom." },
    { id: 6, advice: "Make it work, make it right, make it fast." },
  ];

  const fetchNewQuote = useCallback(async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch('https://api.adviceslip.com/advice');
      const data = await res.json();
      if (data.slip?.advice) {
        setAdvice({ id: data.slip.id, advice: data.slip.advice });
      } else {
        const rand = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        setAdvice(rand);
      }
    } catch {
      const rand = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setAdvice(rand);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNewQuote();
  }, [fetchNewQuote]);

  const copyToClipboard = () => {
    if (!advice) return;
    navigator.clipboard.writeText(`"${advice.advice}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090b12', fontFamily: 'var(--font-mono)', color: '#fff', padding: 24, textAlign: 'center' }}>
      {/* Icon Badge */}
      <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)', marginBottom: 16 }}>
        <Quote size={28} color="var(--accent)" />
      </div>

      <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 'bold', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>
        ✨ DAILY ADVICE & DEV WISDOM (SLIP API #{advice?.id || '101'})
      </div>

      {/* Quote Card */}
      <div style={{
        padding: 24, borderRadius: 12, background: '#0e111b', border: '1px solid rgba(var(--accent-rgb),0.2)',
        maxWidth: 480, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: 16, lineHeight: 1.6, color: '#eee', fontStyle: 'italic', fontWeight: 500 }}>
          "{advice?.advice || 'Loading wisdom...'}"
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={fetchNewQuote} disabled={loading}
          style={{ padding: '10px 20px', border: 'none', background: 'var(--accent)', color: '#000', borderRadius: 8, cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Get New Advice
        </button>

        <button onClick={copyToClipboard}
          style={{ padding: '10px 16px', border: '1px solid #333', background: '#121522', color: '#ccc', borderRadius: 8, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          {copied ? <Check size={14} color="#00FF88" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
});
export default QuotesWindow;

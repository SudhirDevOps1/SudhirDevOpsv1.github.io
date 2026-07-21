import React, { memo, useState } from 'react';
import { Search } from 'lucide-react';

export const BrowserWindow = memo(() => {
  const [urlInput, setUrlInput] = useState('https://wikipedia.org');
  const [activeUrl, setActiveUrl] = useState('https://wikipedia.org');
  const [history, setHistory] = useState<string[]>(['https://wikipedia.org']);
  const [historyIdx, setHistoryIdx] = useState(0);

  const bookmarks = [
    { id: 1, title: 'Wikipedia', url: 'https://wikipedia.org', icon: '🌐' },
    { id: 2, title: 'Bing Search', url: 'https://www.bing.com', icon: '🔍' },
    { id: 3, title: 'HackerNews', url: 'https://news.ycombinator.com', icon: '📰' },
    { id: 4, title: 'HTML5 Games', url: 'https://html5games.com', icon: '🎮' },
    { id: 5, title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  ];

  const navigateTo = (target: string) => {
    let finalUrl = target.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(finalUrl)}`;
      }
    }
    setUrlInput(finalUrl);
    setActiveUrl(finalUrl);
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(finalUrl);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const prev = historyIdx - 1;
      setHistoryIdx(prev);
      setUrlInput(history[prev]);
      setActiveUrl(history[prev]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const next = historyIdx + 1;
      setHistoryIdx(next);
      setUrlInput(history[next]);
      setActiveUrl(history[next]);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #222', display: 'flex', gap: 8, alignItems: 'center', background: '#050505' }}>
        <button onClick={goBack} disabled={historyIdx === 0} style={{ padding: '6px 12px', border: '1px solid #333', background: '#0a0a0a', color: historyIdx === 0 ? '#444' : '#aaa', borderRadius: 4, cursor: historyIdx === 0 ? 'default' : 'pointer' }}>←</button>
        <button onClick={goForward} disabled={historyIdx === history.length - 1} style={{ padding: '6px 12px', border: '1px solid #333', background: '#0a0a0a', color: historyIdx === history.length - 1 ? '#444' : '#aaa', borderRadius: 4, cursor: historyIdx === history.length - 1 ? 'default' : 'pointer' }}>→</button>
        <button onClick={() => navigateTo(activeUrl)} style={{ padding: '6px 12px', border: '1px solid #333', background: '#0a0a0a', color: '#aaa', borderRadius: 4, cursor: 'pointer' }}>⟳</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, padding: '0 8px' }}>
          <Search size={14} color="#666" style={{ marginRight: 6 }} />
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigateTo(urlInput)}
            placeholder="Type URL or search query..."
            style={{ flex: 1, padding: '6px 0', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          />
        </div>
        <button onClick={() => navigateTo(urlInput)} style={{ padding: '6px 16px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>GO</button>
      </div>

      <div style={{ padding: '6px 12px', borderBottom: '1px solid #222', display: 'flex', gap: 8, overflowX: 'auto', background: '#080808' }}>
        {bookmarks.map(b => (
          <div key={b.id} onClick={() => navigateTo(b.url)} style={{ padding: '4px 10px', border: '1px solid #222', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 11, color: activeUrl === b.url ? 'var(--accent)' : '#999', background: activeUrl === b.url ? 'rgba(var(--accent-rgb),0.1)' : 'transparent' }}>
            <span>{b.icon}</span>
            <span>{b.title}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        <iframe
          src={activeUrl}
          title="Web Browser"
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
});
export default BrowserWindow;

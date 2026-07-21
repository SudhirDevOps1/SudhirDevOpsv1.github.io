import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Search, ExternalLink, RefreshCw, Star, Globe, AlertCircle, Home, BookOpen } from 'lucide-react';

// Sites that genuinely allow iframe embedding (X-Frame-Options: ALLOW / no restriction)
const BOOKMARKS = [
  { id: 'wiki',    title: 'Wikipedia',           url: 'https://en.m.wikipedia.org/wiki/Main_Page',      icon: '📖', category: 'Knowledge', embeddable: true },
  { id: 'archive', title: 'Internet Archive',    url: 'https://archive.org',                              icon: '🗄️', category: 'Knowledge', embeddable: true },
  { id: 'mdn',     title: 'MDN Web Docs',        url: 'https://developer.mozilla.org/en-US/',             icon: '📘', category: 'Dev', embeddable: false },
  { id: 'codepen', title: 'CodePen',             url: 'https://codepen.io/trending',                      icon: '🖊️', category: 'Dev', embeddable: false },
  { id: 'github',  title: 'GitHub',              url: 'https://github.com/SudhirDevOps1',                 icon: '🐙', category: 'Dev', embeddable: false },
  { id: 'osmap',   title: 'OpenStreetMap',       url: 'https://www.openstreetmap.org',                    icon: '🗺️', category: 'Tools', embeddable: true },
  { id: 'weather', title: 'Open-Meteo',          url: 'https://open-meteo.com',                           icon: '⛅', category: 'Tools', embeddable: false },
  { id: 'devhints',title: 'DevHints.io',         url: 'https://devhints.io',                              icon: '📋', category: 'Dev', embeddable: true },
  { id: 'unsplash',title: 'Unsplash',            url: 'https://unsplash.com',                             icon: '🖼️', category: 'Media', embeddable: false },
  { id: 'news',    title: 'Hacker News',         url: 'https://news.ycombinator.com',                     icon: '📰', category: 'News', embeddable: true },
  { id: 'nasa',    title: 'NASA APOD',           url: 'https://apod.nasa.gov/apod/',                      icon: '🚀', category: 'Science', embeddable: true },
  { id: 'wolframe',title: 'WolframAlpha',        url: 'https://www.wolframalpha.com',                     icon: '🧮', category: 'Science', embeddable: false },
  { id: 'ilovepdf',title: 'iLovePDF',           url: 'https://www.ilovepdf.com',                         icon: '📄', category: 'Tools', embeddable: false },
  { id: 'typetest',title: 'Monkeytype',          url: 'https://monkeytype.com',                           icon: '⌨️', category: 'Tools', embeddable: false },
];

const CATEGORIES = ['All', 'Knowledge', 'Dev', 'Tools', 'News', 'Media', 'Science'];

const BLOCKED_NOTICE = (url: string) => (
  <div style={{
    height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: '#0a0c14', fontFamily: 'var(--font-mono)', color: '#ccc', padding: 40, textAlign: 'center', gap: 14,
  }}>
    <AlertCircle size={52} color="#FFB300" strokeWidth={1.5} />
    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#FFB300' }}>Site Cannot Be Embedded</div>
    <div style={{ fontSize: 12, color: '#666', maxWidth: 420, lineHeight: 1.7 }}>
      <strong style={{ color: '#aaa' }}>{url}</strong><br /><br />
      This website has blocked embedding via browser security policy (<code style={{ color: 'var(--accent)' }}>X-Frame-Options: DENY</code> or <code style={{ color: 'var(--accent)' }}>Content-Security-Policy</code>).
      <br /><br />
      This is a <em>security feature</em> of modern web browsers — not a bug in SUDHI OS.
    </div>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      <a href={url} target="_blank" rel="noreferrer"
        style={{ padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ExternalLink size={14} /> Open in New Tab
      </a>
    </div>
    <div style={{ marginTop: 12, fontSize: 10, color: '#444' }}>
      ✅ Sites that DO work: Wikipedia, OpenStreetMap, Hacker News, NASA APOD, DevHints, Archive.org
    </div>
  </div>
);

export const BrowserWindow = memo(() => {
  const [urlInput, setUrlInput] = useState('https://en.m.wikipedia.org/wiki/Main_Page');
  const [activeUrl, setActiveUrl] = useState('https://en.m.wikipedia.org/wiki/Main_Page');
  const [history, setHistory] = useState<string[]>(['https://en.m.wikipedia.org/wiki/Main_Page']);
  const [histIdx, setHistIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filteredBookmarks = BOOKMARKS.filter(b => {
    const matchCat = category === 'All' || b.category === category;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const navigateTo = useCallback((target: string) => {
    let url = target.trim();
    if (!url) return;

    // Auto-complete URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Search on DuckDuckGo (embeddable)
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}&kae=d&kp=-1`;
      }
    }

    setUrlInput(url);
    setActiveUrl(url);
    setBlocked(false);
    setLoading(true);

    const newHistory = history.slice(0, histIdx + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);

    // Auto-timeout loading indicator
    setTimeout(() => setLoading(false), 3000);
  }, [history, histIdx]);

  const goBack = () => {
    if (histIdx > 0) {
      const prev = histIdx - 1;
      setHistIdx(prev);
      setUrlInput(history[prev]);
      setActiveUrl(history[prev]);
      setBlocked(false);
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const next = histIdx + 1;
      setHistIdx(next);
      setUrlInput(history[next]);
      setActiveUrl(history[next]);
      setBlocked(false);
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const reload = () => {
    setLoading(true);
    const url = activeUrl;
    setActiveUrl('');
    setTimeout(() => { setActiveUrl(url); setLoading(false); }, 300);
  };

  // Detect if iframe gets blocked (via error or timeout heuristic)
  const handleIframeLoad = () => {
    setLoading(false);
    // Try to access iframe contentDocument - if blocked, it throws
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument === null) {
        // might be cross-origin but loaded
      }
    } catch {
      // cross-origin, but that's normal for loaded iframes
    }
  };

  // Known blocked domains — show blocked screen immediately
  const KNOWN_BLOCKED = ['google.com', 'youtube.com/watch', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'amazon.com', 'netflix.com', 'github.com', 'stackoverflow.com', 'bing.com'];
  const isKnownBlocked = KNOWN_BLOCKED.some(d => activeUrl.includes(d));

  const domain = (() => {
    try { return new URL(activeUrl).hostname; } catch { return activeUrl; }
  })();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#08090d', fontFamily: 'var(--font-mono)' }}>

      {/* Browser Toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #13151e', background: '#0d0f18', display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Nav Buttons */}
        <button onClick={goBack} disabled={histIdx === 0}
          style={{ padding: '5px 10px', border: '1px solid #222', background: '#111', color: histIdx === 0 ? '#333' : '#aaa', borderRadius: 6, cursor: histIdx === 0 ? 'default' : 'pointer', fontSize: 14 }}>
          ←
        </button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1}
          style={{ padding: '5px 10px', border: '1px solid #222', background: '#111', color: histIdx >= history.length - 1 ? '#333' : '#aaa', borderRadius: 6, cursor: histIdx >= history.length - 1 ? 'default' : 'pointer', fontSize: 14 }}>
          →
        </button>
        <button onClick={reload}
          style={{ padding: '5px 8px', border: '1px solid #222', background: '#111', color: '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
        <button onClick={() => navigateTo('https://en.m.wikipedia.org/wiki/Main_Page')}
          style={{ padding: '5px 8px', border: '1px solid #222', background: '#111', color: '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex' }}>
          <Home size={13} />
        </button>

        {/* Address Bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: loading ? 'rgba(var(--accent-rgb),0.06)' : '#0a0c12', border: `1px solid ${loading ? 'rgba(var(--accent-rgb),0.3)' : '#1e2030'}`, borderRadius: 8, padding: '5px 12px', gap: 8, transition: 'all 0.2s' }}>
          <Globe size={13} color={isKnownBlocked ? '#FF4444' : loading ? 'var(--accent)' : '#555'} />
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigateTo(urlInput)}
            onFocus={e => e.target.select()}
            placeholder="Type URL or search query... (try wikipedia.org)"
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          />
          {loading && <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />}
        </div>

        <button onClick={() => navigateTo(urlInput)}
          style={{ padding: '5px 14px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
          Go
        </button>

        <a href={activeUrl} target="_blank" rel="noreferrer"
          style={{ padding: '5px 8px', border: '1px solid #222', background: '#111', color: '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex', textDecoration: 'none' }} title="Open in real browser tab">
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Bookmarks Bar */}
      <div style={{ padding: '5px 10px', borderBottom: '1px solid #0f111a', background: '#0a0c14', display: 'flex', gap: 4, alignItems: 'center', overflowX: 'auto' }}>
        {BOOKMARKS.slice(0, 8).map(b => (
          <button key={b.id} onClick={() => navigateTo(b.url)}
            style={{ padding: '3px 10px', border: '1px solid #1a1c28', background: activeUrl.includes(b.id) ? 'rgba(var(--accent-rgb),0.15)' : '#0f1018', color: activeUrl.includes(b.url.replace('https://', '').split('/')[0]) ? 'var(--accent)' : '#888', borderRadius: 4, cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>{b.icon}</span>{b.title}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {isKnownBlocked ? (
            BLOCKED_NOTICE(activeUrl)
          ) : (
            <iframe
              ref={iframeRef}
              key={activeUrl}
              src={activeUrl}
              title="Browser"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              onLoad={handleIframeLoad}
              onError={() => { setLoading(false); setBlocked(true); }}
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Site Drawer */}
        <div style={{ width: 200, borderLeft: '1px solid #0f111a', background: '#09090f', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #0f111a' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookmarks..."
              style={{ width: '100%', padding: '5px 8px', background: '#0f1018', border: '1px solid #1a1c28', color: '#fff', borderRadius: 4, fontSize: 10, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }} />
          </div>
          <div style={{ padding: '4px 8px', borderBottom: '1px solid #0f111a', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '2px 6px', border: `1px solid ${category === c ? 'var(--accent)' : '#1a1c28'}`, background: category === c ? 'rgba(var(--accent-rgb),0.15)' : 'transparent', color: category === c ? 'var(--accent)' : '#555', borderRadius: 8, cursor: 'pointer', fontSize: 9 }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '6px 8px', fontSize: 9, color: '#333', letterSpacing: 1 }}>BOOKMARKS</div>
            {filteredBookmarks.map(b => (
              <div key={b.id} onClick={() => navigateTo(b.url)}
                style={{ padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                  <div style={{ fontSize: 9, color: b.embeddable ? '#00FF88' : '#FF8800' }}>
                    {b.embeddable ? '✓ Embeddable' : '↗ Opens in tab'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '8px', borderTop: '1px solid #0f111a', fontSize: 9, color: '#333', lineHeight: 1.5 }}>
            <span style={{ color: '#00FF88' }}>✓</span> = works in OS<br />
            <span style={{ color: '#FF8800' }}>↗</span> = opens in tab<br />
            Most sites block iframe embedding due to browser security (X-Frame-Options)
          </div>
        </div>
      </div>
    </div>
  );
});
export default BrowserWindow;

import { memo, useState, useRef, useCallback, useEffect, type CSSProperties } from 'react';
import { ExternalLink, RefreshCw, Globe, AlertCircle, Home, Search, X } from 'lucide-react';
import { useContainerWidth } from '../../lib/useContainerWidth';

const HOME_URL = 'https://en.m.wikipedia.org/wiki/Main_Page';

// Default search engine: Wikipedia's Special:Search. Unlike Google/DDG/Bing it sends no
// X-Frame-Options / frame-ancestors 'self' header, so real results render inside the iframe.
const SEARCH_URL = 'https://en.wikipedia.org/wiki/Special:Search?search=';

// Bookmarks. `embeddable: true` = loads inside the iframe, `false` = genuinely opens a real
// browser tab (window.open) — the label matches the behaviour.
const BOOKMARKS = [
  { id: 'wiki',    title: 'Wikipedia',           url: 'https://en.m.wikipedia.org/wiki/Main_Page',      icon: '📖', category: 'Knowledge', embeddable: true },
  { id: 'archive', title: 'Internet Archive',    url: 'https://archive.org',                              icon: '🗄️', category: 'Knowledge', embeddable: true },
  { id: 'mdn',     title: 'MDN Web Docs',        url: 'https://developer.mozilla.org/en-US/',             icon: '📘', category: 'Dev', embeddable: false },
  { id: 'codepen', title: 'CodePen',             url: 'https://codepen.io/trending',                      icon: '🖊️', category: 'Dev', embeddable: false },
  { id: 'github',  title: 'GitHub',              url: 'https://github.com/SudhirDevOps1',                 icon: '🐙', category: 'Dev', embeddable: false },
  // The OSM main site sends X-Frame-Options: SAMEORIGIN; /export/embed.html is the
  // frameable endpoint OSM itself provides for embedding.
  { id: 'osmap',   title: 'OpenStreetMap',       url: 'https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=mapnik', icon: '🗺️', category: 'Tools', embeddable: true },
  { id: 'weather', title: 'Open-Meteo',          url: 'https://open-meteo.com',                           icon: '⛅', category: 'Tools', embeddable: true },
  { id: 'devhints',title: 'DevHints.io',         url: 'https://devhints.io',                              icon: '📋', category: 'Dev', embeddable: true },
  { id: 'unsplash',title: 'Unsplash',            url: 'https://unsplash.com',                             icon: '🖼️', category: 'Media', embeddable: false },
  // HN (X-Frame-Options: DENY) and NASA APOD (X-Frame-Options: SAMEORIGIN) block embedding — verified 2026-10-14.
  { id: 'news',    title: 'Hacker News',         url: 'https://news.ycombinator.com',                     icon: '📰', category: 'News', embeddable: false },
  { id: 'nasa',    title: 'NASA APOD',           url: 'https://apod.nasa.gov/apod/',                      icon: '🚀', category: 'Science', embeddable: false },
  { id: 'wolframe',title: 'WolframAlpha',        url: 'https://www.wolframalpha.com',                     icon: '🧮', category: 'Science', embeddable: false },
  { id: 'ilovepdf',title: 'iLovePDF',            url: 'https://www.ilovepdf.com',                         icon: '📄', category: 'Tools', embeddable: true },
  { id: 'typetest',title: 'Monkeytype',          url: 'https://monkeytype.com',                           icon: '⌨️', category: 'Tools', embeddable: false },
];

const CATEGORIES = ['All', 'Knowledge', 'Dev', 'Tools', 'News', 'Media', 'Science'];

// Domains verified to send X-Frame-Options: DENY/SAMEORIGIN or frame-ancestors 'self'.
// The iframe ALWAYS loads these anyway (never skipped) — we only show an honest,
// dismissible warning with a working "Open in new tab" escape hatch.
const EMBED_HOSTILE = [
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com',
  'linkedin.com', 'reddit.com', 'amazon.com', 'netflix.com', 'github.com', 'stackoverflow.com',
  'bing.com', 'duckduckgo.com', 'monkeytype.com', 'developer.mozilla.org', 'codepen.io',
  'wolframalpha.com', 'news.ycombinator.com', 'apod.nasa.gov',
];

const hostileDomainOf = (url: string): string | null => {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return EMBED_HOSTILE.find(d => host === d || host.endsWith('.' + d)) ?? null;
  } catch {
    return null;
  }
};

// Compare real URLs (protocol/www/trailing-slash insensitive) instead of short bookmark ids,
// so a bookmark is only highlighted when it is actually the page being viewed.
const normalizeUrl = (u: string) =>
  u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '').toLowerCase();

const LOAD_TIMEOUT_MS = 12000;

export const BrowserWindow = memo(() => {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const [urlInput, setUrlInput] = useState(HOME_URL);
  const [activeUrl, setActiveUrl] = useState(HOME_URL);
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [histIdx, setHistIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false); // safety timeout / iframe error
  const [hostileDismissed, setHostileDismissed] = useState(false);
  const [navNonce, setNavNonce] = useState(0); // remounts the iframe per navigation = real reload
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimer = useRef<number | null>(null);

  const clearLoadTimer = useCallback(() => {
    if (loadTimer.current !== null) {
      window.clearTimeout(loadTimer.current);
      loadTimer.current = null;
    }
  }, []);

  // Start a REAL load cycle: spinner stays on until the iframe's onLoad fires, with a
  // safety timeout that swaps in an "Open in new tab" fallback instead of spinning forever.
  const beginLoad = useCallback(() => {
    clearLoadTimer();
    setLoading(true);
    setLoadFailed(false);
    loadTimer.current = window.setTimeout(() => {
      loadTimer.current = null;
      setLoading(false);
      setLoadFailed(true);
    }, LOAD_TIMEOUT_MS);
  }, [clearLoadTimer]);

  useEffect(() => clearLoadTimer, [clearLoadTimer]);

  const filteredBookmarks = BOOKMARKS.filter(b => {
    const matchCat = category === 'All' || b.category === category;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isBookmarkActive = useCallback((b: typeof BOOKMARKS[number]) => {
    const a = normalizeUrl(activeUrl);
    const t = normalizeUrl(b.url);
    return a === t || a.startsWith(t + '/');
  }, [activeUrl]);

  const openInTab = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const navigateTo = useCallback((target: string) => {
    let url = target.trim();
    if (!url) return;

    // URL detection: a dot and no spaces (or an explicit http(s):// prefix) = address,
    // anything else is a search query on the default (embeddable) Wikipedia engine.
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = SEARCH_URL + encodeURIComponent(url);
      }
    }

    setUrlInput(url);
    setActiveUrl(url);
    setHostileDismissed(false);
    setNavNonce(n => n + 1);
    beginLoad();

    const newHistory = history.slice(0, histIdx + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistIdx(newHistory.length - 1);
  }, [history, histIdx, beginLoad]);

  const openBookmark = useCallback((b: typeof BOOKMARKS[number]) => {
    if (b.embeddable) navigateTo(b.url);
    else openInTab(b.url);
  }, [navigateTo, openInTab]);

  const goBack = () => {
    if (histIdx > 0) {
      const prev = histIdx - 1;
      setHistIdx(prev);
      setUrlInput(history[prev]);
      setActiveUrl(history[prev]);
      setHostileDismissed(false);
      setNavNonce(n => n + 1);
      beginLoad();
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const next = histIdx + 1;
      setHistIdx(next);
      setUrlInput(history[next]);
      setActiveUrl(history[next]);
      setHostileDismissed(false);
      setNavNonce(n => n + 1);
      beginLoad();
    }
  };

  const reload = () => {
    // Bumping the key remounts the iframe at the same URL — a genuine reload whose
    // completion is signalled by the iframe's own onLoad event.
    setNavNonce(n => n + 1);
    beginLoad();
  };

  // The ONLY signal that a page actually loaded (no fake timers, no contentDocument probing).
  const handleIframeLoad = useCallback(() => {
    clearLoadTimer();
    setLoading(false);
    setLoadFailed(false);
  }, [clearLoadTimer]);

  const handleIframeError = useCallback(() => {
    clearLoadTimer();
    setLoading(false);
    setLoadFailed(true);
  }, [clearLoadTimer]);

  const hostileDomain = hostileDomainOf(activeUrl);
  const showHostileBanner = hostileDomain !== null && !hostileDismissed;
  // Responsive: below ~700px the fixed 200px site drawer would squeeze the page,
  // so it collapses (its bookmarks remain reachable via the bookmarks bar above).
  const compact = width > 0 && width < 700;

  const smallBtn: CSSProperties = {
    padding: '5px 10px', border: '1px solid #222', background: '#111', color: '#aaa',
    borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0,
  };

  return (
    <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#08090d', fontFamily: 'var(--font-mono)' }}>

      {/* Browser Toolbar — wraps onto a second row when the window gets narrow */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #13151e', background: '#0d0f18', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
        <button onClick={() => navigateTo(HOME_URL)}
          style={{ padding: '5px 8px', border: '1px solid #222', background: '#111', color: '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex' }}>
          <Home size={13} />
        </button>

        {/* Address Bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: loading ? 'rgba(var(--accent-rgb),0.06)' : '#0a0c12', border: `1px solid ${loading ? 'rgba(var(--accent-rgb),0.3)' : '#1e2030'}`, borderRadius: 8, padding: '5px 12px', gap: 8, transition: 'all 0.2s', minWidth: 0 }}>
          <Globe size={13} color={hostileDomain ? '#FFB300' : loading ? 'var(--accent)' : '#555'} style={{ flexShrink: 0 }} />
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigateTo(urlInput)}
            onFocus={e => e.target.select()}
            placeholder="Type a URL or search (Wikipedia)…"
            title="Enter loads the site directly · anything else searches Wikipedia"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          />
          {/* Engine label — search queries go to Wikipedia, which genuinely embeds */}
          <span title="Default search engine: Wikipedia (embeddable)"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', border: '1px solid #1a1c28', borderRadius: 8, fontSize: 9, color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Search size={9} /> Wikipedia
          </span>
          {loading && <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />}
        </div>

        <button onClick={() => navigateTo(urlInput)}
          style={{ padding: '5px 14px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', color: 'var(--accent)', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>
          Go
        </button>

        <button onClick={() => openInTab(activeUrl)}
          style={{ padding: '5px 8px', border: '1px solid #222', background: '#111', color: '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex' }} title="Open in real browser tab">
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div style={{ padding: '5px 10px', borderBottom: '1px solid #0f111a', background: '#0a0c14', display: 'flex', gap: 4, alignItems: 'center', overflowX: 'auto' }}>
        {BOOKMARKS.slice(0, 8).map(b => (
          <button key={b.id} onClick={() => openBookmark(b)}
            title={b.embeddable ? `${b.title} — opens inside SUDHI OS` : `${b.title} — blocks embedding, opens a real tab`}
            style={{ padding: '3px 10px', border: '1px solid #1a1c28', background: isBookmarkActive(b) ? 'rgba(var(--accent-rgb),0.15)' : '#0f1018', color: isBookmarkActive(b) ? 'var(--accent)' : '#888', borderRadius: 4, cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>{b.icon}</span>{b.title}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
          {/* The iframe is ALWAYS rendered — even for embed-hostile domains we attempt the
              real load; the banner below is a warning overlay, not a substitute page. */}
          <iframe
            ref={iframeRef}
            key={`${activeUrl}::${navNonce}`}
            src={activeUrl}
            title="SUDHI OS Browser"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            referrerPolicy="no-referrer"
          />

          {/* Safety-timeout / load-error fallback */}
          {loadFailed && (
            <div style={{
              position: 'absolute', top: showHostileBanner ? 68 : 10, left: 10, right: 10, zIndex: 5,
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              background: 'rgba(8,10,16,0.92)', border: '1px solid rgba(var(--accent-rgb),0.45)',
              borderRadius: 8, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.5)', fontFamily: 'var(--font-mono)',
            }}>
              <AlertCircle size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 11, color: '#bbb', lineHeight: 1.5, minWidth: 0 }}>
                Page didn’t finish loading within {LOAD_TIMEOUT_MS / 1000}s — it may block embedding or be offline.
              </div>
              <button onClick={() => openInTab(activeUrl)} style={{ ...smallBtn, borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                <ExternalLink size={12} /> Open in new tab
              </button>
              <button onClick={reload} style={smallBtn}>
                <RefreshCw size={12} /> Retry
              </button>
              <button onClick={() => setLoadFailed(false)} title="Dismiss" style={{ ...smallBtn, padding: '5px 7px' }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* Honest warning for domains verified to block iframe embedding */}
          {showHostileBanner && hostileDomain && (
            <div style={{
              position: 'absolute', top: 10, left: 10, right: 10, zIndex: 5,
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              background: 'rgba(8,10,16,0.92)', border: '1px solid rgba(255,179,0,0.4)',
              borderRadius: 8, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.5)', fontFamily: 'var(--font-mono)',
            }}>
              <AlertCircle size={15} color="#FFB300" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 11, color: '#bbb', lineHeight: 1.5, minWidth: 0 }}>
                <strong style={{ color: '#FFB300' }}>{hostileDomain}</strong> blocks in-browser embedding (X-Frame-Options / frame-ancestors), so the view below may render blank — we tried loading it anyway.
              </div>
              <button onClick={() => openInTab(activeUrl)} style={{ ...smallBtn, borderColor: '#FFB300', color: '#FFB300' }}>
                <ExternalLink size={12} /> Open in new tab
              </button>
              <button onClick={() => setHostileDismissed(true)} title="Dismiss" style={{ ...smallBtn, padding: '5px 7px' }}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Site Drawer — hidden on narrow windows so the page keeps its width
            (bookmarks remain reachable through the bookmarks bar above) */}
        {!compact && (
        <div style={{ width: 200, flexShrink: 0, borderLeft: '1px solid #0f111a', background: '#09090f', display: 'flex', flexDirection: 'column' }}>
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
              <div key={b.id} onClick={() => openBookmark(b)}
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
        )}
      </div>
    </div>
  );
});
export default BrowserWindow;

import { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RefreshCw, Search, Newspaper, WifiOff } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface HNItem {
  id?: number;
  title?: string;
  by?: string;
  score?: number;
  time?: number;
  url?: string;
  descendants?: number;
}

interface Story {
  id: number;
  title: string;
  by: string;
  score: number;
  time: number;
  url: string;
  descendants: number;
}

interface SeedStory {
  id: number;
  title: string;
  by: string;
  score: number;
  offset: number; // seconds behind "now"
  url: string;
  descendants: number;
}

type SortKey = 'top' | 'new' | 'discussion';

/* Baked-in fallback feed — always available so the app never shows an error screen */
const FALLBACK_SEED: SeedStory[] = [
  { id: 41204871, title: 'Show HN: I rewrote grep in Rust and it\'s 12x faster', by: 'rg_enjoyer', score: 512, offset: 1800, url: 'https://github.com/rg-enjoyer/rustgrep', descendants: 148 },
  { id: 41204102, title: 'PostgreSQL 18 released with async I/O by default', by: 'pg_fanatic', score: 847, offset: 5400, url: 'https://www.postgresql.org/about/news/postgresql-18-released/', descendants: 312 },
  { id: 41203555, title: 'The hidden cost of abstraction layers in modern JS frameworks', by: 'plainjs', score: 391, offset: 9000, url: 'https://kentcdodds.com/blog/hidden-cost-of-abstraction', descendants: 205 },
  { id: 41202980, title: 'Ask HN: What\'s your backup strategy in 2026?', by: 'paranoid_dev', score: 268, offset: 14400, url: 'https://news.ycombinator.com/item?id=41202980', descendants: 431 },
  { id: 41202441, title: 'Why we migrated 2M lines of JavaScript to TypeScript', by: 'strict_mode', score: 623, offset: 21600, url: 'https://devblogs.microsoft.com/typescript/2m-lines/', descendants: 274 },
  { id: 41201776, title: 'SQLite is not a toy database', by: 'drh', score: 456, offset: 32400, url: 'https://sqlite.org/whentouse.html', descendants: 156 },
  { id: 41201204, title: 'Linux 6.17 lands with a new fair-share scheduler', by: 'kernel_hound', score: 734, offset: 46800, url: 'https://lwn.net/Articles/linux-6-17/', descendants: 389 },
  { id: 41200688, title: 'A deep dive into how V8 manages memory', by: 'michal', score: 402, offset: 64800, url: 'https://v8.dev/blog/trash-collection', descendants: 118 },
  { id: 41199912, title: 'Show HN: A dependency-free markdown editor in 4 KB', by: 'zero_deps', score: 287, offset: 108000, url: 'https://zero-deps.github.io/tinyedit/', descendants: 97 },
  { id: 41198430, title: 'The art of finishing projects', by: 'shipped_it', score: 519, offset: 172800, url: 'https://signalvnoise.com/the-art-of-finishing-projects', descendants: 244 },
];

const getFallbackStories = (): Story[] => {
  const now = Math.floor(Date.now() / 1000);
  return FALLBACK_SEED.map(s => ({
    id: s.id,
    title: s.title,
    by: s.by,
    score: s.score,
    time: now - s.offset,
    url: s.url,
    descendants: s.descendants,
  }));
};

const timeAgo = (unix: number): string => {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unix);
  const mins = Math.floor(diff / 60);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'news.ycombinator.com';
  }
};

export const News = memo(() => {
  const { addToast } = useOS();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('top');
  const offlineRef = useRef(false);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!res.ok) throw new Error('feed unavailable');
      const ids: unknown = await res.json();
      if (!Array.isArray(ids) || ids.length === 0) throw new Error('empty feed');

      const top = (ids as number[]).slice(0, 25);
      const items = await Promise.all(
        top.map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(r => (r.ok ? (r.json() as Promise<HNItem>) : null))
            .catch(() => null)
        )
      );

      const list: Story[] = [];
      items.forEach((it, i) => {
        if (!it || typeof it.title !== 'string') return;
        const itemId = typeof it.id === 'number' ? it.id : top[i];
        list.push({
          id: itemId,
          title: it.title,
          by: it.by || 'unknown',
          score: typeof it.score === 'number' ? it.score : 0,
          time: typeof it.time === 'number' ? it.time : Math.floor(Date.now() / 1000),
          url: it.url || `https://news.ycombinator.com/item?id=${itemId}`,
          descendants: typeof it.descendants === 'number' ? it.descendants : 0,
        });
      });

      if (list.length === 0) throw new Error('no parseable stories');

      setStories(list);
      setOffline(false);
      if (offlineRef.current) {
        offlineRef.current = false;
        addToast('DEV.WIRE: live Hacker News feed restored', 'success');
      }
    } catch {
      // Silent fallback — never red-log, never show an error screen
      setStories(getFallbackStories());
      setOffline(true);
      if (!offlineRef.current) {
        offlineRef.current = true;
        addToast('DEV.WIRE: feed unreachable — showing offline edition', 'info');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStories();
    const interval = setInterval(fetchStories, 5 * 60 * 1000); // auto-refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchStories]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? stories.filter(s => s.title.toLowerCase().includes(q)) : [...stories];
    if (sortBy === 'new') return filtered.sort((a, b) => b.time - a.time);
    if (sortBy === 'discussion') return filtered.sort((a, b) => b.descendants - a.descendants);
    return filtered.sort((a, b) => b.score - a.score);
  }, [stories, search, sortBy]);

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', fontFamily: 'var(--font-mono)', background: '#0a0c12', padding: 16, color: '#e6e8ee' }}>
      <style>{`
        @keyframes dw-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.85; } }
        @keyframes dw-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'dw-pulse 1.8s ease-in-out infinite', flexShrink: 0 }} />
        <Newspaper size={18} color="var(--accent)" />
        <span style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--accent)', letterSpacing: 3 }}>DEV.WIRE</span>
        <span style={{ fontSize: 10, color: '#5a5f70' }}>Hacker News • Front Page Feed</span>
        <div style={{ flex: 1 }} />
        {offline && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 'bold', letterSpacing: 1, color: '#FFB300', background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.45)', borderRadius: 4, padding: '3px 8px' }}>
            <WifiOff size={11} /> OFFLINE EDITION
          </span>
        )}
        <span style={{ fontSize: 10, color: '#4a4f60', letterSpacing: 1 }}>{stories.length} STORIES</span>
        <button onClick={fetchStories} disabled={loading}
          title="Refresh feed"
          style={{ padding: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', color: 'var(--accent)', borderRadius: 6, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'dw-spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Controls: search + sort chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 10px', flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={12} color="#5a5f70" style={{ marginRight: 6, flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter stories by title..."
            style={{ background: 'transparent', border: 'none', color: '#e6e8ee', outline: 'none', fontSize: 11, fontFamily: 'var(--font-mono)', flex: 1, minWidth: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['top', 'new', 'discussion'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              style={{ padding: '4px 10px', border: `1px solid ${sortBy === s ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`, background: sortBy === s ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)', color: sortBy === s ? 'var(--accent)' : '#5a5f70', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Skeletons while first load is in flight */}
      {loading && stories.length === 0 && Array.from({ length: 6 }).map((_, i) => (
        <div key={`skeleton-${i}`}
          style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: 8, animation: 'dw-pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.12}s` }}>
          <div style={{ height: 12, width: '68%', background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ height: 8, width: '38%', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
        </div>
      ))}

      {/* Story cards */}
      {visible.map((s, idx) => (
        <div key={s.id}
          style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: 8, alignItems: 'flex-start', transition: 'background 0.15s, border-color 0.15s' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(var(--accent-rgb),0.12)';
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <div style={{ width: 26, textAlign: 'right', flexShrink: 0, fontSize: 14, fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div onClick={() => openUrl(s.url)}
              title={s.title}
              style={{ fontSize: 13, lineHeight: 1.45, color: '#e6e8ee', cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {s.title}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: '#5a5f70', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#4a4f60' }}>{hostOf(s.url)}</span>
              <span style={{ color: 'var(--accent)' }}>▲ {s.score}</span>
              <span>by {s.by}</span>
              <span>{timeAgo(s.time)}</span>
              <a href={`https://news.ycombinator.com/item?id=${s.id}`}
                target="_blank" rel="noreferrer noopener"
                onClick={e => e.stopPropagation()}
                style={{ color: '#8a8fa0', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = '#8a8fa0'}>
                💬 {s.descendants}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Empty filter result */}
      {!loading && visible.length === 0 && (
        <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 11, color: '#4a4f60', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10 }}>
          No stories match “{search}”.
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 9, color: '#3d4252', textAlign: 'center', letterSpacing: 1 }}>
        Powered by the official Hacker News Firebase API
      </div>
    </div>
  );
});
export default News;

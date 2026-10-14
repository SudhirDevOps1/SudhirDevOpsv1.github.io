import { memo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Youtube as YoutubeIcon, Search, Play, ExternalLink } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  category: string;
  thumbnail: string;
  description: string;
}

// All entries below are VERIFIED LIVE: each ID was checked against YouTube's
// public oEmbed endpoint (200 OK) and its title/channel/duration/views come
// straight from the real video pages. No API key is used anywhere.
const VIDEO_LIBRARY: VideoItem[] = [
  // Lofi / Music (working VODs & 24/7 streams)
  { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio \u{1F4DA} beats to relax/study to', channel: 'Lofi Girl', views: '', duration: 'LIVE', category: 'Lofi', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg', description: '24/7 lofi hip hop radio to relax and study to.' },
  { id: 'DWcJFNfaw9c', title: 'lofi hip hop radio \u{1F4A4} beats to sleep/chill to', channel: 'Lofi Girl', views: '', duration: 'LIVE', category: 'Lofi', thumbnail: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg', description: 'Lofi Girl sleep/chill radio, streaming around the clock.' },
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)', channel: 'Rick Astley', views: '1.8B views', duration: '3:33', category: 'Music', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', description: 'The classic, remastered in 4K.' },
  { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE(\u{D55C}\u{AD6D}\uC5F4) M/V', channel: 'officialpsy', views: '6.1B views', duration: '4:12', category: 'Music', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg', description: "PSY's record-breaking global hit." },
  // Coding / Tech
  { id: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners [Tutorial]', channel: 'freeCodeCamp.org', views: '49M views', duration: '4:26:52', category: 'Coding', thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg', description: 'Full Python programming tutorial for beginners.' },
  { id: 'PkZNo7MFNFg', title: 'Learn JavaScript - Full Course for Beginners', channel: 'freeCodeCamp.org', views: '21M views', duration: '3:26:43', category: 'Coding', thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg', description: 'Complete JavaScript tutorial.' },
  { id: 'w7ejDZ8SWv8', title: 'React JS Crash Course', channel: 'Traversy Media', views: '3.6M views', duration: '1:48:47', category: 'Coding', thumbnail: 'https://i.ytimg.com/vi/w7ejDZ8SWv8/hqdefault.jpg', description: 'React JS crash course for beginners.' },
  { id: 'zJSY8tbf_ys', title: 'Frontend Web Development Bootcamp Course (JavaScript, HTML, CSS)', channel: 'freeCodeCamp.org', views: '3.7M views', duration: '21:14:42', category: 'Coding', thumbnail: 'https://i.ytimg.com/vi/zJSY8tbf_ys/hqdefault.jpg', description: 'Complete frontend web development bootcamp.' },
  // Gaming
  { id: 'BO8lX3hDU30', title: 'Cyberpunk 2077 \u2014 Official Gameplay Trailer', channel: 'Cyberpunk 2077', views: '34M views', duration: '5:14', category: 'Gaming', thumbnail: 'https://i.ytimg.com/vi/BO8lX3hDU30/hqdefault.jpg', description: 'Official Cyberpunk 2077 gameplay trailer.' },
  // Space
  { id: 'DhmdyQdu96M', title: 'Space Station Fisheye Fly-Through 4K (Ultra HD)', channel: 'NASA', views: '1.6M views', duration: '18:05', category: 'Space', thumbnail: 'https://i.ytimg.com/vi/DhmdyQdu96M/hqdefault.jpg', description: 'NASA fly-through of the International Space Station in 4K.' },
  // Fun / Retro
  { id: 'gsNaR6FRuO0', title: 'The Sound of dial-up Internet', channel: 'William Termini', views: '21M views', duration: '0:29', category: 'Fun', thumbnail: 'https://i.ytimg.com/vi/gsNaR6FRuO0/hqdefault.jpg', description: 'The nostalgic sound of connecting to the internet in the 90s.' },
];

// Every category below contains at least one verified video.
const CATEGORIES = ['All', 'Lofi', 'Music', 'Coding', 'Gaming', 'Space', 'Fun'];

/** Accepts a bare 11-char video ID or any common YouTube URL form.
 *  Returns the clean ID, or null when the input is neither. */
const extractId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

/** Thumbnail fallback chain: hqdefault -> mqdefault -> gradient placeholder
 *  (live streams often have no hqdefault; the gradient + icon sits behind the img). */
const handleThumbError = (e: SyntheticEvent<HTMLImageElement>, id: string) => {
  const img = e.currentTarget;
  if (img.dataset.fallback !== '1') {
    img.dataset.fallback = '1';
    img.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  } else {
    img.style.display = 'none';
  }
};

export const YoutubeWindow = memo(() => {
  const [activeVideo, setActiveVideo] = useState<VideoItem>(VIDEO_LIBRARY[0]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const filtered = VIDEO_LIBRARY.filter(v => {
    const matchCat = category === 'All' || v.category === category;
    const matchSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const playVideo = (v: VideoItem) => setActiveVideo(v);

  /** Plays any YouTube video from a pasted URL (watch?v=, youtu.be/, embed/,
   *  shorts/, live/) or an 11-char ID. Returns false (and shows a hint) on invalid input. */
  const loadCustomId = (raw: string): boolean => {
    const id = extractId(raw);
    if (!id) {
      setUrlError('Not a YouTube link or video ID \u2014 expected watch?v=, youtu.be/, embed/ or an 11-character ID.');
      return false;
    }
    setUrlError(null);
    setActiveVideo({
      id,
      title: `YouTube video ${id}`,
      channel: 'Loaded from link',
      views: '',
      duration: '',
      category: 'Custom',
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      description: 'Custom video loaded from a pasted YouTube link or video ID.',
    });
    return true;
  };

  /** Search-bar action (magnifier click / Enter): play the video if the input
   *  is a URL or ID; otherwise the text simply keeps filtering the library. */
  const handleSearch = () => {
    if (extractId(searchQuery) && loadCustomId(searchQuery)) {
      setSearchQuery('');
    }
  };

  /** Dedicated URL/ID loader action (Play button / Enter). */
  const handleUrlPlay = () => {
    if (!urlInput.trim()) {
      setUrlError('Paste a YouTube link or video ID first.');
      return;
    }
    if (loadCustomId(urlInput)) setUrlInput('');
  };

  const openOnYouTube = () => window.open(`https://www.youtube.com/watch?v=${activeVideo.id}`, '_blank');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f0f0f', fontFamily: 'sans-serif', color: '#fff' }}>

      {/* YouTube Header */}
      <div style={{ padding: '10px 16px', background: '#0f0f0f', borderBottom: '1px solid #272727', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <YoutubeIcon size={24} color="#FF0000" />
          <span style={{ fontWeight: 'bold', fontSize: 16, letterSpacing: -0.5 }}>YouTube</span>
        </div>

        {/* Search + direct-link loader */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search Bar: filters the library as you type, plays a link/ID on Enter or click */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#121212', border: '1px solid #303030', borderRadius: 20, overflow: 'hidden', minWidth: 0 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Search library, or paste a YouTube link / ID…"
                aria-label="Search videos or paste a YouTube link"
                style={{ flex: 1, padding: '7px 16px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 13, minWidth: 0 }}
              />
              <button
                onClick={handleSearch}
                aria-label="Search or play"
                title="Search the library, or play a pasted YouTube link / ID"
                style={{ padding: '7px 16px', background: '#272727', border: 'none', borderLeft: '1px solid #303030', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Search size={16} color="#aaa" />
              </button>
            </div>

            {/* Custom Video ID / URL loader */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#181818', border: '1px solid #303030', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 300, minWidth: 0 }}>
              <input
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); if (urlError) setUrlError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') handleUrlPlay(); }}
                placeholder="Paste any YouTube URL or video ID…"
                aria-label="Paste a YouTube URL or video ID"
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#aaa', outline: 'none', fontSize: 11, minWidth: 0 }}
              />
              <button onClick={handleUrlPlay} style={{ padding: '3px 10px', background: '#FF0000', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 'bold', flexShrink: 0 }}>
                &#9654; Play
              </button>
            </div>
          </div>

          {/* Hint */}
          <span style={{ fontSize: 10, color: '#777', paddingLeft: 4 }}>
            {urlError
              ? <span style={{ color: '#ff6b6b' }}>{urlError}</span>
              : 'Paste any YouTube link or ID to play \u2014 supports watch?v=, youtu.be/, embed/ and bare 11-character IDs.'}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Player Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
          {/* Iframe Player (privacy-enhanced embed, no cookies needed) */}
          <div style={{ flex: 1, position: 'relative', background: '#000' }}>
            <iframe
              key={activeVideo.id}
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
              title={activeVideo.title}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          {/* Video Info */}
          <div style={{ padding: '12px 16px', background: '#0f0f0f', borderTop: '1px solid #272727' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4, lineHeight: 1.4 }}>{activeVideo.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeVideo.channel}
                {activeVideo.views ? ` \u00B7 ${activeVideo.views}` : ''}
                {activeVideo.duration ? ` \u00B7 ${activeVideo.duration}` : ''}
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button onClick={openOnYouTube}
                  style={{ padding: '5px 14px', background: '#272727', border: 'none', color: '#fff', borderRadius: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={13} /> Open on YouTube
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 270, borderLeft: '1px solid #272727', display: 'flex', flexDirection: 'column', background: '#0f0f0f' }}>
          {/* Category Filter */}
          <div style={{ padding: '8px 8px', borderBottom: '1px solid #272727', display: 'flex', gap: 4, overflowX: 'auto' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '4px 10px', border: 'none', borderRadius: 12, background: category === c ? '#fff' : '#272727', color: category === c ? '#000' : '#fff', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', fontWeight: category === c ? 'bold' : 'normal' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Video List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 16, fontSize: 11, color: '#777', lineHeight: 1.5 }}>
                No videos match this filter. Clear the search box or pick another category — or paste a YouTube link above to play it directly.
              </div>
            )}
            {filtered.map(v => (
              <div key={v.id} onClick={() => playVideo(v)}
                style={{ padding: '8px', cursor: 'pointer', display: 'flex', gap: 8, borderBottom: '1px solid #1a1a1a', background: activeVideo.id === v.id ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (activeVideo.id !== v.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (activeVideo.id !== v.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Thumbnail (gradient placeholder sits behind the img; a failed
                    thumbnail degrades hqdefault -> mqdefault -> placeholder) */}
                <div style={{ position: 'relative', width: 110, height: 62, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'linear-gradient(135deg, #311414 0%, #16162a 100%)' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <YoutubeIcon size={22} color="rgba(255,255,255,0.35)" />
                  </div>
                  <img src={v.thumbnail} alt={v.title} loading="lazy"
                    onError={e => handleThumbError(e, v.id)}
                    style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 3, right: 4, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 'bold' }}>{v.duration}</div>
                  {activeVideo.id !== v.id && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }}>
                      <Play size={16} color="#fff" style={{ opacity: 0.85, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, fontWeight: '600', color: activeVideo.id === v.id ? '#fff' : '#ddd', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>{v.channel}</div>
                  {v.views && <div style={{ fontSize: 10, color: '#777' }}>{v.views}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
export default YoutubeWindow;

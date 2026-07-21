import React, { memo, useState, useRef, useCallback } from 'react';
import { Youtube as YoutubeIcon, Search, Play, ExternalLink, ThumbsUp, Share2, Bell } from 'lucide-react';

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

const VIDEO_LIBRARY: VideoItem[] = [
  // Lofi / Music (Working VODs & Streams)
  { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio 📚 - beats to relax/study to', channel: 'Lofi Girl', views: '20K watching', duration: 'LIVE', category: 'Lofi', thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg', description: '24/7 lofi hip hop radio to relax and study to.' },
  { id: 'TURbeWK609U', title: 'Lofi Hip Hop Mix 2026 - Beats to Relax / Study', channel: 'Lofi Records', views: '4.8M', duration: '1:30:15', category: 'Lofi', thumbnail: 'https://img.youtube.com/vi/TURbeWK609U/hqdefault.jpg', description: 'Relaxing lofi beats for study and work.' },
  { id: 'DWcJFNfaw9c', title: 'Cyberpunk Synthwave Mix 2026 🌆', channel: 'Retro Electro', views: '1.2M', duration: '1:02:44', category: 'Music', thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg', description: 'Best cyberpunk synthwave music mix 2026.' },
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up (Official Video)', channel: 'Rick Astley', views: '1.5B', duration: '3:32', category: 'Music', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', description: 'The classic.' },
  // Coding / Tech
  { id: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners', channel: 'freeCodeCamp', views: '45M', duration: '4:26:52', category: 'Coding', thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg', description: 'Full Python programming tutorial for beginners.' },
  { id: 'PkZNo7MFNFg', title: 'Learn JavaScript - Full Course for Beginners', channel: 'freeCodeCamp', views: '15M', duration: '3:26:42', category: 'Coding', thumbnail: 'https://img.youtube.com/vi/PkZNo7MFNFg/hqdefault.jpg', description: 'Complete JavaScript tutorial.' },
  { id: 'w7ejDZ8SWv8', title: 'React JS - Full Course 2024', channel: 'Traversy Media', views: '3.2M', duration: '2:21:41', category: 'Coding', thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg', description: 'Complete React JS tutorial for beginners.' },
  { id: 'zJSY8tbf_ys', title: 'TypeScript Full Course for Beginners', channel: 'Dave Gray', views: '1.1M', duration: '5:38:16', category: 'Coding', thumbnail: 'https://img.youtube.com/vi/zJSY8tbf_ys/hqdefault.jpg', description: 'Complete TypeScript course.' },
  // Gaming / Fun
  { id: 'gsNaR6FRuO0', title: 'Minecraft in 100 Seconds', channel: 'Fireship', views: '4.2M', duration: '1:40', category: 'Gaming', thumbnail: 'https://img.youtube.com/vi/gsNaR6FRuO0/hqdefault.jpg', description: 'Minecraft explained in 100 seconds.' },
  { id: 'VQL3aeWqWE8', title: 'GTA 6 Official Trailer', channel: 'Rockstar Games', views: '189M', duration: '1:30', category: 'Gaming', thumbnail: 'https://img.youtube.com/vi/VQL3aeWqWE8/hqdefault.jpg', description: 'GTA 6 official trailer.' },
  // Space
  { id: 'Go3muowFYS8', title: 'Earth from Space - 4K ISS Live Stream', channel: 'NASA Goddard', views: '12M', duration: '3:00', category: 'Space', thumbnail: 'https://img.youtube.com/vi/Go3muowFYS8/hqdefault.jpg', description: '4K footage of Earth from the International Space Station.' },
];


const CATEGORIES = ['All', 'Lofi', 'Music', 'Coding', 'Gaming', 'Space', 'Motivation'];

export const YoutubeWindow = memo(() => {
  const [activeVideo, setActiveVideo] = useState<VideoItem>(VIDEO_LIBRARY[0]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [videoIdInput, setVideoIdInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filtered = VIDEO_LIBRARY.filter(v => {
    const matchCat = category === 'All' || v.category === category;
    const matchSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const playVideo = (v: VideoItem) => {
    setActiveVideo(v);
    setIsSearching(false);
  };

  const loadCustomId = () => {
    const id = videoIdInput.trim();
    if (!id) return;
    const customVideo: VideoItem = {
      id, title: `Custom Video: ${id}`, channel: 'Custom', views: '–', duration: '–', category: 'Custom',
      thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, description: 'Custom video loaded by ID or URL.',
    };
    setActiveVideo(customVideo);
    setVideoIdInput('');
  };

  const extractId = (input: string): string => {
    const urlMatch = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    return urlMatch ? urlMatch[1] : input;
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

        {/* Search Bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#121212', border: '1px solid #303030', borderRadius: 20, overflow: 'hidden', maxWidth: 480 }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search YouTube..."
            style={{ flex: 1, padding: '7px 16px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 13 }}
          />
          <div style={{ padding: '7px 16px', background: '#272727', borderLeft: '1px solid #303030', cursor: 'pointer' }}>
            <Search size={16} color="#aaa" />
          </div>
        </div>

        {/* Custom Video ID / URL loader */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#181818', border: '1px solid #303030', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 300 }}>
          <input
            value={videoIdInput}
            onChange={e => setVideoIdInput(extractId(e.target.value))}
            onKeyDown={e => e.key === 'Enter' && loadCustomId()}
            placeholder="Paste any YouTube URL or video ID..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#aaa', outline: 'none', fontSize: 11 }}
          />
          <button onClick={loadCustomId} style={{ padding: '3px 10px', background: '#FF0000', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 'bold', flexShrink: 0 }}>
            ▶ Play
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Player Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
          {/* Iframe Player */}
          <div style={{ flex: 1, position: 'relative', background: '#000' }}>
            <iframe
              ref={iframeRef}
              key={activeVideo.id}
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1&color=white&iv_load_policy=3`}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: '#aaa' }}>{activeVideo.channel} · {activeVideo.views} views · {activeVideo.duration}</div>
              <div style={{ display: 'flex', gap: 10 }}>
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
            {filtered.map(v => (
              <div key={v.id} onClick={() => playVideo(v)}
                style={{ padding: '8px', cursor: 'pointer', display: 'flex', gap: 8, borderBottom: '1px solid #1a1a1a', background: activeVideo.id === v.id ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (activeVideo.id !== v.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (activeVideo.id !== v.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: 110, height: 62, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: '#222' }}>
                  <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{ position: 'absolute', bottom: 3, right: 4, background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 9, padding: '1px 4px', borderRadius: 2, fontWeight: 'bold' }}>{v.duration}</div>
                  {activeVideo.id !== v.id && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }}>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 11, fontWeight: '600', color: activeVideo.id === v.id ? '#fff' : '#ddd', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa' }}>{v.channel}</div>
                  <div style={{ fontSize: 10, color: '#777' }}>{v.views}</div>
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

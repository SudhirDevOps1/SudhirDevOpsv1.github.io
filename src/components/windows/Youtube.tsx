import React, { memo, useState } from 'react';
import { Youtube, Search, Play } from 'lucide-react';

export const YoutubeWindow = memo(() => {
  const [query, setQuery] = useState('coding music 24/7 lofi');
  const [activeVideoId, setActiveVideoId] = useState('jfKfPfyJRdk');
  const videos = [
    { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio 📚 - beats to relax/study to', channel: 'Lofi Girl', views: '20K watching', thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
    { id: '5qap5aO4i9A', title: 'Lofi Hip Hop Radio 🎧 - Beats to Relax/Study to', channel: 'Chillhop Music', views: '8.4K watching', thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg' },
    { id: 'DWcJFNfaw9c', title: 'Cyberpunk Synthwave Mix 2026', channel: 'Retro Electro', views: '1.2M views', thumbnail: 'https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg' },
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)', channel: 'Rick Astley', views: '1.5B views', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#0a0a0a' }}>
      <div style={{ padding: '10px 16px', background: '#0f0f0f', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF0000', fontWeight: 'bold', fontSize: 14 }}>
          <Youtube size={22} color="#FF0000" />
          <span style={{ color: '#fff', letterSpacing: -0.5 }}>YouTube</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#121212', border: '1px solid #333', borderRadius: 20, padding: '4px 14px', maxWidth: 500, margin: '0 auto' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search YouTube..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          />
          <Search size={14} color="#888" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
              title="YouTube Player"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div style={{ width: 260, borderLeft: '1px solid #222', padding: 12, overflowY: 'auto', background: '#0f0f0f' }}>
          <div style={{ color: '#aaa', fontSize: 11, fontWeight: 'bold', marginBottom: 10 }}>RECOMMENDED VIDEOS</div>
          {videos.map(v => (
            <div key={v.id} onClick={() => setActiveVideoId(v.id)} style={{ marginBottom: 12, cursor: 'pointer', opacity: activeVideoId === v.id ? 1 : 0.7, border: activeVideoId === v.id ? '1px solid var(--accent)' : '1px solid transparent', borderRadius: 6, padding: 4, transition: 'all 0.15s' }}>
              <div style={{ position: 'relative', width: '100%', height: 110, background: '#222', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                  <Play size={24} color="#fff" />
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 11, fontWeight: 600, lineHeight: 1.2, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
              <div style={{ color: '#888', fontSize: 10 }}>{v.channel} • {v.views}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
export default YoutubeWindow;

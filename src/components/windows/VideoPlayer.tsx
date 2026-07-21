import React, { memo, useState } from 'react';

export const VideoPlayerWindow = memo(() => {
  const sampleVideos = [
    { id: 1, title: 'Big Buck Bunny (Trailer)', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { id: 2, title: 'Elephant Dream', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { id: 3, title: 'For Bigger Blazes', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ];

  const [activeVid, setActiveVid] = useState(sampleVideos[0]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#050505' }}>
      <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <video key={activeVid.src} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 4 }}>
          <source src={activeVid.src} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #222', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 'bold' }}>🎬 {activeVid.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {sampleVideos.map(v => (
            <button key={v.id} onClick={() => setActiveVid(v)} style={{ padding: '4px 10px', border: `1px solid ${activeVid.id === v.id ? 'var(--accent)' : '#333'}`, background: activeVid.id === v.id ? 'rgba(var(--accent-rgb),0.2)' : '#111', color: activeVid.id === v.id ? 'var(--accent)' : '#aaa', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
              Video {v.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
export default VideoPlayerWindow;

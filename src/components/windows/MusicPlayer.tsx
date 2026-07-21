import React, { memo, useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music as MusicIcon } from 'lucide-react';

export const MusicPlayerWindow = memo(() => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);

  const tracks = [
    { title: 'Synthwave Neon Drive', artist: 'Retro Electro', duration: '3:45', src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3' },
    { title: 'Cyberpunk Matrix Ambient', artist: 'Lofi Cyber', duration: '4:12', src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a732bc.mp3?filename=cyberpunk-2099-10701.mp3' },
    { title: 'Chill Lofi Study Beats', artist: 'Lofi Girl Sim', duration: '2:50', src: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_88411b7829.mp3?filename=lofi-study-112191.mp3' }
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log('Audio playback error', e));
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    const next = (currentTrackIdx + 1) % tracks.length;
    setCurrentTrackIdx(next);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const prevTrack = () => {
    const prev = (currentTrackIdx - 1 + tracks.length) % tracks.length;
    setCurrentTrackIdx(prev);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const track = tracks[currentTrackIdx];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#0a0d14', color: '#fff', padding: 20 }}>
      <audio ref={audioRef} src={track.src} onEnded={nextTrack} />

      {/* Album Visualizer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.2) 0%, rgba(0,0,0,0.9) 70%)', borderRadius: 12, border: '1px solid rgba(var(--accent-rgb),0.3)', marginBottom: 20 }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', boxShadow: isPlaying ? '0 0 30px var(--accent)' : 'none', animation: isPlaying ? 'spin 10s linear infinite' : 'none' }}>
          <MusicIcon size={40} color="var(--accent)" />
        </div>
        <div style={{ marginTop: 16, color: 'var(--accent)', fontSize: 16, fontWeight: 'bold' }}>{track.title}</div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{track.artist}</div>
      </div>

      {/* Track Player Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
        <button onClick={prevTrack} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><SkipBack size={24} /></button>
        <button onClick={togglePlay} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--accent)' }}>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button onClick={nextTrack} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><SkipForward size={24} /></button>
      </div>

      {/* Playlist Drawer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, maxHeight: 120, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 }}>AUDIO PLAYLIST</div>
        {tracks.map((t, idx) => (
          <div
            key={t.title}
            onClick={() => { setCurrentTrackIdx(idx); setIsPlaying(true); setTimeout(() => audioRef.current?.play(), 100); }}
            style={{ padding: '6px 10px', borderRadius: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', background: idx === currentTrackIdx ? 'rgba(var(--accent-rgb),0.15)' : 'transparent', color: idx === currentTrackIdx ? 'var(--accent)' : '#aaa', fontSize: 11, marginBottom: 4 }}
          >
            <span>{t.title} - {t.artist}</span>
            <span>{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
export default MusicPlayerWindow;

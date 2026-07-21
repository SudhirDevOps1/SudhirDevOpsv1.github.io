import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, SkipForward, SkipBack,
  Maximize2, Minimize2, Upload, List, X, Shuffle, Repeat, Music
} from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  src: string;
}

export const MusicPlayerWindow = memo(() => {
  const [tracks, setTracks] = useState<Track[]>([
    { id: 1, title: 'Synthwave Neon Drive', artist: 'Retro Electro', duration: '3:45', src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { id: 2, title: 'Chill Lofi Study', artist: 'Lofi Girl Sim', duration: '2:50', src: 'https://cdn.pixabay.com/download/audio/2021/11/13/audio_91b32e02cf.mp3' },
    { id: 3, title: 'Epic Cinematic Rise', artist: 'Orchestral AI', duration: '4:10', src: 'https://cdn.pixabay.com/download/audio/2023/06/14/audio_8b0df7dd64.mp3' },
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [visualBars] = useState(() => Array.from({ length: 32 }, (_, i) => i));

  const audioRef = useRef<HTMLAudioElement>(null);
  const animRef = useRef<number>(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(32).fill(4));

  const track = tracks[currentIdx];

  // Animate bars when playing
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setBarHeights(prev => prev.map(() => Math.random() * 40 + 4));
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animRef.current);
      setBarHeights(Array(32).fill(4));
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !muted;
    setMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const nextTrack = useCallback(() => {
    const next = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (currentIdx + 1) % tracks.length;
    setCurrentIdx(next);
    setProgress(0);
    setTimeout(() => { audioRef.current?.play().catch(() => {}); setIsPlaying(true); }, 100);
  }, [currentIdx, tracks.length, shuffle]);

  const prevTrack = () => {
    const prev = (currentIdx - 1 + tracks.length) % tracks.length;
    setCurrentIdx(prev);
    setProgress(0);
    setTimeout(() => { audioRef.current?.play().catch(() => {}); setIsPlaying(true); }, 100);
  };

  const handleEnded = () => {
    if (repeat) { audioRef.current!.currentTime = 0; audioRef.current?.play(); }
    else nextTrack();
  };

  // Upload local audio files
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newTracks: Track[] = files.map((f, i) => ({
      id: Date.now() + i,
      title: f.name.replace(/\.[^.]+$/, ''),
      artist: 'Local File',
      duration: '?:??',
      src: URL.createObjectURL(f),
    }));
    setTracks(prev => [...prev, ...newTracks]);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#08090f', fontFamily: 'var(--font-mono)', color: '#fff', userSelect: 'none' }}>
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        volume={volume}
      />

      {/* Visualizer + Album Art */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb),0.15) 0%, #08090f 70%)' }}>
        {/* Spinning Disc */}
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #1a1a2e, #16213e, #0f3460, #533483)',
          border: '4px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isPlaying ? '0 0 40px rgba(var(--accent-rgb),0.6)' : '0 0 10px rgba(var(--accent-rgb),0.2)',
          animation: isPlaying ? 'spin 4s linear infinite' : 'none',
          marginBottom: 16,
          position: 'relative',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#000', border: '2px solid var(--accent)' }} />
        </div>

        <div style={{ fontSize: 15, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4, textAlign: 'center' }}>{track.title}</div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>{track.artist}</div>

        {/* Waveform Visualizer */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 48, marginBottom: 16, opacity: 0.8 }}>
          {visualBars.map((_, i) => (
            <div key={i} style={{
              width: 5, height: barHeights[i] || 4,
              background: `hsl(${(i / 32) * 120 + 120}, 100%, 60%)`,
              borderRadius: 2,
              transition: 'height 0.08s ease',
            }} />
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <input type="range" min={0} max={duration || 1} step={0.1} value={progress}
            onChange={handleSeek}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: 4 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#666', marginTop: 4 }}>
            <span>{fmt(progress)}</span>
            <span>{duration ? fmt(duration) : track.duration}</span>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16, background: '#0d0f1a' }}>
        <button onClick={() => setShuffle(v => !v)} title="Shuffle" style={{ background: 'none', border: 'none', color: shuffle ? 'var(--accent)' : '#555', cursor: 'pointer' }}>
          <Shuffle size={18} />
        </button>
        <button onClick={prevTrack} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          <SkipBack size={22} />
        </button>
        <button onClick={togglePlay}
          style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent)', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(var(--accent-rgb),0.5)', flexShrink: 0 }}>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button onClick={nextTrack} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          <SkipForward size={22} />
        </button>
        <button onClick={() => setRepeat(v => !v)} title="Repeat" style={{ background: 'none', border: 'none', color: repeat ? 'var(--accent)' : '#555', cursor: 'pointer' }}>
          <Repeat size={18} />
        </button>

        <div style={{ flex: 1 }} />

        {/* Volume */}
        <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{ width: 80, accentColor: 'var(--accent)', cursor: 'pointer' }} />

        <button onClick={() => setShowPlaylist(v => !v)} title="Playlist" style={{ background: 'none', border: 'none', color: showPlaylist ? 'var(--accent)' : '#555', cursor: 'pointer' }}>
          <List size={18} />
        </button>

        {/* Upload local files */}
        <label title="Add local audio" style={{ cursor: 'pointer', color: '#aaa' }}>
          <Upload size={18} />
          <input type="file" accept="audio/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div style={{ maxHeight: 180, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#08090f' }}>
          <div style={{ padding: '8px 16px', fontSize: 10, color: '#555', letterSpacing: 1, display: 'flex', justifyContent: 'space-between' }}>
            <span>PLAYLIST ({tracks.length} TRACKS)</span>
          </div>
          {tracks.map((t, idx) => (
            <div key={t.id}
              onClick={() => { setCurrentIdx(idx); setProgress(0); setTimeout(() => { audioRef.current?.play().catch(() => {}); setIsPlaying(true); }, 100); }}
              style={{
                padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                background: idx === currentIdx ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                borderLeft: idx === currentIdx ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (idx !== currentIdx) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (idx !== currentIdx) e.currentTarget.style.background = 'transparent'; }}
            >
              <Music size={14} color={idx === currentIdx ? 'var(--accent)' : '#555'} />
              <div style={{ flex: 1 }}>
                <div style={{ color: idx === currentIdx ? 'var(--accent)' : '#ddd', fontSize: 12, fontWeight: idx === currentIdx ? 'bold' : 'normal' }}>{t.title}</div>
                <div style={{ color: '#666', fontSize: 10 }}>{t.artist}</div>
              </div>
              <div style={{ color: '#555', fontSize: 10 }}>{t.duration}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
export default MusicPlayerWindow;

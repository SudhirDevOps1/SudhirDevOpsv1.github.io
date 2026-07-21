import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, SkipForward, SkipBack,
  Maximize2, Minimize2, Upload, List, Settings2, Film
} from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  src: string;
  thumb?: string;
  type: 'url' | 'local';
}

export const VideoPlayerWindow = memo(() => {
  const [playlist, setPlaylist] = useState<VideoItem[]>([
    { id: 1, title: 'Big Buck Bunny', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumb: 'https://img.youtube.com/vi/YE7VzlLtp-4/hqdefault.jpg', type: 'url' },
    { id: 2, title: 'Elephants Dream', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', type: 'url' },
    { id: 3, title: 'For Bigger Blazes', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'url' },
    { id: 4, title: 'Subaru Outback 2013', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', type: 'url' },
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [speed, setSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);

  const current = playlist[currentIdx];

  const showCtrl = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => { if (isPlaying) setShowControls(false); }, 2500);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play().catch(() => {}); setIsPlaying(true); }
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setProgress(t);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = false; }
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newVids: VideoItem[] = files.map((f, i) => ({
      id: Date.now() + i,
      title: f.name.replace(/\.[^.]+$/, ''),
      src: URL.createObjectURL(f),
      type: 'local',
    }));
    setPlaylist(prev => [...prev, ...newVids]);
    if (newVids.length) { setCurrentIdx(playlist.length); setProgress(0); }
  };

  const addByUrl = () => {
    if (!urlInput.trim()) return;
    const newVid: VideoItem = { id: Date.now(), title: urlInput.split('/').pop() || 'Stream', src: urlInput, type: 'url' };
    setPlaylist(prev => [...prev, newVid]);
    setCurrentIdx(playlist.length);
    setUrlInput('');
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    setSpeed(speeds[nextIdx]);
    if (videoRef.current) videoRef.current.playbackRate = speeds[nextIdx];
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area */}
        <div
          ref={containerRef}
          style={{ flex: 1, position: 'relative', background: '#000', cursor: 'pointer' }}
          onMouseMove={showCtrl}
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            key={current.src}
            src={current.src}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            onTimeUpdate={() => { if (videoRef.current) setProgress(videoRef.current.currentTime); }}
            onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => { const next = (currentIdx + 1) % playlist.length; setCurrentIdx(next); setProgress(0); setTimeout(() => { videoRef.current?.play().catch(() => {}); setIsPlaying(true); }, 100); }}
            volume={volume}
            muted={muted}
          />

          {/* Overlay Controls */}
          <div style={{
            position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.8) 100%)',
            opacity: showControls ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: showControls ? 'auto' : 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>
              🎬 {current.title}
            </div>

            {/* Progress */}
            <input type="range" min={0} max={duration || 1} step={0.1} value={progress}
              onChange={handleSeek}
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', marginBottom: 8 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={e => { e.stopPropagation(); const p = (currentIdx - 1 + playlist.length) % playlist.length; setCurrentIdx(p); setProgress(0); }} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer' }}><SkipBack size={16} /></button>
              <button onClick={e => { e.stopPropagation(); togglePlay(); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button onClick={e => { e.stopPropagation(); const n = (currentIdx + 1) % playlist.length; setCurrentIdx(n); setProgress(0); }} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer' }}><SkipForward size={16} /></button>

              <span style={{ fontSize: 10, color: '#aaa', minWidth: 80 }}>{fmt(progress)} / {duration ? fmt(duration) : '--:--'}</span>

              <div style={{ flex: 1 }} />

              <button onClick={e => { e.stopPropagation(); toggleMute(); }} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer' }}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                onChange={handleVolume}
                onClick={e => e.stopPropagation()}
                style={{ width: 70, accentColor: 'var(--accent)', cursor: 'pointer' }} />

              <button onClick={e => { e.stopPropagation(); changeSpeed(); }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                {speed}x
              </button>

              <button onClick={e => { e.stopPropagation(); toggleFullscreen(); }} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer' }}>
                {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          {/* Center play button when paused */}
          {!isPlaying && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={28} color="#000" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Playlist */}
        {showPlaylist && (
          <div style={{ width: 220, borderLeft: '1px solid #1a1a1a', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', fontSize: 10, color: '#666', letterSpacing: 1 }}>
              PLAYLIST ({playlist.length})
            </div>

            {/* Add URL */}
            <div style={{ padding: '8px 8px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: 4 }}>
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Paste video URL..."
                onKeyDown={e => e.key === 'Enter' && addByUrl()}
                style={{ flex: 1, background: '#111', border: '1px solid #333', color: '#fff', padding: '4px 6px', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }} />
              <button onClick={addByUrl} style={{ padding: '4px 8px', background: 'rgba(var(--accent-rgb),0.2)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>+</button>
            </div>

            {/* Upload */}
            <label style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 11 }}>
              <Upload size={12} /> Upload local video
              <input type="file" accept="video/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
            </label>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {playlist.map((v, idx) => (
                <div key={v.id} onClick={() => { setCurrentIdx(idx); setProgress(0); setTimeout(() => { videoRef.current?.play().catch(() => {}); setIsPlaying(true); }, 100); }}
                  style={{
                    padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    background: idx === currentIdx ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                    borderLeft: idx === currentIdx ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (idx !== currentIdx) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (idx !== currentIdx) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Film size={12} color={idx === currentIdx ? 'var(--accent)' : '#555'} />
                  <div style={{ fontSize: 11, color: idx === currentIdx ? 'var(--accent)' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{v.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toggle */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid #1a1a1a', background: '#080808', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setShowPlaylist(v => !v)} style={{ padding: '4px 10px', border: '1px solid #333', background: showPlaylist ? 'rgba(var(--accent-rgb),0.15)' : '#111', color: showPlaylist ? 'var(--accent)' : '#666', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
          ≡ Playlist
        </button>
        <span style={{ color: '#444', fontSize: 10 }}>Double-click video to toggle fullscreen • Arrow keys seek</span>
      </div>
    </div>
  );
});
export default VideoPlayerWindow;

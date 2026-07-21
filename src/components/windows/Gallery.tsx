import React, { memo, useState, useCallback } from 'react';
import { Upload, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, Grid, Maximize2, RotateCw, Trash2 } from 'lucide-react';

interface Photo {
  id: number;
  title: string;
  url: string;
  category: string;
  local?: boolean;
}

const DEFAULT_PHOTOS: Photo[] = [
  { id: 1, title: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop', category: 'City' },
  { id: 2, title: 'Neon Matrix Code', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop', category: 'Abstract' },
  { id: 3, title: 'Retro Synthwave Sun', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop', category: 'Space' },
  { id: 4, title: 'Deep Ocean Blue', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop', category: 'Nature' },
  { id: 5, title: 'Dark Aurora', url: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1200&auto=format&fit=crop', category: 'Space' },
  { id: 6, title: 'Code Screen', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop', category: 'Tech' },
  { id: 7, title: 'Tokyo Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop', category: 'City' },
  { id: 8, title: 'Milky Way Galaxy', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop', category: 'Space' },
  { id: 9, title: 'Green Forest Path', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop', category: 'Nature' },
  { id: 10, title: 'Futuristic Abstract', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop', category: 'Abstract' },
  { id: 11, title: 'Circuit Board Blue', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop', category: 'Tech' },
  { id: 12, title: 'Mountain Lake', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop', category: 'Nature' },
];

export const GalleryWindow = memo(() => {
  const [photos, setPhotos] = useState<Photo[]>(DEFAULT_PHOTOS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const categories = ['All', 'City', 'Abstract', 'Space', 'Nature', 'Tech', 'Local'];
  const filtered = filter === 'All' ? photos : photos.filter(p => p.category === filter);
  const selected = filtered[selectedIdx] || filtered[0];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: Photo[] = files.map((f, i) => ({
      id: Date.now() + i,
      title: f.name.replace(/\.[^.]+$/, ''),
      url: URL.createObjectURL(f),
      category: 'Local',
      local: true,
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    setFilter('Local');
  };

  const openSingle = (idx: number) => {
    setSelectedIdx(idx);
    setViewMode('single');
    setZoom(1);
    setRotation(0);
  };

  const prev = () => setSelectedIdx(i => (i - 1 + filtered.length) % filtered.length);
  const next = () => setSelectedIdx(i => (i + 1) % filtered.length);

  const downloadCurrent = () => {
    const a = document.createElement('a');
    a.href = selected.url;
    a.download = selected.title + '.jpg';
    a.target = '_blank';
    a.click();
  };

  const deletePhoto = () => {
    setPhotos(prev => prev.filter(p => p.id !== selected.id));
    setSelectedIdx(Math.max(0, selectedIdx - 1));
  };

  // Keyboard navigation in single mode
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (viewMode !== 'single') return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') setViewMode('grid');
    if (e.key === '+' || e.key === '=') setZoom(z => Math.min(3, z + 0.25));
    if (e.key === '-') setZoom(z => Math.max(0.25, z - 0.25));
  }, [viewMode, selectedIdx, filtered.length]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07080d', fontFamily: 'var(--font-mono)' }} onKeyDown={handleKey} tabIndex={0}>
      {/* Toolbar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid #161820', display: 'flex', alignItems: 'center', gap: 8, background: '#0c0d14', flexWrap: 'wrap' }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', flex: 1 }}>
          {categories.map(c => (
            <button key={c} onClick={() => { setFilter(c); setSelectedIdx(0); setViewMode('grid'); }}
              style={{ padding: '3px 10px', border: `1px solid ${filter === c ? 'var(--accent)' : '#282830'}`, background: filter === c ? 'rgba(var(--accent-rgb),0.15)' : '#111', color: filter === c ? 'var(--accent)' : '#888', borderRadius: 12, cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <label title="Upload local images" style={{ cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', border: '1px solid #282830', borderRadius: 4 }}>
            <Upload size={12} /> Upload
            <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          </label>

          <button onClick={() => setViewMode(v => v === 'grid' ? 'single' : 'grid')}
            style={{ padding: '3px 8px', border: '1px solid #282830', background: '#111', color: '#888', borderRadius: 4, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            {viewMode === 'grid' ? <Maximize2 size={12} /> : <Grid size={12} />}
            {viewMode === 'grid' ? 'View' : 'Grid'}
          </button>

          <span style={{ color: '#444', fontSize: 10 }}>{filtered.length} photos</span>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {filtered.map((photo, idx) => (
              <div key={photo.id}
                onDoubleClick={() => openSingle(idx)}
                onClick={() => setSelectedIdx(idx)}
                style={{
                  borderRadius: 8, overflow: 'hidden', cursor: 'pointer', position: 'relative',
                  border: selectedIdx === idx ? '2px solid var(--accent)' : '2px solid transparent',
                  boxShadow: selectedIdx === idx ? '0 0 12px rgba(var(--accent-rgb),0.4)' : 'none',
                  transition: 'all 0.15s', aspectRatio: '4/3',
                }}
              >
                <img src={photo.url} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy" />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  fontSize: 10, color: '#fff', opacity: 0, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                >
                  {photo.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single / Lightbox View */}
      {viewMode === 'single' && selected && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Single View Controls */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid #161820', background: '#0c0d14', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setViewMode('grid')} style={{ ...iconBtn }}><Grid size={15} /></button>
            <button onClick={prev} style={{ ...iconBtn }}><ChevronLeft size={15} /></button>
            <button onClick={next} style={{ ...iconBtn }}><ChevronRight size={15} /></button>
            <span style={{ color: '#666', fontSize: 11, flex: 1 }}>{selected.title} ({selectedIdx + 1}/{filtered.length})</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom In" style={iconBtn}><ZoomIn size={15} /></button>
            <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} title="Zoom Out" style={iconBtn}><ZoomOut size={15} /></button>
            <button onClick={() => setRotation(r => (r + 90) % 360)} title="Rotate" style={iconBtn}><RotateCw size={15} /></button>
            <button onClick={downloadCurrent} title="Download" style={iconBtn}><Download size={15} /></button>
            {selected.local && <button onClick={deletePhoto} title="Delete" style={{ ...iconBtn, color: '#FF4444' }}><Trash2 size={15} /></button>}
            <span style={{ fontSize: 10, color: '#444', background: '#111', padding: '2px 6px', borderRadius: 4 }}>{Math.round(zoom * 100)}%</span>
          </div>

          {/* Image Display */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040507', position: 'relative' }}>
            <img
              src={selected.url}
              alt={selected.title}
              style={{
                maxWidth: zoom > 1 ? 'none' : '100%',
                maxHeight: zoom > 1 ? 'none' : '100%',
                width: zoom !== 1 ? `${zoom * 100}%` : 'auto',
                objectFit: 'contain',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s',
                borderRadius: 4,
              }}
              draggable={false}
            />

            {/* Nav Arrows overlay */}
            <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid #333', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>‹</button>
            <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid #333', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>›</button>
          </div>

          {/* Thumbnail Strip */}
          <div style={{ height: 72, borderTop: '1px solid #161820', background: '#0a0a0f', display: 'flex', gap: 6, padding: '6px 10px', overflowX: 'auto', alignItems: 'center' }}>
            {filtered.map((p, idx) => (
              <img key={p.id} src={p.url} alt={p.title} onClick={() => setSelectedIdx(idx)}
                style={{ height: 56, width: 80, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: selectedIdx === idx ? '2px solid var(--accent)' : '2px solid transparent', opacity: selectedIdx === idx ? 1 : 0.5, transition: 'all 0.15s', flexShrink: 0 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const iconBtn: React.CSSProperties = {
  padding: '5px 8px', border: '1px solid #282830', background: '#111', color: '#aaa',
  borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default GalleryWindow;

import React, { memo, useState } from 'react';

export const GalleryWindow = memo(() => {
  const localPhotos = [
    { id: 1, title: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop', category: 'City' },
    { id: 2, title: 'Neon Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop', category: 'Abstract' },
    { id: 3, title: 'Retro Synthwave', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop', category: 'Space' },
    { id: 4, title: 'Deep Ocean Blue', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop', category: 'Nature' },
    { id: 5, title: 'Dark Aurora', url: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=800&auto=format&fit=crop', category: 'Space' },
    { id: 6, title: 'Code Screen', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop', category: 'Tech' },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState(localPhotos[0]);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'City', 'Abstract', 'Space', 'Nature', 'Tech'];
  const filtered = filter === 'All' ? localPhotos : localPhotos.filter(p => p.category === filter);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', background: '#080808' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #222', display: 'flex', gap: 8, overflowX: 'auto', background: '#0c0c0c' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ padding: '4px 12px', border: `1px solid ${filter === c ? 'var(--accent)' : '#333'}`, background: filter === c ? 'rgba(var(--accent-rgb),0.15)' : '#111', color: filter === c ? 'var(--accent)' : '#aaa', borderRadius: 14, cursor: 'pointer', fontSize: 11 }}>{c}</button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative' }}>
          <img src={selectedPhoto.url} alt={selectedPhoto.title} style={{ maxWidth: '100%', maxHeight: '80%', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.8)', objectFit: 'contain' }} />
          <div style={{ marginTop: 12, color: 'var(--accent)', fontSize: 14, fontWeight: 'bold' }}>{selectedPhoto.title} ({selectedPhoto.category})</div>
        </div>

        <div style={{ width: 220, borderLeft: '1px solid #222', padding: 12, overflowY: 'auto', background: '#0a0a0a' }}>
          <div style={{ color: '#666', fontSize: 10, marginBottom: 10, letterSpacing: 1 }}>PHOTO GALLERY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelectedPhoto(p)} style={{ border: selectedPhoto.id === p.id ? '2px solid var(--accent)' : '1px solid #222', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', height: 70 }}>
                <img src={p.url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
export default GalleryWindow;

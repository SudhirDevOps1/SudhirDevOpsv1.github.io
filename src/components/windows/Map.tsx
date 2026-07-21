import React, { memo, useState } from 'react';
import { MapPin, Navigation, Search, Layers, Satellite, Map } from 'lucide-react';

export const MapWindow = memo(() => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ name: 'Bihar, India', lat: 25.5941, lng: 85.1376 });
  const [zoom, setZoom] = useState(8);

  // Map type tiles
  const tileUrls = {
    roadmap: `https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 1},${currentLocation.lat - 0.7},${currentLocation.lng + 1},${currentLocation.lat + 0.7}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`,
    satellite: `https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.5},${currentLocation.lat - 0.35},${currentLocation.lng + 0.5},${currentLocation.lat + 0.35}&layer=hot&marker=${currentLocation.lat},${currentLocation.lng}`,
    terrain: `https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 2},${currentLocation.lat - 1.4},${currentLocation.lng + 2},${currentLocation.lat + 1.4}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`,
  };

  const savedPlaces = [
    { name: 'Bihar, India', lat: 25.5941, lng: 85.1376, icon: '🏠' },
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, icon: '🌆' },
    { name: 'Delhi, India', lat: 28.6139, lng: 77.2090, icon: '🏛️' },
    { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946, icon: '💻' },
    { name: 'New York, USA', lat: 40.7128, lng: -74.0060, icon: '🗽' },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278, icon: '🎡' },
  ];

  const handleSearch = () => {
    const found = savedPlaces.find(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found) {
      setCurrentLocation({ name: found.name, lat: found.lat, lng: found.lng });
    }
  };

  const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCurrentLocation({ name: 'Your Location', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => alert('Location access denied or unavailable.')
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#08090e', fontFamily: 'var(--font-mono)' }}>
      {/* Header */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid #15171f', background: '#0c0e18', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Map size={16} color="var(--accent)" />
        <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: 13, marginRight: 8 }}>SUDHI MAP</span>

        {/* Search */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #252530', borderRadius: 6, padding: '4px 10px', maxWidth: 400 }}>
          <Search size={13} color="#555" style={{ marginRight: 6 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search city, place..."
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 12, fontFamily: 'var(--font-mono)' }}
          />
          <button onClick={handleSearch} style={{ padding: '2px 8px', background: 'rgba(var(--accent-rgb),0.2)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Go</button>
        </div>

        {/* My Location */}
        <button onClick={getMyLocation} title="My Location" style={{ padding: '5px 10px', border: '1px solid #252530', background: '#111', color: '#aaa', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
          <Navigation size={13} /> My Location
        </button>

        {/* Map Type */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['roadmap', 'satellite', 'terrain'] as const).map(t => (
            <button key={t} onClick={() => setMapType(t)}
              style={{ padding: '4px 8px', border: `1px solid ${mapType === t ? 'var(--accent)' : '#252530'}`, background: mapType === t ? 'rgba(var(--accent-rgb),0.2)' : '#111', color: mapType === t ? 'var(--accent)' : '#777', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Map iframe (OpenStreetMap - free, no API key) */}
        <div style={{ flex: 1, position: 'relative', background: '#111' }}>
          <iframe
            title="OpenStreetMap"
            src={tileUrls[mapType]}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
          {/* Location badge */}
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.8)', border: '1px solid var(--accent)', borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(6px)' }}>
            <MapPin size={14} color="var(--accent)" />
            <span style={{ color: '#fff', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{currentLocation.name}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.75)', borderRadius: 4, padding: '4px 10px', fontSize: 10, color: '#666' }}>
            {currentLocation.lat.toFixed(4)}°N, {currentLocation.lng.toFixed(4)}°E
          </div>
        </div>

        {/* Places Sidebar */}
        <div style={{ width: 190, borderLeft: '1px solid #15171f', background: '#0a0c14', overflowY: 'auto', padding: 12 }}>
          <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 10, fontWeight: 'bold' }}>SAVED PLACES</div>
          {savedPlaces.map(place => (
            <div key={place.name}
              onClick={() => setCurrentLocation({ name: place.name, lat: place.lat, lng: place.lng })}
              style={{
                padding: '8px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 6,
                background: currentLocation.name === place.name ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${currentLocation.name === place.name ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (currentLocation.name !== place.name) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (currentLocation.name !== place.name) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{place.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: currentLocation.name === place.name ? 'var(--accent)' : '#ccc', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{place.name}</div>
                  <div style={{ fontSize: 9, color: '#555' }}>{place.lat.toFixed(2)}°N</div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, fontSize: 10, color: '#444', lineHeight: 1.5 }}>
            💡 Powered by OpenStreetMap.<br />
            Click places to navigate.<br />
            "My Location" uses browser GPS.
          </div>
        </div>
      </div>
    </div>
  );
});
export default MapWindow;

import React, { memo, useState, useEffect, useCallback } from 'react';
import { RefreshCw, Rocket, MapPin, AlertTriangle, Globe, Clock } from 'lucide-react';

interface SpaceXLaunch {
  id: string;
  name: string;
  date_utc: string;
  details: string | null;
  rocket: string;
  success: boolean | null;
  upcoming: boolean;
  links: { patch: { small: string | null }; webcast: string | null };
}

interface EarthquakeFeature {
  id: string;
  properties: { mag: number; place: string; time: number; status: string; type: string };
  geometry: { coordinates: number[] };
}

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

export const SpaceWindow = memo(() => {
  const [tab, setTab] = useState<'spacex' | 'iss' | 'earthquakes'>('spacex');
  const [launches, setLaunches] = useState<SpaceXLaunch[]>([]);
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [iss, setISS] = useState<ISSPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [nextLaunch, setNextLaunch] = useState<SpaceXLaunch | null>(null);

  const fetchSpaceX = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.spacexdata.com/v4/launches/upcoming');
      const data: SpaceXLaunch[] = await res.json();
      const sorted = data.sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime());
      setLaunches(sorted.slice(0, 10));
      setNextLaunch(sorted[0] || null);
    } catch {}
    setLoading(false);
  }, []);

  const fetchEarthquakes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson');
      const data = await res.json();
      setEarthquakes(data.features.slice(0, 20));
    } catch {}
    setLoading(false);
  }, []);

  const fetchISS = useCallback(async () => {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const data = await res.json();
      setISS({ latitude: data.latitude, longitude: data.longitude, altitude: data.altitude, velocity: data.velocity, timestamp: data.timestamp });
    } catch {}
  }, []);

  useEffect(() => {
    fetchSpaceX();
  }, [fetchSpaceX]);

  useEffect(() => {
    if (tab === 'earthquakes') fetchEarthquakes();
    if (tab === 'iss') {
      fetchISS();
      const interval = setInterval(fetchISS, 5000);
      return () => clearInterval(interval);
    }
  }, [tab, fetchEarthquakes, fetchISS]);

  // Countdown timer for next launch
  useEffect(() => {
    if (!nextLaunch) return;
    const tick = () => {
      const diff = new Date(nextLaunch.date_utc).getTime() - Date.now();
      if (diff <= 0) { setCountdown('LAUNCH NOW! 🚀'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [nextLaunch]);

  const magColor = (m: number) => m >= 7 ? '#FF0055' : m >= 6 ? '#FF8800' : m >= 5 ? '#FFB300' : '#00FF88';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#030408', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #0f121e', background: '#080a14' }}>
        {[
          { id: 'spacex' as const, label: '🚀 SpaceX Launches', },
          { id: 'iss' as const, label: '🛸 ISS Tracker' },
          { id: 'earthquakes' as const, label: '🌍 Earthquakes' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 16px', border: 'none', borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent', background: tab === t.id ? 'rgba(var(--accent-rgb),0.08)' : 'transparent', color: tab === t.id ? 'var(--accent)' : '#666', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => { if (tab === 'spacex') fetchSpaceX(); else if (tab === 'earthquakes') fetchEarthquakes(); else fetchISS(); }}
          style={{ padding: '8px 12px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* SpaceX Tab */}
      {tab === 'spacex' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Countdown Banner */}
          {nextLaunch && (
            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(var(--accent-rgb),0.1))', borderBottom: '1px solid rgba(var(--accent-rgb),0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 6 }}>NEXT SPACEX LAUNCH</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>{nextLaunch.name}</div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>{countdown}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 6 }}>
                {new Date(nextLaunch.date_utc).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
              {nextLaunch.links.webcast && (
                <a href={nextLaunch.links.webcast} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', marginTop: 10, padding: '5px 14px', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 4, fontSize: 11, textDecoration: 'none' }}>
                  ▶ Watch Livestream
                </a>
              )}
            </div>
          )}

          {launches.map(launch => (
            <div key={launch.id} style={{ padding: '12px 16px', borderBottom: '1px solid #0a0c14', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(var(--accent-rgb),0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                {launch.links.patch.small ? <img src={launch.links.patch.small} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} /> : '🚀'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ddd', marginBottom: 3 }}>{launch.name}</div>
                <div style={{ fontSize: 10, color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={10} />
                  {new Date(launch.date_utc).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {launch.details && <div style={{ fontSize: 10, color: '#666', marginTop: 4, lineHeight: 1.4 }}>{launch.details.slice(0, 120)}...</div>}
              </div>
            </div>
          ))}

          {loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--accent)' }}>🚀 Loading SpaceX data...</div>}
        </div>
      )}

      {/* ISS Tracker Tab */}
      {tab === 'iss' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>🛸</div>
            <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 'bold', marginBottom: 6 }}>INTERNATIONAL SPACE STATION</div>
            <div style={{ fontSize: 10, color: '#555' }}>Live position updates every 5 seconds • Data: wheretheiss.at</div>
          </div>

          {iss ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '📍', label: 'Latitude', value: `${iss.latitude.toFixed(4)}°` },
                { icon: '📍', label: 'Longitude', value: `${iss.longitude.toFixed(4)}°` },
                { icon: '🔭', label: 'Altitude', value: `${Math.round(iss.altitude)} km` },
                { icon: '⚡', label: 'Speed', value: `${Math.round(iss.velocity)} km/h` },
              ].map(stat => (
                <div key={stat.label} style={{ padding: 16, border: '1px solid rgba(var(--accent-rgb),0.2)', borderRadius: 10, background: 'rgba(var(--accent-rgb),0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--accent)' }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: 20 }}>Fetching ISS position...</div>
          )}

          <div style={{ marginTop: 20, padding: 14, border: '1px solid #1a1c28', borderRadius: 10, background: 'rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 10, color: '#444', marginBottom: 8 }}>ISS ORBITAL VISUALIZATION</div>
            <div style={{ height: 140, position: 'relative', background: 'radial-gradient(ellipse at center, #00113a 0%, #000 70%)', borderRadius: 8, overflow: 'hidden', border: '1px solid #1a1c28' }}>
              {/* Earth */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #1a6ef0 0%, #0a3a8a 50%, #062055 100%)', boxShadow: '0 0 20px rgba(26,110,240,0.5)' }} />
              {/* ISS dot */}
              {iss && (
                <div style={{ position: 'absolute', left: `${((iss.longitude + 180) / 360) * 100}%`, top: `${((90 - iss.latitude) / 180) * 100}%`, transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', zIndex: 2 }} title={`ISS: ${iss.latitude.toFixed(2)}°N, ${iss.longitude.toFixed(2)}°E`} />
              )}
              <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', opacity: 0.05 }}>
                {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ borderRight: '1px solid #fff' }} />)}
              </div>
            </div>
            <div style={{ fontSize: 9, color: '#333', marginTop: 6, textAlign: 'center' }}>Dot shows ISS position on world grid • Auto-updates every 5s</div>
          </div>
        </div>
      )}

      {/* Earthquakes Tab */}
      {tab === 'earthquakes' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #0a0c14', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#FFB300" />
            <span style={{ fontSize: 11, color: '#aaa' }}>Magnitude 4.5+ Earthquakes — Last 7 Days (USGS)</span>
          </div>

          {loading && <div style={{ padding: 24, textAlign: 'center', color: 'var(--accent)' }}>🌍 Loading earthquake data...</div>}

          {earthquakes.map(eq => {
            const mag = eq.properties.mag;
            const color = magColor(mag);
            const [lon, lat] = eq.geometry.coordinates;
            return (
              <div key={eq.id} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: color + '15' }}>
                  <span style={{ fontSize: 14, fontWeight: 'bold', color }}>{mag.toFixed(1)}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#ddd', marginBottom: 2 }}>{eq.properties.place}</div>
                  <div style={{ fontSize: 10, color: '#555', display: 'flex', gap: 10 }}>
                    <span>📍 {lat.toFixed(2)}°, {lon.toFixed(2)}°</span>
                    <span>🕐 {new Date(eq.properties.time).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: color + '22', color }}>
                  M{mag.toFixed(1)}
                </div>
              </div>
            );
          })}
          {earthquakes.length === 0 && !loading && (
            <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>No major earthquakes found. Click refresh.</div>
          )}
        </div>
      )}
    </div>
  );
});
export default SpaceWindow;

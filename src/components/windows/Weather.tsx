import React, { memo, useState, useEffect, useCallback } from 'react';
import { Cloud, Wind, Thermometer, Droplets, Eye, MapPin, RefreshCw, Search } from 'lucide-react';

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Clear Sky', emoji: '☀️' },
  1: { label: 'Mostly Clear', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' },
  48: { label: 'Icy Fog', emoji: '🌫️' },
  51: { label: 'Light Drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  61: { label: 'Slight Rain', emoji: '🌧️' },
  63: { label: 'Moderate Rain', emoji: '🌧️' },
  65: { label: 'Heavy Rain', emoji: '🌧️' },
  71: { label: 'Light Snow', emoji: '❄️' },
  73: { label: 'Moderate Snow', emoji: '❄️' },
  80: { label: 'Rain Showers', emoji: '🌦️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  99: { label: 'Hail Storm', emoji: '⛈️' },
};

const CITIES = [
  { name: 'Bihar, India', lat: 25.5941, lon: 85.1376 },
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Bangalore, India', lat: 12.9716, lon: 77.5946 },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
];

interface WeatherData {
  temp: number;
  feelsLike: number;
  windspeed: number;
  humidity: number;
  weathercode: number;
  hourlyTemps: number[];
  hourlyTimes: string[];
}

export const WeatherWindow = memo(() => {
  const [city, setCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,windspeed_10m,relativehumidity_2m,weathercode&hourly=temperature_2m&timezone=auto&forecast_days=1`
      );
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        windspeed: Math.round(data.current.windspeed_10m),
        humidity: Math.round(data.current.relativehumidity_2m),
        weathercode: data.current.weathercode,
        hourlyTemps: data.hourly.temperature_2m.slice(0, 24),
        hourlyTimes: data.hourly.time.slice(0, 24).map((t: string) => t.slice(11, 16)),
      });
    } catch {
      setError('Failed to fetch weather data. Check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city.lat, city.lon);
  }, [city, fetchWeather]);

  const toF = (c: number) => Math.round((c * 9 / 5) + 32);
  const displayTemp = (c: number) => unit === 'celsius' ? `${c}°C` : `${toF(c)}°F`;

  const condition = weather ? (WMO_CODES[weather.weathercode] || { label: 'Unknown', emoji: '🌡️' }) : null;
  const maxHourly = weather ? Math.max(...weather.hourlyTemps) : 30;
  const minHourly = weather ? Math.min(...weather.hourlyTemps) : 15;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a0533 100%)', fontFamily: 'var(--font-mono)', color: '#fff', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
        <Cloud size={16} color="var(--accent)" />
        <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: 13 }}>LIVE WEATHER</span>
        <span style={{ fontSize: 10, color: '#555', flex: 1 }}>Powered by Open-Meteo (No API Key)</span>
        <button onClick={() => setUnit(u => u === 'celsius' ? 'fahrenheit' : 'celsius')}
          style={{ padding: '3px 8px', border: '1px solid #333', background: '#111', color: '#aaa', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
          °{unit === 'celsius' ? 'F' : 'C'}
        </button>
        <button onClick={() => fetchWeather(city.lat, city.lon)}
          style={{ padding: '5px', border: '1px solid #333', background: '#111', color: '#aaa', borderRadius: 4, cursor: 'pointer', display: 'flex' }}>
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* City Selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {CITIES.map(c => (
            <button key={c.name} onClick={() => setCity(c)}
              style={{ padding: '4px 10px', border: `1px solid ${city.name === c.name ? 'var(--accent)' : '#222'}`, background: city.name === c.name ? 'rgba(var(--accent-rgb),0.2)' : '#111', color: city.name === c.name ? 'var(--accent)' : '#777', borderRadius: 12, cursor: 'pointer', fontSize: 10, whiteSpace: 'nowrap' }}>
              <MapPin size={9} style={{ marginRight: 3 }} />{c.name.split(',')[0]}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent)' }}>
            <div style={{ fontSize: 36, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>⛅</div>
            Fetching live weather data...
          </div>
        )}

        {error && <div style={{ color: '#FF4444', padding: 16, border: '1px solid #FF4444', borderRadius: 8, textAlign: 'center' }}>{error}</div>}

        {weather && condition && !loading && (
          <>
            {/* Main Weather Display */}
            <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 20 }}>
              <div style={{ fontSize: 72, marginBottom: 8, filter: 'drop-shadow(0 0 20px rgba(var(--accent-rgb),0.5))' }}>{condition.emoji}</div>
              <div style={{ fontSize: 56, fontWeight: 'bold', color: 'var(--accent)', lineHeight: 1 }}>{displayTemp(weather.temp)}</div>
              <div style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>{condition.label}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>📍 {city.name} • Feels like {displayTemp(weather.feelsLike)}</div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { icon: <Wind size={16} />, label: 'Wind', value: `${weather.windspeed} km/h` },
                { icon: <Droplets size={16} />, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: <Thermometer size={16} />, label: 'Feels Like', value: displayTemp(weather.feelsLike) },
              ].map(stat => (
                <div key={stat.label} style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent)', display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{stat.value}</div>
                  <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* 24-Hour Temp Chart */}
            <div style={{ padding: 14, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 12, fontWeight: 'bold' }}>24-HOUR FORECAST</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60, overflowX: 'auto' }}>
                {weather.hourlyTemps.map((t, i) => {
                  const height = Math.max(4, ((t - minHourly) / (maxHourly - minHourly + 1)) * 50);
                  const isNow = i === new Date().getHours();
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 28, flex: 1 }}>
                      <div style={{ fontSize: 8, color: isNow ? 'var(--accent)' : '#666' }}>{unit === 'celsius' ? t : toF(t)}°</div>
                      <div style={{ width: '100%', height, background: isNow ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.3)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s', minHeight: 4 }} />
                      {i % 4 === 0 && <div style={{ fontSize: 7, color: '#555' }}>{weather.hourlyTimes[i]}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});
export default WeatherWindow;

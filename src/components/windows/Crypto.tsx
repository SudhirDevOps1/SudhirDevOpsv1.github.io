import React, { memo, useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, Star } from 'lucide-react';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  market_cap_rank: number;
}

const DEFAULT_COINS = 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink';

export const CryptoWindow = memo(() => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change'>('rank');
  const [favorites, setFavorites] = useState<string[]>(['bitcoin', 'ethereum']);
  const [currency, setCurrency] = useState<'usd' | 'inr'>('usd');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchCoins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=${DEFAULT_COINS}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`
      );
      if (!res.ok) throw new Error('Rate limited or API error');
      const data = await res.json();
      setCoins(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError('CoinGecko API rate limit hit. Try again in 60s or check connection.');
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 90000); // refresh every 90s
    return () => clearInterval(interval);
  }, [fetchCoins]);

  const filtered = coins
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return b.current_price - a.current_price;
      if (sortBy === 'change') return Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h);
      return a.market_cap_rank - b.market_cap_rank;
    });

  const fmtPrice = (p: number) => {
    if (currency === 'inr') return `₹${p > 100 ? p.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : p.toFixed(2)}`;
    return `$${p > 1 ? p.toLocaleString('en-US', { maximumFractionDigits: 2 }) : p.toFixed(6)}`;
  };

  const fmtMcap = (m: number) => {
    if (m > 1e12) return `$${(m / 1e12).toFixed(2)}T`;
    if (m > 1e9) return `$${(m / 1e9).toFixed(2)}B`;
    return `$${(m / 1e6).toFixed(2)}M`;
  };

  const toggleFav = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07090e', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #12141e', background: '#0b0d18', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>₿</span>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: 13 }}>CRYPTO TRACKER</span>
          <span style={{ fontSize: 9, color: '#444', background: '#111', padding: '2px 6px', borderRadius: 4 }}>CoinGecko API</span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0f1018', border: '1px solid #1e2030', borderRadius: 6, padding: '4px 10px', maxWidth: 220 }}>
          <Search size={12} color="#555" style={{ marginRight: 6 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coin..."
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 12, fontFamily: 'var(--font-mono)', flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['usd', 'inr'] as const).map(c => (
            <button key={c} onClick={() => setCurrency(c)}
              style={{ padding: '3px 8px', border: `1px solid ${currency === c ? 'var(--accent)' : '#222'}`, background: currency === c ? 'rgba(var(--accent-rgb),0.15)' : '#111', color: currency === c ? 'var(--accent)' : '#666', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        <button onClick={fetchCoins} disabled={loading}
          style={{ padding: '5px', border: '1px solid #222', background: '#111', color: '#aaa', borderRadius: 4, cursor: 'pointer', display: 'flex' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Sort Tabs */}
      <div style={{ padding: '6px 14px', borderBottom: '1px solid #12141e', display: 'flex', gap: 6, alignItems: 'center', background: '#090b14' }}>
        {(['rank', 'price', 'change'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            style={{ padding: '3px 10px', border: `1px solid ${sortBy === s ? 'var(--accent)' : '#1a1c28'}`, background: sortBy === s ? 'rgba(var(--accent-rgb),0.15)' : 'transparent', color: sortBy === s ? 'var(--accent)' : '#666', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
            Sort by {s}
          </button>
        ))}
        {lastUpdated && <span style={{ fontSize: 9, color: '#333', marginLeft: 'auto' }}>Updated {lastUpdated}</span>}
      </div>

      {/* Coins Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '28px 180px 1fr 1fr 1fr 1fr', gap: 0, padding: '8px 14px', fontSize: 9, color: '#444', letterSpacing: 1, fontWeight: 'bold', borderBottom: '1px solid #0f111a', position: 'sticky', top: 0, background: '#07090e', zIndex: 1 }}>
          <span>★</span>
          <span>COIN</span>
          <span style={{ textAlign: 'right' }}>PRICE</span>
          <span style={{ textAlign: 'right' }}>24H %</span>
          <span style={{ textAlign: 'right' }}>MARKET CAP</span>
          <span style={{ textAlign: 'right' }}>VOLUME</span>
        </div>

        {loading && coins.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>₿</div>Fetching live prices...
          </div>
        )}

        {error && (
          <div style={{ margin: 16, padding: 14, border: '1px solid #FF4444', borderRadius: 8, color: '#FF4444', fontSize: 12, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {filtered.map((coin, idx) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          const changeColor = isUp ? '#00FF88' : '#FF4444';
          const isFav = favorites.includes(coin.id);

          return (
            <div key={coin.id}
              style={{ display: 'grid', gridTemplateColumns: '28px 180px 1fr 1fr 1fr 1fr', gap: 0, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <button onClick={() => toggleFav(coin.id)} style={{ background: 'none', border: 'none', color: isFav ? '#FFB300' : '#333', cursor: 'pointer', fontSize: 12 }}>★</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={coin.image} alt={coin.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#ddd' }}>{coin.name}</div>
                  <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase' }}>{coin.symbol} #{coin.market_cap_rank}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: 12, color: '#fff', fontWeight: 'bold' }}>{fmtPrice(coin.current_price)}</div>

              <div style={{ textAlign: 'right', fontSize: 12, color: changeColor, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
              </div>

              <div style={{ textAlign: 'right', fontSize: 11, color: '#888' }}>{fmtMcap(coin.market_cap)}</div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#666' }}>{fmtMcap(coin.total_volume)}</div>
            </div>
          );
        })}
      </div>

      {/* Ticker Bar */}
      {coins.length > 0 && (
        <div style={{ padding: '6px 14px', borderTop: '1px solid #12141e', background: '#050709', display: 'flex', gap: 16, overflow: 'hidden' }}>
          {coins.slice(0, 6).map(c => (
            <span key={c.id} style={{ fontSize: 10, color: c.price_change_percentage_24h >= 0 ? '#00FF88' : '#FF4444', whiteSpace: 'nowrap' }}>
              {c.symbol.toUpperCase()} {fmtPrice(c.current_price)} {c.price_change_percentage_24h >= 0 ? '▲' : '▼'}{Math.abs(c.price_change_percentage_24h).toFixed(1)}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
export default CryptoWindow;

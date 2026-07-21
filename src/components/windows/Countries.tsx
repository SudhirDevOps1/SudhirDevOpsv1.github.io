import React, { memo, useState, useEffect, useCallback } from 'react';
import { Search, Globe, Flag, RefreshCw, ChevronRight, Award } from 'lucide-react';

interface Country {
  name: { common: string; official: string };
  flags: { png: string; svg: string; alt: string };
  population: number;
  region: string;
  subregion: string;
  capital: string[];
  languages: Record<string, string>;
  currencies: Record<string, { name: string; symbol: string }>;
  area: number;
  cca2: string;
  borders: string[];
}

export const CountriesWindow = memo(() => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [selected, setSelected] = useState<Country | null>(null);
  const [tab, setTab] = useState<'explore' | 'quiz'>('explore');
  
  // Quiz state
  const [quizCountry, setQuizCountry] = useState<Country | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');

  const FALLBACK_COUNTRIES: Country[] = [
    { name: { common: 'India', official: 'Republic of India' }, flags: { png: 'https://flagcdn.com/w320/in.png', svg: 'https://flagcdn.com/in.svg', alt: 'Flag of India' }, population: 1408044253, region: 'Asia', subregion: 'Southern Asia', capital: ['New Delhi'], languages: { hin: 'Hindi', eng: 'English' }, currencies: { INR: { name: 'Indian Rupee', symbol: '₹' } }, area: 3287263, cca2: 'IN', borders: ['PAK', 'CHN', 'NPL'] },
    { name: { common: 'United States', official: 'United States of America' }, flags: { png: 'https://flagcdn.com/w320/us.png', svg: 'https://flagcdn.com/us.svg', alt: 'Flag of US' }, population: 331893745, region: 'Americas', subregion: 'North America', capital: ['Washington, D.C.'], languages: { eng: 'English' }, currencies: { USD: { name: 'United States Dollar', symbol: '$' } }, area: 9372610, cca2: 'US', borders: ['CAN', 'MEX'] },
    { name: { common: 'Japan', official: 'Japan' }, flags: { png: 'https://flagcdn.com/w320/jp.png', svg: 'https://flagcdn.com/jp.svg', alt: 'Flag of Japan' }, population: 125584838, region: 'Asia', subregion: 'Eastern Asia', capital: ['Tokyo'], languages: { jpn: 'Japanese' }, currencies: { JPY: { name: 'Japanese Yen', symbol: '¥' } }, area: 377975, cca2: 'JP', borders: [] },
    { name: { common: 'Germany', official: 'Federal Republic of Germany' }, flags: { png: 'https://flagcdn.com/w320/de.png', svg: 'https://flagcdn.com/de.svg', alt: 'Flag of Germany' }, population: 83240525, region: 'Europe', subregion: 'Western Europe', capital: ['Berlin'], languages: { deu: 'German' }, currencies: { EUR: { name: 'Euro', symbol: '€' } }, area: 357114, cca2: 'DE', borders: ['FRA', 'POL'] },
    { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' }, flags: { png: 'https://flagcdn.com/w320/gb.png', svg: 'https://flagcdn.com/gb.svg', alt: 'Flag of UK' }, population: 67326569, region: 'Europe', subregion: 'Northern Europe', capital: ['London'], languages: { eng: 'English' }, currencies: { GBP: { name: 'British Pound', symbol: '£' } }, area: 242900, cca2: 'GB', borders: ['IRL'] },
    { name: { common: 'France', official: 'French Republic' }, flags: { png: 'https://flagcdn.com/w320/fr.png', svg: 'https://flagcdn.com/fr.svg', alt: 'Flag of France' }, population: 67391582, region: 'Europe', subregion: 'Western Europe', capital: ['Paris'], languages: { fra: 'French' }, currencies: { EUR: { name: 'Euro', symbol: '€' } }, area: 551695, cca2: 'FR', borders: ['DEU', 'ESP'] },
    { name: { common: 'Brazil', official: 'Federative Republic of Brazil' }, flags: { png: 'https://flagcdn.com/w320/br.png', svg: 'https://flagcdn.com/br.svg', alt: 'Flag of Brazil' }, population: 212559417, region: 'Americas', subregion: 'South America', capital: ['Brasília'], languages: { por: 'Portuguese' }, currencies: { BRL: { name: 'Brazilian Real', symbol: 'R$' } }, area: 8515767, cca2: 'BR', borders: ['ARG', 'COL'] },
    { name: { common: 'Australia', official: 'Commonwealth of Australia' }, flags: { png: 'https://flagcdn.com/w320/au.png', svg: 'https://flagcdn.com/au.svg', alt: 'Flag of Australia' }, population: 25687041, region: 'Oceania', subregion: 'Australia and New Zealand', capital: ['Canberra'], languages: { eng: 'English' }, currencies: { AUD: { name: 'Australian Dollar', symbol: '$' } }, area: 7692024, cca2: 'AU', borders: [] },
  ];

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,region,subregion,capital,languages,currencies,area,cca2,borders');
      if (!res.ok) throw new Error('REST Countries API error');
      const data: Country[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid data');
      const sorted = data.sort((a, b) => b.population - a.population);
      setCountries(sorted);
      setSelected(sorted[0] || null);
    } catch {
      // Fallback via CORS proxy if REST countries endpoint fails or CORS blocks
      try {
        const proxyRes = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://restcountries.com/v3.1/all?fields=name,flags,population,region,subregion,capital,languages,currencies,area,cca2,borders'));
        const proxyData: Country[] = await proxyRes.json();
        if (Array.isArray(proxyData) && proxyData.length > 0) {
          const sorted = proxyData.sort((a, b) => b.population - a.population);
          setCountries(sorted);
          setSelected(sorted[0] || null);
        } else {
          setCountries(FALLBACK_COUNTRIES);
          setSelected(FALLBACK_COUNTRIES[0]);
        }
      } catch {
        setCountries(FALLBACK_COUNTRIES);
        setSelected(FALLBACK_COUNTRIES[0]);
      }
    }
    setLoading(false);
  }, []);


  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  const regions = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  const filtered = countries.filter(c => {
    const matchSearch = c.name.common.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === 'All' || c.region === region;
    return matchSearch && matchRegion;
  });

  const startQuiz = useCallback(() => {
    if (countries.length < 4) return;
    const pool = countries.filter(c => c.flags.png);
    const rand = pool[Math.floor(Math.random() * pool.length)];
    const wrong = pool.filter(c => c.cca2 !== rand.cca2).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrong.map(c => c.name.common), rand.name.common].sort(() => Math.random() - 0.5);
    setQuizCountry(rand);
    setQuizOptions(options);
    setQuizAnswer('');
    setQuizFeedback('');
  }, [countries]);

  const handleQuizAnswer = (answer: string) => {
    if (!quizCountry || quizAnswer) return;
    setQuizAnswer(answer);
    setQuizTotal(t => t + 1);
    const correct = answer === quizCountry.name.common;
    if (correct) { setQuizScore(s => s + 1); setQuizFeedback('✅ Correct!'); }
    else { setQuizFeedback(`❌ Wrong! It was ${quizCountry.name.common}`); }
    setTimeout(() => startQuiz(), 2000);
  };

  const fmtPop = (n: number) => n > 1e9 ? `${(n / 1e9).toFixed(2)}B` : n > 1e6 ? `${(n / 1e6).toFixed(2)}M` : n > 1e3 ? `${(n / 1e3).toFixed(0)}K` : n.toString();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07080d', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* Header with Tabs */}
      <div style={{ borderBottom: '1px solid #12141e', background: '#0b0d18', display: 'flex' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={15} color="var(--accent)" />
          <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: 13 }}>WORLD EXPLORER</span>
          <span style={{ fontSize: 9, color: '#444', background: '#111', padding: '2px 6px', borderRadius: 4 }}>REST Countries API</span>
        </div>
        <div style={{ flex: 1 }} />
        {[{ id: 'explore' as const, label: '🌐 Explore' }, { id: 'quiz' as const, label: '🏆 Flag Quiz' }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'quiz' && countries.length > 0) startQuiz(); }}
            style={{ padding: '10px 16px', border: 'none', borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent', background: tab === t.id ? 'rgba(var(--accent-rgb),0.08)' : 'transparent', color: tab === t.id ? 'var(--accent)' : '#666', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {t.label}
          </button>
        ))}
        <button onClick={fetchCountries} style={{ padding: '8px 12px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Explore Tab */}
      {tab === 'explore' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: List */}
          <div style={{ width: 260, borderRight: '1px solid #12141e', display: 'flex', flexDirection: 'column' }}>
            {/* Search + Region Filter */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #0f111a', background: '#080a13' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f111a', border: '1px solid #1a1c28', borderRadius: 6, padding: '4px 10px', marginBottom: 8 }}>
                <Search size={12} color="#555" style={{ marginRight: 6 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search country..."
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: 11, fontFamily: 'var(--font-mono)', flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {regions.map(r => (
                  <button key={r} onClick={() => setRegion(r)}
                    style={{ padding: '2px 7px', border: `1px solid ${region === r ? 'var(--accent)' : '#1a1c28'}`, background: region === r ? 'rgba(var(--accent-rgb),0.15)' : 'transparent', color: region === r ? 'var(--accent)' : '#666', borderRadius: 10, cursor: 'pointer', fontSize: 9 }}>
                    {r}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 9, color: '#333' }}>{filtered.length} countries</div>
            </div>

            {/* Country List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading && <div style={{ padding: 20, textAlign: 'center', color: 'var(--accent)', fontSize: 11 }}>🌍 Loading countries...</div>}
              {filtered.map(c => (
                <div key={c.cca2} onClick={() => setSelected(c)}
                  style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: selected?.cca2 === c.cca2 ? 'rgba(var(--accent-rgb),0.12)' : 'transparent', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (selected?.cca2 !== c.cca2) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (selected?.cca2 !== c.cca2) e.currentTarget.style.background = 'transparent'; }}
                >
                  <img src={c.flags.png} alt={c.flags.alt || c.name.common} style={{ width: 32, height: 20, objectFit: 'cover', borderRadius: 2, border: '1px solid #222' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: selected?.cca2 === c.cca2 ? 'var(--accent)' : '#ddd', fontWeight: selected?.cca2 === c.cca2 ? 'bold' : 'normal' }}>{c.name.common}</div>
                    <div style={{ fontSize: 9, color: '#555' }}>{c.region} · {fmtPop(c.population)}</div>
                  </div>
                  <ChevronRight size={12} color="#333" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detail */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {selected ? (
              <>
                <img src={selected.flags.png} alt={selected.name.common}
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, marginBottom: 16, border: '1px solid #1a1c28' }} />
                <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 4 }}>{selected.name.common}</div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>{selected.name.official}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: '🏙️ Capital', value: selected.capital?.join(', ') || 'N/A' },
                    { label: '🌍 Region', value: `${selected.region}${selected.subregion ? ` · ${selected.subregion}` : ''}` },
                    { label: '👥 Population', value: fmtPop(selected.population) },
                    { label: '📐 Area', value: `${selected.area?.toLocaleString() || 'N/A'} km²` },
                    { label: '🗣️ Language(s)', value: Object.values(selected.languages || {}).slice(0, 2).join(', ') || 'N/A' },
                    { label: '💰 Currency', value: Object.values(selected.currencies || {}).map(c => `${c.name} (${c.symbol})`).slice(0, 1).join(', ') || 'N/A' },
                  ].map(stat => (
                    <div key={stat.label} style={{ padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{stat.label}</div>
                      <div style={{ fontSize: 12, color: '#ccc' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 60, color: '#444' }}>
                <Globe size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                <div>Select a country to see details</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flag Quiz Tab */}
      {tab === 'quiz' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={16} color="var(--accent)" />
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Score: {quizScore}/{quizTotal}</span>
            <span style={{ color: '#555', fontSize: 10 }}>({quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0}%)</span>
          </div>

          {quizCountry ? (
            <>
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 10, letterSpacing: 2 }}>WHICH COUNTRY IS THIS FLAG?</div>
                <img src={quizCountry.flags.png} alt="Quiz flag"
                  style={{ width: 280, height: 160, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(var(--accent-rgb),0.3)', boxShadow: '0 0 30px rgba(var(--accent-rgb),0.2)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 400 }}>
                {quizOptions.map(opt => {
                  const isCorrect = opt === quizCountry.name.common;
                  const isAnswered = quizAnswer !== '';
                  const isChosen = opt === quizAnswer;
                  let bg = '#111', border = '#222', color = '#ddd';
                  if (isAnswered && isCorrect) { bg = '#00FF8822'; border = '#00FF88'; color = '#00FF88'; }
                  else if (isAnswered && isChosen && !isCorrect) { bg = '#FF444422'; border = '#FF4444'; color = '#FF4444'; }
                  return (
                    <button key={opt} onClick={() => handleQuizAnswer(opt)} disabled={isAnswered}
                      style={{ padding: '12px 14px', border: `1px solid ${border}`, background: bg, color, borderRadius: 8, cursor: isAnswered ? 'default' : 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', transition: 'all 0.2s', textAlign: 'left' }}>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div style={{ marginTop: 16, fontSize: 14, fontWeight: 'bold', color: quizFeedback.startsWith('✅') ? '#00FF88' : '#FF4444' }}>
                  {quizFeedback}
                </div>
              )}
            </>
          ) : (
            <div>
              <button onClick={startQuiz}
                style={{ padding: '12px 24px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.2)', color: 'var(--accent)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                🏳️ Start Flag Quiz
              </button>
              {loading && <div style={{ marginTop: 12, color: '#666', fontSize: 11, textAlign: 'center' }}>Loading countries for quiz...</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
export default CountriesWindow;

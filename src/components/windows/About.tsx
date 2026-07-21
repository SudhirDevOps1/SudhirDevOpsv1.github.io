import React, { memo, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';

interface GitHubProfileData {
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  location: string;
}

export const AboutWindow = memo(() => {
  const { addToast } = useOS();
  const [profile, setProfile] = useState<GitHubProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.github.com/users/SudhirDevOps1')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
        addToast('Live GitHub Profile Loaded for SudhirDevOps1', 'success');
      })
      .catch(err => {
        console.error('Failed to fetch profile', err);
        setLoading(false);
      });
  }, [addToast]);

  const avatar = profile?.avatar_url || 'https://avatars.githubusercontent.com/u/234449571?v=4';
  const name = profile?.name || 'Sudhir Singh';
  const bio = profile?.bio || '👨‍💻 BCA Student | Aspiring Full-Stack Developer\n💡 Passionate about coding, problem-solving & AI\n🌱 Learning Python, JavaScript & Ethical Hacking\n📍 Bihar, India';
  const reposCount = profile?.public_repos || 87;
  const followersCount = profile?.followers || 10;
  const followingCount = profile?.following || 13;

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <img
          src={avatar}
          alt="Sudhir Singh Profile"
          style={{
            width: 100, height: 100, borderRadius: 14,
            border: '2px solid var(--accent)',
            boxShadow: '0 0 24px rgba(var(--accent-rgb),0.4)',
            objectFit: 'cover',
          }}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent)', marginBottom: 6 }}>
            {name} <span style={{ fontSize: 12, color: '#666' }}>({profile?.login || 'SudhirDevOps1'})</span>
          </div>
          <div style={{ color: '#aaa', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: '#666' }}>Role:     </span>
            <span style={{ color: '#fff' }}>BCA Student & Full Stack Developer</span>
          </div>
          <div style={{ color: '#aaa', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: '#666' }}>Location: </span>
            <span style={{ color: '#fff' }}>Bihar, India 🇮🇳</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ color: '#666' }}>Status:   </span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} className="status-dot" />
            <span style={{ color: 'var(--accent)', fontSize: 12 }}>Open to Full-Stack & DevOps Roles</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── BIO</div>
        <pre style={{ color: '#ccc', lineHeight: 1.8, fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>{bio}</pre>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>
          ─── LIVE GITHUB METRICS ({loading ? 'FETCHING...' : 'LIVE FROM GITHUB API'})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Public Repos', value: reposCount },
            { label: 'Followers', value: followersCount },
            { label: 'Following', value: followingCount },
            { label: 'Status', value: 'Active' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.4)' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ color: '#666', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href={profile?.html_url || 'https://github.com/SudhirDevOps1'} target="_blank" rel="noreferrer"
          style={{
            padding: '10px 18px', border: '1px solid var(--accent)', borderRadius: 6,
            color: 'var(--accent)', textDecoration: 'none', fontSize: 12,
            fontFamily: 'var(--font-mono)', background: 'rgba(var(--accent-rgb),0.15)',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold'
          }}
        >
          🐙 Visit GitHub Profile (SudhirDevOps1)
        </a>

        <a href="/resume/resume.pdf" target="_blank" rel="noreferrer"
          style={{
            padding: '10px 18px', border: '1px solid #444', borderRadius: 6,
            color: '#fff', textDecoration: 'none', fontSize: 12,
            fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          📄 View Resume (/resume/resume.pdf)
        </a>
      </div>
    </div>
  );
});
export default AboutWindow;

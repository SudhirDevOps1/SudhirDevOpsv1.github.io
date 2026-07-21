import React, { memo } from 'react';
import { useOS } from '../../context/OSContext';

export const AboutWindow = memo(() => {
  const { jsonData } = useOS();
  const aboutData = jsonData.about;
  
  const name = aboutData?.personal?.name ?? 'Sudhi';
  const initials = aboutData?.personal?.initials ?? 'S';
  const role = aboutData?.personal?.role ?? 'Full Stack Developer';
  const location = aboutData?.personal?.location ?? 'India';
  const status = aboutData?.personal?.status ?? 'Available for Work';
  const bio = aboutData?.bio?.long ?? 'Passionate developer crafting high-performance digital experiences. Specializing in full-stack development, system design, and UI/UX engineering.';
  
  const stats = aboutData?.stats ?? { projects: '20+', experience: '3+ Years', coffee: '∞', commits: '2000+' };
  const social = aboutData?.social ?? { github: { url: 'https://github.com/sudhi' }, linkedin: { url: 'https://linkedin.com/in/sudhi' } };
  const resumeUrl = aboutData?.resume?.url ?? '#';
  const email = aboutData?.personal?.email ?? 'sudhi@portfolio.os';

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 100, height: 100, borderRadius: 8,
            border: '2px solid var(--accent)', background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(var(--accent-rgb),0.3)',
            fontFamily: 'var(--font-title)', fontSize: 36, color: 'var(--accent)', flexShrink: 0,
          }}>{initials}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent)', marginBottom: 8 }}>{name}</div>
          <div style={{ color: '#aaa', marginBottom: 4 }}>
            <span style={{ color: '#666' }}>Role:     </span>
            <span style={{ color: '#fff' }}>{role}</span>
          </div>
          <div style={{ color: '#aaa', marginBottom: 4 }}>
            <span style={{ color: '#666' }}>Location: </span>
            <span style={{ color: '#fff' }}>{location} 🇮🇳</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#666' }}>Status:   </span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} className="status-dot" />
            <span style={{ color: 'var(--accent)' }}>{status}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── BIO</div>
        <p style={{ color: '#ccc', lineHeight: 1.8, fontSize: 13 }}>{bio}</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── QUICK STATS</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Projects', value: stats.projects },
            { label: 'Experience', value: stats.experience },
            { label: 'Coffee', value: stats.coffee },
            { label: 'Commits', value: stats.commits },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ color: '#666', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: '🐙 GitHub', href: social.github?.url ?? '#' },
          { label: '💼 LinkedIn', href: social.linkedin?.url ?? '#' },
          { label: '📄 Download CV', href: resumeUrl },
          { label: '✉ Email Me', href: `mailto:${email}` },
        ].map(btn => (
          <a key={btn.label} href={btn.href} target="_blank" rel="noreferrer"
            style={{
              padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: 4,
              color: 'var(--accent)', textDecoration: 'none', fontSize: 12,
              fontFamily: 'var(--font-mono)', transition: 'all 0.2s', cursor: 'pointer', background: 'transparent',
            }}
          >
            {btn.label}
          </a>
        ))}
      </div>
    </div>
  );
});
export default AboutWindow;

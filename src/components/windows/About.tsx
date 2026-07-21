import React, { memo } from 'react';
import { useOS } from '../../context/OSContext';

export const AboutWindow = memo(() => {
  const { jsonData } = useOS();
  const aboutData = jsonData.about;
  
  const name = 'Sudhir Singh';
  const role = 'BCA Student & Full Stack Developer';
  const location = 'Bihar, India 🇮🇳';
  const status = 'Available for Full-Stack & DevOps Roles';
  const bio = '👨‍💻 BCA Student | Aspiring Full-Stack Developer\n💡 Passionate about coding, problem-solving & AI\n🌱 Learning Python, JavaScript, React & Ethical Hacking\n📍 Bihar, India';
  
  const stats = { projects: '87+', experience: 'BCA Student', coffee: '∞', followers: '10' };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <img
          src="https://avatars.githubusercontent.com/u/234449571?v=4"
          alt="Sudhir Singh"
          style={{
            width: 100, height: 100, borderRadius: 12,
            border: '2px solid var(--accent)',
            boxShadow: '0 0 20px rgba(var(--accent-rgb),0.4)',
            objectFit: 'cover',
          }}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent)', marginBottom: 6 }}>{name}</div>
          <div style={{ color: '#aaa', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: '#666' }}>Role:     </span>
            <span style={{ color: '#fff' }}>{role}</span>
          </div>
          <div style={{ color: '#aaa', marginBottom: 4, fontSize: 13 }}>
            <span style={{ color: '#666' }}>Location: </span>
            <span style={{ color: '#fff' }}>{location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ color: '#666' }}>Status:   </span>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} className="status-dot" />
            <span style={{ color: 'var(--accent)', fontSize: 12 }}>{status}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── BIO</div>
        <pre style={{ color: '#ccc', lineHeight: 1.8, fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>{bio}</pre>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ color: 'var(--accent)', borderBottom: '1px solid var(--accent)', paddingBottom: 4, marginBottom: 10, fontSize: 12, letterSpacing: 2 }}>─── GITHUB STATS (SUDHIRDEVOPS1)</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Public Repos', value: stats.projects },
            { label: 'Education', value: stats.experience },
            { label: 'Followers', value: stats.followers },
            { label: 'Coffee', value: stats.coffee },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', flex: 1, border: '1px solid rgba(255,255,255,0.06)', padding: 10, borderRadius: 6, background: 'rgba(0,0,0,0.4)' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ color: '#666', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href="https://github.com/SudhirDevOps1" target="_blank" rel="noreferrer"
          style={{
            padding: '8px 16px', border: '1px solid var(--accent)', borderRadius: 6,
            color: 'var(--accent)', textDecoration: 'none', fontSize: 12,
            fontFamily: 'var(--font-mono)', background: 'rgba(var(--accent-rgb),0.15)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          🐙 GitHub Profile (SudhirDevOps1)
        </a>

        <a href="/resume/resume.pdf" target="_blank" rel="noreferrer"
          style={{
            padding: '8px 16px', border: '1px solid #444', borderRadius: 6,
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

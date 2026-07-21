import React, { memo, useState, useEffect, useMemo } from 'react';
import { useOS } from '../../context/OSContext';
import { SKILLS } from '../../data';

export const SkillsWindow = memo(() => {
  const { jsonData } = useOS();
  const [phase, setPhase] = useState<'booting' | 'ready'>('booting');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [visibleSkills, setVisibleSkills] = useState(0);
  
  const skillsData = useMemo(() => {
    if (jsonData.about?.skills) {
      const aboutSkills = jsonData.about.skills;
      return {
        'LANGUAGES': aboutSkills.languages.map(s => ({ name: s.name, pct: s.level })),
        'FRAMEWORKS': aboutSkills.frameworks.map(s => ({ name: s.name, pct: s.level })),
        'TOOLS & DEVOPS': aboutSkills.tools.map(s => ({ name: s.name, pct: s.level })),
        'DATABASES': aboutSkills.databases.map(s => ({ name: s.name, pct: s.level })),
      };
    }
    return SKILLS;
  }, [jsonData.about]);
  
  const allSkills = useMemo(() => Object.entries(skillsData).flatMap(([cat, skills]) =>
    [{ cat, name: '', pct: -1 }, ...skills.map(s => ({ cat: '', name: s.name, pct: s.pct }))]
  ), [skillsData]);

  useEffect(() => {
    const msgs = ['$ ./load_skills.sh', '> Scanning skill database...', '> Loading skills...', '> [████████████████████] 100%', '> Skills loaded. Displaying...'];
    let i = 0;
    const t = setInterval(() => {
      if (i < msgs.length) { setBootLines(prev => [...prev, msgs[i]]); i++; }
      else { clearInterval(t); setTimeout(() => setPhase('ready'), 300); }
    }, 350);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== 'ready') return;
    let i = 0;
    const t = setInterval(() => {
      if (i < allSkills.length) { setVisibleSkills(v => v + 1); i++; }
      else clearInterval(t);
    }, 80);
    return () => clearInterval(t);
  }, [phase, allSkills.length]);

  if (phase === 'booting') return (
    <div style={{ padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {bootLines.map((l, i) => <div key={i} style={{ color: 'var(--accent)', marginBottom: 4 }}>{l}</div>)}
    </div>
  );

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
      {Object.entries(skillsData).map(([cat, skills]) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ color: 'var(--accent)', marginBottom: 8, borderBottom: '1px solid rgba(var(--accent-rgb),0.3)', paddingBottom: 4, fontSize: 12, letterSpacing: 2 }}>
            ─── {cat} ─────────────────────────────────
          </div>
          {skills.map((skill, si) => {
            const globalIdx = Object.keys(skillsData).indexOf(cat) * 10 + si;
            const visible = visibleSkills > globalIdx;
            return (
              <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>
                <span style={{ color: '#fff', minWidth: 120 }}>{skill.name}</span>
                <div style={{ flex: 1, background: '#111', height: 16, borderRadius: 2, overflow: 'hidden', border: '1px solid #222' }}>
                  <div style={{
                    width: visible ? `${skill.pct}%` : '0%',
                    height: '100%', background: 'var(--accent)',
                    transition: 'width 1s ease-out',
                    display: 'flex', alignItems: 'center', paddingLeft: 4,
                  }} />
                </div>
                <span style={{ color: 'var(--accent)', minWidth: 40, textAlign: 'right' }}>{skill.pct}%</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});
export default SkillsWindow;

import React, { memo, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOS } from '../../context/OSContext';
import { PROJECTS } from '../../data';

interface ProjectDisplay {
  id: number;
  name: string;
  icon?: string;
  desc: string;
  stack: string[];
  live: string;
  repo: string;
  category?: string;
  featured?: boolean;
}

export const ProjectsWindow = memo(() => {
  const { jsonData } = useOS();
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<ProjectDisplay | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const projects: ProjectDisplay[] = useMemo(() => {
    if (jsonData.projects.length > 0) {
      return jsonData.projects.map(p => ({
        id: p.id,
        name: p.name,
        icon: '📁',
        desc: p.description,
        stack: p.techStack,
        live: p.liveUrl,
        repo: p.repoUrl,
        category: p.category,
        featured: p.featured
      }));
    }
    return PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      desc: p.desc,
      stack: p.stack,
      live: p.live,
      repo: p.repo
    }));
  }, [jsonData.projects]);

  const handleClick = (id: number) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setDetail(projects.find(p => p.id === id) || null);
    } else {
      setSelected(id);
      clickTimer.current = setTimeout(() => { clickTimer.current = null; }, 300);
    }
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 12, color: '#666' }}>
        Double-click to open project details • {projects.length} projects loaded
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {projects.map(p => (
          <div
            key={p.id}
            className="project-folder"
            onClick={() => handleClick(p.id)}
            style={{
              padding: 16, border: `1px solid ${selected === p.id ? 'var(--accent)' : '#222'}`,
              borderRadius: 6, cursor: 'pointer', textAlign: 'center',
              background: selected === p.id ? 'rgba(var(--accent-rgb),0.08)' : 'transparent',
              transition: 'all 0.2s', position: 'relative',
            }}
          >
            {p.featured && (
              <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 10, color: 'var(--accent)' }}>⭐</div>
            )}
            <div className="folder-icon" style={{ fontSize: 36, marginBottom: 8 }}>{p.icon || '📁'}</div>
            <div style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.4 }}>{p.name}</div>
            {p.category && <div style={{ color: '#555', fontSize: 9, marginTop: 4 }}>{p.category}</div>}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#050505', border: '1px solid var(--accent)',
                borderRadius: 8, width: 520, maxWidth: '90vw',
                boxShadow: '0 0 40px rgba(var(--accent-rgb),0.3)', overflow: 'hidden',
              }}
            >
              <div style={{ background: '#0a0a0a', padding: '12px 16px', borderBottom: '1px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', fontSize: 13, letterSpacing: 2 }}>{detail.name}</span>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ padding: 20, fontFamily: 'var(--font-mono)' }}>
                <div style={{
                  height: 100, background: `linear-gradient(135deg, #0a0a0a, rgba(var(--accent-rgb),0.1))`,
                  border: '1px solid rgba(var(--accent-rgb),0.2)', borderRadius: 4, marginBottom: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
                }}>
                  {detail.icon || '📁'}
                </div>
                <p style={{ color: '#ccc', marginBottom: 16, lineHeight: 1.7, fontSize: 13 }}>{detail.desc}</p>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: 'var(--accent)', fontSize: 11, marginBottom: 8, letterSpacing: 2 }}>TECH STACK</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {detail.stack.map(s => (
                      <span key={s} style={{ padding: '3px 8px', border: '1px solid var(--accent)', borderRadius: 12, color: 'var(--accent)', fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={detail.live} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: 4, color: 'var(--accent)', textDecoration: 'none', fontSize: 12 }}>🌐 Live Demo</a>
                  <a href={detail.repo} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', border: '1px solid #444', borderRadius: 4, color: '#aaa', textDecoration: 'none', fontSize: 12 }}>{'</>'} Source Code</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
export default ProjectsWindow;

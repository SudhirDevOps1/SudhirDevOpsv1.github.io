import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Star, GitFork, RefreshCw } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { PROJECTS } from '../../data';

interface ProjectDisplay {
  id: number | string;
  name: string;
  icon?: string;
  desc: string;
  stack: string[];
  live: string;
  repo: string;
  stars?: number;
  forks?: number;
  language?: string;
  updatedAt?: string;
  isGitHub?: boolean;
}

export const ProjectsWindow = memo(() => {
  const { jsonData, addToast } = useOS();
  const [selected, setSelected] = useState<number | string | null>(null);
  const [detail, setDetail] = useState<ProjectDisplay | null>(null);
  const [githubRepos, setGithubRepos] = useState<ProjectDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'github' | 'featured'>('all');
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Fetch real GitHub repos for SudhirDevOps1
  const fetchGitHubRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.github.com/users/SudhirDevOps1/repos?sort=updated&per_page=100');
      if (!res.ok) throw new Error('Failed to fetch repos');
      const data = await res.json();
      
      const mapped: ProjectDisplay[] = data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        icon: repo.fork ? '🍴' : '⚡',
        desc: repo.description || 'Public GitHub repository by SudhirDevOps1',
        stack: repo.topics && repo.topics.length > 0 ? repo.topics : [repo.language || 'Code'],
        live: repo.homepage || repo.html_url,
        repo: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Developer',
        updatedAt: new Date(repo.updated_at).toLocaleDateString(),
        isGitHub: true
      }));

      setGithubRepos(mapped);
      addToast(`Fetched ${mapped.length} repos live from GitHub!`, 'success');
    } catch (err) {
      console.error('GitHub API error:', err);
      addToast('GitHub API rate limited, using cached projects', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubRepos();
  }, []);

  const allProjects: ProjectDisplay[] = useMemo(() => {
    if (githubRepos.length > 0) {
      return githubRepos;
    }
    if (jsonData.projects.length > 0) {
      return jsonData.projects.map(p => ({
        id: p.id,
        name: p.name,
        icon: '📁',
        desc: p.description,
        stack: p.techStack,
        live: p.liveUrl,
        repo: p.repoUrl,
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
  }, [githubRepos, jsonData.projects]);

  const filteredProjects = useMemo(() => {
    if (activeTab === 'github') return allProjects.filter(p => p.isGitHub);
    if (activeTab === 'featured') return allProjects.filter(p => (p.stars || 0) > 0 || !p.isGitHub);
    return allProjects;
  }, [allProjects, activeTab]);

  const handleClick = (id: number | string) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setDetail(allProjects.find(p => p.id === id) || null);
    } else {
      setSelected(id);
      clickTimer.current = setTimeout(() => { clickTimer.current = null; }, 300);
    }
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-mono)' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
        <div>
          <div style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 'bold' }}>
            🐙 SUDHIRDEVOPS1 REPOSITORIES ({filteredProjects.length})
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
            Double-click project card to view full details
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#0a0a0a', border: '1px solid #222', borderRadius: 4, padding: 2 }}>
            {(['all', 'github', 'featured'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '4px 10px', border: 'none', background: activeTab === tab ? 'rgba(var(--accent-rgb),0.2)' : 'transparent',
                  color: activeTab === tab ? 'var(--accent)' : '#888', borderRadius: 3, cursor: 'pointer', fontSize: 11, textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={fetchGitHubRepos}
            disabled={loading}
            title="Refresh from GitHub API"
            style={{ padding: '6px 10px', border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} /> {loading ? 'Fetching...' : 'Sync GitHub'}
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {filteredProjects.map(p => (
          <div
            key={p.id}
            onClick={() => handleClick(p.id)}
            style={{
              padding: 14, border: `1px solid ${selected === p.id ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, cursor: 'pointer',
              background: selected === p.id ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(15, 17, 24, 0.6)',
              transition: 'all 0.15s', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{p.icon || '📁'}</span>
                {p.stars !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#FFB300' }}>
                    <Star size={11} /> {p.stars}
                  </div>
                )}
              </div>
              <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 'bold', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name}
              </div>
              <div style={{ color: '#aaa', fontSize: 11, lineHeight: 1.4, height: 32, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {p.desc}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.stack.slice(0, 3).map(s => (
                <span key={s} style={{ fontSize: 9, padding: '2px 6px', border: '1px solid rgba(var(--accent-rgb),0.3)', borderRadius: 10, color: 'var(--accent)' }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0a0d14', border: '1px solid var(--accent)',
                borderRadius: 12, width: 520, maxWidth: '90vw',
                boxShadow: '0 0 40px rgba(var(--accent-rgb),0.3)', overflow: 'hidden',
              }}
            >
              <div style={{ background: '#101420', padding: '14px 18px', borderBottom: '1px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 'bold' }}>{detail.name}</span>
                <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>

              <div style={{ padding: 20 }}>
                <p style={{ color: '#ccc', marginBottom: 16, lineHeight: 1.6, fontSize: 13 }}>{detail.desc}</p>

                {detail.isGitHub && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: '#aaa' }}>
                    <span>⭐ Stars: {detail.stars}</span>
                    <span>🍴 Forks: {detail.forks}</span>
                    <span>🌐 Language: {detail.language}</span>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: 'var(--accent)', fontSize: 11, marginBottom: 8, letterSpacing: 1 }}>TECH & TOPICS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {detail.stack.map(s => (
                      <span key={s} style={{ padding: '3px 8px', border: '1px solid var(--accent)', borderRadius: 12, color: 'var(--accent)', fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={detail.repo} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', border: '1px solid var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', borderRadius: 6, color: 'var(--accent)', textDecoration: 'none', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Github size={14} /> Open Repository
                  </a>
                  {detail.live && detail.live !== detail.repo && (
                    <a href={detail.live} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', border: '1px solid #444', borderRadius: 6, color: '#fff', textDecoration: 'none', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
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

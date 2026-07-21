import React, { memo, useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Activity, Database, Server, RefreshCw, Zap, CheckCircle2, Lock, HardDrive, Wifi } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'EXEC';
  msg: string;
}

export const DevOpsMonitorWindow = memo(() => {
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memory: 42,
    disk: 28,
    networkIn: '1.4 MB/s',
    networkOut: '850 KB/s',
    uptime: 99.98,
    containers: 8,
    k8sNodes: 3,
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: new Date().toLocaleTimeString(), type: 'SUCCESS', msg: 'Docker Swarm & Kubernetes cluster initialized (3 Nodes Active)' },
    { id: '2', time: new Date().toLocaleTimeString(), type: 'INFO', msg: 'GitHub Actions CI/CD Pipeline #482 triggered for SudhirDevOps1/portfolio' },
    { id: '3', time: new Date().toLocaleTimeString(), type: 'EXEC', msg: 'Nginx Reverse Proxy routing traffic to http://127.0.0.1:3000' },
    { id: '4', time: new Date().toLocaleTimeString(), type: 'SUCCESS', msg: 'SSL Certificate (Let\'s Encrypt) auto-renewed for sudhirdevopsv1.github.io' },
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'containers' | 'pipelines' | 'terminal'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Metric Jitter Simulation
  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.min(95, Math.max(8, prev.cpu + Math.floor((Math.random() - 0.5) * 12))),
        memory: Math.min(85, Math.max(30, prev.memory + Math.floor((Math.random() - 0.5) * 4))),
        networkIn: `${(Math.random() * 2 + 0.8).toFixed(1)} MB/s`,
        networkOut: `${(Math.random() * 900 + 400).toFixed(0)} KB/s`,
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const addManualLog = (msg: string) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      type: 'EXEC',
      msg,
    };
    setLogs(prev => [entry, ...prev.slice(0, 15)]);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#07090e', fontFamily: 'var(--font-mono)', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', background: '#0b0e17', borderBottom: '1px solid #141926', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ padding: 6, borderRadius: 6, background: 'rgba(0,255,136,0.15)', border: '1px solid #00FF88' }}>
          <Server size={18} color="#00FF88" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#00FF88', display: 'flex', alignItems: 'center', gap: 8 }}>
            DEVOPS CLOUD & CI/CD MONITOR <span style={{ fontSize: 9, background: '#00FF8822', color: '#00FF88', padding: '1px 6px', borderRadius: 4, border: '1px solid #00FF8844' }}>LIVE CLUSTER</span>
          </div>
          <div style={{ fontSize: 9, color: '#555' }}>Infrastructure telemetry for Sudhir Singh's DevOps Environment</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setIsRefreshing(true); addManualLog('Manual healthcheck scan initiated'); setTimeout(() => setIsRefreshing(false), 800); }}
          style={{ padding: '5px 10px', border: '1px solid #1a2030', background: '#0e121f', color: '#aaa', borderRadius: 6, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Scan Cluster
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '6px 12px', background: '#080a12', borderBottom: '1px solid #121624', display: 'flex', gap: 6 }}>
        {[
          { id: 'overview' as const, label: '📊 Telemetry Overview' },
          { id: 'containers' as const, label: '🐳 Docker & K8s Services' },
          { id: 'pipelines' as const, label: '⚡ GitHub Actions CI/CD' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '5px 12px', border: 'none', borderBottom: activeTab === t.id ? '2px solid #00FF88' : '2px solid transparent', background: activeTab === t.id ? 'rgba(0,255,136,0.1)' : 'transparent', color: activeTab === t.id ? '#00FF88' : '#666', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 14, overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div>
            {/* Live Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'CPU LOAD', val: `${metrics.cpu}%`, color: metrics.cpu > 80 ? '#FF4444' : '#00FF88', bar: metrics.cpu },
                { label: 'RAM USAGE', val: `${metrics.memory}%`, color: '#00BFFF', bar: metrics.memory },
                { label: 'NETWORK IN', val: metrics.networkIn, color: '#FFB300', bar: 60 },
                { label: 'CLUSTER UPTIME', val: `${metrics.uptime}%`, color: '#00FF88', bar: 99.9 },
              ].map(m => (
                <div key={m.label} style={{ padding: 10, borderRadius: 8, background: '#0b0e17', border: '1px solid #141926' }}>
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: m.color }}>{m.val}</div>
                  <div style={{ width: '100%', height: 4, background: '#121624', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${m.bar}%`, height: '100%', background: m.color, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Infrastructure Status */}
            <div style={{ padding: 12, borderRadius: 8, background: '#0b0e17', border: '1px solid #141926', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#00FF88', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} /> CLUSTER HEALTH & INFRASTRUCTURE STATUS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { name: 'Nginx Ingress Controller', status: 'Healthy', port: '80/443' },
                  { name: 'Kubernetes Control Plane', status: 'Active (3/3 Nodes)', port: '6443' },
                  { name: 'Docker Container Runtime', status: 'Running (8 Services)', port: 'unix:///var/run/docker.sock' },
                  { name: 'Prometheus & Grafana', status: 'Monitoring Active', port: '9090 / 3000' },
                  { name: 'Redis Cache Cluster', status: 'Connected (0.4ms latency)', port: '6379' },
                  { name: 'PostgreSQL Primary Database', status: 'Replicated (Hot Standby)', port: '5432' },
                ].map(s => (
                  <div key={s.name} style={{ padding: 8, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: 10, fontWeight: 'bold', color: '#ddd' }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: '#00FF88', marginTop: 2 }}>● {s.status}</div>
                    <div style={{ fontSize: 8, color: '#444', marginTop: 2 }}>Port: {s.port}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Terminal Log Stream */}
            <div style={{ padding: 12, borderRadius: 8, background: '#05060a', border: '1px solid #121624' }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', color: '#aaa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Terminal size={13} color="#00FF88" /> REAL-TIME CLUSTER EVENT STREAM
              </div>
              <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {logs.map(log => (
                  <div key={log.id} style={{ fontSize: 10, color: log.type === 'SUCCESS' ? '#00FF88' : log.type === 'EXEC' ? '#00BFFF' : '#aaa' }}>
                    <span style={{ color: '#444', marginRight: 6 }}>[{log.time}]</span>
                    <span style={{ fontWeight: 'bold', marginRight: 6 }}>[{log.type}]</span>
                    {log.msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'containers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'c1', name: 'sudhi-os-frontend', image: 'node:18-alpine', cpu: '2.1%', mem: '124 MB', status: 'Up 14 days', ports: '80:80' },
              { id: 'c2', name: 'api-gateway-nginx', image: 'nginx:alpine', cpu: '0.4%', mem: '42 MB', status: 'Up 14 days', ports: '443:443' },
              { id: 'c3', name: 'postgres-db-primary', image: 'postgres:15', cpu: '1.2%', mem: '210 MB', status: 'Up 14 days', ports: '5432:5432' },
              { id: 'c4', name: 'redis-cache-service', image: 'redis:7-alpine', cpu: '0.2%', mem: '18 MB', status: 'Up 14 days', ports: '6379:6379' },
              { id: 'c5', name: 'prometheus-monitoring', image: 'prom/prometheus', cpu: '1.8%', mem: '180 MB', status: 'Up 14 days', ports: '9090:9090' },
            ].map(c => (
              <div key={c.id} style={{ padding: 10, borderRadius: 6, background: '#0b0e17', border: '1px solid #141926', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>🐳</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#00FF88' }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: '#666' }}>Image: {c.image} · Ports: {c.ports}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#ddd' }}>CPU: {c.cpu} · RAM: {c.mem}</div>
                  <div style={{ fontSize: 9, color: '#00FF88' }}>● {c.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pipelines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Build & Deploy SUDHI OS Production Bundle', repo: 'SudhirDevOps1/portfolio', branch: 'main', status: 'Passed ✅', time: '2 mins ago', duration: '42s' },
              { name: 'Docker Container Build & Push to DockerHub', repo: 'SudhirDevOps1/docker-suite', branch: 'main', status: 'Passed ✅', time: '1 hour ago', duration: '1m 12s' },
              { name: 'Kubernetes Cluster Health Analysis & Linting', repo: 'SudhirDevOps1/k8s-configs', branch: 'main', status: 'Passed ✅', time: '5 hours ago', duration: '28s' },
            ].map((p, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 6, background: '#0b0e17', border: '1px solid #141926', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: '#666' }}>Repo: {p.repo} ({p.branch}) · {p.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#00FF88', fontWeight: 'bold' }}>{p.status}</div>
                  <div style={{ fontSize: 9, color: '#555' }}>Duration: {p.duration}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
export default DevOpsMonitorWindow;

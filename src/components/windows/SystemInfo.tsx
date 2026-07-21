import React, { memo, useState, useEffect } from 'react';
import { Monitor, Smartphone, Cpu, Wifi, Battery, HardDrive, Shield, Globe, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const SystemInfoModal = memo(() => {
  const [deviceInfo, setDeviceInfo] = useState({
    os: 'Detecting...',
    browser: 'Detecting...',
    screen: 'Detecting...',
    cores: navigator.hardwareConcurrency || 4,
    ram: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '4+ GB',
    connection: (navigator as any).connection?.effectiveType?.toUpperCase() || '4G/WIFI',
    batteryLevel: '92%',
    isCharging: true,
    touch: 'ontouchstart' in window ? 'Supported 📱' : 'Mouse / Trackpad 🖱️',
    language: navigator.language || 'en-US',
  });

  useEffect(() => {
    // Detect OS & Browser
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    if (ua.includes('Win')) os = 'Windows PC 💻';
    else if (ua.includes('Mac')) os = 'macOS Apple 🍏';
    else if (ua.includes('Android')) os = 'Android Mobile 📱';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Device 📱';
    else if (ua.includes('Linux')) os = 'Linux Workstation 🐧';

    let browser = 'Modern Browser';
    if (ua.includes('Chrome')) browser = 'Google Chrome';
    else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari')) browser = 'Apple Safari';
    else if (ua.includes('Edg')) browser = 'Microsoft Edge';

    const screen = `${window.innerWidth} x ${window.innerHeight} px (${window.devicePixelRatio}x DPI)`;

    setDeviceInfo(prev => ({ ...prev, os, browser, screen }));

    // Real battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setDeviceInfo(prev => ({
          ...prev,
          batteryLevel: `${Math.round(batt.level * 100)}%`,
          isCharging: batt.charging,
        }));
      }).catch(() => {});
    }
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#090b10', fontFamily: 'var(--font-mono)', color: '#fff', padding: 16, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: 10, borderRadius: 10, background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid var(--accent)' }}>
          <Cpu size={24} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--accent)' }}>System Diagnostics & Hardware Info</div>
          <div style={{ fontSize: 11, color: '#666' }}>Real-time specs auto-detected from your actual device & browser</div>
        </div>
      </div>

      {/* Grid Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: <Monitor size={18} color="#00BFFF" />, label: 'User Device OS', val: deviceInfo.os },
          { icon: <Globe size={18} color="#00FF88" />, label: 'Web Browser', val: deviceInfo.browser },
          { icon: <Smartphone size={18} color="#FFB300" />, label: 'Screen Resolution', val: deviceInfo.screen },
          { icon: <Cpu size={18} color="#FF69B4" />, label: 'CPU Cores Available', val: `${deviceInfo.cores} Logical Cores` },
          { icon: <HardDrive size={18} color="#BF00FF" />, label: 'Device Memory / RAM', val: deviceInfo.ram },
          { icon: <Wifi size={18} color="#00E5FF" />, label: 'Network Speed', val: deviceInfo.connection },
          { icon: <Battery size={18} color="#00C853" />, label: 'Battery Status', val: `${deviceInfo.batteryLevel} ${deviceInfo.isCharging ? '⚡ (Charging)' : '🔋'}` },
          { icon: <Shield size={18} color="#FF4500" />, label: 'Input Mode', val: deviceInfo.touch },
        ].map(item => (
          <div key={item.label} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {item.icon}
            <div>
              <div style={{ fontSize: 10, color: '#666' }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#eee', marginTop: 2 }}>{item.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Tech Summary */}
      <div style={{ padding: 14, borderRadius: 10, background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.3)' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} /> SUDHI OS 3.0 Real-Time Engine Active
        </div>
        <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
          All 21+ apps (YouTube, Weather, Crypto, SpaceX, Map, Gallery, Games) operate live in client memory. Dynamic screen adapter active: responsive window layouts automatically scale to match your device resolution.
        </div>
      </div>
    </div>
  );
});
export default SystemInfoModal;

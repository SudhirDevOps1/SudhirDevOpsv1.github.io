import {
  Terminal, Bot, User, Zap, FolderGit2, Youtube, Globe, Image as ImageIcon, Video,
  Music, Gamepad2, Folder, Palette, FileText, Calendar, Map, Cloud, TrendingUp,
  Rocket, Globe2, Cpu, Calculator, Quote, LayoutGrid, Server, Mail, Send, Timer,
  Keyboard, Wrench, ArrowLeftRight, Newspaper, Settings, Activity,
  type LucideIcon,
} from 'lucide-react';

/**
 * Real-OS style app icon registry.
 * Each app gets its own bright two-stop gradient (Windows 11 / macOS "squircle" look),
 * a white glyph, and a soft drop-shadow colour. Keyed by app id from DESKTOP_ICONS.
 */
export interface AppIconMeta {
  glyph: LucideIcon;
  /** top-left -> bottom-right background gradient stops */
  from: string;
  to: string;
  /** rgba() used for the drop-shadow / selected glow */
  glow: string;
}

export const APP_ICONS: Record<string, AppIconMeta> = {
  terminal:     { glyph: Terminal,     from: '#2f3542', to: '#1e2127', glow: 'rgba(74,246,38,0.55)' },
  'ai-assistant': { glyph: Bot,        from: '#38bdf8', to: '#2563eb', glow: 'rgba(56,189,248,0.55)' },
  about:        { glyph: User,         from: '#22d3ee', to: '#0891b2', glow: 'rgba(34,211,238,0.55)' },
  skills:       { glyph: Zap,          from: '#fbbf24', to: '#f59e0b', glow: 'rgba(251,191,36,0.55)' },
  projects:     { glyph: FolderGit2,   from: '#fb7185', to: '#e11d48', glow: 'rgba(251,113,133,0.55)' },
  youtube:      { glyph: Youtube,      from: '#f87171', to: '#dc2626', glow: 'rgba(248,113,113,0.55)' },
  browser:      { glyph: Globe,        from: '#38bdf8', to: '#0284c7', glow: 'rgba(56,189,248,0.55)' },
  gallery:      { glyph: ImageIcon,    from: '#f472b6', to: '#db2777', glow: 'rgba(244,114,182,0.55)' },
  videoplayer:  { glyph: Video,        from: '#a78bfa', to: '#7c3aed', glow: 'rgba(167,139,250,0.55)' },
  'music-player': { glyph: Music,      from: '#fb7185', to: '#e11d48', glow: 'rgba(251,113,133,0.55)' },
  games:        { glyph: Gamepad2,     from: '#4ade80', to: '#16a34a', glow: 'rgba(74,222,128,0.55)' },
  'file-explorer': { glyph: Folder,    from: '#fbbf24', to: '#d97706', glow: 'rgba(251,191,36,0.55)' },
  paint:        { glyph: Palette,      from: '#fb923c', to: '#ea580c', glow: 'rgba(251,146,60,0.55)' },
  notepad:      { glyph: FileText,     from: '#94a3b8', to: '#475569', glow: 'rgba(148,163,184,0.55)' },
  calendar:     { glyph: Calendar,     from: '#60a5fa', to: '#2563eb', glow: 'rgba(96,165,250,0.55)' },
  map:          { glyph: Map,          from: '#34d399', to: '#059669', glow: 'rgba(52,211,153,0.55)' },
  weather:      { glyph: Cloud,        from: '#7dd3fc', to: '#0ea5e9', glow: 'rgba(125,211,252,0.55)' },
  crypto:       { glyph: TrendingUp,   from: '#fbbf24', to: '#f97316', glow: 'rgba(251,191,36,0.55)' },
  space:        { glyph: Rocket,       from: '#2dd4bf', to: '#0d9488', glow: 'rgba(45,212,191,0.55)' },
  countries:    { glyph: Globe2,       from: '#22d3ee', to: '#0891b2', glow: 'rgba(34,211,238,0.55)' },
  sysinfo:      { glyph: Cpu,          from: '#c084fc', to: '#9333ea', glow: 'rgba(192,132,252,0.55)' },
  calculator:   { glyph: Calculator,   from: '#fb923c', to: '#ea580c', glow: 'rgba(251,146,60,0.55)' },
  quotes:       { glyph: Quote,        from: '#f472b6', to: '#db2777', glow: 'rgba(244,114,182,0.55)' },
  workspaces:   { glyph: LayoutGrid,   from: '#818cf8', to: '#4f46e5', glow: 'rgba(129,140,248,0.55)' },
  'devops-monitor': { glyph: Server,   from: '#4ade80', to: '#15803d', glow: 'rgba(74,222,128,0.55)' },
  email:        { glyph: Mail,         from: '#60a5fa', to: '#1d4ed8', glow: 'rgba(96,165,250,0.55)' },
  contact:      { glyph: Send,         from: '#38bdf8', to: '#0369a1', glow: 'rgba(56,189,248,0.55)' },
  focus:        { glyph: Timer,        from: '#f87171', to: '#dc2626', glow: 'rgba(248,113,113,0.55)' },
  typing:       { glyph: Keyboard,     from: '#94a3b8', to: '#475569', glow: 'rgba(148,163,184,0.55)' },
  toolbox:      { glyph: Wrench,       from: '#fbbf24', to: '#d97706', glow: 'rgba(251,191,36,0.55)' },
  converter:    { glyph: ArrowLeftRight, from: '#2dd4bf', to: '#0d9488', glow: 'rgba(45,212,191,0.55)' },
  news:         { glyph: Newspaper,    from: '#a3e635', to: '#65a30d', glow: 'rgba(163,230,53,0.55)' },
  settings:     { glyph: Settings,     from: '#9ca3af', to: '#4b5563', glow: 'rgba(156,163,175,0.5)' },
  matrix:       { glyph: Activity,     from: '#22c55e', to: '#15803d', glow: 'rgba(34,197,94,0.6)' },
};

/** Fallback meta for any id not registered above. */
export const FALLBACK_ICON: AppIconMeta = {
  glyph: Activity, from: '#4ade80', to: '#16a34a', glow: 'rgba(74,222,128,0.5)',
};

export const getAppIcon = (id: string): AppIconMeta => APP_ICONS[id] ?? FALLBACK_ICON;

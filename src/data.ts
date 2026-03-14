// ─── Static Data (fallback if JSON not loaded) ─────────────────────────────────

export const THEMES = {
  green:  { name: 'Cyber Green',  accent: '#00FF88', rgb: '0, 255, 136' },
  blue:   { name: 'Neon Blue',    accent: '#00BFFF', rgb: '0, 191, 255' },
  amber:  { name: 'Amber',        accent: '#FFB300', rgb: '255, 179, 0' },
  purple: { name: 'Purple',       accent: '#BF00FF', rgb: '191, 0, 255' },
};

export const SKILLS = {
  LANGUAGES: [
    { name: 'JavaScript', pct: 95 },
    { name: 'TypeScript', pct: 90 },
    { name: 'Python',     pct: 80 },
    { name: 'Rust',       pct: 50 },
  ],
  FRAMEWORKS: [
    { name: 'React',    pct: 95 },
    { name: 'Next.js',  pct: 88 },
    { name: 'Node.js',  pct: 85 },
    { name: 'Express',  pct: 80 },
  ],
  'TOOLS & DEVOPS': [
    { name: 'Git',    pct: 95 },
    { name: 'Docker', pct: 75 },
    { name: 'AWS',    pct: 60 },
    { name: 'Linux',  pct: 88 },
  ],
  DATABASES: [
    { name: 'MongoDB',    pct: 88 },
    { name: 'PostgreSQL', pct: 80 },
    { name: 'Redis',      pct: 55 },
  ],
};

export const PROJECTS = [
  {
    id: 1,
    name: 'SudhiOS Portfolio',
    icon: '💻',
    desc: 'A virtual desktop OS-themed developer portfolio built with React. Features Matrix rain, window management, boot sequence, and a fully functional terminal.',
    stack: ['React', 'Tailwind CSS', 'Framer Motion', 'Canvas API'],
    live: 'https://sudhi.dev',
    repo: 'https://github.com/sudhi/sudhios',
    color: '#00FF88',
  },
  {
    id: 2,
    name: 'DevConnect Platform',
    icon: '🔗',
    desc: 'A real-time developer collaboration and code sharing platform with live cursors, shared terminals, and instant messaging.',
    stack: ['Next.js', 'Socket.io', 'MongoDB', 'Redis', 'Docker'],
    live: 'https://devconnect.app',
    repo: 'https://github.com/sudhi/devconnect',
    color: '#00BFFF',
  },
  {
    id: 3,
    name: 'CryptoTracker Pro',
    icon: '📈',
    desc: 'Live crypto portfolio tracker with real-time price alerts, interactive charts, and multi-wallet support.',
    stack: ['React', 'Node.js', 'CoinGecko API', 'Chart.js', 'PostgreSQL'],
    live: 'https://cryptotracker.pro',
    repo: 'https://github.com/sudhi/cryptotracker',
    color: '#FFB300',
  },
  {
    id: 4,
    name: 'AI Code Reviewer',
    icon: '🤖',
    desc: 'Automated PR code review tool powered by GPT-4 and GitHub Actions. Detects bugs, security issues, and style violations.',
    stack: ['Python', 'OpenAI API', 'GitHub Actions', 'FastAPI'],
    live: 'https://aicodereviewer.dev',
    repo: 'https://github.com/sudhi/ai-reviewer',
    color: '#BF00FF',
  },
  {
    id: 5,
    name: 'E-Commerce Engine',
    icon: '🛒',
    desc: 'Scalable full-stack e-commerce platform with payment integration, inventory management, and analytics dashboard.',
    stack: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma', 'AWS S3'],
    live: 'https://ecomengine.io',
    repo: 'https://github.com/sudhi/ecom-engine',
    color: '#00FF88',
  },
  {
    id: 6,
    name: 'Terminal Blog',
    icon: '📝',
    desc: 'A developer blog with terminal-style UI, keyboard navigation, markdown support, and syntax highlighting.',
    stack: ['Astro', 'TypeScript', 'MDX', 'Vercel'],
    live: 'https://blog.sudhi.dev',
    repo: 'https://github.com/sudhi/terminal-blog',
    color: '#00BFFF',
  },
];

export const BOOT_MESSAGES = [
  { tag: '[BIOS]',   msg: 'POST check complete... OK' },
  { tag: '[KERNEL]', msg: 'Initializing SUDHI-KERNEL v2.0...' },
  { tag: '[MEM]',    msg: 'Allocating 8192MB RAM... OK' },
  { tag: '[FS]',     msg: 'Mounting /portfolio... OK' },
  { tag: '[GPU]',    msg: 'Loading Matrix Rain Engine... OK' },
  { tag: '[NET]',    msg: 'Connecting to the grid... OK' },
  { tag: '[SYS]',    msg: 'Spawning portfolio modules...' },
  { tag: '[OK]',     msg: 'ABOUT.exe     loaded' },
  { tag: '[OK]',     msg: 'SKILLS.sh     loaded' },
  { tag: '[OK]',     msg: 'PROJECTS/     loaded' },
  { tag: '[OK]',     msg: 'TERMINAL.cmd  loaded' },
  { tag: '[OK]',     msg: 'CONTACT.mail  loaded' },
  { tag: '[READY]',  msg: 'Welcome, Sudhi. The system is yours.' },
];

export const DESKTOP_ICONS = [
  { id: 'terminal', label: 'TERMINAL.cmd', icon: '>_',  emoji: null },
  { id: 'about',    label: 'ABOUT.exe',    icon: null,   emoji: '👤' },
  { id: 'skills',   label: 'SKILLS.sh',    icon: null,   emoji: '⚡' },
  { id: 'projects', label: 'PROJECTS/',    icon: null,   emoji: '📁' },
  { id: 'contact',  label: 'CONTACT.mail', icon: null,   emoji: '✉' },
  { id: 'matrix',   label: 'MATRIX.toggle',icon: null,   emoji: '🌐' },
  { id: 'settings', label: 'SETTINGS.cfg', icon: null,   emoji: '⚙' },
  { id: 'file-explorer', label: 'EXPLORER.exe', icon: null, emoji: '📂' },
  { id: 'music-player', label: 'MUSIC.mp3', icon: null, emoji: '🎵' },
  { id: 'browser', label: 'BROWSER.net', icon: null, emoji: '🌍' },
  { id: 'paint', label: 'PAINT.art', icon: null, emoji: '🎨' },
  { id: 'email', label: 'EMAIL.inbox', icon: null, emoji: '📧' },
  { id: 'calendar', label: 'CALENDAR.app', icon: null, emoji: '📅' },
  { id: 'games', label: 'GAMES.exe', icon: null, emoji: '🎮' },
  { id: 'notepad', label: 'NOTEPAD.txt', icon: null, emoji: '📋' },
];

export const ASCII_LOGO = `██████████████████████████████████████████████████
█                                                █
█     ███████╗██╗   ██╗██████╗ ██╗  ██╗██╗      █
█     ██╔════╝██║   ██║██╔══██╗██║  ██║██║      █
█     ███████╗██║   ██║██║  ██║███████║██║      █
█     ╚════██║██║   ██║██║  ██║██╔══██║██║      █
█     ███████║╚██████╔╝██████╔╝██║  ██║██║      █
█     ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝      █
█                    OS v2.0                     █
██████████████████████████████████████████████████`;

// ─── JSON Data Types ─────────────────────────────────────────────────────────

export interface ProjectData {
  id: number;
  name: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  repoUrl: string;
  image: string;
  featured: boolean;
  category: string;
}

export interface AboutData {
  personal: {
    name: string;
    fullName: string;
    role: string;
    tagline: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    avatar: string;
    initials: string;
    status: string;
    statusColor: string;
  };
  bio: {
    short: string;
    long: string;
    mission: string;
  };
  stats: {
    projects: string;
    experience: string;
    coffee: string;
    commits: string;
    clients: string;
    technologies: string;
  };
  social: {
    github: { url: string; username: string; icon: string };
    linkedin: { url: string; username: string; icon: string };
    twitter: { url: string; username: string; icon: string };
    instagram: { url: string; username: string; icon: string };
  };
  resume: {
    url: string;
    filename: string;
  };
  skills: {
    languages: { name: string; level: number; icon: string }[];
    frameworks: { name: string; level: number; icon: string }[];
    tools: { name: string; level: number; icon: string }[];
    databases: { name: string; level: number; icon: string }[];
  };
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
    grade: string;
  }[];
  certifications: string[];
  interests: string[];
}

export interface CustomCommand {
  command: string;
  description: string;
  type: 'simple' | 'random' | 'formatted';
  output?: string;
  outputs?: string[];
}

export interface TerminalData {
  config: {
    prompt: string;
    hostname: string;
    username: string;
    shell: string;
    version: string;
    welcomeMessage: string;
  };
  systemInfo: {
    os: string;
    osVersion: string;
    kernel: string;
    host: string;
    packages: string;
    terminal: string;
    cpu: string;
    gpu: string;
    memory: string;
  };
  customCommands: CustomCommand[];
  aliases: Record<string, string>;
  bootMessages: {
    prefix: string;
    message: string;
    delay: number;
  }[];
  asciiLogo: string[];
}

// ─── JSON Loaders ─────────────────────────────────────────────────────────────

export async function loadProjectsData(): Promise<ProjectData[]> {
  try {
    const response = await fetch('/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects.json');
    const data = await response.json();
    return data.projects;
  } catch (error) {
    console.warn('Using fallback projects data:', error);
    return PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.desc,
      techStack: p.stack,
      liveUrl: p.live,
      repoUrl: p.repo,
      image: '',
      featured: p.id <= 2,
      category: 'Web App'
    }));
  }
}

export async function loadAboutData(): Promise<AboutData | null> {
  try {
    const response = await fetch('/data/about.json');
    if (!response.ok) throw new Error('Failed to load about.json');
    return await response.json();
  } catch (error) {
    console.warn('Using fallback about data:', error);
    return null;
  }
}

export async function loadTerminalData(): Promise<TerminalData | null> {
  try {
    const response = await fetch('/data/terminal.json');
    if (!response.ok) throw new Error('Failed to load terminal.json');
    return await response.json();
  } catch (error) {
    console.warn('Using fallback terminal data:', error);
    return null;
  }
}

// ─── Combined Data Loader ─────────────────────────────────────────────────────

export interface LoadedData {
  projects: ProjectData[];
  about: AboutData | null;
  terminal: TerminalData | null;
}

export async function loadAllData(): Promise<LoadedData> {
  const [projects, about, terminal] = await Promise.all([
    loadProjectsData(),
    loadAboutData(),
    loadTerminalData()
  ]);
  
  return { projects, about, terminal };
}

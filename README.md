<div align="center">

# 🖥️ SUDHI OS v4.0 Pro

**An interactive virtual desktop operating system — built as a developer portfolio**

![Version](https://img.shields.io/badge/version-4.0_Pro-00FF88?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Apps](https://img.shields.io/badge/Apps-32-00FF88?style=for-the-badge)
![pnpm](https://img.shields.io/badge/package_manager-pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge)

[**🌐 Live Demo**](https://sudhirdevopsv1.github.io) · [**👤 GitHub Profile**](https://github.com/SudhirDevOps1) · [**📚 Documentation**](./docs/GETTING_STARTED.md)

</div>

---

## 🌟 Overview

**SUDHI OS** is a fully interactive, browser-based desktop operating system built with **React 19 + TypeScript + Vite**. It ships **32 functional applications**, a Windows-grade window manager, live public-API integrations, and a neon cyberpunk design language — all running entirely client-side with zero backend.

It is the portfolio of **Sudhir Singh** ([@SudhirDevOps1](https://github.com/SudhirDevOps1)) — BCA student, DevOps & Full-Stack developer from Bihar, India.

> **Everything you see works.** No fake placeholders, no dead buttons — every app responds, every toggle changes the system, and every API is real.

---

## ✨ Feature Highlights

| Domain | What you get |
|---|---|
| 🪟 **Window Management** | Drag, resize (8 handles), minimize, maximize, always-on-top pin, **Snap Layouts flyout**, edge & **corner quarter-snapping** with live previews, Alt+Tab switcher |
| 🚀 **32 Applications** | Terminal, AI Assistant, Browser, YouTube, Games Arcade, Dev Toolbox, Typing Test, Focus Timer, News reader, Crypto, Weather, Space tracker, Maps, Countries, Paint, Music & Video players, Gallery, File Explorer, Notepad, Calculator, Calendar, Converter, and more — [full list](./docs/FEATURES.md#-applications) |
| ⚡ **Shell** | Boot sequence, lock screen, sleep/shutdown states, **Quick Settings panel**, **Notification Center** with calendar, Command Palette with **inline calculator**, Start Menu with **search + all apps** |
| 🎨 **Premium Look** | Animated aurora backdrop, Matrix rain, 7 accent themes, 8 gradient wallpaper presets + photo wallpapers, night light, real brightness dimmer, glassmorphism |
| 🔊 **Sound** | Zero-asset WebAudio sound engine — window open/close, snaps, notifications, boot chime, master volume |
| 🔌 **Live APIs** | GitHub, Hacker News, CoinGecko, Open-Meteo, REST Countries, USGS Earthquakes, ISS position, AdviceSlip — all with **silent offline fallbacks** |
| 🕹️ **Easter Eggs** | Konami party mode, secret logo clicks, terminal `hack` animation, and more |

---

## 🛠️ Tech Stack

```
React 19 · TypeScript 5.9 (strict) · Vite 7 · Tailwind CSS 4 · Framer Motion · Lucide Icons
```

- **Package manager:** pnpm (fast, disk-efficient)
- **Build:** `vite-plugin-singlefile` → one self-contained `dist/index.html` (~750 kB, deployable anywhere)
- **State:** React Context + hooks, `localStorage` persistence, reactive settings store
- **No backend required** — static hosting ready (GitHub Pages, Netlify, Vercel)

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/SudhirDevOps1/SudhirDevOpsv1.github.io.git
cd SudhirDevOpsv1.github.io

# 2. Install dependencies (pnpm required — https://pnpm.io)
pnpm install

# 3. Start dev server → http://localhost:5173
pnpm dev

# 4. Production build → dist/index.html (single file)
pnpm run build
```

Full setup, configuration & deployment guide: **[docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)**

---

## ⌨️ Essential Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + P` or `/` | Command Palette (apps, math, system commands) |
| `Alt + Tab` | Switch windows |
| `F1` | Keyboard shortcuts & gestures overlay |
| `Ctrl + Alt + Q` | Quick Settings panel |
| `Ctrl + Alt + N` | Notification Center |
| `Ctrl + L` | Lock screen |
| Drag window → edge / corner | Snap half / quarter |
| Hover green maximize dot | Snap Layouts menu |
| `↑ ↑ ↓ ↓ ← → ← → B A` | Konami party mode 🎉 |

---

## 📂 Project Structure

```
SudhirDevOpsv1.github.io/
├── src/
│   ├── App.tsx                  # Desktop shell, overlays, shortcuts
│   ├── main.tsx                 # Entry point
│   ├── data.ts                  # Static data, themes, wallpapers, icons
│   ├── index.css                # Design system + premium CSS layer
│   ├── context/OSContext.tsx    # Window manager, notifications, power state
│   ├── hooks/                   # useSystemSettings (reactive store hook)
│   ├── lib/                     # sysSettings store, sfx sound engine, storage
│   ├── types/os.ts              # Shared TypeScript contracts
│   └── components/
│       ├── common/              # Taskbar, StartMenu, WindowFrame, QuickSettings,
│       │                        # NotificationCenter, ToastStack, LockScreen, widgets
│       └── windows/             # 32 application components (lazy-loaded)
├── public/
│   ├── data/                    # 11 editable JSON data files
│   ├── image/                   # Logo & profile assets
│   ├── resume/                  # Resume PDF
│   └── wallpaper/               # Local wallpaper assets
├── docs/                        # 📚 All documentation
├── index.html                   # CSP, SEO, analytics
├── vite.config.ts               # React + Tailwind + singlefile
└── package.json                 # pnpm scripts & config
```

---

## 📚 Documentation

| Document | Contents |
|---|---|
| [**FEATURES.md**](./docs/FEATURES.md) | Complete feature catalog — all 32 apps, 35+ terminal commands, shortcuts, easter eggs |
| [**GETTING_STARTED.md**](./docs/GETTING_STARTED.md) | Setup, development, build, deployment & troubleshooting |
| [**DATA_CONFIG.md**](./docs/DATA_CONFIG.md) | Edit the 11 JSON files to customize content without touching code |
| [**CHANGELOG.md**](./docs/CHANGELOG.md) | Version history — v2 → v3 → v4 |

---

## 📊 Live Data Integrations

| Service | Used by | Failure mode |
|---|---|---|
| GitHub API | About, Projects | Cached fallback |
| Hacker News Firebase | DEV.WIRE news | Offline edition |
| CoinGecko | Crypto tracker, widget | Baked prices |
| Open-Meteo | Weather, widget | Static state |
| REST Countries | Globe explorer | Cached set |
| USGS Earthquakes | Space tracker | Last-known data |
| AdviceSlip | Wisdom generator | Local quotes |

All network calls fail **silently** with `catch(() => {})` — the console stays clean and the apps keep working offline.

---

## 👤 About the Author

**Sudhir Singh** — DevOps & Full-Stack Developer, Bihar, India

- 🐙 GitHub: [@SudhirDevOps1](https://github.com/SudhirDevOps1)
- ✉️ Email: [SudhirDevOps100@gmail.com](mailto:SudhirDevOps100@gmail.com)
- 🌐 Portfolio: [sudhirdevopsv1.github.io](https://sudhirdevopsv1.github.io)

---

<div align="center">

**Built with ❤️, React, and far too much neon green**

`SUDHI OS v4.0 • 32 apps • 100% client-side • MIT License`

</div>

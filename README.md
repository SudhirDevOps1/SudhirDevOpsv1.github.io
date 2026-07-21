# 🖥️ SUDHI OS v3.0 Pro — Virtual Desktop Portfolio

<div align="center">

![Version](https://img.shields.io/badge/version-3.0_Pro-00FF88?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.x-00BFFF?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![GitHub API](https://img.shields.io/badge/GitHub_API-SudhirDevOps1-FFB300?style=for-the-badge&logo=github)
![Apps](https://img.shields.io/badge/Real_Apps-17+-00FF88?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-00FF88?style=for-the-badge)

**The most feature-rich 2026 Web Desktop OS Portfolio for Sudhir Singh (SudhirDevOps1)**

[Live Demo](https://sudhirdevopsv1.github.io) • [GitHub](https://github.com/SudhirDevOps1)

</div>

---

## 🌟 Overview

SUDHI OS is a **production-ready virtual desktop** that acts as a fully interactive developer portfolio for **Sudhir Singh (`SudhirDevOps1`)** — a BCA student & Full-Stack/DevOps engineer from Bihar, India.

Every feature is **actually functional** — not a mockup.

---

## ✨ 2026 Real Applications (17 Total)

| App | What it does |
|-----|-------------|
| 🎵 **Music Player** | Real HTML5 audio player with visualizer, waveform bars, shuffle/repeat, local file upload, volume control, playlist |
| 🎬 **Video Player** | Full HTML5 video player with local file upload, URL streaming, speed control (0.5x–2x), fullscreen, chapter playlist |
| 📒 **Notepad** | Real multi-tab notepad with auto-save, Find/Replace, download as .txt, font size, word/char/line count |
| 🖼️ **Photo Gallery** | Grid/Lightbox view, zoom/rotate, local photo upload, thumbnail strip, keyboard navigation, download |
| 🗺️ **Maps** | OpenStreetMap iframe with search, geolocation (GPS), saved places, 3 map types (road/satellite/terrain) |
| 📅 **Calendar** | Full monthly calendar with event creation, time picker, color tags, notes, localStorage persistence |
| 📂 **File Explorer** | VFS with `/public` directory tree, file preview drawer, create/delete files, image thumbnail preview |
| 🎮 **Games** | 4 real arcade games: Retro Snake, Tic-Tac-Toe AI, Reaction Speed Test, Typing Speed Test |
| 🌐 **Browser** | iframe browser with address bar, history, back/forward, bookmarks, Bing search fallback |
| ▶️ **YouTube** | Embedded YouTube player with recommended video sidebar, channel thumbnails |
| 🎨 **Paint** | Canvas drawing board with pencil, eraser, color palette, fill bucket |
| >_ **Terminal** | 20+ commands: neofetch, benchmark, architecture, `ai <prompt>`, whoami, skills, history |
| 👤 **About** | Live GitHub API fetch: profile avatar, followers, repos, bio — for `SudhirDevOps1` |
| 📁 **Projects** | Live fetch of 87+ public GitHub repos with stars/forks metrics and filterable tabs |
| ⚡ **Skills** | Animated skill bars with categories (Languages, Frameworks, Tools, Databases) |
| ✉️ **Contact** | Working contact form |
| ⚙️ **Settings** | 10+ wallpapers, 4 themes, Matrix rain, font scale, Night Mode |

---

## 🪟 2026 Window Management

- **Windows 11 Snap Zones** — Drag to left/right edge → half-screen snap; top → maximize
- **Translucent Snap Preview Overlay** — Visual guide while dragging
- **Always-On-Top Pin** — Pin any window above all others
- **Alt+Tab Switcher** — Glassmorphic overlay window cycling
- **Ctrl+P / `/` Command Palette** — Instant fuzzy app search launcher

---

## 🚀 Quick Start

```bash
git clone https://github.com/SudhirDevOps1/SudhirDevOpsv1.github.io.git
cd SudhirDevOpsv1.github.io
npm install
npm run dev
```

### Production Build
```bash
npm run build
# → dist/index.html (single self-contained HTML file)
```

---

## 🗂️ Architecture

```
src/
├── App.tsx                    # Slim shell with lazy routes, Alt+Tab, Cmd Palette
├── data.ts                    # Desktop icons, themes, skills, boot messages
├── index.css                  # CSS variables, animations, @keyframes spin
├── context/OSContext.tsx      # Global state: windows, theme, wallpaper, power
├── lib/storage.ts             # localStorage persistence (notepad, settings)
├── types/os.ts                # TypeScript WinId & window state types
├── components/
│   ├── common/                # WindowFrame, Taskbar, StartMenu, DesktopIcon, MatrixRain
│   └── windows/               # All 17 lazy-loaded app windows
└── public/
    ├── image/                 # logo.png, logo.svg, personal.png
    ├── resume/                # resume.pdf
    └── wallpaper/             # win11_bloom.png + 12 remote wallpapers
```

---

## 📜 License & Author

Built with ❤️ by **Sudhir Singh (`SudhirDevOps1`)**  
BCA Student · Full-Stack & DevOps Engineer · Bihar, India 🇮🇳

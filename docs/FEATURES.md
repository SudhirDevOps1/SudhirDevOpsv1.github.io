# 📋 SUDHI OS — Feature Catalog

> Complete reference for every feature in SUDHI OS v4.1 Pro.
> All features are functional and client-side — nothing is decorative.

**Legend:** ✅ functional · 🆕 new in v4.1

---

## 🖥️ Core Operating System

| # | Feature | Description |
|---|---|---|
| 1 | Boot sequence | BIOS-style POST log with staged `[OK]` module loading and progress bar |
| 2 | Lock screen | Clock, date, user avatar, click-to-unlock with sound (`Ctrl+L`) |
| 3 | Sleep mode | Dim overlay with big clock, any key/click to resume |
| 4 | Shutdown screen | "It is now safe…" retro halt screen, click to reboot |
| 5 | Power states | `booting → running → sleeping → shutdown` state machine |
| 6 | Theme engine | 7 accent themes applied live via CSS custom properties |
| 7 | Matrix rain | Canvas digital-rain layer with per-theme accent color |
| 🆕 8 | Aurora backdrop | Animated drifting neon glow blobs (GPU-friendly CSS) |
| 🆕 9 | Reactive settings store | Central localStorage-backed store with subscribers (`useSystemSettings`) |
| 🆕 10 | WebAudio sound engine | 12 oscillator-based UI sounds, zero audio assets |
| 🆕 11 | Notification system | Persistent history, DND mode, badges, center panel |
| 🆕 12 | Toast notifications | Glass pills (success/error/info), auto-dismiss, click-to-close |
| 13 | Visitor session tracking | Session ID + PrismAnalytics beacon (sendBeacon → fetch fallback) |
| 14 | CSP hardening | Content-Security-Policy meta with explicit `connect-src` allow-list |
| 15 | PWA meta | Mobile-web-app capable, Apple meta tags, inline SVG favicon |
| 16 | SEO / Social | Open Graph + Twitter card meta, semantic title & description |
| 🆕 17 | Reduced motion support | `prefers-reduced-motion` disables all animation |

---

## 🪟 Window Management

| # | Feature | Description |
|---|---|---|
| 1 | Multi-window | Unlimited simultaneous windows with cascade positioning |
| 2 | Drag + double-click title | Move windows; double-click title to maximize/restore |
| 3 | 8-direction resize | Edge & corner handles with min-size clamping |
| 4 | Minimize / Maximize | 🆕 Premium custom gradient controls with hover glyph reveal, scale + glow, press animation, and sound |
| 5 | Always-on-top pin | 📌 titlebar pin lifts window +500 z-index |
| 6 | Alt+Tab switcher | Overlay with window thumbnails and keyboard cycling |
| 7 | Taskbar tabs | Per-window tabs with right-click restore/minimize/close menu |
| 8 | Edge snapping | Drag to left/right edge → half; top edge → maximize, with previews |
| 🆕 9 | Corner quarter-snapping | Drag into any corner → quarter tile with dashed preview |
| 🆕 10 | Snap Layouts flyout | Hover the maximize button → 6-zone visual layout picker (stays open on hover) |
| 11 | Lazy-loaded apps | Every app is code-split (`React.lazy`) for fast first paint |

---

## ⚡ Shell & Productivity

| # | Feature | Description |
|---|---|---|
| 1 | Start menu | Pinned apps grid, power options, theme selector, logo easter egg |
| 🆕 2 | Start menu search | Instant fuzzy search across every app |
| 🆕 3 | All-apps directory | Full alphabetical app list with badges |
| 🆕 4 | Taskbar pinned dock | Quick-launch: Terminal, Browser, Projects, DEV.WIRE, DEV.tools, Settings with open-state indicators |
| 🆕 5 | Quick Settings panel | Tiles (Wi-Fi, Night Light, Focus, Aurora, Matrix, Grid, CRT, Blur, Sounds) + brightness & volume sliders + theme picker (`Ctrl+Alt+Q`) |
| 🆕 6 | Notification Center | History (last 30), unread badge, Focus/DND toggle, live mini-calendar (`Ctrl+Alt+N`) |
| 7 | Command palette | App search with keyboard navigation (`Ctrl+P` or `/`) |
| 🆕 8 | Palette calculator | Type `12*8+4` → instant result, click to copy |
| 🆕 9 | Palette system commands | Lock, sleep, restart, shutdown, toggle Matrix/Aurora, shortcuts |
| 🆕 10 | Shortcuts overlay | `F1` — every gesture & shortcut documented in-OS |
| 11 | Desktop icons | Drag-anywhere icons with selection, double-click launch, auto-grid on resize |
| 12 | Right-click menu | Refresh, themes submenu, Matrix toggle, fullscreen + 🆕 Personalize / Shortcuts / Notifications |
| 13 | Draggable widgets | Clock, weather, BTC price, launch countdown, 🆕 JS-heap monitor, 🆕 sticky note — all in one draggable stack |
| 14 | Focus mode (DND) | Pauses notification intake, moon indicator in tray |
| 🆕 15 | Real battery status | Battery Status API with charging indicator (estimate fallback) |
| 🆕 16 | Night light | Warm amber overlay for late-night sessions |
| 🆕 17 | Brightness dimmer | Real screen dimmer synced across Settings & Quick Settings |

---

## 🚀 Applications (32)

### 🛠 System & Developer

| App | Window | Highlights |
|---|---|---|
| `TERMINAL.cmd` | terminal | 35+ commands, aliases, JSON-configurable custom commands, boot messages |
| `DEV.tools` 🆕 | toolbox | JSON format/minify · Base64 (UTF-8 safe) · URL codec · SHA-256/512 · UUID v4 · password generator with entropy meter · unix timestamp tools |
| `TYPE.run` 🆕 | typing | 15 dev passages · 15/30/60/120 s modes · live WPM/accuracy · per-second WPM sparkline · personal bests |
| `FOCUS.timer` 🆕 | focus | Pomodoro 25/5/15 with SVG progress ring & daily stats · centisecond stopwatch with laps · IST/EST/UTC/JST world clocks |
| `SPECS.info` | sysinfo | Live hardware detection — CPU cores, RAM, screen, battery, network, input type |
| `DEVOPS.cloud` | devops-monitor | CPU/RAM/bandwidth charts, Docker containers, Kubernetes status, CI/CD pipelines |
| `SPACES.layout` | workspaces | One-click multi-window workspace bundles (DevOps Suite, Media Center, AI Suite…) |
| `AI_BOT.exe` | ai-assistant | Portfolio-trained chatbot with quick prompts and voice-style OS command launching |

### 🌐 Web & Data

| App | Window | Highlights |
|---|---|---|
| `BROWSER.net` | browser | Wikipedia home, DuckDuckGo search, bookmarks, X-Frame-Options detection |
| `DEV.wire` 🆕 | news | Hacker News front page — live Firebase feed, search, sort, offline edition |
| `CRYPTO.live` | crypto | 10 coins live via CoinGecko, USD/INR, 24 h change, favorites |
| `WEATHER.live` | weather | Open-Meteo, 8 city presets, 24-hour chart, °C/°F |
| `GLOBE.explore` | countries | 250+ countries via REST Countries + flag quiz game |
| `SPACE.track` | space | Launch countdowns, live ISS tracker, USGS earthquake feed |
| `MAPS.exe` | map | OpenStreetMap search, GPS detection, saved locations, layers |
| `YOUTUBE.app` | youtube | Curated categories + custom URL player |
| `GMAIL.app` | email | Mailbox quick-composer targeting SudhirDevOps100@gmail.com |
| `CONTACT.form` | contact | FormForge Cloudflare Worker endpoint with honeypot bot trap |
| `CONVERT.exe` 🆕 | converter | Length/mass/temperature/speed/data/time + live currency rates with offline fallback |

### 🎨 Creative & Media

| App | Window | Highlights |
|---|---|---|
| `PAINT.art` | paint | Pencil, eraser, fill bucket, palette, stroke width, PNG export |
| `GALLERY.photos` | gallery | Grid/lightbox, zoom/rotate, local image upload |
| `MEDIA.video` | videoplayer | Local upload + streaming URL, 0.5×–2× speed, fullscreen |
| `MUSIC.mp3` | music-player | Waveform visualizer, shuffle/repeat, playlist, local upload |
| `NOTEPAD.txt` | notepad | Multi-tab editor, find/replace, auto-save, .txt export |
| `EXPLORER.exe` | file-explorer | Virtual file system with PDF/image/video previews + real assets |

### 🎮 Fun & Portfolio

| App | Window | Highlights |
|---|---|---|
| `GAMES.exe` | games | Retro Snake, Tic-Tac-Toe (minimax AI), Memory Match, Reaction Test, Speed Typing |
| `CALC.exe` | calculator | Scientific calculator, Windows-11 styling |
| `WISDOM.api` | quotes | AdviceSlip live wisdom + dev quotes, 1-click copy |
| `CALENDAR.app` | calendar | Monthly grid, event creator, color tags, persistence |
| `ABOUT.exe` | about | Live GitHub profile fetch for SudhirDevOps1 |
| `SKILLS.sh` | skills | Animated proficiency matrix |
| `PROJECTS/` | projects | Live GitHub repo showcase with stars/forks + categories |
| `SETTINGS.cfg` | settings | 5-tab control center: wallpapers, themes, effects, display, audio |

---

## 🎮 Terminal Commands (35+)

| Category | Commands |
|---|---|
| System info | `help` `about` `neofetch` `whoami` `version` `date` `time` `uptime` `battery` `wifi` |
| Navigation | `ls` `pwd` `cd [dir]` |
| Window control | `open [app]` `close [app]` `minimize [app]` `explorer [path]` `edit [file]` `settings` |
| System | `clear` `clearall` `history` `restart` `shutdown` `sleep` |
| Customization | `theme [name]` `matrix on/off` |
| Utilities | `echo [msg]` `calc [expr]` `find [file]` `screenshot` |
| Processes | `ps` `kill [pid]` `top` |
| Multimedia | `record start/stop` |
| Aliases | `alias` `unalias` |
| Portfolio | `skills` `projects` `contact` |
| Easter eggs | `sudo rm -rf /` `hack` `coffee` `konami` |

Custom commands and aliases are extensible via `public/data/terminal.json`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + P` / `/` | Command palette |
| `Alt + Tab` | Window switcher |
| `F1` 🆕 | Shortcuts & gestures overlay |
| `Ctrl + Alt + Q` 🆕 | Quick Settings |
| `Ctrl + Alt + N` 🆕 | Notification Center |
| `Ctrl + L` | Lock screen |
| `Esc` 🆕 | Close overlays |
| Drag → edge | Snap half / maximize |
| Drag → corner 🆕 | Snap quarter |
| Hover ⊡ 🆕 | Snap Layouts menu |
| Double-click title | Maximize/restore |

---

## 🎨 Customization Surface

- **7 accent themes** — Cyber Green, Neon Blue, Amber, Purple, 🆕 Crimson, 🆕 Ice Cyan, 🆕 Mono White
- **8 gradient wallpaper presets** 🆕 — Aurora, Nebula, Sunset, Deep Ocean, Green Code, Golden Hour, Frost, Void (zero-bandwidth CSS)
- **12 photo wallpapers** — Unsplash HD + local Windows 11 Bloom + any custom URL
- **Effects** — Matrix rain, CRT scanlines, background grid, glass blur, 🆕 aurora, 🆕 night light
- **Wallpaper opacity** 30–100% and 🆕 real screen brightness dimmer
- **11 JSON data files** — edit content without touching code ([DATA_CONFIG.md](./DATA_CONFIG.md))

---

## 🕹️ Easter Eggs & Secrets

| Secret | Trigger |
|---|---|
| 🎉 Konami party mode | `↑ ↑ ↓ ↓ ← → ← → B A` — 30 s of hue-cycling neon chaos |
| Developer mode | Click the Start-menu logo 5 times |
| Terminal `hack` | Fake hacking animation |
| Terminal `coffee` | ASCII coffee art |
| Terminal `sudo rm -rf /` | Snarky refusal |
| Matrix toggle | Desktop icon, Start menu, palette, Quick Settings |
| Hidden themes | All 7 reachable from context menu, palette, Quick Settings |

---

## 🔌 Live API Integrations

| API | Consumer | Offline behavior |
|---|---|---|
| GitHub REST | About, Projects | Cached/seeded data |
| Hacker News Firebase | DEV.wire 🆕 | Baked offline edition |
| CoinGecko | Crypto, widget | Last-known prices |
| Open-Meteo | Weather, widget | Static state |
| REST Countries | Globe | Seeded country set |
| USGS Earthquakes | Space | Last-known feed |
| ISS (wheretheiss.at) | Space | Position freeze |
| AdviceSlip | Quotes | Local quote pool |
| exchangerate.host 🆕 | Converter | Baked indicative rates |

Every fetch uses silent `.catch(() => {})` — zero red console errors, ever.

---

## ⚙️ Technical Specifications

| Aspect | Detail |
|---|---|
| Framework | React 19 (memo, hooks, code-splitting) |
| Language | TypeScript 5.9 strict |
| Build | Vite 7 + `vite-plugin-singlefile` → single `dist/index.html` |
| Styling | Tailwind CSS 4 + inline design-token styles + CSS variables |
| Animation | Framer Motion + CSS keyframes + Canvas 2D |
| Package manager | pnpm 12 |
| Persistence | `localStorage` (settings, notes, stats, icon positions) |
| Performance | Memoized components, RAF canvas, event cleanup, lazy apps |
| Accessibility | Focus-visible rings, reduced-motion support, semantic buttons |

---

**SUDHI OS v4.0** — 32 apps · 100% client-side · [Live Demo](https://sudhirdevopsv1.github.io) · [Back to README](../README.md)

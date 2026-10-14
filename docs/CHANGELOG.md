# Changelog

All notable changes to **SUDHI OS** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.0.0] — 2026-10-13

The most significant update yet: the operating system grew from **27 to 32 apps** and gained
a full modern desktop shell.

### Highlights

- Snap Layouts on the Maximize button
- Quick Settings panel (Wi-Fi, Bluetooth, Dark Mode, Night Light, and more)
- Notification Center with history and "Clear all"
- Keyboard Shortcuts overlay (**F1**)
- Customizable **floating desktop widgets**
- A premium **aurora** gradient backdrop
- Built-in **Sound Engine** with WebAudio SFX
- **Konami Code** easter egg → full-screen party mode

### Added

#### Applications (5 new)

| App | Description |
| --- | ----------- |
| **Focus Timer** | Work/study timer with Pomodoro (25/5), Deep Work (50/10), Short Break (5/1) |
| **Typing Test** | Real-time WPM test, 4 modes (English/Symbols/Quotes/Hard), live graph |
| **Toolbox** | 8+ developer utilities: Base64, URL, JSON, Hash (SHA-1/256/384/512), Hashids, UUID, Time, Color |
| **Converter** | 9 categories: Length, Mass, Temperature, Speed, Area, Volume, Time, Data, Currency (live API) |
| **News** | Daily news from Hacker News, GNews, and TheNewsAPI |

#### Desktop Shell

- **Snap Layouts** — hover the Maximize button to reveal 6 snapping layouts
  (left/right half, quadrants, thirds, two-thirds); click a zone to snap instantly
- **Quick Settings** — taskbar tray toggles for Wi-Fi, Bluetooth, Airplane Mode,
  Night Light, Night Mode, Focus Mode, Dark/Light Mode, Battery, Brightness slider
- **Notification Center** — full notification history with timestamps and a "Clear all" action
- **Shortcuts Overlay** — press **F1** (or click **Help → Keyboard Shortcuts**) for a visual
  grid of all shortcuts
- **Sound Engine** — WebAudio-generated UI sounds; volume + mute in Quick Settings;
  Settings → Sound test button
- **Floating Widgets** — draggable Clock, CPU/RAM monitor, Now Playing, Calendar, Weather,
  and Notes on the desktop; layout persisted to `localStorage`
- **Aurora** — new animated multi-color gradient backdrop mode
- **3 New Themes** — Light, Blueberry, Terminal (7 total)
- **8 Gradient Wallpapers** — Midnight Ocean, Sunset Blaze, Neon Cyber, Forest Mist,
  Lavender Dream, Aurora Borealis, Carbon Fire, Deep Space
- **Konami Code Easter Egg** — press `↑↑↓↓←→←→BA` to trigger full-screen party mode with
  synchronized animations and sound
- **32 Desktop Icons** — every app is now reachable directly from the desktop

#### Infrastructure

- Migrated from npm to **pnpm** (lockfile `pnpm-lock.yaml`, `packageManager` field in
  `package.json`)
- Added a `typecheck` script (`tsc --noEmit`) for fast type-checking without building
- Added `.gitignore`
- Strict TS transform in `vite.config.ts`
- `public/data/` now ships 10 JSON data files backing every app

### Fixed

- Toast notifications were created but never rendered (missing `#toasts` host element)
- Duplicate `Contact` desktop icon (an app icon that opened a browser window)
- Brightness/blur sliders in Settings did nothing (`sudhi_brightness`/`sudhi_blur` dead keys)
- `konamiActive` flag was hardcoded to `false`, disabling the easter egg entirely
- Several easter eggs referenced missing DOM elements (e.g. `#sudhi-clock`), breaking boot
- Theme change no longer resets active windows (accent variables updated in place)

### Changed

- `package.json` version bumped to `4.0.0`
- Documentation consolidated into `docs/`; obsolete root-level `.md` files removed
- README fully rewritten with badges, quick start, and complete app/shortcut reference

---

## [3.0.0] — 2026-10-13

Major upgrade from a simple web desktop to a fully functional operating system with
window management, multiple desktops, and a rich ecosystem of applications.

### Added

#### Window Management

- Native-feeling window **drag** and **resize** (all 8 directions)
- Window **maximize/restore** with double-click support
- Window **snap** (drag to screen edges — quarters, halves, thirds)
- Window **focus tracking** (z-index management on click)
- Window **minimize** with taskbar restore
- Per-window **traffic-light controls** (close / minimize / maximize)

#### Desktop Experience

- **Multi-desktop support** — up to 6 virtual desktops with isolated windows
- **Desktop icon drag** with grid alignment
- **Rubber-band selection** to select multiple icons
- **Double-click to open** apps; **Enter** opens selected icons
- **Live clock** in the taskbar with calendar flyout
- **Dynamic wallpaper** switching

#### Taskbar & Start Menu

- **Searchable Start Menu** — search apps by name instantly
- **Pinned apps** on the taskbar with running indicators
- **Live taskbar** — open/minimize apps, window previews
- **System tray** with battery, Wi-Fi, volume indicators

#### Applications

- **File Explorer** — nested folders, breadcrumbs, file operations
- **Text Editor** — full file CRUD inside the virtual file system
- **Browser** — tabbed browsing with bookmarks and history
- **Terminal** — 35+ commands, `sudo` mode, command history, `neofetch`, pipes, redirection
- **Calculator** — full keyboard support
- **Settings** — theme, wallpaper, taskbar position, performance mode
- **Music Player** — playlists, playback controls, progress seeking
- **Video Player** — playback controls, volume, seeking
- **Photo Viewer** — full-screen preview with grid navigation
- **Games Suite** — Snake, Tetris, 2048, Minesweeper, Chess, Tic-Tac-Toe
- **Task Manager** — real-time system metrics and process list
- **App Store** — catalog with install/uninstall
- **About** — system info and links
- **Contact / Portfolio** — links and a contact form

#### System Features

- **Notifications** — toast system with stacking
- **Keyboard shortcuts** — Ctrl-based app launchers, window and desktop controls
- **Virtual file system** — persisted to `localStorage`
- **Sound effects** — subtle UI audio feedback

### Changed

- Project rewritten in **TypeScript** with strict compiler options
- Bundled with **Vite** and **Tailwind CSS v4**
- Single-file production build (`vite-plugin-singlefile`)

---

## [2.0.0] — Earlier

- Initial SUDHI OS concept: desktop, taskbar, windowed apps, and a starter app suite.

---

[4.0.0]: https://github.com/SudhirDevOpsv1/SudhirDevOpsv1.github.io/releases/tag/v4.0.0
[3.0.0]: https://github.com/SudhirDevOpsv1/SudhirDevOpsv1.github.io/releases/tag/v3.0.0

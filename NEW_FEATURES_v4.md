# 🎉 SUDHI OS v4.0 — NEW FEATURES (Premium Upgrade)

> **Everything from v2/v3 is 100% intact — v4 is purely additive.**
> 5 new apps + a full Windows-11-grade premium shell upgrade.

---

## 🚀 1. Five Brand-New Apps (27 → 32 Total)

| App | Window ID | Highlights |
|---|---|---|
| ⏱️ **FOCUS.timer** | `focus` | Pomodoro (25/5/15, long break every 4th session), animated SVG progress ring, auto-start toggle, daily focus stats persisted to localStorage, centisecond **Stopwatch** with laps, live **World Clocks** (IST / EST / UTC / JST) with day-night indicators |
| ⌨️ **TYPE.run** | `typing` | 15 dev-themed passages, 15/30/60/120-second modes, per-character highlighting with animated caret, live WPM / accuracy / raw WPM / errors, results screen with consistency rating (Laser / Steady / Rusty), **per-second WPM sparkline** (inline SVG), personal bests (`sudhi_type_best`) |
| 🧰 **DEV.tools** | `toolbox` | 7-tool developer suite: **JSON** formatter/minifier with live errors, **Base64** (UTF-8 safe), **URL** codec, **SHA-256 / SHA-512** hashing (WebCrypto), **UUID v4** generator with history, **Password** generator with entropy strength meter, **Timestamp** converter (unix ↔ human, local/UTC/IST + relative) |
| 📐 **CONVERT.exe** | `converter` | Length, Mass, Temperature, Speed, Data, Time + **live Currency** rates (open.er-api.com with baked offline fallback & badge), swap button, 6 clickable quick-conversions per category |
| 📰 **DEV.wire** | `news` | **Hacker News** front-page reader (official Firebase API), top 25 stories, search + TOP/NEW/DISCUSSION sorting, comment links, skeleton loaders, 5-minute auto-refresh, **offline edition** fallback so it never breaks |

All five are lazy-loaded (code-split) and appear on the desktop, in Start Menu pinned + all-apps, in the Command Palette, and in the Taskbar pinned dock.

---

## 🪟 2. Windows 11-Grade Window Management

- **Snap Layouts flyout** — hover the green maximize dot for 350 ms to open a 6-zone snap picker (left / right / top / bottom-half / 4 quadrants)
- **Quarter-corner snapping** — drag a window into any screen corner to snap it into that quadrant, with live dashed previews
- Existing edge-snapping (left/right/top) preserved, now with snap sounds

## ⚡ 3. Quick Settings Panel (tray → or `Ctrl+Alt+Q`)

Windows-11-style flyout with:
- Toggle tiles: Wi-Fi, **Night Light**, **Focus (DND)**, **Aurora backdrop**, Matrix Rain, Grid Lines, CRT Scanlines, Glass Blur, Sounds
- **Brightness** slider (real screen dimmer) + **Master volume** slider with TEST SOUND
- **7 accent theme** quick picker
- Live network + battery status footer

## 🔔 4. Notification Center (tray clock / bell → or `Ctrl+Alt+N`)

- Persistent notification history (last 30) with unread badge on the taskbar bell
- **Focus Mode (DND)** toggle — pauses incoming notifications
- Live **mini-calendar** with today highlighted
- Notifications pushed on login: welcome, mail, weather, pro-tips

## 🧮 5. Command Palette v2 (`Ctrl+P` or `/`)

- **Inline calculator** — type `12*8+4` and get the result instantly (click to copy)
- **System commands** — lock, sleep, restart, shutdown, toggle Matrix, toggle Aurora, open shortcuts overlay
- App search (as before)

## 🔊 6. WebAudio Sound Engine (zero audio assets)

UI sounds for: window open/close, minimize/maximize, edge-snap, tray clicks, notifications, errors, success, unlock, **boot chime** and **power-on chord**. Fully controlled by the Sounds toggle + master volume.

## 🎨 7. Premium Look Layer

- **Animated Aurora backdrop** — slow-drifting neon glow blobs (GPU-friendly, on by default when no wallpaper is set)
- **3 new accent themes**: Crimson `#FF3B5C`, Ice Cyan `#00E5FF`, Mono White `#E8EAF6` (7 total)
- **8 gradient wallpaper presets** — zero-bandwidth premium backdrops (Aurora, Nebula, Sunset, Deep Ocean, Green Code, Golden Hour, Frost, Void)
- **Night Light** warm tint overlay
- Real **screen brightness** dimmer (synced between Settings + Quick Settings)
- Refined taskbar: gradient start button, **pinned quick-launch dock** with open-app indicators, badge on notification bell
- **Toast notifications finally render** (v3 stored them but never displayed them!) — glass pills with type colors, auto-dismiss, click to close
- **Sticky Note widget** (draggable widget stack, auto-saved) + **JS Heap monitor widget**
- Premium focus rings, custom selection color, styled range sliders, shimmer skeletons, `prefers-reduced-motion` support

## 🕹️ 8. Fun & Power-User

- **Konami Code is real now**: `↑ ↑ ↓ ↓ ← → ← → B A` → 30 seconds of party mode (hue-cycling desktop + theme strobe)
- **F1** → Keyboard Shortcuts & Gestures overlay (every shortcut documented in-OS)
- Start Menu **search box** + full **All Apps** directory
- Right-click desktop: Personalize, Shortcuts, Notification Center entries added
- Real **Battery Status API** in the tray (falls back to estimate)
- **`.gitignore`** added (`node_modules`, `dist`)

---

## 🧹 9. Bug Fixes Discovered During the Upgrade

| Issue | Fix |
|---|---|
| Toast notifications were stored but **never rendered** anywhere | Added `ToastStack` component — all 20+ existing `addToast()` calls now show visible toasts |
| Duplicate `CONTACT` desktop icon (same React key + id) | De-duplicated (identical entry, zero feature loss) |
| Settings *Brightness* slider wrote a hidden root CSS filter nobody felt | Rewired to the real screen-dimmer overlay, synced with Quick Settings |
| Glass Blur toggle wrote a CSS var nobody consumed | Now actually disables all backdrop blur (`.no-blur` kill-switch) |
| `konamiActive` was hard-coded `false` | Fully implemented sequence detector in OSContext |

---

**SUDHI OS v4.0** — 32 apps, Windows-grade shell, premium neon. Built by Sudhir Singh (SudhirDevOps1). 🚀

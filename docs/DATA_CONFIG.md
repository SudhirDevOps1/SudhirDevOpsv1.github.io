# Data Configuration

SUDHI OS applications read their content from static JSON files in `public/data/`. This makes
it easy to customize what the OS displays — **no rebuild required**; the browser loads these
files at runtime via `fetch()`.

> To edit application content (apps, themes, wallpapers, files, or notifications), you only
> need to change the corresponding JSON file.

---

## File Reference

| File | Consumed By | Purpose |
| ---- | ----------- | ------- |
| `about.json` | **About** | Developer profile and repository links |
| `browser-bookmarks.json` | **Browser** | Pinned tabs, bookmarks, and site history |
| `calendar-events.json` | **Calendar** | Default calendar entries |
| `email-messages.json` | **Mail** | Inbox messages for the mail client |
| `games.json` | **Games** | Game catalogue (Snake, Tetris, 2048, Minesweeper, Chess, Tic-Tac-Toe) |
| `music-library.json` | **Music** | Album artwork and song listings |
| `paint-templates.json` | **Paint** | Drawing templates and a JSON-backed image database |
| `projects.json` | **Projects / Portfolio** | Showcase entries with badges and screenshots |
| `settings.json` | **Settings / OS** | Theme, appearance, enabled features, and taskbar config |
| `terminal.json` | **Terminal** | Commands, aliases, and command history |
| `news-cache.json` | **News** | Cached news feed (auto-updated at runtime) |

---

## File Formats

### about.json — Developer Profile

```json
{
  "developer": "Sudhir Maurya",
  "role": "DevOps Engineer & Full-Stack Developer",
  "tagline": "Automating the future, one pipeline at a time.",
  "location": "India",
  "github": "SudhirDevOpsv1",
  "repository": "https://github.com/SudhirDevOpsv1/SudhirDevOpsv1.github.io",
  "liveDemo": "https://sudhirdevopsv1.github.io",
  "links": [
    { "label": "GitHub", "url": "https://github.com/SudhirDevOpsv1" }
  ]
}
```

### browser-bookmarks.json — Pinned Tabs, Bookmarks & History

```json
{
  "pinned": [
    {
      "title": "GitHub",
      "url": "https://github.com",
      "icon": "https://github.com/favicon.ico",
      "description": "Code hosting"
    }
  ],
  "bookmarks": [
    { "title": "Google", "url": "https://google.com", "icon": "https://www.google.com/favicon.ico" }
  ],
  "history": [
    { "title": "GitHub", "url": "https://github.com", "lastVisit": "2026-10-13T08:17:17Z" }
  ]
}
```

### calendar-events.json — Calendar Entries

```json
{
  "events": [
    {
      "id": "1",
      "title": "Team Standup",
      "description": "Daily sync meeting",
      "start": "2026-10-13T09:00:00Z",
      "end": "2026-10-13T09:30:00Z",
      "location": "Meet",
      "color": "#3b82f6"
    }
  ]
}
```

### email-messages.json — Mail Inbox

```json
{
  "messages": [
    {
      "id": "1",
      "from": "Sudhir Maurya",
      "fromEmail": "sudhir@example.com",
      "to": "you@example.com",
      "subject": "Welcome",
      "body": "…",
      "date": "2026-10-13T10:42:00Z",
      "read": true,
      "starred": false,
      "label": "inbox"
    }
  ]
}
```

### games.json — Game Catalogue

```json
{
  "games": [
    {
      "id": "snake",
      "title": "Snake",
      "category": "Classic",
      "difficulty": "Easy",
      "players": "Single Player",
      "controls": "Arrow keys / WASD",
      "playCount": 128,
      "bestScore": 0
    }
  ]
}
```

### music-library.json — Albums & Songs

```json
{
  "albums": [
    {
      "id": "a1",
      "title": "Album Name",
      "artist": "Artist",
      "art": "https://picsum.photos/seed/a1/300",
      "songs": [
        {
          "id": "s1",
          "title": "Song Title",
          "artist": "Artist",
          "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          "duration": 372
        }
      ]
    }
  ]
}
```

### paint-templates.json — Templates & Image Database

```json
{
  "templates": [
    {
      "id": "blank",
      "name": "Blank Canvas",
      "category": "Basic",
      "width": 800,
      "height": 600,
      "background": "#ffffff",
      "preview": null,
      "description": "Empty canvas"
    }
  ],
  "images": []
}
```

### projects.json — Portfolio Entries

```json
{
  "projects": [
    {
      "id": "sudhi-os",
      "title": "SUDHI OS",
      "description": "A premium web-based desktop environment",
      "category": "Web / OS",
      "status": "Active",
      "technologies": ["TypeScript", "Vite", "Tailwind CSS"],
      "features": ["Window manager", "Virtual file system"],
      "badges": [
        { "label": "TypeScript", "color": "#3178c6" }
      ],
      "screenshots": [
        { "src": "https://picsum.photos/seed/sudhi/800/450", "caption": "Desktop" }
      ],
      "links": {
        "demo": "https://sudhirdevopsv1.github.io",
        "source": "https://github.com/SudhirDevOpsv1/SudhirDevOpsv1.github.io"
      },
      "featured": true,
      "stars": 10
    }
  ]
}
```

### settings.json — Theme, Appearance & Features

```json
{
  "theme": {
    "dark": { "bg": "#0a0a1a", "fg": "#e2e8f0", "accent": "#6366f1" },
    "light": { "bg": "#f8fafc", "fg": "#1e293b", "accent": "#6366f1" }
  },
  "appearance": {
    "wallpaper": "gradient-aurora",
    "wallpapers": [],
    "customWallpapers": [],
    "wallpaperOpacity": 1.0,
    "taskbarPosition": "bottom",
    "taskbarAutoHide": false,
    "taskbarBlur": 20,
    "taskbarTransparency": 0.85,
    "uiScale": 1.0,
    "animations": true,
    "dockSize": 48
  },
  "features": {
    "enableAnimations": true,
    "enableSounds": true,
    "enableNotifications": true,
    "enableGestures": false,
    "performanceMode": false,
    "reduceTransparency": false,
    "highContrast": false,
    "reduceMotion": false
  }
}
```

### terminal.json — Commands & History

```json
{
  "commands": [
    {
      "name": "help",
      "category": "General",
      "description": "Show available commands",
      "usage": "help [command]",
      "examples": ["help"]
    }
  ],
  "aliases": [
    { "alias": "ls", "command": "dir" }
  ],
  "history": ["help", "ls", "neofetch"]
}
```

---

## How the Data Loads

Each application fetches its JSON file at runtime:

```ts
const response = await fetch('data/about.json');
const data = await response.json();
```

Since the files live in `public/`, Vite serves them at the site root. In production, the
build copies them into `dist/` automatically — **no import statements are required.**

---

## Customization Tips

- **Editing content?** Change the JSON directly — no rebuild needed in dev mode.
- **Adding entries?** Follow the existing field names exactly; the apps expect them.
- **Adding a new data file?** Place it in `public/data/` and `fetch()` it with a relative path.
- **Back up first.** These files ship with sensible defaults for the built-in apps.

> **Note:** `news-cache.json` is updated automatically by the News app at runtime. You may
> safely ignore or delete it — it will be recreated when needed.

---

## Related Documentation

- [Features Documentation](./FEATURES.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [Changelog](./CHANGELOG.md)

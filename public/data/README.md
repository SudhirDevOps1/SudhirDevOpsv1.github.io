# SUDHI OS v3.0 - Data Configuration Guide

## 📁 JSON Data Files

All portfolio content can be customized by editing the JSON files in this directory.

### **1. about.json**
Personal information, bio, social links, and professional details.

**Structure:**
```json
{
  "personal": {
    "name": "Your display name",
    "fullName": "Your full legal name",
    "role": "Your job title",
    "tagline": "Your professional tagline",
    "location": "City, Country",
    "email": "your@email.com",
    "phone": "+1234567890",
    "website": "https://yoursite.com",
    "avatar": "/path/to/image.jpg",
    "initials": "YN",
    "status": "Available for Work",
    "statusColor": "green"
  },
  "bio": {
    "short": "One-line bio",
    "long": "Detailed paragraph about you",
    "mission": "Your professional mission statement"
  },
  "stats": {
    "projects": "20+",
    "experience": "3+ Years",
    "coffee": "∞",
    "commits": "5000+",
    "clients": "15+",
    "technologies": "30+"
  },
  "social": {
    "github": { "url": "", "username": "", "icon": "github" },
    "linkedin": { "url": "", "username": "", "icon": "linkedin" }
  }
}
```

### **2. projects.json**
Portfolio projects with details, tech stack, and links.

**Structure:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Project Name",
      "description": "Project description",
      "techStack": ["React", "Node.js"],
      "liveUrl": "https://demo.com",
      "repoUrl": "https://github.com/user/repo",
      "image": "/images/project.jpg",
      "featured": true,
      "category": "Web App"
    }
  ]
}
```

### **3. skills.json**
Skills organized by category with proficiency levels.

**Structure:**
```json
{
  "skills": {
    "languages": [
      { "name": "JavaScript", "level": 95, "icon": "code" }
    ],
    "frameworks": [...],
    "tools": [...],
    "databases": [...]
  }
}
```

### **4. terminal-commands.json**
Custom terminal commands for your OS.

**Structure:**
```json
{
  "customCommands": [
    {
      "command": "mycommand",
      "description": "What this command does",
      "output": "Text to display when run",
      "action": "none"
    }
  ]
}
```

**Supported actions:**
- `"none"` - Just display output
- `"open:windowId"` - Open a specific window
- `"matrix"` - Toggle matrix rain
- `"theme:themeName"` - Change theme

### **5. settings.json**
System-wide configuration.

**Structure:**
```json
{
  "system": {
    "osName": "SUDHI OS",
    "version": "3.0",
    "bootDelay": 300,
    "defaultTheme": "green"
  },
  "features": {
    "matrixRain": true,
    "crtEffect": true,
    "soundEffects": false
  }
}
```

### **6. music-library.json**
Music player playlists and tracks.

**Structure:**
```json
{
  "playlists": [
    {
      "id": "1",
      "name": "Playlist Name",
      "tracks": [
        {
          "id": "t1",
          "title": "Song Title",
          "artist": "Artist Name",
          "duration": "3:45",
          "album": "Album Name"
        }
      ]
    }
  ]
}
```

### **7. browser-bookmarks.json**
Browser bookmarks and browsing history.

**Structure:**
```json
{
  "bookmarks": [
    {
      "id": "1",
      "title": "Site Name",
      "url": "https://example.com",
      "category": "Development",
      "icon": "github"
    }
  ],
  "history": [...]
}
```

### **8. email-messages.json**
Email inbox, sent items, and drafts.

**Structure:**
```json
{
  "inbox": [
    {
      "id": "1",
      "from": "sender@email.com",
      "subject": "Email Subject",
      "preview": "First line preview...",
      "date": "2024-03-14T10:30:00",
      "read": false,
      "starred": true,
      "body": "Full email content..."
    }
  ],
  "sent": [...],
  "drafts": [...]
}
```

### **9. calendar-events.json**
Calendar events and reminders.

**Structure:**
```json
{
  "events": [
    {
      "id": "1",
      "title": "Event Name",
      "date": "2024-03-15",
      "time": "10:00",
      "duration": 60,
      "type": "meeting",
      "description": "Event details",
      "color": "#00FF88"
    }
  ],
  "reminders": [...]
}
```

### **10. games.json**
Game high scores and settings.

**Structure:**
```json
{
  "snake": {
    "highScores": [
      { "score": 450, "date": "2024-03-10", "player": "SUDHI" }
    ],
    "settings": {
      "speed": "medium",
      "gridSize": 20
    }
  },
  "minesweeper": {...},
  "tetris": {...}
}
```

### **11. file-system.json**
Virtual file system structure for File Explorer.

**Structure:**
```json
{
  "folders": {
    "Home": {
      "files": [
        {
          "name": "README.txt",
          "type": "file",
          "icon": "📄",
          "size": "2.4 KB",
          "content": "File contents here"
        }
      ],
      "folders": {
        "Documents": {...}
      }
    }
  }
}
```

### **12. paint-templates.json**
Paint app canvas templates and tools.

**Structure:**
```json
{
  "templates": [
    {
      "id": "1",
      "name": "Template Name",
      "width": 800,
      "height": 600,
      "background": "#FFFFFF"
    }
  ],
  "tools": [...]
}
```

---

## 🎨 Customization Tips

### **Theme Colors**
All accent colors are controlled by CSS variables:
- `--accent` - Main accent color
- `--accent-rgb` - RGB values for transparency

Supported themes: `green`, `blue`, `amber`, `purple`

### **Icons**
You can use:
- Emoji (📁, 🎵, etc.)
- Lucide React icon names
- Custom SVG paths

### **Adding New Terminal Commands**
1. Add to `terminal-commands.json`
2. Use `action` field for special behaviors
3. Commands auto-appear in `help` output

### **Adding New Projects**
1. Add to `projects.json`
2. Include all required fields
3. Use relative paths for images (place in `/public/images/`)
4. Set `featured: true` for homepage showcase

### **File Structure Best Practices**
- Keep JSON files properly formatted
- Use consistent date formats (ISO 8601)
- Validate JSON before deploying
- Backup data files before major changes

---

## 🔧 Advanced Configuration

### **Custom Window Apps**
To add completely new window types, you'll need to:
1. Add entry to `WIN_DEFAULTS` in `App.tsx`
2. Create window component
3. Add to `renderWindowContent` switch case
4. Add desktop icon in `data.ts`

### **Boot Sequence Messages**
Edit `BOOT_MESSAGES` in `data.ts` to customize boot text.

### **Desktop Icons**
Edit `DESKTOP_ICONS` in `data.ts` to add/remove icons.

---

## 📝 Notes

- All dates should use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`
- URLs must include protocol (https://)
- Image paths are relative to `/public/` directory
- File sizes can use KB, MB, GB notation
- Colors support hex codes only (#RRGGBB)

---

## 🚀 Quick Start

1. **Edit `about.json`** - Add your personal info
2. **Edit `projects.json`** - Add your projects
3. **Edit `skills.json`** - List your skills
4. **Customize `terminal-commands.json`** - Add custom commands
5. **Deploy** - All changes auto-load on refresh!

---

## 📦 Data File Status

| File | Status | Required | Auto-loads |
|------|--------|----------|------------|
| about.json | ✅ Active | Yes | Yes |
| projects.json | ✅ Active | Yes | Yes |
| skills.json | ✅ Active | Yes | Yes |
| terminal-commands.json | ✅ Active | No | Yes |
| settings.json | ✅ Active | No | Yes |
| music-library.json | ✅ Created | No | Future |
| browser-bookmarks.json | ✅ Created | No | Future |
| email-messages.json | ✅ Created | No | Future |
| calendar-events.json | ✅ Created | No | Future |
| games.json | ✅ Created | No | Future |
| file-system.json | ✅ Created | No | Future |
| paint-templates.json | ✅ Created | No | Future |

---

**SUDHI OS v3.0** - The Most Complete Virtual Desktop Portfolio

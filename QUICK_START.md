# ⚡ QUICK START GUIDE - SUDHI OS v3.0

## 🚀 **5-Minute Setup**

### **Step 1: Clone & Install**
```bash
git clone <your-repo-url>
cd sudhi-os
npm install
```

### **Step 2: Customize Your Data**
Edit these 3 essential files:

**1. Your Personal Info** (`public/data/about.json`)
```json
{
  "personal": {
    "name": "YOUR NAME",
    "role": "YOUR JOB TITLE",
    "email": "your@email.com"
  }
}
```

**2. Your Projects** (`public/data/projects.json`)
```json
{
  "projects": [
    {
      "name": "Your Project",
      "description": "What it does",
      "techStack": ["React", "Node.js"],
      "liveUrl": "https://demo.com",
      "repoUrl": "https://github.com/you/project"
    }
  ]
}
```

**3. Your Skills** (`public/data/skills.json`)
```json
{
  "skills": {
    "languages": [
      { "name": "JavaScript", "level": 95 }
    ]
  }
}
```

### **Step 3: Run Development Server**
```bash
npm run dev
```

Open `http://localhost:5173`

### **Step 4: Build for Production**
```bash
npm run build
```

Upload `dist/index.html` to any web host!

---

## 🎮 **How to Use the OS**

### **Opening Applications**

**Method 1: Desktop Icons**
- Double-click any icon on the left side

**Method 2: Terminal Commands**
- Double-click "TERMINAL.cmd"
- Type: `open about` or `open projects`

**Method 3: Start Menu**
- Click "START" button (bottom left)
- Click application name

**Method 4: Keyboard Shortcuts**
- `Alt + T` = Terminal
- `Alt + A` = About
- `Alt + P` = Projects

### **Managing Windows**

**Move:**
- Click and drag the title bar

**Resize:**
- Drag from any corner or edge

**Minimize:**
- Click yellow button (●)

**Maximize:**
- Click cyan button (●)
- Or double-click title bar

**Close:**
- Click red button (●)

**Focus:**
- Click anywhere on the window

### **Using the Terminal**

**Common Commands:**
```bash
help              # Show all commands
about             # Your bio
skills            # Skills with progress bars
projects          # Project list
contact           # Contact info
neofetch          # System info (cool!)
theme blue        # Change theme
matrix on         # Enable Matrix rain
clear             # Clear terminal
restart           # Restart OS
```

**Advanced:**
```bash
open music-player # Open music app
calc 25*4         # Calculator
echo Hello        # Print message
history           # Command history
alias ll="ls -la" # Create shortcut
```

### **Changing Themes**

**Via Settings:**
1. Open "SETTINGS.cfg"
2. Click a theme color

**Via Terminal:**
```bash
theme green   # Cyber Green
theme blue    # Neon Blue
theme amber   # Amber
theme purple  # Purple
```

**Via Start Menu:**
1. Click "START"
2. Hover "THEMES"
3. Click a color

---

## 📝 **Customization Checklist**

Use this checklist to personalize your OS:

### **Essential (Do First)**
- [ ] Update `about.json` with your name and bio
- [ ] Add your projects to `projects.json`
- [ ] List your skills in `skills.json`
- [ ] Change contact email in `about.json`
- [ ] Add your GitHub/LinkedIn links

### **Optional (Nice to Have)**
- [ ] Add music playlist to `music-library.json`
- [ ] Set browser bookmarks in `browser-bookmarks.json`
- [ ] Create calendar events in `calendar-events.json`
- [ ] Add custom terminal commands in `terminal-commands.json`
- [ ] Customize settings in `settings.json`

### **Advanced (If Time)**
- [ ] Replace placeholder images
- [ ] Add more projects
- [ ] Create custom terminal commands
- [ ] Modify boot messages in `data.ts`
- [ ] Add Easter eggs

---

## 🎨 **Theme Quick Reference**

| Theme | Accent Color | Best For |
|-------|-------------|----------|
| **Cyber Green** | #00FF88 | Hacker/Matrix aesthetic |
| **Neon Blue** | #00BFFF | Modern/Professional |
| **Amber** | #FFB300 | Retro/Warm feel |
| **Purple** | #BF00FF | Cyberpunk/Vibrant |

---

## ⌨️ **Essential Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `Escape` | Close window |
| `Alt + T` | Terminal |
| `Alt + A` | About |
| `Alt + P` | Projects |
| `Alt + M` | Toggle Matrix |

---

## 🎯 **Common Tasks**

### **Add a New Project**

1. Open `public/data/projects.json`
2. Copy an existing project object
3. Change the details:
   ```json
   {
     "id": 7,
     "name": "My New Project",
     "description": "What it does...",
     "techStack": ["React", "Node.js"],
     "liveUrl": "https://myproject.com",
     "repoUrl": "https://github.com/me/project",
     "image": "/images/project7.jpg",
     "featured": true,
     "category": "Web App"
   }
   ```
4. Save and refresh page

### **Change Default Theme**

Edit `public/data/settings.json`:
```json
{
  "system": {
    "defaultTheme": "blue"
  }
}
```

### **Add Custom Terminal Command**

Edit `public/data/terminal-commands.json`:
```json
{
  "customCommands": [
    {
      "command": "mycommand",
      "description": "What it does",
      "output": "Command output here",
      "action": "none"
    }
  ]
}
```

### **Change OS Name**

Edit `public/data/settings.json`:
```json
{
  "system": {
    "osName": "YOUR_NAME OS",
    "version": "1.0"
  }
}
```

---

## 🐛 **Troubleshooting**

### **Changes Not Showing**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Check console for JSON syntax errors

### **Window Won't Open**
- Check if window is already minimized (look in taskbar)
- Try terminal: `open [app-name]`
- Restart OS: Click START → Restart

### **Terminal Command Not Found**
- Type `help` to see all commands
- Check spelling (case-sensitive)
- Make sure custom commands are in `terminal-commands.json`

### **Build Fails**
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check for JSON syntax errors in data files

---

## 📱 **Mobile View**

On mobile (< 768px width):
- Desktop UI automatically switches to mobile layout
- All content still accessible
- Scrollable sections
- Touch-friendly buttons
- Same data, different presentation

---

## 🚀 **Deployment Quick Guide**

### **Vercel** (Easiest)
```bash
npm run build
npm i -g vercel
vercel
```

### **Netlify**
1. Build: `npm run build`
2. Drag `dist/index.html` to netlify.com/drop

### **GitHub Pages**
1. Build: `npm run build`
2. Copy `dist/index.html` to `docs/`
3. Settings → Pages → Source: docs folder

---

## 💡 **Pro Tips**

1. **JSON Validation**: Use [jsonlint.com](https://jsonlint.com) to check JSON files
2. **Image Paths**: Put images in `public/images/` and reference as `/images/name.jpg`
3. **Terminal History**: Use ↑↓ arrow keys to cycle through commands
4. **Quick Theme Switch**: Type `theme ` and press Tab for autocomplete
5. **Hidden Features**: Try typing random words in terminal for surprises!
6. **Window Snap**: Drag windows near screen edges to snap them
7. **Double-Click Title**: Quick maximize/restore
8. **Matrix Toggle**: Click desktop icon OR terminal `matrix on/off`

---

## 📚 **Learn More**

- **[Complete Features](FEATURES.md)** - All 127+ features listed
- **[What's New](NEW_FEATURES_v3.md)** - v3.0 additions
- **[Data Guide](public/data/README.md)** - JSON file documentation
- **[Main README](README.md)** - Full project documentation

---

## ✅ **Ready to Deploy?**

Before going live:

- [ ] Updated all personal data
- [ ] Added real projects
- [ ] Tested all windows
- [ ] Tried terminal commands
- [ ] Checked mobile view
- [ ] Picked favorite theme
- [ ] Built with `npm run build`
- [ ] Tested built file locally
- [ ] Deployed to hosting
- [ ] Shared with the world! 🎉

---

## 🎉 **You're All Set!**

Your SUDHI OS portfolio is ready to impress!

**Next Steps:**
1. ✨ Finish customizing data
2. 🚀 Deploy to the web
3. 📢 Share on social media
4. 💼 Add to resume/LinkedIn
5. 🌟 Watch the job offers roll in!

---

**Need Help?**
- Check [FEATURES.md](FEATURES.md) for complete documentation
- Review [data/README.md](public/data/README.md) for JSON structure
- Read terminal `help` command output
- Experiment and have fun!

**Happy Coding!** 🚀

---

<div align="center">

**SUDHI OS v3.0**

*From zero to deployed in 5 minutes*

</div>

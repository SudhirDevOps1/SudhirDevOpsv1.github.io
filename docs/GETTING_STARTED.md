# Getting Started

Welcome to **SUDHI OS v4**. This guide covers everything you need to develop, build, and deploy the project locally.

---

## Prerequisites

| Requirement | Version | Notes |
| ----------- | ------- | ----- |
| **Node.js** | 20+ | LTS recommended |
| **pnpm** | 11+ | See [Package Manager](#package-manager) below |
| **Browser** | Modern (Chrome, Edge, Firefox, Safari) | `node:` shim requires an ES-module-capable build toolchain |
| **Git** | Any recent version | For cloning and deployment |

### Why pnpm?

This project has migrated from npm to **pnpm**:

- Up to **3× faster** installs
- Strict dependency resolution (no phantom dependencies)
- A single `pnpm-lock.yaml` replaces `package-lock.json`
- Built-in `pnpm dlx` for one-off tool execution
- Lower disk usage via a global content-addressable store

> **Note:** `package-lock.json` was removed when the project migrated to pnpm. Do not commit
> npm lock files back into the repository.

---

## Quick Setup

```bash
# 1. Clone the repository
git clone https://github.com/SudhirDevOpsv1/SudhirDevOpsv1.github.io.git
cd SudhirDevOpsv1.github.io

# 2. Install pnpm (skip if already installed)
corepack enable
corepack prepare pnpm@latest --activate

# 3. Install dependencies
pnpm install

# 4. Start the dev server
pnpm run dev
```

The app will be available at **http://localhost:5173**.

---

## Available Commands

| Command              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `pnpm run dev`       | Start the Vite dev server with instant HMR              |
| `pnpm run build`     | Type-check (strict mode) and build for production       |
| `pnpm run preview`   | Preview the production build locally                    |
| `pnpm run typecheck` | Run `tsc --noEmit` only (no build)                      |

> **pnpm does not execute arbitrary package scripts by default** (unlike npm). Always invoke
> them through `pnpm run <script>`.

### About the build

`pnpm run build` runs the strict TypeScript compiler first (`tsc --noEmit`) and fails on any type error, then builds with Vite. If you only want to produce a bundle quickly (for example while iterating), use `pnpm exec vite build`.

The output is a **single self-contained `dist/index.html`** (via `vite-plugin-singlefile`) —
ideal for GitHub Pages and offline use.

---

## Project Structure

```
├── index.html                Entry point
├── src/
│   ├── main.ts               Boot, menu wiring, notifications
│   ├── os.ts                 Core OS state
│   ├── desktop.ts            Desktop, icons, wallpaper, selection
│   ├── window.ts             Window manager
│   ├── shell.ts              Taskbar, Start menu, Quick Settings, widgets
│   ├── data.ts               Icons, themes, wallpapers
│   └── windows/
│       ├── apps.ts           All 32 application entry points
│       └── components/       Individual app/window components
├── public/
│   ├── data/                 JSON data files for applications
│   └── img/                  Wallpapers
├── docs/                     Documentation
├── package.json              Dependencies and scripts
├── pnpm-workspace.yaml       pnpm workspace & build-permission config
├── tsconfig.json             TypeScript configuration
└── vite.config.ts            Vite build configuration
```

---

## Configuration

### TypeScript

`tsconfig.json` uses **strict mode** with `noUnusedLocals` and `noUnusedParameters` enabled.
These settings catch real bugs at the cost of occasional TS6133 "declared but never read" noise
during rapid prototyping.

To suppress a specific warning during development, prefix the variable with an underscore:

```ts
function render(_unusedParam: string) { /* ... */ }
```

### Vite

`vite.config.ts` bundles everything into a single file:

```ts
export default defineConfig({
  plugins: [
    typescript({ /* strict TS transform */ }),
    tailwindcss(),
    singlefile({ /* inlines JS + CSS into index.html */ }),
  ],
});
```

To revert to a normal multi-file build, remove the `singlefile()` plugin.

### pnpm build permissions

Recent pnpm versions require an explicit allow-list before a dependency may run install
scripts. This repository declares it in `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  esbuild: true
```

> If `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`, do not switch back to npm —
> the fix is this `allowBuilds` map.

---

## Customization

### Themes

- Add new themes in `src/data.ts` (CSS variable arrays).
- Add a matching wallpaper (solid or image) in `public/img/`.
- Register the new entries so they appear in the **Customization** panel.

### Applications

- Create a new file in `src/windows/components/` (or add a section in `apps.ts`).
- Register the app in the app registry in `src/windows/apps.ts`.
- Add an icon and title in `src/data.ts`.
- A desktop icon will then appear automatically.

---

## Deployment

### GitHub Pages (this project)

This repository is pre-configured for GitHub Pages:

1. Push the `main` branch.
2. In **Settings → Pages**, set **Source: GitHub Actions**.
3. The included workflow builds with pnpm and publishes `dist/`.

Because the build produces a single `index.html`, **no special base-path handling is needed.**

### Other static hosts

Build with `pnpm run build` and upload the `dist/` directory to any static host.

---

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| `ERR_PNPM_IGNORED_BUILDS` | Ensure `pnpm-workspace.yaml` contains the `allowBuilds` map (see Configuration). |
| TypeScript errors about unused variables | Prefix them with `_` or remove them — strict mode enforces `noUnusedLocals`. |
| `npm run` fails after migration | Use `pnpm run <script>` instead; npm lock files are no longer supported. |
| Changes not appearing in the browser | Restart `pnpm run dev` (HMR resets on file moves); hard-refresh with `Ctrl+Shift+R`. |
| Build fails on type-check | Run `pnpm run typecheck` to see the exact TS errors before rebuilding. |
| Blank page after deploy | Ensure GitHub Pages source is set to **GitHub Actions** and the workflow succeeded. |
| pnpm command not found | Run `corepack enable && corepack prepare pnpm@latest --activate`. |

---

## Useful Links

- [Features Documentation](./FEATURES.md)
- [Data Configuration Guide](./DATA_CONFIG.md)
- [Changelog](./CHANGELOG.md)
- [Repository](https://github.com/SudhirDevOpsv1/SudhirDevOpsv1.github.io)

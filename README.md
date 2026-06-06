# Satyverse(Satyam Parmar)

> 90-day structured learning platform: Java Fresher → Senior Engineer

## Overview

**Satyverse(Satyam Parmar)** is a fully static SPA (Single Page Application) for mastering Java from absolute beginner through to Senior/Staff Engineer interview readiness. No backend required — deploy as a static site (e.g. **Cloudflare Pages** or GitHub Pages).

## Features

- **90 Days of Content** across 10 phases
- **Three Learning Tracks**: Fresher (Days 1–27), Mid-Level (Days 28–58), Senior (Days 59–90)
- **Rich Lesson Format**: Why → Theory → Code → Diagram → Pitfalls → Exercise → Interview → Cheatsheet
- **Flashcard Quiz Mode** with "Got it / Review later" tracking
- **Visual Roadmap** of all 90 days
- **Progress Tracking** with streak system, phase progress, and export/import
- **Full-Text Search** (Ctrl+K) across all lessons
- **Scenario interview drill** (`/scenarios`) — scenario questions per day; manifest in `public/data/scenarioDrill.json` and bundles in `public/data/days/scenarioDrill-day*.json` (authoring notes: [`public/data/SCENARIO_INTERVIEW_DEPTH_PROMPT.md`](public/data/SCENARIO_INTERVIEW_DEPTH_PROMPT.md))
- **Bookmarks** and notes per lesson
- **Dark/Light mode**
- **Keyboard shortcuts** for power users

## Tech Stack

- React 18 + TypeScript + Vite 6
- Material UI v5 + Emotion
- React Router v6 (HashRouter — GitHub Pages compatible)
- Zustand + persist middleware
- Recharts for analytics
- highlight.js (atom-one-dark) for code syntax
- PlantUML for architecture diagrams
- marked.js for markdown rendering

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) (Vite **base** is `/` for the custom domain **https://satyamparmar.blog**. The app display name is **Satyverse(Satyam Parmar)** in the UI.)

## Build & Deploy

```bash
npm run build
```

Output is written to **`dist/`**.

### GitHub Pages — [satyamparmar-dev/satyamparmar](https://github.com/satyamparmar-dev/satyamparmar) → [satyamparmar.blog](https://satyamparmar.blog)

This repo is configured to replace the blog in **`satyamparmar-dev/satyamparmar`** and deploy to the existing custom domain.

**What is already in the repo:**

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | Builds `dist/` and deploys on push to `main` |
| `public/CNAME` | Custom domain `satyamparmar.blog` |
| `public/.nojekyll` | Disable Jekyll on GitHub Pages |
| `vite.config.ts` `base: '/'` | Asset paths for apex custom domain |
| `HashRouter` in `App.tsx` | Client routes as `https://satyamparmar.blog/#/dashboard` (no SPA 404 hacks) |

**One-time GitHub setup** (if not already done):

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions
2. **Settings → Pages → Custom domain:** `satyamparmar.blog` + **Enforce HTTPS**
3. **Settings → Secrets and variables → Actions → Secrets:**

   | Secret | Required | Purpose |
   |--------|----------|---------|
   | `VITE_STORAGE_SECRET` | Recommended | Encrypted localStorage (progress, auth) |
   | `VITE_APP_SECRET` | Optional | Auth password hashing |
   | `VITE_ALLOWLIST_CRYPTO_SECRET` | Optional | Allowlist bundle encryption |

**Deploy:**

```bash
git remote add satyamparmar https://github.com/satyamparmar-dev/satyamparmar.git   # once
git push satyamparmar main
```

Or push this folder as the new contents of `main` on that repo. The **Deploy to GitHub Pages** workflow runs automatically; check the **Actions** tab.

**Live URLs after deploy:**

- `https://satyamparmar.blog/`
- `https://satyamparmar.blog/#/dashboard`
- Fallback: `https://satyamparmar-dev.github.io/satyamparmar/`

The app uses **HashRouter** (`#/…` URLs) so deep links work on static hosting without a `404.html` fallback.

### Cloudflare Pages (recommended for private repo + free hosting)

Use this to deploy from a **private** GitHub repo without paying for GitHub Pro Pages.

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize **GitHub** and select this repository (**Java-preparation-app**).
3. Configure the build:

   | Setting | Value |
   |---------|--------|
   | **Framework preset** | None (or Vite) |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | `/` (repo root) |
   | **Deploy command** | *(leave empty)* for standard Pages (recommended). If you use **`npx wrangler deploy`**, this repo’s **`wrangler.jsonc`** must include **`assets.directory`: `dist`** (already set) so Wrangler can upload the Vite output.

4. **Environment variables** (optional but recommended): add **`NODE_VERSION`** = **`20`** so the build matches `.nvmrc` / `package.json` engines.
5. Save and deploy. Cloudflare will run **`npm ci`** (or install) then your build command.

After the first deploy, your site will be on a **`*.pages.dev`** URL. You can add a **custom domain** under the project’s **Custom domains**.

**Notes**

- **HashRouter** means routes look like `https://yoursite.pages.dev/#/…` — no `SPA` rewrite file is required.
- **GitHub Actions** (`.github/workflows/deploy.yml`) deploys to **satyamparmar.blog** on push to `main`.
- This repo includes **`.nvmrc`** (`20`) and **`engines.node`** in `package.json` to align local and CI builds.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `← →` | Navigate between days |
| `M` | Mark day complete |
| `B` | Toggle bookmark |
| `Ctrl+K` | Open search |
| `Q` | Open quiz (from lesson) |

## Content Structure

```
public/data/
├── curriculum.json     # Phase/track metadata
├── phase1.json         # Days 1–9:  Java Foundations
├── phase2.json         # Days 10–18: OOP & Core APIs
├── phase3.json         # Days 19–27: DSA
├── phase4.json         # Days 28–37: Java Advanced & Java 17+
├── phase5.json         # Days 38–48: Spring Ecosystem
├── phase6.json         # Days 49–58: REST & Microservices
├── phase7.json         # Days 59–67: Kafka & Messaging
├── phase8.json         # Days 68–76: Cloud, Databases & DevOps
├── phase9.json         # Days 77–84: Architecture & System Design
└── phase10.json        # Days 85–90: Testing, Performance & Mocks
```

## License

MIT

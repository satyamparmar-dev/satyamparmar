# Satyverse(Satyam Parmar)

> 90-day structured learning platform: Java Fresher → Senior Engineer

## Overview

**Satyverse(Satyam Parmar)** is a fully static SPA (Single Page Application) for mastering Java from absolute beginner through to Senior/Staff Engineer interview readiness. No backend required — deploy directly to GitHub Pages.

## Features

- **90 Days of Content** across 10 phases
- **Three Learning Tracks**: Fresher (Days 1–27), Mid-Level (Days 28–58), Senior (Days 59–90)
- **Rich Lesson Format**: Why → Theory → Code → Diagram → Pitfalls → Exercise → Interview → Cheatsheet
- **Flashcard Quiz Mode** with "Got it / Review later" tracking
- **Visual Roadmap** of all 90 days
- **Progress Tracking** with streak system, phase progress, and export/import
- **Full-Text Search** (Ctrl+K) across all lessons
- **Scenario interview drill** (`/scenarios`) — scenario questions with answers, signals, and follow-ups per day; data in `public/data/scenarioDrill.json` (see [`scripts/SCENARIO_DRILL.md`](scripts/SCENARIO_DRILL.md))
- **Bookmarks** and notes per lesson
- **Dark/Light mode**
- **Keyboard shortcuts** for power users

## Tech Stack

- React 18 + TypeScript + Vite
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

Open [http://localhost:5173/](http://localhost:5173/) (Vite **base** is relative (`./`) so the same build works locally and on GitHub Pages under any repo name. The app display name is **Satyverse(Satyam Parmar)** in the UI.)

## Build & Deploy

```bash
npm run build
```

Output is written to **`dist/`**.

### GitHub Pages (one-time setup)

1. Push this repo to GitHub (any repository name works).
2. In the repo: **Settings → Pages → Build and deployment**.
3. Under **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. Push to **`main`** (or run **Actions → Deploy to GitHub Pages → Run workflow**). The workflow builds with `npm run build` and publishes **`dist/`**.
5. After the first successful run, the site URL is **`https://<username>.github.io/<repository>/`** (or your custom domain if configured).

The app uses **HashRouter** (`#/…` URLs) and a **relative Vite base**, so client-side routes and `public/data/` JSON load correctly on project Pages without extra `404.html` tricks. **`public/.nojekyll`** disables Jekyll so static assets are served as-is.

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

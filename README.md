# DotNetForge

An interactive micro-learning **PWA** that teaches modern C# / .NET software
engineering — *"Duolingo meets the .NET docs"*. Concepts are broken into
bite-sized lessons with runnable code sandboxes, knowledge checks, drag-and-drop
design-pattern games, and a **Capstone Lab Hub** of guided, portfolio-ready
projects.

> Curriculum content is about C#/.NET. The application itself is a
> Next.js/React + Express + PostgreSQL stack.

---

## 1. Features

| Area | What ships |
| --- | --- |
| **4 domain tracks** | Modern C# Essentials & OOP · ASP.NET Core Web API · EF Core · Blazor & Architecture |
| **16 lessons** | Readable prose, syntax-highlighted code, WSL/CLI terminal guides, knowledge checks |
| **Capstone Lab Hub** | 4 guided projects (13 steps) with tools, WSL setup commands, and code deliverables |
| **Interactive sandbox** | In-browser C# editor with syntax validation + "Explain & Refactor" assistant |
| **Pattern game** | Match Factory / Singleton / Repository / Decorator patterns to implementations |
| **Progress tracking** | Per-lesson and per-capstone-step progress persisted per user |
| **Auth** | JWT register/login, cross-device progress syncing |
| **PWA** | `manifest.webmanifest` + service worker + icons; installable on a Galaxy home screen |
| **Mobile-first** | 48px touch targets, dark mode, horizontally scrollable code blocks |

---

## 2. Architecture

```
project/
├── docker-compose.yml       # PostgreSQL 16 (auto-runs schema + seed on first boot)
├── database/
│   ├── schema.sql           # Tables + indexes
│   └── seed.sql             # Tracks, modules, lessons, quizzes, capstones, patterns
├── backend/                 # Express REST API (ESM)
│   └── src/
│       ├── server.js
│       ├── db/pool.js       # pg pool + transaction helper
│       ├── middleware/      # auth (JWT), errors (RFC-7807 shape)
│       └── routes/          # content, auth, progress, assist
└── frontend/                # Next.js 14 App Router + Tailwind
    └── src/
        ├── app/             # landing, dashboard, tracks, lessons, capstones, login
        ├── components/      # CodeBlock, CodeSandbox, Quiz, PatternGame, TerminalGuide, …
        └── lib/             # api client, auth, syntax highlighter
```

**Data flow:** the browser talks only to the Next.js origin. Next rewrites
`/api/:path*` to the Express backend (`API_PROXY_TARGET`, default
`http://localhost:4000`), so there is no CORS in the browser and credentials stay
same-origin.

---

## 3. Prerequisites

* **Node.js ≥ 20** (developed on Node 24) and npm
* **Docker** (Engine or Desktop) — used only to run PostgreSQL
* Optional: `psql`, `DBeaver`, or Azure Data Studio to inspect the DB

No .NET SDK is required to run the platform. Learners use the WSL/CLI guides and
their own .NET SDK for the capstone projects.

---

## 4. Quick start

```bash
# 1. Start PostgreSQL (schema + seed load automatically on first boot)
npm run db:up

# 2. Install workspace dependencies (backend + frontend)
npm install

# 3. Run both apps
npm run dev:backend     # API  → http://localhost:4000
npm run dev:frontend    # Web  → http://localhost:3000
```

Open <http://localhost:3000> and click **Try the demo account**.

### Demo credentials

```
email:    demo@dotnetforge.dev
password: forge1234
```

> The demo user is seeded for local development only.

### Useful scripts

```bash
npm run db:down     # stop the database (keeps data)
npm run db:reset    # wipe the volume and re-seed from scratch
npm run build       # production build for both workspaces
npm test            # backend integration tests (needs the DB running)
```

If the database volume already exists from an older seed, run `npm run db:reset`
so the init scripts re-run.

---

## 5. Environment variables

| Variable | Default | Used by |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://dotnetforge:dotnetforge@localhost:5432/dotnetforge` | backend |
| `JWT_SECRET` | dev fallback | backend (token signing) |
| `PORT` | `4000` | backend |
| `API_PROXY_TARGET` | `http://localhost:4000` | frontend (Next rewrite) |

Create `backend/.env` to override. Do not commit real secrets — use the
platform's secret manager in deployment.

---

## 6. API reference

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Liveness + DB check |
| GET | `/api/tracks` | – | All tracks with lesson counts |
| GET | `/api/tracks/:slug` | – | Track with modules + lessons |
| GET | `/api/lessons/:id` | – | Lesson body, snippets, quiz |
| POST | `/api/lessons/:id/answer` | – | Grade a quiz answer |
| GET | `/api/capstones` | – | Capstone projects list |
| GET | `/api/capstones/:slug` | – | Project with ordered steps |
| POST | `/api/auth/register` | – | Create account → JWT |
| POST | `/api/auth/login` | – | Authenticate → JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/progress` | JWT | Progress summary |
| POST | `/api/progress/lessons/:id` | JWT | Set lesson status (`completed`) |
| POST | `/api/progress/capstone-steps/:id` | JWT | Toggle a step's completion |
| POST | `/api/assist/explain` | – | Idiomatic-C# suggestions for a snippet |

Errors use an RFC-7807-style JSON body:
`{ type, title, status, detail }`.

---

## 7. Data model

`users` · `tracks` · `modules` · `lessons` · `code_snippets` ·
`quiz_questions` · `capstone_projects` · `capstone_steps` · `design_patterns` ·
`lesson_progress` · `capstone_progress`

Seeded content: **5 tracks · 14 modules · 16 lessons · 4 capstone projects
(13 steps) · 6 design patterns · 16 quiz questions.**

---

## 8. PWA

`frontend/public/manifest.webmanifest`, `sw.js`, and `icons/icon-192|512.png`
make the app installable. The service worker uses a **network-first** strategy
for `/api/*` (fresh progress) and **cache-first** for static assets. On a Galaxy
S24/S25 Ultra: open the site in Chrome → *Add to Home screen*.

---

## 9. Capstone Lab Hub

Four guided projects, each with tools, WSL/CLI steps, and code deliverables:

1. **Secure Enterprise E-Commerce REST API** — Minimal API + EF Core, JWT, RBAC.
2. **Real-Time Interactive Dashboard** — Blazor + SignalR.
3. **Clean Architecture Microservice** — CQRS + MediatR + FluentValidation + Docker.
4. **Distributed Caching & Message Queue Worker** — Redis + RabbitMQ + MassTransit.

Progress through each step is saved to your account and restored on any device.

---

## 10. Testing & CI

`backend/test/api.test.js` spins up the real Express app against a live
PostgreSQL database (no mocks) and exercises content, quiz grading, auth,
progress, capstone steps, and error shapes.

```bash
npm run db:up     # tests need a live, seeded database
npm test
```

CI (`.github/workflows/ci.yml`) runs on every push and pull request: it starts
PostgreSQL 16, loads `schema.sql` + `seed.sql`, runs the backend suite, and
builds the frontend.

## 11. Deployment

Ready-to-use production setups are included:

- **`docker-compose.prod.yml`** — full stack (Postgres + API + web) on one host.
- **`backend/Dockerfile`**, **`frontend/Dockerfile`** — non-root, health-checked images.
- **`render.yaml`** — Render blueprint for the API + database.
- **`docs/DEPLOY.md`** — step-by-step guide for a VPS, Vercel/Netlify + Render, or any container host.

Quick start on a Docker host:

```bash
POSTGRES_PASSWORD=$(openssl rand -hex 24) JWT_SECRET=$(openssl rand -hex 32) \
  docker compose -f docker-compose.prod.yml up -d --build
```

Production drops the seeded demo account via `database/init/03-prod-hardening.sql`.

## 12. Roadmap / notes

* The **"Explain & Refactor"** assistant currently runs a deterministic,
  dependency-free rule engine so it works offline. It is isolated behind
  `POST /api/assist/explain`; swap the implementation for an LLM call to upgrade
  it without touching the UI.
* The in-browser sandbox performs structural/syntax validation, not full
  compilation — capstone steps direct learners to compile in WSL with the .NET SDK.

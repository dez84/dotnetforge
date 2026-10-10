# Deploying DotNetForge

The app is three pieces: a **PostgreSQL** database, an **Express API**, and a
**Next.js web** frontend. The web app calls the API through a same-origin
`/api/*` rewrite, so the browser never needs CORS or a separate API URL.

Pick one of the three options below.

---

## Option A — Single VPS / Docker host (simplest, everything in one place)

Requires Docker Engine + Docker Compose on the host.

```bash
git clone https://github.com/dez84/dotnetforge.git
cd dotnetforge

# Generate strong secrets.
export POSTGRES_PASSWORD="$(openssl rand -hex 24)"
export JWT_SECRET="$(openssl rand -hex 32)"

docker compose -f docker-compose.prod.yml up -d --build

# Verify
curl -sf http://localhost:3000/api/health    # {"status":"ok","db":"up"}
```

The web app is now on port `3000` (override with `WEB_PORT`). The database and
API are **not** published to the host — the API is reached only by the web
container over the internal network.

Put a TLS reverse proxy in front. Example **Caddy** (`/etc/caddy/Caddyfile`):

```
forge.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

Notes:
- First boot seeds the curriculum. `03-prod-hardening.sql` removes the demo
  account so production never starts with known credentials.
- To change the schema later, update `database/schema.sql` and re-seed with
  `docker compose -f docker-compose.prod.yml down -v && ... up -d --build`
  (destroys data) — or add a migrations tool for zero-downtime changes.

---

## Option B — Vercel (web) + Render (API + DB)

Best when you want managed hosting and free tiers.

### 1. API + database on Render (Blueprint)

`render.yaml` in the repo root defines the web service and a free Postgres. With
the [Render CLI](https://render.com/docs/cli) or the dashboard:

1. Render → **New → Blueprint** → pick this repo.
2. Render provisions `dotnetforge-db` (Postgres) and `dotnetforge-api`
   (Docker, health check `/api/health`), and wires `DATABASE_URL` automatically.
3. `JWT_SECRET` is auto-generated.
4. Load the schema/seed into the managed DB once (Render Shell or
   `psql "$DATABASE_URL" -f database/schema.sql && psql "$DATABASE_URL" -f database/seed.sql`).

Note the API URL, e.g. `https://dotnetforge-api.onrender.com`.

> Free Render Postgres expires after ~30 days — fine for testing, use a paid
> instance (or external Postgres such as Neon/Supabase) for anything long-lived.

### 2. Web on Vercel

The Next.js rewrite already proxies `/api/*` to whatever `API_PROXY_TARGET`
points at — no extra config needed.

```bash
npm i -g vercel
cd frontend
vercel link            # create/link the project
# Point the proxy at the Render API:
vercel env add API_PROXY_TARGET production   # value: https://dotnetforge-api.onrender.com
vercel --prod
```

Important: set `API_PROXY_TARGET` **before** deploying, because the rewrite is
baked in at build time. Project settings for reference:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Env var | `API_PROXY_TARGET = https://<your-api-host>` |

Database scaffolding is the same as Option A (schema + seed), run once against
the managed Postgres.

---

## Option C — Any container host (Fly.io, Railway, Cloud Run, ECS…)

Both images are standard:

```bash
docker build -f backend/Dockerfile  -t dotnetforge-api .
docker build -f frontend/Dockerfile --build-arg API_PROXY_TARGET=https://api.example.com -t dotnetforge-web .
```

- **API service:** run `dotnetforge-api`, set `DATABASE_URL` and `JWT_SECRET`,
  expose port `4000`, health check `GET /api/health`.
- **Web service:** run `dotnetforge-web`, expose port `3000`, health check
  `GET /`.
- **Database:** any PostgreSQL 16; load `database/schema.sql` then
  `database/seed.sql` once.

---

## Environment variables

| Variable | Service | Required | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | api | yes | `postgres://user:pass@host:5432/db` |
| `JWT_SECRET` | api | yes | long random string; rotate to invalidate tokens |
| `PORT` | api | no | defaults to `4000` |
| `API_PROXY_TARGET` | web | yes in prod | API base URL, **baked at build time** |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | db (compose) | yes | only for Option A |
| `WEB_PORT` | web (compose) | no | host port for the web container, default `3000` |

Never commit real secrets. `.env.example` shows the local dev values.

---

## Post-deploy checklist

- [ ] `GET /api/health` returns `{"status":"ok","db":"up"}`
- [ ] Landing page, `/dashboard`, `/capstones` load over HTTPS
- [ ] Register a new account → progress persists after logout/login
- [ ] Service worker registers (installable PWA)
- [ ] TLS terminates in front (Caddy/nginx or platform edge)
- [ ] `JWT_SECRET` is strong and stored in the platform's secret manager

---

## Not included (deliberately)

- **The "Explain & Refactor" assistant** still uses the offline rule engine.
  Wiring a hosted LLM is a separate change requiring a provider + API key.
- **Automated DB migrations** — the project seeds from plain SQL. Add a
  migration tool before you need zero-downtime schema changes.

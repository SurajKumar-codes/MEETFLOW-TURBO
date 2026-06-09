# MeetFlow Turbo

MeetFlow is a Turborepo monorepo for scheduling and joining video meetings.

## Apps and packages

- `apps/web`: Next.js frontend (`http://localhost:3002`)
- `apps/http-backend`: Express backend (`http://localhost:3001`)
- `packages/db`: Prisma schema + generated client
- `packages/ui`: shared UI components
- `packages/eslint-config`: shared lint config
- `packages/typescript-config`: shared TypeScript config

## Prerequisites

- Node.js 18+
- pnpm 9+
- A PostgreSQL connection string (local or hosted)
- Stream credentials (API key + secret)
- Google OAuth credentials for NextAuth

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create env files from examples:

```bash
cp apps/http-backend/.env.example apps/http-backend/.env
cp apps/web/.env.local.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
```

PowerShell alternative:

```powershell
Copy-Item apps/http-backend/.env.example apps/http-backend/.env
Copy-Item apps/web/.env.local.example apps/web/.env.local
Copy-Item packages/db/.env.example packages/db/.env
```

3. Fill in your real values:

- `apps/http-backend/.env`
	- `STREAM_API_KEY`
	- `STREAM_SECRET_KEY`
	- `BACKEND_JWT_SECRET` (must match the web app's value)
	- `CLIENT_ORIGINS` (optional, defaults to `http://localhost:3000,http://localhost:3002`)
- `apps/web/.env.local`
	- `NEXT_PUBLIC_STREAM_API_KEY`
	- `NEXT_PUBLIC_API_URL`
	- `NEXTAUTH_URL`
	- `NEXTAUTH_SECRET`
	- `GOOGLE_CLIENT_ID`
	- `GOOGLE_CLIENT_SECRET`
	- `BACKEND_JWT_SECRET` (must match the backend's value)

> **Auth model:** the web app authenticates the user with NextAuth, then mints a
> short-lived JWT (signed with `BACKEND_JWT_SECRET`) via `/api/backend-token`.
> The browser sends that JWT to the Express backend, which verifies the
> signature before trusting the user id. The two services must share the same
> `BACKEND_JWT_SECRET`.
- `packages/db/.env`
	- `DATABASE_URL`

4. Apply Prisma migrations (first run):

```bash
pnpm --filter @repo/db exec prisma migrate deploy
pnpm --filter @repo/db exec prisma generate
```

## Development

Start all apps and packages:

```bash
pnpm dev
```

## Useful scripts

- `pnpm dev`: run dev mode across workspace
- `pnpm build`: build all packages/apps
- `pnpm lint`: run lint checks
- `pnpm check-types`: run type checking
- `pnpm format`: format TS/TSX/MD files

## Deploy on Render

This repo ships a `render.yaml` [Blueprint](https://render.com/docs/blueprint-spec)
that provisions a PostgreSQL database, the Express backend, and the Next.js
frontend in one go.

### 1. Create the Blueprint

1. Push this repo to GitHub.
2. In the Render dashboard: **New → Blueprint**, pick the repo. Render reads
   `render.yaml` and creates `meetflow-db`, `meetflow-backend`, and `meetflow-web`.

### 2. Fill in the secret env vars

The blueprint wires `DATABASE_URL` (from the DB) and generates `NEXTAUTH_SECRET`
automatically. The rest are marked `sync: false` and must be set by hand in each
service's **Environment** tab:

**meetflow-backend**
- `STREAM_API_KEY`
- `STREAM_SECRET_KEY`
- `CLIENT_ORIGINS` → the frontend URL, e.g. `https://meetflow-web.onrender.com`

(`BACKEND_JWT_SECRET` is generated automatically on the backend and copied to the
web service by the blueprint — no manual entry needed.)

**meetflow-web**
- `NEXTAUTH_URL` → this service's URL, e.g. `https://meetflow-web.onrender.com`
- `NEXT_PUBLIC_API_URL` → the backend URL, e.g. `https://meetflow-backend.onrender.com`
- `NEXT_PUBLIC_STREAM_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

> **Important:** `NEXT_PUBLIC_*` values are inlined into the frontend at **build
> time**. After setting them the first time, trigger a **Manual Deploy → Clear
> build cache & deploy** on `meetflow-web` so they get baked into the bundle.

### 3. Update Google OAuth

In the Google Cloud console, add the production callback to the OAuth client:

- Authorized origin: `https://meetflow-web.onrender.com`
- Redirect URI: `https://meetflow-web.onrender.com/api/auth/callback/google`

### 4. Migrations

Prisma migrations run automatically during the backend build
(`prisma migrate deploy`), so the schema is applied on every deploy.

### Notes on the free plan

- Free Render services spin down when idle and cold-start on the next request.
- The backend reads `process.env.PORT` (injected by Render); the frontend uses
  `next start`, which does the same.
- Node is pinned to 24 (`.node-version` / `NODE_VERSION`) — the backend relies on
  Node's native TypeScript support to load the shared `@repo/db` package at runtime.

## Notes

- Keep real secrets only in local `.env` files.
- Commit only `*.example` env files.

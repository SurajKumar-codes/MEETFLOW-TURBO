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
	- `CLIENT_ORIGINS` (optional, defaults to `http://localhost:3000,http://localhost:3002`)
- `apps/web/.env.local`
	- `NEXT_PUBLIC_STREAM_API_KEY`
	- `NEXT_PUBLIC_API_URL`
	- `NEXTAUTH_URL`
	- `NEXTAUTH_SECRET`
	- `GOOGLE_CLIENT_ID`
	- `GOOGLE_CLIENT_SECRET`
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

## Notes

- Keep real secrets only in local `.env` files.
- Commit only `*.example` env files.

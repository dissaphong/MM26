# MM26 — Tennis & Padel Tournament Platform

A Next.js + Prisma + Auth.js scaffold for a tournament organization platform. This first slice covers:

- Public home page with a list of open tournaments
- Sign up (with children) and login flows
- Authenticated dashboard
- Tournament page (Overview tab) and a register-for-singles flow
- Doubles registration with mutual partner-ID confirmation (auto-matches when both sides assign each other)

## Prerequisites

- Node.js 20+
- Postgres 14+ running locally (or via Docker)

### Easiest Postgres setup (Docker)

```bash
docker run --name mm26-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```

Then create the database:

```bash
docker exec -it mm26-postgres psql -U postgres -c "CREATE DATABASE mm26;"
```

## Install and run

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and generate an AUTH_SECRET
cp .env.example .env
# then open .env and replace AUTH_SECRET with the output of:
openssl rand -base64 32

# 3. Initialize the database
npm run db:migrate -- --name init

# 4. Seed demo data
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000

## Demo accounts

After seeding:

- `alex@example.com` / `password123` — a player with one child (Mia)
- `organizer@example.com` / `password123` — organizes the demo tournaments

## What's in this slice

- `src/app/page.tsx` — Home (guest)
- `src/app/login/page.tsx` — Login (form page; doubles as the modal target)
- `src/app/signup/page.tsx` — Sign up, with optional child rows
- `src/app/dashboard/page.tsx` — Authenticated dashboard
- `src/app/profile/page.tsx` — Read-only profile + children + logout
- `src/app/t/[slug]/page.tsx` — Tournament page (Overview tab); the Register button works for singles and doubles
- `src/app/api/signup/route.ts` — Account creation (generates unique player IDs)
- `src/app/api/draws/[id]/register/route.ts` — Registration endpoint (handles doubles partner matching)
- `prisma/schema.prisma` — Data model
- `prisma/seed.ts` — Demo data

## Emails

Confirmation emails are wired up for:

- Account creation (welcome + your new player ID)
- Singles registration (confirmed or waitlist)
- Doubles registration (pending → invite sent to partner → mutual confirmation when both match)

By default emails are pretty-printed to the terminal — no setup required. To see them in a real inbox-style UI, run Mailpit:

```bash
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Then add to `.env`:

```
SMTP_HOST="localhost"
SMTP_PORT="1025"
```

Open http://localhost:8025 to view sent emails.

## Deploying to production

See [`DEPLOY.md`](./DEPLOY.md) for a step-by-step guide to ship to Vercel + Neon + Resend.

## What's not built yet

- Draws tab, Players tab, Schedule tab on the public Tournament page
- Tournament admin pages (Settings/Players/Draws/Results/News)
- Bracket generation, results entry
- Email verification, password reset, OAuth
- Platform Admin role + admin panel

These map directly onto the `requirements.md` and can be added incrementally on top of this foundation.

## Useful commands

```bash
npm run db:studio   # browse the database in Prisma Studio
npm run db:reset    # wipe and re-migrate the database
npm run db:seed     # re-seed demo data
```
# MM26

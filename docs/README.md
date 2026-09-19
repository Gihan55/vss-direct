# VSS — Vehicle Sourcing & Selling Platform

> A direct, peer-to-peer used-vehicle marketplace for the Sri Lankan market built
> around a single hard policy: **No Open Papers**. Every listing is either
> 100% direct-owner verified or rejected by an admin before it can be bought.

VSS is a dependency-light **React 18 + Vite single-page app**. It ships in two
interchangeable data modes that share one component tree:

- **Offline demo mode** (default) — the whole catalogue, bids, telemetry and
  session live in the browser's `localStorage`. No backend, no keys, runs
  anywhere. Great for demos and development.
- **Shared database mode** — point the app at a Supabase (Postgres) project and
  the exact same screens read/write real rows with server-enforced Row Level
  Security, database triggers for anti-snipe + counters, and Live realtime
  updates across every connected browser.

Mode selection is a single gate (`dbEnabled`) driven by environment variables —
see [SETUP.md](./SETUP.md).

---

## Documentation map

| Document | What it covers |
| --- | --- |
| [SETUP.md](./SETUP.md) | Prerequisites, install, running the dev server, `.env` config, offline vs Supabase mode, seeding, build & preview, verification scripts |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend structure, state model, the dual data-mode design, component responsibilities, data flow, styling system |
| [SUPABASE.md](./SUPABASE.md) | Full backend data model: tables, RLS policies, triggers, RPC, realtime, the camelCase↔snake_case mapping |
| [QA-REPORT.md](./QA-REPORT.md) | Results of the full-system QA sweep — every defect found, how it was fixed, and the verification evidence |

## Product at a glance

**Three roles, one app.**

- **Buyer** — browses a live catalogue of auction and direct-sale vehicles,
  filters by make/body/listing type, opens a detail modal, watches a live auction
  countdown, places quick or custom bids, models a loan, and reviews the
  legal "no open papers" pledge. Registration plates are privacy-masked by
  default.
- **Seller** — a 5-step listing wizard (vehicle → specs → pricing/tier →
  documents → review) that submits into the admin moderation queue.
- **Admin** — a moderation console: verification queue, live activity radar,
  a split audit desk, revenue summary, and platform telemetry. Approves or
  rejects listings; rejects increment a fraud-stopped counter.

**Monetisation & trust surfaces** are woven through the UI: partner/financing
ad slots, listing-boost tiers in the seller wizard, and trust pillars on the
buyer landing page.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 18 (function components + hooks) |
| Build tool | Vite 5 (`@vitejs/plugin-react`) |
| Styling | Hand-authored CSS design system (`src/index.css`) with `:root` design tokens. **No Tailwind, no CSS-in-JS, no UI component library.** |
| Icons | `lucide-react` |
| Celebration | `canvas-confetti` (winning-bid effect) |
| Backend (optional) | Supabase (`@supabase/supabase-js`) — Postgres + Auth + Realtime |
| Persistence (offline) | Browser `localStorage` |

## Repository layout

```
VSS/
├─ index.html               # Vite entry HTML
├─ package.json             # scripts: dev / build / preview / render-check
├─ vite.config.js           # dev server on :3002, strictPort
├─ .env / .env.example      # optional Supabase config
├─ scripts/
│  ├─ vss-render-check.mjs  # headless SSR render smoke test (exit 0 == healthy)
│  └─ __react-bridge.mjs    # helper that re-exports the app's React for the harness
└─ src/
   ├─ main.jsx              # React root + <AppProvider>
   ├─ App.jsx               # role router + modals + toasts + footer
   ├─ index.css             # the entire design system
   ├─ context/AppContext.jsx# single source of app state + all actions
   ├─ data/seedData.js      # factory catalogue, telemetry + sponsor seed
   ├─ components/           # 11 UI components (+ admin/AdminDashboard)
   └─ lib/
      ├─ supabase.js        # dbEnabled gate + lazy client factory
      ├─ db.js              # camelCase↔snake_case mapping + queries
      ├─ schema.sql         # full Postgres schema (run once in Supabase)
      └─ seed.mjs           # CLI seeder for the shared database
```

## Quick start

```powershell
cd VSS
npm install
npm run dev        # http://localhost:3002  (offline demo mode)
```

To run against a shared Supabase backend instead, add a `.env` with a project
URL + anon key and run the schema/seed — full steps in [SETUP.md](./SETUP.md).

To check your changes before shipping:

```powershell
npm run build          # production compile
npm run render-check   # headless render smoke test (exit 0 == healthy)
```

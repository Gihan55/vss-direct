# VSS — Vehicle Sourcing & Selling Platform

A dependency-light **React 18 + Vite** marketplace for direct, peer-to-peer used
vehicles built on a strict **No Open Papers** policy. Runs fully offline against
the browser (demo mode) or against a shared **Supabase** backend — same UI, one
env-var toggle.

## Run it

```powershell
npm install
npm run dev        # http://localhost:3002
```

## Check it

```powershell
npm run build          # production compile
npm run render-check   # headless render smoke test (exit 0 == healthy)
```

## Learn it

Full documentation lives in [`docs/`](./docs/README.md):

- [docs/README.md](./docs/README.md) — overview & documentation map
- [docs/SETUP.md](./docs/SETUP.md) — install, env config, offline vs Supabase, seeding
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — state model, dual data mode, components, styling
- [docs/SUPABASE.md](./docs/SUPABASE.md) — data model, RLS, triggers, realtime
- [docs/QA-REPORT.md](./docs/QA-REPORT.md) — full QA sweep: defects, fixes, verification

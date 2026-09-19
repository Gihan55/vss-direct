# Setup & Configuration

## Prerequisites

- **Node.js 18+** (developed and verified on Node 22). `npm` ships with it.
- A modern browser for the offline demo.
- *(Only for shared-database mode)* A [Supabase](https://supabase.com) project.

## Install

```powershell
cd VSS
npm install
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server on **http://localhost:3002** (see port note below). Hot reload. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally. |
| `npm run render-check` | Headless server-render smoke test. Prints a summary and **exits non-zero if the app throws during render**. Run before committing UI/state changes. |

### Dev-server port

`vite.config.js` pins the dev server to **port 3002 with `strictPort: true`**.
This is deliberate — it is the workspace's slot for VSS (`3000` = DPR, `3001` =
HRIS API, `5173` = HRIS frontend). `strictPort` means VSS will **fail loudly**
if 3002 is already taken instead of silently drifting onto another project's
port. If you see `Port 3002 is already in use`, either a VSS instance is
already running (just open http://localhost:3002) or you need to free the port.

## Choosing a data mode

VSS has two interchangeable backends behind one code path. The choice is made
**entirely by environment variables** — no code changes.

### Mode A — Offline demo (default)

Leave `.env` empty (or don't create one). The app loads the factory seed from
`src/data/seedData.js` and persists every change to `localStorage`. Nothing
else is required.

Demo identities (offline) accept these credentials:

| Role | Email | Password |
| --- | --- | --- |
| **Super User** | `super@vss.auto` | `Super@123` |
| Admin | `admin@vss.auto` | `admin` |
| Seller | `seller@direct.com` | `seller` |
| Buyer | `buyer@clean.com` | `buyer` |

### Access-control flow (offline + Supabase)

Signing in is required to bid or sell, and accounts are **not** self-activated:

1. A visitor browses as a guest and submits a **Request Access** form
   (name, email, phone, password, buyer/seller role).
2. The request lands in the admin console (**Access & Users** tab) as
   *pending*.
3. An administrator **approves** it — the account is activated and the user
   can then sign in to bid (buyer) or list vehicles (seller). Rejected
   requesters stay locked out, and anyone can check their request status by
   email from the login modal's *Track Your Access Request* box.
4. The **Super User** additionally can create accounts directly from the same
   tab (name/email/phone/password/role), bypassing the review queue.

Offline, accounts and requests persist to `localStorage`
(`vss_accounts`, `vss_registration_requests`). Login validates the email
against active accounts only — unknown emails are pointed at the request flow
instead of being auto-logged-in.

To wipe the offline state and restore the pristine seed, use the **"Reset demo
data"** button in the app footer (clears the saved listings/bids/telemetry).

### Mode B — Shared Supabase database

1. **Create a Supabase project** and open the SQL editor.

2. **Apply the schema.** Paste and run the entire contents of
   [`src/lib/schema.sql`](../src/lib/schema.sql). It creates the `profiles`,
   `listings`, `bids`, `telemetry`, and `registration_requests` tables, the
   auth/profile trigger (self-signups start **pending**), the profile guard
   that blocks self role/status escalation, the bid/anti-snipe/telemetry
   triggers, the `increment_views` RPC, all Row Level Security policies (bids
   and listings are restricted to **approved** accounts), and the realtime
   publication. It is safe to re-run.

3. **Configure the client env.** Copy `.env.example` to `.env` and fill in
   values from *Dashboard → Project Settings → API*:

   ```ini
   # VSS/.env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...        # the PUBLIC anon key, not service_role
   ```

   As soon as **both** are present, `dbEnabled` becomes `true` and the app
   switches to the shared database + real auth. If either is empty, it falls
   back to offline mode. Vite treats a missing or empty value as falsy, so an
   empty `.env` file is equivalent to none.

4. **Seed the shared data** (optional but recommended for the demo logins and a
   populated catalogue). This uses the **service-role key**, which bypasses RLS,
   so it is a server-side CLI step only — **never** put this key in `.env` or
   the browser.

   ```powershell
   $env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."   # service_role, NOT anon
   node src/lib/seed.mjs
   ```

   `seed.mjs` creates the demo auth users — including the **super user**
   (`super@vss.auto`, role `super_admin`) — and marks every seeded profile
   `approved` so they can sign in immediately. It then loads the seed catalogue
   with historical bids and installs the single telemetry row. The demo
   password defaults to `demo1234` (override with `VSS_DEMO_PASSWORD`; it must
   match `DEMO_DB_PASSWORD` in `src/context/AppContext.jsx`).

   In DB mode, new users self-register through **Request Access**: their auth
   account is created immediately but its profile stays `pending`, so sign-in
   is blocked until an admin approves the request in the **Access & Users**
   tab (which flips `profiles.status` to `approved`). Server-side, RLS only
   lets approved accounts place bids or create listings, so the gate holds
   even outside the UI.

5. `npm run dev` and sign in with one of the seeded accounts.

## Environment variable reference

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env` (browser) | Supabase project URL. Presence (with anon key) enables DB mode. |
| `VITE_SUPABASE_ANON_KEY` | `.env` (browser) | Public anon key used by the browser client. |
| `SUPABASE_URL` | shell (seed CLI) | Project URL for `seed.mjs`. Falls back to `VITE_SUPABASE_URL` if set. |
| `SUPABASE_SERVICE_ROLE_KEY` | shell (seed CLI) | Service-role key — **server only, never in the browser/repo**. |
| `VSS_DEMO_PASSWORD` | shell (seed CLI) | Password for the seeded demo accounts (default `demo1234`). Must match `DEMO_DB_PASSWORD`. |

## Security notes

- **Only the anon key belongs in the browser.** It is safe to expose *because*
  RLS enforces every access rule server-side; the client cannot read or write
  beyond what the policies allow. The service-role key bypasses RLS entirely
  and must never be shipped to a client or committed.
- **Roles are not client-forgeable in DB mode.** Admin status lives in the
  `profiles.role` column and is checked by `is_admin()` inside RLS policies.
  Users are promoted only via SQL / the seed script. In DB mode the UI hides
  the demo role-switcher and one-click logins precisely so a signed-in account's
  role can't be changed from the browser.
- **`.env` must not be committed.** It is git-ignored; `.env.example` is the
  checked-in template.

## Building for production

```powershell
npm run build      # emits static assets to dist/
npm run preview    # sanity-serve the production bundle locally
```

The output is a fully static SPA — deploy `dist/` to any static host (or a CDN).
If you deploy to a host that doesn't read the workspace `.env` at build time,
provide `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as build-time environment
variables so the bundle bakes in DB mode; otherwise it builds in offline mode.

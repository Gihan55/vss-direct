# Architecture

This document describes how the VSS front end is put together: the render
entry, the single state container, the dual data-mode design, each component's
job, and the styling system. The backend (Supabase) data model lives in
[SUPABASE.md](./SUPABASE.md).

## High-level shape

```
main.jsx
  └─ <AppProvider>            (context/AppContext.jsx — ALL shared state + actions)
       └─ <App/>              (App.jsx — role router + modal host + toasts + footer)
            ├─ <Header/>
            ├─ role === buyer  → <HeroBanner/> <TrustPillars/> <MarketplaceGrid/>
            ├─ role === seller → <SellerStudio/>
            ├─ role === admin  → <AdminDashboard/>
            ├─ <VehicleDetailModal/>  (renders when selectedVehicle is set)
            ├─ <LegalPledgeModal/>    (renders when isPledgeModalOpen)
            ├─ <LoanCalculatorModal/> (renders when isLoanModalOpen)
            ├─ <LoginModal/>          (renders when isLoginModalOpen)
            └─ toast layer (maps toasts[])
```

State lives in **one place**. There is no router library and no client-side
state manager (Redux/Zustand): `AppContext` is the single store, and `App.jsx`
switches the visible surface on `currentRole`. Modals are not routes — they are
always-mounted components that render `null` unless their open-flag is set.

## The state container — `context/AppContext.jsx`

`AppProvider` owns every piece of shared state and exposes it through `useApp()`.
This keeps the ~12 presentational components dumb: they read what they need and
call an action.

**State slices**

| Slice | Purpose |
| --- | --- |
| `vehicles` | The full catalogue (auction + direct listings). The DB is the source of truth in DB mode; `localStorage`/seed otherwise. |
| `telemetry` | Aggregate platform stats (live visitors, traffic-by-day, fraud counts, top searches). Initialised to `INITIAL_TELEMETRY` in **both** modes so no consumer ever sees `null`. |
| `sponsorAds` | Static partner/financing ad cards (monetisation slots). |
| `currentUser` / `currentRole` | Session identity and the active role that drives the router. |
| `selectedVehicle` | The listing shown in the detail modal (`null` = closed). |
| `isLoanModalOpen` / `isPledgeModalOpen` / `isLoginModalOpen` | Modal visibility flags. |
| `adminActiveTab` | Which admin console tab is showing. |
| `toasts` | Transient notification queue. |
| `searchQuery` / `selectedMake` / `selectedBodyType` / `selectedListingType` / `onlyVerified` | Marketplace filter state. |

**Actions exposed** (all reachable via `useApp()`):

- Auth: `login`, `loginAsRole`, `logout`, `register`, `resetDemoData`
- Catalogue: `addVehicle`, `placeBid`, `approveVehicle`, `rejectVehicle`,
  `flagMiddleman`, `togglePlateMasking`, `trackView`
- UI: `setSelectedVehicle`, `setIsLoanModalOpen`, `setIsPledgeModalOpen`,
  `setIsLoginModalOpen`, `setCurrentRole`, `setAdminActiveTab`, `addToast`,
  and the filter setters
- Flags/constants: `dbEnabled`, `currentUser`, `DEMO_USERS`

## Dual data-mode design

The whole app branches on exactly one boolean: **`dbEnabled`**
(from `lib/supabase.js`), true only when both `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` resolve to non-empty values.

```
                 ┌──────────────────────────────────────────┐
   dbEnabled     │  false (offline)        true (Supabase)  │
   ──────────────┼──────────────────────────────────────────┤
   initial data  │  seed / localStorage    fetchVehicles()  │
   reads         │  (synchronous)          (+ Realtime)     │
   writes        │  setState + persist     await api.*()    │
   auth          │  decorative (role       signInWith       │
   model         │  from email substring)  Password + RLS   │
   live sync     │  none                   postgres_changes │
   telemetry     │  decorative ticker      trigger-owned    │
   └──────────────────────────────────────────┘
```

Key design rule: **components never know which mode they're in.** `AppContext`
normalises both paths to the *same* camelCase vehicle object shape, so the 12
consumer components are identical across modes. `lib/db.js` performs the
camelCase↔snake_case mapping and rebuilds the `bids` array so a DB row looks
exactly like a seed object to the UI.

**Offline persistence & hardening.** Three effects mirror `vehicles`,
`telemetry`, and `currentUser` back to `localStorage` (only when `!dbEnabled`).
Reads go through `readStored(key, isValid)`, which `try/catches` the parse AND
shape-checks the result — a hand-edited, `null`, or quota-truncated entry is
discarded and the seed is used instead of crashing the render tree.

**DB-mode realtime.** One subscription (`channel 'vss-shared'`) listens to
`postgres_changes` on `listings`, `bids`, and `telemetry`. Listing/bid changes
schedule a **debounced per-listing refresh** (120 ms) that re-reads the row with
embedded bids — so `currentBid`, `bidCount`, and the server-computed anti-snipe
extension always reflect backend truth rather than an optimistic client guess.
Telemetry updates merge straight in (guarded by `if (payload.new?.data)`).

### Purity rule for state updaters

In React StrictMode, state-updater functions run **twice**. Anything with a side
effect (a toast, `confetti()`, a network call) placed *inside* a `setVehicles`
updater would fire twice. Offline `placeBid` and `togglePlateMasking` were
therefore refactored to a **compute-then-commit** shape: resolve the target and
validate *before* calling the setter, keep the updater a pure map, and run side
effects outside it. This is a load-bearing convention — see [QA-REPORT.md](./QA-REPORT.md).

## Component responsibilities

| Component | Role | Notes |
| --- | --- | --- |
| `Header.jsx` | Sticky nav, brand, search entry, account menu, demo role-switcher | Role-switcher is gated behind `!dbEnabled` (real roles come from auth). |
| `HeroBanner.jsx` | Buyer landing hero + live "featured" card + headline stats | Static/decorative live-visitor ticker (offline only). |
| `TrustPillars.jsx` | 4-up trust cards (no open papers, verification, privacy, savings) | |
| `MarketplaceGrid.jsx` | Filter bar + results grid + sponsor/monetisation ad row | Reads filter state + `vehicles`; guards `v.verification?.status`. |
| `VehicleCard.jsx` | One listing tile | Defensive aliases for cover image, price, fuel/transmission, mileage, verification, savings — a partial row can't whiten the grid. |
| `VehicleDetailModal.jsx` | Gallery + plate-privacy demo + bidding console + verification sheet | All hooks hoisted above the `!selectedVehicle` guard (Rules of Hooks). `role="dialog"`. Uses `.detail-main-grid`. |
| `LoanCalculatorModal.jsx` | Finance modelling (EMI) | `.loan-calc-grid` split. |
| `LegalPledgeModal.jsx` | "No open papers" explainer | `.pledge-grid` two-column compare. |
| `LoginModal.jsx` | Sign in / register | One-click demo logins + hint gated behind `!dbEnabled`. |
| `SellerStudio.jsx` | 5-step listing wizard | `num()` NaN-safe coercion + year/price validation before `addVehicle`. |
| `admin/AdminDashboard.jsx` | Verification queue, live radar, split audit desk, revenue grid, telemetry | Guards every `veh.seller?.*` / `veh.verification?.*` access; telemetry read defensively. |

## Data flow examples

**Placing a bid (buyer):**
`VehicleDetailModal` → `placeBid(vehicleId, amount)` in `AppContext` →
- *DB mode:* `await api.insertBid(...)` → server trigger updates listing +
  telemetry → Realtime echoes the change → debounced `refreshListing` → grid &
  modal re-render with server truth.
- *Offline:* compute-then-commit pure updater bumps `currentBid`/`bidCount`,
  then side effects (`confetti`, `addToast`) run **outside** the updater.

**Publishing a listing (seller):**
`SellerStudio` wizard → validate/coerce → `addVehicle(data)` →
- *DB mode:* `insertListing` forces `status='pending_verification'` (the client
  cannot self-approve) → it appears in the admin queue via Realtime.
- *Offline:* prepended to `vehicles`, persisted to `localStorage`.

**Moderating (admin):** `approveVehicle` / `rejectVehicle` / `flagMiddleman`
patch the listing status. A DB-mode reject fires the `after_listing_change`
trigger, which bumps the fraud-stopped telemetry counter.

## Styling system — `index.css`

A single hand-authored design system (~1430 lines). No utility framework.

- **Tokens** (`:root`): colour (`--bg-*`, `--accent-cyan/gold/green/red/purple`,
  `--text-*`), elevation (`--shadow-*`), `--radius-*`, `--transition`, and the
  Inter/Outfit font stacks. Aesthetics are "Luxury Automotive Dark Mode +
  Glassmorphism".
- **Composition**: semantic class blocks per surface (`.glass-panel`,
  `.top-header`, `.hero-*`, `.vehicle-card`, `.modal-*`, `.bidding-console-*`,
  `.admin-*`, `.wizard-*`, `.form-*`, `.toast-*`).
- **Responsive**: `grid`/`flex` layouts collapse at **1024px** and **640px**
  breakpoints. Multi-column grids are defined as classes (e.g.
  `.detail-main-grid`, `.sponsor-ads-grid`, `.revenue-grid`, `.loan-calc-grid`,
  `.pledge-grid`) precisely so they can participate in those media queries —
  an inline `style={{ gridTemplateColumns }}` cannot.
- **Accessibility & chrome polish**: global `:focus-visible` ring, custom
  thin scrollbars (WebKit + Firefox), `::selection` colour, shared `:active`
  / `:disabled` button states, and a `prefers-reduced-motion` block that
  neutralises animation/transition for users who ask for it.

Where a value is reused it should be a token; where a layout must be
responsive it must be a class, not an inline style. That is the boundary the
last UI pass enforced.

## Build & verification

- `npm run build` compiles with Vite and proves the module graph is valid.
- `npm run render-check` (`scripts/vss-render-check.mjs`) boots Vite's SSR
  pipeline, stubs the minimal browser globals that `useState` initializers
  touch, and server-renders the full tree. Because it runs the render path, it
  catches the class of bug a compile cannot — conditional-hook crashes,
  null dereferences on partial data, NaN blow-ups — exiting non-zero on failure.

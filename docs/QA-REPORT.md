# QA Report — Full-System Sweep

**Scope:** VSS front end (all 12 components + `AppContext` + `db.js` + `index.css`)
and the Supabase data path.
**Method:** full read of every component, targeted correctness fixes, a UI/
accessibility/responsive modernisation pass, then compile + headless-render +
live-dev-server verification.
**Outcome:** all findings below are **fixed** and re-verified green.

---

## 1. Correctness defects (fixed)

### 1.1 Rules-of-Hooks violation in `VehicleDetailModal` — CRITICAL
**Symptom:** a `useEffect` (auction countdown) sat *after* the early return
`if (!selectedVehicle) return null`. Opening then closing the detail modal
changed the number of hooks rendered between passes → React throws
"Rendered fewer hooks than expected" and the modal (and often the tree) crashes.

**Fix:** hoisted **all** hooks above the guard; the guard is now the last thing
before the return. The countdown effect early-returns internally instead of the
component early-returning before the hook. Added a gallery-reset effect keyed on
`selectedVehicle?.id`. Rewrote the top of the file with a safe-alias layer
(see 1.2).

**Why the build didn't catch it:** this is a render-time violation, invisible to
a compile — exactly why the render harness (§3) exists.

### 1.2 Unguarded nested access on partial listings — HIGH
**Symptom:** `db.js`'s `rowToVehicle` only sets `verification`/`seller`/`specs`
when the row carries them, so a listing created without a blob arrives with
those keys `undefined`. Components read `v.verification.status`,
`veh.seller.name`, `selectedVehicle.images.map(...)`, etc. unconditionally →
`Cannot read properties of undefined` and a blank screen for that tile/modal.

**Fix — defensive aliases + optional chaining:**
- `VehicleDetailModal`: local `images = selectedVehicle.images || []`,
  `bids = ... || []`, `verification = ... || {}`, `seller = ... || {}`,
  `currentBid = ... || 0`; every downstream read uses the alias.
- `MarketplaceGrid`: `v.verification?.status`.
- `VehicleCard`: guarded cover image, transmission/fuel word split, price,
  mileage, verification and savings.
- `AdminDashboard`: guarded every `veh.seller?.*` and `veh.verification?.*` in
  the verification queue, live radar and split audit desk.

### 1.3 `NaN` coercion in the seller wizard — HIGH
**Symptom:** `SellerStudio` passed raw form strings into numeric fields
(`year`, `mileage`, `startingPrice`, `reservePrice`, `buyNowPrice`,
`currentBid`). A blank/garbage input became `NaN`, which then rendered as `NaN`
prices and poisoned downstream arithmetic.

**Fix:** added `num(v, fallback)` (`Number.isFinite` guard) and coerced every
numeric before `addVehicle`; added validation that the year is within
`1900..currentYear+1` and prices are `> 0` (with a blocking `alert + return`).

### 1.4 Impure state updaters (StrictMode double-invoke) — MEDIUM
**Symptom:** the offline `placeBid` performed validation, `confetti()` and
`addToast()` *inside* the `setVehicles` updater. React StrictMode intentionally
runs updater functions twice, so a winning bid could double-fire confetti/toasts
(or run validation against an already-mutated draft). `togglePlateMasking` had a
similar shape.

**Fix:** refactored both to **compute-then-commit** — resolve the target and run
side effects *outside* the setter; the updater is now a pure `.map`. The DB path
already delegated to server triggers.

### 1.5 Unsafe numeric on `viewsCount` / offline id collision — LOW
- `trackView` offline incremented `v.viewsCount + 1` without a default; now
  `(v.viewsCount || 0) + 1`.
- The offline `addVehicle` id generator was widened to base36 + random suffix to
  avoid same-millisecond collisions.

### 1.6 Telemetry availability in DB mode — MEDIUM
**Symptom:** in DB mode `telemetry` could start `null` before the first fetch,
and `Header`/`AdminDashboard` read telemetry fields during the first render.

**Fix:** `telemetry` is initialised to `INITIAL_TELEMETRY` in **both** modes, so
it is never null; the realtime telemetry handler is guarded with
`if (payload.new?.data)` before `setTelemetry`.

---

## 2. Security / UX gating (fixed)

**Demo affordances were visible in shared-DB mode.** The header role-switcher,
the login modal's one-click demo logins, its quick credential hint, and the
seller wizard's "View in Admin" test button let a user *appear* to forge a role.
Real enforcement was always RLS, but the UI was misleading and invited attempts
to switch to admin in a live deployment.

**Fix:** pulled `dbEnabled` into `Header`, `LoginModal` and `SellerStudio` and
gated each demo affordance behind `!dbEnabled`. In DB mode the role comes solely
from the authenticated profile; the offline demo keeps all conveniences. The
login modal's "Forgot password?" hint was made context-aware.

*(Known caveat, unchanged by design: the **offline** login remains decorative —
it infers a role from the email substring and accepts empty passwords. That is
the documented demo escape hatch and only exists when no backend is configured.)*

---

## 3. UI / accessibility / responsive modernisation

`index.css` was already a mature tokenised design system, so this was a
consistency + accessibility + responsiveness pass, not a reskin.

**New/required classes** (referenced from JSX during §1, now defined):
- `.detail-main-grid` — gallery + bidding console (`1.2fr / 0.8fr`), **stacks to
  one column ≤ 1024px** (was an inline non-responsive grid).
- `.plate-toggle-btn` — the privacy plate reveal toggle.
- `.sponsor-ads-grid` — `repeat(auto-fit, minmax(280px, 1fr))`; the old inline
  `minmax(400px, …)` overflowed narrow screens.

**Responsive conversions of fixed inline grids** to classes so they can hit media
queries: `.revenue-grid` (was hardcoded `repeat(4, 1fr)` → 2-up at 1024, 1-up at
640), `.loan-calc-grid`, `.pledge-grid` (both stack ≤ 1024px).

**Global polish added:**
- `:focus-visible` keyboard focus ring (accessible, doesn't show on mouse click).
- `::selection` colour and thin custom scrollbars (WebKit + Firefox).
- Shared `:active` (press) and `:disabled` (dimmed, `cursor: not-allowed`) states
  across all `.btn-*` families.
- `@media (prefers-reduced-motion: reduce)` disabling animations/transitions.

---

## 4. Verification evidence

All three checks were run after the fixes and are **green**.

### 4.1 Production build (`npm run build`)
```
✓ 1651 modules transformed.
dist/index.html                 1.43 kB │ gzip:   0.74 kB
dist/assets/index-*.css        23.11 kB │ gzip:   5.16 kB
dist/assets/index-*.js        540.11 kB │ gzip: 145.37 kB
✓ built in 14.45s
```
No errors. Only the informational >500 kB chunk hint (single-bundle SPA).

### 4.2 Headless render smoke test (`npm run render-check`)
```
[render:default] OK — 50039 chars
[seed] 7 listings available for render.
VSS render check PASSED.        (exit code 0)
```
The `VehicleDetailModal` hooks-order and null-deref classes of bug (§1.1/§1.2)
are precisely what this catches that the compiler cannot; it now renders a
populated 50 KB tree.

### 4.3 Live dev-server probe (port 3002)
```
GET /            -> 200   (root div + /src/main.jsx present)
GET /src/App.jsx -> 200   transformError = false
GET /src/index.css   -> 200   transformError = false
GET /src/components/VehicleDetailModal.jsx -> 200  transformError = false
GET /src/context/AppContext.jsx            -> 200  transformError = false
```
Every edited module transforms cleanly through Vite (a CSS/JSX syntax break would
return a 500 / transform-error payload). The rewritten design system serves at
~32.9 KB transformed.

---

## 5. Notes & recommendations

- **Chunk size:** the single JS chunk is ~540 kB raw / 145 kB gz (Supabase +
  confetti + icons + React). If first paint matters later, code-split the Supabase
  path and lazy-load modals via `React.lazy`. Not done here to keep behaviour
  identical.
- **Keep updaters pure:** any new side effect added to `AppContext` must live
  *outside* `setState` updaters (StrictMode). The `render-check` script should be
  re-run in CI to keep the hooks-order guarantee.
- **Offline login** is demo-only by design (see §2 caveat); never rely on it for
  a real deployment — use DB mode where RLS + `profiles.role` are authoritative.

# Supabase Backend — Data Model & Security

VSS uses Supabase (Postgres + Auth + Realtime) **only** when `dbEnabled` is
true. The authoritative schema is
[`src/lib/schema.sql`](../src/lib/schema.sql); this document explains it, the
security model around it, and how the browser maps to it via
[`src/lib/db.js`](../src/lib/db.js).

Apply it by running the whole `schema.sql` in the Supabase SQL editor. Re-run
is safe (`if not exists` / `create or replace` / guarded `do $$` blocks).

## Entity overview

```
auth.users  ──1:1──▶  profiles ──1:N──▶  listings ──1:N──▶  bids
                          │                  │
                     (role, owner)      (verification /
                          │              seller / specs  = jsonb,
                          ▼              images = text[])
                     telemetry (single shared jsonb row, id = 1)
```

## Tables

### `profiles`
One row per auth user. Holds the app role and display fields.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | FK → `auth.users(id)` `on delete cascade`. |
| `email` / `name` / `phone` / `badge` / `avatar` | text | Display data. |
| `role` | text | `check (role in ('admin','seller','buyer'))`, default `buyer`. **Authoritative role.** |
| `created_at` | timestamptz | default `now()`. |

A `handle_new_user()` trigger (`SECURITY DEFINER`) auto-creates a profile on
signup, seeding `role`/`name`/`phone` from signup metadata (role defaults to
`buyer`). Admins are promoted **in SQL / by the seeder**, never by the client.

### `listings`
The vehicle catalogue. Flat columns for scalars + JSONB for nested blobs.

| Group | Columns |
| --- | --- |
| Identity | `id` (**text PK**), `title`, `make`, `model`, `year`, `location` |
| Spec | `body_type`, `transmission`, `fuel_type`, `mileage`, `engine_cc`, `exterior_color`, `interior_color` |
| Commerce | `listing_type` (`'auction'`/`'direct'`), `starting_price`, `reserve_price`, `buy_now_price`, `direct_price`, `current_bid`, `bid_count`, `views_count`, `auction_end_at`, `is_reserve_met`, `featured`, `savings_vs_middleman` |
| Moderation | `status` (default `'pending_verification'`), `license_plate`, `is_plate_masked` |
| Nested | `verification` jsonb, `seller` jsonb, `specs` jsonb, `images text[]` |
| Ownership | `owner_id` uuid FK → `profiles(id)` `on delete set null`, `created_at` |

`id` is `text` (not uuid) so the human-friendly seed ids (`veh-001`) and
generated offline ids both fit without a server default.

### `bids`
One row per bid — a normalised, queryable history (not a JSONB blob).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()`. |
| `listing_id` | text FK → `listings(id)` | `on delete cascade`. |
| `bidder_id` | uuid FK → `profiles(id)` | `on delete set null`; null for historical seed bids. |
| `bidder_name` | text | Display label. |
| `amount` | numeric | |
| `placed_at` | timestamptz | default `now()`. |

Index: `bids (listing_id, placed_at desc)` for newest-first fetches.

### `telemetry`
A **single shared row** (`id = 1`, `check (id = 1)`) of aggregate stats stored as
`data jsonb` (live visitors, `trafficByDay`, `topSearches`,
`openPapersRejectedCount`, …). Written only by triggers / the seeder; read by
everyone.

## Row Level Security

RLS is **the** enforcement layer — ownership and admin checks live here, never
in the browser. All four tables have RLS enabled.

| Table | Policy | Effect |
| --- | --- | --- |
| profiles | read `true` | anyone can view a profile |
| profiles | insert / update own | `auth.uid() = id` |
| listings | read `true` | public browsing |
| listings | insert | `auth.uid() = owner_id` (can only create your own) |
| listings | update / delete | `auth.uid() = owner_id OR is_admin()` |
| bids | read `true` | public bid history |
| bids | insert | `auth.uid() = bidder_id` (can only bid as yourself) |
| telemetry | read `true` | public stats; **no client write policy** |

`is_admin()` is a `SECURITY DEFINER` `STABLE` function that reads
`profiles.role` for `auth.uid()` without recursing through profiles' own RLS.

The `listings_read` policy is intentionally open (public marketplace browsing).
The seeder gives the demo seller ownership of genuine listings but leaves the
flagged-broker entry **ownerless** so a normal user cannot "fix" it — only an
admin can.

## Server-side logic (triggers & RPC)

**`after_bid_insert()`** (trigger on `bids` INSERT, `SECURITY DEFINER`) is the
heart of auction integrity. On every bid it:

1. Sets `current_bid = greatest(current_bid, new.amount)` and increments
   `bid_count`.
2. Recomputes `is_reserve_met` (true when there is no reserve, or the bid meets
   it).
3. **Anti-sniping soft-close** — if an auction would end in under 2 minutes, the
   deadline is pushed to `now() + 3 minutes`. Because this is a trigger, the rule
   holds for *every* client and cannot be bypassed from the browser.
4. Bumps today's `bidsPlaced` inside the shared `telemetry.data` JSONB.

**`after_listing_change()`** (trigger on `listings` UPDATE) increments
`telemetry.data.openPapersRejectedCount` whenever a listing transitions to
`'rejected'` — the "fraud stopped" counter the admin console shows.

**`increment_views(p_listing_id)`** — a `SECURITY DEFINER` RPC the client calls
on open. Being a single atomic `UPDATE ... = views_count + 1`, it is race-safe
and avoids exposing a broad UPDATE policy on `listings`.

`SECURITY DEFINER` is used deliberately on these functions so they can write
`telemetry`/`listings` counters that no direct user policy would allow — the
function body is the trusted gate, and none of them accept privileged
parameters from the caller beyond what's needed.

## Realtime

`listings` and `bids` are set to `REPLICA IDENTITY FULL` (so UPDATE/DELETE
payloads carry the whole row) and added to the `supabase_realtime` publication
(guarded so re-running is a no-op). `telemetry` is published too. The browser
subscribes on channel `vss-shared` and merges events — see the realtime section
of [ARCHITECTURE.md](./ARCHITECTURE.md).

## The camelCase ↔ snake_case mapping (`lib/db.js`)

The app speaks camelCase; Postgres speaks snake_case. `db.js` keeps that
translation in one place so the 12 consumer components never change between
modes.

- `LISTING_COLUMNS` maps each app key to a column; `COLUMN_TO_APP` is the
  reverse. `JSONB_FIELDS = [verification, seller, specs]`,
  `ARRAY_FIELDS = [images]`.
- `rowToVehicle(row)` rebuilds the app object: copies flat columns, lifts the
  JSONB blobs **only if present**, defaults `images`/`bids` to `[]`, rounds
  numeric money fields, and sorts embedded bids newest-first (top bid =
  `isWinning`). Relative `time` labels ("14 mins ago") are derived from
  `placed_at`.
- `vehicleToRow(data, { ownerId })` builds an insert/update row, forcing
  `status='pending_verification'` on inserts.
- Queries: `fetchVehicles` (`select('*, bids(*)')`), `fetchTelemetry`,
  `insertListing`, `updateListing`, `insertBid`, `incrementViews`.

Because `rowToVehicle` only sets `verification`/`seller`/`specs` when present in
the row, a listing created without one of those blobs arrives at the UI as
`undefined` — which is exactly why the components guard those accesses (see
[QA-REPORT.md](./QA-REPORT.md)).

## Seeding (`src/lib/seed.mjs`)

A server CLI run with the **service-role key** (bypasses RLS). It upserts the
three demo auth users (re-setting their password to `DEMO_PASSWORD`, default
`demo1234`), overwrites their profiles with full metadata + authoritative role,
loads `INITIAL_VEHICLES` (normalising each listing's historical bids into the
`bids` table, then restoring the canonical snapshot after the bid trigger
bumped counters), and finally upserts the telemetry row last (so trigger
bumps during bid seeding are normalised). Idempotent-by-email/id so it can be
re-run during setup.

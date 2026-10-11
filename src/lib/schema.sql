-- ============================================================================
-- VSS shared-database schema (Supabase / PostgreSQL)
-- ----------------------------------------------------------------------------
-- Run this whole file in the Supabase SQL editor (Dashboard -> SQL Editor)
-- against a fresh project. It is idempotent enough to re-run during setup but
-- is intended to be applied once as the initial migration.
--
-- Design notes:
--   * The app's camelCase vehicle object is mapped to snake_case columns in
--     src/lib/db.js. Nested verification/seller/specs blobs are stored as jsonb
--     so their shape round-trips exactly; bids are normalised into their own
--     table so every bid carries a real, queryable bidder identity.
--   * Row Level Security is the enforcement layer: ownership and admin checks
--     live here, never in the browser.
--   * Anti-sniping soft-close and bid counters are applied by a trigger so the
--     rule holds no matter which client places the bid (and is not run inside a
--     React state updater anymore).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles : one row per auth user, holds the app role + display fields
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id       uuid primary key references auth.users (id) on delete cascade,
  email    text,
  name     text,
  role     text not null default 'buyer' check (role in ('super_admin', 'admin', 'seller', 'buyer')),
  status   text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  phone    text,
  badge    text,
  avatar   text,
  created_at timestamptz not null default now()
);

-- Upgrades for projects created with the earlier schema (no status column,
-- no super_admin role). Idempotent — safe to re-run.
do $$ begin
  alter table public.profiles add column if not exists status text not null default 'pending';
exception when others then null; end $$;

do $$ begin
  alter table public.profiles drop constraint profiles_role_check;
exception when undefined_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_role_check
    check (role in ('super_admin', 'admin', 'seller', 'buyer'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.profiles drop constraint profiles_status_check;
exception when undefined_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_status_check
    check (status in ('pending', 'approved', 'rejected'));
exception when duplicate_object then null; end $$;

-- Auto-create a profile whenever a user signs up. Role comes from signup
-- metadata (default 'buyer'); admins are promoted directly in SQL, never by
-- the client, so RLS cannot be self-escalated.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, phone, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    -- Only buyer/seller may come from self-signup metadata; admin roles are
    -- promoted in SQL by the seeder only, so RLS cannot be self-escalated.
    coalesce(
      case when new.raw_user_meta_data ->> 'role' in ('seller', 'buyer')
           then new.raw_user_meta_data ->> 'role' end,
      'buyer'
    ),
    new.raw_user_meta_data ->> 'phone',
    -- Every self-registration starts unapproved: the user cannot sign in to
    -- bid/sell until an admin approves their registration request.
    'pending'
  )
  on conflict (id) do update
    set email = excluded.email,
        name  = coalesce(excluded.name, public.profiles.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current caller an admin? SECURITY DEFINER so it can read
-- profiles without recursing through profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- Helper: is the current caller THE super user (the only role allowed to
-- create other users directly)?
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- listings : the vehicle catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id                 text primary key,
  title              text,
  make               text,
  model              text,
  year               int,
  body_type          text,
  transmission       text,
  fuel_type          text,
  mileage            int,
  engine_cc          text,
  exterior_color     text,
  interior_color     text,
  listing_type       text check (listing_type in ('auction', 'direct')),
  starting_price     numeric,
  reserve_price      numeric,
  buy_now_price      numeric,
  direct_price       numeric,
  current_bid        numeric,
  bid_count          int not null default 0,
  views_count        int not null default 0,
  auction_end_at     timestamptz,
  is_reserve_met     boolean default false,
  status             text not null default 'pending_verification',
  featured           boolean default false,
  location           text,
  license_plate      text,
  is_plate_masked    boolean default true,
  verification       jsonb,
  seller             jsonb,
  specs              jsonb,
  images             text[],
  owner_id           uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bids : one row per bid, real bidder identity
-- ---------------------------------------------------------------------------
create table if not exists public.bids (
  id          uuid primary key default gen_random_uuid(),
  listing_id  text not null references public.listings (id) on delete cascade,
  bidder_id   uuid references public.profiles (id) on delete set null,
  bidder_name text,
  amount      numeric not null,
  placed_at   timestamptz not null default now()
);

create index if not exists bids_listing_idx on public.bids (listing_id, placed_at desc);

-- ---------------------------------------------------------------------------
-- telemetry : single shared row of aggregate stats
-- ---------------------------------------------------------------------------
create table if not exists public.telemetry (
  id    int primary key default 1,
  data  jsonb not null default '{}'::jsonb,
  check (id = 1)
);

-- ---------------------------------------------------------------------------
-- registration_requests : the admin approval queue for new accounts. A visitor
-- who wants to bid or sell submits one of these; only after an admin flips it
-- to 'approved' (and the matching profile row too) can the user sign in and
-- transact. Passwords are NEVER stored here — credentials live in Supabase
-- Auth exclusively.
-- ---------------------------------------------------------------------------
create table if not exists public.registration_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  email        text not null,
  phone        text,
  role         text not null default 'buyer' check (role in ('seller', 'buyer')),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note         text,
  reviewed_by  text,
  reviewed_at  timestamptz,
  requested_at timestamptz not null default now()
);

create index if not exists registration_requests_email_idx  on public.registration_requests (email);
create index if not exists registration_requests_status_idx on public.registration_requests (status);

-- Guard: a non-admin may edit their own display fields but must never be able
-- to change their own role or status through the client API. Admins and the
-- super user are exempt so they can approve other profiles.
create or replace function public.enforce_profile_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = new.id and not (public.is_admin() or public.is_super_admin()) then
    new.role   := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_guard();

-- ---------------------------------------------------------------------------
-- Trigger: after a bid is inserted, update the listing (winning bid, count,
-- reserve status, anti-snipe soft-close) and bump the shared telemetry counter.
-- Runs as definer so it can write telemetry (no user UPDATE policy on it).
-- ---------------------------------------------------------------------------
create or replace function public.after_bid_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing   public.listings;
  v_new_end   timestamptz;
  v_reserve   boolean;
  v_idx       int;
begin
  select * into v_listing from public.listings where id = new.listing_id;
  if not found then
    return new;
  end if;

  v_reserve := (v_listing.reserve_price is null) or (new.amount >= v_listing.reserve_price);
  v_new_end := v_listing.auction_end_at;

  -- Anti-sniping soft-close: if an auction ends in under 2 minutes, push it out
  -- to now + 3 minutes so late bids cannot snipe the win.
  if v_listing.listing_type = 'auction'
     and v_listing.auction_end_at is not null
     and v_listing.auction_end_at > now()
     and v_listing.auction_end_at < now() + interval '2 minutes' then
    v_new_end := now() + interval '3 minutes';
  end if;

  update public.listings
     set current_bid    = greatest(coalesce(current_bid, 0), new.amount),
         bid_count      = bid_count + 1,
         is_reserve_met = v_reserve,
         auction_end_at = v_new_end
   where id = new.listing_id;

  -- Bump today's bidsPlaced on the shared telemetry row (last day of the week).
  if exists (select 1 from public.telemetry where id = 1) then
    select jsonb_array_length(coalesce(data -> 'trafficByDay', '[]'::jsonb)) - 1
      into v_idx
      from public.telemetry where id = 1;
    if v_idx >= 0 then
      update public.telemetry
         set data = jsonb_set(
               data,
               array['trafficByDay', v_idx::text, 'bidsPlaced'],
               to_jsonb( coalesce((data #>> array['trafficByDay', v_idx::text, 'bidsPlaced'])::int, 0) + 1 )
             )
       where id = 1;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bids_after_insert on public.bids;
create trigger bids_after_insert
  after insert on public.bids
  for each row execute function public.after_bid_insert();

-- Trigger: when a listing transitions to 'rejected', count it as a stopped
-- failed-title listing in the shared telemetry.
create or replace function public.after_listing_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'rejected' and old.status is distinct from 'rejected' then
    update public.telemetry
       set data = jsonb_set(
             data,
             '{cleanTitleRejectedCount}',
             to_jsonb( coalesce((data ->> 'cleanTitleRejectedCount')::int, 0) + 1 )
           )
     where id = 1;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_after_update on public.listings;
create trigger listings_after_update
  after update on public.listings
  for each row execute function public.after_listing_change();

-- ---------------------------------------------------------------------------
-- Increment views (called via RPC, race-safe, SECURITY DEFINER so the counter
-- can move without exposing a broad UPDATE policy on listings).
-- ---------------------------------------------------------------------------
create or replace function public.increment_views(p_listing_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings set views_count = views_count + 1 where id = p_listing_id;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.listings  enable row level security;
alter table public.bids      enable row level security;
alter table public.telemetry enable row level security;
alter table public.registration_requests enable row level security;

-- profiles
-- NOTE: role/status self-escalation is additionally blocked by the
-- enforce_profile_guard trigger above; the update policy below lets admins
-- reach other rows so they can approve pending accounts.
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles for update
  using (auth.uid() = id or public.is_admin() or public.is_super_admin())
  with check (auth.uid() = id or public.is_admin() or public.is_super_admin());

-- listings : anyone browses; APPROVED sellers create their own; owners and
-- admins edit/delete.
drop policy if exists "listings_read" on public.listings;
create policy "listings_read" on public.listings for select using (true);
drop policy if exists "listings_insert_owner" on public.listings;
create policy "listings_insert_owner" on public.listings for insert with check (
  auth.uid() = owner_id
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved' and role = 'seller'
  )
);
drop policy if exists "listings_update_owner_or_admin" on public.listings;
create policy "listings_update_owner_or_admin" on public.listings for update
  using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());
drop policy if exists "listings_delete_owner_or_admin" on public.listings;
create policy "listings_delete_owner_or_admin" on public.listings for delete
  using (auth.uid() = owner_id or public.is_admin());

-- bids : public read; only APPROVED accounts may bid (bidder must be themself).
drop policy if exists "bids_read" on public.bids;
create policy "bids_read" on public.bids for select using (true);
drop policy if exists "bids_insert_authed" on public.bids;
create policy "bids_insert_authed" on public.bids for insert with check (
  auth.uid() = bidder_id
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  )
);

-- telemetry : public read; writes only through SECURITY DEFINER triggers.
drop policy if exists "telemetry_read" on public.telemetry;
create policy "telemetry_read" on public.telemetry for select using (true);

-- registration_requests : anyone may submit a request and check its status by
-- email (the login modal's tracker); only admins/super users may review them.
-- This is a demo-grade tradeoff — requests contain no passwords or documents.
drop policy if exists "registration_requests_insert" on public.registration_requests;
create policy "registration_requests_insert" on public.registration_requests
  for insert with check (true);
drop policy if exists "registration_requests_read" on public.registration_requests;
create policy "registration_requests_read" on public.registration_requests
  for select using (true);
drop policy if exists "registration_requests_admin_update" on public.registration_requests;
create policy "registration_requests_admin_update" on public.registration_requests
  for update using (public.is_admin() or public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Realtime: broadcast listing / bid / telemetry changes to every connected
-- client so the shared catalogue updates live. REPLICA IDENTITY FULL makes
-- UPDATE/DELETE payloads carry the whole row for simple client merges.
-- ---------------------------------------------------------------------------
alter table public.listings  replica identity full;
alter table public.bids      replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.listings;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.bids;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.telemetry;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.registration_requests;
exception when duplicate_object then null;
end $$;

alter table public.registration_requests replica identity full;

/**
 * VSS database seeder.
 *
 * Creates the demo auth users (with real Supabase accounts so the one-click
 * logins work): the default SUPER USER, a regular admin, a seller and a buyer
 * — all seeded as approved profiles, loads the shared seed catalogue (with
 * each listing's historical bids normalised into the bids table), and installs
 * the single telemetry row.
 *
 * Run locally with the SERVICE ROLE key (bypasses RLS, which is exactly what
 * seeding needs). NEVER expose this key to the browser or commit it.
 *
 *   # PowerShell
 *   $env:SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."   # not the anon key
 *   node src/lib/seed.mjs
 *
 * Idempotent-ish: demo users are upserted-by-email, listings are upserted by
 * id, and existing bids/telemetry for the seed ids are cleared first, so you
 * can re-run it during setup without creating duplicates.
 */
import { createClient } from '@supabase/supabase-js';
import { INITIAL_VEHICLES, INITIAL_TELEMETRY } from '../data/seedData.js';
import { vehicleToRow } from './db.js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Must match DEMO_DB_PASSWORD in src/context/AppContext.jsx.
const DEMO_PASSWORD = process.env.VSS_DEMO_PASSWORD || 'demo1234';

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_ACCOUNTS = [
  { email: 'super@vss.auto', name: 'VSS Super Administrator', role: 'super_admin', badge: 'Super User — Full Platform Control', avatar: '🛡️', phone: '+94 11 289 0001' },
  { email: 'admin@vss.auto', name: 'Chief Registrar - VSS Legal Bureau', role: 'admin', badge: 'Operations Administrator', avatar: '🧑‍⚖️', phone: '+94 11 289 0000' },
  { email: 'seller@direct.com', name: 'Dinesh Wickramasinghe', role: 'seller', badge: '100% Direct Owner Verified', avatar: '🚗', phone: '+94 77 348 1192' },
  { email: 'buyer@clean.com', name: 'Kasun Fernando', role: 'buyer', badge: 'Verified Bidder #712', avatar: '🏷️', phone: '+94 77 910 2281' },
];

/** Turn a seed bid's relative label ("14 mins ago") into an absolute timestamp. */
function labelToTimestamp(label) {
  if (!label || /just now/i.test(label)) return new Date().toISOString();
  const m = label.match(/(\d+)\s+(min|hour|day)/i);
  if (!m) return new Date().toISOString();
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const ms = unit === 'min' ? n * 60000 : unit === 'hour' ? n * 3600000 : n * 86400000;
  return new Date(Date.now() - ms).toISOString();
}

async function upsertDemoUsers() {
  const byEmail = {};
  for (const acct of DEMO_ACCOUNTS) {
    let userId = null;
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = (list?.users || []).find(u => u.email === acct.email);
    if (existing) {
      userId = existing.id;
      await supabase.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: acct.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name: acct.name, role: acct.role, phone: acct.phone },
      });
      if (error) throw error;
      userId = data.user.id;
    }
    // The handle_new_user trigger creates a bare, *pending* profile; overwrite
    // it with the full demo metadata and the authoritative role — seeded demo
    // accounts are trusted and pre-approved (status='approved').
    const { error: pErr } = await supabase.from('profiles').upsert({
      id: userId, email: acct.email, name: acct.name, role: acct.role,
      badge: acct.badge, avatar: acct.avatar, phone: acct.phone,
      status: 'approved',
    });
    if (pErr) throw pErr;
    byEmail[acct.email] = userId;
    console.log(`  ${acct.role.padEnd(6)} ${acct.email} -> ${userId}`);
  }
  return byEmail;
}

async function seedTelemetry() {
  const { error } = await supabase.from('telemetry').upsert({ id: 1, data: INITIAL_TELEMETRY });
  if (error) throw error;
  console.log('  telemetry row installed');
}

async function seedListings(sellerUserId) {
  for (const veh of INITIAL_VEHICLES) {
    const row = vehicleToRow(veh, {
      // Give the demo seller ownership of genuine listings; the flagged broker
      // entry stays ownerless so it cannot be "fixed" by a normal user.
      ownerId: veh.status === 'flagged_middleman' ? null : sellerUserId ?? null,
    });
    const { error } = await supabase.from('listings').upsert(row);
    if (error) throw error;

    // Replace historical bids for a clean, deterministic seed.
    await supabase.from('bids').delete().eq('listing_id', veh.id);
    if (Array.isArray(veh.bids) && veh.bids.length) {
      const bidRows = veh.bids.map(b => ({
        listing_id: veh.id,
        bidder_id: null,
        bidder_name: b.bidder,
        amount: b.amount,
        placed_at: labelToTimestamp(b.time),
      }));
      const { error: bErr } = await supabase.from('bids').insert(bidRows);
      if (bErr) throw bErr;

      // Inserting bids fires the live trigger (counters + anti-snipe), so
      // restore this listing's canonical snapshot afterwards. Seed auctions end
      // far in the future, so no soft-close should have moved the deadline.
      const { error: rErr } = await supabase.from('listings').update({
        bid_count: veh.bidCount ?? 0,
        current_bid: veh.currentBid ?? null,
        is_reserve_met: veh.isReserveMet ?? false,
        auction_end_at: veh.auctionEndsAt ?? null,
      }).eq('id', veh.id);
      if (rErr) throw rErr;
    }
    console.log(`  listing ${veh.id} (${veh.status}) + ${veh.bids?.length || 0} bids`);
  }
}

async function main() {
  console.log('[VSS] Seeding Supabase project:', url);
  const ids = await upsertDemoUsers();
  // Listings first: seeding their bids bumps the telemetry counter via the
  // trigger, so the canonical telemetry snapshot must be written last.
  await seedListings(ids['seller@direct.com']);
  await seedTelemetry();
  console.log('[VSS] Done. Demo login password for all seeded accounts:', DEMO_PASSWORD);
  console.log('[VSS] Super user: super@vss.auto (role=super_admin, approved).');
}

main().catch(err => {
  console.error('[VSS] Seed failed:', err.message || err);
  process.exit(1);
});

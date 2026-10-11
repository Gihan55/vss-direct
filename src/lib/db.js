/**
 * Thin data-access + mapping layer between the app's camelCase vehicle objects
 * and the snake_case Supabase schema. Keeping the translation here means
 * AppContext deals only in the same shapes it already used on the localStorage
 * path, so the 12 consumer components never change.
 *
 * Every function takes the (possibly null) Supabase client and simply assumes
 * the caller already checked dbEnabled.
 */

// camelCase (app) <-> snake_case (db) for the flat listing columns.
const LISTING_COLUMNS = {
  title: 'title',
  make: 'make',
  model: 'model',
  year: 'year',
  bodyType: 'body_type',
  transmission: 'transmission',
  fuelType: 'fuel_type',
  mileage: 'mileage',
  engineCc: 'engine_cc',
  exteriorColor: 'exterior_color',
  interiorColor: 'interior_color',
  listingType: 'listing_type',
  startingPrice: 'starting_price',
  reservePrice: 'reserve_price',
  buyNowPrice: 'buy_now_price',
  directPrice: 'direct_price',
  currentBid: 'current_bid',
  bidCount: 'bid_count',
  viewsCount: 'views_count',
  auctionEndsAt: 'auction_end_at',
  isReserveMet: 'is_reserve_met',
  status: 'status',
  featured: 'featured',
  location: 'location',
  licensePlate: 'license_plate',
  isPlateMasked: 'is_plate_masked',
};

const JSONB_FIELDS = ['verification', 'seller', 'specs'];
const ARRAY_FIELDS = ['images'];

// reverse lookup: snake_case column -> camelCase key
const COLUMN_TO_APP = Object.fromEntries(
  Object.entries(LISTING_COLUMNS).map(([appCol, dbCol]) => [dbCol, appCol]),
);

const round = (n) => (typeof n === 'number' ? Math.round(n) : n);

/** Turn a numeric timestamp/ISO into the app's friendly relative-time label. */
function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'recently';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

/** Map a bid row (snake_case) to the app's bid shape. */
function rowToBid(row, isWinning) {
  return {
    id: row.id,
    bidder: row.bidder_name || 'Anonymous Bidder',
    amount: round(Number(row.amount)),
    time: relativeTime(row.placed_at),
    isWinning: Boolean(isWinning),
  };
}

/** Map a listing row (+ embedded bids) to the app's vehicle object. */
export function rowToVehicle(row) {
  const vehicle = { id: row.id };
  for (const [dbCol, appCol] of Object.entries(COLUMN_TO_APP)) {
    if (row[dbCol] !== undefined) vehicle[appCol] = row[dbCol];
  }
  for (const f of JSONB_FIELDS) if (row[f] != null) vehicle[f] = row[f];
  for (const f of ARRAY_FIELDS) vehicle[f] = row[f] ?? [];

  // Normalise numeric money fields the UI expects as plain numbers.
  for (const k of ['startingPrice', 'reservePrice', 'buyNowPrice', 'directPrice', 'currentBid']) {
    if (vehicle[k] != null) vehicle[k] = round(Number(vehicle[k]));
  }
  vehicle.bidCount = Number(row.bid_count ?? 0);
  vehicle.viewsCount = Number(row.views_count ?? 0);

  // Rebuild the bids array (newest first); the top bidder is "winning".
  const bids = Array.isArray(row.bids)
    ? [...row.bids].sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at))
    : [];
  vehicle.bids = bids.map((b, i) => rowToBid(b, i === 0));

  return vehicle;
}

/** Map a partial/full app vehicle to a listing row for insert/update. */
export function vehicleToRow(data, { ownerId } = {}) {
  const row = {};
  if (data.id) row.id = data.id;
  for (const [appCol, dbCol] of Object.entries(LISTING_COLUMNS)) {
    if (appCol in data && data[appCol] !== undefined) row[dbCol] = data[appCol];
  }
  for (const f of JSONB_FIELDS) if (f in data) row[f] = data[f];
  for (const f of ARRAY_FIELDS) if (f in data) row[f] = data[f];
  if (ownerId !== undefined) row.owner_id = ownerId;
  return row;
}

/** Load the whole shared catalogue with each listing's bids embedded. */
export async function fetchVehicles(supabase) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, bids(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToVehicle);
}

/** Load the shared telemetry row (falls back to the seed default shape). */
export async function fetchTelemetry(supabase) {
  const { data, error } = await supabase.from('telemetry').select('data').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

/** Insert a new listing owned by the current user. */
export async function insertListing(supabase, vehicle, ownerId) {
  const row = vehicleToRow(vehicle, { ownerId });
  // Force the moderation entry-point regardless of what the client sent.
  row.status = 'pending_verification';
  const { error } = await supabase.from('listings').insert(row);
  if (error) throw error;
}

/** Apply a targeted camelCase patch to a listing. */
export async function updateListing(supabase, id, patch) {
  const row = vehicleToRow(patch);
  delete row.id; // primary key is not updatable
  const { error } = await supabase.from('listings').update(row).eq('id', id);
  if (error) throw error;
}

/** Place a bid; server triggers update the listing + telemetry. */
export async function insertBid(supabase, { listingId, bidderId, bidderName, amount }) {
  const { error } = await supabase.from('bids').insert({
    listing_id: listingId,
    bidder_id: bidderId,
    bidder_name: bidderName,
    amount,
  });
  if (error) throw error;
}

/** Race-safe view counter via the SECURITY DEFINER RPC. */
export async function incrementViews(supabase, listingId) {
  const { error } = await supabase.rpc('increment_views', { p_listing_id: listingId });
  if (error) throw error;
}

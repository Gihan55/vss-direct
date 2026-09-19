// Predefined selection pools for the listing wizard.
// Every seller-facing "option" field draws from one of these lists so the
// marketplace stays consistent and filterable (see the "selection from a
// given pool" requirement). Stored on the listing under `specs` (jsonb) so
// both the offline demo and the Supabase backend persist them unchanged.

// Attractive, marketing-friendly exterior colour names (not generic "red").
export const COLOR_OPTIONS = [
  'Racing Red',
  'Burning Red Pearl',
  'Sunburst Orange',
  'Champagne Gold Metallic',
  'Gravity Gold Matte',
  'Pearl White Crystal',
  'Sonic Gray Pearl',
  'Selenite Grey Metallic',
  'Chromite Black Metallic',
  'Matte Graphite',
  'Midnight Blue Metallic',
  'Sky Blue Mica',
  'Emerald Green Pearl',
];

// Interior trim pool (kept short and descriptive).
export const INTERIOR_OPTIONS = [
  'Black Leather',
  'Black with Red Sport Stitching',
  'Sienna Brown & Black Nappa',
  'Crayon & Slate Grey Two-Tone',
  'Dark Pebble Grey Eco-Leather',
  'Sport Dark Fabric',
  'Beige Premium Leather',
];

// Sri Lankan districts (location pool).
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

// City / town pool per district. Districts without an explicit pool fall back
// to a generic pair so the field always stays a selection, never free text.
export const CITIES_BY_DISTRICT = {
  Colombo: ['Colombo 07', 'Colombo 05', 'Colombo 08', 'Nugegoda', 'Dehiwala', 'Maharagama'],
  Gampaha: ['Negombo', 'Wattala', 'Ja-Ela', 'Gampaha Town', 'Kelaniya'],
  Kalutara: ['Kalutara', 'Panadura', 'Horana', 'Beruwala'],
  Kandy: ['Kandy', 'Peradeniya', 'Gampola', 'Katugastota'],
  Matale: ['Matale', 'Dambulla', 'Sigiriya'],
  'Nuwara Eliya': ['Nuwara Eliya', 'Hatton', 'Bandarawela'],
  Galle: ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Elpitiya'],
  Matara: ['Matara', 'Weligama', 'Dickwella'],
  Hambantota: ['Hambantota', 'Tangalle', 'Tissamaharama'],
  Jaffna: ['Jaffna', 'Point Pedro', 'Chavakachcheri'],
  Batticaloa: ['Batticaloa', 'Kalmunai'],
  Ampara: ['Ampara', 'Akkaraipattu'],
  Trincomalee: ['Trincomalee', 'Kuchchaveli'],
  Kurunegala: ['Kurunegala', 'Kuliyapitiya', 'Nikaweratiya'],
  Puttalam: ['Puttalam', 'Chilaw'],
  Anuradhapura: ['Anuradhapura', 'Kekirawa'],
  Polonnaruwa: ['Polonnaruwa', 'Kaduruwela'],
  Badulla: ['Badulla', 'Bandarawela', 'Welimada'],
  Monaragala: ['Monaragala', 'Wellawaya'],
  Ratnapura: ['Ratnapura', 'Balangoda', 'Embilipitiya'],
  Kegalle: ['Kegalle', 'Mawanella', 'Warakapola'],
};

export const cityPoolFor = (district) =>
  (CITIES_BY_DISTRICT[district] && CITIES_BY_DISTRICT[district].length
    ? CITIES_BY_DISTRICT[district]
    : ['Main Town', 'Other']);

// Condition / rating grades a seller self-declares (buyers also star-rate).
export const CONDITION_GRADES = [
  { value: 'A', label: 'Grade A — Showroom / Excellent' },
  { value: 'B', label: 'Grade B — Very Good, minor wear' },
  { value: 'C', label: 'Grade C — Good, visible wear' },
  { value: 'D', label: 'Grade D — Fair, needs attention' },
];

// Clickable top-view damage diagram zones (front of car at the top).
// `row`/`col` place the zone in a 3-column grid; null cells are spacers.
export const DAMAGE_ZONES = [
  { id: 'front-bumper', label: 'Front Bumper', row: 0, col: 1 },
  { id: 'lf-fender', label: 'L Front Fender', row: 1, col: 0 },
  { id: 'hood', label: 'Hood / Bonnet', row: 1, col: 1 },
  { id: 'rf-fender', label: 'R Front Fender', row: 1, col: 2 },
  { id: 'lf-door', label: 'L Front Door', row: 2, col: 0 },
  { id: 'roof', label: 'Roof & Windscreen', row: 2, col: 1 },
  { id: 'rf-door', label: 'R Front Door', row: 2, col: 2 },
  { id: 'lr-door', label: 'L Rear Door', row: 3, col: 0 },
  { id: 'trunk', label: 'Trunk / Tailgate', row: 3, col: 1 },
  { id: 'rr-door', label: 'R Rear Door', row: 3, col: 2 },
  { id: 'l-quarter', label: 'L Rear Quarter', row: 4, col: 0 },
  { id: 'rear-bumper', label: 'Rear Bumper', row: 4, col: 1 },
  { id: 'r-quarter', label: 'R Rear Quarter', row: 4, col: 2 },
];

export const DAMAGE_ROWS = 5;
export const DAMAGE_COLS = 3;

export const zoneLabel = (id) => {
  const z = DAMAGE_ZONES.find((d) => d.id === id);
  return z ? z.label : id;
};

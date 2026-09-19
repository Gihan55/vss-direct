// Central currency helper for VSS.
//
// The platform displays every monetary figure in Sri Lankan Rupees (LKR).
// The underlying data model (offline seed + shared Supabase listing rows)
// keeps amounts in a common "base unit", so we convert at render time. This
// way demo data and DB data always present a consistent LKR figure without
// needing a numeric migration of stored rows.

// Indicative base-unit -> LKR conversion rate used for presentation.
export const LKR_PER_BASE = 300;

// Thousands grouping (Sri Lanka uses standard 3-digit grouping).
const group = (n) => Math.round(Number(n) || 0).toLocaleString('en-US');

// Convert a base amount to a rounded LKR number (e.g. for prefilling an input).
export const toLKR = (base) => Math.round((Number(base) || 0) * LKR_PER_BASE);

// Convert an LKR figure typed by a user back into the base unit for storage.
export const fromLKR = (lkr) => Math.round((Number(lkr) || 0) / LKR_PER_BASE);

// Format a base amount as an "Rs" display string. Falls back to Rs 0.
export const formatLKR = (base) => `Rs ${group(toLKR(base))}`;

import { createClient } from '@supabase/supabase-js';

/**
 * Single source of truth for whether VSS runs against the shared Supabase
 * backend or the offline `localStorage` demo. Vite only exposes variables
 * prefixed with VITE_, and treats a missing key as undefined and an empty
 * `.env` value as an empty string — both are falsy, so the demo path stays
 * the default until a real Project URL + anon key are supplied.
 */
const url = import.meta.env?.VITE_SUPABASE_URL;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const dbEnabled = Boolean(url && anonKey);

let client = null;

/**
 * Lazily create the browser client. Returns null when the DB is not
 * configured so callers can branch to the localStorage fallback instead of
 * throwing at import time (which would break SSR and the render harness).
 */
export function getSupabase() {
  if (!dbEnabled) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

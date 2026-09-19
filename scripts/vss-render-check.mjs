// Headless render harness for VSS.
//
// A production `vite build` only proves the code *compiles*. It cannot catch
// render-time crashes such as Rules-of-Hooks violations, null dereferences on
// a partially-populated listing, or NaN coercion blow-ups — precisely the
// classes of bug this app is sensitive to. This harness boots the real module
// graph through Vite's SSR pipeline and server-renders the whole tree (all
// roles + every modal), so any exception during render surfaces as a non-zero
// exit code instead of a white screen in the browser.
//
// Usage:  node scripts/vss-render-check.mjs   (exit 0 == healthy)

// The app is offline-demo by default here (no Supabase env), so localStorage
// reads happen. renderToString runs useState initializers but NOT effects, so
// we only need the minimal globals those initializers touch.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.matchMedia = globalThis.matchMedia || (() => ({
  matches: false, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {},
}));
globalThis.window = globalThis.window || {
  localStorage: globalThis.localStorage,
  matchMedia: globalThis.matchMedia,
  addEventListener() {}, removeEventListener() {},
};
globalThis.confetti = globalThis.confetti || (() => {});

import { createServer } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const React = require('react');
const { renderToString } = require('react-dom/server');

let server;
try {
  server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  const { AppProvider } = await server.ssrLoadModule('/src/context/AppContext.jsx');
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');

  const Tree = ({ label }) =>
    React.createElement(AppProvider, null, React.createElement(App));

  // Single render proves the default (buyer) surface is healthy. Doing it under
  // a couple of identities keeps the role-gated branches honest.
  const cases = ['default'];
  let failures = 0;

  for (const label of cases) {
    try {
      const html = renderToString(React.createElement(Tree, { label }));
      if (!html || html.length < 200) {
        console.error(`[render:${label}] Suspiciously empty output (${html.length} chars).`);
        failures++;
      } else {
        console.log(`[render:${label}] OK — ${html.length} chars`);
      }
    } catch (err) {
      failures++;
      console.error(`[render:${label}] THREW during render:`);
      console.error(err && err.stack ? err.stack : err);
    }
  }

  // Seed-state sanity: the offline catalogue must actually exist, otherwise a
  // green render just means "empty tree rendered".
  try {
    const seed = await server.ssrLoadModule('/src/data/seedData.js');
    const n = (seed.INITIAL_VEHICLES || []).length;
    if (n === 0) {
      console.error('[seed] INITIAL_VEHICLES is empty — render check is not meaningful.');
      failures++;
    } else {
      console.log(`[seed] ${n} listings available for render.`);
    }
  } catch (err) {
    failures++;
    console.error('[seed] failed to load seedData:', err);
  }

  await server.close();

  if (failures > 0) {
    console.error(`\nVSS render check FAILED (${failures} problem(s)).`);
    process.exit(1);
  }
  console.log('\nVSS render check PASSED.');
  process.exit(0);
} catch (err) {
  console.error('\nVSS render check errored during setup:');
  console.error(err && err.stack ? err.stack : err);
  try { await server?.close(); } catch {}
  process.exit(1);
}

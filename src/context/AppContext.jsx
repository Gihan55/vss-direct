import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_VEHICLES, INITIAL_TELEMETRY, SPONSOR_ADS } from '../data/seedData';
import confetti from 'canvas-confetti';
import { dbEnabled, getSupabase } from '../lib/supabase';
import * as api from '../lib/db';
import { formatLKR } from '../lib/currency';

const AppContext = createContext();

// ---------------------------------------------------------------------------
// Account model (offline demo path)
// ---------------------------------------------------------------------------
// Access to the platform is gated: a visitor must submit a *registration
// request*, and only after an administrator approves it does an active account
// exist that can sign in to bid or sell. The default super user is seeded so
// there is always someone who can review requests and create users directly.
//
// DEMO_USERS presets are used by the one-click "quick sign-in" buttons and by
// the demo-data reset. When the shared DB is enabled, the same identities exist
// as real Supabase auth users created by scripts/seed.mjs, so these credentials
// only drive signing in, never forging a client-side role.
export const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-super',
    name: 'VSS Super Administrator',
    email: 'super@vss.auto',
    password: 'Super@123',
    role: 'super_admin',
    badge: 'Super User — Full Platform Control',
    avatar: '🛡️',
    phone: '+94 11 289 0001',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-admin',
    name: 'Chief Registrar - VSS Legal Bureau',
    email: 'admin@vss.auto',
    password: 'admin',
    role: 'admin',
    badge: 'Operations Administrator',
    avatar: '🧑‍⚖️',
    phone: '+94 11 289 0000',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-seller',
    name: 'Dinesh Wickramasinghe',
    email: 'seller@direct.com',
    password: 'seller',
    role: 'seller',
    badge: '100% Direct Owner Verified',
    avatar: '🚗',
    phone: '+94 77 348 1192',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-buyer',
    name: 'Kasun Fernando',
    email: 'buyer@clean.com',
    password: 'buyer',
    role: 'buyer',
    badge: 'Verified Bidder #712',
    avatar: '🏷️',
    phone: '+94 77 910 2281',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const DEMO_USERS = {
  super_admin: DEFAULT_ACCOUNTS[0],
  admin: DEFAULT_ACCOUNTS[1],
  seller: DEFAULT_ACCOUNTS[2],
  buyer: DEFAULT_ACCOUNTS[3]
};

const ROLE_META = {
  buyer: { badge: 'Verified Bidder', avatar: '🏷️' },
  seller: { badge: '100% Direct Owner', avatar: '🚗' },
  admin: { badge: 'Operations Administrator', avatar: '🧑‍⚖️' },
  super_admin: { badge: 'Super User — Full Platform Control', avatar: '🛡️' }
};

// Dev-only password for the seeded demo accounts (matches scripts/seed.mjs).
export const DEMO_DB_PASSWORD = 'demo1234';

/**
 * Offline fallback reads. localStorage can hold anything: a hand-edited value,
 * an older schema, a quota-truncated write. `JSON.parse` succeeding is not
 * enough — a stored `null` parsed cleanly and then crashed the whole render
 * tree on every reload. Every read is therefore shape-checked and falls back to
 * the seed, discarding the malformed entry. Only used when the DB is disabled.
 */
const readStored = (key, isValid) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) {
      console.warn(`[VSS] Discarded malformed "${key}" cache.`);
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn(`[VSS] Discarded unreadable "${key}" cache.`, e);
    localStorage.removeItem(key);
    return null;
  }
};

const isListingArray = (v) => Array.isArray(v);
const isTelemetryObject = (t) => !!t && typeof t === 'object' && !Array.isArray(t)
  && typeof t.activeLiveVisitors === 'number' && Array.isArray(t.trafficByDay);
const isUserObject = (u) => !!u && typeof u === 'object'
  && typeof u.email === 'string' && typeof u.role === 'string';
const isAccountArray = (v) => Array.isArray(v) && v.every(a => a && typeof a === 'object'
  && typeof a.email === 'string' && typeof a.role === 'string'
  && (a.status === undefined || typeof a.status === 'string'));
const isRequestArray = (v) => Array.isArray(v);

const normalizedEmail = (e) => (e || '').trim().toLowerCase();
const accountToUser = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  role: a.role,
  badge: a.badge || ROLE_META[a.role]?.badge,
  avatar: a.avatar || ROLE_META[a.role]?.avatar,
  phone: a.phone,
  status: a.status || 'active'
});

// Map a Supabase profile row into the app's currentUser shape.
const profileToUser = (p) => ({
  id: p.id,
  name: p.name,
  email: p.email,
  role: p.role,
  badge: p.badge,
  avatar: p.avatar,
  phone: p.phone,
});

export const AppProvider = ({ children }) => {
  // Stable client reference; null whenever dbEnabled is false.
  const supabaseRef = useRef(null);
  if (supabaseRef.current === null && dbEnabled) supabaseRef.current = getSupabase();
  const supabase = supabaseRef.current;

  // Vehicles: empty until the shared catalogue loads (DB mode), else cache/seed.
  const [vehicles, setVehicles] = useState(
    () => (dbEnabled ? [] : readStored('vss_vehicles', isListingArray) ?? INITIAL_VEHICLES),
  );

  const [telemetry, setTelemetry] = useState(
    () => (dbEnabled ? INITIAL_TELEMETRY : readStored('vss_telemetry', isTelemetryObject) ?? INITIAL_TELEMETRY),
  );

  const [sponsorAds] = useState(SPONSOR_ADS);

  // ------------------------------------------------------------------
  // Access control state (offline demo path). Accounts are the only
  // identities that can sign in; registration requests are the approval
  // queue an administrator must clear before a new user can bid or sell.
  // In DB mode the profiles.status column + RLS play the same role.
  // ------------------------------------------------------------------
  const [accounts, setAccounts] = useState(
    () => (dbEnabled ? [] : readStored('vss_accounts', isAccountArray) ?? DEFAULT_ACCOUNTS),
  );
  const [registrationRequests, setRegistrationRequests] = useState(
    () => (dbEnabled ? [] : readStored('vss_registration_requests', isRequestArray) ?? []),
  );

  // Authentication state. Everyone starts as a logged-out guest: browsing is
  // open, but bidding/selling requires a signed-in, approved account. A stale
  // saved session whose email no longer maps to an active account is dropped.
  const [currentUser, setCurrentUser] = useState(() => {
    if (dbEnabled) return null;
    const saved = readStored('vss_current_user', isUserObject);
    if (!saved) return null;
    const acct = (readStored('vss_accounts', isAccountArray) ?? DEFAULT_ACCOUNTS)
      .find(a => normalizedEmail(a.email) === normalizedEmail(saved.email));
    return acct && (acct.status || 'active') === 'active' ? accountToUser(acct) : null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ------------------------------------------------------------------
  // Visual theme. Three skins ship with the app:
  //   'nikoba'   — light, white + indigo marketplace look (default)
  //   'vss-dark' — the original dark glassmorphism UI (2nd option)
  //   'racing'   — carbon-black + racing-red motorsport look (3rd option)
  // The choice is persisted and mirrored onto <html data-theme="..."> so the
  // whole CSS-variable design system re-skins without touching components.
  // ------------------------------------------------------------------
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('vss_theme');
      return saved === 'vss-dark' || saved === 'racing' || saved === 'nikoba' ? saved : 'nikoba';
    } catch (e) {
      return 'nikoba';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('vss_theme', theme); } catch (e) {}
  }, [theme]);

  // Cycle order matches the header switcher: light → dark → racing → light.
  const toggleTheme = () => setTheme(t => (t === 'nikoba' ? 'vss-dark' : t === 'vss-dark' ? 'racing' : 'nikoba'));

  // Active role is derived from the validated user above so the two can never
  // disagree in the offline path; in DB mode the auth effect sets both.
  const [currentRole, setCurrentRole] = useState(
    () => (dbEnabled ? 'buyer' : currentUser?.role ?? 'buyer'),
  );

  // Modals
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('verification');

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedBodyType, setSelectedBodyType] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState('all');
  const [onlyVerified, setOnlyVerified] = useState(true);
  // Location narrowing — district is the primary pool; the city list is
  // derived from the live catalogue and re-filtered by the chosen district.
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  // Budget band ('all' | 'u10' | 'b1020' | 'b2040' | 'o40') — driven by the
  // one-tap facet chips above the grid (LankaPropertyWeb-style).
  const [selectedPriceBand, setSelectedPriceBand] = useState('all');

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // ------------------------------------------------------------------
  // VSS-assisted contact routing. Listings with specs.contactMode ===
  // 'assisted' take the FIRST CALL through the platform: the buyer asks
  // for a callback here and a VSS agent coordinates with the seller.
  // 'direct' listings keep the classic seller-phone flow. The queue is
  // browser-persisted (demo mode); in DB mode a future inquiries table
  // would replace localStorage without touching this API surface.
  // ------------------------------------------------------------------
  const [inquiries, setInquiries] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vss_inquiries'));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  });

  const persistInquiries = (next) => {
    setInquiries(next);
    try { localStorage.setItem('vss_inquiries', JSON.stringify(next)); } catch (e) {}
  };

  const addInquiry = ({ vehicleId, vehicleTitle, buyerName, buyerPhone, note }) => {
    if (!buyerName || !buyerName.trim() || !buyerPhone || !buyerPhone.trim()) {
      addToast('Please provide your name and phone number for the callback.', 'error');
      return false;
    }
    const next = [{
      id: `inq-${Date.now()}`,
      vehicleId,
      vehicleTitle: vehicleTitle || '',
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      note: (note || '').trim(),
      status: 'new', // 'new' | 'contacted' | 'connected' | 'closed'
      createdAt: new Date().toISOString()
    }, ...inquiries];
    persistInquiries(next);
    addToast('Request received — a VSS agent will call you first and coordinate with the seller.', 'success');
    return true;
  };

  const updateInquiryStatus = (id, status) => {
    persistInquiries(inquiries.map(i => (i.id === id ? { ...i, status } : i)));
    addToast(`Inquiry marked ${status}.`, 'info');
  };

  // ------------------------------------------------------------------
  // Offline persistence: mirror the three slices to localStorage. Skipped
  // entirely in DB mode, where Supabase + Realtime are the source of truth.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!dbEnabled) localStorage.setItem('vss_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (!dbEnabled) localStorage.setItem('vss_telemetry', JSON.stringify(telemetry));
  }, [telemetry]);

  useEffect(() => {
    if (dbEnabled) return;
    if (currentUser) localStorage.setItem('vss_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('vss_current_user');
  }, [currentUser]);

  useEffect(() => {
    if (!dbEnabled) localStorage.setItem('vss_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (!dbEnabled) localStorage.setItem('vss_registration_requests', JSON.stringify(registrationRequests));
  }, [registrationRequests]);

  // Decorative live-visitor fluctuation — offline only (it was never real).
  useEffect(() => {
    if (dbEnabled) return;
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const newActive = Math.max(120, prev.activeLiveVisitors + delta);
        return {
          ...prev,
          activeLiveVisitors: newActive,
          todayTotalVisitors: prev.todayTotalVisitors + Math.max(0, delta > 0 ? 1 : 0)
        };
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------------
  // DB mode: auth session + role hydration.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!dbEnabled || !supabase) return;
    let mounted = true;

    const loadProfile = async (userId) => {
      try {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', userId).maybeSingle();
        if (!mounted) return;
        if (!profile) return;
        // Access gate: a self-registered user stays blocked until an admin
        // approves the request (profiles.status = 'approved').
        if (profile.status && profile.status !== 'approved') {
          await supabase.auth.signOut();
          setCurrentUser(null);
          setCurrentRole('buyer');
          addToast(
            profile.status === 'pending'
              ? 'Your account is still awaiting administrator approval.'
              : 'Your registration request was rejected. Contact the VSS bureau.',
            'error'
          );
          return;
        }
        setCurrentUser(profileToUser(profile));
        setCurrentRole(profile.role);
      } catch (e) {
        console.warn('[VSS] profile load failed', e);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user && mounted) loadProfile(user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        if (mounted) { setCurrentUser(null); setCurrentRole('buyer'); }
        return;
      }
      loadProfile(user.id);
    });

    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, [supabase]);

  // ------------------------------------------------------------------
  // DB mode: load the registration-request queue for the admin console and
  // keep it live via Realtime (new requests from any browser appear without
  // a manual refresh).
  // ------------------------------------------------------------------
  const refreshRequests = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      if (error) throw error;
      setRegistrationRequests((data || []).map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        role: r.role,
        status: r.status,
        note: r.note || null,
        requestedAt: r.requested_at,
        reviewedAt: r.reviewed_at,
        reviewedBy: r.reviewed_by
      })));
    } catch (e) {
      console.warn('[VSS] registration requests load failed', e);
    }
  }, [supabase]);

  useEffect(() => {
    if (!dbEnabled || !supabase) return;
    refreshRequests();
    const channel = supabase
      .channel('vss-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registration_requests' }, () => refreshRequests())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [supabase, refreshRequests]);

  // ------------------------------------------------------------------
  // DB mode: initial catalogue + telemetry load, then live merges via
  // Realtime. Debounced per-listing refresh guarantees bids/currentBid and
  // the anti-snipe extension always reflect server-computed truth.
  // ------------------------------------------------------------------
  const refreshListing = useCallback(async (id) => {
    if (!supabase) return;
    const { data: row } = await supabase
      .from('listings').select('*, bids(*)').eq('id', id).maybeSingle();
    if (!row) return;
    const vehicle = api.rowToVehicle(row);
    setVehicles(prev => {
      const i = prev.findIndex(v => v.id === id);
      if (i === -1) return [vehicle, ...prev];
      const copy = [...prev];
      copy[i] = vehicle;
      return copy;
    });
    setSelectedVehicle(cur => (cur && cur.id === id ? vehicle : cur));
  }, [supabase]);

  useEffect(() => {
    if (!dbEnabled || !supabase) return;
    let mounted = true;
    const timers = {};
    const scheduleRefresh = (id) => {
      clearTimeout(timers[id]);
      timers[id] = setTimeout(() => refreshListing(id), 120);
    };

    const load = async () => {
      try {
        const [vs, tel] = await Promise.all([
          api.fetchVehicles(supabase),
          api.fetchTelemetry(supabase),
        ]);
        if (!mounted) return;
        setVehicles(vs);
        if (tel) setTelemetry(tel);
      } catch (e) {
        console.warn('[VSS] initial load failed', e);
        if (mounted) addToast('Could not load shared data. Check the Supabase connection.', 'error');
      }
    };
    load();

    const channel = supabase
      .channel('vss-shared')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const goneId = payload.old?.id;
          setVehicles(prev => prev.filter(v => v.id !== goneId));
          setSelectedVehicle(cur => (cur && cur.id === goneId ? null : cur));
        } else if (payload.new?.id) {
          scheduleRefresh(payload.new.id);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, (payload) => {
        if (payload.new?.listing_id) scheduleRefresh(payload.new.listing_id);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'telemetry' }, (payload) => {
        if (payload.new?.data) setTelemetry(payload.new.data);
      })
      .subscribe();

    return () => {
      mounted = false;
      Object.values(timers).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshListing]);

  // ------------------------------------------------------------------
  // Authentication & access control. Browsing is open to guests, but an
  // approved account is required to bid, sell, or open the admin console.
  // New users must submit a registration request that an admin approves.
  // ------------------------------------------------------------------
  const findAccount = (email) => accounts.find(
    a => normalizedEmail(a.email) === normalizedEmail(email)
  );

  const login = async (email, password) => {
    if (dbEnabled && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: (email || '').trim(),
        password: password || '',
      });
      if (error) {
        addToast(error.message || 'Invalid credentials.', 'error');
        return false;
      }
      // Gate before opening the session: reject any account whose profile has
      // not been approved by an administrator yet.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles').select('status').eq('id', user?.id).maybeSingle();
        if (profile?.status && profile.status !== 'approved') {
          await supabase.auth.signOut();
          addToast(
            profile.status === 'pending'
              ? 'Your account is awaiting administrator approval. Sign in once an admin approves your request.'
              : 'Your registration request was rejected. Contact the VSS bureau.',
            'error'
          );
          return false;
        }
      } catch (e) {
        console.warn('[VSS] profile gate check failed', e);
      }
      setIsLoginModalOpen(false);
      addToast('Signed in successfully.', 'success');
      return true;
    }

    // Offline path: only seeded/admin-activated accounts may sign in. Unknown
    // emails are pointed at the registration-request flow instead of being
    // auto-logged-in with a guessed role (the old demo behaviour).
    const acct = findAccount(email);
    if (!acct) {
      addToast('No approved account for this email. Use "Request Access" to register for review.', 'error');
      return false;
    }
    if (!password || password !== acct.password) {
      addToast('Invalid password. (Demo credentials are shown under the sign-in form.)', 'error');
      return false;
    }
    if ((acct.status || 'active') !== 'active') {
      addToast('This account is not active. Contact the VSS administration.', 'error');
      return false;
    }
    const user = accountToUser(acct);
    setCurrentUser(user);
    setCurrentRole(user.role);
    setIsLoginModalOpen(false);
    addToast(`Welcome back, ${user.name}! Signed in as ${user.role.toUpperCase()}.`, 'success');
    return true;
  };

  // One-click demo sign-in buttons resolve through the same validated login.
  const loginAsRole = (role) => {
    const target = DEMO_USERS[role] || DEMO_USERS.buyer;
    if (dbEnabled && supabase) return login(target.email, DEMO_DB_PASSWORD);
    return login(target.email, target.password);
  };

  const logout = async () => {
    if (dbEnabled && supabase) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCurrentRole('buyer');
      setSelectedVehicle(null);
      addToast('Signed out successfully. Browsing as guest.', 'info');
      return;
    }
    setCurrentUser(null);
    setCurrentRole('buyer');
    localStorage.removeItem('vss_current_user');
    addToast('Signed out successfully. Browsing as guest.', 'info');
  };

  // Submit a registration request. Nothing is activated until an admin
  // approves it from the Access & Users console — only then can the user
  // sign in to bid or sell.
  const register = async (userData) => {
    const email = normalizedEmail(userData.email);
    if (!email) {
      addToast('A valid email is required.', 'error');
      return false;
    }
    if (findAccount(email)) {
      addToast('An account already exists for this email. Please sign in instead.', 'error');
      return false;
    }
    if (registrationRequests.some(r => normalizedEmail(r.email) === email && r.status === 'pending')) {
      addToast('A registration request for this email is already awaiting review.', 'info');
      return false;
    }

    if (dbEnabled && supabase) {
      // The auth user is created immediately but its profile starts as
      // 'pending', so it cannot be used until an admin approves the request.
      const { error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            name: userData.name || 'New Member',
            role: userData.role === 'seller' ? 'seller' : 'buyer',
            phone: userData.phone || null,
          },
        },
      });
      if (error) {
        addToast(error.message || 'Could not submit the registration request.', 'error');
        return false;
      }
      // Enqueue the review item for the admin console. The password never
      // enters the request table — credentials live only in Supabase Auth.
      try {
        await supabase.from('registration_requests').insert({
          name: userData.name || 'New Member',
          email: userData.email.trim(),
          phone: userData.phone || null,
          role: userData.role === 'seller' ? 'seller' : 'buyer',
          status: 'pending',
        });
      } catch (e) {
        console.warn('[VSS] could not enqueue registration request', e);
      }
      // Do not leave the pending user signed in.
      await supabase.auth.signOut();
      setIsLoginModalOpen(false);
      addToast('📨 Registration request submitted! You can sign in once an administrator approves it.', 'success');
      return true;
    }

    // Offline path: the request stores the chosen password so the approving
    // admin activates a ready-to-use account (demo only — never do this in
    // production).
    const request = {
      id: `req-${Date.now()}`,
      name: userData.name || 'New Member',
      email: userData.email.trim(),
      phone: userData.phone || '',
      password: userData.password || '',
      role: userData.role === 'seller' ? 'seller' : 'buyer',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      note: null
    };
    setRegistrationRequests(prev => [request, ...prev]);
    addToast('📨 Registration request submitted! An administrator will review it — you can sign in once approved.', 'success');
    return true;
  };

  // ------------------------------------------------------------------
  // Admin access-control actions (offline list + DB table stay in sync
  // with the same signatures so the console does not branch).
  // ------------------------------------------------------------------
  const approveRequest = async (requestId) => {
    const request = registrationRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;
    const reviewedAt = new Date().toISOString();
    const reviewedBy = currentUser?.email || 'admin';

    if (dbEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('registration_requests')
          .update({ status: 'approved', reviewed_at: reviewedAt, reviewed_by: reviewedBy })
          .eq('id', requestId);
        if (error) throw error;
        // Flip the profile row so the user can now sign in (RLS lets admins
        // update other profiles).
        const { data: prof } = await supabase
          .from('profiles').select('id').eq('email', request.email).maybeSingle();
        if (prof?.id) {
          const { error: pErr } = await supabase
            .from('profiles').update({ status: 'approved' }).eq('id', prof.id);
          if (pErr) throw pErr;
        }
        setRegistrationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
        addToast(`✅ Approved: ${request.name} can now sign in and ${request.role === 'seller' ? 'list vehicles' : 'place bids'}.`, 'success');
      } catch (e) {
        addToast('Approve failed: ' + e.message, 'error');
      }
      return;
    }

    // Offline: approving the request mints the real, ready-to-use account.
    if (findAccount(request.email)) {
      addToast('An account with this email already exists.', 'error');
      return;
    }
    const meta = ROLE_META[request.role] || ROLE_META.buyer;
    const newAccount = {
      id: `acc-${Date.now()}`,
      name: request.name,
      email: request.email,
      password: request.password || 'vss1234',
      role: request.role,
      badge: meta.badge,
      avatar: meta.avatar,
      phone: request.phone || '',
      status: 'active',
      createdAt: reviewedAt
    };
    setAccounts(prev => [...prev, newAccount]);
    setRegistrationRequests(prev => prev.map(r => r.id === requestId ? {
      ...r, status: 'approved', reviewedAt, reviewedBy
    } : r));
    addToast(`✅ Approved: ${request.name} can now sign in and ${request.role === 'seller' ? 'list vehicles' : 'place bids'}.`, 'success');
  };

  const rejectRequest = async (requestId, note) => {
    const request = registrationRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;
    const reviewedAt = new Date().toISOString();
    const reviewedBy = currentUser?.email || 'admin';

    if (dbEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('registration_requests')
          .update({ status: 'rejected', note: note || null, reviewed_at: reviewedAt, reviewed_by: reviewedBy })
          .eq('id', requestId);
        if (error) throw error;
      } catch (e) {
        addToast('Reject failed: ' + e.message, 'error');
        return;
      }
    }
    setRegistrationRequests(prev => prev.map(r => r.id === requestId ? {
      ...r, status: 'rejected', note: note || null, reviewedAt, reviewedBy
    } : r));
    addToast(`🚫 Registration request from ${request.email} rejected.`, 'warning');
  };

  // Super-user only: create an active account directly, bypassing the request
  // queue. DB mode signs the new user up with the given password and then
  // restores the administrator's own session (signUp would otherwise replace
  // it with the new user's session when auto-confirm is on).
  const createUser = async ({ name, email, phone, password, role }) => {
    const cleanEmail = normalizedEmail(email);
    if (!cleanEmail || !password) {
      addToast('Email and password are required.', 'error');
      return false;
    }
    if (findAccount(cleanEmail)) {
      addToast('An account with this email already exists.', 'error');
      return false;
    }
    const meta = ROLE_META[role] || ROLE_META.buyer;
    const newAccount = {
      id: `acc-${Date.now()}`,
      name: (name || '').trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      password,
      role: role || 'buyer',
      badge: meta.badge,
      avatar: meta.avatar,
      phone: (phone || '').trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (dbEnabled && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const adminSession = sessionData?.session;
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: newAccount.name, role: newAccount.role, phone: newAccount.phone || null } },
        });
        if (error) throw error;
        if (adminSession?.access_token) {
          await supabase.auth.signOut();
          await supabase.auth.setSession({
            access_token: adminSession.access_token,
            refresh_token: adminSession.refresh_token,
          });
        }
        // Newly created users are immediately usable (profiles.status starts
        // 'pending', so flip it the same way an approval would).
        const { data: prof } = await supabase
          .from('profiles').select('id').eq('email', cleanEmail).maybeSingle();
        if (prof?.id) {
          await supabase.from('profiles').update({ status: 'approved' }).eq('id', prof.id);
        }
        addToast(`✅ User ${newAccount.email} created with role ${newAccount.role}.`, 'success');
        return true;
      } catch (e) {
        addToast('Create user failed: ' + e.message, 'error');
        return false;
      }
    }

    setAccounts(prev => [...prev, newAccount]);
    addToast(`✅ User ${newAccount.email} created with role ${newAccount.role}. They can sign in immediately.`, 'success');
    return true;
  };

  // Reset / refresh. Offline: restore the pristine seed. DB: drop the local
  // optimistic view and re-read the shared source of truth.
  const resetDemoData = async () => {
    if (dbEnabled && supabase) {
      try {
        const [vs, tel] = await Promise.all([api.fetchVehicles(supabase), api.fetchTelemetry(supabase)]);
        setVehicles(vs);
        if (tel) setTelemetry(tel);
        setSelectedVehicle(null);
        addToast('🔄 Shared catalogue refreshed.', 'info');
      } catch (e) {
        addToast('Refresh failed: ' + e.message, 'error');
      }
      return;
    }
    ['vss_vehicles', 'vss_telemetry', 'vss_current_user', 'vss_accounts', 'vss_registration_requests']
      .forEach((key) => localStorage.removeItem(key));
    setVehicles(INITIAL_VEHICLES);
    setTelemetry(INITIAL_TELEMETRY);
    setAccounts(DEFAULT_ACCOUNTS);
    setRegistrationRequests([]);
    setCurrentUser(null);
    setCurrentRole('buyer');
    setSelectedVehicle(null);
    setSearchQuery('');
    setSelectedMake('all');
    setSelectedBodyType('all');
    setSelectedListingType('all');
    setOnlyVerified(true);
    setAdminActiveTab('verification');
    addToast('♻️ Demo data reset to the factory seed.', 'info');
  };

  // ------------------------------------------------------------------
  // Mutations
  // ------------------------------------------------------------------
  const placeBid = async (vehicleId, amount, bidderName = 'You (Verified Buyer)') => {
    // Access gate (shared by both data modes): bidding needs a signed-in,
    // approved Buyer account. Guests are routed to sign-in / request access.
    if (!currentUser) {
      addToast('Please sign in to place a bid — new users can request access below.', 'info');
      setIsLoginModalOpen(true);
      return;
    }
    if (currentUser.role !== 'buyer') {
      addToast('Bidding requires an approved Buyer account.', 'error');
      return;
    }
    if (dbEnabled && supabase) {
      const veh = vehicles.find(v => v.id === vehicleId);
      const numeric = Number(amount);
      const current = veh ? (veh.currentBid || 0) : 0;
      if (!Number.isFinite(numeric) || numeric <= current) {
        addToast(`Bid must exceed current highest bid of ${formatLKR(current)}`, 'error');
        return;
      }
      try {
        await api.insertBid(supabase, {
          listingId: vehicleId,
          bidderId: currentUser.id,
          bidderName: bidderName || currentUser.name,
          amount: numeric,
        });
        try { confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } }); } catch (e) {}
        addToast(`🎉 Bid of ${formatLKR(numeric)} placed successfully!`, 'success');
        // The server trigger updates the listing; Realtime refreshes the UI.
      } catch (e) {
        addToast('Bid failed: ' + e.message, 'error');
      }
      return;
    }

    // Offline path. Resolve the outcome first, then commit state in a *pure*
    // updater. Side effects (confetti/toast/selected-vehicle) fire once outside
    // setVehicles so React StrictMode's double-invoke cannot duplicate them.
    const target = vehicles.find(v => v.id === vehicleId);
    if (!target) return;

    if (amount <= (target.currentBid || 0)) {
      addToast(`Bid must exceed current highest bid of ${formatLKR(target.currentBid || 0)}`, 'error');
      return;
    }

    let newEndsAt = target.auctionEndsAt;
    const msRemaining = new Date(target.auctionEndsAt).getTime() - Date.now();
    const twoMinutesMs = 2 * 60 * 1000;
    const antiSnipeTriggered = msRemaining > 0 && msRemaining < twoMinutesMs;
    if (antiSnipeTriggered) {
      newEndsAt = new Date(Date.now() + twoMinutesMs + 60000).toISOString();
    }

    const isReserveMet = target.reservePrice ? amount >= target.reservePrice : true;
    const newBid = {
      id: `bid-${Date.now()}`,
      bidder: bidderName,
      amount: amount,
      time: 'Just now',
      isWinning: true
    };
    const updatedBids = [newBid, ...(target.bids || []).map(b => ({ ...b, isWinning: false }))];

    setVehicles(prev => prev.map(veh => veh.id === vehicleId ? {
      ...veh,
      currentBid: amount,
      bidCount: (veh.bidCount || 0) + 1,
      isReserveMet,
      auctionEndsAt: newEndsAt,
      bids: updatedBids
    } : veh));

    setTelemetry(prev => ({
      ...prev,
      trafficByDay: (prev.trafficByDay || []).map((d, i, arr) =>
        i === arr.length - 1 ? { ...d, bidsPlaced: (d.bidsPlaced || 0) + 1 } : d
      )
    }));

    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle(prev => (prev ? {
        ...prev,
        currentBid: amount,
        bidCount: (prev.bidCount || 0) + 1,
        isReserveMet,
        auctionEndsAt: newEndsAt,
        bids: updatedBids
      } : prev));
    }

    try { confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } }); } catch (e) {}
    if (antiSnipeTriggered) {
      addToast('⚡ Anti-Sniping Activated: Auction extended by 2 minutes!', 'warning');
    } else {
      addToast(`🎉 Bid of ${formatLKR(amount)} placed successfully!`, 'success');
    }
  };

  const addVehicle = async (newVehData) => {
    // Access gate (shared by both data modes): listing a vehicle needs a
    // signed-in, approved Seller account.
    if (!currentUser) {
      addToast('Please sign in to list a vehicle — new users can request access below.', 'info');
      setIsLoginModalOpen(true);
      return;
    }
    if (currentUser.role !== 'seller') {
      addToast('Listing a vehicle requires an approved Seller account.', 'error');
      return;
    }
    if (dbEnabled && supabase) {
      const basePrice = newVehData.startingPrice || newVehData.directPrice;
      const newVehicle = {
        id: `veh-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`,
        viewsCount: 1,
        bidCount: 0,
        currentBid: basePrice,
        isReserveMet: false,
        status: 'pending_verification',
        ...newVehData,
        verification: {
          status: 'pending',
          badge: 'Verification In Progress (Clean Title Audit)',
          submittedAt: new Date().toISOString(),
          cleanTitleDeclarationSigned: true,
          ...(newVehData.verification || {})
        }
      };
      delete newVehicle.bids; // bids live in their own table
      try {
        await api.insertListing(supabase, newVehicle, currentUser.id);
        addToast('📋 Listing submitted! VSS Title Bureau will audit ownership documents within 2 hours.', 'success');
      } catch (e) {
        addToast('Submit failed: ' + e.message, 'error');
      }
      return;
    }

    // Offline path (unchanged behaviour).
    const newVehicle = {
      id: `veh-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`,
      viewsCount: 1, bidCount: 0, bids: [],
      currentBid: newVehData.startingPrice || newVehData.directPrice,
      isReserveMet: false,
      status: 'pending_verification',
      ...newVehData,
      verification: {
        status: 'pending',
        badge: 'Verification In Progress (Clean Title Audit)',
        submittedAt: new Date().toISOString(),
        cleanTitleDeclarationSigned: true,
        ...newVehData.verification
      }
    };
    setVehicles(prev => [newVehicle, ...prev]);
    addToast('📋 Listing submitted! VSS Title Bureau will audit ownership documents within 2 hours.', 'success');
  };

  const approveVehicle = async (vehicleId) => {
    if (dbEnabled && supabase) {
      const veh = vehicles.find(v => v.id === vehicleId);
      if (!veh) return;
      try {
        await api.updateListing(supabase, vehicleId, {
          status: 'active',
          verification: {
            ...veh.verification,
            status: 'verified',
            badge: '100% Clean Title • Direct Registered Owner',
            verifiedAt: new Date().toISOString(),
            auditedBy: 'Senior Registrar - Title Assurance Bureau'
          }
        });
        addToast('✅ Clean Title Certified! Vehicle is now live in the verified marketplace.', 'success');
      } catch (e) { addToast('Action failed: ' + e.message, 'error'); }
      return;
    }
    setVehicles(prev => prev.map(veh => {
      if (veh.id !== vehicleId) return veh;
      return {
        ...veh, status: 'active',
        verification: {
          ...veh.verification, status: 'verified',
          badge: '100% Clean Title • Direct Registered Owner',
          verifiedAt: new Date().toISOString(),
          auditedBy: 'Senior Registrar - Title Assurance Bureau'
        }
      };
    }));
    addToast('✅ Clean Title Certified! Vehicle is now live in the verified marketplace.', 'success');
  };

  const rejectVehicle = async (vehicleId, reason) => {
    if (dbEnabled && supabase) {
      const veh = vehicles.find(v => v.id === vehicleId);
      if (!veh) return;
      try {
        await api.updateListing(supabase, vehicleId, {
          status: 'rejected',
          verification: {
            ...veh.verification,
            status: 'rejected',
            badge: 'REJECTED: Clean Title Audit Failed',
            rejectionReason: reason || 'Document name does not match seller identity. Registered-owner verification failed.'
          }
        });
        addToast('🚫 Vehicle rejected under the Clean Title Only policy.', 'error');
      } catch (e) { addToast('Action failed: ' + e.message, 'error'); }
      return;
    }
    setVehicles(prev => prev.map(veh => {
      if (veh.id !== vehicleId) return veh;
      return {
        ...veh, status: 'rejected',
        verification: {
          ...veh.verification, status: 'rejected',
          badge: 'REJECTED: Clean Title Audit Failed',
          rejectionReason: reason || 'Document name does not match seller identity. Registered-owner verification failed.'
        }
      };
    }));
    setTelemetry(prev => ({ ...prev, cleanTitleRejectedCount: (prev.cleanTitleRejectedCount || 0) + 1 }));
    addToast('🚫 Vehicle rejected under the Clean Title Only policy.', 'error');
  };

  const togglePlateMasking = async (vehicleId) => {
    if (dbEnabled && supabase) {
      const veh = vehicles.find(v => v.id === vehicleId);
      if (!veh) return;
      const nextVal = !veh.isPlateMasked;
      // This control is explicitly a privacy *simulation* ("Reveal (Demo)"). In
      // shared mode we must NOT persist it: RLS only lets the owner/admin write,
      // so a buyer's demo would fail with an error toast, and even a successful
      // write would flip another seller's real privacy setting. Toggle only the
      // locally-open modal copy for a visual demonstration.
      setSelectedVehicle(cur => (cur && cur.id === vehicleId ? { ...cur, isPlateMasked: nextVal } : cur));
      return;
    }
    // Offline: resolve next value first, then commit pure updates; keep the open
    // modal in sync outside the list updater.
    const target = vehicles.find(v => v.id === vehicleId);
    if (!target) return;
    const nextVal = !target.isPlateMasked;
    setVehicles(prev => prev.map(veh => veh.id === vehicleId ? { ...veh, isPlateMasked: nextVal } : veh));
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle(prev => (prev ? { ...prev, isPlateMasked: nextVal } : prev));
    }
  };

  const trackView = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (dbEnabled && supabase) {
      // Fire-and-forget; the counter arrives back through Realtime.
      api.incrementViews(supabase, vehicle.id).catch(() => {});
      return;
    }
    setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, viewsCount: (v.viewsCount || 0) + 1 } : v));
  };

  // Buyer star-rating for a vehicle. Accumulated into specs.ratingSum /
  // specs.ratingCount (jsonb) so it persists in both data modes.
  const rateVehicle = async (vehicleId, stars) => {
    const s = Number(stars);
    if (!Number.isFinite(s) || s < 1 || s > 5) return;
    const target = vehicles.find(v => v.id === vehicleId);
    if (!target) return;
    const specs = { ...(target.specs || {}) };
    const nextSpecs = {
      ...specs,
      ratingSum: Number(specs.ratingSum || 0) + s,
      ratingCount: Number(specs.ratingCount || 0) + 1
    };
    if (dbEnabled && supabase) {
      try {
        await api.updateListing(supabase, vehicleId, { specs: nextSpecs });
      } catch (e) {
        addToast('Rating failed: ' + e.message, 'error');
        return;
      }
    }
    setVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, specs: nextSpecs } : v)));
    if (selectedVehicle && selectedVehicle.id === vehicleId) {
      setSelectedVehicle(prev => (prev ? { ...prev, specs: nextSpecs } : prev));
    }
    addToast(`Thanks — you rated this vehicle ${s}★.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        telemetry,
        sponsorAds,
        currentRole,
        setCurrentRole,
        selectedVehicle,
        setSelectedVehicle,
        trackView,
        isLoanModalOpen,
        setIsLoanModalOpen,
        isPledgeModalOpen,
        setIsPledgeModalOpen,
        adminActiveTab,
        setAdminActiveTab,
        toasts,
        addToast,
        placeBid,
        addVehicle,
        approveVehicle,
        rejectVehicle,
        togglePlateMasking,
        rateVehicle,
        // Authentication & access control
        currentUser,
        setCurrentUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        theme,
        setTheme,
        toggleTheme,
        login,
        loginAsRole,
        logout,
        register,
        accounts,
        registrationRequests,
        refreshRequests,
        approveRequest,
        rejectRequest,
        createUser,
        // Role-capability helpers (super admin = admin powers + user creation)
        isModerator: !!currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin'),
        isSuperAdmin: !!currentUser && currentUser.role === 'super_admin',
        canBid: !!currentUser && currentUser.role === 'buyer',
        canSell: !!currentUser && currentUser.role === 'seller',
        resetDemoData,
        DEMO_USERS,
        dbEnabled,
        // Search & Filter
        searchQuery,
        setSearchQuery,
        selectedMake,
        setSelectedMake,
        selectedBodyType,
        setSelectedBodyType,
        selectedListingType,
        setSelectedListingType,
        onlyVerified,
        setOnlyVerified,
        selectedDistrict,
        setSelectedDistrict,
        selectedCity,
        setSelectedCity,
        selectedPriceBand,
        setSelectedPriceBand,
        inquiries,
        addInquiry,
        updateInquiryStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

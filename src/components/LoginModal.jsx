import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { dbEnabled, getSupabase } from '../lib/supabase';
import {
  X, ShieldCheck, User, Lock, Mail, Phone, CheckCircle2,
  KeyRound, Sparkles, UserCheck, Eye, EyeOff, Clock, Search, Hourglass
} from 'lucide-react';

// Human label + colour for each registration-request status.
const REQUEST_STATUS_META = {
  pending: { label: 'Pending review', color: 'var(--accent-gold)', icon: Hourglass },
  approved: { label: 'Approved — you can sign in now', color: 'var(--accent-green)', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'var(--accent-red)', icon: X },
};

export const LoginModal = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    login,
    loginAsRole,
    register,
    registrationRequests,
    DEMO_USERS,
    dbEnabled
  } = useApp();

  const [authTab, setAuthTab] = useState('signin'); // 'signin' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Request Access Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('buyer'); // 'buyer' | 'seller'
  const [directOwnerPledge, setDirectOwnerPledge] = useState(false);

  // Request tracker state
  const [trackEmail, setTrackEmail] = useState('');
  const [trackResult, setTrackResult] = useState(null); // { status, note } | 'not_found'

  if (!isLoginModalOpen) return null;

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    if (!signInEmail) return;
    login(signInEmail, signInPassword);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    if (regPassword.length < 6) return;
    if (!directOwnerPledge) {
      alert('You must accept the direct-owner integrity pledge to register.');
      return;
    }
    const ok = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole
    });
    // Back to sign-in: nothing is usable until an admin approves, and the
    // visitor should land where they will return after approval.
    if (ok) {
      setAuthTab('signin');
      setSignInEmail(regEmail);
      setRegPassword(''); setRegName(''); setRegEmail(''); setRegPhone('');
      setDirectOwnerPledge(false);
    }
  };

  // Look up where a request stands. Offline reads the local queue; DB mode
  // queries the shared registration_requests table by email.
  const handleTrackRequest = async (e) => {
    e.preventDefault();
    const email = trackEmail.trim().toLowerCase();
    if (!email) return;
    setTrackResult(null);
    if (dbEnabled) {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from('registration_requests')
        .select('status, note')
        .eq('email', email)
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setTrackResult(data ? { status: data.status, note: data.note } : 'not_found');
      return;
    }
    const found = [...registrationRequests]
      .reverse()
      .find(r => (r.email || '').toLowerCase() === email);
    setTrackResult(found ? { status: found.status, note: found.note } : 'not_found');
  };

  return (
    <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
      <div
        className="modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '32px' }}
      >
        <button className="modal-close-btn" onClick={() => setIsLoginModalOpen(false)}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
            color: '#050b14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)'
          }}>
            <ShieldCheck size={30} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
            {authTab === 'signin' ? 'Welcome Back to VSS' : 'Request Verified Access'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Clean Title Only • Direct Owner Vehicle Marketplace
          </p>
        </div>

        {/* 1-Click Fast Demo Logins Section (demo / offline only) */}
        {!dbEnabled && (
        <div style={{
          background: 'rgba(0, 229, 255, 0.04)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              One-Click Instant Role Login (Demo Ready)
            </span>
          </div>

          <div className="r-cols-3" style={{ gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 6px', fontSize: '0.75rem', flexDirection: 'column', gap: '3px' }}
              onClick={() => loginAsRole('super_admin')}
              title="Sign in as the default Super User"
            >
              <span style={{ fontSize: '1rem' }}>🛡️</span>
              <strong>Super Admin</strong>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)' }}>Approve & Manage</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 6px', fontSize: '0.75rem', flexDirection: 'column', gap: '3px' }}
              onClick={() => loginAsRole('seller')}
              title="Sign in as Verified Direct Owner"
            >
              <span style={{ fontSize: '1rem' }}>🚗</span>
              <strong>Direct Seller</strong>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)' }}>List & Title</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 6px', fontSize: '0.75rem', flexDirection: 'column', gap: '3px' }}
              onClick={() => loginAsRole('buyer')}
              title="Sign in as Verified Bidder"
            >
              <span style={{ fontSize: '1rem' }}>🏷️</span>
              <strong>Verified Buyer</strong>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>Bid & Buy</span>
            </button>
          </div>
        </div>
        )}

        {/* Tab Switcher: Sign In vs Request Access */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-inset)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: authTab === 'signin' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: authTab === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
            onClick={() => setAuthTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: authTab === 'register' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: authTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
            onClick={() => setAuthTab('register')}
          >
            Request Access
          </button>
        </div>

        {/* TAB 1: SIGN IN */}
        {authTab === 'signin' && (
          <>
          <form onSubmit={handleSignInSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. super@vss.auto, buyer@clean.com"
                  style={{ paddingLeft: '42px' }}
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', cursor: 'pointer' }}
                  onClick={() => dbEnabled
                    ? alert('Accounts are activated by a VSS administrator. If you cannot sign in, track your request below or contact the bureau.')
                    : alert('Demo passwords:\nsuper@vss.auto → "Super@123"\nadmin@vss.auto → "admin"\nseller@direct.com → "seller"\nbuyer@clean.com → "buyer"')}
                >
                  {dbEnabled ? 'Cannot sign in?' : 'Forgot / Demo Credentials?'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your account password"
                  style={{ paddingLeft: '42px', paddingRight: '40px' }}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '15px', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', marginTop: '10px' }}>
              <KeyRound size={16} />
              <span>Sign In to Platform</span>
            </button>

            {!dbEnabled && (
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Quick Hint: You can also click any of the <strong>One-Click Role buttons</strong> above!
            </div>
            )}
          </form>

          {/* Track a registration request */}
          <div className="request-tracker-box" style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Clock size={14} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Track Your Access Request
              </span>
            </div>
            <form onSubmit={handleTrackRequest} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                className="form-input"
                style={{ height: '40px', fontSize: '0.85rem' }}
                placeholder="Email used in the request"
                value={trackEmail}
                onChange={(e) => { setTrackEmail(e.target.value); setTrackResult(null); }}
                required
              />
              <button type="submit" className="btn-secondary" style={{ padding: '0 14px', height: '40px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <Search size={14} />
                <span>Check</span>
              </button>
            </form>
            {trackResult && (
              <div style={{ marginTop: '10px' }}>
                {trackResult === 'not_found' ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No request found for this email.
                  </span>
                ) : (
                  (() => {
                    const meta = REQUEST_STATUS_META[trackResult.status] || REQUEST_STATUS_META.pending;
                    const Icon = meta.icon;
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: meta.color }}>
                        <Icon size={15} />
                        <span>{meta.label}</span>
                        {trackResult.status === 'rejected' && trackResult.note && (
                          <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {trackResult.note}</span>
                        )}
                      </span>
                    );
                  })()
                )}
              </div>
            )}
          </div>
          </>
        )}

        {/* TAB 2: REQUEST ACCESS (admin approval required before first login) */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{
              background: 'rgba(255, 184, 0, 0.06)',
              border: '1px solid rgba(255, 184, 0, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <UserCheck size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--accent-gold)' }}>Approval workflow:</strong> submitting this form sends a
                registration request to the VSS administration. You will only be able to
                sign in to <strong>bid</strong> or <strong>sell</strong> after an administrator approves it.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name (Matches Government ID)</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Priyantha Silva"
                  style={{ paddingLeft: '42px' }}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. priyantha@example.com"
                  style={{ paddingLeft: '42px' }}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (SMS OTP Verification)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. +94 77 123 4567"
                  style={{ paddingLeft: '42px' }}
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Choose a Password (min 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Used to sign in after approval"
                  minLength={6}
                  style={{ paddingLeft: '42px' }}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Account Role Choice */}
            <div className="form-group">
              <label className="form-label">Primary Account Role</label>
              <div className="r-cols-2" style={{ gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: regRole === 'buyer' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: regRole === 'buyer' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                    color: regRole === 'buyer' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                  onClick={() => setRegRole('buyer')}
                >
                  🏷️ Genuine Buyer
                </button>

                <button
                  type="button"
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: regRole === 'seller' ? '2px solid var(--accent-green)' : '1px solid var(--border-subtle)',
                    background: regRole === 'seller' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                    color: regRole === 'seller' ? 'var(--accent-green)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                  onClick={() => setRegRole('seller')}
                >
                  🚗 Direct Car Owner
                </button>
              </div>
            </div>

            {/* Direct Owner Integrity Pledge */}
            <div style={{
              background: 'rgba(255, 184, 0, 0.05)',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={directOwnerPledge}
                  onChange={(e) => setDirectOwnerPledge(e.target.checked)}
                  style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Direct Owner Declaration:</strong> I certify that I am a genuine private individual listing in my own name. I will NOT list a vehicle whose registered owner name differs from mine, and I will execute a full legal transfer on sale.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px' }}>
              <UserCheck size={16} />
              <span>Submit Registration Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

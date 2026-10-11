import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Gavel, Car, UserCheck, ShieldAlert, Sparkles, 
  PlusCircle, Activity, LogIn, LogOut, KeyRound, User, ChevronDown, Sun, Moon, Menu, X, Flag 
} from 'lucide-react';

export const Header = () => {
  const {
    currentRole,
    setCurrentRole,
    telemetry,
    setIsPledgeModalOpen,
    setIsLoanModalOpen,
    vehicles,
    currentUser,
    setIsLoginModalOpen,
    setSelectedListingType,
    logout,
    addToast,
    isModerator,
    canSell,
    dbEnabled,
    theme,
    setTheme
  } = useApp();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Access-gated surface switching: a guest or a user without the right
  // approved role is sent to sign-in / request access instead of the console.
  const openLoginHint = (what) => {
    setIsLoginModalOpen(true);
    addToast(`${what} requires an approved account — sign in, or submit a registration request.`, 'info');
  };

  const pendingVerificationCount = vehicles.filter(v => v.status === 'pending_verification').length;
  const activeAuctionsCount = vehicles.filter(v => v.listingType === 'auction' && v.status === 'active').length;

  // Nav entries render twice (inline on desktop/tablet, vertically in the phone
  // drawer), so they live in one array to keep both copies in sync.
  const navItems = [
    {
      key: 'marketplace',
      icon: Car,
      label: 'Marketplace',
      active: currentRole === 'buyer',
      onClick: () => setCurrentRole('buyer'),
    },
    {
      key: 'auctions',
      icon: Gavel,
      label: 'Auctions',
      badge: `${activeAuctionsCount} Live`,
      onClick: () => {
        setCurrentRole('buyer');
        // The arena is hidden while a non-auction filter is active, and the
        // buyer view has not painted yet, so clear the filter and scroll on
        // the next tick instead of looking the element up immediately.
        setSelectedListingType('all');
        setTimeout(() => {
          document.getElementById('live-auctions-section')
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      },
    },
    {
      key: 'policy',
      icon: ShieldCheck,
      iconColor: 'var(--accent-green)',
      label: 'Why Clean Title?',
      onClick: () => setIsPledgeModalOpen(true),
    },
    {
      key: 'finance',
      icon: Sparkles,
      iconColor: 'var(--accent-cyan)',
      label: 'Finance Calculator',
      onClick: () => setIsLoanModalOpen(true),
    },
  ];

  const renderNavLinks = (vertical = false) =>
    navItems.map((item) => {
      const Icon = item.icon;
      return (
        <button
          key={item.key}
          className={`${vertical ? 'mobile-menu-link' : 'nav-link'} ${item.active ? 'active' : ''}`}
          onClick={() => {
            item.onClick();
            if (vertical) setIsMobileMenuOpen(false);
          }}
        >
          <Icon size={vertical ? 18 : 16} color={item.iconColor} />
          <span>{item.label}</span>
          {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
        </button>
      );
    });

  // Role switcher is shared between the header cluster and the phone drawer.
  const renderRoleSwitcher = (closeAfter = false) => {
    const pick = (fn) => () => {
      fn();
      if (closeAfter) setIsMobileMenuOpen(false);
    };
    return (
      <div className="role-switcher-box">
        <button
          className={`role-btn ${currentRole === 'buyer' ? 'active' : ''}`}
          onClick={pick(() => setCurrentRole('buyer'))}
          title="Browse vehicles (bidding needs an approved buyer account)"
        >
          <Car size={13} />
          <span>Buyer</span>
        </button>

        <button
          className={`role-btn ${currentRole === 'seller' ? 'seller-active' : ''}`}
          onClick={pick(() => {
            if (canSell) setCurrentRole('seller');
            else openLoginHint('Selling');
          })}
          title="List your vehicle with title audit (approved sellers only)"
        >
          <PlusCircle size={13} />
          <span>Sell Car</span>
        </button>

        <button
          className={`role-btn ${(currentRole === 'admin' || currentRole === 'super_admin') ? 'admin-active' : ''}`}
          onClick={pick(() => {
            if (isModerator) setCurrentRole('admin');
            else openLoginHint('The admin console');
          })}
          title="Admin console (administrators & super user only)"
        >
          <UserCheck size={13} />
          <span>Admin</span>
          {isModerator && pendingVerificationCount > 0 && (
            <span style={{
              background: 'var(--accent-red)',
              color: '#fff',
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '999px'
            }}>
              {pendingVerificationCount}
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <header className="top-header">
      <div className="container header-container">
        {/* Brand Logo */}
        <div className="logo-brand" onClick={() => setCurrentRole('buyer')}>
          <div className="logo-icon-box">
            <ShieldCheck size={26} strokeWidth={2.4} />
          </div>
          <div className="brand-text-wrap">
            <div className="brand-name">
              VSS DIRECT <span className="brand-pill">VERIFIED</span>
            </div>
            <div className="brand-subtext">
              <ShieldCheck size={12} />
              <span>Clean Title Only • Direct Owner Verified</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu — inline on desktop/tablet, drawer on phones */}
        <nav className="nav-menu">{renderNavLinks(false)}</nav>

        {/* Header Right: Telemetry, Theme, Role Switcher, and Auth */}
        <div className="header-right">
          {/* Live Visitor Indicator */}
          <div className="live-visitor-pill">
            <Activity size={12} className="pulse-icon" />
            <span><strong>{telemetry.activeLiveVisitors}</strong> Live</span>
          </div>

          {/* Theme switcher — Nikoba (light), VSS dark, and the racing skin */}
          <div className="theme-toggle-box" role="group" aria-label="Colour theme">
            <button
              className={`theme-toggle-btn ${theme === 'nikoba' ? 'active' : ''}`}
              onClick={() => setTheme('nikoba')}
              title="Nikoba light theme"
              aria-label="Nikoba light theme"
            >
              <Sun size={15} />
            </button>
            <button
              className={`theme-toggle-btn ${theme === 'vss-dark' ? 'active' : ''}`}
              onClick={() => setTheme('vss-dark')}
              title="VSS dark theme"
              aria-label="VSS dark theme"
            >
              <Moon size={15} />
            </button>
            <button
              className={`theme-toggle-btn ${theme === 'racing' ? 'active' : ''}`}
              onClick={() => setTheme('racing')}
              title="Racing theme"
              aria-label="Racing theme"
            >
              <Flag size={15} />
            </button>
          </div>

          {/* Quick Role Switcher Pill — demo-only convenience that still
              respects access control. With the shared backend the active role
              is fixed by the signed-in account, never user-switchable. */}
          {!dbEnabled && renderRoleSwitcher(false)}

          {/* Login / Profile Section */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px 4px 6px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: currentUser.role === 'admin' ? 'rgba(255, 184, 0, 0.2)' : (currentUser.role === 'seller' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(0, 229, 255, 0.2)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem'
                }}>
                  {currentUser.avatar || '👤'}
                </div>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(currentUser.name || 'Member').split(' ')[0]}
                  </span>
                  <span style={{ 
                    fontSize: '0.62rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: currentUser.role === 'admin' || currentUser.role === 'super_admin' ? 'var(--accent-gold)' : (currentUser.role === 'seller' ? 'var(--accent-green)' : 'var(--accent-cyan)')
                  }}>
                    {currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role}
                  </span>
                </div>

                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '220px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {currentUser.email}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-green)', fontWeight: 600, marginTop: '2px' }}>
                      {currentUser.badge}
                    </div>
                  </div>

                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', fontSize: '0.82rem', color: 'var(--text-secondary)', borderRadius: '4px', textAlign: 'left' }}
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                  >
                    <KeyRound size={14} color="var(--accent-cyan)" />
                    <span>Switch Role / Account</span>
                  </button>

                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', fontSize: '0.82rem', color: 'var(--accent-red)', borderRadius: '4px', textAlign: 'left' }}
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', height: '36px' }}
              onClick={() => setIsLoginModalOpen(true)}
            >
              <LogIn size={15} />
              <span>Login / Sign In</span>
            </button>
          )}

          {/* Hamburger — collapses nav + role switcher into a drawer on phones */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer: vertical nav + role switcher (phones only) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-panel">
          <nav className="mobile-menu-nav">{renderNavLinks(true)}</nav>
          {!dbEnabled && renderRoleSwitcher(true)}
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { TrustPillars } from './components/TrustPillars';
import { CompetitiveEdge } from './components/CompetitiveEdge';
import { MarketplaceGrid } from './components/MarketplaceGrid';
import { SellerStudio } from './components/SellerStudio';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { LegalPledgeModal } from './components/LegalPledgeModal';
import { LoanCalculatorModal } from './components/LoanCalculatorModal';
import { LoginModal } from './components/LoginModal';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, AlertCircle, RotateCcw, Lock, LogIn } from 'lucide-react';

// Safety net for gated surfaces: if state ever points at the seller studio or
// admin console without an approved account, render this instead of the view.
const AccessGate = ({ title, message, onSignIn }) => (
  <div className="container" style={{ padding: '70px 0' }}>
    <div className="access-gate-panel">
      <div className="access-gate-icon"><Lock size={30} /></div>
      <h3 style={{ fontSize: '1.4rem', margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 18px' }}>{message}</p>
      <button className="btn-primary" onClick={onSignIn}>
        <LogIn size={16} />
        <span>Sign In / Request Access</span>
      </button>
    </div>
  </div>
);

export function App() {
  const { currentRole, toasts, resetDemoData, isModerator, canSell, setIsLoginModalOpen } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Header />

      {/* Main Content Body */}
      <main style={{ flex: 1 }}>
        {currentRole === 'buyer' && (
          <>
            <HeroBanner />
            <TrustPillars />
            <MarketplaceGrid />
            <CompetitiveEdge />
          </>
        )}

        {currentRole === 'seller' && (
          canSell ? <SellerStudio /> : (
            <AccessGate
              title="Seller Access Required"
              message="Listing a vehicle requires an approved Seller account. Submit a registration request — once an administrator approves it, sign in to open the listing studio."
              onSignIn={() => setIsLoginModalOpen(true)}
            />
          )
        )}

        {(currentRole === 'admin' || currentRole === 'super_admin') && (
          isModerator ? <AdminDashboard /> : (
            <AccessGate
              title="Administrator Access Required"
              message="The moderation console is restricted to administrators and the super user. Sign in with an approved admin account to continue."
              onSignIn={() => setIsLoginModalOpen(true)}
            />
          )
        )}
      </main>

      {/* Modals */}
      <VehicleDetailModal />
      <LegalPledgeModal />
      <LoanCalculatorModal />
      <LoginModal />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-item">
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-green)" />}
            {toast.type === 'warning' && <AlertTriangle size={18} color="var(--accent-gold)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--accent-red)" />}
            {toast.type === 'info' && <Info size={18} color="var(--accent-cyan)" />}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#050b14'
              }}>
                <ShieldCheck size={20} />
              </div>
              <strong style={{ fontSize: '1.1rem' }}>VSS DIRECT AUTOMOBILE PLATFORM</strong>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Clean Title Only • Direct Owner Verified</span>
              <span>•</span>
              <span>100% Peer-to-Peer</span>
              <span>•</span>
              <span>Privacy Shield Protected</span>
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid var(--border-subtle)', 
            paddingTop: '20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.78rem', 
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <p>© {new Date().getFullYear()} VSS Marketplace. Direct automobile sourcing & live auctions. All rights reserved.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <p>Certified Legal Title Assurance Bureau</p>
              {/* Escape hatch: this app persists everything to localStorage, so a
                  bad saved value used to be impossible to recover from. */}
              <button
                onClick={() => {
                  if (window.confirm('Reset the demo? Locally saved listings, bids and telemetry are cleared and the factory seed is restored.')) {
                    resetDemoData();
                  }
                }}
                title="Clear saved demo data and restore the factory seed"
                className="footer-reset-btn"
              >
                <RotateCcw size={12} />
                <span>Reset demo data</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

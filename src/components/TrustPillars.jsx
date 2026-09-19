import React from 'react';
import { ShieldCheck, Users, EyeOff, Gavel } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TrustPillars = () => {
  const { setIsPledgeModalOpen } = useApp();

  return (
    <section className="trust-pillars-section">
      <div className="container">
        <div className="trust-grid">
          {/* Pillar 1: No Open Papers */}
          <div className="trust-card" onClick={() => setIsPledgeModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="trust-icon-box green">
              <ShieldCheck size={26} />
            </div>
            <h3 className="trust-title">No Open Papers Policy</h3>
            <p className="trust-desc">
              Every vehicle's Certificate of Registration (CR) is verified directly against the registered owner's 
              government ID. Zero curbstoners, blank transfer forms, or undisclosed finance liens.
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 600 }}>
              Learn our 3-tier title audit →
            </div>
          </div>

          {/* Pillar 2: Disintermediation */}
          <div className="trust-card">
            <div className="trust-icon-box cyan">
              <Users size={26} />
            </div>
            <h3 className="trust-title">0% Middleman Interference</h3>
            <p className="trust-desc">
              We cut out parasitic third-party dealers and street brokers who siphon 5% to 12% in hidden markups. 
              The financial savings go straight to the genuine buyer and seller.
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Average buyer saving: Rs 960,000+
            </div>
          </div>

          {/* Pillar 3: Privacy Protection */}
          <div className="trust-card">
            <div className="trust-icon-box purple">
              <EyeOff size={26} />
            </div>
            <h3 className="trust-title">Seller Privacy Shield</h3>
            <p className="trust-desc">
              License plates are automatically blurred on public listings. Personal phone numbers and home addresses 
              are guarded against scrapers and released only to verified bidders.
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
              Zero spam cold-calls
            </div>
          </div>

          {/* Pillar 4: Transparent Auctions */}
          <div className="trust-card">
            <div className="trust-icon-box gold">
              <Gavel size={26} />
            </div>
            <h3 className="trust-title">Anti-Sniping Live Auctions</h3>
            <p className="trust-desc">
              Real-time transparent bidding rooms with pseudonymous audit logs, reserve indicators, and soft-close 
              extensions to protect human bidders from last-second sniper bots.
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              2-min auto-extension buffer
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

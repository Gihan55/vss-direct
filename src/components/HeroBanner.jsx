import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR } from '../lib/currency';
import { ShieldCheck, Gavel, ArrowRight, DollarSign, Ban, Flame, Lock } from 'lucide-react';

export const HeroBanner = () => {
  const { setCurrentRole, trackView, vehicles, setIsPledgeModalOpen } = useApp();

  // Pick the top featured auction vehicle
  const featuredVehicle = vehicles.find(v => v.featured && v.listingType === 'auction') || vehicles[0];

  // Countdown calculation for featured card
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!featuredVehicle || !featuredVehicle.auctionEndsAt) return;

    const updateTimer = () => {
      const ms = new Date(featuredVehicle.auctionEndsAt).getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft('Auction Concluded');
        return;
      }
      const hrs = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((ms % (1000 * 60)) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [featuredVehicle]);

  return (
    <section className="hero-section">
      <div className="container hero-banner-inner">
        {/* Left Column: Mission & Core Value Proposition */}
        <div>
          <div className="policy-badge" onClick={() => setIsPledgeModalOpen(true)} style={{ cursor: 'pointer' }}>
            <ShieldCheck size={16} />
            <span>Strict Policy: 100% Direct Owner • Zero Open Papers</span>
          </div>

          <h1 className="hero-headline">
            The Ethical Automobile Marketplace. <br />
            <span className="highlight-cyan">Zero Middlemen. Pure Legal Title.</span>
          </h1>

          <p className="hero-subhead">
            Eliminating open-paper curbstoners and parasitic car-sale markups. We verify the registered owner's 
            Certificate of Registration (CR) directly against their government ID. Real market-clearing prices, 
            protected seller privacy, and transparent live bidding.
          </p>

          <div className="hero-cta-group">
            <button 
              className="btn-primary"
              onClick={() => {
                const el = document.getElementById('marketplace-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore Verified Cars</span>
              <ArrowRight size={18} />
            </button>

            <button 
              className="btn-gold"
              onClick={() => setCurrentRole('seller')}
            >
              <span>Sell Your Car (Direct P2P)</span>
            </button>

            <button 
              className="btn-secondary"
              onClick={() => setIsPledgeModalOpen(true)}
            >
              <ShieldCheck size={18} color="var(--accent-green)" />
              <span>How We Verify Title</span>
            </button>
          </div>

          {/* Key Metrics Row */}
          <div className="hero-stats-row">
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
                100%
              </div>
              <div className="stat-label">Clean Title Guaranteed</div>
            </div>

            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                Rs 98.5M
              </div>
              <div className="stat-label">Saved by Buyers vs Middlemen</div>
            </div>

            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
                38
              </div>
              <div className="stat-label">Open Paper Frauds Intercepted</div>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Live Auction Card */}
        {featuredVehicle && (
          <div className="hero-live-card">
            <div className="hero-card-header">
              <div className="live-badge">
                <Flame size={14} />
                <span>LIVE AUCTION</span>
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                border: '1px solid rgba(255, 184, 0, 0.3)'
              }}>
                ⏱ {timeLeft}
              </div>
            </div>

            <div className="hero-card-img-wrap">
              <img src={featuredVehicle.images[0]} alt={featuredVehicle.title} />
              <div className="plate-mask-banner">
                <Lock size={12} color="var(--accent-cyan)" />
                <span>Plate Masked for Privacy</span>
              </div>
            </div>

            <div className="hero-card-body">
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: 'var(--accent-green)', 
                fontSize: '0.76rem', 
                fontWeight: 600,
                marginBottom: '6px' 
              }}>
                <ShieldCheck size={14} />
                <span>CR Audited & Direct Owner Confirmed</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                {featuredVehicle.title}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Current High Bid ({featuredVehicle.bidCount || 0} bids)
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                    {formatLKR(featuredVehicle.currentBid)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Listed At
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {(featuredVehicle.specs?.city && featuredVehicle.specs?.district)
                      ? `${featuredVehicle.specs.city}, ${featuredVehicle.specs.district}`
                      : (featuredVehicle.location || 'Sri Lanka')}
                  </div>
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={() => trackView(featuredVehicle)}
              >
                <Gavel size={16} />
                <span>Inspect Clean Title & Bid</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

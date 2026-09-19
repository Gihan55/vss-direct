import React from 'react';
import { useApp } from '../context/AppContext';
import { VehicleCard } from './VehicleCard';
import { Search, Filter, ShieldCheck, Sparkles, AlertCircle, Award } from 'lucide-react';

export const MarketplaceGrid = () => {
  const { 
    vehicles, 
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
    sponsorAds,
    setIsLoanModalOpen
  } = useApp();

  // Distinct makes & body types for filters
  const makes = ['all', ...new Set(vehicles.map(v => v.make))];
  const bodyTypes = ['all', ...new Set(vehicles.map(v => v.bodyType))];

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    // Only show active approved vehicles on public marketplace
    if (v.status !== 'active') return false;

    if (onlyVerified && v.verification?.status !== 'verified') return false;

    if (selectedMake !== 'all' && v.make.toLowerCase() !== selectedMake.toLowerCase()) return false;
    if (selectedBodyType !== 'all' && v.bodyType.toLowerCase() !== selectedBodyType.toLowerCase()) return false;
    if (selectedListingType !== 'all' && v.listingType !== selectedListingType) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchMake = v.make.toLowerCase().includes(q);
      const matchModel = v.model.toLowerCase().includes(q);
      const matchLoc = v.location.toLowerCase().includes(q);
      return matchTitle || matchMake || matchModel || matchLoc;
    }

    return true;
  });

  const activeAuctions = filteredVehicles.filter(v => v.listingType === 'auction');

  // The arena highlights auctions whenever they are relevant to the current
  // filter. Whenever it is shown, the grid below must exclude those same
  // listings — otherwise every auction card renders twice.
  const showAuctionArena = activeAuctions.length > 0 && selectedListingType !== 'direct';
  const gridVehicles = showAuctionArena
    ? filteredVehicles.filter(v => v.listingType !== 'auction')
    : filteredVehicles;
  // Still surface the "no match" panel when nothing matched at all.
  const showGridSection = filteredVehicles.length === 0 || gridVehicles.length > 0;

  return (
    <section id="marketplace-section" style={{ padding: '40px 0 60px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header-wrap">
          <div className="section-title-group">
            <h2>Verified Automobile Marketplace</h2>
            <p className="section-subtitle">
              Browse 100% verified clean-title cars. Zero open-paper curbstoners. Genuine direct sellers only.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600 }}>
            <ShieldCheck size={18} />
            <span>Showing {filteredVehicles.length} Clean-Title Vehicles</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-filter-section">
          <div className="search-filter-bar">
            {/* Search Input */}
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by make, model, or keywords (e.g. Prado, Cayenne, Electric)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Make Filter */}
            <select 
              className="filter-select"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
            >
              <option value="all">All Makes</option>
              {makes.filter(m => m !== 'all').map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            {/* Body Type Filter */}
            <select 
              className="filter-select"
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
            >
              <option value="all">All Body Types</option>
              {bodyTypes.filter(b => b !== 'all').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Listing Type Filter */}
            <select 
              className="filter-select"
              value={selectedListingType}
              onChange={(e) => setSelectedListingType(e.target.value)}
            >
              <option value="all">Auctions & Direct</option>
              <option value="auction">Live Auctions Only</option>
              <option value="direct">Direct Buy Only</option>
            </select>

            {/* Clean Title Only Toggle */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer', 
              fontSize: '0.82rem',
              color: onlyVerified ? 'var(--accent-green)' : 'var(--text-muted)',
              fontWeight: 600,
              userSelect: 'none'
            }}>
              <input 
                type="checkbox" 
                checked={onlyVerified} 
                onChange={(e) => setOnlyVerified(e.target.checked)}
                style={{ accentColor: 'var(--accent-green)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>100% Verified Only</span>
            </label>
          </div>
        </div>

        {/* Live Auctions Section Anchor */}
        {showAuctionArena && (
          <div id="live-auctions-section" style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: 'var(--accent-gold)', 
                boxShadow: '0 0 8px var(--accent-gold)' 
              }}></span>
              <h3 style={{ fontSize: '1.4rem' }}>Live Bidding Arena ({activeAuctions.length})</h3>
            </div>

            <div className="vehicles-grid">
              {activeAuctions.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        )}

        {/* All / Direct Vehicles Section */}
        {showGridSection && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: 'var(--accent-cyan)', 
              boxShadow: '0 0 8px var(--accent-cyan)' 
            }}></span>
            <h3 style={{ fontSize: '1.4rem' }}>
              {selectedListingType === 'auction' ? 'All Auction Vehicles' : 'Direct P2P & Fixed Price Showroom'}
            </h3>
          </div>

          {filteredVehicles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              background: 'var(--bg-card)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)'
            }}>
              <AlertCircle size={48} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
              <h3>No vehicles match your criteria</h3>
              <p style={{ marginTop: '6px' }}>Try adjusting your search terms or filter selection.</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {gridVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
        )}

        {/* Integrated Monetization & Partner Ads Row (Fulfills User "Growth & Ads" Requirement) */}
        {sponsorAds && sponsorAds.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Verified Partner Services & Financing (Platform Monetization)
              </span>
            </div>

            <div className="sponsor-ads-grid">
              {sponsorAds.map(ad => (
                <div 
                  key={ad.id}
                  className="sponsor-card"
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="sponsor-card-badge">
                        {ad.badge}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {ad.partner}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {ad.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                      {ad.tagline}
                    </p>
                  </div>

                  <button 
                    className="btn-secondary"
                    style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => setIsLoanModalOpen(true)}
                  >
                    <span>{ad.ctaText}</span>
                    <Sparkles size={14} color="var(--accent-gold)" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, toLKR } from '../lib/currency';
import { ShieldCheck, Gavel, Gauge, Fuel, Cog, MapPin, Lock, Eye, CheckCircle2, Star, Camera, Video } from 'lucide-react';

export const VehicleCard = ({ vehicle }) => {
  const { trackView } = useApp();
  const [countdown, setCountdown] = useState('');

  const isAuction = vehicle.listingType === 'auction';

  // Defensive defaults: a Supabase listing row may omit nested jsonb (verification,
  // seller) or scalar specs, and the images array can be empty.
  const coverImage = (vehicle.images && vehicle.images[0]) || '';
  const transmissionWord = (vehicle.transmission || '').split(' ')[0] || '—';
  const fuelWord = (vehicle.fuelType || '').split(' ')[0] || '—';
  const price = (isAuction ? vehicle.currentBid : vehicle.directPrice) || 0;
  const specs = vehicle.specs || {};
  const cardGrade = specs.conditionGrade || null;
  const cardRatingCount = Number(specs.ratingCount || 0);
  const cardRating = cardRatingCount > 0 ? (Number(specs.ratingSum || 0) / cardRatingCount) : null;
  const locationLabel = (specs.city && specs.district)
    ? `${specs.city}, ${specs.district}`
    : (vehicle.location || 'Location on request');

  useEffect(() => {
    if (!isAuction || !vehicle.auctionEndsAt) return;

    const calcTime = () => {
      const diff = new Date(vehicle.auctionEndsAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Ended');
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hrs}h ${mins}m ${secs}s`);
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [isAuction, vehicle.auctionEndsAt]);

  return (
    <div className="vehicle-card" onClick={() => trackView(vehicle)}>
      {/* Media Wrap */}
      <div className="card-media-wrap">
        <img src={coverImage} alt={vehicle.title} loading="lazy" />

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className="badge-tag verified">
            <ShieldCheck size={12} />
            <span>Clean Title Verified</span>
          </span>

          {isAuction ? (
            <span className="badge-tag auction">
              <Gavel size={12} />
              <span>Auction</span>
            </span>
          ) : (
            <span className="badge-tag direct">
              <span>Direct Buy</span>
            </span>
          )}
        </div>

        {/* Media richness chips — photo/video counts as a trust signal */}
        <div className="media-count-chips">
          <span className="media-count" title={`${(vehicle.images || []).length} photos`}>
            <Camera size={11} />
            <span>{(vehicle.images || []).length}</span>
          </span>
          {specs.videoUrl && (
            <span className="media-count" title="Owner video available">
              <Video size={11} />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Privacy Plate Masking Tag */}
        {vehicle.isPlateMasked && (
          <div className="plate-mask-banner" title="Registration plate auto-blurred to protect owner privacy">
            <Lock size={11} color="var(--accent-cyan)" />
            <span>Plate Masked</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="card-content-body">
        <h3 className="card-title" title={vehicle.title}>
          {vehicle.title}
        </h3>

        {/* Specs Row */}
        <div className="card-specs-row">
          <span><Gauge size={14} /> {(vehicle.mileage || 0).toLocaleString()} km</span>
          <span><Cog size={14} /> {transmissionWord}</span>
          <span><Fuel size={14} /> {fuelWord}</span>
        </div>

        {/* Legal Title Audit Pill */}
        <div className="clean-title-verified-pill">
          <CheckCircle2 size={14} color="var(--accent-green)" />
          <span>CR #{vehicle.verification?.registrationDocNumber || 'Pending'} • Direct 1st Owner</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '10px' }}>
          <MapPin size={13} />
          <span>{locationLabel}</span>
        </div>

        {/* Colour, condition grade & community rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          <span style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: '999px', padding: '2px 8px' }}>
            {vehicle.exteriorColor || '—'}
          </span>
          {cardGrade && (
            <span style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: '999px', padding: '2px 8px' }}>
              Grade {cardGrade}
            </span>
          )}
          {specs.contactMode === 'assisted' && (
            <span className="assisted-badge">VSS Assisted</span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--accent-gold)', fontWeight: 700 }}>
            <Star size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
            {cardRating !== null ? cardRating.toFixed(1) : 'New'}
          </span>
        </div>

        {/* Pricing Block */}
        <div className="card-pricing-block">
          <div>
            <div className="price-meta-label">
              {isAuction ? `High Bid (${vehicle.bidCount || 0} Bids)` : 'Direct Asking Price'}
            </div>
            <div className="current-price-display" style={{ color: isAuction ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
              {formatLKR(price)}
            </div>
            {/* Secondary value metric — rupees per km driven (LPW per-sqft style) */}
            {vehicle.mileage > 0 && price > 0 && (
              <div className="price-per-km">Rs {Math.round(toLKR(price) / vehicle.mileage).toLocaleString('en-US')} / km</div>
            )}
          </div>

          {isAuction ? (
            <div className="auction-countdown-chip">
              <span>⏱ {countdown}</span>
            </div>
          ) : (
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              <Eye size={14} />
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

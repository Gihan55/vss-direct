import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, toLKR, fromLKR } from '../lib/currency';
import { 
  X, ShieldCheck, Gavel, Lock, Unlock, CheckCircle2, AlertTriangle, 
  Clock, Gauge, Fuel, Cog, Award, DollarSign, UserCheck, Phone, FileText, Sparkles,
  MapPin, Star, Video, Camera
} from 'lucide-react';
import { DamageDiagram } from './DamageDiagram';

export const VehicleDetailModal = () => {
  const { 
    selectedVehicle, 
    setSelectedVehicle, 
    placeBid, 
    togglePlateMasking,
    rateVehicle,
    addInquiry,
    currentUser,
    setIsLoanModalOpen,
    setIsPledgeModalOpen,
    addToast
  } = useApp();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [customBid, setCustomBid] = useState('');
  const [offerValue, setOfferValue] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [countdown, setCountdown] = useState('');
  // VSS-assisted callback request form (first call goes through us).
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqNote, setInqNote] = useState('');

  // Every hook must run before any early return. Previously the
  // `if (!selectedVehicle) return null` guard sat above this useEffect, so
  // opening the modal changed the hook count and React threw
  // "rendered more hooks than during the previous render".
  const isAuction = selectedVehicle?.listingType === 'auction';
  const auctionEndsAt = selectedVehicle?.auctionEndsAt;

  useEffect(() => {
    if (!isAuction || !auctionEndsAt) return;

    const calc = () => {
      const ms = new Date(auctionEndsAt).getTime() - Date.now();
      if (ms <= 0) {
        setCountdown('Auction Ended');
        return;
      }
      const hrs = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((ms % (1000 * 60)) / 1000);
      setCountdown(`${hrs}h ${mins}m ${secs}s`);
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [isAuction, auctionEndsAt]);

  // Reset the gallery whenever a different vehicle is opened.
  useEffect(() => {
    setActiveImgIdx(0);
    // Pre-fill the callback form from the signed-in account when available.
    setInqName(selectedVehicle ? (currentUser?.name || '') : '');
    setInqPhone(selectedVehicle ? (currentUser?.phone || '') : '');
    setInqNote('');
  }, [selectedVehicle?.id]);

  if (!selectedVehicle) return null;

  // Safe aliases: a Supabase listing row may legitimately omit the nested
  // verification / seller jsonb or the images array, so never assume they exist.
  const images = selectedVehicle.images || [];
  const bids = selectedVehicle.bids || [];
  const verification = selectedVehicle.verification || {};
  const seller = selectedVehicle.seller || {};
  const currentBid = selectedVehicle.currentBid || 0;
  const minBid = isAuction ? currentBid + 250 : 0;
  const specs = selectedVehicle.specs || {};
  const locationLabel = (specs.city && specs.district)
    ? `${specs.city}, ${specs.district}`
    : (selectedVehicle.location || 'Not specified');
  // Google Maps embed works without an API key via the classic output=embed
  // endpoint. Prefer the seller's exact pin; fall back to a city/district query
  // so every listing shows a usable map.
  const hasPin = specs.mapLat != null && specs.mapLng != null && !isNaN(Number(specs.mapLat)) && !isNaN(Number(specs.mapLng));
  const mapQuery = hasPin ? `${specs.mapLat},${specs.mapLng}` : locationLabel.replace(/,\s*/g, ' ');
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=${hasPin ? 15 : 11}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const ratingCount = Number(specs.ratingCount || 0);
  const avgRating = ratingCount > 0 ? (Number(specs.ratingSum || 0) / ratingCount) : null;
  const conditionGrade = specs.conditionGrade || null;
  const displayRating = userRating || Math.round(avgRating ?? 0);

  const handleQuickBid = (increment) => {
    placeBid(selectedVehicle.id, currentBid + increment);
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    // The user enters an LKR figure; convert to the base unit before placing.
    const val = fromLKR(parseFloat(customBid));
    if (!Number.isFinite(val)) {
      addToast('Enter the bid value you want to place.', 'error');
      return;
    }
    // Buyer minimum value: a bid must meet the platform minimum increment.
    if (val < minBid) {
      addToast(`Buyer minimum bid value is ${formatLKR(minBid)} (current bid + one increment).`, 'error');
      return;
    }
    placeBid(selectedVehicle.id, val);
    setCustomBid('');
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedVehicle(null)} role="dialog" aria-modal="true" aria-label={selectedVehicle.title}>
      <div className="modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={() => setSelectedVehicle(null)} aria-label="Close details">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: '20px', paddingRight: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge-tag verified">
              <ShieldCheck size={14} />
              <span>{verification.badge || 'Title Under Review'}</span>
            </span>
            {isAuction ? (
              <span className="badge-tag auction">
                <Gavel size={14} />
                <span>Live Public Auction</span>
              </span>
            ) : (
              <span className="badge-tag direct">
                <span>Direct P2P Sale</span>
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '2rem', lineHeight: 1.2 }}>{selectedVehicle.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <MapPin size={14} color="var(--accent-cyan)" />
            <span>{locationLabel}</span>
            <span>• Views: {(selectedVehicle.viewsCount || 0).toLocaleString()}</span>
          </p>
        </div>

        {/* Sticky section quick-nav — jumps between the modal's panels */}
        <div className="detail-anchor-tabs">
          {[
            { id: 'vd-overview', label: 'Overview' },
            { id: 'vd-evidence', label: 'Condition & Evidence' },
            { id: 'vd-location', label: 'Location' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Gallery & Bidding/Action */}
        <div className="detail-main-grid">
          {/* Left: Gallery with Privacy Masking Demo */}
          <div>
            <div style={{ position: 'relative', height: '340px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000' }}>
              <img 
                src={images[activeImgIdx] || images[0]} 
                alt={selectedVehicle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Number Plate Mask Badge */}
              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                background: 'rgba(7, 9, 14, 0.9)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)'
              }}>
                {selectedVehicle.isPlateMasked ? (
                  <>
                    <Lock size={14} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Registration Plate: <strong>••••-•••• (Protected)</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <Unlock size={14} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      Plate: <strong>{selectedVehicle.licensePlate || 'N/A'} (Admin View)</strong>
                    </span>
                  </>
                )}

                <button 
                  onClick={() => togglePlateMasking(selectedVehicle.id)}
                  className="plate-toggle-btn"
                  title="Toggle plate blur simulation to demonstrate seller privacy protection"
                >
                  {selectedVehicle.isPlateMasked ? 'Reveal (Demo)' : 'Mask (Default)'}
                </button>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    style={{
                      width: '72px',
                      height: '52px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: activeImgIdx === idx ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      opacity: activeImgIdx === idx ? 1 : 0.6
                    }}
                  >
                    <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Specs Grid */}
            <div id="vd-overview" className="r-cols-3 anchor-target" style={{ 
              gap: '12px', 
              marginTop: '20px',
              background: 'var(--bg-inset)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Mileage</span>
                <strong style={{ fontSize: '0.95rem' }}>{(selectedVehicle.mileage || 0).toLocaleString()} km</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Engine</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedVehicle.engineCc || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Transmission</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedVehicle.transmission || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Fuel Type</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedVehicle.fuelType || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Exterior</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedVehicle.exteriorColor || '—'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Interior</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedVehicle.interiorColor || '—'}</strong>
              </div>
            </div>

            {/* Condition, Damage & Evidence (seller-disclosed) */}
            <div id="vd-evidence" className="anchor-target" style={{ marginTop: '20px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: '0.95rem' }}>Condition, Damage & Evidence</strong>
                {conditionGrade && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: '999px', padding: '2px 10px' }}>
                    Condition Grade {conditionGrade}
                  </span>
                )}
              </div>

              <DamageDiagram zones={specs.damageZones || []} noDamage={!!specs.noDamage} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {specs.odometerPhotoUrl && (
                  <a href={specs.odometerPhotoUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                    <Camera size={14} />
                    <span>Odometer photo</span>
                  </a>
                )}
                {specs.videoUrl && (
                  <a href={specs.videoUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                    <Video size={14} />
                    <span>Watch owner video</span>
                  </a>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Logbook / CR: <strong>{verification.registrationDocNumber || 'N/A'}</strong>
                </span>
              </div>

              {/* Buyer rating */}
              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Rate this vehicle:</span>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className="rating-star"
                    aria-label={`Rate ${n} star`}
                    onClick={() => { setUserRating(n); rateVehicle(selectedVehicle.id, n); }}
                  >
                    <Star size={16} fill={displayRating >= n ? 'var(--accent-gold)' : 'none'} color={displayRating >= n ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  </button>
                ))}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {avgRating !== null ? `${avgRating.toFixed(1)}★ (${ratingCount})` : 'Not rated yet'}
                </span>
              </div>
            </div>

            {/* Vehicle location — pinned Google Map for the viewing spot */}
            <div id="vd-location" className="anchor-target" style={{ marginTop: '20px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="var(--accent-cyan)" />
                  <span>Vehicle Location</span>
                </strong>
                <a href={mapLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  Open in Google Maps ↗
                </a>
              </div>
              <div className="listing-map-wrap">
                <iframe
                  title={`Map showing vehicle location: ${locationLabel}`}
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {hasPin
                  ? 'Pin placed by the seller at the exact spot where the vehicle can be inspected.'
                  : 'Approximate area shown — the seller has not dropped an exact pin.'}
                {' '}Always confirm the viewing address with the seller before travelling.
              </p>
            </div>
          </div>

          {/* Right: Bidding Console / Direct Purchase */}
          <div>
            {isAuction ? (
              <div className="bidding-console-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Live Auction Countdown
                  </span>
                  <span className="auction-countdown-chip">
                    <Clock size={12} />
                    <span>{countdown}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Current Highest Bid</span>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)' }}>
                      {formatLKR(currentBid)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {selectedVehicle.isReserveMet ? (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--accent-green)', 
                        fontWeight: 700, 
                        background: 'rgba(0, 230, 118, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 230, 118, 0.3)'
                      }}>
                        ✓ Reserve Met
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--accent-gold)', 
                        fontWeight: 700, 
                        background: 'rgba(255, 184, 0, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 184, 0, 0.3)'
                      }}>
                        Reserve Not Met
                      </span>
                    )}
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {selectedVehicle.bidCount || 0} Bids placed
                    </span>
                  </div>
                </div>

                {/* Soft-Close Anti-Sniping Notice */}
                <div style={{
                  background: 'rgba(0, 229, 255, 0.05)',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  fontSize: '0.76rem',
                  color: 'var(--accent-cyan)',
                  marginBottom: '14px',
                  lineHeight: 1.4
                }}>
                  🛡️ <strong>Anti-Sniping Engine:</strong> Any bid submitted within the last 2 minutes extends the timer by 2 minutes.
                </div>

                {/* Quick Increment Chips */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                  Instant One-Click Bid:
                </div>
                <div className="quick-bid-chips">
                  <button className="bid-chip-btn" onClick={() => handleQuickBid(250)}>
                    +{formatLKR(250)} ({formatLKR(currentBid + 250)})
                  </button>
                  <button className="bid-chip-btn" onClick={() => handleQuickBid(500)}>
                    +{formatLKR(500)} ({formatLKR(currentBid + 500)})
                  </button>
                  <button className="bid-chip-btn" onClick={() => handleQuickBid(1000)}>
                    +{formatLKR(1000)} ({formatLKR(currentBid + 1000)})
                  </button>
                </div>

                {/* Custom Bid Input Form */}
                <form onSubmit={handleCustomBidSubmit} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <input 
                    type="number" 
                    placeholder={`Custom Bid (min ${formatLKR(minBid)})`}
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    min={toLKR(minBid)}
                    step="15000"
                    className="form-input"
                    style={{ height: '42px', fontSize: '0.88rem' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0 18px', height: '42px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                    <Gavel size={15} />
                    <span>Place Bid</span>
                  </button>
                </form>

                {/* Transparent Bid History Log */}
                <div style={{ marginTop: '20px' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Transparent Public Bid Audit Trail
                  </span>
                  <div className="bid-history-list">
                    {bids.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px' }}>
                        No bids placed yet. Be the first to start the auction!
                      </div>
                    ) : (
                      bids.map((b, i) => (
                        <div key={b.id || i} className={`bid-history-row ${b.isWinning ? 'winning' : ''}`}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {b.isWinning && <Award size={13} color="var(--accent-green)" />}
                            <span style={{ fontWeight: b.isWinning ? 700 : 400 }}>{b.bidder}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ color: b.isWinning ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                              {formatLKR(b.amount)}
                            </strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{b.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Direct Sale Card */
              <div className="bidding-console-card" style={{ borderColor: 'rgba(0, 229, 255, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Direct Registered Owner Price
                </span>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: '6px 0 14px', fontFamily: 'var(--font-heading)' }}>
                  {formatLKR(selectedVehicle.directPrice)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%' }}
                    onClick={() => addToast(`Escrow purchase initiated for "${selectedVehicle.title}". Our title team will coordinate secure settlement directly with the registered owner.`, 'success')}
                  >
                    <ShieldCheck size={18} />
                    <span>Initiate Clean Title Escrow Purchase</span>
                  </button>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const offer = Number(offerValue);
                      const minOffer = Math.round(toLKR((selectedVehicle.directPrice || 0) * 0.8));
                      if (!Number.isFinite(offer) || offer <= 0) {
                        addToast('Enter the offer value you want to send.', 'error');
                        return;
                      }
                      // Buyer minimum value: counter offers below 80% of the
                      // asking price are rejected as low-ball spam.
                      if (offer < minOffer) {
                        addToast(`Buyer minimum offer value is Rs ${minOffer.toLocaleString()} (80% of asking).`, 'error');
                        return;
                      }
                      addToast(`Counter offer of Rs ${offer.toLocaleString()} sent to the registered owner for "${selectedVehicle.title}".`, 'info');
                      setOfferValue('');
                    }}
                    style={{ display: 'flex', gap: '8px' }}
                  >
                    <input
                      type="number"
                      className="form-input"
                      placeholder={`Your offer value (min Rs ${Math.round(toLKR((selectedVehicle.directPrice || 0) * 0.8)).toLocaleString()})`}
                      value={offerValue}
                      onChange={(e) => setOfferValue(e.target.value)}
                      style={{ height: '42px', fontSize: '0.88rem' }}
                    />
                    <button type="submit" className="btn-secondary" style={{ padding: '0 16px', height: '42px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                      <span>Send Offer</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Contact box — routing depends on the seller's choice:
                'assisted' listings take the first call through VSS agents,
                everything else keeps the shielded direct seller phone. */}
            {specs.contactMode === 'assisted' ? (
              <div style={{
                background: 'rgba(14, 19, 31, 0.8)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={18} color="var(--accent-green)" />
                    <strong style={{ fontSize: '0.92rem' }}>Seller identity protected</strong>
                  </div>
                  <span className="assisted-badge">VSS Assisted</span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                  <Phone size={13} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--accent-cyan)' }} />
                  <strong>We take the first call.</strong> Request a callback and a VSS digital agent will screen your enquiry, confirm the vehicle details with the owner, and connect you once the seller approves. Your number is never shown publicly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your name"
                    value={inqName}
                    onChange={e => setInqName(e.target.value)}
                  />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Phone for the callback (e.g. 077 123 4567)"
                    value={inqPhone}
                    onChange={e => setInqPhone(e.target.value)}
                  />
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Anything specific you want the agent to confirm? (optional)"
                    value={inqNote}
                    onChange={e => setInqNote(e.target.value)}
                    style={{ resize: 'vertical', minHeight: '48px' }}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      if (addInquiry({
                        vehicleId: selectedVehicle.id,
                        vehicleTitle: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
                        buyerName: inqName,
                        buyerPhone: inqPhone,
                        note: inqNote
                      })) {
                        setInqNote('');
                      }
                    }}
                  >
                    <Phone size={15} />
                    <span>Request First Call via VSS</span>
                  </button>
                </div>
              </div>
            ) : (
            <div style={{
              background: 'rgba(14, 19, 31, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="var(--accent-green)" />
                  <strong style={{ fontSize: '0.92rem' }}>{seller.name || 'Direct Owner'}</strong>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(0, 230, 118, 0.1)', color: 'var(--accent-green)', padding: '2px 6px', borderRadius: '4px' }}>
                    Verified Owner
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ★ {seller.rating ?? '5.0'}
                </span>
              </div>

              <div style={{ 
                background: 'var(--bg-inset)', 
                padding: '10px', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                marginBottom: '10px'
              }}>
                <Phone size={13} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--accent-cyan)' }} />
                <span>Phone: <strong>{seller.maskedPhone || 'Protected'}</strong> (Spam Shield Active)</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Seller phone unlocked automatically for highest verified bidder or formal offer.
                </div>
              </div>

              <button 
                className="btn-secondary" 
                style={{ width: '100%', fontSize: '0.82rem', padding: '8px' }}
                onClick={() => setIsLoanModalOpen(true)}
              >
                <Sparkles size={14} color="var(--accent-gold)" />
                <span>Estimate Monthly Loan Payment</span>
              </button>
            </div>
            )}
          </div>
        </div>

        {/* Core Feature: 3-Tier Clean Title & No Open Papers Audit Sheet */}
        <div className="title-verification-sheet">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: 'rgba(0, 230, 118, 0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-green)'
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>No Open Papers: Legal Title Assurance Report</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                  Audited by VSS Title Certification Bureau • 100% Legal Certainty
                </span>
              </div>
            </div>

            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              onClick={() => setIsPledgeModalOpen(true)}
            >
              <FileText size={14} />
              <span>Read Legal Guarantee</span>
            </button>
          </div>

          <div className="verification-check-grid">
            <div className="v-check-item">
              <CheckCircle2 size={16} className="check-icon" />
              <div>
                <strong>Certificate of Registration (CR) Match:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Document #{verification.registrationDocNumber || 'N/A'} matches Chassis #{verification.chassisNumber || 'N/A'}.
                </p>
              </div>
            </div>

            <div className="v-check-item">
              <CheckCircle2 size={16} className="check-icon" />
              <div>
                <strong>Identity Cross-Verification:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Registered Owner "{verification.registeredOwnerName || 'Under review'}" matches submitter ID ({verification.ownerIdNumber || 'N/A'}).
                </p>
              </div>
            </div>

            <div className="v-check-item">
              <CheckCircle2 size={16} className="check-icon" />
              <div>
                <strong>Non-Open-Paper Legal Undertaking:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Digital undertaking signed. Seller commits to direct physical transfer deed directly to buyer.
                </p>
              </div>
            </div>

            <div className="v-check-item">
              <CheckCircle2 size={16} className="check-icon" />
              <div>
                <strong>Finance & Lien Clearance:</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {verification.financeEmbargo || 'Clean Title Declared'}. Revenue license valid until {verification.revenueLicenseValidUntil || 'N/A'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

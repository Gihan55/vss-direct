import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fromLKR } from '../lib/currency';
import {
  COLOR_OPTIONS, INTERIOR_OPTIONS, DISTRICTS, cityPoolFor, CONDITION_GRADES
} from '../data/listingOptions';
import { DamageDiagram } from './DamageDiagram';
import { 
  ShieldCheck, Upload, Car, DollarSign, Lock, CheckCircle2, 
  AlertCircle, ArrowRight, ArrowLeft, Image as ImageIcon, Sparkles 
} from 'lucide-react';

export const SellerStudio = () => {
  const { addVehicle, setCurrentRole, vehicles, dbEnabled } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    make: 'Toyota',
    model: '',
    year: 2022,
    bodyType: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 35000,
    engineCc: '2000cc',
    exteriorColor: 'Pearl White Crystal',
    interiorColor: 'Black Leather',
    district: 'Colombo',
    city: 'Colombo 07',
    conditionGrade: 'B',
    damageZones: [],
    noDamage: false,
    videoUrl: '',
    odometerPhotoUrl: '',
    licensePlate: 'CBA-7712',
    isPlateMasked: true,
    listingType: 'auction', // 'auction' | 'direct'
    startingPrice: 10500000,
    reservePrice: 11700000,
    buyNowPrice: 12600000,
    directPrice: 11400000,
    listingTier: 'pro', // 'free' | 'pro' | 'urgent'
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
    ],
    // Verification Docs
    registrationDocNumber: 'CR-9921004-WP',
    chassisNumber: 'ZRE182-5091244',
    engineNumber: '2ZR-FE-90123',
    registeredOwnerName: '',
    ownerIdNumber: '',
    pledgeAccepted: false
  });

  const mySubmissions = vehicles.filter(v => v.status === 'pending_verification' || v.seller?.name?.includes('You'));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!formData.pledgeAccepted) {
      alert('You must accept the No Open Papers Legal Undertaking to list on VSS.');
      return;
    }

    const titleStr = formData.title || `${formData.year} ${formData.make} ${formData.model || 'Special Edition'}`;

    // Coerce numeric inputs and guard against NaN: clearing a number field
    // yields '' which parseInt coerces to NaN, and that used to be persisted
    // straight into the listing (and the shared DB row).
    const num = (v, fb = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fb;
    };
    const startingPrice = num(formData.startingPrice, num(formData.directPrice, 0));
    const directPrice = num(formData.directPrice, startingPrice);
    const yearNum = num(formData.year, 0);
    if (yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      alert('Please enter a realistic model year.');
      return;
    }
    if (formData.listingType === 'auction' && startingPrice <= 0) {
      alert('Please enter a starting bid greater than zero.');
      return;
    }
    if (formData.listingType === 'direct' && directPrice <= 0) {
      alert('Please enter an asking price greater than zero.');
      return;
    }
    if (!formData.odometerPhotoUrl || !formData.odometerPhotoUrl.trim()) {
      alert('A photographed odometer / meter reading is a mandatory field.');
      return;
    }
    if (!formData.noDamage && formData.damageZones.length === 0) {
      alert('Mark any damaged panels on the diagram, or tick "No damage to declare".');
      return;
    }
    if (!formData.district || !formData.city) {
      alert('Please select the vehicle district and city.');
      return;
    }

    addVehicle({
      title: titleStr,
      make: formData.make,
      model: formData.model || 'Premium Model',
      year: num(formData.year, new Date().getFullYear()),
      bodyType: formData.bodyType,
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      mileage: num(formData.mileage, 0),
      engineCc: formData.engineCc,
      exteriorColor: formData.exteriorColor,
      interiorColor: formData.interiorColor,
      location: `${formData.city} / ${formData.district}`,
      licensePlate: formData.licensePlate,
      isPlateMasked: formData.isPlateMasked,
      listingType: formData.listingType,
      // The form collects LKR figures; store the base unit so listings render
      // consistently with the rest of the marketplace (see lib/currency).
      startingPrice: fromLKR(startingPrice),
      reservePrice: fromLKR(num(formData.reservePrice, startingPrice)),
      buyNowPrice: fromLKR(num(formData.buyNowPrice, startingPrice)),
      directPrice: fromLKR(directPrice),
      currentBid: fromLKR(startingPrice),
      auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      images: formData.images,
      featured: formData.listingTier === 'pro' || formData.listingTier === 'urgent',
      seller: {
        id: 'sel-you',
        name: formData.registeredOwnerName || 'You (Registered Owner)',
        maskedPhone: '+94 77 ••• ••99',
        fullPhone: '+94 77 123 4567',
        memberSince: 'Today',
        rating: 5.0,
        directSellerConfirmed: true,
        brokerFlagScore: 0
      },
      verification: {
        status: 'pending',
        badge: 'Title Audit in Progress',
        submittedAt: new Date().toISOString(),
        registrationDocNumber: formData.registrationDocNumber,
        chassisNumber: formData.chassisNumber,
        engineNumber: formData.engineNumber,
        registeredOwnerName: formData.registeredOwnerName,
        ownerIdNumber: formData.ownerIdNumber,
        ownershipType: '1st Registered Owner',
        revenueLicenseValidUntil: '2027-12-31',
        financeEmbargo: 'None (Clean Title Declared)',
        noOpenPapersDeclarationSigned: true,
        titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      },
      specs: {
        seating: '5 Seater',
        drivetrain: 'FWD',
        sunroof: 'Panoramic',
        audio: 'Premium Audio',
        keys: '2 Smart Keys',
        serviceRecords: 'Complete agent records available',
        // Seller-declared condition & evidence. Kept in the `specs` jsonb so
        // both the offline demo and the Supabase backend persist them.
        district: formData.district,
        city: formData.city,
        conditionGrade: formData.conditionGrade,
        damageZones: formData.damageZones,
        noDamage: formData.noDamage,
        videoUrl: formData.videoUrl || null,
        odometerPhotoUrl: formData.odometerPhotoUrl
      }
    });

    setStep(5); // Success Screen
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Submissions still awaiting platform approval (admin must sign off
            before any listing goes live). */}
        {mySubmissions.length > 0 && (
          <div style={{
            background: 'rgba(255, 184, 0, 0.06)',
            border: '1px solid rgba(255, 184, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '20px',
            fontSize: '0.82rem'
          }}>
            <strong style={{ color: 'var(--accent-gold)' }}>Awaiting platform approval:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              {mySubmissions.length} submission(s) in the VSS Title Verification Queue. A listing goes
              live only after an administrator approves it.
            </span>
          </div>
        )}

        {/* Wizard Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="policy-badge">
            <ShieldCheck size={16} />
            <span>Direct P2P Vehicle Submission & Title Audit</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', marginTop: '8px' }}>Sell Your Vehicle Directly</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Zero middleman deductions. Your vehicle will be certified with our "No Open Papers" trust seal.
          </p>
        </div>

        {/* Wizard Progress Steps */}
        <div className="wizard-steps-header">
          <div className={`wizard-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Vehicle Specs</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: step > 1 ? 'var(--accent-green)' : 'var(--border-subtle)', margin: '0 8px' }}></div>

          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sale & Price</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: step > 2 ? 'var(--accent-green)' : 'var(--border-subtle)', margin: '0 8px' }}></div>

          <div className={`wizard-step-node ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Title Verification</span>
          </div>

          <div style={{ flex: 1, height: '2px', background: step > 3 ? 'var(--accent-green)' : 'var(--border-subtle)', margin: '0 8px' }}></div>

          <div className={`wizard-step-node ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 4 ? '✓' : '4'}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Privacy & Launch</span>
          </div>
        </div>

        {/* Step 1: Specs */}
        {step === 1 && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Step 1: Vehicle Details</h3>

            <div className="r-cols-2" style={{ gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Make</label>
                <select className="form-input" value={formData.make} onChange={e => handleChange('make', e.target.value)}>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Nissan">Nissan</option>
                  <option value="BMW">BMW</option>
                  <option value="Suzuki">Suzuki</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Model</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Corolla Altis, Civic, Cayenne"
                  value={formData.model} 
                  onChange={e => handleChange('model', e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Year of Manufacture</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.year} 
                  onChange={e => handleChange('year', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Body Type</label>
                <select className="form-input" value={formData.bodyType} onChange={e => handleChange('bodyType', e.target.value)}>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Crossover">Crossover</option>
                  <option value="Coupe">Coupe</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Mileage (km)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.mileage} 
                  onChange={e => handleChange('mileage', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transmission</label>
                <select className="form-input" value={formData.transmission} onChange={e => handleChange('transmission', e.target.value)}>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="PDK / Dual-Clutch">Dual-Clutch</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select className="form-input" value={formData.fuelType} onChange={e => handleChange('fuelType', e.target.value)}>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">District</label>
                <select className="form-input" value={formData.district} onChange={e => { handleChange('district', e.target.value); handleChange('city', cityPoolFor(e.target.value)[0]); }}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City / Town</label>
                <select className="form-input" value={formData.city} onChange={e => handleChange('city', e.target.value)}>
                  {cityPoolFor(formData.district).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Exterior Colour</label>
                <select className="form-input" value={formData.exteriorColor} onChange={e => handleChange('exteriorColor', e.target.value)}>
                  {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Interior Trim</label>
                <select className="form-input" value={formData.interiorColor} onChange={e => handleChange('interiorColor', e.target.value)}>
                  {INTERIOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Condition Grade (self-declared)</label>
                <select className="form-input" value={formData.conditionGrade} onChange={e => handleChange('conditionGrade', e.target.value)}>
                  {CONDITION_GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>

            {/* Condition, Damage Diagram & Evidence (mandatory disclosures) */}
            <div style={{ marginTop: '28px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
              <h4 style={{ fontSize: '1.02rem', marginBottom: '6px' }}>Condition, Damage & Evidence</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Mark every panel with damage on the diagram, or formally declare the car damage-free.
                A photographed meter reading is mandatory; a walk-around video strengthens your listing.
              </p>

              <DamageDiagram
                zones={formData.damageZones}
                noDamage={formData.noDamage}
                interactive
                onToggle={(id) => handleChange('damageZones',
                  formData.damageZones.includes(id)
                    ? formData.damageZones.filter(z => z !== id)
                    : [...formData.damageZones, id])}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.noDamage}
                  onChange={e => {
                    handleChange('noDamage', e.target.checked);
                    if (e.target.checked) handleChange('damageZones', []);
                  }}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem' }}>No damage to declare (all panels clean)</span>
              </label>

              <div className="r-cols-2" style={{ gap: '16px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Odometer / Meter Reading Photo <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://…/odometer.jpg  (photo of the live meter)"
                    value={formData.odometerPhotoUrl}
                    onChange={e => handleChange('odometerPhotoUrl', e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mandatory — kept with the listing as mileage evidence.</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Walk-around Video / Other Media (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://youtu.be/…  or drive/video link"
                    value={formData.videoUrl}
                    onChange={e => handleChange('videoUrl', e.target.value)}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Video or extra media buyers can inspect as proof.</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-primary" onClick={() => setStep(2)}>
                <span>Continue to Pricing</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Sale & Price */}
        {step === 2 && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Step 2: Sale Format & Pricing</h3>

            <div className="r-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
              <div 
                onClick={() => handleChange('listingType', 'auction')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: formData.listingType === 'auction' ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  background: formData.listingType === 'auction' ? 'rgba(255, 184, 0, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Live Public Auction</span>
                  <span style={{ fontSize: '0.65rem', background: 'var(--accent-gold)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>RECOMMENDED</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Competitive timed bidding with reserve price and anti-sniping protection. Sells faster at true market value.
                </p>
              </div>

              <div 
                onClick={() => handleChange('listingType', 'direct')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: formData.listingType === 'direct' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: formData.listingType === 'direct' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Direct Fixed Price</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Set a fixed asking price and receive direct purchase inquiries or counter-offers through our escrow channel.
                </p>
              </div>
            </div>

            {formData.listingType === 'auction' ? (
              <div className="r-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Starting Bid (Rs)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.startingPrice} 
                    onChange={e => handleChange('startingPrice', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reserve Price (Rs)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.reservePrice} 
                    onChange={e => handleChange('reservePrice', e.target.value)}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Minimum you will accept</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Instant Buy-It-Now (Rs)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={formData.buyNowPrice} 
                    onChange={e => handleChange('buyNowPrice', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group" style={{ maxWidth: '340px' }}>
                <label className="form-label">Asking Price (Rs)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.directPrice} 
                  onChange={e => handleChange('directPrice', e.target.value)}
                />
              </div>
            )}

            {/* Monetization Tier Options */}
            <div style={{ marginTop: '20px' }}>
              <label className="form-label">Listing Tier (Monetization Boost)</label>
              <div className="r-cols-3" style={{ gap: '12px' }}>
                <div 
                  onClick={() => handleChange('listingTier', 'free')}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.listingTier === 'free' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: 'var(--bg-inset)',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: '0.9rem' }}>Basic Standard</strong>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-primary)' }}>Free</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>48h verification review</span>
                </div>

                <div 
                  onClick={() => handleChange('listingTier', 'pro')}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.listingTier === 'pro' ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    background: 'rgba(255, 184, 0, 0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>Verified Pro ★</strong>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0', color: 'var(--accent-gold)' }}>Rs 8,700</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Express 2h audit + Hero banner</span>
                </div>

                <div 
                  onClick={() => handleChange('listingTier', 'urgent')}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    border: formData.listingTier === 'urgent' ? '2px solid var(--accent-red)' : '1px solid var(--border-subtle)',
                    background: 'rgba(255, 51, 102, 0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', color: 'var(--accent-red)' }}>Urgent Blitz ⚡</strong>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0', color: 'var(--accent-red)' }}>Rs 14,700</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Priority placement + SMS alert blast</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                <span>Proceed to Title Verification</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Title & No Open Papers Verification */}
        {step === 3 && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 230, 118, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Step 3: "No Open Papers" Title Audit</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                  Our legal team will verify these documents before granting your listing the gold Trust Seal.
                </p>
              </div>
            </div>

            <div className="r-cols-2" style={{ gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Certificate of Registration (CR / Logbook) Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. CR-9921004-WP"
                  value={formData.registrationDocNumber}
                  onChange={e => handleChange('registrationDocNumber', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chassis / VIN Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. GDJ150-0089211"
                  value={formData.chassisNumber}
                  onChange={e => handleChange('chassisNumber', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registered Owner Full Name (as printed on CR)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Dinesh Wickramasinghe"
                  value={formData.registeredOwnerName}
                  onChange={e => handleChange('registeredOwnerName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Owner Government ID (NIC / Driving License / Passport)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. NIC: 198421004822"
                  value={formData.ownerIdNumber}
                  onChange={e => handleChange('ownerIdNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Document Upload Simulation */}
            <div className="r-cols-2" style={{ gap: '16px', margin: '20px 0' }}>
              <div className="upload-drop-zone">
                <Upload size={28} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
                <strong style={{ fontSize: '0.88rem', display: 'block' }}>Upload Vehicle CR (Logbook)</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>JPG, PNG or PDF (Max 10MB)</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '6px' }}>✓ File Attached: cr_scan_page1.pdf</div>
              </div>

              <div className="upload-drop-zone">
                <Upload size={28} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
                <strong style={{ fontSize: '0.88rem', display: 'block' }}>Upload Government ID</strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Front & Back ID Scan</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-green)', marginTop: '6px' }}>✓ File Attached: national_id_scan.jpg</div>
              </div>
            </div>

            {/* Legal Undertaking Box */}
            <div style={{ 
              background: 'rgba(255, 184, 0, 0.06)', 
              border: '1px solid rgba(255, 184, 0, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px',
              marginTop: '16px'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.pledgeAccepted} 
                  onChange={e => handleChange('pledgeAccepted', e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                />
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  <strong>Mandatory Legal Undertaking (No Open Papers):</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    I solemnly declare that I am the legal registered owner / certified legal attorney of this vehicle. 
                    I affirm this vehicle has <strong>NOT</strong> been sold on open papers (blank signed forms) to any 
                    intermediary, and I commit to executing the legal registration transfer deed directly into the name 
                    of the buyer upon settlement.
                  </p>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  if (!formData.registeredOwnerName || !formData.ownerIdNumber) {
                    alert('Please enter the registered owner name and ID number to proceed.');
                    return;
                  }
                  if (!formData.pledgeAccepted) {
                    alert('Please accept the No Open Papers legal declaration.');
                    return;
                  }
                  setStep(4);
                }}
              >
                <span>Proceed to Privacy Settings</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Privacy Settings & Launch */}
        {step === 4 && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Step 4: Seller Privacy Shield & Launch</h3>

            <div style={{ background: 'var(--bg-inset)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', color: 'var(--accent-cyan)' }}>
                Automated Privacy Safeguards
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Auto-Blur Vehicle License Plate</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Masks plate number with the "VSS Verified" emblem to prevent plate cloning and identity tracking.
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.isPlateMasked} 
                    onChange={e => handleChange('isPlateMasked', e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                  />
                </label>

                <div style={{ height: '1px', background: 'var(--border-subtle)' }}></div>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Shield Telephone & Personal Address</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Your phone number is locked against cold-calling car brokers. Only released to verified auction winners or accepted buyers.
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                    ACTIVE BY DEFAULT
                  </span>
                </label>
              </div>
            </div>

            {/* Submission Summary Card */}
            <div style={{ background: 'rgba(0, 229, 255, 0.04)', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Submission Summary:</h4>
              <div className="r-cols-2" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', gap: '8px' }}>
                <div>Vehicle: <strong>{formData.year} {formData.make} {formData.model}</strong></div>
                <div>Format: <strong>{formData.listingType === 'auction' ? 'Live Auction' : 'Direct Sale'}</strong></div>
                <div>Registered Owner: <strong>{formData.registeredOwnerName}</strong></div>
                <div>CR Number: <strong>{formData.registrationDocNumber}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn-primary" onClick={handleFinalSubmit}>
                <CheckCircle2 size={16} />
                <span>Submit Vehicle for Title Audit</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success Screen */}
        {step === 5 && (
          <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(0, 230, 118, 0.2)', 
              color: 'var(--accent-green)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '2rem', marginBottom: '12px' }}>Submission Successful!</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Your vehicle has entered the <strong>VSS Title Verification Queue</strong>. Our audit officers are cross-referencing 
              your Certificate of Registration (CR) against your government ID to certify direct ownership.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {!dbEnabled && (
                <button className="btn-primary" onClick={() => setCurrentRole('admin')}>
                  <span>View in Admin Verification Queue (Test Audit)</span>
                  <ArrowRight size={16} />
                </button>
              )}

              <button className="btn-secondary" onClick={() => setCurrentRole('buyer')}>
                <span>Return to Marketplace</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

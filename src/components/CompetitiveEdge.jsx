import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

// Competitive analysis: where the alternative / legacy ways of buying &
// selling used cars fall short, paired with the VSS control that closes each
// gap. This is factual positioning, not a "no broker fee" sales pitch.
const COMPARISONS = [
  {
    weakness: 'Chain-of-broker markups',
    detail: 'Listings passed through informal brokers and dealers get 5–12% added at every hop, so buyers overpay while the true owner receives less.',
    vss: 'One verified registered owner lists directly; the price you see is the owner’s price.',
  },
  {
    weakness: 'Open-paper (blank MTA) fraud',
    detail: 'Vehicles sold on blank signed transfer forms never change legal ownership — the buyer inherits fines, liabilities and a car they cannot prove is theirs.',
    vss: 'Every listing is audited against the Certificate of Registration and the owner’s government ID before it can go live.',
  },
  {
    weakness: 'Hidden or undisclosed damage',
    detail: 'Classified ads describe cars as “clean” with no standard damage disclosure; repaints and accident repairs surface only after purchase.',
    vss: 'Sellers must mark damaged panels on a standard top-view diagram (or formally declare none), visible to every buyer.',
  },
  {
    weakness: 'Odometer tampering with no proof',
    detail: 'Mileage is a typed number with nothing behind it, so wound-back odometers go undetected.',
    vss: 'A photographed meter reading is a mandatory listing field, kept with the listing as evidence.',
  },
  {
    weakness: 'Opaque, negotiated-in-the-dark pricing',
    detail: 'Prices are haggled privately with no public trail, so buyers cannot tell whether a price is fair.',
    vss: 'Public timed auctions expose a transparent bid audit trail; reserves and anti-sniping keep it honest.',
  },
  {
    weakness: 'No seller identity check',
    detail: 'Anyone can post any car; impersonation of the registered owner is common and unchecked.',
    vss: 'Seller identity is cross-verified against the CR name, and middleman patterns are flagged automatically.',
  },
];

export const CompetitiveEdge = () => (
  <section className="competitive-section container" aria-labelledby="competitive-heading">
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <span className="policy-badge">
        <AlertTriangle size={15} />
        <span>Market Reality Check</span>
      </span>
      <h2 id="competitive-heading" style={{ fontSize: '2rem', marginTop: '10px' }}>
        Where the old way of buying a car falls short
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '8px auto 0' }}>
        We built VSS by fixing the specific failures buyers and sellers hit on broker chains and
        open classifieds. Here is each weakness — and the control we put in its place.
      </p>
    </div>

    <div className="competitive-grid">
      {COMPARISONS.map((c) => (
        <div className="competitive-card" key={c.weakness}>
          <div className="competitive-weakness">
            <AlertTriangle size={16} className="comp-icon-weak" />
            <div>
              <strong>{c.weakness}</strong>
              <p>{c.detail}</p>
            </div>
          </div>
          <div className="competitive-answer">
            <ShieldCheck size={16} className="comp-icon-good" />
            <div>
              <strong>The VSS control</strong>
              <p>{c.vss}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default CompetitiveEdge;

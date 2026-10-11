import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, AlertOctagon, CheckCircle2, FileCheck, ArrowRight, Ban, Users } from 'lucide-react';

export const LegalPledgeModal = () => {
  const { isPledgeModalOpen, setIsPledgeModalOpen } = useApp();

  if (!isPledgeModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsPledgeModalOpen(false)}>
      <div className="modal-content-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <button className="modal-close-btn" onClick={() => setIsPledgeModalOpen(false)}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 230, 118, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>The "Clean Title Only" Core Guarantee</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600 }}>
              Why Legal Title Certainty is the Foundation of VSS
            </span>
          </div>
        </div>

        <div className="pledge-grid">
          {/* Danger of Incomplete Title Transfer */}
          <div style={{ background: 'rgba(255, 51, 102, 0.06)', border: '1px solid rgba(255, 51, 102, 0.3)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-red)' }}>
              <Ban size={20} />
              <h3 style={{ fontSize: '1.1rem' }}>The Blank-Forms Trap (Banned)</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              A risky car is sold with blank, undated transfer forms signed by a previous registered owner. 
              Unverified resellers hoard and flip these cars repeatedly to avoid transfer taxes and vehicle registry tracking.
            </p>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
              <li><strong>Finance Seizure:</strong> Undisclosed bank or leasing liens can lead to vehicle repossession.</li>
              <li><strong>Deceased/Missing Owner:</strong> If the original registered owner cannot be located, legal DMV transfer is impossible.</li>
              <li><strong>Criminal Exposure:</strong> Original owners are summoned for hit-and-runs or illegal transport committed by intermediaries.</li>
              <li><strong>7–15% Hidden Cut:</strong> Unregistered resellers inflate costs without offering a shred of warranty.</li>
            </ul>
          </div>

          {/* VSS Verified Solution */}
          <div style={{ background: 'rgba(0, 230, 118, 0.06)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-green)' }}>
              <CheckCircle2 size={20} />
              <h3 style={{ fontSize: '1.1rem' }}>The VSS Clean Title Standard</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              We mandate that the seller MUST be the legally registered owner on the Certificate of Registration (CR) 
              or a verified legal attorney with validated Power of Attorney.
            </p>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px' }}>
              <li><strong>CR vs. NIC Match:</strong> Official motor registry certificate is cross-audited against government ID.</li>
              <li><strong>Direct Handover:</strong> Official DMV transfer documents are executed directly between buyer and seller.</li>
              <li><strong>Direct Settlement:</strong> Settlement and transfer execute directly between the buyer and the registered owner.</li>
              <li><strong>Complete Privacy:</strong> Protected from public scraping, cold calls, and reseller fraud.</li>
            </ul>
          </div>
        </div>

        {/* 3-Tier Audit Architecture Diagram */}
        <div style={{ background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--accent-cyan)' }}>
            VSS 3-Tier Title Verification Pipeline
          </h4>

          <div className="r-cols-3" style={{ gap: '16px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
                STAGE 1: DOCUMENT INTAKE
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Seller uploads official Certificate of Registration (CR) and Government Photo ID (NIC/Passport).
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
                STAGE 2: LEGAL CROSS-AUDIT
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                VSS registrar cross-verifies chassis number, engine number, registered owner name, and lien clearance.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
                STAGE 3: TRUST CERTIFICATE
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Digital legal pledge signed. Gold "100% Clean Title" seal awarded. Listing activated.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button className="btn-primary" onClick={() => setIsPledgeModalOpen(false)}>
            <span>I Understand & Agree with VSS Policy</span>
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

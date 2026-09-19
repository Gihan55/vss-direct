import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, toLKR, fromLKR } from '../lib/currency';
import { X, Calculator, Sparkles, CheckCircle2, DollarSign, Building } from 'lucide-react';

export const LoanCalculatorModal = () => {
  const { isLoanModalOpen, setIsLoanModalOpen, selectedVehicle, addToast } = useApp();

  const basePrice = selectedVehicle ? (selectedVehicle.currentBid || selectedVehicle.directPrice || 50000) : 45000;

  const [vehiclePrice, setVehiclePrice] = useState(basePrice);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [loanTermMonths, setLoanTermMonths] = useState(60);
  const [interestRate, setInterestRate] = useState(8.5);

  // This modal stays mounted (returns null while closed), so opening it for a
  // different vehicle used to keep the previous vehicle's price. Re-sync whenever
  // the selected vehicle's base price changes. Must run before the early return.
  useEffect(() => {
    setVehiclePrice(basePrice);
  }, [basePrice]);

  if (!isLoanModalOpen) return null;

  const downPaymentAmount = (vehiclePrice * downPaymentPct) / 100;
  const principal = vehiclePrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) / 
                         (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  const totalPayment = monthlyPayment * loanTermMonths + downPaymentAmount;
  const totalInterest = totalPayment - vehiclePrice;

  return (
    <div className="modal-overlay" onClick={() => setIsLoanModalOpen(false)}>
      <div className="modal-content-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <button className="modal-close-btn" onClick={() => setIsLoanModalOpen(false)}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(0, 229, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <Calculator size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Automotive Finance & EMI Estimator</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Special pre-approved rates for VSS Verified Clean-Title Vehicles (Monetization Partner)
            </p>
          </div>
        </div>

        <div className="loan-calc-grid">
          {/* Controls */}
          <div>
            <div className="form-group">
              <label className="form-label">Vehicle Price (Rs)</label>
              <input 
                type="number" 
                className="form-input"
                value={toLKR(vehiclePrice)}
                onChange={e => setVehiclePrice(fromLKR(parseFloat(e.target.value) || 0))}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label">Down Payment: {downPaymentPct}%</label>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                  {formatLKR(downPaymentAmount)}
                </strong>
              </div>
              <input 
                type="range" 
                min="10" 
                max="60" 
                step="5"
                value={downPaymentPct}
                onChange={e => setDownPaymentPct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loan Term: {loanTermMonths / 12} Years ({loanTermMonths} Months)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[36, 48, 60, 72].map(term => (
                  <button 
                    key={term}
                    className={`bid-chip-btn ${loanTermMonths === term ? 'active' : ''}`}
                    onClick={() => setLoanTermMonths(term)}
                    style={{
                      flex: 1,
                      borderColor: loanTermMonths === term ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                      color: loanTermMonths === term ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                    }}
                  >
                    {term / 12} Yrs
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Annual Interest Rate (% APR)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input"
                value={interestRate}
                onChange={e => setInterestRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div style={{ 
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Estimated Monthly Payment
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', margin: '4px 0 16px' }}>
                {monthlyPayment ? formatLKR(monthlyPayment) : 'Rs 0'}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Financed Amount:</span>
                  <strong>{formatLKR(principal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Down Payment:</span>
                  <strong>{formatLKR(downPaymentAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Interest:</span>
                  <strong>{formatLKR(totalInterest)}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                background: 'rgba(0, 230, 118, 0.08)', 
                border: '1px solid rgba(0, 230, 118, 0.2)', 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.76rem',
                color: 'var(--accent-green)',
                marginBottom: '12px'
              }}>
                ✓ <strong>0.5% APR Discount</strong> applied because this vehicle has an audited VSS Clean Title.
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', fontSize: '0.88rem' }}
                onClick={() => addToast(`Loan pre-approval request sent to our partner bank for a ${loanTermMonths / 12}-year term. A financing advisor will contact you shortly.`, 'success')}
              >
                <Sparkles size={16} />
                <span>Apply with Partner Bank (Instant Pre-Approval)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

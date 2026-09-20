import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatLKR } from '../../lib/currency';
import { 
  ShieldCheck, AlertTriangle, Gavel, Banknote, Activity, 
  CheckCircle2, XCircle, Search, Eye, Users, FileText, Ban, 
  TrendingUp, Clock, Award, ShieldAlert, Sparkles, Filter,
  UserPlus, Hourglass, UserCheck, PhoneCall, Headset
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    vehicles, 
    telemetry, 
    adminActiveTab, 
    setAdminActiveTab, 
    approveVehicle, 
    rejectVehicle, 
    flagMiddleman,
    addToast,
    // Access control
    accounts,
    registrationRequests,
    approveRequest,
    rejectRequest,
    createUser,
    // VSS-assisted buyer inquiry queue
    inquiries,
    updateInquiryStatus,
    isSuperAdmin
  } = useApp();

  const [selectedAuditVehicle, setSelectedAuditVehicle] = useState(
    vehicles.find(v => v.status === 'pending_verification') || vehicles[0]
  );
  const [rejectReason, setRejectReason] = useState('Open papers detected / Seller name does not match registered owner on CR');

  // Create-user form state (super user only)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cuName, setCuName] = useState('');
  const [cuEmail, setCuEmail] = useState('');
  const [cuPhone, setCuPhone] = useState('');
  const [cuPassword, setCuPassword] = useState('');
  const [cuRole, setCuRole] = useState('buyer');

  const pendingVehicles = vehicles.filter(v => v.status === 'pending_verification');
  const flaggedVehicles = vehicles.filter(v => v.status === 'flagged_middleman' || v.verification?.status === 'rejected');
  const liveAuctions = vehicles.filter(v => v.listingType === 'auction' && v.status === 'active');

  // Assisted-listing callback requests awaiting agent attention.
  const newInquiries = inquiries.filter(i => i.status === 'new');

  // Registration-request queue for the Access & Users tab.
  const pendingRequests = registrationRequests.filter(r => r.status === 'pending');
  const reviewedRequests = registrationRequests.filter(r => r.status !== 'pending');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!cuEmail || !cuPassword || cuPassword.length < 6) {
      addToast('Email and a password of at least 6 characters are required.', 'error');
      return;
    }
    const ok = await createUser({
      name: cuName,
      email: cuEmail,
      phone: cuPhone,
      password: cuPassword,
      role: cuRole
    });
    if (ok) {
      setCuName(''); setCuEmail(''); setCuPhone(''); setCuPassword(''); setCuRole('buyer');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="admin-view-wrap">
      <div className="container">
        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-pill" style={{ background: 'rgba(255, 184, 0, 0.2)', color: 'var(--accent-gold)', borderColor: 'rgba(255, 184, 0, 0.4)' }}>
                OPERATIONS CONSOLE
              </span>
              <h2 style={{ fontSize: '2rem' }}>VSS Regulatory & Intelligence Center</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Enforce "No Open Papers" policy, eliminate curbstoner middlemen, manage auctions, and track behind-the-scenes metrics.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(0, 230, 118, 0.1)', 
              color: 'var(--accent-green)', 
              border: '1px solid rgba(0, 230, 118, 0.3)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={16} />
              <span>Audit Policy: Strictly Zero Open Papers</span>
            </span>
          </div>
        </div>

        {/* High-Level Operational Stat Cards */}
        <div className="admin-stats-summary">
          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: 'rgba(255, 184, 0, 0.15)', color: 'var(--accent-gold)' }}>
              <FileText size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending Title Audits</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {pendingVehicles.length}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>Needs document review</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: 'rgba(255, 51, 102, 0.15)', color: 'var(--accent-red)' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Open Papers Blocked</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                {telemetry.openPapersRejectedCount}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Frauds intercepted</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)' }}>
              <Activity size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Live Visitors</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {telemetry.activeLiveVisitors}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>+34.2% Growth MoM</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon-wrap" style={{ background: 'rgba(0, 230, 118, 0.15)', color: 'var(--accent-green)' }}>
              <Banknote size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Platform Revenue</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                {telemetry.revenue.totalRevenueMonth}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>Commissions & Tiers</span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-tab-btn ${adminActiveTab === 'verification' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('verification')}
          >
            <ShieldCheck size={16} />
            <span>Title Verification Desk</span>
            {pendingVehicles.length > 0 && (
              <span className="admin-tab-count" style={{ background: 'var(--accent-gold)', color: '#000' }}>
                {pendingVehicles.length}
              </span>
            )}
          </button>

          <button 
            className={`admin-tab-btn ${adminActiveTab === 'users' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('users')}
          >
            <Users size={16} />
            <span>Access & Users</span>
            {pendingRequests.length > 0 && (
              <span className="admin-tab-count" style={{ background: 'var(--accent-cyan)', color: '#000' }}>
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button 
            className={`admin-tab-btn ${adminActiveTab === 'middleman' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('middleman')}
          >
            <Ban size={16} />
            <span>Middleman & Fraud Radar</span>
            <span className="admin-tab-count">{flaggedVehicles.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${adminActiveTab === 'auctions' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('auctions')}
          >
            <Gavel size={16} />
            <span>Live Auction Command</span>
            <span className="admin-tab-count">{liveAuctions.length}</span>
          </button>

          <button 
            className={`admin-tab-btn ${adminActiveTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('inquiries')}
          >
            <Headset size={16} />
            <span>Buyer Inquiries</span>
            {newInquiries.length > 0 && (
              <span className="admin-tab-count" style={{ background: 'var(--accent-red)', color: '#fff' }}>
                {newInquiries.length}
              </span>
            )}
          </button>

          <button 
            className={`admin-tab-btn ${adminActiveTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('revenue')}
          >
            <Banknote size={16} />
            <span>Monetization & Ad Engine</span>
          </button>

          <button 
            className={`admin-tab-btn ${adminActiveTab === 'telemetry' ? 'active' : ''}`}
            onClick={() => setAdminActiveTab('telemetry')}
          >
            <TrendingUp size={16} />
            <span>Behind-The-Screens Analytics</span>
          </button>
        </div>

        {/* TAB 1: TITLE VERIFICATION DESK (CORE POLICY ENFORCEMENT) */}
        {adminActiveTab === 'verification' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Title Verification Queue</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Audit vehicle Certificate of Registration (CR) vs Seller Identity to stop "Open Papers" and certify direct owners.
                </p>
              </div>

              <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {pendingVehicles.length} vehicles waiting for compliance sign-off
              </span>
            </div>

            {/* Vehicle Queue Table */}
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Vehicle</th>
                    <th style={{ padding: '10px' }}>Submitter</th>
                    <th style={{ padding: '10px' }}>CR Doc #</th>
                    <th style={{ padding: '10px' }}>Registered Owner on CR</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(veh => (
                    <tr 
                      key={veh.id}
                      onClick={() => setSelectedAuditVehicle(veh)}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: selectedAuditVehicle?.id === veh.id ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>
                        {veh.title}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {veh.seller?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>
                        {veh.verification?.registrationDocNumber || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--accent-cyan)' }}>
                        {veh.verification?.registeredOwnerName || 'Unspecified'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {veh.verification?.status === 'verified' && (
                          <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>✓ Verified</span>
                        )}
                        {veh.verification?.status === 'pending' && (
                          <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>⏳ Pending Audit</span>
                        )}
                        {veh.verification?.status === 'rejected' && (
                          <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>✕ Rejected</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAuditVehicle(veh);
                            addToast(`Opening document audit desk for "${veh.title}"`, 'info');
                          }}
                        >
                          Inspect Documents →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Split-Screen Document Audit Desk */}
            {selectedAuditVehicle && (
              <div style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}>
                    Cross-Audit Desk: <span style={{ color: 'var(--accent-cyan)' }}>{selectedAuditVehicle.title}</span>
                  </h4>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Submission ID: {selectedAuditVehicle.id}
                  </span>
                </div>

                <div className="split-audit-desk">
                  {/* Left: Certificate of Registration (CR) */}
                  <div className="audit-doc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                        1. Official Certificate of Registration (CR)
                      </strong>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px' }}>
                        Government Motor Registry
                      </span>
                    </div>

                    <div className="audit-doc-img-preview">
                      <img src={selectedAuditVehicle.verification?.titleCertDocUrl} alt="CR Scan" />
                    </div>

                    <div style={{ marginTop: '14px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>Doc Number: <strong>{selectedAuditVehicle.verification?.registrationDocNumber}</strong></div>
                      <div>Chassis #: <strong>{selectedAuditVehicle.verification?.chassisNumber}</strong></div>
                      <div>Engine #: <strong>{selectedAuditVehicle.verification?.engineNumber}</strong></div>
                      <div>Registered Owner Name: <strong style={{ color: 'var(--accent-gold)' }}>{selectedAuditVehicle.verification?.registeredOwnerName}</strong></div>
                      <div>Ownership Status: <strong>{selectedAuditVehicle.verification?.ownershipType}</strong></div>
                    </div>
                  </div>

                  {/* Right: Seller Government ID & Submitter Match */}
                  <div className="audit-doc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--accent-green)' }}>
                        2. Submitter Government Identity (NIC / Passport)
                      </strong>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(0, 230, 118, 0.1)', color: 'var(--accent-green)', padding: '2px 6px', borderRadius: '4px' }}>
                        ID Verification
                      </span>
                    </div>

                    <div className="audit-doc-img-preview">
                      <img src={selectedAuditVehicle.verification?.ownerIdDocUrl} alt="ID Scan" />
                    </div>

                    <div style={{ marginTop: '14px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>Submitter Name: <strong>{selectedAuditVehicle.seller?.name || 'Unknown'}</strong></div>
                      <div>Submitter ID: <strong>{selectedAuditVehicle.verification?.ownerIdNumber}</strong></div>
                      <div>Unmasked Phone: <strong>{selectedAuditVehicle.seller?.fullPhone || 'Protected'}</strong></div>
                      <div>Open Papers Declaration: <strong>{selectedAuditVehicle.verification?.noOpenPapersDeclarationSigned ? 'Signed & Agreed' : 'NOT SIGNED'}</strong></div>
                      <div>Finance Embargo: <strong>{selectedAuditVehicle.verification?.financeEmbargo || 'Clean Title'}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Audit Decision Bar */}
                <div style={{ 
                  marginTop: '24px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '16px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="var(--accent-green)" />
                    <span style={{ fontSize: '0.85rem' }}>
                      Audit Verdict for <strong>{selectedAuditVehicle.title}</strong>:
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn-success"
                      onClick={() => approveVehicle(selectedAuditVehicle.id)}
                    >
                      <CheckCircle2 size={16} />
                      <span>Approve Clean Title & Issue Trust Seal</span>
                    </button>

                    <button 
                      className="btn-danger"
                      onClick={() => rejectVehicle(selectedAuditVehicle.id, rejectReason)}
                    >
                      <XCircle size={16} />
                      <span>Reject (Open Papers Policy Violation)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACCESS & USERS (REGISTRATION APPROVALS + USER CREATION) */}
        {adminActiveTab === 'users' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div className="section-header-wrap" style={{ marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Access & User Administration</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  New users must be approved here before they can sign in to bid or sell. The Super User can also create accounts directly.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', alignSelf: 'flex-start' }}
                  onClick={() => setShowCreateForm(s => !s)}
                >
                  <UserPlus size={16} />
                  <span>{showCreateForm ? 'Close Form' : 'Create User'}</span>
                </button>
              )}
            </div>

            {/* Create-user form (Super User only) */}
            {isSuperAdmin && showCreateForm && (
              <form className="create-user-form" onSubmit={handleCreateUser}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <UserPlus size={16} color="var(--accent-cyan)" />
                  <strong style={{ fontSize: '0.95rem' }}>Create a New Account Directly</strong>
                  <span className="status-pill status-approved" style={{ marginLeft: 'auto' }}>Active on creation</span>
                </div>
                <div className="r-cols-2" style={{ gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input className="form-input" type="text" placeholder="e.g. Nuwan Perera" value={cuName} onChange={(e) => setCuName(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="e.g. nuwan@example.com" value={cuEmail} onChange={(e) => setCuEmail(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone</label>
                    <input className="form-input" type="text" placeholder="e.g. +94 71 555 0199" value={cuPhone} onChange={(e) => setCuPhone(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Password * (min 6)</label>
                    <input className="form-input" type="text" placeholder="Initial sign-in password" minLength={6} value={cuPassword} onChange={(e) => setCuPassword(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Role</label>
                  <select className="filter-select" style={{ maxWidth: '220px' }} value={cuRole} onChange={(e) => setCuRole(e.target.value)}>
                    <option value="buyer">Buyer — can bid</option>
                    <option value="seller">Seller — can list vehicles</option>
                    <option value="admin">Admin — moderation console</option>
                    {isSuperAdmin && <option value="super_admin">Super Admin — full control</option>}
                  </select>
                  <button type="submit" className="btn-success" style={{ marginLeft: 'auto' }}>
                    <CheckCircle2 size={16} />
                    <span>Create Account</span>
                  </button>
                </div>
              </form>
            )}

            {/* Pending registration requests */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Hourglass size={16} color="var(--accent-gold)" />
                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>
                  Pending Registration Requests
                </h4>
                <span className="status-pill status-pending">{pendingRequests.length} waiting</span>
              </div>

              {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 16px', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No pending requests. New “Request Access” submissions from the sign-in modal will appear here for approval.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingRequests.map(req => (
                    <div key={req.id} className="access-request-card">
                      <div className="access-request-main">
                        <strong style={{ fontSize: '1rem' }}>{req.name || 'Unnamed applicant'}</strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>{req.email}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {req.phone || 'No phone'} • Requested {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'recently'}
                        </div>
                      </div>
                      <div>
                        <span className={`status-pill ${req.role === 'seller' ? 'status-seller' : 'status-buyer'}`}>
                          {req.role === 'seller' ? '🚗 Seller' : '🏷️ Buyer'}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                          {req.role === 'seller' ? 'Wants to list vehicles' : 'Wants to place bids'}
                        </div>
                      </div>
                      <div className="access-request-actions">
                        <button className="btn-success" onClick={() => approveRequest(req.id)}>
                          <CheckCircle2 size={15} />
                          <span>Approve & Activate</span>
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => {
                            const note = window.prompt(`Reason for rejecting ${req.email} (optional):`) || '';
                            rejectRequest(req.id, note);
                          }}
                        >
                          <XCircle size={15} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviewed history */}
            {reviewedRequests.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '10px' }}>Request History</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Reviewed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewedRequests.map(req => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: 600 }}>{req.name || '—'}</td>
                          <td>{req.email}</td>
                          <td>{req.role}</td>
                          <td>
                            <span className={`status-pill ${req.status === 'approved' ? 'status-approved' : 'status-rejected'}`}>
                              {req.status}
                            </span>
                            {req.note ? <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{req.note}</div> : null}
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : '—'}
                            {req.reviewedBy ? ` by ${req.reviewedBy}` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Platform accounts */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <UserCheck size={16} color="var(--accent-green)" />
                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Platform Accounts</h4>
                <span className="status-pill status-approved">{accounts.length} active</span>
              </div>
              {!isSuperAdmin && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Only the Super User (super@vss.auto) can create accounts directly. Administrators approve or reject registration requests.
                </p>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ marginRight: '6px' }}>{acc.avatar || '👤'}</span>
                          {acc.name}
                        </td>
                        <td>{acc.email}</td>
                        <td>{acc.phone || '—'}</td>
                        <td>
                          <span className={`status-pill ${acc.role === 'super_admin' ? 'status-super' : (acc.role === 'admin' ? 'status-pending' : (acc.role === 'seller' ? 'status-seller' : 'status-buyer'))}`}>
                            {acc.role === 'super_admin' ? 'Super Admin' : acc.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${(acc.status || 'active') === 'active' ? 'status-approved' : 'status-rejected'}`}>
                            {acc.status || 'active'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MIDDLEMAN & ANTI-FRAUD RADAR (DISINTERMEDIATION) */}
        {adminActiveTab === 'middleman' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Middleman & Curbstoner Detection Radar</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Automated heuristics to identify informal brokers attempting to flip cars without legal transfer.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 51, 102, 0.1)', color: 'var(--accent-red)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700 }}>
                {flaggedVehicles.length} Potential Broker Violations Intercepted
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {flaggedVehicles.map(veh => (
                <div 
                  key={veh.id}
                  className="admin-grid-a"
                  style={{
                    background: 'rgba(255, 51, 102, 0.04)',
                    border: '1px solid rgba(255, 51, 102, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <AlertTriangle size={16} color="var(--accent-red)" />
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{veh.title}</strong>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255, 51, 102, 0.2)', color: 'var(--accent-red)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        BROKER RISK: {veh.seller?.brokerFlagScore ?? 0}%
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--accent-red)', marginBottom: '8px' }}>
                      Violation Reason: {veh.verification?.rejectionReason || 'Name mismatch between submitter and registration certificate (CR). Open papers detected.'}
                    </p>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Submitter: <strong>{veh.seller?.name || 'Unknown'}</strong> • Unmasked Phone: {veh.seller?.fullPhone || 'Protected'} • Plate: {veh.licensePlate}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>CR Doc #: <strong>{veh.verification?.registrationDocNumber || 'N/A'}</strong></div>
                    <div>CR Registered Name: <strong>{veh.verification?.registeredOwnerName || 'Unspecified'}</strong></div>
                    <div>License Status: <strong style={{ color: 'var(--accent-red)' }}>{veh.verification?.revenueLicenseValidUntil || 'N/A'}</strong></div>
                  </div>

                  <div>
                    <button 
                      className="btn-danger"
                      onClick={() => flagMiddleman(veh.id)}
                    >
                      <Ban size={15} />
                      <span>Blacklist Broker Phone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE AUCTION COMMAND CENTER */}
        {adminActiveTab === 'auctions' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Live Auction Operations Command</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Monitor bidding velocity, reserve price statuses, and anti-sniping soft-close triggers.
                </p>
              </div>

              <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {liveAuctions.length} Active Bidding Arenas
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {liveAuctions.map(veh => (
                <div 
                  key={veh.id}
                  className="admin-grid-b"
                  style={{
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{veh.title}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Ends At: {new Date(veh.auctionEndsAt).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High Bid</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {formatLKR(veh.currentBid)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {veh.bidCount || 0} Bids placed
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reserve Status</span>
                    <div>
                      {veh.isReserveMet ? (
                        <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.85rem' }}>
                          ✓ Reserve Met ({formatLKR(veh.reservePrice)})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                          Pending Reserve ({formatLKR(veh.reservePrice)})
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Soft-Close Active (2-min buffer)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                      onClick={() => addToast(`Bid & soft-close audit logs for "${veh.title}" streamed to console`, 'info')}
                    >
                      <Eye size={14} />
                      <span>Audit Logs</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REVENUE & MONETIZATION ENGINE */}
        {adminActiveTab === 'inquiries' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={18} color="var(--accent-cyan)" />
                <span>Buyer Inquiry Desk — VSS Assisted Listings</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                First calls captured by the platform. Call the buyer, screen the enquiry, confirm details with the seller, then mark the stage as you connect both parties.
              </p>
            </div>
            {inquiries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                No callback requests yet — they appear here when a buyer uses “Request First Call via VSS” on an assisted listing.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-medium)' }}>
                      <th style={{ padding: '8px 10px' }}>Received</th>
                      <th style={{ padding: '8px 10px' }}>Vehicle</th>
                      <th style={{ padding: '8px 10px' }}>Buyer</th>
                      <th style={{ padding: '8px 10px' }}>Phone</th>
                      <th style={{ padding: '8px 10px' }}>Note</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                      <th style={{ padding: '8px 10px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map(inq => (
                      <tr key={inq.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{new Date(inq.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '8px 10px' }}>{inq.vehicleTitle}</td>
                        <td style={{ padding: '8px 10px' }}><strong>{inq.buyerName}</strong></td>
                        <td style={{ padding: '8px 10px' }}>{inq.buyerPhone}</td>
                        <td style={{ padding: '8px 10px', maxWidth: '220px', color: 'var(--text-muted)' }}>{inq.note || '—'}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span className={`inquiry-status-pill ${inq.status}`}>{inq.status}</span>
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          {inq.status === 'new' && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', marginRight: '6px' }} onClick={() => updateInquiryStatus(inq.id, 'contacted')}>Called</button>}
                          {inq.status === 'contacted' && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', marginRight: '6px' }} onClick={() => updateInquiryStatus(inq.id, 'connected')}>Connected to Seller</button>}
                          {inq.status !== 'closed' && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => updateInquiryStatus(inq.id, 'closed')}>Close</button>}
                          {inq.status === 'closed' && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => updateInquiryStatus(inq.id, 'new')}>Reopen</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {adminActiveTab === 'revenue' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Revenue Generation & Platform Operations</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Diversified monetization streams generated by operating the trusted direct vehicle marketplace.
              </p>
            </div>

            {/* Revenue Grid */}
            <div className="revenue-grid">
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auction Closing Commissions</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)', margin: '6px 0' }}>
                  {telemetry.revenue.auctionSuccessCommissions}
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>1% settlement fee on completed sales</span>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Featured Listing Tiers</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '6px 0' }}>
                  {telemetry.revenue.featuredListingFees}
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Verified Pro (Rs 8,700) & Urgent (Rs 14,700)</span>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>150-Pt Physical Inspections</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '6px 0' }}>
                  {telemetry.revenue.certifiedInspectionReports}
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Mobile roadworthiness add-on (Rs 19,500)</span>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Partner Financing Leads</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#bf7fff', margin: '6px 0' }}>
                  {telemetry.revenue.sponsorAdClicks}
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>CPA referral fee from partner banks</span>
              </div>
            </div>

            {/* Total Revenue Projection */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.1), rgba(0, 229, 255, 0.1))', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Monthly Recurring Gross Revenue (MRR): {telemetry.revenue.totalRevenueMonth}</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Projected revenue for next month: <strong>{telemetry.revenue.projectedNextMonth}</strong> based on current traffic velocity.
                </p>
              </div>

              <button 
                className="btn-success" 
                style={{ fontSize: '0.85rem' }}
                onClick={() => addToast('Monthly revenue ledger exported (CSV)', 'success')}
              >
                <Sparkles size={16} />
                <span>Export Revenue Ledger</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: BEHIND-THE-SCREENS TELEMETRY & STRATEGIC ANALYTICS */}
        {adminActiveTab === 'telemetry' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Behind-The-Screens Statistics & Traffic Telemetry</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Visitor telemetry, search volume heatmaps, and weekly platform growth metrics.
              </p>
            </div>

            {/* Telemetry Chart Grid */}
            <div className="telemetry-chart-grid">
              {/* Traffic Bar Chart */}
              <div style={{ background: 'var(--bg-inset)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem' }}>7-Day Traffic & Visitor Volume</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                      Total Weekly Visitors: {telemetry.weeklyUniqueVisitors.toLocaleString()} ({telemetry.trafficGrowthRate})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Time on Site: {telemetry.averageTimeOnSite}</span>
                </div>

                <div className="traffic-bar-chart">
                  {telemetry.trafficByDay.map(item => {
                    const maxV = 7000;
                    const hPct = Math.round((item.visitors / maxV) * 100);
                    return (
                      <div key={item.day} className="bar-col">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {(item.visitors / 1000).toFixed(1)}k
                        </span>
                        <div 
                          className="bar-fill" 
                          style={{ height: `${hPct}%` }}
                          title={`${item.day}: ${item.visitors} visitors, ${item.bidsPlaced} bids`}
                        ></div>
                        <span className="bar-day-label">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Traffic Sources Breakdown */}
              <div style={{ background: 'var(--bg-inset)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>Traffic Ingestion Sources</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {telemetry.trafficSources.map(src => (
                    <div key={src.source}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span>{src.source}</span>
                        <strong>{src.percentage}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${src.percentage}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Searched Vehicle Models */}
            <div style={{ background: 'var(--bg-inset)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '14px' }}>
                Top Searched Search Queries & Consumer Demand
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {telemetry.topSearches.map(item => (
                  <div 
                    key={item.keyword}
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {item.keyword}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.count} searches</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>{item.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

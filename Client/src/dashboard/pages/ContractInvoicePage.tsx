import { useEffect, useState, useMemo } from 'react';
import type { Contract, ContractStatus, Invoice, InvoiceStatus } from '../types/dashboard.type';
import { getContracts, getInvoices, approveInvoice, disputeInvoice, countersignContract } from '../api/dashboard.api';

function getContractDownloadName(contract: Contract): string {
  const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const worker = slugify(contract.workerName || 'worker');
  return `${worker}-contract.pdf`;
}

function getPdfCellContent(
  contract: Contract,
  countersigningId: string | null,
  onCountersign: () => Promise<void>,
) {
  if (contract.status === 'worker_signed') {
    return (
      <button
        className="db-btn-primary db-btn-sm"
        onClick={() => { void onCountersign(); }}
        disabled={countersigningId === contract._id}
      >
        {countersigningId === contract._id ? 'Signing...' : 'Countersign'}
      </button>
    );
  }

  if (contract.pdfUrl) {
    return (
      <a
        href={contract.pdfUrl}
        target="_blank"
        rel="noreferrer"
        download={getContractDownloadName(contract)}
        className="db-card-link"
      >
        Download
      </a>
    );
  }

  const pendingLabel =
    contract.status === 'draft'
      ? 'Created after invite acceptance'
      : contract.status === 'sent'
      ? 'Waiting for signatures'
      : contract.status === 'company_signed'
      ? 'Waiting for worker signature'
      : 'Preparing...';

  return <span style={{ color: '#94a3b8', fontSize: 12 }}>{pendingLabel}</span>;
}

// ─── Shared badge helpers ─────────────────────────────────────────────────────

const CONTRACT_BADGE: Record<ContractStatus, [string, string]> = {
  draft:          ['db-badge db-badge-draft',    'Draft'],
  sent:           ['db-badge db-badge-sent',     'Sent'],
  company_signed: ['db-badge db-badge-pending',  'Your sig needed'],
  worker_signed:  ['db-badge db-badge-pending',  'Worker signed'],
  active:         ['db-badge db-badge-active',   'Active'],
  rejected:       ['db-badge db-badge-disputed', 'Rejected'],
  terminated:     ['db-badge db-badge-terminated','Terminated'],
};

const INVOICE_BADGE: Record<InvoiceStatus, [string, string]> = {
  draft:     ['db-badge db-badge-draft',     'Draft'],
  submitted: ['db-badge db-badge-submitted', 'Submitted'],
  approved:  ['db-badge db-badge-approved',  'Approved'],
  paid:      ['db-badge db-badge-paid',      'Paid'],
  disputed:  ['db-badge db-badge-disputed',  'Disputed'],
};

// ─────────────────────────────────────────────────────────────────────────────
//  ContractsPage
// ─────────────────────────────────────────────────────────────────────────────

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState<ContractStatus | ''>('');
  const [countersigningId, setCountersigningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getContracts()
      .then((data) => { if (!cancelled) { setContracts(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contracts.filter((c) => {
      if (q && !`${c.workerName} ${c.workerRole}`.toLowerCase().includes(q)) return false;
      if (filter && c.status !== filter) return false;
      return true;
    });
  }, [contracts, search, filter]);

  const active    = contracts.filter((c) => c.status === 'active').length;
  const pending   = contracts.filter((c) => ['sent', 'company_signed', 'worker_signed'].includes(c.status)).length;

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-title">Contracts</div>
          <div className="db-page-sub">
            {contracts.length} total · {active} active · {pending} pending signatures
          </div>
        </div>
        <div className="db-page-actions">
          <button className="db-btn-secondary">↓ Export</button>
        </div>
      </div>

      <div className="db-card">
        <div className="db-filters">
          <div className="db-filter-search">
            <span style={{ color: '#94a3b8' }}>🔍</span>
            <input
              placeholder="Search by worker name or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="db-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as ContractStatus | '')}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent — awaiting signatures</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="terminated">Terminated</option>
          </select>
          <div className="db-filter-count">{filtered.length} contracts</div>
        </div>

        {loading ? (
          <div className="db-loading"><div className="db-spinner" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">📄</div>
            <div className="db-empty-title">No contracts yet</div>
            <div className="db-empty-sub">
              Contracts are auto-generated when you invite a worker and they complete KYC
            </div>
          </div>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Type</th>
                  <th>Track</th>
                  <th>Pay rate</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Status</th>
                  <th>Signatures</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const [badgeCls, badgeLabel] = CONTRACT_BADGE[c.status] ?? ['db-badge db-badge-draft', c.status];
                  return (
                    <tr key={c._id}>
                      <td>
                        <div className="db-table-name">{c.workerName}</div>
                        <div className="db-table-sub">{c.workerRole}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontSize: 12.5, color: '#64748b' }}>
                        {c.contractType}
                      </td>
                      <td>
                        <span className={c.track === 'track_2' ? 'db-track db-track-2' : 'db-track db-track-1'}>
                          {c.track === 'track_2' ? '🇺🇸 US' : '🇮🇳 India'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {c.payCurrency} {c.payRate.toLocaleString()}
                        <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 11 }}> /{c.payFrequency}</span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>
                        {new Date(c.startDate).toLocaleDateString()}
                      </td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>
                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Open-ended'}
                      </td>
                      <td><span className={badgeCls}>{badgeLabel}</span></td>
                      <td style={{ fontSize: 12 }}>
                        <span title="Company" style={{ marginRight: 4 }}>
                          {c.companySigned ? '✅' : '⏳'} You
                        </span>
                        <span title="Worker">
                          {c.workerSigned ? '✅' : '⏳'} Worker
                        </span>
                      </td>
                      <td>
                        {getPdfCellContent(c, countersigningId, async () => {
                          setCountersigningId(c._id);
                          try {
                            const updated = await countersignContract(c._id);
                            setContracts((current) => current.map((item) => (item._id === c._id ? updated : item)));
                          } finally {
                            setCountersigningId(null);
                          }
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  InvoicesPage
// ─────────────────────────────────────────────────────────────────────────────

export function InvoicesPage() {
  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState<InvoiceStatus | ''>('');
  const [approvingId,  setApprovingId]  = useState<string | null>(null);
  const [disputeId,    setDisputeId]    = useState<string | null>(null);
  const [disputeReason,setDisputeReason]= useState('');

  useEffect(() => {
    let cancelled = false;
    getInvoices()
      .then((data) => { if (!cancelled) { setInvoices(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((inv) => {
      if (q && !`${inv.workerName} ${inv.invoiceNumber}`.toLowerCase().includes(q)) return false;
      if (filter && inv.status !== filter) return false;
      return true;
    });
  }, [invoices, search, filter]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const updated = await approveInvoice(id);
      setInvoices((prev) => prev.map((inv) => inv._id === id ? updated : inv));
    } finally {
      setApprovingId(null);
    }
  };

  const handleDispute = async () => {
    if (!disputeId || !disputeReason.trim()) return;
    try {
      const updated = await disputeInvoice(disputeId, disputeReason);
      setInvoices((prev) => prev.map((inv) => inv._id === disputeId ? updated : inv));
      setDisputeId(null);
      setDisputeReason('');
    } catch {
      // handle
    }
  };

  const pending = invoices.filter((i) => i.status === 'submitted').length;
  const totalPending = invoices
    .filter((i) => i.status === 'submitted')
    .reduce((sum, i) => sum + i.amountGross, 0);

  return (
    <>
      <div className="db-page">
        <div className="db-page-header">
          <div>
            <div className="db-page-title">Invoices</div>
            <div className="db-page-sub">
              {pending} pending approval
              {pending > 0 && ` · USD ${totalPending.toLocaleString()} awaiting payment`}
            </div>
          </div>
          <div className="db-page-actions">
            <button className="db-btn-secondary">↓ Export</button>
          </div>
        </div>

        {/* Pending banner */}
        {pending > 0 && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '14px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1e40af' }}>
                {pending} invoice{pending > 1 ? 's' : ''} need your approval
              </div>
              <div style={{ fontSize: 12.5, color: '#3b82f6', marginTop: 2 }}>
                Total: USD {totalPending.toLocaleString()} — Payment is sent via Wise immediately after approval
              </div>
            </div>
            <button className="db-btn-primary" onClick={() => setFilter('submitted')}>
              Review now
            </button>
          </div>
        )}

        <div className="db-card">
          <div className="db-filters">
            <div className="db-filter-search">
              <span style={{ color: '#94a3b8' }}>🔍</span>
              <input
                placeholder="Search by worker or invoice number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="db-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value as InvoiceStatus | '')}
            >
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
            </select>
            <div className="db-filter-count">{filtered.length} invoices</div>
          </div>

          {loading ? (
            <div className="db-loading"><div className="db-spinner" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">🧾</div>
              <div className="db-empty-title">No invoices yet</div>
              <div className="db-empty-sub">
                Workers submit invoices each month. They'll appear here for your approval.
              </div>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Worker</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const [badgeCls, badgeLabel] = INVOICE_BADGE[inv.status] ?? ['db-badge db-badge-draft', inv.status];
                    return (
                      <tr key={inv._id}>
                        <td>
                          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                            {inv.invoiceNumber}
                          </div>
                        </td>
                        <td>
                          <div className="db-table-name">{inv.workerName}</div>
                          <div className="db-table-sub">{inv.workerRole}</div>
                        </td>
                        <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(inv.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' – '}
                          {new Date(inv.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>
                          {inv.currency} {inv.amountGross.toLocaleString()}
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: 12 }}>
                          {new Date(inv.submittedAt).toLocaleDateString()}
                        </td>
                        <td><span className={badgeCls}>{badgeLabel}</span></td>
                        <td>
                          {inv.status === 'submitted' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="db-btn-secondary db-btn-sm db-btn-success"
                                onClick={() => handleApprove(inv._id)}
                                disabled={approvingId === inv._id}
                              >
                                {approvingId === inv._id ? '…' : '✓ Approve'}
                              </button>
                              <button
                                className="db-btn-secondary db-btn-sm db-btn-danger"
                                onClick={() => setDisputeId(inv._id)}
                              >
                                Dispute
                              </button>
                            </div>
                          )}
                          {inv.status === 'paid' && inv.pdfUrl && (
                            <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="db-card-link">
                              Receipt
                            </a>
                          )}
                          {inv.status === 'approved' && (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>Processing…</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dispute modal */}
      {disputeId && (
        <div className="db-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDisputeId(null); }}>
          <div className="db-modal" style={{ maxWidth: 440 }}>
            <div className="db-modal-header">
              <div>
                <div className="db-modal-title">Dispute Invoice</div>
                <div className="db-modal-sub">Explain why you're disputing this invoice</div>
              </div>
              <button className="db-modal-close" onClick={() => setDisputeId(null)}>✕</button>
            </div>
            <div className="db-modal-body">
              <div className="db-form-group">
                <label className="db-label">Reason for dispute <span className="db-req">*</span></label>
                <textarea
                  className="db-textarea"
                  placeholder="Describe the issue with this invoice…"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{ height: 100 }}
                />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn-secondary" onClick={() => setDisputeId(null)}>Cancel</button>
              <button
                className="db-btn-primary"
                onClick={handleDispute}
                disabled={!disputeReason.trim()}
                style={{ background: '#dc2626' }}
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

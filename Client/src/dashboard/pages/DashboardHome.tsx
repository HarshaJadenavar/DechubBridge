import { useEffect, useState } from 'react';
import type { Worker, Invoice, DashboardStats } from '../types/dashboard.type';
import { getDashboardStats, getWorkers, getInvoices, approveInvoice } from '../api/dashboard.api';

function workerBadge(status: Worker['status']) {
  const map: Record<Worker['status'], [string, string]> = {
    active: ['db-badge db-badge-active', 'Active'],
    invited: ['db-badge db-badge-invited', 'Invited'],
    kyc_pending: ['db-badge db-badge-kyc', 'KYC Pending'],
    inactive: ['db-badge db-badge-terminated', 'Inactive'],
    terminated: ['db-badge db-badge-terminated', 'Terminated'],
  };
  const [cls, label] = map[status] ?? ['db-badge db-badge-draft', status];
  return <span className={cls}>{label}</span>;
}

function StatCard({
  label,
  value,
  icon,
  delta,
  deltaType = 'neutral',
}: {
  label: string;
  value: string | number;
  icon: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">
        <span>{icon}</span> {label}
      </div>
      <div className="db-stat-value">{value}</div>
      {delta && (
        <div className={`db-stat-delta ${deltaType === 'negative' ? 'negative' : deltaType === 'positive' ? '' : 'neutral'}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

function QuickActionIcon({ kind }: { kind: 'requests' | 'contracts' | 'invoices' | 'documents' }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: '#0f172a',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (kind) {
    case 'requests':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 7h8" />
          <path d="M8 12h8" />
          <path d="M8 17h5" />
          <path d="M5 7h.01" />
          <path d="M5 12h.01" />
          <path d="M5 17h.01" />
          <rect x="3" y="4" width="18" height="16" rx="3" />
        </svg>
      );
    case 'contracts':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 3h6l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      );
    case 'invoices':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 7h8" />
          <path d="M8 12h8" />
          <path d="M8 17h5" />
          <path d="M6 3v2" />
          <path d="M18 3v2" />
          <rect x="4" y="5" width="16" height="16" rx="3" />
        </svg>
      );
    case 'documents':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 3h6l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v5h5" />
          <path d="M12 11v6" />
          <path d="m9.5 14.5 2.5 2.5 2.5-2.5" />
        </svg>
      );
    default:
      return null;
  }
}

interface Props {
  onNavigate: (page: string) => void;
}

export default function DashboardHome({ onNavigate }: Props) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [s, w, inv] = await Promise.all([
          getDashboardStats(),
          getWorkers(),
          getInvoices(),
        ]);
        if (cancelled) return;
        setStats(s);
        setWorkers(w.slice(0, 5));
        setInvoices(inv.filter((invoice: Invoice) => invoice.status === 'submitted').slice(0, 3));
      } catch {
        // Silently fail and show empty state.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApproveInvoice = async (id: string) => {
    setApprovingId(id);
    try {
      const updated = await approveInvoice(id);
      setInvoices((prev) =>
        prev
          .map((inv) => (inv._id === id ? updated : inv))
          .filter((inv) => inv.status === 'submitted'),
      );
    } catch {
      // Leave the current list visible if approval fails.
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="db-page">
        <div className="db-loading">
          <div className="db-spinner" /> Loading dashboard...
        </div>
      </div>
    );
  }

  const pendingKyc = workers.filter((w) => w.kycStatus === 'pending').length;
  const pendingInvite = workers.filter((w) => w.status === 'invited').length;

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-title">Dashboard</div>
          <div className="db-page-sub">
            Welcome back. Here&apos;s what&apos;s happening with your team.
          </div>
        </div>
      </div>

      <div className="db-stats-row">
        <StatCard
          icon="Team"
          label="Active Workers"
          value={stats?.activeWorkers ?? 0}
          delta={`${pendingInvite} invite${pendingInvite !== 1 ? 's' : ''} pending`}
          deltaType="neutral"
        />
        <StatCard
          icon="Bills"
          label="Pending Invoices"
          value={stats?.pendingInvoices ?? 0}
          delta={stats?.pendingInvoices ? 'Need your approval' : 'All clear'}
          deltaType={stats?.pendingInvoices ? 'negative' : 'neutral'}
        />
        <StatCard
          icon="Pay"
          label="Next Payroll"
          value={stats?.nextPayrollDate
            ? new Date(stats.nextPayrollDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '-'}
          delta="Auto-processed via Wise"
          deltaType="neutral"
        />
        <StatCard
          icon="Cost"
          label="Monthly Cost"
          value={stats ? `${stats.currency} ${stats.monthlyTotalCost.toLocaleString()}` : '-'}
          delta="All active workers"
          deltaType="neutral"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Recent Workers</span>
            <button className="db-card-link" onClick={() => onNavigate('workers')}>
              {'View all ->'}
            </button>
          </div>

          {workers.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">Team</div>
              <div className="db-empty-title">No workers yet</div>
              <div className="db-empty-sub">
                Approved marketplace hires will appear here once you complete the hiring flow.
              </div>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Track</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0a1628, #2563eb)',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {w.firstName[0]}{w.lastName[0]}
                          </div>
                          <div>
                            <div className="db-table-name">{w.firstName} {w.lastName}</div>
                            <div className="db-table-sub">{w.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={w.track === 'track_2_us' ? 'db-track db-track-2' : 'db-track db-track-1'}>
                          {w.track === 'track_2_us' ? 'US' : 'India'}
                        </span>
                      </td>
                      <td>{w.roleTitle}</td>
                      <td>{workerBadge(w.status)}</td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>
                        {w.lastPaymentAt ? new Date(w.lastPaymentAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="db-card" style={{ marginBottom: 16 }}>
            <div className="db-card-header">
              <span className="db-card-title">Invoices to Approve</span>
              <button className="db-card-link" onClick={() => onNavigate('invoices')}>
                {'View all ->'}
              </button>
            </div>
            {invoices.length === 0 ? (
              <div style={{ padding: '20px 24px', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                No pending invoices
              </div>
            ) : (
              <div className="db-action-list">
                {invoices.map((inv) => (
                  <div key={inv._id} className="db-action-item">
                    <div className="db-action-icon" style={{ background: '#eff6ff' }}>Bills</div>
                    <div className="db-action-text">
                      <div className="db-action-title">{inv.workerName}</div>
                      <div className="db-action-sub">
                        {inv.currency} {inv.amountGross.toLocaleString()} · {inv.invoiceNumber}
                      </div>
                    </div>
                    <button
                      className="db-btn-secondary db-btn-sm db-btn-success"
                      onClick={() => handleApproveInvoice(inv._id)}
                      disabled={approvingId === inv._id}
                    >
                      {approvingId === inv._id ? '...' : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Quick Actions</span>
            </div>
            <div className="db-action-list">
              {[
                { icon: <QuickActionIcon kind="requests" />, bg: '#f0f9ff', label: 'Open talent requests', sub: 'Track approvals and next steps', action: () => { window.location.href = '/marketplace/requests'; } },
                { icon: <QuickActionIcon kind="contracts" />, bg: '#fdf4ff', label: 'View contracts', sub: 'All contract statuses', action: () => onNavigate('contracts') },
                { icon: <QuickActionIcon kind="invoices" />, bg: '#fff7ed', label: 'Manage invoices', sub: 'Approve pending payments', action: () => onNavigate('invoices') },
                { icon: <QuickActionIcon kind="documents" />, bg: '#f0fdf4', label: 'Download documents', sub: 'Contracts, payslips', action: () => onNavigate('documents') },
              ].map(({ icon, bg, label, sub, action }) => (
                <button
                  key={label}
                  className="db-action-item"
                  onClick={action}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <div className="db-action-icon" style={{ background: bg }}>{icon}</div>
                  <div className="db-action-text">
                    <div className="db-action-title">{label}</div>
                    <div className="db-action-sub">{sub}</div>
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: 16 }}>{'>'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(pendingKyc > 0 || stats?.contractsExpiring) && (
        <div
          style={{
            marginTop: 20,
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>!</span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#92400e' }}>
              Action required
            </div>
            <div style={{ fontSize: 12.5, color: '#b45309', marginTop: 2 }}>
              {pendingKyc > 0 && `${pendingKyc} worker${pendingKyc > 1 ? 's' : ''} have pending KYC verification. `}
              {(stats?.contractsExpiring ?? 0) > 0 && `${stats!.contractsExpiring} contract${stats!.contractsExpiring > 1 ? 's' : ''} expiring within 30 days.`}
            </div>
          </div>
          <button
            className="db-btn-secondary db-btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => onNavigate('workers')}
          >
            Review
          </button>
        </div>
      )}
    </div>
  );
}

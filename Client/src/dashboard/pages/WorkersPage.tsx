import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Worker, WorkerStatus, Track, AddWorkerFormData } from '../types/dashboard.type';
import { getWorkers, terminateWorker } from '../api/dashboard.api';
import AddWorkerModal from '../components/AddWorkerModel';
import { getTalentRequestHirePrefill } from '../../api/talentRequests.api';

const STATUS_CONFIG: Record<WorkerStatus, { cls: string; label: string }> = {
  active: { cls: 'db-badge db-badge-active', label: 'Active' },
  invited: { cls: 'db-badge db-badge-invited', label: 'Invited' },
  kyc_pending: { cls: 'db-badge db-badge-kyc', label: 'KYC Pending' },
  inactive: { cls: 'db-badge db-badge-terminated', label: 'Inactive' },
  terminated: { cls: 'db-badge db-badge-terminated', label: 'Terminated' },
};

const KYC_CONFIG: Record<'pending' | 'approved' | 'rejected', { cls: string; label: string }> = {
  pending: { cls: 'db-badge db-badge-pending', label: 'Pending' },
  approved: { cls: 'db-badge db-badge-approved', label: 'Verified' },
  rejected: { cls: 'db-badge db-badge-disputed', label: 'Rejected' },
};

function WorkerAvatar({ w }: { w: Worker }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
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
  );
}

function RowMenu({ worker, onTerminate }: { worker: Worker; onTerminate: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="db-btn-secondary db-btn-sm"
        onClick={() => setOpen((value) => !value)}
        style={{ padding: '0 10px', fontSize: 16 }}
        aria-label="Actions"
      >
        ...
      </button>

      {open ? (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 4,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              width: 180,
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => { onTerminate(worker._id); setOpen(false); }}
              style={{
                width: '100%',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: '#dc2626',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              Terminate
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

interface WorkersPageProps {
  initialHireRequestId?: string;
}

export default function WorkersPage({ initialHireRequestId = '' }: WorkersPageProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalSeed, setModalSeed] = useState<AddWorkerFormData | undefined>(undefined);
  const [modalRequestId, setModalRequestId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | ''>('');
  const [filterTrack, setFilterTrack] = useState<Track | ''>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch {
      // Keep page usable if worker fetch fails.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!initialHireRequestId) return;

    let active = true;

    void getTalentRequestHirePrefill(initialHireRequestId)
      .then((result) => {
        if (!active) return;
        setModalSeed(result.initialData);
        setModalRequestId(result.talentRequestId);
        setShowModal(true);
      })
      .catch(() => {
        if (!active) return;
        setModalSeed(undefined);
        setModalRequestId(undefined);
      });

    return () => {
      active = false;
    };
  }, [initialHireRequestId]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return workers.filter((w) => {
      if (q && !`${w.firstName} ${w.lastName} ${w.email} ${w.roleTitle}`.toLowerCase().includes(q)) return false;
      if (filterStatus && w.status !== filterStatus) return false;
      if (filterTrack && w.track !== filterTrack) return false;
      return true;
    });
  }, [workers, searchQuery, filterStatus, filterTrack]);

  const handleTerminate = useCallback(async (id: string) => {
    if (!window.confirm('Terminate this worker? This cannot be undone.')) return;
    try {
      await terminateWorker(id);
      setWorkers((prev) => prev.map((w) => (w._id === id ? { ...w, status: 'terminated' as const } : w)));
    } catch {
      // Keep current row state if termination fails.
    }
  }, []);

  const handleWorkerAdded = useCallback((worker: unknown) => {
    setWorkers((prev) => [worker as Worker, ...prev]);
    setShowModal(false);
    setModalSeed(undefined);
    setModalRequestId(undefined);
    window.location.replace('/dashboard?tab=contracts');
  }, []);

  const activeWorkers = workers.filter((w) => w.status === 'active').length;
  const invitedWorkers = workers.filter((w) => w.status === 'invited').length;
  const pendingKyc = workers.filter((w) => w.kycStatus === 'pending' && w.status !== 'terminated').length;

  return (
    <>
      <div className="db-page">
        <div className="db-page-header">
          <div>
            <div className="db-page-title">Workers</div>
            <div className="db-page-sub">
              {workers.length} total · {activeWorkers} active · {invitedWorkers} invited
              {pendingKyc > 0 && ` · ${pendingKyc} KYC pending`}
            </div>
          </div>
          <div className="db-page-actions">
            <button className="db-btn-secondary">Export CSV</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'All', value: workers.length, filter: '', color: '#0a1628' },
            { label: 'Active', value: activeWorkers, filter: 'active', color: '#16a34a' },
            { label: 'Invited', value: invitedWorkers, filter: 'invited', color: '#ca8a04' },
            { label: 'KYC Pending', value: pendingKyc, filter: 'kyc_pending', color: '#ea580c' },
          ].map(({ label, value, filter, color }) => (
            <button
              key={label}
              onClick={() => setFilterStatus(filter as WorkerStatus | '')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                borderRadius: 99,
                border: `1.5px solid ${filterStatus === filter ? color : '#e2e8f0'}`,
                background: filterStatus === filter ? `${color}11` : '#fff',
                color: filterStatus === filter ? color : '#475569',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {label}
              <span
                style={{
                  background: filterStatus === filter ? color : '#f1f4f9',
                  color: filterStatus === filter ? '#fff' : '#64748b',
                  borderRadius: 99,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {value}
              </span>
            </button>
          ))}
        </div>

        <div className="db-card">
          <div className="db-filters">
            <div className="db-filter-search">
              <span style={{ color: '#94a3b8' }}>Search</span>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <select
              className="db-filter-select"
              value={filterTrack}
              onChange={(event) => setFilterTrack(event.target.value as Track | '')}
            >
              <option value="">All tracks</option>
              <option value="track_2_us">Track 2 - US</option>
              <option value="track_1_india">Track 1 - India</option>
            </select>

            <div className="db-filter-count">
              {filtered.length} of {workers.length} workers
            </div>
          </div>

          {loading ? (
            <div className="db-loading">
              <div className="db-spinner" /> Loading workers...
            </div>
          ) : filtered.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">{workers.length === 0 ? 'Team' : 'Search'}</div>
              <div className="db-empty-title">
                {workers.length === 0 ? 'No workers yet' : 'No workers match your search'}
              </div>
              <div className="db-empty-sub">
                {workers.length === 0
                  ? 'Approved marketplace hires will appear here after you proceed from Talent Requests.'
                  : 'Try a different search term or clear your filters.'}
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
                    <th>KYC</th>
                    <th>Services</th>
                    <th>Pay rate</th>
                    <th>Last payment</th>
                    <th>Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => (
                    <tr key={w._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <WorkerAvatar w={w} />
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
                      <td>
                        <div style={{ fontWeight: 500, color: '#334155' }}>{w.roleTitle}</div>
                        {w.department ? <div className="db-table-sub">{w.department}</div> : null}
                      </td>
                      <td>
                        <span className={STATUS_CONFIG[w.status]?.cls ?? 'db-badge db-badge-draft'}>
                          {STATUS_CONFIG[w.status]?.label ?? w.status}
                        </span>
                      </td>
                      <td>
                        <span className={KYC_CONFIG[w.kycStatus]?.cls ?? 'db-badge db-badge-pending'}>
                          {KYC_CONFIG[w.kycStatus]?.label ?? w.kycStatus}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 12.5 }}>
                        {w.selectedServices.length} service{w.selectedServices.length !== 1 ? 's' : ''}
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a', fontSize: 13 }}>
                        {w.payRate ? `${w.payCurrency} ${w.payRate.toLocaleString()}/mo` : '-'}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>
                        {w.lastPaymentAt ? new Date(w.lastPaymentAt).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <RowMenu worker={w} onTerminate={handleTerminate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal ? (
        <AddWorkerModal
          onClose={() => {
            setShowModal(false);
            setModalSeed(undefined);
            setModalRequestId(undefined);
            if (window.location.search) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }}
          onSuccess={handleWorkerAdded}
          initialData={modalSeed}
          talentRequestId={modalRequestId}
        />
      ) : null}
    </>
  );
}

import { useEffect, useState } from 'react';
import { listTalentRequests, unreadCount } from '../../api/admin.api';
import './admin-talent-requests.css';

interface TalentRequestsPageProps {
  onLogout: () => void;
  onOpenRequest: (id: string) => void;
}

export default function TalentRequestsPage({ onLogout, onOpenRequest }: TalentRequestsPageProps) {
  const [items, setItems] = useState<any[]>([]);
  const [badge, setBadge] = useState(0);

  const statusTone: Record<string, string> = {
    pending_review: 'new',
    shortlisted_sent: 'discussion',
    candidate_selected: 'contacted',
    hire_started: 'contacted',
    approved: 'contacted',
    alternative_suggested: 'discussion',
    rejected: 'closed',
    hired: 'contacted',
    talent_hired: 'contacted',
  };

  async function load() {
    try {
      const data = await listTalentRequests({ perPage: 50 });
      setItems(data.items || []);
      const unread = await unreadCount();
      setBadge(unread.unread || 0);
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    load();
  }, []);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : 'Unknown');
  const formatStatus = (value?: string) => (value ? value.replace(/_/g, ' ') : 'unknown');
  const pendingCount = items.filter((item) => item.status === 'pending_review').length;
  const approvedCount = items.filter((item) => ['approved', 'candidate_selected', 'hire_started'].includes(item.status)).length;
  const hiredCount = items.filter((item) => ['hired', 'talent_hired'].includes(item.status)).length;

  return (
    <div className="atr-root">
      <div className="atr-background" aria-hidden="true">
        <span className="atr-orb atr-orb-one" />
        <span className="atr-orb atr-orb-two" />
        <span className="atr-grid" />
      </div>

      <header className="atr-hero">
        <div className="atr-hero-copy">
          <span className="atr-kicker">Admin cockpit</span>
          <h1>Talent requests</h1>
          <p>
            Review incoming hiring demand, track pipeline movement, and respond quickly with a cleaner
            premium workspace.
          </p>
        </div>

        <div className="atr-hero-actions">
          <div className="atr-badge-card">
            <span className="atr-badge-label">Unread queue</span>
            <strong>{badge}</strong>
          </div>
          <button className="atr-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <section className="atr-stats" aria-label="Summary">
        <article className="atr-stat-card">
          <span>Total requests</span>
          <strong>{items.length}</strong>
          <small>Last 50 submissions</small>
        </article>
        <article className="atr-stat-card">
          <span>Pending Review</span>
          <strong>{pendingCount}</strong>
          <small>Needs admin decision</small>
        </article>
        <article className="atr-stat-card">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
          <small>Ready for company action</small>
        </article>
        <article className="atr-stat-card">
          <span>Hired</span>
          <strong>{hiredCount}</strong>
          <small>Moved into dashboard</small>
        </article>
      </section>

      <main className="atr-main">
        <section className="atr-list">
          <div className="atr-panel-header">
            <div>
              <h2>Request stream</h2>
              <p>Review availability, suggest alternatives, and unlock hiring only after approval.</p>
            </div>
          </div>

          <div className="atr-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Talent</th>
                  <th>Company</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it._id}
                    className={it.unread ? 'unread' : ''}
                  >
                    <td>
                      <div className="atr-request-cell">
                        <button className="atr-request-trigger" onClick={() => onOpenRequest(it._id)}>
                          {it._id.slice(-8)}
                        </button>
                        <span>{it.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="atr-person-cell">
                        <strong>{it.workerName}</strong>
                        <span>{it.workerRole || 'Talent profile'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="atr-person-cell">
                        <strong>{it.companyName}</strong>
                        <span>{it.contactFirstName || 'Company contact'}</span>
                      </div>
                    </td>
                    <td>{formatDate(it.createdAt)}</td>
                    <td>
                      <span className={`atr-status-pill ${statusTone[it.status] || 'new'}`}>
                        {formatStatus(it.status)}
                      </span>
                    </td>
                    <td>
                      <div className="atr-actions">
                        <button className="atr-btn atr-btn-primary" onClick={() => onOpenRequest(it._id)}>View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

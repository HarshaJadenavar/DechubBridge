import { useEffect, useMemo, useState } from 'react';
import './talent-marketplace.css';
import { FALLBACK_MARKETPLACE_TALENT, getMarketplaceTalent, type MarketplaceTalentProfile } from '../api/marketplace.api';
import type { ApiError } from '../api/client';
import { resolveImageUrl } from '../utils/imageUrl';

interface TalentMarketplacePageProps {
  initialQuery: string;
  isAuthenticated: boolean;
  userName: string;
  onOpenProfile: (workerId: string) => void;
  onOpenTalentRequests: () => void;
  onLogout: () => void;
  onNotifications: () => void;
  onLogin: () => void;
  embedded?: boolean;
}

const DEFAULT_MARKETPLACE_BLURBS = new Set([
  'Tell companies about your strongest skills and the kind of freelance work you want.',
  'Freelancer profile is being completed.',
  'Experienced freelancer available for contract work.',
  'Self-signup freelancer profile',
]);

function formatRate(rate: number, currency: string): string {
  if (!rate || rate <= 0) return 'Rate on request';
  if (currency === 'USD') return `$${rate}/hr`;
  return `${currency} ${rate}/hr`;
}

function formatPackagePrice(price: number, currency: string): string {
  if (!price || price <= 0) return 'Rate on request';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

function getMarketplaceCardPrice(profile: MarketplaceTalentProfile): string {
  const packageList = profile.servicePackages ?? [];
  const basicPackage = packageList.find((pkg) => pkg.name.trim().toLowerCase().includes('basic'))
    ?? packageList.find((pkg) => pkg.price > 0)
    ?? packageList[0];

  if (basicPackage?.price && basicPackage.price > 0) {
    return formatPackagePrice(basicPackage.price, profile.currency);
  }

  return formatRate(profile.rate, profile.currency);
}

function getMarketplaceCardSkills(skills: string[]) {
  const maxVisibleSkills = 5;
  const visibleSkills = skills.slice(0, maxVisibleSkills);
  const remainingCount = Math.max(0, skills.length - visibleSkills.length);
  return { visibleSkills, remainingCount };
}

function isCompletedMarketplaceProfile(profile: MarketplaceTalentProfile): boolean {
  const normalizedRole = profile.role.trim().toLowerCase();
  const normalizedBlurb = profile.blurb.trim();
  const normalizedLocation = profile.location.trim().toLowerCase();

  return Boolean(
    normalizedRole
    && normalizedRole !== 'freelancer'
    && profile.rate > 0
    && profile.skills.length > 0
    && normalizedBlurb
    && !DEFAULT_MARKETPLACE_BLURBS.has(normalizedBlurb)
    && normalizedLocation
    && normalizedLocation !== 'remote',
  );
}

export default function TalentMarketplacePage({
  initialQuery,
  isAuthenticated,
  onOpenProfile,
  onOpenTalentRequests,
  embedded = false,
}: TalentMarketplacePageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [availability, setAvailability] = useState('All');
  const [talentPool, setTalentPool] = useState<MarketplaceTalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMarketplaceTalent()
      .then((profiles) => {
        setTalentPool(profiles.filter((profile) => isCompletedMarketplaceProfile(profile)));
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err as ApiError;
        const fallbackProfiles = FALLBACK_MARKETPLACE_TALENT.filter((profile) => isCompletedMarketplaceProfile(profile));
        if (fallbackProfiles.length > 0) {
          setTalentPool(fallbackProfiles);
          setError('');
        } else {
          setError(apiError.message ?? 'Failed to load marketplace talent.');
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filteredTalent = useMemo(() => {
    return talentPool.filter((talent) => {
      const matchesQuery =
        !query.trim()
        || `${talent.role} ${talent.skills.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesAvailability =
        availability === 'All' || talent.availabilityLabel === availability;

      return matchesQuery && matchesAvailability;
    });
  }, [availability, query, talentPool]);

  const marketplaceFlowItems = [
    {
      title: '1. Discover',
      description: 'Search talent and shortlist relevant profiles inside Marketplace.',
    },
    {
      title: '2. Request',
      description: 'Open and track talent requests with your hiring details.',
    },
    {
      title: '3. Convert',
      description: 'Move approved hires into workers, contracts, and payroll execution.',
    },
  ];

  return (
    <div className="tmp-root">
      <main className="tmp-shell">
        {!embedded ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => { window.location.href = '/dashboard?tab=marketplace'; }}
              style={{
                border: '1px solid #dbe4f0',
                background: '#fff',
                borderRadius: 999,
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              Back to dashboard
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={onOpenTalentRequests}
                style={{
                  border: '1px solid #dbe4f0',
                  background: '#fff',
                  borderRadius: 999,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                Talent Requests
              </button>
            ) : null}
          </div>
        ) : null}

        <section className="tmp-overview-grid">
          <div className="tmp-overview-heading">
            <h1>Source talent faster from one hiring workspace</h1>
            <p>Browse approved contractor and specialist profiles, track requests, and move selected talent into hiring.</p>
          </div>

          <div className="tmp-overview-card tmp-overview-flow">
            <div className="tmp-overview-card-header">
              <span>Recommended flow</span>
            </div>
            <div className="tmp-overview-flow-grid">
              {marketplaceFlowItems.map((item) => (
                <div key={item.title} className="tmp-overview-flow-item">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="tmp-toolbar">
          <input
            type="search"
            placeholder="Search by role, skill, or region"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="All">All availability</option>
            <option value="Available now">Available now</option>
            <option value="Available this week">Available this week</option>
            <option value="2 weeks notice">2 weeks notice</option>
            <option value="Available next month">Available next month</option>
            <option value="Not available">Not available</option>
          </select>
        </section>

        {loading && <div className="tmp-state-card">Loading freelancer marketplace...</div>}
        {!loading && error && <div className="tmp-state-card tmp-state-card-error">{error}</div>}
        {!loading && !error && filteredTalent.length === 0 && (
          <div className="tmp-state-card">
            No freelancer profiles match your current filters yet.
          </div>
        )}

        {!loading && !error && filteredTalent.length > 0 && (
          <section className="tmp-grid">
            {filteredTalent.map((talent) => (
              <article
                key={talent.id}
                className="tmp-card tmp-card-clickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpenProfile(talent.workerId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProfile(talent.workerId);
                  }
                }}
              >
                <div className="tmp-card-media" style={{ background: talent.bannerImageUrl ? 'transparent' : '#f8fafc' }}>
                  {talent.bannerImageUrl ? (
                    <img
                      className="tmp-card-banner"
                      src={resolveImageUrl(talent.bannerImageUrl)}
                      alt={`${talent.name} banner`}
                    />
                  ) : (
                    <div className="tmp-card-banner tmp-card-banner-fallback" aria-hidden="true" />
                  )}
                </div>

                <div className="tmp-card-content">
                  <div className="tmp-card-head">
                    <div className="tmp-card-identity">
                      {talent.profilePhotoUrl ? (
                        <img className="tmp-head-avatar" src={resolveImageUrl(talent.profilePhotoUrl)} alt={talent.name} />
                      ) : (
                        <div className="tmp-head-avatar-fallback">{(talent.name || '').split(' ').map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase()}</div>
                      )}

                      <div className="tmp-card-title-group">
                        <h2 title={talent.name}>{talent.name}</h2>
                        <p className="tmp-card-role" title={talent.role}>{talent.role}</p>
                        <p className="tmp-card-location" title={talent.location}>{talent.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="tmp-badges">
                    {/* <span className="tmp-badge tmp-badge-strong">{formatRate(talent.rate, talent.currency)}</span> */}
                    <span className="tmp-badge">{talent.availabilityLabel}</span>
                  </div>

                  <p className="tmp-blurb">{talent.blurb}</p>

                  <div className="tmp-skills">
                    {talent.skills.length > 0 ? (() => {
                      const { visibleSkills, remainingCount } = getMarketplaceCardSkills(talent.skills);
                      return (
                        <>
                          {visibleSkills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                          {remainingCount > 0 && (
                            <span className="tmp-skill-more">+{remainingCount} more</span>
                          )}
                        </>
                      );
                    })() : <span>No skills added yet</span>}
                  </div>

                  {/* <div className="tmp-actions">
                    <button className="tmp-primary" onClick={(event) => {
                      event.stopPropagation();
                      onOpenProfile(talent.workerId);
                    }}>View profile</button>
                    <button className="tmp-secondary" onClick={(event) => event.stopPropagation()}>Invite to interview</button>
                  </div> */}
                  <div className="tmp-badges">
                    <span className="tmp-badge tmp-badge-strong">From {getMarketplaceCardPrice(talent)}</span>
                    {/* <span className="tmp-badge">{talent.availabilityLabel}</span> */}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

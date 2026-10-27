import { useEffect, useMemo, useState } from 'react';
import './marketplace-talent-profile.css';
import {
  getMarketplaceTalentProfile,
  type MarketplaceCheckoutSelection,
  type MarketplaceFaqItem,
  type MarketplaceServicePackage,
  type MarketplaceTalentProfileDetail,
} from '../api/marketplace.api';
import type { ApiError } from '../api/client';
import { imageBackground, resolveImageUrl } from '../utils/imageUrl';
import UserMenu from '../components/common/UserMenu';

interface MarketplaceTalentProfilePageProps {
  workerId: string;
  isAuthenticated: boolean;
  userName: string;
  onContinueToConsultation: (selection: MarketplaceCheckoutSelection) => void;
  shortlistClaimContext?: {
    requestId: string;
    token: string;
    workerId: string;
  } | null;
  onContinueFromShortlist?: (claim: { requestId: string; token: string; workerId: string }) => void | Promise<void>;
  onOpenTalentRequests: () => void;
  onBack: () => void;
  onLogout: () => void;
  onNotifications: () => void;
  onLogin: () => void;
  embedded?: boolean;
}

function formatRate(rate: number, currency: string): string {
  if (!rate || rate <= 0) return 'Rate on request';
  return currency === 'USD' ? `$${rate}/hr` : `${currency} ${rate}/hr`;
}

function formatPackagePrice(price: number, currency: string): string {
  if (!price || price <= 0) return 'Custom quote';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

function formatMemberSince(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently joined';
  }

  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function getInitials(profile: MarketplaceTalentProfileDetail): string {
  return profile.name
    .split(' ')
    .map((chunk) => chunk[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function FaqList({ items }: { items: MarketplaceFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items.length) {
    return <div className="mpp-empty-block">This contractor has not added FAQ details yet.</div>;
  }

  return (
    <div className="mpp-faq-list">
      {items.map((item, index) => (
        <div key={`${item.question}-${index}`} className="mpp-faq-item">
          <button
            className="mpp-faq-trigger"
            onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
          >
            <span>{item.question}</span>
            <span>{openIndex === index ? '−' : '+'}</span>
          </button>
          {openIndex === index ? <p className="mpp-faq-answer">{item.answer}</p> : null}
        </div>
      ))}
    </div>
  );
}

export default function MarketplaceTalentProfilePage({
  workerId,
  isAuthenticated,
  userName,
  onContinueToConsultation,
  shortlistClaimContext,
  onContinueFromShortlist,
  onOpenTalentRequests,
  onBack,
  onLogout,
  onNotifications,
  onLogin,
  embedded = false,
}: MarketplaceTalentProfilePageProps) {
  const [profile, setProfile] = useState<MarketplaceTalentProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);

  useEffect(() => {
    if (!workerId) {
      setError('Profile not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    getMarketplaceTalentProfile(workerId)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        const apiError = err as ApiError;
        setError(apiError.message ?? 'Failed to load contractor profile.');
        setLoading(false);
      });
  }, [workerId]);

  const compareRows = useMemo(() => {
    if (!profile?.servicePackages.length) return [];

    const allFeatures = Array.from(
      new Set(profile.servicePackages.flatMap((pkg) => pkg.features)),
    );

    return allFeatures.map((feature) => ({
      feature,
      values: profile.servicePackages.map((pkg) => pkg.features.includes(feature)),
    }));
  }, [profile]);

  const buildCheckoutSelection = (pkg: MarketplaceServicePackage): MarketplaceCheckoutSelection | null => {
    if (!profile) return null;

    return {
      workerId,
      workerName: profile.name,
      workerRole: profile.role,
      workerAvatarUrl: profile.profilePhotoUrl,
      currency: profile.currency,
      package: pkg,
    };
  };

  return (
    <div className="mpp-root">
      {!embedded ? <header className="mpp-topbar">
        <button className="mpp-back" onClick={onBack}>← Back to marketplace</button>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={onOpenTalentRequests}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.35)',
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
        <div className="mpp-user">
          {isAuthenticated ? (
            <UserMenu userName={userName} onLogout={onLogout} onNotifications={onNotifications} />
          ) : (
            <>
              <span>Guest company</span>
              <button type="button" className="mpp-login-button" onClick={onLogin}>
                Login
              </button>
            </>
          )}
        </div>
      </header> : null}

      <main className="mpp-shell">
        {embedded ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              className="mpp-back"
              onClick={onBack}
              style={{
                background: '#fff',
                border: '1px solid rgba(148, 163, 184, 0.28)',
                borderRadius: 999,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
              }}
            >
              ← Back to Talent Marketplace
            </button>
          </div>
        ) : null}
        {loading ? <div className="mpp-state-card">Loading contractor profile...</div> : null}
        {!loading && error ? <div className="mpp-state-card mpp-state-card-error">{error}</div> : null}

        {!loading && !error && profile ? (
          <div className="mpp-layout">
            <section className="mpp-main">
              <div className="mpp-hero-card">
                {profile.bannerImageUrl ? (
                  <div className="mpp-hero-banner" style={{ backgroundImage: imageBackground(profile.bannerImageUrl) }} />
                ) : null}
                <div className="mpp-hero-head">
                  <div className="mpp-avatar">
                    {profile.profilePhotoUrl ? (
                      <img src={resolveImageUrl(profile.profilePhotoUrl)} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: "50%" }} />
                    ) : getInitials(profile)}
                  </div>
                  <div>
                    {/* <div className="mpp-title">{profile.role}</div> */}
                    <h1>{profile.name}</h1>
                  </div>
                </div>
                <p className="mpp-hero-summary">{profile.blurb}</p>
              </div>

              <section className="mpp-section-card">
                <h2>About this profile</h2>
                <p>{profile.profileOverview || profile.blurb}</p>
              </section>

              <section className="mpp-section-card">
                <h2>Get to know {profile.name.split(' ')[0] ?? 'this contractor'}</h2>
                <div className="mpp-facts-grid">
                  <div>
                    <span>From</span>
                    <strong>{profile.country || 'Not added yet'}</strong>
                  </div>
                  <div>
                    <span>Member since</span>
                    <strong>{formatMemberSince(profile.memberSince)}</strong>
                  </div>
                  <div>
                    <span>Avg. response time</span>
                    <strong>{profile.responseTimeHours} hours</strong>
                  </div>
                  <div>
                    <span>Languages</span>
                    <strong>{profile.languages.length ? profile.languages.join(', ') : 'Not added yet'}</strong>
                  </div>
                </div>

                <div className="mpp-skill-panel">
                  <span className="mpp-skill-panel-label">Skills</span>
                  <div className="mpp-skill-cloud mpp-skill-cloud-know">
                    {profile.skills.length > 0 ? profile.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    )) : <span>No skills added yet</span>}
                  </div>
                </div>
              </section>

              <section className="mpp-section-card">
                <h2>My Portfolio</h2>
                {profile.portfolioProjects.length ? (
                  <div className="mpp-portfolio-list">
                    {profile.portfolioProjects.map((project) => (
                      <article key={`${project.title}-${project.imageUrl}`} className="mpp-portfolio-card">
                        <img src={resolveImageUrl(project.imageUrl)} alt={project.title} />
                        <div>
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>
                          <div className="mpp-portfolio-tags">
                            {project.tags.map((tag) => <span key={`${project.title}-${tag}`}>{tag}</span>)}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mpp-empty-block">Portfolio projects have not been added yet.</div>
                )}
              </section>

              <section className="mpp-section-card">
                <h2>Compare packages</h2>
                <div className="mpp-compare-table">
                  <div className="mpp-compare-header">
                    <div className="mpp-compare-package-text">Package</div>
                    {profile.servicePackages.map((pkg) => (
                      <div key={`${pkg.name}-header`}>
                        <strong>{formatPackagePrice(pkg.price, profile.currency)}</strong>
                        <span>{pkg.name}</span>
                      </div>
                    ))}
                  </div>
                  {compareRows.map((row) => (
                    <div key={row.feature} className="mpp-compare-row">
                      <span>{row.feature}</span>
                      {row.values.map((enabled, index) => (
                        <strong key={`${row.feature}-${profile.servicePackages[index].name}`}>{enabled ? '✓' : '—'}</strong>
                      ))}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mpp-section-card">
                <h2>FAQ</h2>
                <FaqList items={profile.faqItems} />
              </section>
            </section>

            <aside className="mpp-sidebar">
              <div className="mpp-sticky">
                <div className="mpp-sidebar-card">
                  <div className="mpp-package-card mpp-package-card-tabbed">
                    <div className="mpp-package-tabs" role="tablist">
                      {profile.servicePackages.map((pkg, index) => (
                        <button
                          key={pkg.name}
                          type="button"
                          role="tab"
                          aria-selected={selectedPackageIndex === index}
                          className={`mpp-package-tab ${selectedPackageIndex === index ? 'active' : ''}`}
                          onClick={() => setSelectedPackageIndex(index)}
                        >
                          {pkg.name}
                        </button>
                      ))}
                    </div>
                    {profile.servicePackages[selectedPackageIndex] ? (
                      <div className="mpp-package-body">
                        <div className="mpp-package-tier">{profile.servicePackages[selectedPackageIndex].name}</div>
                        <div className="mpp-package-price">
                          {formatPackagePrice(profile.servicePackages[selectedPackageIndex].price, profile.currency)}
                        </div>
                        <p className="mpp-package-description">
                          {profile.servicePackages[selectedPackageIndex].description}
                        </p>
                        <div className="mpp-package-meta">
                          <span>{profile.servicePackages[selectedPackageIndex].deliveryDays} day delivery</span>
                          <span>{profile.servicePackages[selectedPackageIndex].revisions} revisions</span>
                        </div>
                        <div className="mpp-package-feature-list">
                          {profile.servicePackages[selectedPackageIndex].features.map((feature) => (
                            <span key={`${profile.servicePackages[selectedPackageIndex].name}-${feature}`}>
                              <span className="mpp-feature-check">✓</span>
                              {feature}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="mpp-primary-action"
                          onClick={async () => {
                            if (shortlistClaimContext && onContinueFromShortlist) {
                              await onContinueFromShortlist({
                                ...shortlistClaimContext,
                                workerId,
                              });
                              return;
                            }

                            if (!isAuthenticated) {
                              onLogin();
                              return;
                            }

                            const selection = buildCheckoutSelection(profile.servicePackages[selectedPackageIndex]);
                            if (selection) onContinueToConsultation(selection);
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mpp-sidebar-card">
                  <div className="mpp-contact-card">
                    <button type="button" className="mpp-secondary-action mpp-contact-action">
                      Contact me
                    </button>
                  </div>
                </div>

                <div className="mpp-sidebar-card">
                  <div className="mpp-hiring-title">Need flexibility when hiring?</div>
                  <p>Hire by the hour for long-term work with weekly payment visibility.</p>
                  <div className="mpp-hourly-rate">{formatRate(profile.rate, profile.currency)}</div>
                  <button className="mpp-secondary-action">Request hourly offer</button>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}

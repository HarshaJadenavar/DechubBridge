'use client';

import { useEffect, useMemo, useState } from 'react';
import './dashboard.css';
import type { DashboardPage } from './types/dashboard.type';
import DashboardHome from './pages/DashboardHome';
import WorkersPage from './pages/WorkersPage';
import { ContractsPage, InvoicesPage } from './pages/ContractInvoicePage';
import ProjectsPage from './pages/ProjectsPage';
import { tokenStore } from '../api/client';
import { getMyCompany } from '../api/company.api';
import TalentMarketplacePage from '../pages/TalentMarketplacePage';
import MarketplaceTalentRequestsPage from '../pages/MarketplaceTalentRequestsPage';
import MarketplaceTalentProfilePage from '../pages/MarketplaceTalentProfilePage';
import MarketplaceProjectConsultationPage from '../pages/MarketplaceProjectConsultationPage';
import type { MarketplaceCheckoutSelection } from '../api/marketplace.api';

interface NavItem {
  id: DashboardPage;
  icon: string;
  label: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: '▣', label: 'Dashboard' },
  { id: 'marketplace', icon: '🛍', label: 'Marketplace' },
  { id: 'workers', icon: '👥', label: 'Workers' },
  { id: 'hiring', icon: '🎯', label: 'Hiring' },
  { id: 'contracts', icon: '📄', label: 'Contracts' },
  { id: 'payroll', icon: '💵', label: 'Payroll' },
  { id: 'invoices', icon: '🧾', label: 'Invoices' },
  { id: 'documents', icon: '📁', label: 'Documents' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

NAV_ITEMS.splice(1, 0, { id: 'projects', icon: 'P', label: 'Projects' });

const PAGE_TITLES: Record<DashboardPage, string> = {
  home: 'Dashboard',
  projects: 'Projects',
  marketplace: 'Marketplace',
  workers: 'Workers',
  hiring: 'Hiring',
  contracts: 'Contracts',
  payroll: 'Payroll',
  invoices: 'Invoices',
  documents: 'Documents',
  settings: 'Settings',
};

const COMPANY_DESTINATION_KEY = 'dechub_company_destination';

type PayrollRegion = 'global' | 'us' | 'india' | 'uae';
type HiringView = 'overview' | 'marketplace' | 'requests' | 'profile' | 'consultation';

function getDashboardPageFromQuery(initialPage: DashboardPage, hireRequestId: string): DashboardPage {
  const tab = new URLSearchParams(window.location.search).get('tab')?.trim() ?? '';

  if (tab === 'marketplace') return 'hiring';
  if (tab === 'projects') return 'projects';
  if (tab === 'contracts') return 'contracts';
  if (tab === 'workers') return 'workers';
  if (tab === 'hiring') return 'hiring';
  if (tab === 'payroll') return 'payroll';
  if (tab === 'invoices') return 'invoices';
  if (tab === 'documents') return 'documents';
  if (tab === 'settings') return 'settings';
  if (tab === 'home') return 'home';

  return hireRequestId ? 'workers' : initialPage;
}

function getHiringViewFromQuery(): HiringView {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab')?.trim() ?? '';
  const hiringView = params.get('hiringView')?.trim() ?? '';

  if (tab === 'marketplace') return 'marketplace';
  if (tab !== 'hiring') return 'overview';
  if (hiringView === 'marketplace') return 'marketplace';
  if (hiringView === 'requests') return 'requests';
  return 'overview';
}

function DocumentsPage() {
  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-title">Documents</div>
          <div className="db-page-sub">All contracts, invoices, KYC files, and payslips</div>
        </div>
      </div>
      <div className="db-card">
        <div className="db-empty">
          <div className="db-empty-icon">📁</div>
          <div className="db-empty-title">No documents yet</div>
          <div className="db-empty-sub">
            Documents are stored here when workers complete KYC, sign contracts, and submit invoices.
          </div>
        </div>
      </div>
    </div>
  );
}

function HiringOverviewPage({ onSelectView }: { onSelectView: (next: HiringView) => void }) {
  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-title">Hiring</div>
          <div className="db-page-sub">
            Browse pre-vetted talent, manage open requests, and move approved hires into your delivery workflow.
          </div>
        </div>
      </div>

      <div className="db-workspace-grid db-marketplace-grid">
        <div className="db-card db-workspace-hero db-marketplace-hero">
          <div className="db-workspace-eyebrow">Dechub-Bridge Marketplace</div>
          <h2 className="db-workspace-title">Source talent faster from one hiring workspace</h2>
          <div className="db-marketplace-tags">
            <span className="db-marketplace-tag">Pre-vetted profiles</span>
            <span className="db-marketplace-tag">Request tracking</span>
            <span className="db-marketplace-tag">Worker conversion</span>
          </div>
          <div className="db-workspace-actions">
            <button className="db-btn-primary" onClick={() => onSelectView('marketplace')}>
              Explore Marketplace
            </button>
            <button className="db-btn-secondary" onClick={() => onSelectView('requests')}>
              Manage Requests
            </button>
          </div>
        </div>

        <div className="db-card db-workspace-card">
          <div className="db-card-header">
            <span className="db-card-title">What you can do here</span>
          </div>
          <div className="db-feature-stack">
            {[
              'Browse approved contractor and specialist profiles',
              'Track company talent requests in one place',
              'Move selected profiles into workers and contracts',
              'Keep hiring discovery separate from payroll execution',
            ].map((item) => (
              <div key={item} className="db-feature-row">
                <span className="db-feature-dot">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card db-workspace-card db-marketplace-flow">
          <div className="db-card-header">
            <span className="db-card-title">Recommended flow</span>
          </div>
          <div className="db-kpi-list">
            <div className="db-kpi-item">
              <strong>1. Discover</strong>
              <span>Search talent and shortlist relevant profiles inside Marketplace.</span>
            </div>
            <div className="db-kpi-item">
              <strong>2. Request</strong>
              <span>Open and track talent requests with your hiring details.</span>
            </div>
            <div className="db-kpi-item">
              <strong>3. Convert</strong>
              <span>Move approved hires into workers, contracts, and payroll execution.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HiringPage({
  hiringView,
  onSelectView,
  selectedProfileId,
  onSelectProfile,
  checkoutSelection,
  onSelectCheckout,
  hiringReturnView,
  onSetHiringReturnView,
  userName,
}: {
  hiringView: HiringView;
  onSelectView: (next: HiringView) => void;
  selectedProfileId: string;
  onSelectProfile: (workerId: string) => void;
  checkoutSelection: MarketplaceCheckoutSelection | null;
  onSelectCheckout: (selection: MarketplaceCheckoutSelection | null) => void;
  hiringReturnView: 'marketplace' | 'requests';
  onSetHiringReturnView: (next: 'marketplace' | 'requests') => void;
  userName: string;
}) {
  if (hiringView === 'marketplace') {
    return (
      <TalentMarketplacePage
        initialQuery=""
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onOpenProfile={(workerId) => {
          onSetHiringReturnView('marketplace');
          onSelectProfile(workerId);
          onSelectView('profile');
        }}
        onOpenTalentRequests={() => onSelectView('requests')}
        onLogout={() => {}}
        onNotifications={() => {}}
        onLogin={() => { window.location.href = '/get-started'; }}
        embedded
      />
    );
  }

  if (hiringView === 'requests') {
    return (
      <MarketplaceTalentRequestsPage
        userName={userName}
        onBack={() => onSelectView('overview')}
        onLogout={() => {}}
        onNotifications={() => {}}
        onOpenProfile={(workerId) => {
          onSetHiringReturnView('requests');
          onSelectProfile(workerId);
          onSelectView('profile');
        }}
        embedded
      />
    );
  }

  if (hiringView === 'profile') {
    return (
      <MarketplaceTalentProfilePage
        workerId={selectedProfileId}
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onContinueToConsultation={(selection) => {
          onSelectCheckout(selection);
          onSelectView('consultation');
        }}
        onOpenTalentRequests={() => onSelectView('requests')}
        onBack={() => onSelectView(hiringReturnView)}
        onLogout={() => {}}
        onNotifications={() => {}}
        onLogin={() => { window.location.href = '/get-started'; }}
        embedded
      />
    );
  }

  if (hiringView === 'consultation') {
    return (
      <MarketplaceProjectConsultationPage
        selection={checkoutSelection}
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onBack={() => onSelectView('profile')}
        onLogout={() => {}}
        onNotifications={() => {}}
        onLogin={() => { window.location.href = '/get-started'; }}
        embedded
        onSuccess={() => {
          onSelectView('requests');
        }}
      />
    );
  }

  return <HiringOverviewPage onSelectView={onSelectView} />;
}

function PayrollPage() {
  const [region, setRegion] = useState<PayrollRegion>('global');

  const content: Record<
    PayrollRegion,
    {
      summary: string;
      currencies: string;
      cards: Array<{ label: string; value: string; note: string }>;
    }
  > = {
    global: {
      summary:
        'Use payroll operations for cross-region visibility while routing active execution into the correct country setup.',
      currencies: 'Primary currencies: USD, INR, AED',
      cards: [
        { label: 'Coverage', value: '3 regions', note: 'US, India, and UAE payroll support' },
        { label: 'Execution model', value: 'Country-led', note: 'Each region can follow its own payroll workflow' },
        { label: 'Primary controls', value: 'Payroll, invoices, compliance', note: 'Keep approvals and records centralized' },
      ],
    },
    us: {
      summary:
        'Manage US payroll operations, approvals, and payment visibility for company payroll teams.',
      currencies: 'Currency: USD',
      cards: [
        { label: 'Payroll region', value: 'United States', note: 'Structured for recurring company payroll operations' },
        { label: 'Currency', value: 'USD', note: 'Primary payroll and invoice settlement currency' },
        { label: 'Use case', value: 'Company payroll', note: 'Best for company-managed salary and payroll administration' },
      ],
    },
    india: {
      summary:
        'Track India payroll workflows with better visibility across records, approvals, and recurring payroll preparation.',
      currencies: 'Currency: INR',
      cards: [
        { label: 'Payroll region', value: 'India', note: 'Localized operations and payroll record management' },
        { label: 'Currency', value: 'INR', note: 'Supports India payroll execution context' },
        { label: 'Use case', value: 'Payroll operations', note: 'Useful for recurring employee and payroll workflow management' },
      ],
    },
    uae: {
      summary:
        'Support UAE payroll planning and payment coordination with AED visibility as part of your regional operations.',
      currencies: 'Currency: AED',
      cards: [
        { label: 'Payroll region', value: 'United Arab Emirates', note: 'Added for UAE payroll handling and regional setup readiness' },
        { label: 'Currency', value: 'AED', note: 'Use AED for payroll context and payment coordination' },
        { label: 'Use case', value: 'Regional payroll support', note: 'Best for UAE payroll tracking, setup, and finance visibility' },
      ],
    },
  };

  const current = content[region];

  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-title">Payroll</div>
          <div className="db-page-sub">
            Payroll workspace for the regions you currently support: US, India, and UAE.
          </div>
        </div>
      </div>

      <div className="db-card db-payroll-shell">
        <div className="db-payroll-topline">
          <div>
            <div className="db-workspace-eyebrow">Payroll regions</div>
            <div className="db-payroll-summary">{current.summary}</div>
            <div className="db-payroll-currency">{current.currencies}</div>
          </div>

          <div className="db-segmented-control" role="tablist" aria-label="Payroll region selector">
            {[
              ['global', 'Global'],
              ['us', 'US'],
              ['india', 'India'],
              ['uae', 'UAE'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`db-segmented-control__item ${region === value ? 'active' : ''}`}
                onClick={() => setRegion(value as PayrollRegion)}
                aria-selected={region === value}
                role="tab"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="db-payroll-grid">
          {current.cards.map((card) => (
            <div key={card.label} className="db-payroll-metric">
              <div className="db-payroll-metric__label">{card.label}</div>
              <div className="db-payroll-metric__value">{card.value}</div>
              <div className="db-payroll-metric__note">{card.note}</div>
            </div>
          ))}
        </div>

        <div className="db-card db-payroll-note-card">
          <div className="db-card-header">
            <span className="db-card-title">Phase 1 payroll scope</span>
          </div>
          <div className="db-feature-stack">
            {[
              'US payroll operations and company payroll visibility',
              'India payroll workflow support and recurring process tracking',
              'UAE payroll support with AED visibility and regional setup readiness',
            ].map((item) => (
              <div key={item} className="db-feature-row">
                <span className="db-feature-dot">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ companyName }: { companyName: string }) {
  return (
    <div className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-title">Settings</div>
          <div className="db-page-sub">Manage your company profile, billing, and preferences</div>
        </div>
        <button className="db-btn-primary">Save changes</button>
      </div>

      {[
        {
          title: 'Company Profile',
          rows: [
            { label: 'Company name', value: companyName, input: 'text' },
            { label: 'Company email', value: 'admin@company.com', input: 'email' },
            { label: 'Default currency', value: 'USD', input: 'select' },
            { label: 'Pay cycle', value: 'Monthly', input: 'select' },
          ],
        },
        {
          title: 'Billing',
          rows: [
            { label: 'Plan', value: 'Starter — $49/worker/month', input: 'none' },
            { label: 'Billing card', value: '•••• •••• •••• 4242', input: 'none' },
          ],
        },
      ].map((section) => (
        <div key={section.title} className="db-card" style={{ marginBottom: 16 }}>
          <div className="db-card-header">
            <span className="db-card-title">{section.title}</span>
          </div>
          <div style={{ padding: '8px 24px 20px' }}>
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="db-form-group"
                style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}
              >
                <label
                  className="db-label"
                  style={{ width: 180, marginBottom: 0, flexShrink: 0, color: '#64748b', fontWeight: 500 }}
                >
                  {row.label}
                </label>
                {row.input === 'none' ? (
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{row.value}</span>
                ) : (
                  <input
                    type={row.input === 'email' ? 'email' : 'text'}
                    className="db-input"
                    defaultValue={row.value}
                    style={{ maxWidth: 320 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DashboardProps {
  companyName?: string;
  userName?: string;
  userRole?: string;
  initialPage?: DashboardPage;
}

export default function Dashboard({
  companyName = 'My Company',
  userName = 'Admin User',
  userRole = 'Company Admin',
  initialPage = 'home',
}: DashboardProps) {
  const initialHireRequestId = new URLSearchParams(window.location.search).get('hireRequest')?.trim() ?? '';
  const [page, setPage] = useState<DashboardPage>(() => getDashboardPageFromQuery(initialPage, initialHireRequestId));
  const [hiringView, setHiringView] = useState<HiringView>(() => getHiringViewFromQuery());
  const [selectedMarketplaceProfileId, setSelectedMarketplaceProfileId] = useState('');
  const [marketplaceCheckoutSelection, setMarketplaceCheckoutSelection] = useState<MarketplaceCheckoutSelection | null>(null);
  const [hiringReturnView, setHiringReturnView] = useState<'marketplace' | 'requests'>('marketplace');
  const [notifCount, setNotifCount] = useState(3);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [signupStep, setSignupStep] = useState<number | null>(null);
  const [setupBannerLoading, setSetupBannerLoading] = useState(true);
  const [oauthNotice] = useState(() => {
    const notice = sessionStorage.getItem('dechub_oauth_notice');
    sessionStorage.removeItem('dechub_oauth_notice');
    return notice;
  });

  useEffect(() => {
    const nextPage = getDashboardPageFromQuery(initialPage, initialHireRequestId);
    setPage(nextPage);
    setHiringView(getHiringViewFromQuery());
  }, [initialHireRequestId, initialPage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', page);
    if (page === 'hiring' && hiringView !== 'overview') {
      const queryHiringView = hiringView === 'requests' ? 'requests' : 'marketplace';
      params.set('hiringView', queryHiringView);
    } else {
      params.delete('hiringView');
    }
    if (page !== 'workers') {
      params.delete('hireRequest');
    }
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `/dashboard?${nextQuery}` : '/dashboard';
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [hiringView, page]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanySetupStatus() {
      if (!tokenStore.getAccess()) {
        if (!cancelled) {
          setSignupStep(null);
          setSetupBannerLoading(false);
        }
        return;
      }

      try {
        const company = await getMyCompany();
        if (cancelled) return;
        const nextSignupStep = typeof company.user?.signupStep === 'number' ? company.user.signupStep : null;
        setSignupStep(nextSignupStep);
      } catch {
        if (cancelled) return;
        setSignupStep(null);
      } finally {
        if (!cancelled) {
          setSetupBannerLoading(false);
        }
      }
    }

    void loadCompanySetupStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    tokenStore.clear();
    window.location.href = '/';
  };

  const handleContinueSetup = () => {
    sessionStorage.setItem(COMPANY_DESTINATION_KEY, 'dashboard');
    window.location.href = '/company/onboarding';
  };

  const initials = userName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const companyInitial = companyName[0]?.toUpperCase() ?? 'C';
  const isSetupIncomplete = typeof signupStep === 'number' && signupStep < 7;
  const completedSteps = useMemo(() => {
    if (!isSetupIncomplete || typeof signupStep !== 'number') return 0;
    return Math.max(0, Math.min(signupStep, 6));
  }, [isSetupIncomplete, signupStep]);
  const progressPercent = useMemo(() => {
    if (!isSetupIncomplete || completedSteps <= 0) return 0;
    return Math.round((completedSteps / 6) * 100);
  }, [completedSteps, isSetupIncomplete]);
  const currentPageTitle = page === 'hiring'
    ? hiringView === 'marketplace'
      ? 'Talent Marketplace'
      : hiringView === 'requests'
        ? 'Manage Requests'
        : hiringView === 'profile'
          ? 'Talent Profile'
          : hiringView === 'consultation'
            ? 'Project Consultation'
            : 'Hiring'
    : PAGE_TITLES[page];

  const workspaceItems = NAV_ITEMS.filter((item) =>
    ['home', 'projects', 'workers', 'hiring', 'contracts', 'payroll'].includes(item.id),
  );
  const operationsItems = NAV_ITEMS.filter((item) => ['invoices', 'documents', 'settings'].includes(item.id));

  return (
    <div className="db-shell">
      {mobileNavOpen && (
        <button
          type="button"
          className="db-nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside className={`db-sidebar${mobileNavOpen ? ' db-sidebar-open' : ''}`}>
        <div className="db-sidebar-logo">
          <div className="db-logo-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="db-logo-text">Dechub-Bridge</span>
        </div>

        <div className="db-company-switcher">
          <div className="db-company-avatar">{companyInitial}</div>
          <span className="db-company-name">{companyName}</span>
          <span className="db-company-chevron">⌄</span>
        </div>

        <nav className="db-nav" aria-label="Main navigation">
          <div className="db-nav-section">Workspace</div>
          {workspaceItems.map((item) => (
            item.id === 'hiring' ? (
              <div key={item.id} className={`db-nav-group ${page === 'hiring' ? 'active' : ''}`}>
                <button
                  className={`db-nav-item ${page === 'hiring' ? 'active' : ''}`}
                  onClick={() => {
                    setPage('hiring');
                    setHiringView('overview');
                    setMobileNavOpen(false);
                  }}
                  aria-current={page === 'hiring' && hiringView === 'overview' ? 'page' : undefined}
                >
                  <span className="db-nav-icon">{item.icon}</span>
                  <span className="db-nav-label">{item.label}</span>
                </button>
                <div className="db-nav-sublist">
                  <button
                    className={`db-nav-subitem ${page === 'hiring' && (hiringView === 'marketplace' || hiringView === 'profile' || hiringView === 'consultation') ? 'active' : ''}`}
                    onClick={() => {
                      setPage('hiring');
                      setHiringView('marketplace');
                      setMobileNavOpen(false);
                    }}
                  >
                    Talent Marketplace
                  </button>
                  <button
                    className={`db-nav-subitem ${page === 'hiring' && hiringView === 'requests' ? 'active' : ''}`}
                    onClick={() => {
                      setPage('hiring');
                      setHiringView('requests');
                      setMobileNavOpen(false);
                    }}
                  >
                    Manage Requests
                  </button>
                </div>
              </div>
            ) : (
              <button
                key={item.id}
                className={`db-nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => {
                  setPage(item.id);
                  setMobileNavOpen(false);
                }}
                aria-current={page === item.id ? 'page' : undefined}
              >
                <span className="db-nav-icon">{item.icon}</span>
                <span className="db-nav-label">{item.label}</span>
                {item.badge ? <span className="db-nav-badge">{item.badge}</span> : null}
              </button>
            )
          ))}

          <div className="db-nav-section">Operations</div>
          {operationsItems.map((item) => (
            <button
              key={item.id}
              className={`db-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => {
                setPage(item.id);
                setMobileNavOpen(false);
              }}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <span className="db-nav-icon">{item.icon}</span>
              <span className="db-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="db-sidebar-user">
          <div className="db-user-avatar">{initials}</div>
          <div className="db-user-info">
            <div className="db-user-name">{userName}</div>
            <div className="db-user-role">{userRole}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 16,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = 'rgba(255,255,255,0.3)';
            }}
          >
            ⇥
          </button>
        </div>
      </aside>

      <div className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-heading">
            <button
              type="button"
              className="db-mobile-menu"
              aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              ☰
            </button>
            <div className="db-topbar-title">{currentPageTitle}</div>
          </div>

          <div className="db-topbar-search">
            <span>🔍</span>
            <input
              type="search"
              placeholder="Search…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Global search"
            />
          </div>

          <div className="db-topbar-actions">
            <button
              className="db-icon-btn"
              aria-label={`${notifCount} notifications`}
              onClick={() => setNotifCount(0)}
            >
              🔔
              {notifCount > 0 && <span className="db-notif-dot" />}
            </button>
            <button className="db-icon-btn" aria-label="Help">
              ?
            </button>
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
                cursor: 'pointer',
              }}
              title={userName}
            >
              {initials}
            </div>
          </div>
        </header>

        <main>
          {oauthNotice && (
            <div className="db-oauth-notice" role="status">
              {oauthNotice}
            </div>
          )}

          {!setupBannerLoading && isSetupIncomplete && (
            <section className="db-setup-banner" aria-label="Complete company setup">
              <div className="db-setup-banner__content">
                <div className="db-setup-banner__eyebrow">Complete company setup</div>
                <h2 className="db-setup-banner__title">
                  Your dashboard is ready. Finish setup whenever you&apos;re ready.
                </h2>
                <p className="db-setup-banner__text">
                  You can keep exploring the dashboard now and come back to complete the remaining company onboarding steps later.
                </p>
                <div className="db-setup-banner__meta">
                  <span>{completedSteps}/6 setup steps completed</span>
                  <span>{progressPercent}% done</span>
                </div>
                <div className="db-setup-banner__progress" aria-hidden="true">
                  <span className="db-setup-banner__progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="db-setup-banner__actions">
                <button className="db-btn-primary" onClick={handleContinueSetup}>
                  Complete company setup
                </button>
                <button className="db-btn-secondary" onClick={() => setPage('home')}>
                  Keep exploring dashboard
                </button>
              </div>
            </section>
          )}

          {page === 'home' && <DashboardHome onNavigate={(nextPage) => setPage(nextPage as DashboardPage)} />}
          {page === 'projects' && <ProjectsPage />}
          {page === 'workers' && <WorkersPage initialHireRequestId={initialHireRequestId} />}
          {page === 'hiring' && (
            <HiringPage
              hiringView={hiringView}
              onSelectView={setHiringView}
              selectedProfileId={selectedMarketplaceProfileId}
              onSelectProfile={setSelectedMarketplaceProfileId}
              checkoutSelection={marketplaceCheckoutSelection}
              onSelectCheckout={setMarketplaceCheckoutSelection}
              hiringReturnView={hiringReturnView}
              onSetHiringReturnView={setHiringReturnView}
              userName={userName}
            />
          )}
          {page === 'contracts' && <ContractsPage />}
          {page === 'payroll' && <PayrollPage />}
          {page === 'invoices' && <InvoicesPage />}
          {page === 'documents' && <DocumentsPage />}
          {page === 'settings' && <SettingsPage companyName={companyName} />}
        </main>
      </div>
    </div>
  );
}

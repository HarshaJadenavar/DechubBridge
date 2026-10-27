import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import './styles.css';
import CompanyAuthPage from './pages/CompanyAuthPage';
import CompanyChoicePage from './pages/CompanyChoicePage';
import CompanyOnboardingPage from './pages/CompanyOnboardingPage';
import TalentMarketplacePage from './pages/TalentMarketplacePage';
import MarketplaceTalentProfilePage from './pages/MarketplaceTalentProfilePage';
import MarketplaceProjectConsultationPage from './pages/MarketplaceProjectConsultationPage';
import MarketplacePaymentPage from './pages/MarketplacePaymentPage';
import MarketplaceTalentRequestsPage from './pages/MarketplaceTalentRequestsPage';
import NotificationPage from './pages/NotificationPage';
import LandingPage from './pages/LandingPageDeel';
import DeelVsCompetitorsPage from './pages/DeelVsCompetitorsPage';
import DeelItPage from './pages/DeelItPage';
import DeelHirePage from './pages/DeelHirePage';
import DeelHrPage from './pages/DeelHrPage';
import DeelEmbeddedPage from './pages/DeelEmbeddedPage';
import DeelBenefitsPage from './pages/DeelBenefitsPage';
import DeelMobilityPage from './pages/DeelMobilityPage';
import DeelServicesPage from './pages/DeelServicesPage';
import DeelEorPage from './pages/DeelEorPage';
import DeelContractorsPage from './pages/DeelContractorsPage';
import PayrollSolutionsPage from './pages/PayrollSolutionsPage';
import PricingPage from './pages/PricingPage';
import DeelIntegrationsPage from './pages/DeelIntegrationsPage';
import DeelOpenApiPage from './pages/DeelOpenApiPage';
import TalentRequestsPage from './pages/Admin/TalentRequestsPage';
import TalentRequestDetailPage from './pages/Admin/TalentRequestDetailPage';
import AdminProjectBuilderPage from './pages/Admin/AdminProjectBuilderPage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import FreelancerSignupPage from './pages/FreelancerSignupPage';
import FreelancerSignupSuccessPage from './pages/FreelancerSignupSuccessPage';
import StandaloneDocumentPage from './components/common/StandaloneDocumentPage';
import { tokenStore, adminTokenStore } from './api/client';
import { handleGoogleCallback } from './api/auth.api';
import { getMyCompany } from './api/company.api';
import { contractorTokenStore } from './contractor/api/contractor.api';
import type { Step } from './types/signup';
import type { MarketplaceCheckoutSelection, MarketplaceOrderDraft } from './api/marketplace.api';
import {
  claimShortlistedTalentRequest,
  getCompanyTalentRequest,
} from './api/talentRequests.api';

type AppPage =
  | 'landing'
  | 'landing-react'
  | 'landing-react-new'
  | 'dechub-bridge-vs-competitors'
  | 'deel-it'
  | 'deel-hire'
  | 'deel-hr'
  | 'deel-embedded'
  | 'deel-benefits'
  | 'deel-mobility'
  | 'deel-services'
  | 'deel-eor'
  | 'deel-contractors'
  | 'payroll-solutions'
  | 'pricing'
  | 'deel-integrations'
  | 'deel-open-api'
  | 'landing-about'
  | 'landing-blog'
  | 'landing-blog-post'
  | 'landing-contact'
  | 'landing-privacy'
  | 'role-select'
  | 'company-choice'
  | 'company-dashboard-auth'
  | 'company-onboarding'
  | 'auth'
  | 'freelancer-login'
  | 'freelancer-signup'
  | 'freelancer-success'
  | 'freelancer-dashboard'
  | 'marketplace'
  | 'marketplace-profile'
  | 'marketplace-requests'
  | 'marketplace-consultation'
  | 'marketplace-payment'
  | 'admin-login'
  | 'admin-talent-requests'
  | 'admin-talent-request-detail'
  | 'admin-project-builder'
  | 'notifications';

type AuthMode = 'login' | 'signup';
type CompanyDestination = 'marketplace' | 'dashboard' | 'marketplace-profile';

const COMPANY_DESTINATION_KEY = 'dechub_company_destination';
const MARKETPLACE_CHECKOUT_SELECTION_KEY = 'dechub_marketplace_checkout_selection';
const MARKETPLACE_ORDER_DRAFT_KEY = 'dechub_marketplace_order_draft';
const PENDING_SHORTLIST_CLAIM_KEY = 'dechub_pending_shortlist_claim';

interface PendingShortlistClaim {
  requestId: string;
  workerId: string;
  token: string;
}

function readSessionJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSessionJson<T>(key: string, value: T | null): void {
  if (value === null) {
    sessionStorage.removeItem(key);
    return;
  }

  sessionStorage.setItem(key, JSON.stringify(value));
}

function getRouteState(pathname: string): { page: AppPage; mode: AuthMode } {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (/^\/blog\/[^/]+$/.test(normalizedPath)) {
    return { page: 'landing-blog-post', mode: 'login' };
  }

  if (normalizedPath === '/landing-react') {
    return { page: 'landing-react', mode: 'login' };
  }

  if (normalizedPath === '/landing-react-new') {
    return { page: 'landing-react-new', mode: 'login' };
  }

  if (normalizedPath === '/dechub-bridge-vs-competitors') {
    return { page: 'dechub-bridge-vs-competitors', mode: 'login' };
  }

  if (normalizedPath === '/solutions/it' || normalizedPath === '/it') {
    return { page: 'deel-it', mode: 'login' };
  }

  if (normalizedPath === '/solutions/hire') {
    return { page: 'deel-hire', mode: 'login' };
  }

  if (normalizedPath === '/solutions/hr' || normalizedPath === '/hr') {
    return { page: 'deel-hr', mode: 'login' };
  }

  if (normalizedPath === '/solutions/embedded') {
    return { page: 'deel-embedded', mode: 'login' };
  }

  if (normalizedPath === '/solutions/benefits') {
    return { page: 'deel-benefits', mode: 'login' };
  }

  if (normalizedPath === '/solutions/mobility' || normalizedPath === '/mobility') {
    return { page: 'deel-mobility', mode: 'login' };
  }

  if (normalizedPath === '/solutions/services') {
    return { page: 'deel-services', mode: 'login' };
  }

  if (normalizedPath === '/solutions/payroll/eor') {
    return { page: 'deel-eor', mode: 'login' };
  }

  if (normalizedPath === '/solutions/payroll/contractors') {
    return { page: 'deel-contractors', mode: 'login' };
  }

  if (normalizedPath === '/solutions/payroll' || normalizedPath === '/payroll') {
    return { page: 'payroll-solutions', mode: 'login' };
  }

  if (normalizedPath === '/pricing') {
    return { page: 'pricing', mode: 'login' };
  }

  if (normalizedPath === '/integrations') {
    return { page: 'deel-integrations', mode: 'login' };
  }

  if (normalizedPath === '/solutions/open-api') {
    return { page: 'deel-open-api', mode: 'login' };
  }

  if (normalizedPath === '/about') {
    return { page: 'landing-about', mode: 'login' };
  }

  if (normalizedPath === '/blog') {
    return { page: 'landing-blog', mode: 'login' };
  }

  if (normalizedPath === '/contact') {
    return { page: 'landing-contact', mode: 'login' };
  }

  if (normalizedPath === '/legal-pages/privacy-policy') {
    return { page: 'landing-privacy', mode: 'login' };
  }

  if (normalizedPath === '/marketplace/requests') {
    return { page: 'marketplace-requests', mode: 'login' };
  }

  const marketplaceMatch = normalizedPath.match(/^\/marketplace\/([^/]+)(?:\/(consultation|payment))?$/);

  if (marketplaceMatch) {
    if (marketplaceMatch[2] === 'consultation') {
      return { page: 'marketplace-consultation', mode: 'login' };
    }

    if (marketplaceMatch[2] === 'payment') {
      return { page: 'marketplace-payment', mode: 'login' };
    }

    return { page: 'marketplace-profile', mode: 'login' };
  }

  if (normalizedPath === '/get-started') {
    return { page: 'role-select', mode: 'login' };
  }

  if (normalizedPath === '/company') {
    return { page: 'company-choice', mode: 'login' };
  }

  if (normalizedPath === '/company/dashboard/login' || normalizedPath === '/company/login') {
    return { page: 'company-dashboard-auth', mode: 'login' };
  }

  if (normalizedPath === '/company/onboarding') {
    return { page: 'company-onboarding', mode: 'login' };
  }

  if (normalizedPath === '/company/signup') {
    return { page: 'auth', mode: 'signup' };
  }

  if (normalizedPath === '/auth/callback') {
    return { page: 'company-dashboard-auth', mode: 'login' };
  }

  if (normalizedPath === '/freelancer/login') {
    return { page: 'freelancer-login', mode: 'login' };
  }

  if (normalizedPath === '/freelancer/signup') {
    return { page: 'freelancer-signup', mode: 'login' };
  }

  if (normalizedPath === '/freelancer/dashboard') {
    return { page: 'freelancer-dashboard', mode: 'login' };
  }

  if (normalizedPath === '/freelancer/success') {
    return { page: 'freelancer-success', mode: 'login' };
  }

  if (normalizedPath === '/marketplace') {
    return { page: 'marketplace', mode: 'login' };
  }

  if (normalizedPath === '/admin/login') {
    return { page: 'admin-login', mode: 'login' };
  }

  if (normalizedPath === '/admin/talent-requests') {
    return { page: 'admin-talent-requests', mode: 'login' };
  }

  if (/^\/admin\/talent-requests\/[^/]+\/project$/.test(normalizedPath)) {
    return { page: 'admin-project-builder', mode: 'login' };
  }

  if (/^\/admin\/talent-requests\/[^/]+$/.test(normalizedPath)) {
    return { page: 'admin-talent-request-detail', mode: 'login' };
  }

  if (normalizedPath === '/notifications') {
    return { page: 'notifications', mode: 'login' };
  }

  return { page: 'landing', mode: 'login' };
}

function getMarketplaceQueryFromUrl(): string {
  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
}

function getLandingBlogSlugFromUrl(): string {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const match = normalizedPath.match(/^\/blog\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]).trim() : '';
}

function getMarketplaceProfileIdFromUrl(): string {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (!normalizedPath.startsWith('/marketplace/')) {
    return '';
  }

  const segments = normalizedPath.split('/').filter(Boolean);
  const workerId = segments[1] ?? '';
  return decodeURIComponent(workerId).trim();
}

function getAdminRequestIdFromUrl(): string {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const match = normalizedPath.match(/^\/admin\/talent-requests\/([^/]+)(?:\/project)?$/);
  return match ? decodeURIComponent(match[1]).trim() : '';
}

function getPendingShortlistClaimFromUrl(): PendingShortlistClaim | null {
  const requestId = new URLSearchParams(window.location.search).get('requestId')?.trim() ?? '';
  const token = new URLSearchParams(window.location.search).get('token')?.trim() ?? '';
  const workerId = getMarketplaceProfileIdFromUrl();

  if (!requestId || !token || !workerId) {
    return null;
  }

  return { requestId, token, workerId };
}

function getActiveShortlistClaimContext(): PendingShortlistClaim | null {
  return getPendingShortlistClaimFromUrl() ?? readSessionJson<PendingShortlistClaim>(PENDING_SHORTLIST_CLAIM_KEY);
}

function buildShortlistClaimQuery(claim: PendingShortlistClaim | null): string {
  if (!claim?.requestId || !claim?.token) {
    return '';
  }

  return `?requestId=${encodeURIComponent(claim.requestId)}&token=${encodeURIComponent(claim.token)}`;
}

function getUserNameFromToken(): string {
  const accessToken = tokenStore.getAccess();
  if (!accessToken) return 'Company User';

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1] ?? ''));
    const firstName = typeof payload.firstName === 'string' ? payload.firstName : '';
    const lastName = typeof payload.lastName === 'string' ? payload.lastName : '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || payload.email || 'Company User';
  } catch {
    return 'Company User';
  }
}

function getSignupStepFromToken(): number | null {
  const accessToken = tokenStore.getAccess();
  if (!accessToken) return null;

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1] ?? '')) as Record<string, unknown>;
    const raw = payload.signupStep ?? payload.signup_step;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string' && /^\\d+$/.test(raw)) return Number(raw);
    return null;
  } catch {
    return null;
  }
}
async function getSignupStepFromServer(): Promise<number | null> {
  try {
    const data = await getMyCompany();
    return typeof data.user?.signupStep === 'number' ? data.user.signupStep : null;
  } catch {
    return null;
  }
}
function setCompanyDestination(destination: CompanyDestination): void {
  console.log('[setCompanyDestination] Setting to:', destination);
  sessionStorage.setItem(COMPANY_DESTINATION_KEY, destination);
}

function getCompanyDestination(): CompanyDestination {
  const raw = sessionStorage.getItem(COMPANY_DESTINATION_KEY);
  // A direct company sign-up should enter the main workspace. Marketplace remains
  // the destination only when the user intentionally started there.
  const dest = raw === 'marketplace' || raw === 'marketplace-profile' ? raw : 'dashboard';
  console.log('[getCompanyDestination] Retrieved:', dest);
  return dest;
}

function getNextCompanyStep(signupStep: number): Step | null {
  if (signupStep >= 7) return null;
  return Math.min(Math.max(signupStep + 1, 1), 6) as Step;
}

export default function App() {
  const initialRoute = useMemo(() => getRouteState(window.location.pathname), []);

  const [page, setPage] = useState<AppPage>(initialRoute.page);
  const [authMode, setAuthMode] = useState<AuthMode>(initialRoute.mode);
  const [userName, setUserName] = useState<string>(() => getUserNameFromToken());
  const [freelancerFirstName, setFreelancerFirstName] = useState('');
  const [companyOnboardingStep, setCompanyOnboardingStep] = useState<Step>(1);
  const [companyOnboardingFromMarketplace, setCompanyOnboardingFromMarketplace] = useState(false);
  const [marketplaceQuery, setMarketplaceQuery] = useState<string>(() => getMarketplaceQueryFromUrl());
  const [selectedMarketplaceProfileId, setSelectedMarketplaceProfileId] = useState<string>(() => getMarketplaceProfileIdFromUrl());
  const [selectedAdminRequestId, setSelectedAdminRequestId] = useState<string>(() => getAdminRequestIdFromUrl());
  const [selectedMarketplacePackage, setSelectedMarketplacePackage] = useState<MarketplaceCheckoutSelection | null>(
    () => readSessionJson<MarketplaceCheckoutSelection>(MARKETPLACE_CHECKOUT_SELECTION_KEY),
  );
  const [marketplaceOrderDraft, setMarketplaceOrderDraft] = useState<MarketplaceOrderDraft | null>(
    () => readSessionJson<MarketplaceOrderDraft>(MARKETPLACE_ORDER_DRAFT_KEY),
  );
  const [pendingShortlistClaimFromUrl, setPendingShortlistClaimFromUrl] = useState<PendingShortlistClaim | null>(
    () => getActiveShortlistClaimContext(),
  );

  useEffect(() => {
    const handlePopState = () => {
      const next = getRouteState(window.location.pathname);
      setPage(next.page);
      setAuthMode(next.mode);
      setMarketplaceQuery(getMarketplaceQueryFromUrl());
      setSelectedMarketplaceProfileId(getMarketplaceProfileIdFromUrl());
      setSelectedAdminRequestId(getAdminRequestIdFromUrl());
      setPendingShortlistClaimFromUrl(getActiveShortlistClaimContext());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  useEffect(() => {
    if ((page === 'admin-talent-requests' || page === 'admin-talent-request-detail' || page === 'admin-project-builder') && !adminTokenStore.getAccess()) {
      setPage('admin-login');
    }
  }, [page]);

  // Enforce role-based access control
  useEffect(() => {
    const hasAdminToken = adminTokenStore.getAccess();
    const hasCompanyToken = tokenStore.getAccess();

    // Define page access rules by role
    const adminPages = new Set(['admin-login', 'admin-talent-requests', 'admin-talent-request-detail', 'admin-project-builder']);
    // Pages that require an ACTIVE company login session (NOT the login page itself)
    const companyOnlyPages = new Set(['company-onboarding', 'marketplace-requests', 'marketplace-consultation', 'marketplace-payment', 'notifications']);

    // Rule 1: If admin is logged in, restrict to admin pages only
    if (hasAdminToken && !adminPages.has(page)) {
      setPage('admin-talent-requests');
      return;
    }

    // Rule 2: Accessing admin-talent-requests without admin token → go to admin login
    if (!hasAdminToken && (page === 'admin-talent-requests' || page === 'admin-talent-request-detail' || page === 'admin-project-builder')) {
      setPage('admin-login');
      return;
    }

    // Rule 3: Accessing company-only pages without company token → go to landing
    if (!hasCompanyToken && companyOnlyPages.has(page)) {
      setPage('landing');
      return;
    }

    // Rule 4: All other pages are public (no restrictions)
  }, [page]);

  useEffect(() => {
    const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (normalizedPath !== '/auth/callback') {
      return;
    }

    const result = handleGoogleCallback();
    if (!result) {
      setPage('company-dashboard-auth');
      return;
    }

    setUserName(getUserNameFromToken());

    if (result.accountStatus === 'existing') {
      sessionStorage.setItem('dechub_oauth_notice', 'Welcome back. Your existing account has been signed in.');
    }

    const destination = getCompanyDestination();

    if (destination === 'dashboard') {
      window.location.replace('/dashboard');
      return;
    }

    if (destination === 'marketplace-profile') {
      setPage('marketplace-profile');
      return;
    }

    setPage('marketplace');
  }, []);

  useEffect(() => {
    if (page !== 'company-onboarding' || !tokenStore.getAccess()) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const signupStep = (await getSignupStepFromServer()) ?? getSignupStepFromToken() ?? 1;
      const nextStep = getNextCompanyStep(signupStep) ?? 1;

      if (!cancelled) {
        setCompanyOnboardingStep(nextStep);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const completePendingShortlistClaim = async (): Promise<boolean> => {
    const pending = readSessionJson<PendingShortlistClaim>(PENDING_SHORTLIST_CLAIM_KEY);
    if (!pending || !tokenStore.getAccess()) {
      return false;
    }

    try {
      const result = await claimShortlistedTalentRequest(pending.requestId, {
        token: pending.token,
        workerId: pending.workerId,
      });
      writeSessionJson(PENDING_SHORTLIST_CLAIM_KEY, null);
      window.location.replace(`/dashboard?hireRequest=${encodeURIComponent(result._id)}`);
      return true;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    let targetPath = authMode === 'signup' ? '/company/signup' : '/company/login';
    const shortlistClaimQuery = buildShortlistClaimQuery(getActiveShortlistClaimContext());

    switch (page) {
      case 'landing':
        targetPath = '/';
        break;
      case 'landing-react':
        targetPath = '/landing-react';
        break;
      case 'landing-react-new':
        targetPath = '/landing-react-new';
        break;
      case 'dechub-bridge-vs-competitors':
        targetPath = '/dechub-bridge-vs-competitors';
        break;
      case 'deel-it':
        targetPath = '/solutions/it';
        break;
      case 'deel-hire':
        targetPath = '/solutions/hire';
        break;
      case 'deel-hr':
        targetPath = '/solutions/hr';
        break;
      case 'deel-embedded':
        targetPath = '/solutions/embedded';
        break;
      case 'deel-benefits':
        targetPath = '/solutions/benefits';
        break;
      case 'deel-mobility':
        targetPath = '/solutions/mobility';
        break;
      case 'deel-services':
        targetPath = '/solutions/services';
        break;
      case 'deel-eor':
        targetPath = '/solutions/payroll/eor';
        break;
      case 'deel-contractors':
        targetPath = '/solutions/payroll/contractors';
        break;
      case 'payroll-solutions':
        targetPath = '/solutions/payroll';
        break;
      case 'pricing':
        targetPath = '/pricing';
        break;
      case 'deel-integrations':
        targetPath = '/integrations';
        break;
      case 'deel-open-api':
        targetPath = '/solutions/open-api';
        break;
      case 'landing-about':
        targetPath = '/about';
        break;
      case 'landing-blog':
        targetPath = '/blog';
        break;
      case 'landing-blog-post':
        targetPath = `/blog/${encodeURIComponent(getLandingBlogSlugFromUrl())}`;
        break;
      case 'landing-contact':
        targetPath = '/contact';
        break;
      case 'landing-privacy':
        targetPath = '/legal-pages/privacy-policy';
        break;
      case 'role-select':
        targetPath = '/get-started';
        break;
      case 'company-choice':
        targetPath = '/company';
        break;
      case 'company-dashboard-auth':
        targetPath = `/company/login${shortlistClaimQuery}`;
        break;
      case 'company-onboarding':
        targetPath = '/company/onboarding';
        break;
      case 'auth':
        targetPath = `/company/signup${shortlistClaimQuery}`;
        break;
      case 'marketplace':
        targetPath = `/marketplace${marketplaceQuery ? `?q=${encodeURIComponent(marketplaceQuery)}` : ''}`;
        break;
      case 'marketplace-requests':
        targetPath = '/marketplace/requests';
        break;
      case 'notifications':
        targetPath = '/notifications';
        break;
      case 'admin-login':
        targetPath = '/admin/login';
        break;
      case 'admin-talent-requests':
        targetPath = '/admin/talent-requests';
        break;
      case 'admin-talent-request-detail':
        targetPath = `/admin/talent-requests/${encodeURIComponent(selectedAdminRequestId)}`;
        break;
      case 'admin-project-builder':
        targetPath = `/admin/talent-requests/${encodeURIComponent(selectedAdminRequestId)}/project`;
        break;
      case 'marketplace-consultation':
        targetPath = `/marketplace/${encodeURIComponent(selectedMarketplaceProfileId)}/consultation`;
        break;
      case 'marketplace-payment':
        targetPath = `/marketplace/${encodeURIComponent(selectedMarketplaceProfileId)}/payment`;
        break;
      case 'marketplace-profile':
        targetPath = `/marketplace/${encodeURIComponent(selectedMarketplaceProfileId)}${shortlistClaimQuery}`;
        break;
      case 'freelancer-login':
        targetPath = '/freelancer/login';
        break;
      case 'freelancer-signup':
        targetPath = '/freelancer/signup';
        break;
      case 'freelancer-success':
        targetPath = '/freelancer/success';
        break;
      case 'freelancer-dashboard':
        targetPath = '/freelancer/dashboard';
        break;
      default:
        break;
    }

    const currentPath = `${window.location.pathname.replace(/\/+$/, '') || '/'}${window.location.search}`;
    if (currentPath !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }

    setPendingShortlistClaimFromUrl(getActiveShortlistClaimContext());
  }, [authMode, marketplaceQuery, page, selectedAdminRequestId, selectedMarketplaceProfileId]);

  const handleAuthSuccess = async (result: { signupStep?: number }) => {
    console.log('[handleAuthSuccess] Called with:', result);
    console.log('[handleAuthSuccess] Company token stored:', !!tokenStore.getAccess());
    
    setUserName(getUserNameFromToken());
    
    // Remember the destination for after onboarding completes
    const destination = getCompanyDestination();
    console.log('[handleAuthSuccess] Destination from sessionStorage:', destination);

    setCompanyOnboardingFromMarketplace(destination === 'marketplace' || destination === 'marketplace-profile');
    console.log('[handleAuthSuccess] Signup step:', typeof result.signupStep === 'number' ? result.signupStep : 1);

    if (destination === 'marketplace') {
      console.log('[handleAuthSuccess] Marketplace origin login; redirecting to marketplace immediately');
      setPage('marketplace');
      return;
    }

    if (destination === 'marketplace-profile') {
      console.log('[handleAuthSuccess] Marketplace profile origin login; redirecting to profile immediately');
      setPage('marketplace-profile');
      return;
    }

    if (readSessionJson<PendingShortlistClaim>(PENDING_SHORTLIST_CLAIM_KEY)) {
      const claimed = await completePendingShortlistClaim();
      if (claimed) {
        return;
      }
      setPage('marketplace-profile');
      return;
    }

    // User has completed onboarding or is not coming from marketplace
    console.log('[handleAuthSuccess] Defaulting to dashboard');
    window.location.replace('/dashboard');
  };

  const handleAdminAuthSuccess = () => {
    setPage('admin-talent-requests');
  };

  const handleAdminLogout = () => {
    adminTokenStore.clear();
    setPage('landing');
  };

  const handleLogout = () => {
    tokenStore.clear();
    setUserName('Company User');
    setAuthMode('login');
    setPage('landing');
  };

  const handleCompanyOnboardingComplete = async () => {
    const destination = getCompanyDestination();
    console.log('[handleCompanyOnboardingComplete] companyOnboardingFromMarketplace:', companyOnboardingFromMarketplace, 'destination:', destination);

    if (readSessionJson<PendingShortlistClaim>(PENDING_SHORTLIST_CLAIM_KEY)) {
      const claimed = await completePendingShortlistClaim();
      if (claimed) {
        return;
      }
      setPage('marketplace-profile');
      return;
    }

    if (companyOnboardingFromMarketplace || destination === 'marketplace') {
      console.log('[handleCompanyOnboardingComplete] Redirecting to marketplace via SPA');
      setPage('marketplace');
      return;
    }

    console.log('[handleCompanyOnboardingComplete] Redirecting to dashboard');
    window.location.replace('/dashboard');
  };

  const handleCompanyOnboardingBack = () => {
    const destination = getCompanyDestination();

    if (destination === 'dashboard' && tokenStore.getAccess()) {
      window.location.replace('/dashboard');
      return;
    }

    if (destination === 'marketplace-profile') {
      setPage('marketplace-profile');
      return;
    }

    if (companyOnboardingFromMarketplace || destination === 'marketplace') {
      setPage('marketplace');
      return;
    }

    setPage('company-dashboard-auth');
  };

  const handleMarketplaceCheckoutSelection = (selection: MarketplaceCheckoutSelection) => {
    setSelectedMarketplaceProfileId(selection.workerId);
    setSelectedMarketplacePackage(selection);
    setMarketplaceOrderDraft(null);
    writeSessionJson(MARKETPLACE_CHECKOUT_SELECTION_KEY, selection);
    writeSessionJson(MARKETPLACE_ORDER_DRAFT_KEY, null);
    setPage('marketplace-consultation');
  };

  const handleShortlistProfileContinue = async (claim: PendingShortlistClaim) => {
    writeSessionJson(PENDING_SHORTLIST_CLAIM_KEY, claim);
    setPendingShortlistClaimFromUrl(claim);
    const openDashboardHireFlow = (requestId: string) => {
      writeSessionJson(PENDING_SHORTLIST_CLAIM_KEY, null);
      setPendingShortlistClaimFromUrl(null);
      window.location.replace(`/dashboard?hireRequest=${encodeURIComponent(requestId)}`);
    };

    if (!tokenStore.getAccess()) {
      setCompanyDestination('dashboard');
      setPage('company-dashboard-auth');
      return;
    }

    try {
      const request = await getCompanyTalentRequest(claim.requestId);
      const hasPendingSelection = ['candidate_selected', 'hire_started'].includes(request.status)
        && Boolean(request.workerId);

      if (hasPendingSelection && request.workerId === claim.workerId) {
        openDashboardHireFlow(claim.requestId);
        return;
      }

      if (hasPendingSelection && request.workerId !== claim.workerId) {
        window.alert(
          `You have already chosen ${request.workerName || 'one shortlisted profile'}, but you did not complete that hiring flow. Please ask Dechub to resend the profiles if you want to choose a different candidate.`,
        );
        return;
      }
    } catch {
      // If the request lookup fails, fall back to the claim flow below.
    }

    try {
      const result = await claimShortlistedTalentRequest(claim.requestId, {
        token: claim.token,
        workerId: claim.workerId,
      });
      openDashboardHireFlow(result._id);
      return;
    } catch {
      openDashboardHireFlow(claim.requestId);
      return;
    }
  };

  if (page === 'landing' || page === 'landing-react' || page === 'landing-react-new') {
    return (
      <LandingPage
        onGetStarted={() => setPage('role-select')}
        onMarketplace={() => setPage('marketplace')}
        onMarketplaceSearch={(query) => {
          setMarketplaceQuery(query);
          setPage('marketplace');
        }}
      />
    );
  }

  if (page === 'landing-about') {
    return <StandaloneDocumentPage sourcePath="/about/index.html" />;
  }

  if (page === 'dechub-bridge-vs-competitors') {
    return <DeelVsCompetitorsPage />;
  }

  if (page === 'deel-it') {
    return <DeelItPage />;
  }

  if (page === 'deel-hire') {
    return <DeelHirePage />;
  }

  if (page === 'deel-hr') {
    return <DeelHrPage />;
  }

  if (page === 'deel-embedded') {
    return <DeelEmbeddedPage />;
  }

  if (page === 'deel-benefits') {
    return <DeelBenefitsPage />;
  }

  if (page === 'deel-mobility') {
    return <DeelMobilityPage />;
  }

  if (page === 'deel-services') {
    return <DeelServicesPage />;
  }

  if (page === 'deel-eor') {
    return <DeelEorPage />;
  }

  if (page === 'deel-contractors') {
    return <DeelContractorsPage />;
  }

  if (page === 'payroll-solutions') {
    return <PayrollSolutionsPage />;
  }

  if (page === 'pricing') {
    return <PricingPage />;
  }

  if (page === 'deel-integrations') {
    return <DeelIntegrationsPage />;
  }

  if (page === 'deel-open-api') {
    return <DeelOpenApiPage />;
  }

  if (page === 'landing-blog') {
    return <StandaloneDocumentPage sourcePath="/blog/index.html" />;
  }

  if (page === 'landing-blog-post') {
    const blogSlug = getLandingBlogSlugFromUrl();
    return <StandaloneDocumentPage sourcePath={`/blog/${blogSlug}/index.html`} />;
  }

  if (page === 'landing-contact') {
    return <StandaloneDocumentPage sourcePath="/contact/index.html" />;
  }

  if (page === 'landing-privacy') {
    return <StandaloneDocumentPage sourcePath="/legal-pages/privacy-policy/index.html" />;
  }

  if (page === 'role-select') {
    return (
      <RoleSelectionPage
        onBack={() => setPage('landing')}
        onCompany={() => {
          setCompanyDestination('dashboard');
          setPage('company-dashboard-auth');
        }}
        onFreelancer={() => {
          setPage('freelancer-login');
        }}
      />
    );
  }

  if (page === 'company-choice') {
    return (
      <CompanyChoicePage
        onBack={() => setPage('role-select')}
        onMarketplace={() => {
          setCompanyDestination('marketplace');
          setMarketplaceQuery('');
          setSelectedMarketplaceProfileId('');
          setPage('marketplace');
        }}
        onDashboard={async () => {
          if (tokenStore.getAccess()) {
            window.location.replace('/dashboard');
            return;
          }

          setCompanyDestination('dashboard');
          setPage('company-dashboard-auth');
        }}
      />
    );
  }

  const handleCompanyAuthModeChange = (mode: AuthMode) => {
    if (mode === 'login') {
      setPage('company-dashboard-auth');
      setAuthMode('login');
      return;
    }

    setPage('auth');
    setAuthMode('signup');
  };

  if (page === 'company-dashboard-auth') {
    return (
      <CompanyAuthPage
        mode="login"
        onModeChange={handleCompanyAuthModeChange}
        onBack={() => setPage('landing')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (page === 'admin-login') {
    return (
      <AdminLoginPage
        onLogin={handleAdminAuthSuccess}
        onBack={() => setPage('landing')}
      />
    );
  }

  if (page === 'auth') {
    return (
      <CompanyAuthPage
        mode="signup"
        onModeChange={handleCompanyAuthModeChange}
        onBack={() => setPage('role-select')}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  if (page === 'company-onboarding') {
    return (
      <CompanyOnboardingPage
        initialStep={companyOnboardingStep}
        hideProgress={companyOnboardingFromMarketplace}
        completeAfterStep1={companyOnboardingFromMarketplace}
        onBack={handleCompanyOnboardingBack}
        onComplete={handleCompanyOnboardingComplete}
      />
    );
  }

  if (page === 'freelancer-login') {
    return (
      <LoginPage
        initialRole="contractor"
        allowedRoles={['contractor']}
        onCompanyLogin={() => {
          if (tokenStore.getAccess()) {
            window.location.replace('/dashboard');
            return;
          }
          setPage('company-dashboard-auth');
        }}
        onContractorLogin={() => {
          window.location.replace('/contractor/dashboard');
        }}
        onSignUp={() => {
          contractorTokenStore.clear();
          setPage('freelancer-signup');
        }}
      />
    );
  }

  if (page === 'freelancer-signup') {
    return (
      <FreelancerSignupPage
        onBack={() => setPage('freelancer-login')}
        onComplete={(profile) => {
          setFreelancerFirstName(profile.firstName);
          setPage('freelancer-success');
        }}
      />
    );
  }

  if (page === 'freelancer-success') {
    return (
      <FreelancerSignupSuccessPage
        firstName={freelancerFirstName || 'there'}
        onDashboard={() => {
          window.location.replace('/contractor/dashboard');
        }}
      />
    );
  }

  if (page === 'freelancer-dashboard') {
    window.location.replace('/contractor/dashboard');
    return null;
  }

  if (page === 'admin-talent-requests') {
    return (
      <TalentRequestsPage
        onLogout={handleAdminLogout}
        onOpenRequest={(requestId) => {
          setSelectedAdminRequestId(requestId);
          setPage('admin-talent-request-detail');
        }}
      />
    );
  }

  if (page === 'admin-talent-request-detail') {
    return (
      <TalentRequestDetailPage
        requestId={selectedAdminRequestId}
        onBack={() => setPage('admin-talent-requests')}
        onBuildProject={() => setPage('admin-project-builder')}
      />
    );
  }

  if (page === 'admin-project-builder') {
    return <AdminProjectBuilderPage requestId={selectedAdminRequestId} onBack={() => setPage('admin-talent-request-detail')} />;
  }

  if (page === 'marketplace-consultation') {
    return (
      <MarketplaceProjectConsultationPage
        selection={selectedMarketplacePackage}
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onBack={() => setPage('marketplace-profile')}
        onLogout={handleLogout}
        onNotifications={() => setPage('notifications')}
        onLogin={() => {
          if (tokenStore.getAccess()) {
            // already logged in: go to marketplace immediately
            setCompanyDestination('marketplace');
            setPage('marketplace');
            return;
          }
          setCompanyDestination('marketplace');
          setPage('company-dashboard-auth');
        }}
      />
    );
  }

  if (page === 'marketplace-payment') {
    return (
      <MarketplacePaymentPage
        selection={selectedMarketplacePackage}
        orderDraft={marketplaceOrderDraft}
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onBack={() => setPage('marketplace-consultation')}
        onLogout={handleLogout}
        onNotifications={() => setPage('notifications')}
        onLogin={() => {
          if (tokenStore.getAccess()) {
            setCompanyDestination('marketplace');
            setPage('marketplace');
            return;
          }
          setCompanyDestination('marketplace');
          setPage('company-dashboard-auth');
        }}
      />
    );
  }

  if (page === 'notifications') {
    return <NotificationPage onBack={() => setPage('marketplace')} />;
  }

  if (page === 'marketplace-requests') {
    return (
      <MarketplaceTalentRequestsPage
        userName={userName}
        onBack={() => setPage('marketplace')}
        onLogout={handleLogout}
        onNotifications={() => setPage('notifications')}
        onOpenProfile={(workerId) => {
          setSelectedMarketplaceProfileId(workerId);
          setPage('marketplace-profile');
        }}
      />
    );
  }

  return (
    page === 'marketplace-profile' ? (
      <MarketplaceTalentProfilePage
        workerId={selectedMarketplaceProfileId}
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onContinueToConsultation={handleMarketplaceCheckoutSelection}
        shortlistClaimContext={pendingShortlistClaimFromUrl}
        onContinueFromShortlist={handleShortlistProfileContinue}
        onOpenTalentRequests={() => setPage('marketplace-requests')}
        onBack={() => {
          setPage('marketplace');
        }}
        onLogout={handleLogout}
        onNotifications={() => setPage('notifications')}
        onLogin={() => {
          if (tokenStore.getAccess()) {
            setCompanyDestination('marketplace-profile');
            setPage('marketplace-profile');
            return;
          }
          setCompanyDestination('marketplace-profile');
          setPage('company-dashboard-auth');
        }}
      />
    ) : (
      <TalentMarketplacePage
        initialQuery={marketplaceQuery}
        isAuthenticated={Boolean(tokenStore.getAccess())}
        userName={userName}
        onOpenTalentRequests={() => setPage('marketplace-requests')}
        onLogout={handleLogout}
        onNotifications={() => setPage('notifications')}
        onLogin={() => {
          setCompanyDestination('marketplace');
          setPage('company-dashboard-auth');
        }}
        onOpenProfile={(workerId) => {
          setSelectedMarketplaceProfileId(workerId);
          setPage('marketplace-profile');
        }}
      />
    )
  );
}

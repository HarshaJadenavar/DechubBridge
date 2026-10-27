import { api, ApiResponse, normalizeError, unwrapApiData } from './client';
import { resolveImageUrl } from '../utils/imageUrl';

export interface MarketplaceTalentProfile {
  id: string;
  workerId: string;
  name: string;
  role: string;
  location: string;
  city: string;
  country: string;
  skills: string[];
  rate: number;
  currency: string;
  availability: 'available_now' | 'this_week' | 'two_weeks' | 'next_month' | 'not_available';
  availabilityLabel: string;
  blurb: string;
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  servicePackages?: MarketplaceServicePackage[];
}

export interface MarketplacePortfolioProject {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export interface MarketplaceServicePackage {
  name: string;
  price: number;
  description: string;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

export interface MarketplaceCheckoutSelection {
  workerId: string;
  workerName: string;
  workerRole: string;
  workerAvatarUrl?: string;
  currency: string;
  package: MarketplaceServicePackage;
}

export interface MarketplaceFaqItem {
  question: string;
  answer: string;
}

export interface MarketplaceTalentProfileDetail extends MarketplaceTalentProfile {
  email: string;
  responseTimeHours: number;
  languages: string[];
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  profileOverview: string;
  portfolioProjects: MarketplacePortfolioProject[];
  servicePackages: MarketplaceServicePackage[];
  faqItems: MarketplaceFaqItem[];
  memberSince: string;
}

export interface MarketplaceOrderDraftClientDetails {
  companyName: string;
  companyWebsite: string;
  projectType: string;
  budget: string;
  projectDescription: string;
}

export interface MarketplaceOrderDraftPayload {
  packageSnapshot: MarketplaceServicePackage;
  clientDetails: MarketplaceOrderDraftClientDetails;
}

export interface MarketplaceOrderDraft {
  id: string;
  orderNumber: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  packageSnapshot: MarketplaceServicePackage;
  clientDetails: MarketplaceOrderDraftClientDetails;
  status: 'draft' | 'pending_payment';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

export const FALLBACK_MARKETPLACE_TALENT: MarketplaceTalentProfile[] = [
  {
    id: 'fallback-graphic-designer',
    workerId: 'fallback-graphic-designer',
    name: 'Sarah Lee',
    role: 'Graphic Designer',
    location: 'Austin, TX',
    city: 'Austin',
    country: 'United States',
    skills: ['Graphic Design', 'Brand Identity', 'Social Media Design', 'Adobe Illustrator', 'Figma'],
    rate: 42,
    currency: 'USD',
    availability: 'available_now',
    availabilityLabel: 'Available now',
    blurb: 'Graphic designer focused on brand systems, campaign creatives, and polished visual assets for fast-moving teams.',
  },
  {
    id: 'fallback-website-developer',
    workerId: 'fallback-website-developer',
    name: 'John Smith',
    role: 'Website Developer',
    location: 'Remote',
    city: 'Remote',
    country: 'United States',
    skills: ['Website Developer', 'React', 'Next.js', 'TypeScript', 'Frontend Development'],
    rate: 58,
    currency: 'USD',
    availability: 'this_week',
    availabilityLabel: 'Available this week',
    blurb: 'Frontend developer building responsive websites, landing pages, and product experiences with modern React stacks.',
  },
  {
    id: 'fallback-architect',
    workerId: 'fallback-architect',
    name: 'Priya Sharma',
    role: 'Architect & Interior Designer',
    location: 'New York, NY',
    city: 'New York',
    country: 'United States',
    skills: ['Architecture', 'Interior Design', 'Space Planning', '3D Visualization', 'AutoCAD'],
    rate: 65,
    currency: 'USD',
    availability: 'two_weeks',
    availabilityLabel: '2 weeks notice',
    blurb: 'Architect and interior designer experienced in concept development, space planning, and client-ready presentation decks.',
  },
  {
    id: 'fallback-ui-ux',
    workerId: 'fallback-ui-ux',
    name: 'Michael Torres',
    role: 'Product Designer',
    location: 'San Francisco, CA',
    city: 'San Francisco',
    country: 'United States',
    skills: ['UI Design', 'UX Design', 'Graphic Design', 'Design Systems', 'Prototyping'],
    rate: 54,
    currency: 'USD',
    availability: 'next_month',
    availabilityLabel: 'Available next month',
    blurb: 'Product designer blending UX thinking and visual craft for dashboards, SaaS products, and marketing surfaces.',
  },
];

function normalizeMarketplaceProfile<T extends MarketplaceTalentProfile>(profile: T): T {
  return {
    ...profile,
    profilePhotoUrl: resolveImageUrl(profile.profilePhotoUrl),
    bannerImageUrl: resolveImageUrl(profile.bannerImageUrl),
    ...('portfolioProjects' in profile && Array.isArray(profile.portfolioProjects)
      ? {
          portfolioProjects: profile.portfolioProjects.map((project) => ({
            ...project,
            imageUrl: resolveImageUrl(project.imageUrl),
          })),
        }
      : {}),
  };
}

export async function getMarketplaceTalent(): Promise<MarketplaceTalentProfile[]> {
  try {
    const res = await api.get<ApiResponse<MarketplaceTalentProfile[]>>('/workers/marketplace', {
      headers: { Authorization: undefined },
    });
    return unwrapApiData(res.data).map(normalizeMarketplaceProfile);
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function getMarketplaceTalentProfile(workerId: string): Promise<MarketplaceTalentProfileDetail> {
  try {
    const res = await api.get<ApiResponse<MarketplaceTalentProfileDetail>>(`/workers/marketplace/${workerId}`, {
      headers: { Authorization: undefined },
    });
    return normalizeMarketplaceProfile(unwrapApiData(res.data));
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function createMarketplaceOrderDraft(
  workerId: string,
  payload: MarketplaceOrderDraftPayload,
): Promise<MarketplaceOrderDraft> {
  try {
    const res = await api.post<ApiResponse<MarketplaceOrderDraft>>(
      `/workers/marketplace/${workerId}/order-drafts`,
      payload,
    );
    return unwrapApiData(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

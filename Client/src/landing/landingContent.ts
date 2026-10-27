import featureIconAccountBox from './assets/feature-icon-account-box.png';
import featureIconArticle from './assets/feature-icon-article.png';
import featureIconAttachMoney from './assets/feature-icon-attach-money.png';
import featureIconBalance from './assets/feature-icon-balance.png';
import featureIconEdit from './assets/feature-icon-edit.png';
import featureIconInbox from './assets/feature-icon-inbox.png';
import inFlag from './assets/in-flag.svg';
import usFlag from './assets/us-flag.svg';

export const navItems = ['Solutions', 'How it works', "Who it's for", 'Coverage', 'Pricing'] as const;

export const serviceChips = [
  'Architecture & Interior Design',
  'Graphic Design',
  'Website Developer',
] as const;

export const trustBadges = ['No credit card', 'No setup fee', 'Cancel anytime'] as const;

export const brandLogos = [
  'CloudBase',
  'VentureScale',
  'DataStream',
  'NexusCorp',
  'BuildAI',
  'TempoFlow',
  'SkillGrid',
  'Northstar',
  'LaunchPilot',
] as const;

export const browserStats = [
  { value: '12', label: 'ACTIVE WORKERS' },
  { value: '3', label: 'PENDING INVOICES' },
  { value: 'May 31', label: 'NEXT PAYROLL' },
  { value: '$36k', label: 'MONTHLY COST' },
] as const;

export const browserRows = [
  {
    name: 'John Smith',
    track: 'US',
    role: 'React Dev',
    status: 'Active',
    pay: '$5k',
    badgeClass: 'landing-browser-badge-active',
  },
  {
    name: 'Sarah Lee',
    track: 'US',
    role: 'Designer',
    status: 'KYC',
    pay: '$3k',
    badgeClass: 'landing-browser-badge-kyc',
  },
  {
    name: 'Mike Torres',
    track: 'US',
    role: 'PM',
    status: 'Invited',
    pay: '$4k',
    badgeClass: 'landing-browser-badge-invited',
  },
] as const;

export const companyStripLogos = [
  'BuildAI',
  'CloudBase',
  'NexusCorp',
  'TempoFlow',
  'Northstar',
] as const;

export const stats = [
  {
    value: '170+',
    copy: 'Countries where your contractors can receive payments',
  },
  {
    value: '24hr',
    copy: 'Average KYC verification turnaround time',
  },
  {
    value: '$0',
    copy: 'Setup fee. Pay only $49 per active worker per month',
  },
  {
    value: '1-2d',
    copy: 'Payment delivery via Wise after invoice approval',
  },
] as const;

export const chipCloudTags = [
  'Endpoint Protection',
  'PEO',
  'E-sign',
  'EOR',
  'Device Lifecycle Management',
  'Dept Benefits',
  'Dept Mobility',
  'HRIS',
  'Mobile Device Management',
  'Talent',
  'Background Checks',
  'Access Management',
  'Equity Consulting',
  'Workforce Planning',
  'Contractor',
  'Compensation',
  'Seat Pricing',
  'Entity Setup & Management',
  'AI',
] as const;

export const howItWorksSteps = [
  {
    step: '01',
    title: 'Bring talent into one hiring flow',
    copy: 'Start with a marketplace shortlist or invite your own contractor, then capture the role, budget, and scope in one structured workflow.',
    details: ['Marketplace or direct invite', 'Role, budget & timeline', 'Centralized hiring intake'],
  },
  {
    step: '02',
    title: 'Contract, verify, and onboard compliantly',
    copy: 'Generate the agreement, collect e-signatures, and guide the contractor through KYC and tax documentation without chasing files across email.',
    details: ['DocuSign e-signature', '24hr KYC average', 'W-9 / W-8BEN support'],
  },
  {
    step: '03',
    title: 'Approve invoices and pay with confidence',
    copy: 'Track submitted invoices, approve payments, and keep full visibility on payout status, contracts, and documents from one dashboard.',
    details: ['Wise payouts in 170+ countries', '1-2 business day delivery', 'Live status tracking'],
  },
] as const;

export const featureCards = [
  {
    title: 'Smart contract generation',
    copy: 'Legally compliant contractor agreements auto-generated from your inputs. No lawyer needed for standard hires.',
    bullets: ['Fixed, milestone & hourly contracts', 'IP assignment & NDA clauses', 'Delaware law jurisdiction (US)'],
    icon: featureIconArticle,
  },
  {
    title: 'DocuSign e-signature',
    copy: 'Both parties sign electronically via DocuSign. Contractor signs first, then your company countersigns.',
    bullets: ['Embedded signing with no app download', 'Dual-party signature tracking', 'Instant PDF on completion'],
    icon: featureIconEdit,
  },
  {
    title: 'KYC identity verification',
    copy: 'Contractor uploads ID and selfie. Verification is typically completed within 24 hours.',
    bullets: ['Passport, license, national ID', 'Liveness check via selfie', 'AES-256 encrypted storage'],
    icon: featureIconAccountBox,
  },
  {
    title: 'Wise global payments',
    copy: 'After invoice approval, Wise transfers funds in 1-2 business days in the contractor local currency.',
    bullets: ['170+ countries supported', 'Zero hidden fees', 'Bank, Wise, or PayPal payout'],
    icon: featureIconAttachMoney,
  },
  {
    title: 'Invoice management',
    copy: 'Contractors submit monthly invoices from their portal. Approve or dispute with one click.',
    bullets: ['Contractor self-service portal', 'Approve, dispute, or request changes', 'PDF receipts auto-generated'],
    icon: featureIconInbox,
  },
  {
    title: 'Compliance & tax forms',
    copy: 'W-9 and W-8BEN guidance for US engagements, plus completion certificates issued at contract end.',
    bullets: ['Guided W-9 / W-8BEN collection', 'Completion certificate on end', 'Tax reminders as an add-on'],
    icon: featureIconBalance,
  },
] as const;

export const coverageTracks = [
  {
    title: 'Track 2 - US Contractors',
    status: 'Live now',
    summary: 'Hire US-based independent contractors from any country. Full contract, KYC, e-sign, and Wise payout pipeline.',
    bullets: ['USD contracts with DocuSign e-signature', 'W-9 / W-8BEN tax form guidance', 'Wise payout in 1-2 business days'],
    flag: usFlag,
    alt: 'US flag',
  },
  {
    title: 'Track 3 - India Payroll',
    status: 'Coming next',
    summary: 'We are expanding from contractor management to payroll support for Indian teams in the next rollout phase.',
    bullets: ['Onboarding and payroll operations', 'Local compliance workflows', 'Centralized workforce visibility'],
    flag: inFlag,
    alt: 'India flag',
  },
] as const;

export const audienceCards = [
  {
    eyebrow: 'For businesses',
    title: 'Build your remote team. Skip the compliance chaos.',
    copy: 'Onboard contractors across borders, issue contracts in minutes, and trigger payments automatically without legal or finance bottlenecks.',
    bullets: [
      'Live dashboard to track every contractor and contract status',
      'Auto-generated compliant contracts, ready to sign',
      'One-click invoice approval with instant Wise payout',
      'All documents in one place: contracts, KYC, invoices',
    ],
    cta: 'Set up your workspace',
  },
  {
    eyebrow: 'For contractors',
    title: 'Do the work you love. Get paid without the wait.',
    copy: 'Accept a project invite, sign digitally, submit your invoice, and receive payment in your local account wherever you are in the world.',
    bullets: [
      'Email invite to join with no account creation needed upfront',
      '5-step mobile-first profile and onboarding flow',
      'Raise invoices and watch payment status in real time',
      'Paid in your currency across 170+ countries via Wise',
    ],
    cta: 'Start earning globally',
  },
] as const;

export const pricingFeatures = [
  'Contract generation & PDF',
  'DocuSign e-signature for both parties',
  'KYC identity verification ($1.50/check)',
  'Invoice management & approval flow',
  'Wise payment processing',
  'AES-256 encrypted document storage',
  'Completion certificate',
] as const;

export const partnerBullets = [
  'Invite contractors, sign agreements, and approve invoices in one operational flow.',
  'Keep finance, people ops, and hiring aligned with shared status visibility.',
  'Deliver a polished contractor experience from invite to payout.',
] as const;

export const partnerProfiles = [
  {
    name: 'John Smith',
    role: 'Senior React Developer',
    copy: 'Accepted, signed, verified, and invoice-ready.',
    avatarClass: 'landing-profile-avatar-1',
  },
  {
    name: 'Sarah Lee',
    role: 'Product Designer',
    copy: 'KYC completed and contract countersigned.',
    avatarClass: 'landing-profile-avatar-2',
  },
  {
    name: 'Mike Torres',
    role: 'Project Manager',
    copy: 'Onboarding underway with payroll follow-up queued.',
    avatarClass: 'landing-profile-avatar-3',
  },
] as const;

export const testimonials = [
  {
    quote: 'We hired 3 US contractors in one afternoon. Contract generated, signed via DocuSign the same day, and payment through Wise without any issues.',
    role: 'CEO, BuildAI - Bengaluru',
    name: 'Ravi Kumar',
    initials: 'RK',
  },
  {
    quote: 'As a US contractor working with Indian companies, getting paid was a nightmare. Dechub made it seamless, with invoice approval and Wise transfer the next day.',
    role: 'Senior React Developer - Austin, TX',
    name: 'John Smith',
    initials: 'JS',
  },
  {
    quote: 'We were spending $800/month on legal fees for contractor agreements. Dechub cut that to zero and gave our board the compliance confidence they needed.',
    role: 'COO, VentureScale - Mumbai',
    name: 'Anjali Patel',
    initials: 'AP',
  },
] as const;

export const faqItems = [
  {
    question: 'How can AI automation help my business?',
    answer:
      'AI automation helps reduce repetitive manual work, speed up response times, improve accuracy, and let your team focus on higher-value work like growth, service, and strategy.',
  },
  {
    question: 'Is AI automation difficult to integrate?',
    answer:
      'No. Dechub is designed around your current contractor workflow so setup stays practical, lightweight, and tailored to how your team already operates.',
  },
  {
    question: 'What industries can benefit from Dechub?',
    answer:
      'Agencies, product companies, startups, and operations-heavy teams benefit the most when they need compliant contracts, faster onboarding, and reliable cross-border payouts.',
  },
  {
    question: 'Do I need technical knowledge to use the platform?',
    answer:
      'Not at all. We handle the heavy lifting behind contracts, verification, and payouts so the day-to-day workflow feels simple for your hiring and finance teams.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'We support setup, contractor onboarding, compliance workflows, and payment coordination so your hiring flow keeps moving without blockers.',
  },
] as const;

export const closingCta = {
  eyebrow: 'Ready to hire your first global contractor?',
  title: 'Join companies hiring smarter with Dechub.',
  copy: 'Set up in 10 minutes, no credit card required.',
} as const;

export const footerColumns = [
  {
    title: 'Product',
    links: ['Features', 'How it works', 'Pricing', 'Coverage', "What's new"],
  },
  {
    title: 'Company',
    links: ['About us', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API reference', 'Hiring guides', 'Support', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy policy', 'Terms of service', 'Cookie policy', 'Compliance'],
  },
] as const;

import { FormData, Step, UploadedDocs } from '../types/signup';

// ─── Initial form data — every FormData field must have a default ─────────────

export const initialData: FormData = {
  // Step 1
  firstName:   '',
  lastName:    '',
  workEmail:   '',
  password:    '',
  phoneCode:   '+1',
  phone:       '',

  // Step 2
  companyName:    '',
  companyCountry: '',
  companyType:    '',
  taxId:          '',

  // Step 3
  companySize:     '',
  companyIndustry: '',
  companyWebsite:  '',
  addressLine1:    '',
  addressCity:     '',
  addressZip:      '',
  referralSource:  '',

  // Step 5 — Billing
  billCurrency:          'USD',
  billingEmail:          '',
  stripePaymentMethodId: '',   // ← populated by Stripe Elements in Step5Billing

  // Step 6 — Preferences
  payCycle:         'monthly',
  contractCurrency: 'USD',
  companyTimezone:  '',
  hrEmail:          '',
  notif1: true,
  notif2: true,
  notif3: true,
  notif4: true,
};

// ─── Initial uploaded docs state ──────────────────────────────────────────────

export const initialDocs: UploadedDocs = {};

// ─── Step progress config ─────────────────────────────────────────────────────

export const stepConfig: Record<Exclude<Step, 7>, { label: string; pct: number }> = {
  1: { label: 'Create account',       pct: 16  },
  2: { label: 'Company identity',     pct: 33  },
  3: { label: 'Business details',     pct: 50  },
  4: { label: 'Verify business',      pct: 66  },
  5: { label: 'Billing setup',        pct: 83  },
  6: { label: 'HR preferences',       pct: 100 },
};

// ─── Company types for Step 2 selector ───────────────────────────────────────

export const companyTypes = [
  { title: 'LLC',         sub: 'Limited Liability Company' },
  { title: 'Corp',        sub: 'C-Corp or S-Corp'          },
  { title: 'Pvt Ltd',     sub: 'Private Limited (India/UK)' },
  { title: 'Sole Trader', sub: 'Sole Proprietorship'       },
  { title: 'Partnership', sub: 'General or LP'             },
  { title: 'Other',       sub: 'Other structure'           },
];
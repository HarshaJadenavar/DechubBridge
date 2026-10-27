import { FormData, Step, UploadedDocs } from '../types/signup';

// ─── Email ────────────────────────────────────────────────────────────────────

const FREE_DOMAINS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com',
  'icloud.com','protonmail.com','aol.com','live.com','me.com',
]);

export function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && !FREE_DOMAINS.has(domain);
}

// ─── Per-step validators ──────────────────────────────────────────────────────

type ErrorMap = Record<string, string>;

function step1(f: FormData): ErrorMap {
  const e: ErrorMap = {};
  const normalizedPhone = f.phone.trim();
  if (!f.firstName.trim())          e.firstName = 'First name is required';
  if (!f.lastName.trim())           e.lastName  = 'Last name is required';
  if (!f.workEmail.trim())          e.workEmail = 'Work email is required';
  else if (!validateEmail(f.workEmail)) e.workEmail = 'Enter a valid company email (not Gmail/Yahoo)';
  if (!f.password)                  e.password  = 'Password is required';
  else if (f.password.length < 8)   e.password  = 'Password must be at least 8 characters';
  if (!f.phone.trim())              e.phone     = 'Phone number is required';
  else if (normalizedPhone.length < 7) e.phone  = 'Phone number is too short';
  else if (normalizedPhone.length > 20) e.phone = 'Phone number is too long';
  return e;
}

function step2(f: FormData): ErrorMap {
  const e: ErrorMap = {};
  if (!f.companyName.trim())    e.companyName    = 'Company name is required';
  if (!f.companyCountry)        e.companyCountry = 'Select your country of registration';
  if (!f.companyType)           e.companyType    = 'Select a company type';
  if (!f.taxId.trim())          e.taxId          = 'Registration / Tax ID is required';
  return e;
}

function step3(f: FormData): ErrorMap {
  const e: ErrorMap = {};
  if (!f.companySize)           e.companySize     = 'Select company size';
  if (!f.companyIndustry)       e.companyIndustry = 'Select your industry';
  if (!f.addressLine1.trim())   e.addressLine1    = 'Street address is required';
  if (!f.addressCity.trim())    e.addressCity     = 'City is required';
  if (!f.addressZip.trim())     e.addressZip      = 'ZIP / postal code is required';
  return e;
}

function step4(_f: FormData, docs: UploadedDocs): ErrorMap {
  const e: ErrorMap = {};
  if (!docs.doc1?.uploaded) e.doc1 = 'Certificate of Incorporation is required';
  if (!docs.doc3?.uploaded) e.doc3 = 'Owner / Director ID is required';
  return e;
}

function step5(_f: FormData): ErrorMap {
  // Card validation is handled by Stripe Elements — we only validate currency
  return {};
}

function step6(f: FormData): ErrorMap {
  const e: ErrorMap = {};
  if (!f.payCycle)          e.payCycle        = 'Select a pay cycle';
  if (!f.contractCurrency)  e.contractCurrency= 'Select a default currency';
  if (!f.companyTimezone)   e.companyTimezone = 'Select your timezone';
  if (!f.hrEmail.trim())    e.hrEmail         = 'HR admin email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.hrEmail)) e.hrEmail = 'Enter a valid email';
  return e;
}

// ─── Entry point called by App.tsx ────────────────────────────────────────────

export function validateStep(
  step: Step,
  formData: FormData,
  uploadedDocs: UploadedDocs = {},
): ErrorMap {
  switch (step) {
    case 1: return step1(formData);
    case 2: return step2(formData);
    case 3: return step3(formData);
    case 4: return step4(formData, uploadedDocs);
    case 5: return step5(formData);
    case 6: return step6(formData);
    default: return {};
  }
}

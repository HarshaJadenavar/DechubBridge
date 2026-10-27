// ─── Step ─────────────────────────────────────────────────────────────────────

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ─── KYB ─────────────────────────────────────────────────────────────────────

export type KybStatus = 'pending' | 'verifying' | 'approved' | 'rejected';

// ─── Documents ────────────────────────────────────────────────────────────────

export type DocKey = 'doc1' | 'doc2' | 'doc3' | 'doc4';

export interface DocState {
  file:     File;
  uploaded: boolean;
}

export type UploadedDocs = Partial<Record<DocKey, DocState>>;

// ─── Form data ────────────────────────────────────────────────────────────────

export interface FormData {
  // Step 1 — Account
  firstName:   string;
  lastName:    string;
  workEmail:   string;
  password:    string;
  phoneCode:   string;
  phone:       string;

  // Step 2 — Company Identity
  companyName:    string;
  companyCountry: string;
  companyType:    string;
  taxId:          string;

  // Step 3 — Business Details
  companySize:     string;
  companyIndustry: string;
  companyWebsite:  string;
  addressLine1:    string;
  addressCity:     string;
  addressZip:      string;
  referralSource:  string;

  // Step 4 — KYB (files tracked via uploadedDocs, not here)

  // Step 5 — Billing
  billCurrency:          string;
  billingEmail:          string;
  stripePaymentMethodId: string;   // set by Stripe Elements after card setup

  // Step 6 — Preferences
  payCycle:         string;
  contractCurrency: string;
  companyTimezone:  string;
  hrEmail:          string;
  notif1: boolean;
  notif2: boolean;
  notif3: boolean;
  notif4: boolean;
}

// ─── App state ────────────────────────────────────────────────────────────────

export interface AppState {
  currentStep:   Step;
  formData:      FormData;
  errors:        Record<string, string>;
  uploadedDocs:  UploadedDocs;
  dragOver:      Partial<Record<DocKey, boolean>>;
  kybStatus:     KybStatus;
  loadingAction: string | null;
  showPassword:  boolean;
  passwordScore: number;
  passwordStrength: { label: string; color: string };
  cardBrand:     string;

  // New — production additions
  serverError:        string | null;
  kybUploadPct:       number;
  stripeClientSecret: string | null;
}

// ─── App handlers ────────────────────────────────────────────────────────────

export interface AppHandlers {
  handleInputChange:    <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  goToStep:             (step: Step) => Promise<void>;
  switchStep:           (step: Step) => void;
  submitKyb:            () => Promise<void>;
  goBillingAfterKyb:   () => Promise<void>;
  completeSignup:       () => Promise<void>;
  handleFileInput:      (docKey: DocKey) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver:           (docKey: DocKey) => (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave:          (docKey: DocKey) => () => void;
  onDrop:               (docKey: DocKey) => (e: React.DragEvent<HTMLDivElement>) => void;
  setShowPassword:      React.Dispatch<React.SetStateAction<boolean>>;
  validateEmail:        (email: string) => boolean;
  googleSignup:         () => void;
  goBack:               () => void;
  goToLogin?:           () => void;
  goToDashboard:        () => void;
}

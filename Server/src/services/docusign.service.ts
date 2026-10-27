/**
 * DocuSign service
 *
 * Uses DocuSign eSignature REST API v2.1 with JWT Grant auth.
 * Env vars required:
 *   DOCUSIGN_INTEGRATION_KEY  — OAuth client ID from DocuSign Apps & Keys
 *   DOCUSIGN_ACCOUNT_ID       — Your DocuSign account GUID
 *   DOCUSIGN_USER_ID          — Impersonated user GUID (your admin user)
 *   DOCUSIGN_PRIVATE_KEY      — RSA private key (PEM, newlines as \n)
 *   DOCUSIGN_BASE_URL         — https://demo.docusign.net (sandbox) or https://na3.docusign.net (prod)
 *   CLIENT_URL                — Your frontend URL, used for redirect after signing
 */

import { env } from '../config/env';
import { logger } from '../utils/logger';

// ─── Token cache ──────────────────────────────────────────────────────────────

let cachedToken:   string | null = null;
let tokenExpiry:   number        = 0;

async function postJson<T>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DocuSign request failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

function requireDocusignEnv(): void {
  const missing = [
    'DOCUSIGN_INTEGRATION_KEY',
    'DOCUSIGN_ACCOUNT_ID',
    'DOCUSIGN_USER_ID',
    'DOCUSIGN_PRIVATE_KEY',
    'DOCUSIGN_BASE_URL',
  ].filter((key) => !env[key as keyof typeof env]);

  if (missing.length) {
    throw new Error(`Missing DocuSign environment variables: ${missing.join(', ')}`);
  }
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;
  requireDocusignEnv();

  // JWT Grant — sign assertion with RSA private key
  // In production, use the docusign-esign SDK for proper JWT assertion building
  // Here we use a simplified HTTP POST approach
  const privateKey = (env.DOCUSIGN_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  const { createSign } = await import('crypto');

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now     = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: env.DOCUSIGN_INTEGRATION_KEY,
    sub: env.DOCUSIGN_USER_ID,
    aud: 'account-d.docusign.com',
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  })).toString('base64url');

  const sigInput = `${header}.${payload}`;
  const signer   = createSign('RSA-SHA256');
  signer.update(sigInput);
  const sig = signer.sign(privateKey, 'base64url');
  const jwt = `${sigInput}.${sig}`;

  const res = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DocuSign token request failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

// ─── PDF content helper (for dev — replace with real PDF in prod) ─────────────

function buildContractHtml(contract: {
  workerName:   string;
  companyName:  string;
  roleTitle:    string;
  payRate:      number;
  payCurrency:  string;
  payFrequency: string;
  startDate:    Date;
  scopeOfWork:  string;
}): string {
  return `
<!DOCTYPE html><html><head><style>
body{font-family:Georgia,serif;max-width:720px;margin:48px auto;color:#1a1a1a;line-height:1.7}
h1{font-size:22px;border-bottom:2px solid #000;padding-bottom:12px}
h2{font-size:16px;margin-top:32px}
.row{display:flex;gap:40px;margin:8px 0}
.lbl{font-weight:bold;min-width:180px}
.sig-line{border-top:1px solid #000;margin-top:60px;padding-top:8px;font-size:13px;color:#666}
</style></head><body>
<h1>Independent Contractor Agreement</h1>
<p>This Contractor Agreement ("Agreement") is entered into as of ${new Date(contract.startDate).toLocaleDateString('en-US', { dateStyle: 'long' })} between:</p>
<h2>Parties</h2>
<div class="row"><span class="lbl">Company:</span><span>${contract.companyName}</span></div>
<div class="row"><span class="lbl">Contractor:</span><span>${contract.workerName}</span></div>
<div class="row"><span class="lbl">Role / Title:</span><span>${contract.roleTitle}</span></div>
<h2>Compensation</h2>
<div class="row"><span class="lbl">Pay Rate:</span><span>${contract.payCurrency} ${contract.payRate.toLocaleString()} per ${contract.payFrequency}</span></div>
<div class="row"><span class="lbl">Payment Method:</span><span>Wise (international bank transfer)</span></div>
<h2>Scope of Work</h2>
<p>${contract.scopeOfWork}</p>
<h2>Terms</h2>
<p>The Contractor is an independent contractor and not an employee. The Contractor is responsible for all applicable taxes.
All intellectual property created during this engagement is assigned to the Company.
This Agreement is governed by the laws of the State of Delaware, United States.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px">
  <div>
    <div style="height:60px;border-bottom:1px solid #000;margin-bottom:8px">/sig1/</div>
    <div class="sig-line">Contractor signature<br>${contract.workerName}</div>
  </div>
  <div>
    <div style="height:60px;border-bottom:1px solid #000;margin-bottom:8px">/sig2/</div>
    <div class="sig-line">Company signature<br>${contract.companyName}</div>
  </div>
</div>
</body></html>`.trim();
}

// ─── Create envelope + return signing URL ─────────────────────────────────────

export interface CreateEnvelopeInput {
  contractId:   string;
  workerName:   string;
  workerEmail:  string;
  companyName:  string;
  companyEmail: string;
  roleTitle:    string;
  payRate:      number;
  payCurrency:  string;
  payFrequency: string;
  startDate:    Date;
  scopeOfWork:  string;
  returnUrl:    string;   // redirect after signing
}

export interface EnvelopeResult {
  envelopeId:  string;
  signingUrl:  string;   // embedded signing URL for contractor
}

export async function createEnvelopeAndGetSigningUrl(
  input: CreateEnvelopeInput,
): Promise<EnvelopeResult> {
  const token   = await getAccessToken();
  const baseUrl = `${env.DOCUSIGN_BASE_URL}/restapi/v2.1/accounts/${env.DOCUSIGN_ACCOUNT_ID}`;

  // 1. Build HTML → base64 document
  const htmlContent = buildContractHtml({
    workerName:  input.workerName,
    companyName: input.companyName,
    roleTitle:   input.roleTitle,
    payRate:     input.payRate,
    payCurrency: input.payCurrency,
    payFrequency:input.payFrequency,
    startDate:   input.startDate,
    scopeOfWork: input.scopeOfWork,
  });

  const docBase64 = Buffer.from(htmlContent).toString('base64');

  // 2. Create envelope
  const envelopeBody = {
    emailSubject: `Please sign your Dechub contract — ${input.companyName}`,
    documents: [
      {
        documentId: '1',
        name:       'Contractor_Agreement.html',
        fileExtension: 'html',
        documentBase64: docBase64,
      },
    ],
    recipients: {
      signers: [
        {
          // Contractor signs first
          recipientId:  '1',
          routingOrder: '1',
          name:         input.workerName,
          email:        input.workerEmail,
          clientUserId: input.contractId,   // enables embedded signing
          tabs: {
            signHereTabs: [{ anchorString: '/sig1/', anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '-20' }],
            dateSignedTabs: [{ anchorString: '/sig1/', anchorUnits: 'pixels', anchorXOffset: '100', anchorYOffset: '-20' }],
          },
        },
        {
          // Company signs second
          recipientId:  '2',
          routingOrder: '2',
          name:         input.companyName,
          email:        input.companyEmail,
          tabs: {
            signHereTabs: [{ anchorString: '/sig2/', anchorUnits: 'pixels', anchorXOffset: '0', anchorYOffset: '-20' }],
          },
        },
      ],
    },
    status: 'sent',
    eventNotification: {
      url:                         `${env.CLIENT_URL}/api/docusign/webhook`,
      loggingEnabled:              true,
      requireAcknowledgment:       true,
      envelopeEvents:              [{ envelopeEventStatusCode: 'completed' }],
      recipientEvents:             [
        { recipientEventStatusCode: 'Completed' },
        { recipientEventStatusCode: 'Declined'  },
      ],
    },
  };

  const createRes = await postJson<{ envelopeId: string }>(
    `${baseUrl}/envelopes`,
    envelopeBody,
    { Authorization: `Bearer ${token}` },
  );

  const envelopeId = createRes.envelopeId;

  // 3. Get embedded signing URL for the contractor (recipient 1)
  const viewRes = await postJson<{ url: string }>(
    `${baseUrl}/envelopes/${envelopeId}/views/recipient`,
    {
      clientUserId: input.contractId,
      recipientId:  '1',
      returnUrl:    input.returnUrl,
      authenticationMethod: 'none',
      userName:     input.workerName,
      email:        input.workerEmail,
    },
    { Authorization: `Bearer ${token}` },
  );

  const signingUrl = viewRes.url;

  logger.info(`DocuSign envelope created: ${envelopeId}`);
  return { envelopeId, signingUrl };
}

// ─── Webhook event parser ─────────────────────────────────────────────────────

export interface DocuSignWebhookEvent {
  type:        'envelope_completed' | 'recipient_completed' | 'recipient_declined' | 'unknown';
  envelopeId:  string;
  recipientId?: string;
  email?:       string;
}

export function parseWebhookEvent(body: Record<string, unknown>): DocuSignWebhookEvent {
  const status     = body.status      as string | undefined;
  const envelopeId = (body.envelopeId ?? body.EnvelopeID) as string | undefined;

  if (!envelopeId) return { type: 'unknown', envelopeId: '' };

  if (status === 'completed') {
    return { type: 'envelope_completed', envelopeId };
  }

  const recipientStatus = body.recipientStatus as Record<string, unknown> | undefined;
  if (recipientStatus) {
    const recStatus = recipientStatus.status as string | undefined;
    const recipientId = recipientStatus.recipientId as string | undefined;
    const email       = recipientStatus.email       as string | undefined;

    if (recStatus === 'Completed') {
      return { type: 'recipient_completed', envelopeId, recipientId, email };
    }
    if (recStatus === 'Declined') {
      return { type: 'recipient_declined', envelopeId, recipientId, email };
    }
  }

  return { type: 'unknown', envelopeId };
}

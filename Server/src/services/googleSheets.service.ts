import { env } from '../config/env';
import { logger } from '../utils/logger';

type TalentRequestSheetPayload = {
  submittedAt: string;
  companyName: string;
  companyWebsite: string;
  contactName: string;
  workEmail: string;
  phoneNumber: string;
  projectType: string;
  projectDescription: string;
  requestedServices: string[];
  dbSaveStatus: 'saved' | 'failed';
  requestId: string | null;
};

function isGoogleSheetsEnabled(): boolean {
  return env.GOOGLE_SHEETS_ENABLED.trim().toLowerCase() === 'true';
}

export async function appendBookDemoSubmissionToGoogleSheets(
  payload: TalentRequestSheetPayload,
): Promise<void> {
  if (!isGoogleSheetsEnabled()) {
    return;
  }

  const webhookUrl = env.GOOGLE_SHEETS_WEBHOOK_URL.trim();
  if (!webhookUrl) {
    logger.warn('Google Sheets sync is enabled but GOOGLE_SHEETS_WEBHOOK_URL is empty');
    return;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Google Sheets webhook returned ${response.status}${errorText ? `: ${errorText}` : ''}`);
  }
}

export function queueBookDemoSubmissionToGoogleSheets(payload: TalentRequestSheetPayload): void {
  void appendBookDemoSubmissionToGoogleSheets(payload).catch((error) => {
    logger.error('Failed to append book a demo submission to Google Sheets', error);
  });
}

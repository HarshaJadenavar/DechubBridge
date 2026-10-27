import { writeFileSync } from 'node:fs';

const outputPath = new URL('./Dechub-Bridge_Resend_Integration_Guide.pdf', import.meta.url);
const pages = [];
const pageWidth = 612;
const pageHeight = 792;
const margin = 52;
const bodyWidth = 86;

function escapePdf(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text, width = bodyWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function createPage(title, sections) {
  const commands = [];
  let y = 738;
  const text = (value, x, fontSize, font = 'F1') => {
    commands.push(`BT /${font} ${fontSize} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(value)}) Tj ET`);
  };
  const line = () => {
    commands.push(`0.84 0.82 0.92 RG 52 ${y} m 560 ${y} l S`);
  };

  commands.push('0.16 0.09 0.42 rg 0 0 612 792 re f');
  commands.push('1 1 1 rg');
  text('DECHUB-BRIDGE', margin, 10, 'F2');
  y -= 30;
  text(title, margin, 22, 'F2');
  y -= 22;
  commands.push('0.75 0.67 1 rg');
  text('Resend email integration guide', margin, 10, 'F1');
  y -= 22;
  commands.push('1 1 1 rg');
  line();
  y -= 22;

  for (const section of sections) {
    commands.push('1 1 1 rg');
    text(section.heading, margin, 12, 'F2');
    y -= 18;
    for (const item of section.items) {
      const lines = wrap(item, 79);
      commands.push('0.96 0.95 1 rg');
      text('•', margin + 2, 10, 'F2');
      for (const [index, content] of lines.entries()) {
        text(content, margin + 16, 10, 'F1');
        y -= index === lines.length - 1 ? 15 : 13;
      }
      y -= 3;
    }
    y -= 7;
  }

  commands.push('0.75 0.67 1 rg');
  text('Dechub-Bridge | Production email delivery', margin, 8, 'F1');
  text(`Page ${pages.length + 1}`, 515, 8, 'F1');
  pages.push(commands.join('\n'));
}

createPage('From Zero to First Email', [
  {
    heading: '1. What this integration does',
    items: [
      'Resend sends application emails through an HTTPS API. This avoids SMTP port restrictions on Render Free.',
      'The existing application flows remain unchanged: Book a demo notifications, password resets, worker invitations, and admin emails.',
      'The backend automatically uses Resend when RESEND_API_KEY is present. SMTP remains the fallback when it is not set.',
    ],
  },
  {
    heading: '2. Create your Resend account',
    items: [
      'Go to resend.com and create or sign in to your account.',
      'Use an account owned by the Dechub-Bridge team so future administrators can access the email history and domain settings.',
    ],
  },
  {
    heading: '3. Add the sender domain',
    items: [
      'In Resend, open Domains and click Add domain.',
      'Enter bridge.dechub.ai. Enter the domain only. Do not enter https:// and do not add a trailing slash.',
      'Choose Manual setup unless the DNS for dechub.ai is managed in the connected Cloudflare account and you want Resend to create the records automatically.',
    ],
  },
]);

createPage('DNS Verification', [
  {
    heading: '4. Add the Resend DNS records',
    items: [
      'Keep the Resend DNS Records screen open. It will show TXT, MX, and CNAME records with unique values.',
      'Open the DNS provider that manages dechub.ai. This may be Cloudflare, GoDaddy, Namecheap, Hostinger, or another registrar. It is not Render or Vercel.',
      'For every Resend row, create a new DNS record using the exact Type, Name or Host, and Value or Content shown by Resend. Keep the default TTL or choose Auto.',
      'If Cloudflare is your DNS provider, set Resend CNAME records to DNS only (grey cloud), not Proxied (orange cloud).',
      'Do not delete or replace the existing bridge.dechub.ai A or CNAME record used by the live application. Add only the new records Resend requests.',
    ],
  },
  {
    heading: '5. Verify the domain',
    items: [
      'Return to Resend and click Verify DNS records if that button is displayed.',
      'Wait until bridge.dechub.ai changes from Not Started or Pending to Verified. DNS changes may take a few minutes and occasionally longer.',
      'Do not proceed with production sender testing until the domain is Verified.',
    ],
  },
]);

createPage('Backend Configuration', [
  {
    heading: '6. Create a Resend API key',
    items: [
      'In Resend, open API Keys and click Create API Key.',
      'Use a clear name such as Bridge Render Production and choose Sending access.',
      'Copy the key that begins with re_. Resend displays the full value only once. Treat it like a password.',
    ],
  },
  {
    heading: '7. Configure Render',
    items: [
      'Open the Render service that deploys the Dechub backend. Do not add this secret to Vercel or the frontend.',
      'Open Environment and add these three separate values:',
      'RESEND_API_KEY = re_your_actual_key_from_resend',
      'EMAIL_FROM = Dechub-Bridge <noreply@bridge.dechub.ai>',
      'CLIENT_URL = https://bridge.dechub.ai',
      'Save the values and redeploy the backend service. SMTP values may remain empty when Resend is used.',
    ],
  },
  {
    heading: '8. Security rules',
    items: [
      'Never commit the API key to GitHub, place it in client-side code, or share it in screenshots.',
      'If the key is exposed, revoke it in Resend and create a replacement immediately.',
    ],
  },
]);

createPage('Testing and Troubleshooting', [
  {
    heading: '9. Test delivery',
    items: [
      'Submit a Book a demo form or use Forgot password in the live application.',
      'Open Resend, select Emails, and confirm the email appears with a sent or delivered status.',
      'Check the recipient inbox and spam folder. The sender should be noreply@bridge.dechub.ai.',
    ],
  },
  {
    heading: '10. Common issues',
    items: [
      'Domain is Not Started or Pending: DNS records are missing, incorrect, or still propagating. Compare every record with Resend.',
      'Resend rejects the sender: EMAIL_FROM must use a verified domain, for example noreply@bridge.dechub.ai.',
      'No email in Resend: confirm RESEND_API_KEY is present in the Render backend service and redeploy after saving it.',
      'Email is in Resend but not inbox: check spam and confirm the DNS records remain verified.',
      'Render SMTP timeout: this is expected on Render Free when using SMTP. Configure RESEND_API_KEY so the application uses HTTPS instead.',
    ],
  },
  {
    heading: '11. Operational checklist',
    items: [
      'Domain Verified in Resend.',
      'API key stored only in Render backend Environment.',
      'EMAIL_FROM uses bridge.dechub.ai.',
      'Book a demo and password-reset tests received successfully.',
    ],
  },
]);

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(' ')}] >>`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
];

for (const page of pages) {
  const stream = page;
  const pageObject = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${objects.length + 2} 0 R >>`;
  objects.push(pageObject, `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
}

let pdf = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
});
const xrefOffset = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.slice(1).forEach((offset) => {
  pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

writeFileSync(outputPath, pdf, 'utf8');

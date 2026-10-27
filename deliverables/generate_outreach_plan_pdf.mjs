import { writeFileSync } from 'node:fs';

const outputPath = new URL('./Dechub-Bridge_UAE_Outreach_Plan.pdf', import.meta.url);
const width = 842;
const height = 595;
const commands = [];

function escapePdf(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function rect(x, y, w, h, fill) {
  commands.push(`${fill} rg ${x} ${y} ${w} ${h} re f`);
}

function strokeRect(x, y, w, h, stroke, lineWidth = 1) {
  commands.push(`${stroke} RG ${lineWidth} w ${x} ${y} ${w} ${h} re S`);
}

function line(x1, y1, x2, y2, stroke, lineWidth = 1) {
  commands.push(`${stroke} RG ${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S`);
}

function text(value, x, y, size, font = 'F1', color = '0.10 0.12 0.20') {
  commands.push(`${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(value)}) Tj ET`);
}

function wrap(value, maxChars) {
  const words = value.split(/\s+/);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function wrappedText(value, x, y, size, maxChars, font = 'F1', color = '0.31 0.37 0.49', leading = 15) {
  wrap(value, maxChars).forEach((entry, index) => text(entry, x, y - index * leading, size, font, color));
}

// Background and header.
rect(0, 0, width, height, '0.975 0.98 0.995');
rect(0, 507, width, 88, '0.13 0.08 0.31');
rect(28, 522, 5, 47, '0.66 0.55 0.96');
text('DECHUB-BRIDGE', 46, 560, 10, 'F2', '0.82 0.76 1');
text('UAE Outreach Plan', 46, 532, 25, 'F2', '1 1 1');
text('Initial market focus and daily business-development targets', 390, 537, 11, 'F1', '0.91 0.88 1');

// Market focus panel.
rect(28, 304, 786, 178, '1 1 1');
strokeRect(28, 304, 786, 178, '0.86 0.88 0.94');
rect(28, 445, 786, 37, '0.94 0.92 0.99');
text('MARKET FOCUS', 48, 459, 11, 'F2', '0.30 0.18 0.65');

const focusRows = [
  ['Target region', 'Primary market: UAE. Talent-delivery base: India. Secondary expansion: United States and Singapore.'],
  ['Ideal customer profile', 'Remote-first startups, SaaS companies, digital agencies, and global founders with 10-200 employees who need to hire or manage Indian and global talent.'],
  ['Priority sectors', 'SaaS and software, IT services, digital agencies, health-tech and healthcare, and startup companies.'],
];

let focusY = 420;
focusRows.forEach(([label, value], index) => {
  text(label, 48, focusY, 10.5, 'F2', '0.11 0.14 0.23');
  wrappedText(value, 206, focusY, 10.5, 89);
  if (index < focusRows.length - 1) line(48, focusY - 35, 794, focusY - 35, '0.90 0.91 0.95');
  focusY -= index === 1 ? 55 : 45;
});

// Daily targets table.
rect(28, 147, 786, 130, '1 1 1');
strokeRect(28, 147, 786, 130, '0.86 0.88 0.94');
rect(28, 240, 786, 37, '0.88 0.94 1');
text('DAILY ACTIVITY TARGETS - INITIAL PHASE', 48, 254, 11, 'F2', '0.08 0.34 0.65');
rect(48, 211, 746, 24, '0.96 0.98 1');
text('Metric', 60, 219, 10, 'F2', '0.18 0.23 0.34');
text('Target', 260, 219, 10, 'F2', '0.18 0.23 0.34');
text('Practical definition', 470, 219, 10, 'F2', '0.18 0.23 0.34');
line(48, 207, 794, 207, '0.86 0.88 0.94');
line(242, 158, 242, 235, '0.86 0.88 0.94');
line(450, 158, 450, 235, '0.86 0.88 0.94');

const targetRows = [
  ['Target companies', '15-20/day', 'Identify and qualify businesses matching the ICP.'],
  ['Decision-makers reached', '30-40/day', 'Reach two relevant contacts per company: founder, COO, HR, People Ops, or talent lead.'],
  ['Positive replies', '1-3/day', 'Replies or conversations showing genuine interest.'],
  ['Booked demos', '2-4/week', 'Qualified discovery calls booked with suitable prospects.'],
];

let targetY = 191;
targetRows.forEach((row, index) => {
  text(row[0], 60, targetY, 9.4, 'F2');
  text(row[1], 260, targetY, 9.4, 'F2', '0.30 0.18 0.65');
  wrappedText(row[2], 470, targetY, 9.2, 52, 'F1', '0.31 0.37 0.49', 11);
  if (index < targetRows.length - 1) line(48, targetY - 13, 794, targetY - 13, '0.91 0.92 0.96');
  targetY -= 18;
});

// Scale-up section.
rect(28, 39, 786, 82, '0.15 0.45 0.36');
text('SCALE-UP TARGET', 48, 96, 11, 'F2', '0.83 1 0.91');
text('Once outreach data, messages, sender reputation, and lead quality are consistently working:', 48, 75, 10.5, 'F1', '1 1 1');
text('30 companies/day', 48, 53, 11, 'F2', '1 1 1');
text('60 decision-makers/day', 220, 53, 11, 'F2', '1 1 1');
text('3-5 positive replies/day', 447, 53, 11, 'F2', '1 1 1');
text('1 demo every 1-2 working days', 644, 53, 11, 'F2', '1 1 1');

// Footer.
text('Prepared for internal planning | Dechub-Bridge', 28, 16, 8.5, 'F1', '0.40 0.45 0.56');
text('UAE-first go-to-market plan', 678, 16, 8.5, 'F1', '0.40 0.45 0.56');

const stream = commands.join('\n');
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Count 1 /Kids [5 0 R] >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>`,
  `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
];

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

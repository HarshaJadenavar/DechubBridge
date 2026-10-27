export const STANDALONE_LIGHT_THEME_CLASS = 'standalone-light-theme';

export function shouldApplyStandaloneLightTheme(sourcePath: string) {
  if (sourcePath === '/landing-export/index.txt') {
    return true;
  }

  if (
    sourcePath === '/about/index.html'
    || sourcePath === '/blog/index.html'
    || sourcePath === '/contact/index.html'
    || sourcePath === '/legal-pages/privacy-policy/index.html'
  ) {
    return true;
  }

  return /^\/blog\/[^/]+\/index\.html$/.test(sourcePath);
}

export const STANDALONE_LIGHT_THEME_CSS = `
body.${STANDALONE_LIGHT_THEME_CLASS} {
  --page-bg: #fcfaf6;
  --page-bg-alt: #f3ece2;
  --surface: #ffffff;
  --surface-soft: #f6efe5;
  --surface-muted: #efe7db;
  --border-soft: rgba(15, 23, 42, 0.08);
  --border: rgba(15, 23, 42, 0.14);
  --border-strong: rgba(15, 23, 42, 0.2);
  --ink: #111827;
  --muted: #5b6472;
  --soft: #8791a0;
  --accent: #2563eb;
  --accent-soft: rgba(37, 99, 235, 0.12);
  --dark: #111827;
  --dark-soft: #1f2937;
  --token-a53beb93-2df8-4cea-8692-a810c05e478d: var(--surface);
  --token-55fce8bf-ab86-42dc-8b77-6335cf9cf588: var(--ink);
  --token-be5fd20d-23fc-463d-9ce0-7784436f5294: var(--muted);
  --token-f8734902-8d1d-4e80-b378-a091f0e2450d: #dce2ea;
  --token-819e50e5-99c5-4547-ba7c-e2d71a9ee22d: var(--accent);
  --token-e235ccb3-249e-4bbe-a0ec-afbbbabc7347: var(--surface-soft);
  --token-afe38531-3ffb-413e-b141-aa2cba0b989e: rgba(15, 23, 42, 0.18);
  --token-12307017-6017-4dc2-bd95-03dd133b2bde: rgba(15, 23, 42, 0.08);
  --token-ef339654-0b57-4e97-91bb-d6220ba70ab6: rgba(15, 23, 42, 0.8);
  --token-a4c33a8a-f7ec-4c7c-86b7-12a5561a333a: rgba(15, 23, 42, 0.28);
  --token-5c4c4689-2e9f-4d75-8648-a6fa99ee1dd8: rgba(15, 23, 42, 0.22);
  --token-957981e5-19a4-4a47-9eff-cfd3010c1560: rgba(15, 23, 42, 0.14);
  --token-73249cc1-e13f-4b9a-9f8c-120463984349: rgba(15, 23, 42, 0.04);
  --token-a8471d98-b099-4061-946e-68d6bcaf188a: var(--surface);
  --token-5f2865e9-378d-430e-acd2-eb9119a65629: var(--surface-soft);
  --token-e4b6e893-c43a-43a8-9eff-b692c24f7ea6: rgba(15, 23, 42, 0.05);
  --token-462bfd45-cc6a-406c-b043-2bf80d378d7c: rgba(255, 255, 255, 0.9);
  --token-fc24edca-c6a9-4002-9aa0-e67221fb322a: rgba(15, 23, 42, 0.68);
  --token-d072d1f5-ef86-4b7c-bae1-6c9f6238e10b: var(--soft);
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 32%),
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 24%),
    linear-gradient(180deg, var(--page-bg) 0%, var(--page-bg-alt) 100%);
  color: var(--ink);
}

body.${STANDALONE_LIGHT_THEME_CLASS},
body.${STANDALONE_LIGHT_THEME_CLASS} #main {
  background-color: transparent !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} .framer-text,
body.${STANDALONE_LIGHT_THEME_CLASS} a,
body.${STANDALONE_LIGHT_THEME_CLASS} button,
body.${STANDALONE_LIGHT_THEME_CLASS} input,
body.${STANDALONE_LIGHT_THEME_CLASS} textarea,
body.${STANDALONE_LIGHT_THEME_CLASS} label {
  color: var(--ink) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} input,
body.${STANDALONE_LIGHT_THEME_CLASS} textarea {
  background: rgba(255, 255, 255, 0.94) !important;
  border: 1px solid var(--border) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} input::placeholder,
body.${STANDALONE_LIGHT_THEME_CLASS} textarea::placeholder {
  color: var(--soft) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} video {
  filter: saturate(0.84) brightness(0.84) contrast(0.92);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Masking"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="BG"] {
  background: transparent !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} nav.framer-ejdAz,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Footer"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Form Container"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Container"] {
  border-color: var(--border) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} nav.framer-ejdAz {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Footer"] {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-menu-panel="true"] {
  background: rgba(255, 255, 255, 0.94) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-header {
  position: relative !important;
  inset: auto !important;
  z-index: 5 !important;
  display: grid !important;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: min(100%, 560px);
  min-height: 58px;
  margin: 0 auto;
  padding: 0 28px;
  background: rgba(255, 255, 255, 0.96) !important;
  border: 0 !important;
  border-bottom-left-radius: 28px !important;
  border-bottom-right-radius: 28px !important;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-desktop-nav="true"] {
  overflow: visible !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-desktop-nav="true"] .framer-mds9fs,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-desktop-nav="true"] .framer-looqt4 {
  display: none !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-desktop-nav="true"] .static-desktop-links {
  gap: 24px;
  transform: none !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-desktop-nav="true"] .static-desktop-links-left {
  justify-content: flex-end;
  padding-right: 20px;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-desktop-nav="true"] .static-desktop-links-right {
  justify-content: flex-start;
  padding-left: 20px;
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-link,
body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-link-label,
body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-logo {
  color: var(--ink) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-link {
  height: auto !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-link-label {
  opacity: 1 !important;
  visibility: visible !important;
  filter: none !important;
  transform: none !important;
  font-weight: 600;
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-desktop-logo {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 48px;
  height: 48px;
  margin: 0 auto;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Badge"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Light"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="new"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Disabled"] {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Dark"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="CTA"] {
  background: linear-gradient(135deg, var(--dark) 0%, var(--dark-soft) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Dark"] .framer-text,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Dark"] a,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Dark"] span,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="CTA"] .framer-text,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="CTA"] a,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="CTA"] span {
  color: #ffffff !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [style*="var(--token-a8471d98-b099-4061-946e-68d6bcaf188a"],
body.${STANDALONE_LIGHT_THEME_CLASS} [style*="var(--token-5f2865e9-378d-430e-acd2-eb9119a65629"],
body.${STANDALONE_LIGHT_THEME_CLASS} [style*="var(--token-e4b6e893-c43a-43a8-9eff-b692c24f7ea6"],
body.${STANDALONE_LIGHT_THEME_CLASS} [style*="var(--token-e235ccb3-249e-4bbe-a0ec-afbbbabc7347"],
body.${STANDALONE_LIGHT_THEME_CLASS} [style*="var(--token-462bfd45-cc6a-406c-b043-2bf80d378d7c"] {
  border-color: var(--border) !important;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Blog card"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Team card"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Contact details"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="With link"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Without link"] {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-marquee="true"] {
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.97) 0%, rgba(31, 41, 55, 0.94) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.14);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-marquee="true"] .framer-text,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Logos"] .framer-text {
  color: #ffffff !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-faq-item="true"] {
  background: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-faq-answer p,
body.${STANDALONE_LIGHT_THEME_CLASS} .static-faq-icon {
  color: var(--muted) !important;
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-testimonial-carousel="true"] .framer-text,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-static-case-carousel="true"] .framer-text {
  color: #ffffff !important;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-testimonial-controls button,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Left arrow"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Right arrow"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Left mobile"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Right mobile"] {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid var(--border) !important;
  border-radius: 999px !important;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

body.${STANDALONE_LIGHT_THEME_CLASS} .static-testimonial-controls img,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Left arrow"] svg,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Right arrow"] svg,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Left mobile"] svg,
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Right mobile"] svg {
  filter: invert(1);
}

body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="Glow"],
body.${STANDALONE_LIGHT_THEME_CLASS} [data-framer-name="glow"] {
  opacity: 0.34 !important;
}
`;

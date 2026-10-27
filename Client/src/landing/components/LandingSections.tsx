import { useState } from 'react';
import { testimonials } from '../landingContent';

interface SectionHeadingProps {
  centered?: boolean;
  copy?: string;
  eyebrow: string;
  title: string;
}

function SectionHeading({ centered = false, copy, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className={`landing-section-heading${centered ? ' landing-section-heading-centered' : ''}`}>
      <span className="landing-section-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

interface StatsSectionProps {
  id: string;
  image: string;
  items: readonly {
    value: string;
    copy: string;
  }[];
  chipTags: readonly string[];
}

export function StatsSection({ id, image, items, chipTags }: StatsSectionProps) {
  return (
    <section id={id} className="landing-metrics">
      <div className="landing-shell">
        <div className="landing-metric-shell">
          <div className="landing-metric-header landing-reveal" data-reveal>
            <h2>One Modern Experience For Today&apos;s Workforce</h2>
          </div>

          <div className="landing-metric-grid">
            {items.map((item) => (
              <article key={item.value} className="landing-metric-card landing-reveal" data-reveal>
                <strong>{item.value}</strong>
                <span>{item.copy}</span>
              </article>
            ))}
          </div>

          <div className="landing-team-photo landing-reveal" data-reveal>
            <img src={image} alt="Team collaborating in a modern workspace" className="landing-team-photo__image" />
          </div>

          <div className="landing-metric-lower">
            <article className="landing-note-card landing-reveal" data-reveal>
              <p>
                <strong>Built on in-house infrastructure,</strong> with single payroll engines,
                owned entities, and more.
              </p>
              <button type="button">Learn more</button>
            </article>

            <article className="landing-chip-cloud landing-reveal" data-reveal>
              {chipTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

interface HowItWorksSectionProps {
  id: string;
  items: readonly {
    step: string;
    title: string;
    copy: string;
    details: readonly string[];
  }[];
}

export function HowItWorksSection({ id, items }: HowItWorksSectionProps) {
  return (
    <section id={id} className="landing-how">
      <div className="landing-shell">
        <SectionHeading
          centered
          eyebrow="How it works"
          title="From hiring request to payout, Dechub keeps every step connected"
          copy="Instead of juggling sourcing, contracts, verification, invoices, and payments across separate tools, your team runs the full contractor workflow in one place."
        />

        <div className="landing-how-grid">
          {items.map((item) => (
            <article key={item.step} className="landing-how-card landing-reveal" data-reveal>
              <div className="landing-how-step">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <div className="landing-how-details">
                {item.details.map((detail) => (
                  <span key={detail}>{detail}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeaturesSectionProps {
  id: string;
  items: readonly {
    title: string;
    copy: string;
    bullets: readonly string[];
    icon: string;
  }[];
}

const FEATURE_ICON_CLASSES = [
  'landing-feature-icon-doc',
  'landing-feature-icon-sign',
  'landing-feature-icon-kyc',
  'landing-feature-icon-pay',
  'landing-feature-icon-inv',
  'landing-feature-icon-law',
] as const;

export function FeaturesSection({ id, items }: FeaturesSectionProps) {
  return (
    <section id={id} className="landing-features">
      <div className="landing-shell">
        <SectionHeading
          eyebrow="Platform features"
          title="Global hiring, contracts, compliance, and payouts in one place"
          copy="One platform replaces the stack of tools teams normally stitch together across legal, finance, and hiring."
        />

        <div className="landing-feature-grid">
          {items.map((item, index) => (
            <article key={item.title} className="landing-feature-card landing-reveal" data-reveal>
              <div className={`landing-feature-icon ${FEATURE_ICON_CLASSES[index] ?? FEATURE_ICON_CLASSES[0]}`}>
                <img src={item.icon} alt="" aria-hidden="true" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

interface AudienceSectionProps {
  id: string;
  items: readonly {
    eyebrow: string;
    title: string;
    copy: string;
    bullets: readonly string[];
    cta: string;
  }[];
  onBusinessCta: () => void;
  onContractorCta: () => void;
}

export function AudienceSection({ id, items, onBusinessCta, onContractorCta }: AudienceSectionProps) {
  return (
    <section id={id} className="landing-audiences">
      <div className="landing-shell">
        <SectionHeading
          centered
          eyebrow="Built for both sides"
          title="Two roles. One seamless system."
        />

        <div className="landing-audience-grid">
          {items.map((item) => {
            const isBusiness = item.eyebrow === 'For businesses';

            return (
              <article
                key={item.eyebrow}
                className={`landing-audience-card ${isBusiness ? 'landing-audience-card-business' : 'landing-audience-card-contractor'} landing-reveal`}
                data-reveal
              >
                <span className="landing-audience-pill">{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <button type="button" onClick={isBusiness ? onBusinessCta : onContractorCta}>
                  {item.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface PartnerSectionProps {
  bullets: readonly string[];
  profiles: readonly {
    name: string;
    role: string;
    copy: string;
    avatarClass: string;
  }[];
  onBookDemo: () => void;
}

export function PartnerSection({ bullets, profiles, onBookDemo }: PartnerSectionProps) {
  return (
    <section className="landing-partner">
      <div className="landing-shell">
        <div className="landing-partner-banner landing-reveal" data-reveal>
          <div className="landing-partner-copy">
            <h2>Your hiring, legal, and finance teams finally stay in sync.</h2>
            <ul>
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <button type="button" onClick={onBookDemo}>
              Book a demo
            </button>
            <div className="landing-guarantee">No setup fees. No operational handoffs.</div>
          </div>

          <div className="landing-profile-strip">
            {profiles.map((profile) => (
              <article key={profile.name} className="landing-profile-card">
                <div className={`landing-profile-avatar ${profile.avatarClass}`} />
                <strong>{profile.name}</strong>
                <span>{profile.role}</span>
                <p>{profile.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface CoverageSectionProps {
  id: string;
  items: readonly {
    title: string;
    status: string;
    summary: string;
    bullets: readonly string[];
    flag: string;
    alt: string;
  }[];
}

export function CoverageSection({ id, items }: CoverageSectionProps) {
  return (
    <section id={id} className="landing-coverage">
      <div className="landing-shell">
        <SectionHeading
          centered
          eyebrow="Coverage"
          title="Global hiring, phased rollout"
          copy="Live where teams need contractor hiring today, with payroll expansion already planned next."
        />

        <div className="landing-track-grid">
          {items.map((item, index) => {
            const isLive = index === 0;

            return (
              <article
                key={item.title}
                className={`landing-track-card ${isLive ? 'landing-track-card-live' : 'landing-track-card-soon'} landing-reveal`}
                data-reveal
              >
                <div className="landing-track-flag">
                  <img src={item.flag} alt={item.alt} />
                </div>
                <h3>{item.title}</h3>
                <div className="landing-track-status">{item.status}</div>
                <p>{item.summary}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface PricingSectionProps {
  id: string;
  features: readonly string[];
  onGetStarted: () => void;
}

export function PricingSection({ id, features, onGetStarted }: PricingSectionProps) {
  return (
    <section id={id} className="landing-pricing">
      <div className="landing-shell">
        <SectionHeading
          centered
          eyebrow="Simple pricing"
          title="One price. No surprises."
          copy="Pay only for active workers. Add contractors when you need them and scale back when you do not."
        />

        <article className="landing-pricing-card landing-reveal" data-reveal>
          <div className="landing-price">
            <span>$</span>
            <strong>49</strong>
            <span>/worker/month</span>
          </div>
          <p>Billed monthly per active worker. Add or remove workers anytime.</p>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <button type="button" onClick={onGetStarted}>
            Start free - first contractor on us
          </button>
          <small>Optional add-ons: Compliance advisory +$5/mo and HRMS +$5/mo coming soon.</small>
        </article>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="landing-reviews">
      <div className="landing-shell">
        <SectionHeading centered eyebrow="Testimonials" title="Our customer reviews" />
        <div className="landing-review-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="landing-review-card landing-reveal" data-reveal>
              <div className="landing-stars">★★★★★</div>
              <p>&ldquo;{item.quote}&rdquo;</p>
              <div className="landing-review-author">
                <span>{item.initials}</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FaqSectionProps {
  items: readonly {
    question: string;
    answer: string;
  }[];
}

export function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="landing-faq-section">
      <div className="landing-shell">
        <SectionHeading
          centered
          eyebrow="FAQs"
          title="Everything teams ask before they start hiring with Dechub"
        />

        <div className="landing-faq">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article key={item.question} className={`landing-faq__item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="landing-faq__trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                >
                  <span>{item.question}</span>
                  <span className="landing-faq__icon" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="landing-faq__panel">
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

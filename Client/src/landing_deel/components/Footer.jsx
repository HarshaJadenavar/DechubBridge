import React, { useState } from "react";
import { api, normalizeError, unwrapApiData } from "../../api/client";

function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const subscribe = async (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim() || newsletterSubmitting) return;

    setNewsletterSubmitting(true);
    setNewsletterMessage("");
    try {
      const response = await api.post("/public/newsletter/subscribe", { email: newsletterEmail.trim() });
      const result = unwrapApiData(response.data);
      setNewsletterMessage(result.message);
      setNewsletterEmail("");
    } catch (error) {
      setNewsletterMessage(normalizeError(error).message);
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  return (
    <footer className="mui-1aarjlu">
      <div className="MuiBox-root mui-qyulqu">
        <div className="MuiBox-root mui-8qgzw2">
          <div className="MuiBox-root mui-1lajklc">
            <div className="mui-i1l04d">
              <p className="mui-1711c28">
                About us
              </p>
            </div>
            <div className="mui-i1l04d">
              <p className="mui-1711c28">
                Leadership team
              </p>
            </div>
            <div className="mui-i1l04d">
              <p className="mui-1711c28">
                Careers
              </p>
            </div>
            <div className="mui-i1l04d">
              <p className="mui-1711c28">
                Pricing
              </p>
            </div>
          </div>
        </div>
        <div className="MuiBox-root mui-1l1lj2r">
          <div className="MuiBox-root mui-fbunk5">
            <div className="MuiBox-root mui-19ei76p">
              <h3 className="MuiTypography-root MuiTypography-h3 mui-grid8g">
                Solutions
              </h3>
              <div className="MuiBox-root mui-1f1std7">
                <a href="/solutions/payroll/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Payroll
                  </p>
                </a>
                <a href="/solutions/hr/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge HR
                  </p>
                </a>
                <a href="/solutions/it/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge IT
                  </p>
                </a>
                <a href="/solutions/benefits/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Benefits
                  </p>
                </a>
                <a href="/solutions/hire/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Hire
                  </p>
                </a>
                <a href="/solutions/mobility/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Mobility
                  </p>
                </a>
                <a href="/solutions/embedded/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Embedded
                  </p>
                </a>
                <a href="/solutions/services/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Services
                  </p>
                </a>
                <a href="/solutions/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    All Solutions
                  </p>
                </a>
              </div>
            </div>
          </div>
          <div className="MuiBox-root mui-m6lfuo" inert="">
            <div className="MuiBox-root mui-19ei76p">
              <h3 className="MuiTypography-root MuiTypography-h3 mui-grid8g">
                Dechub-Bridge Platform
              </h3>
              <div className="MuiBox-root mui-13qr5ly">
                <a href="/hr-platform/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    HR Platform
                  </p>
                </a>
                <a href="/hr-platform/ai/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge AI
                  </p>
                </a>
                <a href="/hr-platform/white-label/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    White Label
                  </p>
                </a>
                <a href="/solutions/open-api/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge API
                  </p>
                </a>
                <a href="/integrations/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Integrations
                  </p>
                </a>
                <a href="/hr-platform/workflows/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Workflows
                  </p>
                </a>
                <a href="https://www.akai.run/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Akai
                  </p>
                </a>
                <a href="https://status.deel.com/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Platform Status
                  </p>
                  <div className="MuiBox-root mui-azjfhw" />
                </a>
              </div>
            </div>
          </div>
          <div className="MuiBox-root mui-m6lfuo" inert="">
            <div className="MuiBox-root mui-19ei76p">
              <h3 className="MuiTypography-root MuiTypography-h3 mui-grid8g">
                Why Dechub-Bridge?
              </h3>
              <div className="MuiBox-root mui-13qr5ly">
                <a href="/solutions/payroll-engine/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Built on in-house infrastructure
                  </p>
                </a>
                <a href="/case-studies/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Customer stories
                  </p>
                </a>
                <a href="/dechub-bridge-vs-competitors/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Compare Dechub-Bridge
                  </p>
                </a>
                <a href="/security/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Security
                  </p>
                </a>
                <a href="https://trust.deel.com/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Trust Center
                  </p>
                </a>
                <a href="/partner/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Become a partner
                  </p>
                </a>
                <a href="/partner/affiliates/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Become an affiliate
                  </p>
                </a>
                <a href="https://www.g2.com/products/deel/reviews" className="mui-8141xw">
                  <p className="mui-1711c28">
                    G2 customer reviews
                  </p>
                </a>
              </div>
            </div>
          </div>
          <div className="MuiBox-root mui-m6lfuo" inert="">
            <div className="MuiBox-root mui-19ei76p">
              <h3 className="MuiTypography-root MuiTypography-h3 mui-grid8g">
                Resources
              </h3>
              <div className="MuiBox-root mui-13qr5ly">
                <a href="/blog/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Blog
                  </p>
                </a>
                <a href="/blog/?type=template&type=guide" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Templates And Guides
                  </p>
                </a>
                <a href="/hiring/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Global Hiring Guides
                  </p>
                </a>
                <a href="/events/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Webinars & Events
                  </p>
                </a>
                <a href="/glossary/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Global Work Glossary
                  </p>
                </a>
                <a href="/deel-impact/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Dechub-Bridge Impact
                  </p>
                </a>
                <a href="/job-description-templates/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Job Description Templates
                  </p>
                </a>
                <a href="/global-hiring-toolkit" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Free HR tools
                  </p>
                </a>
                <a href="https://developer.deel.com/home" className="mui-8141xw">
                  <p className="mui-1711c28">
                    API Documentation
                  </p>
                </a>
                <a href="https://help.letsdeel.com/hc/en-gb" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Help Center
                  </p>
                </a>
                <a href="/press/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Press
                  </p>
                </a>
              </div>
            </div>
          </div>
          <div className="MuiBox-root mui-fbunk5" inert="">
            <div className="MuiBox-root mui-19ei76p">
              <h3 className="MuiTypography-root MuiTypography-h3 mui-grid8g">
                Customers
              </h3>
              <div className="MuiBox-root mui-1f1std7">
                <a href="/case-studies/revolut/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Revolut
                  </p>
                </a>
                <a href="/case-studies/bcg/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    BCG
                  </p>
                </a>
                <a href="/case-studies/fico/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    FICO
                  </p>
                </a>
                <a href="/case-studies/puma-south-africa/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Puma
                  </p>
                </a>
                <a href="/case-studies/outreach/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Outreach
                  </p>
                </a>
                <a href="/case-studies/zipco/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Zip Co
                  </p>
                </a>
                <a href="/case-studies/directional-pizza/" className="mui-8141xw">
                  <p className="mui-1711c28">
                    Directional Pizza
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="MuiBox-root mui-y71o3e">
          <div className="MuiBox-root mui-n90dtd">
            <a href="/" className="mui-xeu4w0">
              <div className="MuiBox-root mui-1xksqvf">
                <img alt="Dechub-Bridge Logo" loading="lazy" width="122" height="42" decoding="async" className="mui-ducv57 deel-footer-logo" sizes="100vw" srcSet="/deel-assets/images/website-media.deel.com/logo.png 640w" src="/deel-assets/images/website-media.deel.com/logo.png" />
              </div>
            </a>
            <div className="MuiBox-root mui-wsfch7" inert="">
              <a href="https://twitter.com/deel" target="_blank" rel="noopener" className="mui-j04pfz">
                <img alt="twitterFilled-icon" loading="lazy" width="32" height="32" decoding="async" style={{ color: "transparent" }} sizes="32px" srcSet="/deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 16w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 32w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 48w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 64w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 96w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 128w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 256w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 384w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 640w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 640w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 750w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 768w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 828w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 1024w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 1080w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 1200w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 1280w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 1920w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 1920w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 2048w, /deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg 3840w" src="/deel-assets/images/website-media.deel.com/twitter-filled.8731c38f-835507a4.svg" />
              </a>
              <a href="https://linkedin.com/company/deel" target="_blank" rel="noopener" className="mui-j04pfz">
                <img alt="linkedinFilled-icon" loading="lazy" width="32" height="32" decoding="async" style={{ color: "transparent" }} sizes="32px" srcSet="/deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 16w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 32w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 48w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 64w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 96w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 128w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 256w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 384w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 640w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 640w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 750w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 768w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 828w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 1024w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 1080w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 1200w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 1280w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 1920w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 1920w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 2048w, /deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg 3840w" src="/deel-assets/images/website-media.deel.com/footer-icon-linkedin.8b69a409-09f4c78a.svg" />
              </a>
              <a href="https://facebook.com/getdeel" target="_blank" rel="noopener" className="mui-j04pfz">
                <img alt="facebookFilled-icon" loading="lazy" width="32" height="32" decoding="async" style={{ color: "transparent" }} sizes="32px" srcSet="/deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 16w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 32w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 48w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 64w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 96w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 128w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 256w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 384w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 640w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 640w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 750w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 768w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 828w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 1024w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 1080w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 1200w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 1280w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 1920w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 1920w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 2048w, /deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg 3840w" src="/deel-assets/images/website-media.deel.com/facebook-filled.9dee679d-9ca1e92c.svg" />
              </a>
              <a href="https://instagram.com/getdeel" target="_blank" rel="noopener" className="mui-j04pfz">
                <img alt="instagramFilled-icon" loading="lazy" width="32" height="32" decoding="async" style={{ color: "transparent" }} sizes="32px" srcSet="/deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 16w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 32w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 48w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 64w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 96w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 128w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 256w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 384w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 640w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 640w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 750w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 768w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 828w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 1024w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 1080w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 1200w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 1280w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 1920w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 1920w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 2048w, /deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg 3840w" src="/deel-assets/images/website-media.deel.com/instagram-filled.a70f7d56-9722e377.svg" />
              </a>
            </div>
          </div>
          <h3 className="MuiTypography-root MuiTypography-h3 mui-z60o6x">
            Get the latest insights on today's world of work delivered straight to your inbox.
          </h3>
          <div className="MuiBox-root mui-1f2o10c">
            <form className="MuiBox-root mui-e5d8iv" onSubmit={subscribe}>
              <button type="submit" className="mui-z5ov0c" aria-label="Subscribe by email" disabled={newsletterSubmitting}>
                <div className="cta-icon mui-1e5u1e9">
                  <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon">
                    <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </div>
              </button>
              <input type="email" placeholder="What's your e-mail?" id="subscribe-email" aria-label="Email subscribe" className="mui-9t3ayb" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required disabled={newsletterSubmitting} />
            </form>
            {newsletterMessage ? <p role="status" style={{ color: "#ffffff", fontSize: "12px", margin: "10px 0 0" }}>{newsletterMessage}</p> : null}
            <div className="MuiBox-root mui-3x5ym2" />
          </div>
        </div>
        <div className="MuiBox-root mui-1mslu2f">
          <p className="MuiTypography-root MuiTypography-body1 mui-3en2lf">
            © Copyright 2026. All Rights Reserved. 
          </p>
          <div className="MuiBox-root mui-1lajklc" inert="">
            <a href="/legal/disclaimer/" className="mui-foocol">
              <p className="mui-1711c28">
                Disclaimer
              </p>
            </a>
            <a href="/legal/privacy-policy/" className="mui-foocol">
              <p className="mui-1711c28">
                Privacy Policy
              </p>
            </a>
            <a href="#!" className="mui-foocol">
              <p className="mui-1711c28">
                Cookie Settings
              </p>
            </a>
            <a href="/legal/" className="mui-foocol">
              <p className="mui-1711c28">
                Legal Hub
              </p>
            </a>
            <a href="/legal/whistleblower-policy/" className="mui-foocol">
              <p className="mui-1711c28">
                Whistleblower Policy
              </p>
            </a>
            <a href="/legal/disclosures/" className="mui-foocol">
              <p className="mui-1711c28">
                Disclosures
              </p>
            </a>
            <a href="/legal/licenses/" className="mui-foocol">
              <p className="mui-1711c28">
                Licenses and Compliance
              </p>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

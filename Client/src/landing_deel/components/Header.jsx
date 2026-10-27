import React, { useEffect, useRef, useState } from "react";

const megaMenus = {
  Solutions: {
    featured: true,
    disableUtilityLinks: true,
    offerTitle: "WHAT WE OFFER",
    offerItems: [
      {
        label: "Dechub-Bridge Payroll",
        description: "Run payroll across the US and India",
        href: "/solutions/payroll",
        icon: "payroll",
      },
      {
        label: "Dechub-Bridge HR",
        description: "Plan & manage teams",
        href: "/solutions/hr",
        icon: "hr",
      },
      {
        label: "Dechub-Bridge IT",
        description: "Manage devices and access",
        href: "/solutions/it",
        icon: "it",
      },
      {
        label: "Dechub-Bridge Benefits",
        description: "Manage benefits for US and India teams",
        href: "/solutions/benefits/",
        icon: "benefits",
      },
      {
        label: "Dechub-Bridge Hire",
        description: "Hire for US and India teams",
        href: "/solutions/hire",
        icon: "hire",
      },
      {
        label: "Dechub-Bridge Mobility",
        description: "Support mobility for US and India hires",
        href: "/solutions/mobility/",
        icon: "mobility",
      },
      {
        label: "Dechub-Bridge Embedded",
        description: "Embed Dechub-Bridge in your platform",
        href: "/solutions/embedded",
        icon: "embedded",
      },
      {
        label: "Dechub-Bridge Services",
        description: "Run payroll operations smoothly",
        href: "/solutions/services/",
        icon: "services",
      },
    ],
    utilityItems: [
      {
        label: "Employer of Record",
        description: "Hire and pay teams in the US and India",
        href: "/solutions/payroll/eor",
        image: "/deel-assets/images/website-media.deel.com/thumbnail_Go_live_quickly_with_US_payroll_cba17cce08-8676d1fd.webp",
      },
      {
        label: "Hire Contractors",
        description: "Simplify contractor hiring for US and India",
        href: "/solutions/payroll/contractors",
        image: "/deel-assets/images/website-media.deel.com/small_hire_ba47790a6a-71856dce.webp",
      },
      {
        label: "Integrations",
        description: "Connect to your favorite systems",
        href: "/integrations/",
        image: "/deel-assets/images/website-media.deel.com/thumbnail_itfeaturecard04_2x_d622ebb2e6-91516668.webp",
      },
      {
        label: "Dechub-Bridge API",
        description: "APIs that fuel custom workflows",
        href: "/solutions/open-api/",
        image: "/deel-assets/images/website-media.deel.com/nav_row_visual_api_v2_c863a509fa-40178800.webp",
      },
    ],
    promo: {
      label: "Dechub-Bridge Payroll Overview",
      description: "Keep US and India payroll in sync",
      href: "/solutions/payroll",
      image: "/deel-assets/images/website-media.deel.com/Solutions_Image_1fe3692ef5_348057f282-6f263ffa.webp",
    },
    footerLinks: [
      { label: "Book a demo", href: "/book-a-demo/" },
      { label: "Compare Dechub-Bridge", href: "/dechub-bridge-vs-competitors/" },
      { label: "Help center", href: "/help-center/" },
    ],
  },
  "Use cases": {
    featured: true,
    offerTitle: "HOW WE HELP",
    compact: true,
    disableOfferLinks: true,
    offerItems: [
      {
        label: "Hire anywhere",
        description: "Hire across the US and India with confidence",
        href: "/solutions/hire",
      },
      {
        label: "Run US and India payroll",
        description: "Pay US and India teams from one platform",
        href: "/use-cases/run-global-payroll/",
      },
      {
        label: "Run payroll locally",
        description: "Process self-serve local payroll",
        href: "/solutions/payroll",
      },
      {
        label: "Manage a US and India team",
        description: "Centralize HR for US and India teams",
        href: "/solutions/hr",
      },
      {
        label: "Elevate team performance",
        description: "Run goals, reviews, and development",
        href: "/solutions/hr",
      },
      {
        label: "Manage benefits across US and India",
        description: "Offer compliant benefits for US and India teams",
        href: "/solutions/benefits/",
      },
      {
        label: "Ship devices",
        description: "Equip US and India teams with devices",
        href: "/solutions/it",
      },
      {
        label: "Run IT operations",
        description: "Standardize IT ops for US and India teams",
        href: "/solutions/it",
      },
      {
        label: "Set up & manage entity",
        description: "Set up entities without the hassle",
        href: "/entity-setup/",
      },
      {
        label: "Improve worker experience",
        description: "Support every worker in one place",
        href: "/hr-platform/",
      },
      {
        label: "Relocate talent",
        description: "Support compliant talent mobility for key teams",
        href: "/solutions/mobility/",
      },
    ],
    promo: {
      label: "Customer Stories",
      description: "",
      href: "/case-studies/",
      image: "/deel-assets/images/website-media.deel.com/General_Purple_f6b2f3f9bd-480e97e6.png",
    },
    footerLinks: [
      { label: "Book a demo", href: "/book-a-demo/" },
      { label: "Compare Dechub-Bridge", href: "/dechub-bridge-vs-competitors/" },
      { label: "Help center", href: "/help-center/" },
    ],
  },
  "Who we serve": {
    featured: true,
    compact: "columns",
    disableColumnLinks: true,
    columns: [
      {
        title: "BY BUSINESS SIZE",
        disableLinks: true,
        items: [
          {
            label: "Startups",
            description: "Fast payroll and hiring for founders",
            href: "/startup/",
          },
          {
            label: "Mid-Market",
            description: "One connected workforce platform",
            href: "/mid-market/",
          },
          {
            label: "Enterprise",
            description: "Global support, on your terms",
            href: "/enterprise/",
          },
        ],
      },
      {
        title: "BY TEAMS",
        disableLinks: true,
        items: [
          {
            label: "HR teams",
            description: "Onboard and manage US and India teams",
            href: "/solutions/hr",
          },
          {
            label: "Finance teams",
            description: "Cut costs on US and India payroll",
            href: "/solutions/payroll",
          },
          {
            label: "Legal teams",
            description: "Stay compliant across key payroll workflows",
            href: "/legal/",
          },
          {
            label: "IT teams",
            description: "Manage devices and access",
            href: "/solutions/it",
          },
          {
            label: "Founders",
            description: "Relocate to where your business need to be",
            href: "/startup/",
          },
        ],
      },
      {
        title: "BY INDUSTRY",
        disableLinks: true,
        items: [
          { label: "Crypto", href: "/industry/crypto/" },
          { label: "Fintech", href: "/industry/fintech/" },
          { label: "Advertising", href: "/industry/advertising/" },
          { label: "AI", href: "/industry/ai/" },
          { label: "BPO", href: "/industry/bpo/" },
          { label: "Gaming", href: "/industry/gaming/" },
          { label: "IT", href: "/industry/it-services/" },
          { label: "Oil & Gas", href: "/industry/oil-and-gas/" },
        ],
      },
      {
        title: "PARTNERS",
        disableLinks: true,
        items: [
          { label: "Venture Capital", href: "/partner/venture-capital/" },
          { label: "Private Equity", href: "/partner/private-equity/" },
          { label: "Benefit Brokers", href: "/partner/benefit-brokers/" },
          { label: "Accounting", href: "/partner/accountants/" },
          { label: "Technology", href: "/partner/technology/" },
          { label: "System Integrators", href: "/partner/system-integrators/" },
          { label: "Professional Services", href: "/partner/professional-services/" },
          { label: "Affiliates", href: "/partner/affiliates/" },
        ],
      },
    ],
    footerLinks: [
      { label: "Book a demo", href: "/book-a-demo/" },
      { label: "Compare Dechub-Bridge", href: "/dechub-bridge-vs-competitors/" },
      { label: "Help center", href: "/help-center/" },
    ],
  },
  Resources: {
    featured: true,
    compact: "columns",
    columns: [
      {
        title: "LEARN & CONNECT",
        disableLinks: true,
        items: [
          { label: "Blog", href: "/blog/" },
          { label: "Dechub-Bridge Resource Hub", href: "/resource-hub/" },
          { label: "Events and webinars", href: "/events/" },
          { label: "US and India hiring guides", href: "/hiring/" },
          { label: "Help center", href: "/help-center/" },
          { label: "Partner program", href: "/partner/" },
          { label: "Careers", href: "/careers/", badge: "200+" },
          { label: "Dechub-Bridge Works", href: "/deel-works/" },
          { label: "Dechub-Bridge Academy", href: "/academy/" },
          { label: "Press", href: "/press/" },
        ],
      },
      {
        title: "THE DECHUB-BRIDGE ADVANTAGE",
        disableLinks: true,
        items: [
          { label: "Compare Dechub-Bridge", href: "/dechub-bridge-vs-competitors/" },
          { label: "Unmatched security", href: "/security/" },
          { label: "Continuous Compliance", href: "/compliance/" },
          { label: "Customer stories", href: "/case-studies/" },
          { label: "Owned infrastructure", href: "/solutions/payroll-engine/" },
        ],
      },
      {
        title: "TOOLS",
        disableLinks: true,
        items: [
          { label: "Job description templates", href: "/job-description-templates/" },
          { label: "Hiring Toolkit", href: "/global-hiring-toolkit/" },
          { label: "Work glossary", href: "/glossary/" },
          { label: "Misclassification Quiz", href: "/misclassification-quiz/" },
          { label: "Employment Comparison", href: "/global-employment-comparison/" },
        ],
      },
    ],
    footerLinks: [
      { label: "Book a demo", href: "/book-a-demo/" },
      { label: "Compare Dechub-Bridge", href: "/dechub-bridge-vs-competitors/" },
      { label: "Help center", href: "/help-center/" },
    ],
  },
};

function ChevronDownIcon({ open = false }) {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-4sy6dv"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="KeyboardArrowDownIcon"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="MenuIcon"
    >
      <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium mui-vubbuv"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z" />
    </svg>
  );
}

function ArrowForwardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

function MenuFeatureIcon({ kind }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };

  switch (kind) {
    case "payroll":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M12 7.8v8.4" />
          <path d="M14.6 9.5c-.5-.9-1.5-1.4-2.8-1.4-1.7 0-2.8.8-2.8 2 0 1.3 1.1 1.8 2.8 2.1 1.7.3 2.8.8 2.8 2.1 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.5-2.9-1.5" />
        </svg>
      );
    case "hr":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
          <path d="M8.5 10.2a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z" />
          <path d="M6.7 15c.3-1.5 1.2-2.3 2.5-2.3s2.2.8 2.5 2.3" />
          <path d="M14 8h3.5" />
          <path d="M14 11h3.5" />
          <path d="M14 14h3.5" />
        </svg>
      );
    case "it":
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="11" rx="2" />
          <path d="M9 19h6" />
          <path d="M12 17v2" />
          <path d="M7.5 10.5h9" />
          <path d="M7.5 13h5.5" />
        </svg>
      );
    case "benefits":
      return (
        <svg {...common}>
          <path d="M12 19.2s-5.8-3.6-7.3-7c-1-2.2.1-4.8 2.5-5.6 1.6-.5 3.1 0 4 1.3.9-1.3 2.4-1.8 4-1.3 2.4.8 3.5 3.4 2.5 5.6-1.5 3.4-7.3 7-7.3 7Z" />
        </svg>
      );
    case "hire":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="2.2" />
          <circle cx="15.5" cy="9.8" r="1.8" />
          <path d="M5.8 16.5c.6-2.1 2-3.2 4.2-3.2s3.6 1.1 4.2 3.2" />
          <path d="M13.8 16.2c.3-1.3 1.2-2 2.5-2 1.2 0 2 .6 2.4 1.8" />
        </svg>
      );
    case "mobility":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.8" />
          <path d="M8.6 15.4 15.8 8.2" />
          <path d="M10.2 8.4h5.3v5.3" />
        </svg>
      );
    case "embedded":
      return (
        <svg {...common}>
          <path d="m9.2 8.2-4 3.8 4 3.8" />
          <path d="m14.8 8.2 4 3.8-4 3.8" />
          <path d="M12.8 7 11.2 17" />
        </svg>
      );
    case "services":
      return (
        <svg {...common}>
          <path d="m12 4 6.8 4-6.8 4-6.8-4L12 4Z" />
          <path d="m5.2 12 6.8 4 6.8-4" />
          <path d="m5.2 16 6.8 4 6.8-4" />
        </svg>
      );
    default:
      return null;
  }
}

function shouldRenderPromo(menu) {
  return menu?.promo?.label !== "Customer Stories";
}

function navigateToInternalPath(href) {
  const nextUrl = new URL(href, window.location.origin);
  const normalizedPath = nextUrl.pathname.replace(/\/+$/, "") || "/";
  const target = `${normalizedPath}${nextUrl.search}${nextUrl.hash}`;
  const current = `${window.location.pathname.replace(/\/+$/, "") || "/"}${window.location.search}${window.location.hash}`;

  if (target !== current) {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [closingDropdown, setClosingDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const closeDropdownTimeoutRef = useRef(null);
  const isDesktopViewport = () => window.innerWidth >= 1200;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setClosingDropdown(null);
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setClosingDropdown(null);
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      setClosingDropdown(null);
      setActiveDropdown(null);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (closeDropdownTimeoutRef.current) {
        window.clearTimeout(closeDropdownTimeoutRef.current);
      }
    };
  }, []);

  const toggleDropdown = (event, label) => {
    event.preventDefault();
    event.stopPropagation();
    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
    setClosingDropdown(null);
    setMobileMenuOpen(false);
    setActiveDropdown((current) => (current === label ? null : label));
  };

  const blockDropdownNavigation = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleInternalNavigation = (event, href) => {
    if (!href || !href.startsWith("/")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setClosingDropdown(null);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    navigateToInternalPath(href);
  };

  const openDropdownOnHover = (label) => {
    if (!isDesktopViewport()) {
      return;
    }

    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }

    setClosingDropdown(null);
    setMobileMenuOpen(false);
    setActiveDropdown(label);
  };

  const closeDropdownOnHoverLeave = () => {
    if (!isDesktopViewport()) {
      return;
    }

    if (closeDropdownTimeoutRef.current) {
      window.clearTimeout(closeDropdownTimeoutRef.current);
    }

    const dropdownToClose = activeDropdown;

    if (!dropdownToClose) {
      return;
    }

    setClosingDropdown(dropdownToClose);
    setActiveDropdown(null);
    closeDropdownTimeoutRef.current = window.setTimeout(() => {
      setClosingDropdown(null);
      closeDropdownTimeoutRef.current = null;
    }, 320);
  };

  return (
    <header className="sticky top-[-1px] z-500 w-full">
      <div className="banner-wrapper-opt" />
      <nav className="mui-8qiahu" ref={navRef}>
        <div className="MuiBox-root mui-n9ndkr">
          <a href="/" id="navbar-logo-link" className="mui-1betn9n">
            <div className="MuiBox-root mui-1xksqvf">
              <img
                alt="Deel Logo Black"
                loading="lazy"
                width="78"
                height="27"
                decoding="async"
                className="mui-ducv57"
                style={{ color: "transparent", maxWidth: "78px" }}
                sizes="100vw"
                srcSet="/deel-assets/images/website-media.deel.com/logo.png 640w"
                src="/deel-assets/images/website-media.deel.com/logo.png"
              />
            </div>
          </a>

          <div className="MuiBox-root mui-geidku" id="navbar-category-area" />

          <div className="MuiBox-root mui-f5u9bk">
            {Object.entries(megaMenus).map(([label, menu]) => {
              const open = activeDropdown === label;
              const closing = closingDropdown === label;
              const showDropdown = open || closing;

              return (
                <div
                  className="MuiBox-root mui-1d9b0hw"
                  key={label}
                  onMouseEnter={() => openDropdownOnHover(label)}
                  onMouseLeave={closeDropdownOnHoverLeave}
                >
                  <button
                    type="button"
                    className="mui-1fo3fxi"
                    aria-expanded={open}
                    aria-haspopup="menu"
                    onMouseDown={blockDropdownNavigation}
                    onPointerDown={blockDropdownNavigation}
                    onTouchStart={blockDropdownNavigation}
                    onClick={(event) => toggleDropdown(event, label)}
                  >
                    {label}
                    <div className="cta-icon mui-1e5u1e9">
                      <ChevronDownIcon open={open} />
                    </div>
                  </button>

                  {showDropdown ? (
                    <div
                      className="deel-nav-dropdown-shell"
                      style={{
                        opacity: open ? 1 : 0,
                        transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.985)",
                        filter: open ? "blur(0px)" : "blur(1px)",
                        pointerEvents: open ? "auto" : "none",
                      }}
                    >
                      {menu.featured && menu.compact === "columns" ? (
                        <div className="deel-solutions-menu deel-solutions-menu--columns">
                          <div className="deel-solutions-menu__columns">
                            {menu.columns.map((column) => (
                              <div key={column.title} className="deel-solutions-menu__column">
                                <p className="deel-solutions-menu__eyebrow">{column.title}</p>
                                <div className="deel-solutions-menu__column-links">
                                  {column.items.map((item) => (
                                    column.disableLinks ? (
                                      <div
                                        key={item.href + item.label}
                                        className="deel-solutions-menu__text-link deel-solutions-menu__text-link--static"
                                      >
                                        <span className="deel-solutions-menu__title deel-solutions-menu__title--inline">
                                          {item.label}
                                          {item.badge ? (
                                            <span className="deel-solutions-menu__badge">{item.badge}</span>
                                          ) : null}
                                        </span>
                                        {item.description ? (
                                          <span className="deel-solutions-menu__text">{item.description}</span>
                                        ) : null}
                                      </div>
                                    ) : (
                                      <a
                                        key={item.href + item.label}
                                        href={item.href}
                                        className="deel-solutions-menu__text-link"
                                        onClick={(event) => handleInternalNavigation(event, item.href)}
                                      >
                                        <span className="deel-solutions-menu__title deel-solutions-menu__title--inline">
                                          {item.label}
                                          {item.badge ? (
                                            <span className="deel-solutions-menu__badge">{item.badge}</span>
                                          ) : null}
                                        </span>
                                        {item.description ? (
                                          <span className="deel-solutions-menu__text">{item.description}</span>
                                        ) : null}
                                      </a>
                                    )
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="deel-solutions-menu__footer">
                            <div className="deel-solutions-menu__footer-links">
                              {menu.footerLinks.map((item) => (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  className="deel-solutions-menu__footer-link"
                                  style={item.label === "Help center" ? { display: "none" } : undefined}
                                  onClick={(event) => handleInternalNavigation(event, item.href)}
                                >
                                  {item.label}
                                </a>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="deel-solutions-menu__close"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <CloseIcon />
                              <span>Close</span>
                            </button>
                          </div>
                        </div>
                      ) : menu.featured && menu.compact ? (
                        <div className={`deel-solutions-menu deel-solutions-menu--compact ${shouldRenderPromo(menu) ? "" : "deel-solutions-menu--no-promo"}`}>
                          <div className="deel-solutions-menu__main">
                            <div className="deel-solutions-menu__left">
                              <div className="deel-solutions-menu__section deel-solutions-menu__section--compact">
                                <p className="deel-solutions-menu__eyebrow">{menu.offerTitle}</p>
                                <div className="deel-solutions-menu__text-grid">
                                  {menu.offerItems.map((item) => (
                                    menu.disableOfferLinks ? (
                                      <div
                                        key={item.href + item.label}
                                        className="deel-solutions-menu__text-link deel-solutions-menu__text-link--static"
                                      >
                                        <span className="deel-solutions-menu__title">{item.label}</span>
                                        <span className="deel-solutions-menu__text">{item.description}</span>
                                      </div>
                                    ) : (
                                      <a
                                        key={item.href + item.label}
                                        href={item.href}
                                        className="deel-solutions-menu__text-link"
                                        onClick={(event) => handleInternalNavigation(event, item.href)}
                                      >
                                        <span className="deel-solutions-menu__title">{item.label}</span>
                                        <span className="deel-solutions-menu__text">{item.description}</span>
                                      </a>
                                    )
                                  ))}
                                </div>
                              </div>
                            </div>

                            {shouldRenderPromo(menu) ? (
                              <a
                                href={menu.promo.href}
                                className="deel-solutions-menu__promo"
                                onClick={(event) => handleInternalNavigation(event, menu.promo.href)}
                              >
                                <img
                                  src={menu.promo.image}
                                  alt={menu.promo.label}
                                  className="deel-solutions-menu__promo-image"
                                  loading="lazy"
                                />
                                <span className="deel-solutions-menu__promo-overlay" />
                                <span className="deel-solutions-menu__promo-copy">
                                  <span className="deel-solutions-menu__promo-title">
                                    {menu.promo.label} <ArrowForwardIcon />
                                  </span>
                                </span>
                              </a>
                            ) : null}
                          </div>

                          <div className="deel-solutions-menu__footer">
                            <div className="deel-solutions-menu__footer-links">
                              {menu.footerLinks.map((item) => (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  className="deel-solutions-menu__footer-link"
                                  style={item.label === "Help center" ? { display: "none" } : undefined}
                                  onClick={(event) => handleInternalNavigation(event, item.href)}
                                >
                                  {item.label}
                                </a>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="deel-solutions-menu__close"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <CloseIcon />
                              <span>Close</span>
                            </button>
                          </div>
                        </div>
                      ) : menu.featured ? (
                        <div className={`deel-solutions-menu ${shouldRenderPromo(menu) ? "" : "deel-solutions-menu--no-promo"}`}>
                          <div className="deel-solutions-menu__main">
                            <div className="deel-solutions-menu__left">
                              <div className="deel-solutions-menu__section">
                                <p className="deel-solutions-menu__eyebrow">{menu.offerTitle}</p>
                                <div className="deel-solutions-menu__offer-grid">
                                  {menu.offerItems.map((item) => (
                                    menu.disableOfferLinks ? (
                                      <div
                                        key={item.href}
                                        className="deel-solutions-menu__offer-link deel-solutions-menu__offer-link--static"
                                      >
                                        <span className="deel-solutions-menu__icon-box" aria-hidden="true">
                                          <MenuFeatureIcon kind={item.icon} />
                                        </span>
                                        <span className="deel-solutions-menu__copy">
                                          <span className="deel-solutions-menu__title">{item.label}</span>
                                          <span className="deel-solutions-menu__text">{item.description}</span>
                                        </span>
                                      </div>
                                    ) : (
                                      <a
                                        key={item.href}
                                        href={item.href}
                                        className="deel-solutions-menu__offer-link"
                                        onClick={(event) => handleInternalNavigation(event, item.href)}
                                      >
                                        <span className="deel-solutions-menu__icon-box" aria-hidden="true">
                                          <MenuFeatureIcon kind={item.icon} />
                                        </span>
                                        <span className="deel-solutions-menu__copy">
                                          <span className="deel-solutions-menu__title">{item.label}</span>
                                          <span className="deel-solutions-menu__text">{item.description}</span>
                                        </span>
                                      </a>
                                    )
                                  ))}
                                </div>
                              </div>

                              <div className="deel-solutions-menu__utility-grid">
                                {menu.utilityItems.map((item) => (
                                  menu.disableUtilityLinks ? (
                                    <div
                                      key={item.href}
                                      className="deel-solutions-menu__utility-card deel-solutions-menu__utility-card--static"
                                    >
                                      <span className="deel-solutions-menu__utility-copy">
                                        <span className="deel-solutions-menu__utility-title">{item.label}</span>
                                        <span className="deel-solutions-menu__utility-text">{item.description}</span>
                                      </span>
                                      <img
                                        src={item.image}
                                        alt={item.label}
                                        className="deel-solutions-menu__utility-image"
                                        loading="lazy"
                                      />
                                    </div>
                                  ) : (
                                    <a
                                      key={item.href}
                                      href={item.href}
                                      className="deel-solutions-menu__utility-card"
                                      onClick={(event) => handleInternalNavigation(event, item.href)}
                                    >
                                      <span className="deel-solutions-menu__utility-copy">
                                        <span className="deel-solutions-menu__utility-title">{item.label}</span>
                                        <span className="deel-solutions-menu__utility-text">{item.description}</span>
                                      </span>
                                      <img
                                        src={item.image}
                                        alt={item.label}
                                        className="deel-solutions-menu__utility-image"
                                        loading="lazy"
                                      />
                                    </a>
                                  )
                                ))}
                              </div>
                            </div>

                            {shouldRenderPromo(menu) ? (
                              <a
                                href={menu.promo.href}
                                className="deel-solutions-menu__promo"
                                onClick={(event) => handleInternalNavigation(event, menu.promo.href)}
                              >
                                <img
                                  src={menu.promo.image}
                                  alt={menu.promo.label}
                                  className="deel-solutions-menu__promo-image"
                                  loading="lazy"
                                />
                                <span className="deel-solutions-menu__promo-overlay" />
                                <span className="deel-solutions-menu__promo-copy">
                                  <span className="deel-solutions-menu__promo-title">
                                    {menu.promo.label} <ArrowForwardIcon />
                                  </span>
                                  <span className="deel-solutions-menu__promo-text">{menu.promo.description}</span>
                                </span>
                              </a>
                            ) : null}
                          </div>

                          <div className="deel-solutions-menu__footer">
                            <div className="deel-solutions-menu__footer-links">
                              {menu.footerLinks.map((item) => (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  className="deel-solutions-menu__footer-link"
                                  style={item.label === "Help center" ? { display: "none" } : undefined}
                                  onClick={(event) => handleInternalNavigation(event, item.href)}
                                >
                                  {item.label}
                                </a>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="deel-solutions-menu__close"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <CloseIcon />
                              <span>Close</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="deel-simple-menu">
                          {menu.items.map((item) => (
                            <a
                              key={item.href}
                              href={item.href}
                              className="deel-simple-menu__link"
                              onClick={(event) => handleInternalNavigation(event, item.href)}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="MuiBox-root mui-1d9b0hw">
              <a href="/pricing/" className="mui-1moi9ht" onClick={(event) => handleInternalNavigation(event, "/pricing/")}>
                Pricing
              </a>
            </div>
            <div className="MuiBox-root mui-1d9b0hw" hidden>
              <a href="/marketplace" className="mui-1moi9ht" onClick={(event) => handleInternalNavigation(event, "/marketplace")}>
                Marketplace
              </a>
            </div>
          </div>

          <div className="items-center gap-2 flex justify-end">
            <div className="MuiBox-root mui-fy11xf">
              <a href="/company/login" title="Log in" target="_self" aria-label="Log in" className="mui-15k05j0">
                <button type="button" className="hidden-phone mui-ti8o1k">
                  Log in
                </button>
              </a>
              <button type="button" className="mui-1wshw4o">
                Book a demo
              </button>
              <button
                type="button"
                className="mui-1xqo0rs"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div
            className="animation-slide-down"
            style={{
              marginTop: "16px",
              borderTop: "1px solid rgba(27, 27, 27, 0.12)",
              paddingTop: "16px",
            }}
          >
            <div style={{ display: "grid", gap: "12px" }}>
              {Object.entries(megaMenus).map(([label, menu]) => (
                <div key={label} style={{ borderBottom: "1px solid rgba(27, 27, 27, 0.08)", paddingBottom: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: "15px" }}>{label}</p>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {(menu.featured
                      ? menu.offerItems ?? menu.columns?.flatMap((column) => column.items) ?? []
                      : menu.items).map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="mui-15k05j0"
                        onClick={(event) => handleInternalNavigation(event, item.href)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              <a href="/pricing/" className="mui-15k05j0" onClick={(event) => handleInternalNavigation(event, "/pricing/")}>
                Pricing
              </a>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

export default Header;

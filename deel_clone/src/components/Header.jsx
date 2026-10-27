import React, { useEffect, useRef, useState } from "react";

const navGroups = {
  Solutions: [
    { label: "Deel Payroll", href: "/solutions/payroll/" },
    { label: "Deel HR", href: "/solutions/hr/" },
    { label: "Deel IT", href: "/solutions/it/" },
    { label: "Deel Benefits", href: "/solutions/benefits/" },
    { label: "All Solutions", href: "/solutions/" },
  ],
  "Use cases": [
    { label: "Run global payroll", href: "/use-cases/run-global-payroll/" },
    { label: "Hire worldwide", href: "/solutions/hire/" },
    { label: "Manage HR", href: "/solutions/hr/" },
    { label: "Streamline IT", href: "/solutions/it/" },
  ],
  "Who we serve": [
    { label: "Startups", href: "/startup/" },
    { label: "Enterprise", href: "/enterprise/" },
    { label: "Small business", href: "/small-business/" },
    { label: "Partners", href: "/partner/" },
  ],
  Resources: [
    { label: "Blog", href: "/blog/" },
    { label: "Customer stories", href: "/case-studies/" },
    { label: "Global hiring guides", href: "/hiring/" },
    { label: "Help center", href: "/help-center/" },
  ],
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

function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
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
      setActiveDropdown(null);
    }
  }, [mobileMenuOpen]);

  const toggleDropdown = (label) => {
    setMobileMenuOpen(false);
    setActiveDropdown((current) => (current === label ? null : label));
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
                srcSet="/assets/images/website-media.deel.com/logo_revamp_164ddaed0c-07943198.svg 640w"
                src="/assets/images/website-media.deel.com/logo_revamp_164ddaed0c-07943198.svg"
              />
            </div>
          </a>

          <div className="MuiBox-root mui-geidku" id="navbar-category-area" />

          <div className="MuiBox-root mui-f5u9bk">
            {Object.entries(navGroups).map(([label, items]) => {
              const open = activeDropdown === label;
              return (
                <div className="MuiBox-root mui-1d9b0hw" key={label}>
                  <button
                    type="button"
                    className="mui-1fo3fxi"
                    aria-expanded={open}
                    onClick={() => toggleDropdown(label)}
                  >
                    {label}
                    <div className="cta-icon mui-1e5u1e9">
                      <ChevronDownIcon open={open} />
                    </div>
                  </button>
                  {open ? (
                    <div
                      className="animation-fade-in"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 12px)",
                        left: 0,
                        minWidth: "240px",
                        backgroundColor: "#fff",
                        border: "1px solid rgba(27, 27, 27, 0.12)",
                        borderRadius: "16px",
                        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.08)",
                        padding: "16px",
                        zIndex: 700,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="mui-15k05j0"
                            style={{
                              padding: "10px 12px",
                              borderRadius: "12px",
                              fontSize: "15px",
                              fontWeight: 500,
                            }}
                            onClick={() => setActiveDropdown(null)}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="MuiBox-root mui-1d9b0hw">
              <a href="/pricing/" className="mui-1moi9ht">
                Pricing
              </a>
            </div>
          </div>

          <div className="items-center gap-2 flex justify-end">
            <div className="hidden lg:block">
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-transparent transition-all duration-200 border-0 hover:bg-orange-50/80"
                  aria-label="Select language"
                  aria-expanded="false"
                  type="button"
                >
                  <div className="relative w-[17px] h-[17px]">
                    <img
                      alt="blackGlobe-icon"
                      loading="lazy"
                      width="17"
                      height="17"
                      decoding="async"
                      style={{ color: "transparent" }}
                      sizes="17px"
                      src="/assets/images/website-media.deel.com/black-globe.abc6410e-17a0a320.svg"
                    />
                    <img
                      alt="United States"
                      loading="lazy"
                      width="12.5"
                      height="12.5"
                      decoding="async"
                      className="border border-white rounded-full absolute -top-1 -left-1"
                      style={{ color: "transparent" }}
                      sizes="12.5px"
                      src="/assets/images/website-media.deel.com/United States.613f8f62.svg"
                    />
                  </div>
                  <span className="text-sm font-semibold text-primary">EN</span>
                </button>
              </div>
            </div>

            <div className="MuiBox-root mui-fy11xf">
              <a href="#" title="Log in" target="_self" aria-label="app.deel.com login" className="mui-15k05j0">
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
              {Object.entries(navGroups).map(([label, items]) => (
                <div key={label} style={{ borderBottom: "1px solid rgba(27, 27, 27, 0.08)", paddingBottom: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: "15px" }}>{label}</p>
                  <div style={{ display: "grid", gap: "8px" }}>
                    {items.map((item) => (
                      <a key={item.href} href={item.href} className="mui-15k05j0" onClick={() => setMobileMenuOpen(false)}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              <a href="/pricing/" className="mui-15k05j0" onClick={() => setMobileMenuOpen(false)}>
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

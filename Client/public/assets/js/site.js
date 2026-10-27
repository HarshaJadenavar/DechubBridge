const REVEAL_SELECTOR = [
  "[data-static-appear-id]",
  "[style*='opacity:0.001']",
  "[style*='opacity:0;transform:translateY(']",
  "[style*='opacity:0;transform:translateX(']",
  "[style*='filter:blur(4px)']",
  "[style*='-webkit-filter:blur(4px)']",
  "[style*='will-change:transform;opacity:0']",
  "[style*='opacity:0;-webkit-mask-image']",
  "[style*='opacity:0;mask-image']",
].join(",");

function stripHiddenStyles(styleText) {
  return styleText
    .replace(/opacity:\s*0(?:\.001)?;?/gi, "")
    .replace(/filter:\s*blur\(4px\);?/gi, "")
    .replace(/-webkit-filter:\s*blur\(4px\);?/gi, "")
    .replace(/will-change:\s*transform;?/gi, "")
    .replace(/transform:\s*translate[XY]\([^)]+\)\s*scale\(1\.1\);?/gi, "")
    .replace(/transform:\s*translate[XY]\([^)]+\);?/gi, "")
    .replace(/;;+/g, ";")
    .trim();
}

function prepareRevealElement(element) {
  const style = element.getAttribute("style") || "";
  const translateY = style.match(/translateY\(([^)]+)\)/i);
  const translateX = style.match(/translateX\(([^)]+)\)/i);

  if (translateY) {
    element.style.setProperty("--static-reveal-y", translateY[1]);
  }

  if (translateX) {
    element.style.setProperty("--static-reveal-x", translateX[1]);
  }

  if (/blur\(4px\)/i.test(style)) {
    element.style.setProperty("--static-reveal-blur", "4px");
  }

  element.setAttribute("data-static-reveal", "pending");
  element.setAttribute("style", stripHiddenStyles(style));
}

function revealElement(element) {
  if (element.dataset.staticReveal === "visible") return;
  element.dataset.staticReveal = "visible";
}

function setupRevealAnimations() {
  const candidates = Array.from(document.querySelectorAll(REVEAL_SELECTOR));

  candidates.forEach((element) => {
    prepareRevealElement(element);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    },
  );

  candidates.forEach((element, index) => {
    element.style.setProperty("--static-reveal-delay", `${Math.min(index * 18, 220)}ms`);
    if (index < 8) {
      revealElement(element);
      return;
    }
    observer.observe(element);
  });
}

function setupAutoMedia() {
  document.querySelectorAll("video").forEach((video) => {
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const playVideo = () => {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener("canplay", playVideo, { once: true });
      video.load();
    }
  });
}

function setupLogoMarquees() {
  document
    .querySelectorAll("section[style*='mask-image'], section[style*='-webkit-mask-image']")
    .forEach((track) => {
      const list = track.querySelector("ul");
      if (!list) return;

      track.setAttribute("data-static-marquee", "true");
      list.setAttribute("data-static-marquee-track", "true");

      const clone = list.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
}

function setupStaticMenu() {
  const menuButton = document.querySelector(".framer-1ccfzfu-container [tabindex='0']");
  if (!menuButton) return;

  const menuPanel = Array.from(document.querySelectorAll(".ssr-variant")).find((variant) => {
    return /Open/i.test(variant.textContent || "") && variant.querySelector("a[href='/about/']");
  });

  if (menuPanel) {
    menuPanel.setAttribute("data-static-menu-panel", "true");
  }

  menuButton.setAttribute("role", "button");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Toggle menu");

  const nav = menuButton.closest("nav");
  const navLinks = nav
    ? [
        nav.querySelector(".framer-kbmi72-container a"),
        nav.querySelector(".framer-mez1yj-container a"),
        nav.querySelector(".framer-d3zajn-container a"),
        nav.querySelector(".framer-1yhtuvl-container a"),
      ].filter(Boolean)
    : [];

  const fallbackHrefByLabel = {
    Home: "/",
    About: "/about",
    Blog: "/blog",
    Contact: "/contact",
  };

  let customMenu = document.querySelector("[data-static-mobile-menu]");
  if (!customMenu) {
    customMenu = document.createElement("div");
    customMenu.setAttribute("data-static-mobile-menu", "true");
    customMenu.innerHTML = `
      <div class="static-mobile-menu-card">
        <div class="static-mobile-menu-head">
          <a href="/" class="static-mobile-menu-logo" aria-label="Home"></a>
          <button type="button" class="static-mobile-menu-close" aria-label="Close menu">&times;</button>
        </div>
        <nav class="static-mobile-menu-links" aria-label="Mobile navigation"></nav>
      </div>
    `;
    document.body.appendChild(customMenu);
  }

  const logoSource = nav?.querySelector(".framer-xb6sci");
  const logoTarget = customMenu.querySelector(".static-mobile-menu-logo");
  if (logoSource && logoTarget && !logoTarget.querySelector(".framer-yjtsf1")) {
    logoTarget.innerHTML = logoSource.innerHTML;
  }

  const linksHost = customMenu.querySelector(".static-mobile-menu-links");
  if (linksHost && !linksHost.children.length) {
    navLinks.forEach((sourceLink) => {
      const labelText = (sourceLink.textContent || "").trim();
      const sourceHref = sourceLink.getAttribute("href");
      const link = document.createElement("a");
      link.className = "static-mobile-menu-link";
      link.href = sourceHref && sourceHref !== "#" ? sourceHref : (fallbackHrefByLabel[labelText] || "/");
      link.textContent = labelText;
      linksHost.appendChild(link);
    });
  }

  const closeMenu = () => {
    document.body.dataset.menuOpen = "false";
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const nextState = document.body.dataset.menuOpen === "true" ? "false" : "true";
    document.body.dataset.menuOpen = nextState;
    menuButton.setAttribute("aria-expanded", nextState);
  });

  menuPanel?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  customMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  customMenu.querySelector(".static-mobile-menu-close")?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function setupDesktopHeaderHover() {
  document
    .querySelectorAll("nav.framer-ejdAz.framer-14epcrf")
    .forEach((nav) => {
      if (
        !nav.classList.contains("framer-v-14epcrf") &&
        !nav.classList.contains("framer-v-1pw3m48") &&
        !nav.classList.contains("framer-v-16hxzu9")
      ) {
        return;
      }

      const linkSelectors = [
        ".framer-kbmi72-container a",
        ".framer-mez1yj-container a",
        ".framer-d3zajn-container a",
        ".framer-1yhtuvl-container a",
      ];
      const originalLinks = linkSelectors.map((selector) => nav.querySelector(selector)).filter(Boolean);
      const originalLogo = nav.querySelector(".framer-xb6sci");

      if (originalLinks.length < 4 || !originalLogo) return;

      nav.setAttribute("data-static-desktop-nav", "true");

      const originalContent = nav.querySelector(".framer-mds9fs");
      if (originalContent) {
        originalContent.setAttribute("data-static-desktop-source", "true");
      }

      if (!nav.querySelector(".static-desktop-header")) {
        const header = document.createElement("div");
        header.className = "static-desktop-header";

        const leftGroup = document.createElement("div");
        leftGroup.className = "static-desktop-links static-desktop-links-left";

        const rightGroup = document.createElement("div");
        rightGroup.className = "static-desktop-links static-desktop-links-right";

        const fallbackHrefByLabel = {
          Home: "/",
          About: "/about",
          Blog: "/blog",
          Contact: "/contact",
        };

        const createLink = (sourceLink) => {
          const anchor = document.createElement("a");
          anchor.className = "static-desktop-link";
          const labelText = (sourceLink.textContent || "").trim();
          const sourceHref = sourceLink.getAttribute("href");
          anchor.href = sourceHref && sourceHref !== "#" ? sourceHref : (fallbackHrefByLabel[labelText] || "/");

          if (sourceLink.hasAttribute("data-framer-page-link-current")) {
            anchor.setAttribute("aria-current", "page");
          }

          const label = document.createElement("span");
          label.className = "static-desktop-link-label";
          label.textContent = labelText;
          anchor.appendChild(label);
          return anchor;
        };

        leftGroup.append(createLink(originalLinks[0]), createLink(originalLinks[1]));
        rightGroup.append(createLink(originalLinks[2]), createLink(originalLinks[3]));

        const logoClone = originalLogo.cloneNode(true);
        logoClone.classList.add("static-desktop-logo");
        logoClone.removeAttribute("data-framer-page-link-current");
        if (!logoClone.getAttribute("href") || logoClone.getAttribute("href") === "#") {
          logoClone.setAttribute("href", "/");
        }

        const tabletMenuButton = document.createElement("button");
        tabletMenuButton.type = "button";
        tabletMenuButton.className = "static-tablet-menu-button";
        tabletMenuButton.setAttribute("aria-label", "Open menu");
        tabletMenuButton.setAttribute("aria-expanded", "false");
        tabletMenuButton.innerHTML = `
          <span></span>
          <span></span>
          <span></span>
        `;

        tabletMenuButton.addEventListener("click", () => {
          const nextState = document.body.dataset.menuOpen === "true" ? "false" : "true";
          document.body.dataset.menuOpen = nextState;
          tabletMenuButton.setAttribute("aria-expanded", nextState);
        });

        header.append(leftGroup, logoClone, rightGroup);
        header.appendChild(tabletMenuButton);
        nav.appendChild(header);
      }

      const header = nav.querySelector(".static-desktop-header");
      const logo = nav.querySelector(".static-desktop-logo");
      if (!header || !logo) return;
      if (header.dataset.staticDesktopBound === "true") return;

      let closeTimer = null;

      const setOpenState = (isOpen) => {
        if (closeTimer) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }

        nav.dataset.desktopNavOpen = isOpen ? "true" : "false";
      };

      const scheduleClose = (event) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && nav.contains(nextTarget)) return;

        closeTimer = window.setTimeout(() => {
          nav.dataset.desktopNavOpen = "false";
        }, 160);
      };

      logo.addEventListener("mouseenter", () => setOpenState(true));
      logo.addEventListener("focusin", () => setOpenState(true));
      header.addEventListener("mouseenter", () => setOpenState(true));
      header.addEventListener("focusin", () => setOpenState(true));
      nav.addEventListener("mouseenter", () => setOpenState(true));
      nav.addEventListener("mouseleave", scheduleClose);
      nav.addEventListener("focusout", scheduleClose);
      header.dataset.staticDesktopBound = "true";
    });
}

let desktopHeaderRefreshScheduled = false;
let desktopHeaderObserverStarted = false;

function scheduleDesktopHeaderRefresh() {
  if (desktopHeaderRefreshScheduled) return;
  desktopHeaderRefreshScheduled = true;

  requestAnimationFrame(() => {
    desktopHeaderRefreshScheduled = false;
    setupDesktopHeaderHover();
  });
}

function maintainDesktopHeaderEnhancement() {
  if (desktopHeaderObserverStarted) return;
  desktopHeaderObserverStarted = true;

  scheduleDesktopHeaderRefresh();
  window.addEventListener("load", scheduleDesktopHeaderRefresh);
  window.setTimeout(scheduleDesktopHeaderRefresh, 300);
  window.setTimeout(scheduleDesktopHeaderRefresh, 1200);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" && (mutation.addedNodes.length || mutation.removedNodes.length)) {
        scheduleDesktopHeaderRefresh();
        break;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function setupCustomHomepageHero() {
  const heroSection = document.querySelector('section[data-framer-name="Hero"]');
  if (!heroSection) return;

  const contentHost = heroSection.querySelector('[data-framer-name="content"]');
  if (!(contentHost instanceof HTMLElement)) return;

  const existingHero = contentHost.querySelector(".static-hero-copy");
  if (existingHero) {
    const existingTitle = existingHero.querySelector(".static-hero-title");
    if (existingTitle instanceof HTMLElement) {
      setupHeroTitleTypewriter(existingTitle);
    }
    return;
  }

  contentHost.setAttribute("data-static-custom-hero", "true");
  contentHost.innerHTML = `
    <div class="static-hero-copy">
      <h1 class="static-hero-title">
        <span>Hire, Pay &amp; <em>Manage</em></span>
        <span>Global Contractors <em>without the chaos</em></span>
      </h1>
      <p class="static-hero-description">
        Dechub is the all-in-one platform to onboard US contractors, generate contracts, collect e-signatures, and process payments via Wise - all from one dashboard.
      </p>
      <form class="static-hero-search" action="#" method="get">
        <input type="text" placeholder="Search for any service..." aria-label="Search for any service" />
        <button type="submit" aria-label="Search">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"></path>
          </svg>
        </button>
      </form>
      <div class="static-hero-tags" aria-label="Popular services">
        <a href="/contact" class="static-hero-tag">Architecture &amp; Interior Design <span aria-hidden="true">→</span></a>
        <a href="/contact" class="static-hero-tag">Graphic Design <span aria-hidden="true">→</span></a>
        <a href="/contact" class="static-hero-tag">Website Developer <span aria-hidden="true">→</span></a>
      </div>
      <div class="static-hero-actions">
        <a href="/get-started" class="static-hero-button static-hero-button-primary">Get Started</a>
        <a href="/contact" class="static-hero-button static-hero-button-secondary">Book a demo</a>
      </div>
    </div>
  `;

  const searchForm = contentHost.querySelector(".static-hero-search");
  if (searchForm instanceof HTMLFormElement) {
    searchForm.setAttribute("action", "/marketplace");
    searchForm.setAttribute("method", "get");
  }

  const searchInput = contentHost.querySelector('.static-hero-search input[type="text"]');
  if (searchInput instanceof HTMLInputElement) {
    searchInput.setAttribute("name", "q");
  }

  const marketplaceHrefByLabel = {
    "Architecture & Interior Design": "/marketplace?q=Architecture%20%26%20Interior%20Design",
    "Graphic Design": "/marketplace?q=Graphic%20Design",
    "Website Developer": "/marketplace?q=Website%20Developer",
  };

  contentHost.querySelectorAll(".static-hero-tag").forEach((tag) => {
    if (!(tag instanceof HTMLAnchorElement)) return;

    const label = Array.from(tag.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();

    const href = marketplaceHrefByLabel[label];
    if (href) {
      tag.setAttribute("href", href);
    }

    const icon = tag.querySelector('span[aria-hidden="true"]');
    if (icon instanceof HTMLElement) {
      icon.innerHTML = "&rarr;";
    }
  });
  const title = contentHost.querySelector(".static-hero-title");
  if (title instanceof HTMLElement) {
    setupHeroTitleTypewriter(title);
  }
}

function setupHeroTitleTypewriter(title) {
  if (title.__heroTypeTimer) {
    window.clearTimeout(title.__heroTypeTimer);
    title.__heroTypeTimer = null;
  }

  title.querySelector(".static-hero-title-overlay")?.remove();

  const sourceLines = Array.from(title.children).filter(
    (node) => node instanceof HTMLElement && node.tagName.toLowerCase() === "span",
  );

  if (!sourceLines.length) return;

  const overlay = document.createElement("span");
  overlay.className = "static-hero-title-overlay";
  overlay.setAttribute("aria-hidden", "true");

  let charIndex = 0;
  const lines = sourceLines.map((lineNode) => {
    const line = document.createElement("span");
    line.className = "static-hero-title-overlay-line";
    overlay.appendChild(line);

    const text = lineNode.textContent || "";
    const fragment = document.createDocumentFragment();

    Array.from(text).forEach((character) => {
      if (character === " ") {
        const space = document.createElement("span");
        space.className = "static-hero-title-overlay-space";
        space.innerHTML = "&nbsp;";
        fragment.appendChild(space);
        return;
      }

      const letter = document.createElement("span");
      letter.className = "static-hero-title-overlay-char";
      letter.style.setProperty("--hero-char-index", String(charIndex));
      letter.textContent = character;
      fragment.appendChild(letter);
      charIndex += 1;
    });

    line.replaceChildren(fragment);

    return {
      element: line,
      letters: Array.from(line.querySelectorAll(".static-hero-title-overlay-char")),
    };
  });

  title.dataset.typewriterActive = "true";
  title.appendChild(overlay);

  const totalCharacters = lines.reduce((sum, line) => sum + line.letters.length, 0);

  const renderCount = (visibleCount) => {
    let remaining = visibleCount;
    lines.forEach(({ letters }) => {
      letters.forEach((letter) => {
        if (!(letter instanceof HTMLElement)) return;
        letter.style.animationPlayState = remaining > 0 ? "running" : "paused";
        if (remaining > 0) {
          remaining -= 1;
        }
      });
    });
  };

  const loop = () => {
    let visibleCount = 0;

    const typeNext = () => {
      renderCount(visibleCount);
      if (visibleCount < totalCharacters) {
        visibleCount += 1;
        title.__heroTypeTimer = window.setTimeout(typeNext, 55);
        return;
      }

      title.__heroTypeTimer = window.setTimeout(() => {
        renderCount(0);
        title.__heroTypeTimer = window.setTimeout(loop, 400);
      }, 1400);
    };

    typeNext();
  };

  renderCount(0);
  title.__heroTypeTimer = window.setTimeout(loop, 180);
}

let customHeroRefreshScheduled = false;
let customHeroObserverStarted = false;

function scheduleCustomHeroRefresh() {
  if (customHeroRefreshScheduled) return;
  customHeroRefreshScheduled = true;

  requestAnimationFrame(() => {
    customHeroRefreshScheduled = false;
    setupCustomHomepageHero();
  });
}

function maintainCustomHomepageHero() {
  if (customHeroObserverStarted) return;
  customHeroObserverStarted = true;

  scheduleCustomHeroRefresh();
  window.addEventListener("load", scheduleCustomHeroRefresh);
  window.setTimeout(scheduleCustomHeroRefresh, 300);
  window.setTimeout(scheduleCustomHeroRefresh, 1200);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      if (!mutation.addedNodes.length && !mutation.removedNodes.length) continue;

      const touchesHero = [mutation.target, ...mutation.addedNodes, ...mutation.removedNodes].some((node) => (
        node instanceof Element
        && (node.matches?.('section[data-framer-name="Hero"]') || node.closest?.('section[data-framer-name="Hero"]'))
      ));

      if (touchesHero) {
        scheduleCustomHeroRefresh();
        break;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function simplifyForms() {
  document.querySelectorAll("form").forEach((form) => {
    if (form.hasAttribute("action")) return;
    form.setAttribute("action", "#");
  });
}

function setupFaqAccordion() {
  const answersByQuestion = new Map([
    [
      "How can AI automation help my business?",
      "AI automation helps reduce repetitive manual work, speed up response times, improve accuracy, and let your team focus on higher-value tasks like growth, service, and strategy.",
    ],
    [
      "Is AI automation difficult to integrate?",
      "No. We design automations around your current tools and workflows, so the setup stays practical, lightweight, and tailored to how your business already operates.",
    ],
    [
      "What industries can benefit from AI automation?",
      "AI automation can support service businesses, agencies, healthcare, e-commerce, real estate, education, and operations-heavy teams that need faster workflows and more consistent follow-up.",
    ],
    [
      "Do I need technical knowledge to use AI automation?",
      "Not at all. We handle the technical setup and make sure the final system is easy for your team to use day to day without needing a technical background.",
    ],
    [
      "What kind of support do you offer?",
      "We provide planning, implementation, testing, optimization, and ongoing support so your automations continue working smoothly as your business evolves.",
    ],
  ]);

  document
    .querySelectorAll('section[data-framer-name="FAQs"] [data-framer-name="Closed"]')
    .forEach((item, index) => {
      const questionText = item.querySelector("p")?.textContent?.trim();
      if (!questionText) return;

      const answerText = answersByQuestion.get(questionText);
      if (!answerText) return;

      item.setAttribute("data-static-faq-item", "true");
      item.setAttribute("role", "button");
      item.setAttribute("aria-expanded", "false");
      item.setAttribute("tabindex", "0");

      let answer = item.querySelector(".static-faq-answer");
      if (!answer) {
        answer = document.createElement("div");
        answer.className = "static-faq-answer";
        answer.innerHTML = `<p>${answerText}</p>`;
        item.appendChild(answer);
      }

      const iconHolder = item.querySelector('[data-framer-name="Icon Holder"]');
      if (iconHolder && !iconHolder.querySelector(".static-faq-icon")) {
        const icon = document.createElement("span");
        icon.className = "static-faq-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "+";
        iconHolder.appendChild(icon);
      }

      if (index === 0) {
        item.dataset.staticFaqOpen = "true";
        item.setAttribute("aria-expanded", "true");
      } else {
        item.dataset.staticFaqOpen = "false";
      }
    });

  const items = Array.from(document.querySelectorAll("[data-static-faq-item='true']"));
  if (!items.length) return;

  const sync = () => {
    items.forEach((item) => {
      const isOpen = item.dataset.staticFaqOpen === "true";
      item.setAttribute("aria-expanded", isOpen ? "true" : "false");

      const answer = item.querySelector(".static-faq-answer");
      if (!answer) return;

      if (isOpen) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      } else {
        answer.style.maxHeight = "0px";
      }
    });
  };

  const openItem = (targetItem) => {
    items.forEach((item) => {
      item.dataset.staticFaqOpen = item === targetItem ? "true" : "false";
    });
    sync();
  };

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const isOpen = item.dataset.staticFaqOpen === "true";
      if (isOpen) {
        item.dataset.staticFaqOpen = "false";
        sync();
        return;
      }

      openItem(item);
    });

    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      item.click();
    });
  });

  window.addEventListener("resize", sync, { passive: true });
  sync();
}

function setupTestimonialCarousel() {
  document.querySelectorAll(".framer-slideshow").forEach((section) => {
    const sectionText = section.textContent || "";
    if (!/Daniel Roy/i.test(sectionText) || !/Rhea D.?Souza/i.test(sectionText)) return;

    const track = section.querySelector("ul");
    const controls = section.querySelector(".framer--slideshow-controls");
    const viewport = track?.parentElement;
    if (!track || !controls || !viewport) return;

    const slides = Array.from(track.children).filter((slide) => slide.tagName === "LI");
    const panels = slides
      .map((slide) => Array.from(slide.children).find((child) => child instanceof HTMLElement))
      .filter(Boolean);
    const buttons = controls.querySelectorAll("button");
    const prevButton = buttons[0];
    const nextButton = buttons[1];
    if (panels.length < 2 || !prevButton || !nextButton) return;

    const host =
      section.closest(".framer-1huz0j-container") ||
      section.parentElement ||
      section;

    host.setAttribute("data-static-testimonial-host", "true");
    section.setAttribute("data-static-testimonial-carousel", "true");
    viewport.setAttribute("data-static-testimonial-viewport", "true");
    track.setAttribute("data-static-testimonial-track", "true");

    buttons.forEach((button) => {
      button.disabled = false;
      button.style.pointerEvents = "auto";
      button.style.cursor = "pointer";
    });

    controls.setAttribute("aria-hidden", "true");

    let customControls = host.querySelector(".static-testimonial-controls");
    if (!customControls) {
      customControls = document.createElement("div");
      customControls.className = "static-testimonial-controls";

      const prevCustom = document.createElement("button");
      prevCustom.type = "button";
      prevCustom.className = "static-testimonial-arrow static-testimonial-arrow-prev";
      prevCustom.setAttribute("aria-label", "Previous testimonial");
      prevCustom.innerHTML =
        '<img src="assets/icons/6tTbkXggWgQCAJ4DO2QEdXXmgM.svg" alt="" aria-hidden="true">';

      const nextCustom = document.createElement("button");
      nextCustom.type = "button";
      nextCustom.className = "static-testimonial-arrow static-testimonial-arrow-next";
      nextCustom.setAttribute("aria-label", "Next testimonial");
      nextCustom.innerHTML =
        '<img src="assets/icons/11KSGbIZoRSg4pjdnUoif6MKHI.svg" alt="" aria-hidden="true">';

      customControls.append(prevCustom, nextCustom);
      host.appendChild(customControls);
    }

    const customButtons = customControls.querySelectorAll("button");
    const customPrev = customButtons[0];
    const customNext = customButtons[1];
    if (!customPrev || !customNext) return;

    let index = 0;

    const getGap = () => {
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
      return Number.isFinite(gap) ? gap : 0;
    };

    const getPanelWidth = (panel) => {
      if (!panel) return viewport.clientWidth;
      const rect = panel.getBoundingClientRect();
      return rect.width || panel.offsetWidth || viewport.clientWidth;
    };

    const getStep = () => {
      const first = panels[0];
      const second = panels[1];
      if (!first) return viewport.clientWidth;
      if (!second) return getPanelWidth(first);

      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const measuredStep = secondRect.left - firstRect.left;
      return Math.max(measuredStep || 0, getPanelWidth(first) + getGap());
    };

    const getTrackWidth = () => {
      const totalPanelWidth = panels.reduce((sum, panel) => sum + getPanelWidth(panel), 0);
      return totalPanelWidth + getGap() * Math.max(panels.length - 1, 0);
    };

    const getMaxIndex = () => {
      const step = Math.max(getStep(), 1);
      const hiddenWidth = Math.max(getTrackWidth() - viewport.clientWidth, 0);
      return Math.max(Math.ceil(hiddenWidth / step), 0);
    };

    const sync = () => {
      const maxIndex = getMaxIndex();
      index = Math.min(index, maxIndex);
      const offset = Math.min(index * getStep(), Math.max(getTrackWidth() - viewport.clientWidth, 0));
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;

      prevButton.disabled = index <= 0;
      nextButton.disabled = index >= maxIndex;
      customPrev.disabled = prevButton.disabled;
      customNext.disabled = nextButton.disabled;

      prevButton.style.pointerEvents = prevButton.disabled ? "none" : "auto";
      nextButton.style.pointerEvents = nextButton.disabled ? "none" : "auto";
      prevButton.style.cursor = prevButton.disabled ? "default" : "pointer";
      nextButton.style.cursor = nextButton.disabled ? "default" : "pointer";
    };

    prevButton.addEventListener("click", () => {
      index = Math.max(index - 1, 0);
      sync();
    });

    nextButton.addEventListener("click", () => {
      index = Math.min(index + 1, getMaxIndex());
      sync();
    });

    customPrev.addEventListener("click", () => {
      index = Math.max(index - 1, 0);
      sync();
    });

    customNext.addEventListener("click", () => {
      index = Math.min(index + 1, getMaxIndex());
      sync();
    });

    window.addEventListener("resize", sync, { passive: true });
    sync();
  });
}

function setupCaseStudyCarousel() {
  document
    .querySelectorAll('[data-framer-name="Case 1 - Desktop"], [data-framer-name="Case 1 - Mobile"]')
    .forEach((caseCard) => {
      const images = Array.from(
        caseCard.querySelectorAll('[data-framer-name="Image 1"], [data-framer-name="Image 2"], [data-framer-name="Image 3"]'),
      );
      if (images.length < 2) return;

      const previousControl =
        caseCard.querySelector('[data-framer-name="Left arrow"]') ||
        caseCard.querySelector('[data-framer-name="Left mobile"]');
      const nextControl =
        caseCard.querySelector('[data-framer-name="Right arrow"]') ||
        caseCard.querySelector('[data-framer-name="Right mobile"]');
      if (!previousControl || !nextControl) return;

      caseCard.setAttribute("data-static-case-carousel", "true");
      images.forEach((image, imageIndex) => {
        image.setAttribute("data-static-case-image", imageIndex === 0 ? "active" : "inactive");
      });

      const controls = [previousControl, nextControl];
      controls.forEach((control) => {
        control.setAttribute("role", "button");
        control.setAttribute("aria-disabled", "false");
        control.style.cursor = "pointer";
      });

      let index = images.findIndex((image) => {
        const opacity = Number.parseFloat(image.style.opacity || "0");
        return opacity >= 0.5;
      });

      if (index < 0) index = 0;

      const sync = () => {
        images.forEach((image, imageIndex) => {
          const isActive = imageIndex === index;
          image.style.opacity = isActive ? "1" : "0";
          image.style.pointerEvents = isActive ? "auto" : "none";
          image.setAttribute("data-static-case-image", isActive ? "active" : "inactive");
        });
      };

      const stepTo = (direction) => {
        index = (index + direction + images.length) % images.length;
        sync();
      };

      const bindControl = (control, direction) => {
        control.addEventListener("click", () => {
          stepTo(direction);
        });

        control.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          stepTo(direction);
        });
      };

      bindControl(previousControl, -1);
      bindControl(nextControl, 1);
      sync();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.dataset.menuOpen = "false";
  setupRevealAnimations();
  setupAutoMedia();
  setupLogoMarquees();
  setupCustomHomepageHero();
  setupStaticMenu();
  setupDesktopHeaderHover();
  maintainDesktopHeaderEnhancement();
  maintainCustomHomepageHero();
  setupTestimonialCarousel();
  setupCaseStudyCarousel();
  setupFaqAccordion();
  simplifyForms();
});

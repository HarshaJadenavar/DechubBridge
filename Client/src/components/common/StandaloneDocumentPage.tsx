import { useEffect } from 'react';
import {
  STANDALONE_LIGHT_THEME_CLASS,
  STANDALONE_LIGHT_THEME_CSS,
  shouldApplyStandaloneLightTheme,
} from './standaloneLightTheme';

interface StandaloneDocumentPageProps {
  sourcePath: string;
}

function enhanceDesktopHeader(documentFragment: Document) {
  documentFragment.querySelectorAll<HTMLElement>('nav.framer-ejdAz.framer-14epcrf').forEach((nav) => {
    if (
      !nav.classList.contains('framer-v-14epcrf')
      && !nav.classList.contains('framer-v-1pw3m48')
    ) {
      return;
    }

    const linkSelectors = [
      '.framer-kbmi72-container a',
      '.framer-mez1yj-container a',
      '.framer-d3zajn-container a',
      '.framer-1yhtuvl-container a',
    ];
    const originalLinks = linkSelectors
      .map((selector) => nav.querySelector<HTMLAnchorElement>(selector))
      .filter((link): link is HTMLAnchorElement => Boolean(link));
    const originalLogo = nav.querySelector<HTMLAnchorElement>('.framer-xb6sci');

    if (originalLinks.length < 4 || !originalLogo) {
      return;
    }

    nav.setAttribute('data-static-desktop-nav', 'true');

    const originalContent = nav.querySelector<HTMLElement>('.framer-mds9fs');
    if (originalContent) {
      originalContent.setAttribute('data-static-desktop-source', 'true');
    }

    if (nav.querySelector('.static-desktop-header')) {
      return;
    }

    const header = documentFragment.createElement('div');
    header.className = 'static-desktop-header';

    const leftGroup = documentFragment.createElement('div');
    leftGroup.className = 'static-desktop-links static-desktop-links-left';

    const rightGroup = documentFragment.createElement('div');
    rightGroup.className = 'static-desktop-links static-desktop-links-right';

    const fallbackHrefByLabel: Record<string, string> = {
      Home: '/',
      About: '/about',
      Blog: '/blog',
      Contact: '/contact',
    };

    const createLink = (sourceLink: HTMLAnchorElement) => {
      const anchor = documentFragment.createElement('a');
      anchor.className = 'static-desktop-link';

      const labelText = (sourceLink.textContent || '').trim();
      const sourceHref = sourceLink.getAttribute('href');
      anchor.href = sourceHref && sourceHref !== '#' ? sourceHref : (fallbackHrefByLabel[labelText] || '/');

      if (sourceLink.hasAttribute('data-framer-page-link-current')) {
        anchor.setAttribute('aria-current', 'page');
      }

      const label = documentFragment.createElement('span');
      label.className = 'static-desktop-link-label';
      label.textContent = labelText;
      anchor.appendChild(label);
      return anchor;
    };

    leftGroup.append(createLink(originalLinks[0]), createLink(originalLinks[1]));
    rightGroup.append(createLink(originalLinks[2]), createLink(originalLinks[3]));

    const logoClone = originalLogo.cloneNode(true) as HTMLAnchorElement;
    logoClone.classList.add('static-desktop-logo');
    logoClone.removeAttribute('data-framer-page-link-current');
    if (!logoClone.getAttribute('href') || logoClone.getAttribute('href') === '#') {
      logoClone.setAttribute('href', '/');
    }

    header.append(leftGroup, logoClone, rightGroup);
    nav.appendChild(header);
  });
}

function rewriteInternalLinks(documentFragment: Document) {
  documentFragment.querySelectorAll('a[href]').forEach((node) => {
    if (!(node instanceof HTMLAnchorElement)) {
      return;
    }

    const href = node.getAttribute('href');
    if (!href) {
      return;
    }

    if (href === '/about/') {
      node.setAttribute('href', '/about');
      return;
    }

    if (href === '/deel-vs-competitors/') {
      node.setAttribute('href', '/deel-vs-competitors');
      return;
    }

    if (href === '/blog/') {
      node.setAttribute('href', '/blog');
      return;
    }

    if (href === '/contact/') {
      node.setAttribute('href', '/contact');
      return;
    }

    if (href === '/legal-pages/privacy-policy/') {
      node.setAttribute('href', '/legal-pages/privacy-policy');
      return;
    }

    if (href === '/legal/privacy-policy/' || href === '/legal/privacy-policy') {
      node.setAttribute('href', '/legal-pages/privacy-policy');
      return;
    }

    const blogPostMatch = href.match(/^\/blog\/([^/]+)\/$/);
    if (blogPostMatch) {
      node.setAttribute('href', `/blog/${blogPostMatch[1]}`);
      return;
    }

    if (/^\/[A-Za-z0-9-]+(?:\/[A-Za-z0-9-]+)*\/$/.test(href)) {
      node.setAttribute('href', href.slice(0, -1));
    }
  });
}

export default function StandaloneDocumentPage({ sourcePath }: StandaloneDocumentPageProps) {
  useEffect(() => {
    let isCancelled = false;
    const shouldApplyLightTheme = shouldApplyStandaloneLightTheme(sourcePath);

    const renderStandaloneDocument = async () => {
      const response = await fetch(sourcePath, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load standalone document: ${response.status}`);
      }

      const html = await response.text();
      if (isCancelled) {
        return;
      }

      const parsed = new DOMParser().parseFromString(html, 'text/html');
      rewriteInternalLinks(parsed);
      enhanceDesktopHeader(parsed);

      if (shouldApplyLightTheme) {
        parsed.body.classList.add(STANDALONE_LIGHT_THEME_CLASS);
        const themeStyle = parsed.createElement('style');
        themeStyle.setAttribute('data-exported-static-theme', sourcePath);
        themeStyle.textContent = STANDALONE_LIGHT_THEME_CSS;
        parsed.head.appendChild(themeStyle);
      }

      document.open();
      document.write(`<!doctype html>\n${parsed.documentElement.outerHTML}`);
      document.close();
    };

    renderStandaloneDocument().catch(() => {
      if (isCancelled) {
        return;
      }

      document.open();
      document.write(
        '<!doctype html><html><head><title>Page not found</title></head><body style="margin:0;background:#000;color:#fff;font-family:sans-serif;display:grid;place-items:center;min-height:100vh">Unable to load page.</body></html>',
      );
      document.close();
    });

    return () => {
      isCancelled = true;
    };
  }, [sourcePath]);

  return null;
}

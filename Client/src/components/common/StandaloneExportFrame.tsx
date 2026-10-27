import { useEffect, useRef } from 'react';

interface StandaloneExportFrameProps {
  sourcePath: string;
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === '' ? '/' : normalized;
}

function mapExportPathToAppPath(pathname: string) {
  const normalized = normalizePathname(pathname);

  if (normalized === '/landing-export' || normalized === '/landing-export/index.html') {
    return '/';
  }

  if (normalized === '/landing-export/about' || normalized === '/landing-export/about/index.html') {
    return '/about';
  }

  if (normalized === '/landing-export/blog' || normalized === '/landing-export/blog/index.html') {
    return '/blog';
  }

  if (normalized === '/landing-export/contact' || normalized === '/landing-export/contact/index.html') {
    return '/contact';
  }

  if (
    normalized === '/landing-export/legal-pages/privacy-policy'
    || normalized === '/landing-export/legal-pages/privacy-policy/index.html'
  ) {
    return '/legal-pages/privacy-policy';
  }

  const blogMatch = normalized.match(/^\/landing-export\/blog\/([^/]+)(?:\/index\.html)?$/);
  if (blogMatch) {
    return `/blog/${decodeURIComponent(blogMatch[1])}`;
  }

  return null;
}

export default function StandaloneExportFrame({ sourcePath }: StandaloneExportFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let cleanupListeners: Array<() => void> = [];

    const syncHeight = () => {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      const nextHeight = Math.max(
        doc.documentElement.scrollHeight,
        doc.body.scrollHeight,
        doc.documentElement.offsetHeight,
        doc.body.offsetHeight,
      );

      iframe.style.height = `${Math.max(nextHeight, window.innerHeight)}px`;
    };

    const navigateParent = (targetPath: string) => {
      if (window.location.pathname === targetPath) {
        return;
      }

      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const handleLoad = () => {
      const frameWindow = iframe.contentWindow;
      const doc = iframe.contentDocument;

      if (!frameWindow || !doc) {
        return;
      }

      cleanupListeners.forEach((cleanup) => cleanup());
      cleanupListeners = [];
      resizeObserver?.disconnect();
      resizeObserver = null;
      mutationObserver?.disconnect();
      mutationObserver = null;

      const interceptLink = (event: MouseEvent) => {
        if (event.defaultPrevented) {
          return;
        }

        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        const anchor = target.closest('a[href]');
        if (!(anchor instanceof HTMLAnchorElement)) {
          return;
        }

        if (anchor.target && anchor.target !== '_self') {
          return;
        }

        const url = new URL(anchor.href, frameWindow.location.href);
        if (url.origin !== window.location.origin) {
          return;
        }

        const appPath = mapExportPathToAppPath(url.pathname);
        if (!appPath) {
          return;
        }

        event.preventDefault();
        navigateParent(appPath);
      };

      doc.querySelectorAll('a[href]').forEach((node) => {
        if (!(node instanceof HTMLAnchorElement)) {
          return;
        }

        const url = new URL(node.href, frameWindow.location.href);
        if (url.origin !== window.location.origin) {
          return;
        }

        const appPath = mapExportPathToAppPath(url.pathname);
        if (!appPath) {
          return;
        }

        node.href = appPath;
        node.target = '_top';
      });

      doc.addEventListener('click', interceptLink, true);
      cleanupListeners.push(() => doc.removeEventListener('click', interceptLink, true));

      frameWindow.addEventListener('resize', syncHeight);
      cleanupListeners.push(() => frameWindow.removeEventListener('resize', syncHeight));

      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(syncHeight);
        resizeObserver.observe(doc.documentElement);
        resizeObserver.observe(doc.body);
      } else {
        mutationObserver = new MutationObserver(syncHeight);
        mutationObserver.observe(doc.documentElement, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }

      syncHeight();
      setTimeout(syncHeight, 250);
      setTimeout(syncHeight, 1000);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      cleanupListeners.forEach((cleanup) => cleanup());
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [sourcePath]);

  return (
    <iframe
      ref={iframeRef}
      src={sourcePath}
      title="Standalone export"
      style={{
        width: '100%',
        minHeight: '100vh',
        border: '0',
        display: 'block',
        background: '#000',
      }}
    />
  );
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './country-flags-overlay.css';

type CountryCode = 'india' | 'usa' | 'uae';

type CountryFlagsOverlayProps = {
  rootRef: { current: HTMLElement | null };
  imageSelector: string;
  ariaLabel: string;
  position: { left: number; top: number; width: number; height: number };
  variant?: 'pill' | 'map';
};

function CountryFlag({ country }: { country: CountryCode }) {
  const clipId = `country-flag-${country}`;

  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`${country.toUpperCase()} flag`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {country === 'india' ? (
          <>
            <rect width="100" height="34" fill="#ff9933" />
            <rect y="34" width="100" height="32" fill="#fff" />
            <rect y="66" width="100" height="34" fill="#138808" />
            <circle cx="50" cy="50" r="11" fill="none" stroke="#000080" strokeWidth="3" />
            <circle cx="50" cy="50" r="3" fill="#000080" />
            {Array.from({ length: 12 }, (_, index) => {
              const angle = (index * Math.PI) / 6;
              return (
                <line
                  key={index}
                  x1={50 + Math.cos(angle) * 3}
                  y1={50 + Math.sin(angle) * 3}
                  x2={50 + Math.cos(angle) * 10}
                  y2={50 + Math.sin(angle) * 10}
                  stroke="#000080"
                  strokeWidth="1.4"
                />
              );
            })}
          </>
        ) : null}
        {country === 'usa' ? (
          <>
            {Array.from({ length: 13 }, (_, index) => (
              <rect
                key={index}
                y={index * (100 / 13)}
                width="100"
                height={100 / 13 + 0.2}
                fill={index % 2 === 0 ? '#b22234' : '#fff'}
              />
            ))}
            <rect width="46" height="54" fill="#3c3b6e" />
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 6 }, (_, column) => (
                <circle key={`${row}-${column}`} cx={5 + column * 7} cy={5 + row * 10} r="1.25" fill="#fff" />
              )),
            )}
          </>
        ) : null}
        {country === 'uae' ? (
          <>
            <rect x="25" width="75" height="34" fill="#00732f" />
            <rect x="25" y="34" width="75" height="32" fill="#fff" />
            <rect x="25" y="66" width="75" height="34" fill="#000" />
            <rect width="25" height="100" fill="#ff0000" />
          </>
        ) : null}
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
    </svg>
  );
}

export default function CountryFlagsOverlay({
  rootRef,
  imageSelector,
  ariaLabel,
  position,
  variant = 'pill',
}: CountryFlagsOverlayProps) {
  const [mount, setMount] = useState<{
    target: HTMLDivElement;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const image = rootRef.current?.querySelector<HTMLImageElement>(imageSelector);
    const target = image?.parentElement;

    if (!(image instanceof HTMLImageElement) || !(target instanceof HTMLDivElement)) {
      return undefined;
    }

    const updateSize = () => {
      if (!target.clientWidth || !target.clientHeight) {
        return;
      }

      const naturalWidth = image.naturalWidth || target.clientWidth;
      const naturalHeight = image.naturalHeight || target.clientHeight;
      const scale = Math.max(target.clientWidth / naturalWidth, target.clientHeight / naturalHeight);
      const width = naturalWidth * scale;
      const height = naturalHeight * scale;

      setMount((current) =>
        current &&
        current.target === target &&
        Math.abs(current.width - width) < 0.5 &&
        Math.abs(current.height - height) < 0.5
          ? current
          : { target, width, height },
      );
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(target);
    image.addEventListener('load', updateSize);
    updateSize();

    return () => {
      observer.disconnect();
      image.removeEventListener('load', updateSize);
    };
  }, [imageSelector, rootRef]);

  if (!mount) {
    return null;
  }

  const positionStyle = {
    left: `${position.left}%`,
    top: `${position.top}%`,
    width: `${position.width}%`,
    height: `${position.height}%`,
  };

  return createPortal(
    <div className="country-flags-overlay-stage" style={{ width: mount.width, height: mount.height }}>
      {variant === 'map' ? (
        <div className="country-map-card" aria-label={ariaLabel} style={positionStyle}>
          <div className="country-map-card__canvas">
            <img className="country-map-card__world" src="/world-countries.svg" alt="" aria-hidden="true" />
            <CountryMapMarker country="usa" className="country-map-marker--usa" />
            <CountryMapMarker country="uae" className="country-map-marker--uae" />
            <CountryMapMarker country="india" className="country-map-marker--india" />
          </div>
        </div>
      ) : (
        <div className="country-flags-overlay-pill" aria-label={ariaLabel} style={positionStyle}>
          <CountryFlag country="india" />
          <CountryFlag country="usa" />
          <CountryFlag country="uae" />
        </div>
      )}
    </div>,
    mount.target,
  );
}

function CountryMapMarker({
  country,
  className,
}: {
  country: CountryCode;
  className: string;
}) {
  const label = country === 'usa' ? 'USA' : country === 'uae' ? 'UAE' : 'India';

  return (
    <div className={`country-map-marker ${className}`}>
      <span className="country-map-marker__label">
        <CountryFlag country={country} />
        <span>{label}</span>
      </span>
      <span className="country-map-marker__pin" />
    </div>
  );
}

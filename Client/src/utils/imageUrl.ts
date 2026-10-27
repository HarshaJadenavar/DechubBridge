const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function resolveImageUrl(value?: string | null): string {
  const imageUrl = value?.trim();
  if (!imageUrl) return '';

  if (/^(blob:|data:|https?:\/\/)/i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads/')) {
    return `${trimTrailingSlash(API_BASE)}${imageUrl}`;
  }

  if (/^(localhost|127\.0\.0\.1):/i.test(imageUrl)) {
    return `http://${imageUrl}`;
  }

  return imageUrl;
}

export function imageBackground(value?: string | null): string | undefined {
  const imageUrl = resolveImageUrl(value);
  return imageUrl ? `url("${imageUrl}")` : undefined;
}

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'public/world-countries.geojson');
const target = resolve(root, 'public/world-countries.svg');
const { features } = JSON.parse(await readFile(source, 'utf8'));

const ringPath = (ring) => {
  const points = ring.map(([longitude, latitude]) => {
    const x = ((longitude + 180) / 360) * 1000;
    const y = ((90 - latitude) / 180) * 500;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return points.length ? `M${points.join(' L')} Z` : '';
};

const paths = features.flatMap((feature) => {
  const geometry = feature.geometry;
  if (!geometry) return [];
  const polygons = geometry.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  const d = polygons.flatMap((polygon) => polygon.map(ringPath)).join(' ');
  if (!d) return [];
  const name = String(feature.properties.ADMIN ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return [`<path data-country="${name}" d="${d}"/>`];
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" role="img" aria-label="World map with country boundaries" preserveAspectRatio="none">
<rect width="1000" height="500" fill="#f3edff"/>
<g fill="#c7b5f5" stroke="#fff" stroke-width="1.35" stroke-linejoin="round" fill-rule="evenodd">
${paths.join('\n')}
</g>
</svg>
`;
await writeFile(target, svg, 'utf8');
console.log(`Wrote ${target} (${paths.length} country shapes)`);

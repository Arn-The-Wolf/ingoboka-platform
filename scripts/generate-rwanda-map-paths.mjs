/**
 * Projects geoBoundaries RWA ADM1/ADM2 GeoJSON into SVG path data
 * for viewBox "0 0 100 80".
 *
 * Source: https://www.geoboundaries.org (gbOpen, CC BY 4.0)
 * Input: public/geo/rwanda-{provinces,districts}.geojson
 * Output: src/data/geo/rwanda-map-paths.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const provinces = JSON.parse(
  fs.readFileSync(path.join(root, 'public/geo/rwanda-provinces.geojson'), 'utf8')
);
const districts = JSON.parse(
  fs.readFileSync(path.join(root, 'public/geo/rwanda-districts.geojson'), 'utf8')
);

const PROVINCE_BY_NAME = {
  'City of Kigali': 'KV',
  'Southern Province': 'SP',
  'Western Province': 'WP',
  'Northern Province': 'NP',
  'Eastern Province': 'EP',
};

const DISTRICT_BY_NAME = {
  Nyarugenge: 'KV-NYA',
  Gasabo: 'KV-GAS',
  Kicukiro: 'KV-KIC',
  Nyanza: 'SP-NYA',
  Gisagara: 'SP-GIS',
  Nyaruguru: 'SP-NYR',
  Huye: 'SP-HUY',
  Nyamagabe: 'SP-NYM',
  Ruhango: 'SP-RUH',
  Muhanga: 'SP-MUH',
  Kamonyi: 'SP-KAM',
  Karongi: 'WP-KAR',
  Rutsiro: 'WP-RUT',
  Rubavu: 'WP-RUB',
  Nyabihu: 'WP-NYB',
  Ngororero: 'WP-NGO',
  Rusizi: 'WP-RUS',
  Nyamasheke: 'WP-NYS',
  Rulindo: 'NP-RUL',
  Gakenke: 'NP-GAK',
  Musanze: 'NP-MUS',
  Burera: 'NP-BUR',
  Gicumbi: 'NP-GIC',
  Rwamagana: 'EP-RWA',
  Nyagatare: 'EP-NYA',
  Gatsibo: 'EP-GAT',
  Kayonza: 'EP-KAY',
  Kirehe: 'EP-KIR',
  Ngoma: 'EP-NGO',
  Bugesera: 'EP-BUG',
};

const DISTRICT_PROVINCE = {
  'KV-NYA': 'KV',
  'KV-GAS': 'KV',
  'KV-KIC': 'KV',
  'SP-NYA': 'SP',
  'SP-GIS': 'SP',
  'SP-NYR': 'SP',
  'SP-HUY': 'SP',
  'SP-NYM': 'SP',
  'SP-RUH': 'SP',
  'SP-MUH': 'SP',
  'SP-KAM': 'SP',
  'WP-KAR': 'WP',
  'WP-RUT': 'WP',
  'WP-RUB': 'WP',
  'WP-NYB': 'WP',
  'WP-NGO': 'WP',
  'WP-RUS': 'WP',
  'WP-NYS': 'WP',
  'NP-RUL': 'NP',
  'NP-GAK': 'NP',
  'NP-MUS': 'NP',
  'NP-BUR': 'NP',
  'NP-GIC': 'NP',
  'EP-RWA': 'EP',
  'EP-NYA': 'EP',
  'EP-GAT': 'EP',
  'EP-KAY': 'EP',
  'EP-KIR': 'EP',
  'EP-NGO': 'EP',
  'EP-BUG': 'EP',
};

function ringBBox(ring, bb) {
  for (const [x, y] of ring) {
    if (x < bb[0]) bb[0] = x;
    if (y < bb[1]) bb[1] = y;
    if (x > bb[2]) bb[2] = x;
    if (y > bb[3]) bb[3] = y;
  }
}

function geomBBox(g, bb) {
  if (g.type === 'Polygon') g.coordinates.forEach((r) => ringBBox(r, bb));
  else if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => p.forEach((r) => ringBBox(r, bb)));
}

const bb = [Infinity, Infinity, -Infinity, -Infinity];
provinces.features.forEach((f) => geomBBox(f.geometry, bb));

const pad = 0.02;
const west = bb[0] - pad;
const south = bb[1] - pad;
const east = bb[2] + pad;
const north = bb[3] + pad;
const W = 100;
const H = 80;
const aspect = (east - west) / (north - south);
let vw = W;
let vh = H;
let ox = 0;
let oy = 0;
if (aspect > W / H) {
  vh = W / aspect;
  oy = (H - vh) / 2;
} else {
  vw = H * aspect;
  ox = (W - vw) / 2;
}

function project(lon, lat) {
  const x = ox + ((lon - west) / (east - west)) * vw;
  const y = oy + ((north - lat) / (north - south)) * vh;
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

function ringPath(ring) {
  return (
    ring
      .map((c, i) => {
        const [x, y] = project(c[0], c[1]);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join('') + 'Z'
  );
}

function geomPath(g) {
  if (g.type === 'Polygon') return g.coordinates.map(ringPath).join('');
  if (g.type === 'MultiPolygon') {
    return g.coordinates.map((poly) => poly.map(ringPath).join('')).join('');
  }
  return '';
}

function centroid(g) {
  let bestA = 0;
  let cx = 0;
  let cy = 0;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    const ring = poly[0];
    let a = 0;
    let x = 0;
    let y = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x0, y0] = project(ring[j][0], ring[j][1]);
      const [x1, y1] = project(ring[i][0], ring[i][1]);
      const f = x0 * y1 - x1 * y0;
      a += f;
      x += (x0 + x1) * f;
      y += (y0 + y1) * f;
    }
    a *= 0.5;
    if (Math.abs(a) > Math.abs(bestA)) {
      bestA = a;
      cx = x / (6 * a || 1);
      cy = y / (6 * a || 1);
    }
  }
  return [Math.round(cx * 10) / 10, Math.round(cy * 10) / 10];
}

const outProvinces = provinces.features.map((f) => {
  const code = PROVINCE_BY_NAME[f.properties.shapeName];
  if (!code) throw new Error(`Unknown province ${f.properties.shapeName}`);
  return {
    code,
    name: f.properties.shapeName,
    path: geomPath(f.geometry),
    label: centroid(f.geometry),
  };
});

const outDistricts = districts.features.map((f) => {
  const code = DISTRICT_BY_NAME[f.properties.shapeName];
  if (!code) throw new Error(`Unknown district ${f.properties.shapeName}`);
  return {
    code,
    name: f.properties.shapeName,
    provinceCode: DISTRICT_PROVINCE[code],
    path: geomPath(f.geometry),
    label: centroid(f.geometry),
  };
});

const header = `/**
 * Pre-projected SVG paths for Rwanda admin boundaries.
 *
 * Source: geoBoundaries (wmgeolab) — gbOpen RWA ADM1/ADM2 simplified GeoJSON
 * https://www.geoboundaries.org
 * HDX: https://data.humdata.org/dataset/geoboundaries-admin-boundaries-for-rwanda
 * License: CC BY 4.0
 *
 * Generated for viewBox 0 0 100 80 (equirectangular fit).
 * Regenerate: node scripts/generate-rwanda-map-paths.mjs
 */

`;

const body = `export const RWANDA_MAP_VIEWBOX = '0 0 100 80' as const;

export interface RwandaMapFeature {
  code: string;
  name: string;
  path: string;
  label: [number, number];
}

export interface RwandaDistrictMapFeature extends RwandaMapFeature {
  provinceCode: string;
}

export const RWANDA_PROVINCE_PATHS: RwandaMapFeature[] = ${JSON.stringify(outProvinces, null, 2)};

export const RWANDA_DISTRICT_PATHS: RwandaDistrictMapFeature[] = ${JSON.stringify(outDistricts, null, 2)};
`;

const outDir = path.join(root, 'src/data/geo');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'rwanda-map-paths.ts');
fs.writeFileSync(outFile, header + body);

console.log(`Wrote ${outProvinces.length} provinces, ${outDistricts.length} districts`);
console.log(`File size: ${fs.statSync(outFile).size} bytes → ${outFile}`);

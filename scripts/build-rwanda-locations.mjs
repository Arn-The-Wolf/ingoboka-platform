/**
 * Builds a compact nested Rwanda address tree from rwanda-geo embedded data.
 * Source: npm package rwanda-geo (NISR administrative divisions).
 *
 * Output: src/data/rwanda-locations.json
 * Shape: { [province]: { [district]: { [sector]: { [cell]: string[] } } } }
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EMBEDDED = path.join(
  process.env.TEMP || '/tmp',
  'rwanda-geo-pkg',
  'package',
  'src',
  'data-embedded'
);

/** Align rwanda-geo province labels with existing app naming in rwanda-geo.ts */
const PROVINCE_DISPLAY = {
  'Kigali City': 'City of Kigali',
  'Kigali': 'City of Kigali',
  'Southern': 'Southern Province',
  'Western': 'Western Province',
  'Northern': 'Northern Province',
  'Eastern': 'Eastern Province',
  'South': 'Southern Province',
  'West': 'Western Province',
  'North': 'Northern Province',
  'East': 'Eastern Province',
};

function loadEmbedded(filename) {
  const raw = fs.readFileSync(path.join(EMBEDDED, filename), 'utf8');
  const match = raw.match(/export default "([^"]+)"/);
  if (!match) throw new Error(`No embedded payload in ${filename}`);
  const json = zlib.gunzipSync(Buffer.from(match[1], 'base64')).toString('utf8');
  return JSON.parse(json);
}

function displayProvince(name) {
  return PROVINCE_DISPLAY[name] ?? name;
}

function main() {
  const provinces = loadEmbedded('provinces.js');
  const districts = loadEmbedded('districts.js');
  const sectors = loadEmbedded('sectors.js');
  const cells = loadEmbedded('cells.js');
  const villages = loadEmbedded('villages.js');

  console.log('Loaded counts:', {
    provinces: provinces.length,
    districts: districts.length,
    sectors: sectors.length,
    cells: cells.length,
    villages: villages.length,
  });
  console.log('Sample province:', provinces[0]);
  console.log('Sample district:', districts[0]);
  console.log('Sample sector:', sectors[0]);
  console.log('Sample cell:', cells[0]);
  console.log('Sample village:', villages[0]);

  const provinceByCode = new Map(provinces.map((p) => [p.code, displayProvince(p.name)]));
  const districtByCode = new Map(districts.map((d) => [d.code, d]));
  const sectorByCode = new Map(sectors.map((s) => [s.code, s]));
  const cellByCode = new Map(cells.map((c) => [c.code, c]));

  /** @type {Record<string, Record<string, Record<string, Record<string, string[]>>>>} */
  const tree = {};

  for (const village of villages) {
    const cell = cellByCode.get(village.parentCode);
    if (!cell) continue;
    const sector = sectorByCode.get(cell.parentCode);
    if (!sector) continue;
    const district = districtByCode.get(sector.parentCode);
    if (!district) continue;
    const provinceName = provinceByCode.get(district.parentCode);
    if (!provinceName) continue;

    const districtName = district.name;
    const sectorName = sector.name;
    const cellName = cell.name;

    tree[provinceName] ??= {};
    tree[provinceName][districtName] ??= {};
    tree[provinceName][districtName][sectorName] ??= {};
    tree[provinceName][districtName][sectorName][cellName] ??= [];
    tree[provinceName][districtName][sectorName][cellName].push(village.name);
  }

  // Sort everything for stable diffs / predictable dropdowns
  const sorted = {};
  for (const province of Object.keys(tree).sort()) {
    sorted[province] = {};
    for (const district of Object.keys(tree[province]).sort()) {
      sorted[province][district] = {};
      for (const sector of Object.keys(tree[province][district]).sort()) {
        sorted[province][district][sector] = {};
        for (const cell of Object.keys(tree[province][district][sector]).sort()) {
          sorted[province][district][sector][cell] = [
            ...new Set(tree[province][district][sector][cell]),
          ].sort();
        }
      }
    }
  }

  const outDir = path.join(ROOT, 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'rwanda-locations.json');
  fs.writeFileSync(outPath, JSON.stringify(sorted));

  const provinceCount = Object.keys(sorted).length;
  const districtCount = Object.values(sorted).reduce((n, d) => n + Object.keys(d).length, 0);
  let sectorCount = 0;
  let cellCount = 0;
  let villageCount = 0;
  for (const districtsMap of Object.values(sorted)) {
    for (const sectorsMap of Object.values(districtsMap)) {
      sectorCount += Object.keys(sectorsMap).length;
      for (const cellsMap of Object.values(sectorsMap)) {
        cellCount += Object.keys(cellsMap).length;
        for (const villagesList of Object.values(cellsMap)) {
          villageCount += villagesList.length;
        }
      }
    }
  }

  const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
  console.log('Wrote', outPath);
  console.log({ provinceCount, districtCount, sectorCount, cellCount, villageCount, sizeKb });
}

main();

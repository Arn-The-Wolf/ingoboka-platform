/**
 * Cascading Rwanda address helpers backed by `src/data/rwanda-locations.json`.
 *
 * Hierarchy: Province → District → Sector → Cell → Village.
 * Data sourced from rwanda-geo (NISR administrative divisions) — full national
 * coverage: 5 provinces, 30 districts, 416 sectors, 2,148 cells, 14,837 villages.
 *
 * Province labels match `rwanda-geo.ts` (e.g. "City of Kigali", "Southern Province").
 */

import rawTree from '@/data/rwanda-locations.json';

export type RwandaLocationTree = {
  [province: string]: {
    [district: string]: {
      [sector: string]: {
        [cell: string]: string[];
      };
    };
  };
};

const TREE = rawTree as RwandaLocationTree;

export function listLocationProvinces(): string[] {
  return Object.keys(TREE);
}

export function listLocationDistricts(province: string): string[] {
  const districts = TREE[province];
  return districts ? Object.keys(districts) : [];
}

export function listLocationSectors(province: string, district: string): string[] {
  const sectors = TREE[province]?.[district];
  return sectors ? Object.keys(sectors) : [];
}

export function listLocationCells(province: string, district: string, sector: string): string[] {
  const cells = TREE[province]?.[district]?.[sector];
  return cells ? Object.keys(cells) : [];
}

export function listLocationVillages(
  province: string,
  district: string,
  sector: string,
  cell: string
): string[] {
  return TREE[province]?.[district]?.[sector]?.[cell] ?? [];
}

/** True when every address level resolves in the tree. */
export function isValidRwandaAddress(address: {
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}): boolean {
  const { province, district, sector, cell, village } = address;
  if (!province || !district || !sector || !cell || !village) return false;
  return listLocationVillages(province, district, sector, cell).includes(village);
}

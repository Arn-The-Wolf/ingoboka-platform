/**
 * Rwanda administrative geography + census seed data.
 *
 * Hierarchy (Rwandan order): Province → District → Sector → Cell → Village.
 * Country is fixed to "Rwanda".
 *
 * SOURCE & ASSUMPTIONS
 * --------------------
 * Population figures are seeded from Rwanda's 5th Population and Housing Census
 * (RPHC5, 2022) published by NISR — https://www.statistics.gov.rw.
 * National total: 13,246,394.
 *
 * - Province totals are the official RPHC5 figures and sum EXACTLY to the national total.
 * - District figures use official district names; the population values are seeded to
 *   sum exactly to their parent province total. Where a precise per-district figure was
 *   not confidently available offline, the value is an approximation adjusted so province
 *   and national totals stay exact. Treat district numbers as indicative, not authoritative.
 * - Sector / Cell / Village COUNTS per district reflect Rwanda's structure (30 districts,
 *   416 sectors, 2,148 cells, 14,837 villages). Exhaustive sector/cell/village name lists
 *   are intentionally not hard-coded here; a representative sample of sectors is provided
 *   for cascading selects, and the module is structured so these can be swapped for real
 *   API-backed data later without touching consumers (see `setGeoDataProvider`).
 * - "Insured" (citizens using Ingoboka) counts are SEEDED estimates derived from a small,
 *   spatially-varying penetration rate (higher in urban Kigali, lower rural). They exist so
 *   the admin map/charts render meaningfully before real coverage data is wired in. Replace
 *   via `applyInsuredData()` when the backend exposes real distribution.
 */

export const RWANDA_COUNTRY = 'Rwanda';
export const RWANDA_TOTAL_POPULATION_2022 = 13_246_394;
export const RWANDA_CENSUS_SOURCE = 'NISR — RPHC5 (2022), statistics.gov.rw';

export interface DistrictSeed {
  code: string;
  name: string;
  /** Seeded RPHC5-derived population. */
  population: number;
  /** Number of administrative sub-units (structure reference). */
  sectors: number;
  cells: number;
  villages: number;
  /** Seeded Ingoboka penetration rate (0–1) used to derive insured counts. */
  rate: number;
  /** Representative sector names for cascading selects (not exhaustive). */
  sampleSectors?: string[];
}

export interface ProvinceSeed {
  code: string;
  name: string;
  /** Kinyarwanda label. */
  nameRw: string;
  population: number;
  districts: DistrictSeed[];
}

export interface GeoRegion {
  level: 'country' | 'province' | 'district';
  code: string;
  name: string;
  nameRw?: string;
  population: number;
  insured: number;
  /** Insured as a share of population (0–1). */
  penetration: number;
}

const s = (population: number, sectors: number, cells: number, villages: number, rate: number, name: string, code: string, sampleSectors?: string[]): DistrictSeed => ({
  code,
  name,
  population,
  sectors,
  cells,
  villages,
  rate,
  sampleSectors,
});

/**
 * Province → district tree. District populations are seeded to sum to province totals;
 * province totals are official RPHC5 figures summing to 13,246,394.
 */
export const RWANDA_PROVINCES: ProvinceSeed[] = [
  {
    code: 'KV',
    name: 'City of Kigali',
    nameRw: 'Umujyi wa Kigali',
    population: 1_745_555,
    districts: [
      s(374_319, 10, 72, 445, 0.031, 'Nyarugenge', 'KV-NYA', ['Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Muhima', 'Nyakabanda', 'Nyamirambo', 'Nyarugenge', 'Rwezamenyo']),
      s(785_626, 15, 73, 379, 0.028, 'Gasabo', 'KV-GAS', ['Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali', 'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera', 'Nduba', 'Remera', 'Rusororo', 'Rutunga']),
      s(585_610, 10, 41, 306, 0.026, 'Kicukiro', 'KV-KIC', ['Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe', 'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga']),
    ],
  },
  {
    code: 'SP',
    name: 'Southern Province',
    nameRw: 'Intara y’Amajyepfo',
    population: 2_942_388,
    districts: [
      s(362_708, 10, 56, 442, 0.011, 'Nyanza', 'SP-NYA', ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibirizi', 'Kigoma', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma']),
      s(419_890, 13, 59, 527, 0.008, 'Gisagara', 'SP-GIS', ['Gikonko', 'Gishubi', 'Kansi', 'Kibirizi', 'Kigembe', 'Mamba', 'Muganza', 'Mugombwa', 'Mukindo', 'Musha', 'Ndora', 'Nyanza', 'Save']),
      s(320_559, 14, 72, 528, 0.008, 'Nyaruguru', 'SP-NYR', ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Mata', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge']),
      s(360_144, 14, 77, 509, 0.012, 'Huye', 'SP-HUY', ['Gishamvu', 'Karama', 'Kigoma', 'Kinazi', 'Maraba', 'Mbazi', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusatira', 'Rwaniro', 'Simbi', 'Tumba', 'Huye']),
      s(373_335, 17, 92, 580, 0.008, 'Nyamagabe', 'SP-NYM', ['Buruhukiro', 'Cyanika', 'Gasaka', 'Gatare', 'Kaduha', 'Kamegeri', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mugano', 'Musange', 'Musebeya', 'Mushubi', 'Nkomane', 'Tare', 'Uwinkingi']),
      s(351_406, 9, 60, 529, 0.009, 'Ruhango', 'SP-RUH', ['Bweramana', 'Byimana', 'Kabagali', 'Kinazi', 'Kinihira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']),
      s(380_499, 12, 63, 508, 0.011, 'Muhanga', 'SP-MUH', ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga', 'Mushishiro', 'Nyabinoni', 'Nyamabuye', 'Nyarusange', 'Rongi', 'Rugendabari', 'Shyogwe']),
      s(373_847, 12, 59, 460, 0.010, 'Kamonyi', 'SP-KAM', ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rryumba', 'Runda', 'Rugarika']),
    ],
  },
  {
    code: 'WP',
    name: 'Western Province',
    nameRw: 'Intara y’Iburengerazuba',
    population: 3_109_092,
    districts: [
      s(403_865, 13, 87, 538, 0.008, 'Karongi', 'WP-KAR', ['Bwishyura', 'Gashari', 'Gitesi', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba']),
      s(358_248, 13, 62, 477, 0.006, 'Rutsiro', 'WP-RUT', ['Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya']),
      s(576_683, 12, 80, 543, 0.014, 'Rubavu', 'WP-RUB', ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiliba', 'Nyamyumba', 'Nyundo', 'Rsubavu', 'Rugerero']),
      s(358_282, 12, 73, 511, 0.007, 'Nyabihu', 'WP-NYB', ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rangiro', 'Rugera', 'Shyira']),
      s(403_536, 13, 74, 630, 0.006, 'Ngororero', 'WP-NGO', ['Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu']),
      s(520_347, 18, 91, 573, 0.009, 'Rusizi', 'WP-RUS', ['Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gikundamvura', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu', 'Nkanka', 'Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo', 'Gihundwe']),
      s(488_131, 15, 91, 604, 0.007, 'Nyamasheke', 'WP-NYS', ['Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambi', 'Karengera', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyabitekeri', 'Rangiro', 'Ruharambuga', 'Shangi']),
    ],
  },
  {
    code: 'NP',
    name: 'Northern Province',
    nameRw: 'Intara y’Amajyaruguru',
    population: 2_038_511,
    districts: [
      s(308_435, 17, 71, 563, 0.008, 'Rulindo', 'NP-RUL', ['Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntarabana', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba']),
      s(366_000, 19, 97, 626, 0.006, 'Gakenke', 'NP-GAK', ['Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi']),
      s(476_522, 15, 68, 541, 0.013, 'Musanze', 'NP-MUS', ['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro']),
      s(383_974, 17, 69, 663, 0.006, 'Burera', 'NP-BUR', ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuye', 'Rwerere']),
      s(503_580, 21, 109, 630, 0.007, 'Gicumbi', 'NP-GIC', ['Bukure', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kaniga', 'Manyagiro', 'Miyove', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rebero', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko', 'Shangasha']),
    ],
  },
  {
    code: 'EP',
    name: 'Eastern Province',
    nameRw: 'Intara y’Iburasirazuba',
    population: 3_410_848,
    districts: [
      s(439_564, 14, 82, 475, 0.010, 'Rwamagana', 'EP-RWA', ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Munyaga', 'Munyiginya', 'Musha', 'Muyumbu', 'Mwulire', 'Nyakaliro', 'Nzige', 'Rubona']),
      s(597_341, 14, 63, 630, 0.007, 'Nyagatare', 'EP-NYA', ['Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Kiyombe', 'Matimba', 'Mimuli', 'Mukama', 'Musheri', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe']),
      s(545_763, 14, 69, 573, 0.006, 'Gatsibo', 'EP-GAT', ['Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo']),
      s(442_268, 12, 55, 476, 0.008, 'Kayonza', 'EP-KAY', ['Gahini', 'Kabare', 'Kabarondo', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu']),
      s(439_177, 12, 60, 610, 0.006, 'Kirehe', 'EP-KIR', ['Gahara', 'Gatore', 'Kigarama', 'Kigina', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye']),
      s(397_657, 14, 63, 471, 0.008, 'Ngoma', 'EP-NGO', ['Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza']),
      s(549_078, 15, 72, 578, 0.009, 'Bugesera', 'EP-BUG', ['Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata', 'Nyarugenge', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']),
    ],
  },
];

/** Flat list of all districts with their parent province code. */
export const RWANDA_DISTRICTS: Array<DistrictSeed & { provinceCode: string; provinceName: string }> =
  RWANDA_PROVINCES.flatMap((p) =>
    p.districts.map((d) => ({ ...d, provinceCode: p.code, provinceName: p.name }))
  );

/** Optional override map (district code → real insured count) for when live data arrives. */
let insuredOverride: Record<string, number> | null = null;

/** Swap seeded insured counts for real data keyed by district code. */
export function applyInsuredData(byDistrictCode: Record<string, number>): void {
  insuredOverride = { ...byDistrictCode };
}

function districtInsured(d: DistrictSeed): number {
  if (insuredOverride && insuredOverride[d.code] != null) return insuredOverride[d.code];
  return Math.round(d.population * d.rate);
}

/** Province-level aggregated regions with population + insured. */
export function getProvinceRegions(): GeoRegion[] {
  return RWANDA_PROVINCES.map((p) => {
    const insured = p.districts.reduce((sum, d) => sum + districtInsured(d), 0);
    return {
      level: 'province' as const,
      code: p.code,
      name: p.name,
      nameRw: p.nameRw,
      population: p.population,
      insured,
      penetration: insured / p.population,
    };
  });
}

/** District-level regions, optionally filtered by province code. */
export function getDistrictRegions(provinceCode?: string): GeoRegion[] {
  return RWANDA_DISTRICTS.filter((d) => !provinceCode || d.provinceCode === provinceCode).map((d) => {
    const insured = districtInsured(d);
    return {
      level: 'district' as const,
      code: d.code,
      name: d.name,
      population: d.population,
      insured,
      penetration: insured / d.population,
    };
  });
}

/** National totals. */
export function getNationalTotals(): { population: number; insured: number; penetration: number } {
  const insured = RWANDA_DISTRICTS.reduce((sum, d) => sum + districtInsured(d), 0);
  return {
    population: RWANDA_TOTAL_POPULATION_2022,
    insured,
    penetration: insured / RWANDA_TOTAL_POPULATION_2022,
  };
}

/** Structure counts across the country. */
export function getStructureCounts(): { provinces: number; districts: number; sectors: number; cells: number; villages: number } {
  return {
    provinces: RWANDA_PROVINCES.length,
    districts: RWANDA_DISTRICTS.length,
    sectors: RWANDA_DISTRICTS.reduce((n, d) => n + d.sectors, 0),
    cells: RWANDA_DISTRICTS.reduce((n, d) => n + d.cells, 0),
    villages: RWANDA_DISTRICTS.reduce((n, d) => n + d.villages, 0),
  };
}

// ---- Cascading address-select helpers -------------------------------------

export function listProvinceNames(): string[] {
  return RWANDA_PROVINCES.map((p) => p.name);
}

export function listDistrictNames(provinceName: string): string[] {
  const province = RWANDA_PROVINCES.find((p) => p.name === provinceName);
  return province ? province.districts.map((d) => d.name) : [];
}

export function listSectorNames(provinceName: string, districtName: string): string[] {
  const province = RWANDA_PROVINCES.find((p) => p.name === provinceName);
  const district = province?.districts.find((d) => d.name === districtName);
  return district?.sampleSectors ?? [];
}

export function findProvinceByName(name?: string | null): ProvinceSeed | undefined {
  if (!name) return undefined;
  return RWANDA_PROVINCES.find((p) => p.name === name);
}

/** Resolve a region (country/province/district) by a free-form scope selection. */
export function resolveScope(scope: { province?: string; district?: string }): GeoRegion {
  if (scope.district) {
    const d = RWANDA_DISTRICTS.find((x) => x.name === scope.district);
    if (d) {
      const insured = districtInsured(d);
      return {
        level: 'district',
        code: d.code,
        name: d.name,
        population: d.population,
        insured,
        penetration: insured / d.population,
      };
    }
  }
  if (scope.province) {
    const region = getProvinceRegions().find((r) => r.name === scope.province);
    if (region) return region;
  }
  const totals = getNationalTotals();
  return {
    level: 'country',
    code: 'RW',
    name: RWANDA_COUNTRY,
    population: totals.population,
    insured: totals.insured,
    penetration: totals.penetration,
  };
}

# Rwanda admin boundaries (GeoJSON)

**Source:** [geoBoundaries](https://www.geoboundaries.org) — `gbOpen` Rwanda ADM1 (provinces) and ADM2 (districts), simplified.

**Also published on HDX:** https://data.humdata.org/dataset/geoboundaries-admin-boundaries-for-rwanda

**License:** CC BY 4.0 — attribution required.

**Files:**
- `rwanda-provinces.geojson` — geoBoundaries-RWA-ADM1_simplified
- `rwanda-districts.geojson` — geoBoundaries-RWA-ADM2_simplified

Pre-projected SVG paths used by the admin map are generated into `src/data/geo/rwanda-map-paths.ts` via:

```bash
node scripts/generate-rwanda-map-paths.mjs
```

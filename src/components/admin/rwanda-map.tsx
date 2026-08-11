'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react';
import {
  RWANDA_CENSUS_SOURCE,
  getDistrictRegions,
  getNationalTotals,
  getProvinceRegions,
  type GeoRegion,
} from '@/lib/rwanda-geo';
import {
  RWANDA_DISTRICT_PATHS,
  RWANDA_MAP_VIEWBOX,
  RWANDA_PROVINCE_PATHS,
} from '@/data/geo/rwanda-map-paths';
import { cn } from '@/lib/utils';

const numberFmt = (v: number) => new Intl.NumberFormat('en-US').format(v);
const pctFmt = (v: number) => `${(v * 100).toFixed(2)}%`;

/** Blend a blue choropleth fill from penetration (relative to the max in scope). */
function fillFor(penetration: number, max: number): string {
  const ratio = max > 0 ? Math.min(1, penetration / max) : 0;
  const from = [232, 240, 248];
  const to = [11, 58, 110];
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * (0.15 + 0.85 * ratio)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function shortProvinceLabel(code: string, name: string): string {
  if (code === 'KV') return 'Kigali';
  return name.replace(' Province', '');
}

export function RwandaMap({ className }: { className?: string }) {
  const t = useTranslations('admin');
  const [selected, setSelected] = useState<string | null>(null);

  const provinces = useMemo(() => getProvinceRegions(), []);
  const national = useMemo(() => getNationalTotals(), []);
  const maxPenetration = useMemo(
    () => Math.max(...provinces.map((p) => p.penetration)),
    [provinces]
  );

  const activeProvince = selected ? provinces.find((p) => p.code === selected) ?? null : null;
  const districts = useMemo<GeoRegion[]>(
    () => (selected ? getDistrictRegions(selected) : []),
    [selected]
  );

  const districtByCode = useMemo(() => {
    const map = new Map(districts.map((d) => [d.code, d]));
    return map;
  }, [districts]);

  const maxDistrictPenetration = useMemo(
    () => Math.max(0, ...districts.map((d) => d.penetration)),
    [districts]
  );

  const scope: GeoRegion = activeProvince ?? {
    level: 'country',
    code: 'RW',
    name: 'Rwanda',
    population: national.population,
    insured: national.insured,
    penetration: national.penetration,
  };

  const maxDistrictInsured = Math.max(1, ...districts.map((d) => d.insured));

  const districtShapes = useMemo(
    () => (selected ? RWANDA_DISTRICT_PATHS.filter((d) => d.provinceCode === selected) : []),
    [selected]
  );

  return (
    <div className={cn('portal-card min-w-0 animate-fade-in overflow-hidden p-4 sm:p-5', className)}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-brand-primary-dark">{t('mapTitle')}</h3>
        <p className="text-xs text-brand-muted">{t('mapSubtitle', { source: RWANDA_CENSUS_SOURCE })}</p>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden">
          <svg
            viewBox={RWANDA_MAP_VIEWBOX}
            className="h-auto w-full max-w-full"
            role="img"
            aria-label={t('mapTitle')}
          >
            {/* National context: other provinces stay visible (dimmed) when drilled into a province. */}
            {RWANDA_PROVINCE_PATHS.map((shape) => {
              const region = provinces.find((p) => p.code === shape.code);
              if (!region) return null;
              const isActive = selected === shape.code;
              const isDimmed = selected != null && !isActive;

              // When drilled into this province, districts replace its fill — keep only a light shell.
              if (isActive) {
                return (
                  <path
                    key={`shell-${shape.code}`}
                    d={shape.path}
                    fill="#F3F7F5"
                    stroke="#FDAA30"
                    strokeWidth={0.7}
                    className="pointer-events-none"
                  />
                );
              }

              return (
                <g
                  key={shape.code}
                  className="cursor-pointer"
                  onClick={() => setSelected((cur) => (cur === shape.code ? null : shape.code))}
                >
                  <path
                    d={shape.path}
                    fill={fillFor(region.penetration, maxPenetration)}
                    stroke="#ffffff"
                    strokeWidth={0.55}
                    className={cn(
                      'transition-all duration-300',
                      isDimmed ? 'opacity-35' : 'hover:opacity-90'
                    )}
                  />
                  {!selected && (
                    <text
                      x={shape.label[0]}
                      y={shape.label[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      style={{
                        fontSize: 2.8,
                        fontWeight: 700,
                        fill:
                          region.penetration / maxPenetration > 0.55 ? '#ffffff' : '#072A52',
                      }}
                    >
                      {shortProvinceLabel(shape.code, shape.name)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* District choropleth inside the selected province */}
            {districtShapes.map((shape) => {
              const region = districtByCode.get(shape.code);
              if (!region) return null;
              return (
                <g key={shape.code} className="pointer-events-none">
                  <path
                    d={shape.path}
                    fill={fillFor(region.penetration, maxDistrictPenetration || 1)}
                    stroke="#ffffff"
                    strokeWidth={0.35}
                    className="transition-all duration-300"
                  />
                  <text
                    x={shape.label[0]}
                    y={shape.label[1]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none"
                    style={{
                      fontSize: 1.55,
                      fontWeight: 600,
                      fill:
                        region.penetration / (maxDistrictPenetration || 1) > 0.55
                          ? '#ffffff'
                          : '#072A52',
                    }}
                  >
                    {shape.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-brand-muted">
            <span className="shrink-0">{t('penetration')}:</span>
            <div
              className="h-2 min-w-0 flex-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #E8F0F8, #0B3A6E)' }}
            />
            <span className="shrink-0">
              {t('nationalTotal')} {pctFmt(national.penetration)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-brand-muted">{t('mapHint')}</p>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-brand-muted">{t('scope')}</p>
              <p className="truncate text-lg font-bold text-brand-primary-dark">
                {scope.level === 'country' ? 'Rwanda' : scope.name}
              </p>
            </div>
            {activeProvince && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-border px-3 py-1 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary-light"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backToProvinces')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="min-w-0 rounded-lg border border-brand-border/60 bg-white p-3">
              <Users className="mb-1 h-4 w-4 text-brand-primary" />
              <p className="truncate text-sm font-bold text-brand-primary-dark">
                {numberFmt(scope.population)}
              </p>
              <p className="text-[11px] text-brand-muted">{t('population')}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-brand-border/60 bg-white p-3">
              <ShieldCheck className="mb-1 h-4 w-4 text-brand-secondary" />
              <p className="truncate text-sm font-bold text-brand-primary-dark">
                {numberFmt(scope.insured)}
              </p>
              <p className="text-[11px] text-brand-muted">{t('insured')}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-brand-border/60 bg-white p-3">
              <p className="mb-1 text-xs font-semibold text-brand-accent-dark">%</p>
              <p className="truncate text-sm font-bold text-brand-primary-dark">
                {pctFmt(scope.penetration)}
              </p>
              <p className="text-[11px] text-brand-muted">{t('penetration')}</p>
            </div>
          </div>

          <div className="mt-4 min-h-0 min-w-0 flex-1">
            <p className="mb-2 text-xs font-semibold text-brand-muted">
              {activeProvince ? t('viewByDistrict') : t('viewByProvince')}
            </p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {(activeProvince ? districts : provinces).map((r) => {
                const barMax = activeProvince
                  ? maxDistrictInsured
                  : Math.max(...provinces.map((p) => p.insured));
                const width = Math.max(4, (r.insured / barMax) * 100);
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => !activeProvince && setSelected(r.code)}
                    className={cn(
                      'w-full min-w-0 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors',
                      !activeProvince && 'hover:border-brand-border hover:bg-brand-surface-container-low/60'
                    )}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-brand-primary-dark">{r.name}</span>
                      <span className="shrink-0 text-brand-muted">
                        {numberFmt(r.insured)} · {pctFmt(r.penetration)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-surface-container">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-container transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

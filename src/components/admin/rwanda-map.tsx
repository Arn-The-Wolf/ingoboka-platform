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
import { cn } from '@/lib/utils';

/** Schematic (leaflet-free) province polygons approximating Rwanda's layout. viewBox 0 0 100 80. */
const PROVINCE_SHAPES: Record<string, { points: string; label: [number, number] }> = {
  WP: { points: '8,30 20,14 30,20 31,55 22,65 9,52', label: [18, 40] },
  NP: { points: '20,14 55,8 67,18 50,30 30,20', label: [42, 17] },
  KV: { points: '50,30 67,18 71,34 60,45 50,42', label: [60, 33] },
  EP: { points: '67,18 93,27 90,59 70,64 60,45 71,34', label: [79, 42] },
  SP: { points: '30,20 50,42 60,45 70,64 48,73 22,65 31,55', label: [45, 58] },
};

const numberFmt = (v: number) => new Intl.NumberFormat('en-US').format(v);
const pctFmt = (v: number) => `${(v * 100).toFixed(2)}%`;

/** Blend a green choropleth fill from penetration (relative to the max across provinces). */
function fillFor(penetration: number, max: number): string {
  const ratio = max > 0 ? Math.min(1, penetration / max) : 0;
  // Interpolate between light mint (#E8F5EF) and brand dark green (#005127).
  const from = [232, 245, 239];
  const to = [0, 81, 39];
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * (0.15 + 0.85 * ratio)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
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

  const scope: GeoRegion = activeProvince ?? {
    level: 'country',
    code: 'RW',
    name: 'Rwanda',
    population: national.population,
    insured: national.insured,
    penetration: national.penetration,
  };

  const maxDistrictInsured = Math.max(1, ...districts.map((d) => d.insured));

  return (
    <div className={cn('portal-card animate-fade-in p-5', className)}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-brand-primary-dark">{t('mapTitle')}</h3>
        <p className="text-xs text-brand-muted">{t('mapSubtitle', { source: RWANDA_CENSUS_SOURCE })}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <svg viewBox="0 0 100 80" className="w-full" role="img" aria-label={t('mapTitle')}>
            {provinces.map((p) => {
              const shape = PROVINCE_SHAPES[p.code];
              if (!shape) return null;
              const isActive = selected === p.code;
              const isDimmed = selected != null && !isActive;
              return (
                <g
                  key={p.code}
                  className="cursor-pointer"
                  onClick={() => setSelected((cur) => (cur === p.code ? null : p.code))}
                >
                  <polygon
                    points={shape.points}
                    fill={fillFor(p.penetration, maxPenetration)}
                    stroke="#ffffff"
                    strokeWidth={0.8}
                    className={cn(
                      'transition-all duration-300',
                      isActive && 'stroke-[1.4]',
                      isDimmed ? 'opacity-45' : 'hover:opacity-90'
                    )}
                    style={isActive ? { stroke: '#FDAA30' } : undefined}
                  />
                  <text
                    x={shape.label[0]}
                    y={shape.label[1]}
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                    style={{ fontSize: 3.2, fontWeight: 700, fill: p.penetration / maxPenetration > 0.55 ? '#ffffff' : '#004024' }}
                  >
                    {p.code === 'KV' ? 'Kigali' : p.name.replace(' Province', '')}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-brand-muted">
            <span>{t('penetration')}:</span>
            <div className="h-2 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, #E8F5EF, #005127)' }} />
            <span>{t('nationalTotal')} {pctFmt(national.penetration)}</span>
          </div>
          <p className="mt-2 text-[11px] text-brand-muted">{t('mapHint')}</p>
        </div>

        {/* Scope panel */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-muted">{t('scope')}</p>
              <p className="text-lg font-bold text-brand-primary-dark">
                {scope.level === 'country' ? 'Rwanda' : scope.name}
              </p>
            </div>
            {activeProvince && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-border px-3 py-1 text-xs font-medium text-brand-primary transition-colors hover:bg-brand-primary-light"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('backToProvinces')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-brand-border/60 bg-white p-3">
              <Users className="mb-1 h-4 w-4 text-brand-primary" />
              <p className="text-sm font-bold text-brand-primary-dark">{numberFmt(scope.population)}</p>
              <p className="text-[11px] text-brand-muted">{t('population')}</p>
            </div>
            <div className="rounded-lg border border-brand-border/60 bg-white p-3">
              <ShieldCheck className="mb-1 h-4 w-4 text-brand-secondary" />
              <p className="text-sm font-bold text-brand-primary-dark">{numberFmt(scope.insured)}</p>
              <p className="text-[11px] text-brand-muted">{t('insured')}</p>
            </div>
            <div className="rounded-lg border border-brand-border/60 bg-white p-3">
              <p className="mb-1 text-xs font-semibold text-brand-accent-dark">%</p>
              <p className="text-sm font-bold text-brand-primary-dark">{pctFmt(scope.penetration)}</p>
              <p className="text-[11px] text-brand-muted">{t('penetration')}</p>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1">
            <p className="mb-2 text-xs font-semibold text-brand-muted">
              {activeProvince ? t('viewByDistrict') : t('viewByProvince')}
            </p>
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {(activeProvince ? districts : provinces).map((r) => {
                const barMax = activeProvince ? maxDistrictInsured : Math.max(...provinces.map((p) => p.insured));
                const width = Math.max(4, (r.insured / barMax) * 100);
                return (
                  <button
                    key={r.code}
                    type="button"
                    onClick={() => !activeProvince && setSelected(r.code)}
                    className={cn(
                      'w-full rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors',
                      !activeProvince && 'hover:border-brand-border hover:bg-brand-surface-container-low/60'
                    )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-brand-primary-dark">{r.name}</span>
                      <span className="text-brand-muted">
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

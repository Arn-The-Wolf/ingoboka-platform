'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartPie, ChartColumnBig, ChartLine, ArrowRight } from 'lucide-react';
import { LoadingLink } from '@/components/navigation/loading-link';
import { cn } from '@/lib/utils';

export type ChartType = 'bar' | 'pie' | 'line';

export interface ChartDatum {
  name: string;
  value: number;
}

interface DistributionChartProps {
  title: string;
  data: ChartDatum[];
  viewMoreHref?: string;
  defaultType?: ChartType;
  height?: number;
  className?: string;
}

/** Brand-aligned categorical palette (blues → gold accents). */
export const CHART_COLORS = [
  '#0B3A6E',
  '#1E5AA8',
  '#3B82C4',
  '#5B9BD5',
  '#93C5FD',
  '#FDAA30',
  '#F4A228',
  '#855300',
  '#782C39',
  '#C8DDF0',
];

const TYPES: { type: ChartType; icon: typeof ChartPie; labelKey: 'pie' | 'bar' | 'line' }[] = [
  { type: 'bar', icon: ChartColumnBig, labelKey: 'bar' },
  { type: 'pie', icon: ChartPie, labelKey: 'pie' },
  { type: 'line', icon: ChartLine, labelKey: 'line' },
];

const numberFmt = (v: number) => new Intl.NumberFormat('en-US').format(v);

export function DistributionChart({
  title,
  data,
  viewMoreHref,
  defaultType = 'bar',
  height = 300,
  className,
}: DistributionChartProps) {
  const t = useTranslations('admin');
  const [type, setType] = useState<ChartType>(defaultType);

  return (
    <div className={cn('portal-card animate-fade-in p-5', className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-brand-primary-dark">{title}</h3>
        <div className="flex items-center gap-1 rounded-full border border-brand-border/70 bg-brand-surface-container-low/60 p-1">
          {TYPES.map(({ type: ty, icon: Icon, labelKey }) => (
            <button
              key={ty}
              type="button"
              onClick={() => setType(ty)}
              aria-pressed={type === ty}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                type === ty
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-brand-muted hover:bg-white hover:text-brand-primary-dark'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-brand-muted">
            {t('noResults')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#404940' }} interval={0} angle={-20} textAnchor="end" height={56} />
                <YAxis tick={{ fontSize: 11, fill: '#404940' }} tickFormatter={numberFmt} width={54} />
                <Tooltip formatter={(v: number) => numberFmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #BFC9BD', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={900}>
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Tooltip formatter={(v: number) => numberFmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #BFC9BD', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={height * 0.32}
                  innerRadius={height * 0.16}
                  paddingAngle={2}
                  animationDuration={900}
                  label={(entry) => numberFmt(Number(entry.value))}
                  labelLine={false}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#404940' }} interval={0} angle={-20} textAnchor="end" height={56} />
                <YAxis tick={{ fontSize: 11, fill: '#404940' }} tickFormatter={numberFmt} width={54} />
                <Tooltip formatter={(v: number) => numberFmt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #BFC9BD', fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0B3A6E"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#1E5AA8' }}
                  activeDot={{ r: 5 }}
                  animationDuration={900}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {viewMoreHref && (
        <div className="mt-4 flex justify-end">
          <LoadingLink
            href={viewMoreHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary transition-colors hover:text-brand-primary-dark"
          >
            {t('viewMore')}
            <ArrowRight className="h-4 w-4" />
          </LoadingLink>
        </div>
      )}
    </div>
  );
}

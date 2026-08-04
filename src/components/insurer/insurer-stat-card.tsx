'use client';

import { LucideIcon } from 'lucide-react';
import { LoadingLink } from '@/components/navigation/loading-link';
import { cn } from '@/lib/utils';

interface InsurerStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  href?: string;
}

/** KPI stat card — matches insurer_dashboard_overview design. */
export function InsurerStatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  className,
  href,
}: InsurerStatCardProps) {
  const content = (
    <div
      className={cn(
        'group flex h-full flex-col justify-between rounded-xl border border-brand-border/60 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-elevated',
        href && 'cursor-pointer',
        className
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-light text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-brand-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-brand-primary-dark">{value}</p>
        {trend && (
          <p
            className={cn(
              'mt-1 line-clamp-2 text-xs font-medium',
              trendUp ? 'text-brand-secondary' : 'text-brand-muted'
            )}
          >
            {trend}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <LoadingLink href={href}>{content}</LoadingLink>;
  }

  return content;
}

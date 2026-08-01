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
        'group flex flex-col justify-between rounded-xl border border-brand-border/60 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-elevated',
        href && 'cursor-pointer hover:scale-105',
        className
      )}
    >
      <Icon className="mb-2 h-5 w-5 text-brand-primary transition-transform duration-300 group-hover:scale-110" />
      <div>
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-2xl font-bold text-brand-primary-dark">{value}</p>
        {trend && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              trendUp ? 'text-brand-success' : 'text-brand-muted'
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

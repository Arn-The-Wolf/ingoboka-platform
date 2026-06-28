'use client';

import { LucideIcon } from 'lucide-react';
import { LoadingLink } from '@/components/navigation/loading-link';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  href: string;
  icon: LucideIcon;
  iconBgClass?: string;
  iconClass?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

/** Quick action tile for dashboard — web-friendly card with hover state. */
export function QuickActionCard({
  href,
  icon: Icon,
  iconBgClass = 'bg-brand-accent/20',
  iconClass = 'text-brand-secondary',
  title,
  subtitle,
  className,
}: QuickActionCardProps) {
  return (
    <LoadingLink href={href}>
      <div
        className={cn(
          'flex flex-col justify-between rounded-xl border border-brand-border/60 bg-white p-5 transition-all hover:border-brand-primary/30 hover:bg-brand-surface-container-low hover:shadow-md',
          className
        )}
      >
        <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-full', iconBgClass)}>
          <Icon className={cn('h-5 w-5', iconClass)} />
        </div>
        <div>
          <p className="font-semibold text-brand-primary-dark">{title}</p>
          {subtitle && <p className="text-sm text-brand-muted">{subtitle}</p>}
        </div>
      </div>
    </LoadingLink>
  );
}

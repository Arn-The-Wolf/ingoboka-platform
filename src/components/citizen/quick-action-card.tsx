'use client';

import { LucideIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
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

/** Bento-style quick action tile — matches policy_wallet_dashboard design. */
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
    <Link href={href}>
      <div
        className={cn(
          'flex aspect-square flex-col justify-between rounded-xl border border-brand-border/60 bg-white p-4 transition-all hover:bg-brand-surface-container-low hover:shadow-md active:scale-[0.98]',
          className
        )}
      >
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', iconBgClass)}>
          <Icon className={cn('h-5 w-5', iconClass)} />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-primary-dark">{title}</p>
          {subtitle && <p className="text-xs text-brand-muted">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );
}

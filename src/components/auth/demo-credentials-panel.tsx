'use client';

import { useTranslations } from 'next-intl';
import { Shield, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? '';

const DEMOS = [
  {
    roleKey: 'demoCitizen' as const,
    icon: User,
    loginMethod: 'phone' as const,
    identifier: process.env.NEXT_PUBLIC_DEMO_CITIZEN_ID ?? '0780000001',
    password: DEMO_PASSWORD,
  },
  {
    roleKey: 'demoAdmin' as const,
    icon: Shield,
    loginMethod: 'email' as const,
    identifier: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? 'platform-admin@example.com',
    password: DEMO_PASSWORD,
  },
  {
    roleKey: 'demoInsurer' as const,
    icon: Building2,
    loginMethod: 'email' as const,
    identifier: process.env.NEXT_PUBLIC_DEMO_INSURER_EMAIL ?? 'partner-admin@example.com',
    password: DEMO_PASSWORD,
  },
] as const;

interface DemoCredentialsPanelProps {
  onFill: (demo: (typeof DEMOS)[number]) => void;
  className?: string;
}

export function DemoCredentialsPanel({ onFill, className }: DemoCredentialsPanelProps) {
  const t = useTranslations('auth');
  const showDemo =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true';

  if (!showDemo) return null;

  return (
    <div
      className={cn(
        'rounded-xl border border-brand-primary/20 bg-brand-primary-light/40 p-4',
        className
      )}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-primary">
        {t('demoCredentialsTitle')}
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {DEMOS.map((demo) => {
          const Icon = demo.icon;
          return (
            <button
              key={demo.roleKey}
              type="button"
              onClick={() => onFill(demo)}
              className="flex flex-col items-start gap-1 rounded-lg border border-brand-border/50 bg-white px-3 py-2.5 text-left text-xs transition-all hover:border-brand-primary/40 hover:shadow-card"
            >
              <span className="flex items-center gap-1.5 font-semibold text-brand-primary-dark">
                <Icon className="h-3.5 w-3.5 text-brand-primary" />
                {t(demo.roleKey)}
              </span>
              <span className="truncate font-mono text-[10px] text-brand-muted">{demo.identifier}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

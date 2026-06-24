'use client';

import { QrCode } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Policy } from '@/types';

interface PolicyHeroCardProps {
  policy: Policy;
}

/** Active policy hero card — matches policy_wallet_dashboard design. */
export function PolicyHeroCard({ policy }: PolicyHeroCardProps) {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');

  return (
    <section className="relative mb-6 overflow-hidden">
      <div className="relative z-10 rounded-xl bg-brand-primary p-6 text-white shadow-elevated">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              {t('policyNumber')}
            </span>
            <p className="text-lg font-bold">{policy.policyNumber}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-primary-dark px-2.5 py-1 text-xs font-bold uppercase">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            {tCommon('active')}
          </span>
        </div>

        <p className="mb-1 text-lg font-bold">{policy.productName}</p>
        <p className="mb-6 text-sm text-white/80">
          {formatCurrency(policy.coverageAmount, policy.currency)} {t('coverage')}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-4">
          {policy.validFrom && (
            <div>
              <span className="block text-xs text-white/70">Valid from</span>
              <p className="text-sm font-semibold">{formatDate(policy.validFrom)}</p>
            </div>
          )}
          {policy.validTo && (
            <div>
              <span className="block text-xs text-white/70">{t('validUntil')}</span>
              <p className="text-sm font-semibold">{formatDate(policy.validTo)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <Link href={`/policies/${policy.id}/card`}>
            <Button variant="pill-accent" size="sm" className="gap-2">
              <QrCode className="h-4 w-4" />
              {t('scanQr')}
            </Button>
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-12 -top-12 -z-0 h-48 w-48 rounded-full bg-brand-primary-light/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-4 -left-12 -z-0 h-32 w-32 rounded-full bg-brand-accent/10 blur-2xl" />
    </section>
  );
}

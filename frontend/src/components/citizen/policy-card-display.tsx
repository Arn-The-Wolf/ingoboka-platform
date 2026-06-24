'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PolicyCard } from '@/types';
import { Shield } from 'lucide-react';

interface PolicyCardDisplayProps {
  card: PolicyCard;
}

/** Digital policy card — matches digital_policy_card design. */
export function PolicyCardDisplay({ card }: PolicyCardDisplayProps) {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-brand-primary-dark">Policy Identification</h2>
        <p className="text-sm text-brand-muted">Keep this card ready for digital verification.</p>
      </div>

      <div className="relative aspect-[1.58/1] overflow-hidden rounded-xl border border-white/10 bg-brand-primary p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5" />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold">Ingoboka</span>
            </div>
            <Badge variant={policyStatusVariant(card.status)} className="bg-white/20 text-white">
              {tCommon(card.status.toLowerCase() as 'active' | 'pending' | 'expired')}
            </Badge>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/70">{t('policyNumber')}</p>
            <p className="font-mono text-lg font-bold">{card.policyNumber}</p>
            <p className="mt-2 text-xl font-bold">{card.productName}</p>
            <p className="text-sm text-white/80">{card.insurerName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
            <div>
              <p className="text-white/70">{t('coverage')}</p>
              <p className="font-semibold">{formatCurrency(card.coverageAmount, card.currency)}</p>
            </div>
            <div>
              <p className="text-white/70">{t('validUntil')}</p>
              <p className="font-semibold">{formatDate(card.validTo)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-brand-muted">{t('scanQr')}</p>
        <QRCodeSVG
          value={card.qrPayload}
          size={180}
          level="M"
          includeMargin
          className="rounded-lg bg-white p-2"
        />
        <p className="text-center text-xs text-brand-muted">
          {card.holderName} · {formatDate(card.validFrom)} – {formatDate(card.validTo)}
        </p>
      </div>
    </div>
  );
}

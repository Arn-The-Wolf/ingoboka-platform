'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PolicyCard } from '@/types';
import { Shield } from 'lucide-react';

interface PolicyCardDisplayProps {
  card: PolicyCard;
}

export function PolicyCardDisplay({ card }: PolicyCardDisplayProps) {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');

  return (
    <Card className="overflow-hidden border-brand-primary/20 shadow-elevated">
      <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark px-6 py-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="font-semibold">Ingoboka</span>
          </div>
          <Badge variant={policyStatusVariant(card.status)} className="bg-white/20 text-white">
            {tCommon(card.status.toLowerCase() as 'active' | 'pending' | 'expired')}
          </Badge>
        </div>
        <CardTitle className="mt-4 text-white">{card.productName}</CardTitle>
        <p className="text-sm text-white/80">{card.insurerName}</p>
      </div>

      <CardHeader className="pb-2">
        <p className="text-sm text-brand-muted">{t('policyNumber')}</p>
        <p className="font-mono text-lg font-semibold">{card.policyNumber}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-brand-muted">{t('coverage')}</p>
            <p className="font-semibold">
              {formatCurrency(card.coverageAmount, card.currency)}
            </p>
          </div>
          <div>
            <p className="text-brand-muted">{t('validUntil')}</p>
            <p className="font-semibold">{formatDate(card.validTo)}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-lg bg-brand-background p-4">
          <p className="text-sm text-brand-muted">{t('scanQr')}</p>
          <QRCodeSVG
            value={card.qrPayload}
            size={160}
            level="M"
            includeMargin
            className="rounded-lg bg-white p-2"
          />
        </div>

        <p className="text-center text-xs text-brand-muted">
          {card.holderName} · {formatDate(card.validFrom)} – {formatDate(card.validTo)}
        </p>
      </CardContent>
    </Card>
  );
}

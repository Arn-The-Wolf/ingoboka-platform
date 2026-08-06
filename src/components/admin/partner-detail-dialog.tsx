'use client';

import type { ElementType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, Globe, Mail, MapPin, Phone, Hash } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Organization } from '@/lib/api/admin';
import { orgStatusLabel, orgStatusTone, orgTypeLabel, orgCodeLabel } from '@/lib/status-label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';

interface PartnerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Organization | null;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-brand-muted">{label}</p>
        <p className="break-words text-sm text-brand-primary-dark">{value}</p>
      </div>
    </div>
  );
}

export function PartnerDetailDialog({ open, onOpenChange, partner }: PartnerDetailDialogProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'partner', partner?.id],
    queryFn: () => adminApi.getPartner(partner!.id),
    enabled: open && Boolean(partner?.id),
  });

  const detail = data ?? partner;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-primary" />
            {t('partnerDetails')}
          </DialogTitle>
          <DialogDescription>{detail?.name}</DialogDescription>
        </DialogHeader>

        {isLoading && <ListSkeleton rows={4} />}
        {error && <Alert variant="error">{tCommon('error')}</Alert>}

        {!isLoading && !error && detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={orgStatusTone(detail.status)}>{orgStatusLabel(detail.status)}</Badge>
              <Badge variant="secondary">{orgTypeLabel(detail.organizationType)}</Badge>
              {detail.slug && (
                <span className="text-xs text-brand-muted">{orgCodeLabel(detail.slug)}</span>
              )}
            </div>

            <div className="portal-card space-y-3 p-4">
              <DetailRow icon={Hash} label={t('registrationNumber')} value={data?.registrationNumber} />
              <DetailRow icon={Mail} label={t('contactEmail')} value={detail.contactEmail} />
              <DetailRow icon={Phone} label={t('contactPhone')} value={data?.contactPhone} />
              <DetailRow icon={Globe} label={t('website')} value={data?.website} />
              <DetailRow icon={MapPin} label={t('addressLine')} value={data?.addressLine} />
              <DetailRow icon={MapPin} label={t('district')} value={data?.district} />
            </div>

            {data?.createdAt && (
              <p className="text-xs text-brand-muted">
                {t('createdAt')}: {new Date(data.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

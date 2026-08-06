'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { RwandaMap } from '@/components/admin/rwanda-map';
import { applyInsuredData } from '@/lib/rwanda-geo';
import type { InsurerDashboardData } from '@/lib/api/insurer-portal';

interface InsurerRwandaMapProps {
  enrollmentByDistrict: InsurerDashboardData['enrollmentByDistrict'];
  className?: string;
}

/** Rwanda map scoped to this insurer's enrollments via district-level insured counts. */
export function InsurerRwandaMap({ enrollmentByDistrict, className }: InsurerRwandaMapProps) {
  const t = useTranslations('insurer');

  const districtData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of enrollmentByDistrict) {
      if (row.districtCode) map[row.districtCode] = row.enrolled;
    }
    return map;
  }, [enrollmentByDistrict]);

  useEffect(() => {
    applyInsuredData(districtData);
    return () => applyInsuredData({});
  }, [districtData]);

  return (
    <div className={className}>
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-brand-primary-dark">{t('coverageMap')}</h2>
        <p className="text-sm text-brand-muted">{t('coverageMapHint')}</p>
      </div>
      <RwandaMap />
    </div>
  );
}

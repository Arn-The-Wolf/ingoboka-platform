'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, ShieldCheck, Percent, Layers } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { RwandaMap } from '@/components/admin/rwanda-map';
import { DistributionChart } from '@/components/admin/distribution-chart';
import { AdminSelect } from '@/components/admin/admin-select';
import {
  getDistrictRegions,
  getNationalTotals,
  getProvinceRegions,
  getStructureCounts,
  listProvinceNames,
  RWANDA_PROVINCES,
} from '@/lib/rwanda-geo';

const numberFmt = (v: number) => new Intl.NumberFormat('en-US').format(v);
const pctFmt = (v: number) => `${(v * 100).toFixed(2)}%`;

export default function AdminGeographyPage() {
  const t = useTranslations('admin');
  const [province, setProvince] = useState('');

  const national = useMemo(() => getNationalTotals(), []);
  const structure = useMemo(() => getStructureCounts(), []);

  const provinceChart = useMemo(
    () => getProvinceRegions().map((p) => ({ name: p.code === 'KV' ? 'Kigali' : p.name.replace(' Province', ''), value: p.insured })),
    []
  );

  const provinceCode = useMemo(
    () => RWANDA_PROVINCES.find((p) => p.name === province)?.code,
    [province]
  );

  const districtChart = useMemo(
    () => getDistrictRegions(provinceCode).map((d) => ({ name: d.name, value: d.insured })),
    [provinceCode]
  );

  const stats = [
    { icon: Users, label: t('totalPopulation'), value: numberFmt(national.population) },
    { icon: ShieldCheck, label: t('insuredCitizens'), value: numberFmt(national.insured) },
    { icon: Percent, label: t('penetration'), value: pctFmt(national.penetration) },
    { icon: Layers, label: t('districts'), value: `${structure.districts} · ${structure.sectors} ${t('sectors')}` },
  ];

  return (
    <PageContainer>
      <PageHeader title={t('geography')} subtitle={t('geographySubtitle')} />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="portal-card flex flex-col gap-2 p-4">
              <Icon className="h-5 w-5 text-brand-primary" />
              <p className="text-xl font-bold text-brand-primary-dark">{s.value}</p>
              <p className="text-xs text-brand-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <RwandaMap />
      </div>

      <div className="mb-6">
        <DistributionChart title={t('usersByProvince')} data={provinceChart} defaultType="bar" height={320} />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-brand-muted">{t('filterByProvince')}:</span>
        <AdminSelect
          className="h-9 w-56"
          value={province}
          placeholder={t('allProvinces')}
          options={listProvinceNames().map((p) => ({ value: p, label: p }))}
          onChange={(e) => setProvince(e.target.value)}
        />
      </div>

      <DistributionChart
        title={t('usersByDistrict')}
        data={districtChart}
        defaultType="bar"
        height={360}
      />
    </PageContainer>
  );
}

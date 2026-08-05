'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import type { RwandaAddress } from '@/types';
import {
  RWANDA_COUNTRY,
  listDistrictNames,
  listProvinceNames,
  listSectorNames,
} from '@/lib/rwanda-geo';
import { AdminSelect } from './admin-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RwandaAddressSelectProps {
  value: RwandaAddress;
  onChange: (value: RwandaAddress) => void;
  idPrefix?: string;
}

/**
 * Cascading Rwandan address selector: Province → District → Sector → Cell → Village.
 * Province/District/Sector are backed by `rwanda-geo.ts`; Cell/Village accept free text
 * (with sector-derived suggestions) until exhaustive lower-level data is wired in.
 * Country is fixed to "Rwanda".
 */
export function RwandaAddressSelect({ value, onChange, idPrefix = 'addr' }: RwandaAddressSelectProps) {
  const t = useTranslations('admin');

  const provinceOptions = useMemo(
    () => listProvinceNames().map((name) => ({ value: name, label: name })),
    []
  );
  const districtOptions = useMemo(
    () => listDistrictNames(value.province ?? '').map((name) => ({ value: name, label: name })),
    [value.province]
  );
  const sectorSuggestions = useMemo(
    () => listSectorNames(value.province ?? '', value.district ?? ''),
    [value.province, value.district]
  );

  const set = (patch: Partial<RwandaAddress>) =>
    onChange({ ...value, country: RWANDA_COUNTRY, ...patch });

  const sectorListId = `${idPrefix}-sector-list`;

  return (
    <div className="rounded-xl border border-brand-border/70 bg-brand-surface-container-low/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-primary-dark">
        <MapPin className="h-4 w-4 text-brand-primary" />
        {t('address')}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div>label]:mb-1.5 [&>div>label]:block">
        <div>
          <Label htmlFor={`${idPrefix}-province`}>{t('province')}</Label>
          <AdminSelect
            id={`${idPrefix}-province`}
            value={value.province ?? ''}
            placeholder={t('selectProvince')}
            options={provinceOptions}
            onChange={(e) =>
              set({ province: e.target.value || undefined, district: undefined, sector: undefined, cell: undefined, village: undefined })
            }
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-district`}>{t('district')}</Label>
          <AdminSelect
            id={`${idPrefix}-district`}
            value={value.district ?? ''}
            placeholder={value.province ? t('selectDistrict') : t('selectFirst')}
            options={districtOptions}
            disabled={!value.province}
            onChange={(e) =>
              set({ district: e.target.value || undefined, sector: undefined, cell: undefined, village: undefined })
            }
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-sector`}>{t('sector')}</Label>
          <Input
            id={`${idPrefix}-sector`}
            list={sectorListId}
            value={value.sector ?? ''}
            placeholder={value.district ? t('selectPlaceholder') : t('selectFirst')}
            disabled={!value.district}
            onChange={(e) => set({ sector: e.target.value || undefined })}
          />
          <datalist id={sectorListId}>
            {sectorSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-cell`}>{t('cell')}</Label>
          <Input
            id={`${idPrefix}-cell`}
            value={value.cell ?? ''}
            placeholder={value.sector ? t('selectPlaceholder') : t('selectFirst')}
            disabled={!value.sector}
            onChange={(e) => set({ cell: e.target.value || undefined })}
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-village`}>{t('village')}</Label>
          <Input
            id={`${idPrefix}-village`}
            value={value.village ?? ''}
            placeholder={value.cell ? t('selectPlaceholder') : t('selectFirst')}
            disabled={!value.cell}
            onChange={(e) => set({ village: e.target.value || undefined })}
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-country`}>{t('country')}</Label>
          <Input id={`${idPrefix}-country`} value={RWANDA_COUNTRY} readOnly disabled />
        </div>
      </div>
    </div>
  );
}

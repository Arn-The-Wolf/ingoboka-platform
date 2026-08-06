'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import type { RwandaAddress } from '@/types';
import { RWANDA_COUNTRY } from '@/lib/rwanda-geo';
import {
  listLocationCells,
  listLocationDistricts,
  listLocationProvinces,
  listLocationSectors,
  listLocationVillages,
} from '@/lib/rwanda-locations';
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
 * Backed by the full national hierarchy in `rwanda-locations.json`.
 * Country is fixed to "Rwanda".
 */
export function RwandaAddressSelect({ value, onChange, idPrefix = 'addr' }: RwandaAddressSelectProps) {
  const t = useTranslations('admin');

  const provinceOptions = useMemo(
    () => listLocationProvinces().map((name) => ({ value: name, label: name })),
    []
  );
  const districtOptions = useMemo(
    () => listLocationDistricts(value.province ?? '').map((name) => ({ value: name, label: name })),
    [value.province]
  );
  const sectorOptions = useMemo(
    () =>
      listLocationSectors(value.province ?? '', value.district ?? '').map((name) => ({
        value: name,
        label: name,
      })),
    [value.province, value.district]
  );
  const cellOptions = useMemo(
    () =>
      listLocationCells(value.province ?? '', value.district ?? '', value.sector ?? '').map((name) => ({
        value: name,
        label: name,
      })),
    [value.province, value.district, value.sector]
  );
  const villageOptions = useMemo(
    () =>
      listLocationVillages(
        value.province ?? '',
        value.district ?? '',
        value.sector ?? '',
        value.cell ?? ''
      ).map((name) => ({ value: name, label: name })),
    [value.province, value.district, value.sector, value.cell]
  );

  const set = (patch: Partial<RwandaAddress>) =>
    onChange({ ...value, country: RWANDA_COUNTRY, ...patch });

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
              set({
                province: e.target.value || undefined,
                district: undefined,
                sector: undefined,
                cell: undefined,
                village: undefined,
              })
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
              set({
                district: e.target.value || undefined,
                sector: undefined,
                cell: undefined,
                village: undefined,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-sector`}>{t('sector')}</Label>
          <AdminSelect
            id={`${idPrefix}-sector`}
            value={value.sector ?? ''}
            placeholder={value.district ? t('selectSector') : t('selectFirst')}
            options={sectorOptions}
            disabled={!value.district}
            onChange={(e) =>
              set({
                sector: e.target.value || undefined,
                cell: undefined,
                village: undefined,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-cell`}>{t('cell')}</Label>
          <AdminSelect
            id={`${idPrefix}-cell`}
            value={value.cell ?? ''}
            placeholder={value.sector ? t('selectCell') : t('selectFirst')}
            options={cellOptions}
            disabled={!value.sector}
            onChange={(e) =>
              set({
                cell: e.target.value || undefined,
                village: undefined,
              })
            }
          />
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-village`}>{t('village')}</Label>
          <AdminSelect
            id={`${idPrefix}-village`}
            value={value.village ?? ''}
            placeholder={value.cell ? t('selectVillage') : t('selectFirst')}
            options={villageOptions}
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

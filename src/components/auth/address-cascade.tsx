'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  listLocationCells,
  listLocationDistricts,
  listLocationProvinces,
  listLocationSectors,
  listLocationVillages,
} from '@/lib/rwanda-locations';
import { SelectField } from '@/components/auth/fields';

export interface AddressCascadeValue {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

interface AddressCascadeProps {
  value: AddressCascadeValue;
  onChange: (next: AddressCascadeValue) => void;
  errors?: Partial<Record<keyof AddressCascadeValue, string>>;
}

const EMPTY: AddressCascadeValue = {
  province: '',
  district: '',
  sector: '',
  cell: '',
  village: '',
};

/**
 * Progressive cascading address selects for registration.
 * Each level appears only after its parent is chosen.
 */
export function AddressCascade({ value, onChange, errors }: AddressCascadeProps) {
  const t = useTranslations('auth');

  const provinces = useMemo(() => listLocationProvinces(), []);
  const districts = useMemo(
    () => (value.province ? listLocationDistricts(value.province) : []),
    [value.province]
  );
  const sectors = useMemo(
    () =>
      value.province && value.district
        ? listLocationSectors(value.province, value.district)
        : [],
    [value.province, value.district]
  );
  const cells = useMemo(
    () =>
      value.province && value.district && value.sector
        ? listLocationCells(value.province, value.district, value.sector)
        : [],
    [value.province, value.district, value.sector]
  );
  const villages = useMemo(
    () =>
      value.province && value.district && value.sector && value.cell
        ? listLocationVillages(value.province, value.district, value.sector, value.cell)
        : [],
    [value.province, value.district, value.sector, value.cell]
  );

  const set = (patch: Partial<AddressCascadeValue>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <SelectField
        id="province"
        label={t('province')}
        value={value.province}
        placeholder={t('selectProvince')}
        error={errors?.province}
        options={provinces.map((name) => ({ value: name, label: name }))}
        onChange={(e) =>
          set({
            province: e.target.value,
            district: '',
            sector: '',
            cell: '',
            village: '',
          })
        }
      />

      {value.province ? (
        <SelectField
          id="district"
          label={t('district')}
          value={value.district}
          placeholder={t('selectDistrict')}
          error={errors?.district}
          options={districts.map((name) => ({ value: name, label: name }))}
          onChange={(e) =>
            set({
              district: e.target.value,
              sector: '',
              cell: '',
              village: '',
            })
          }
        />
      ) : null}

      {value.district ? (
        <SelectField
          id="sector"
          label={t('sector')}
          value={value.sector}
          placeholder={t('selectSector')}
          error={errors?.sector}
          options={sectors.map((name) => ({ value: name, label: name }))}
          onChange={(e) =>
            set({
              sector: e.target.value,
              cell: '',
              village: '',
            })
          }
        />
      ) : null}

      {value.sector ? (
        <SelectField
          id="cell"
          label={t('cell')}
          value={value.cell}
          placeholder={t('selectCell')}
          error={errors?.cell}
          options={cells.map((name) => ({ value: name, label: name }))}
          onChange={(e) =>
            set({
              cell: e.target.value,
              village: '',
            })
          }
        />
      ) : null}

      {value.cell ? (
        <SelectField
          id="village"
          label={t('village')}
          value={value.village}
          placeholder={t('selectVillage')}
          error={errors?.village}
          options={villages.map((name) => ({ value: name, label: name }))}
          onChange={(e) => set({ village: e.target.value })}
        />
      ) : null}
    </div>
  );
}

export { EMPTY as emptyAddressCascade };

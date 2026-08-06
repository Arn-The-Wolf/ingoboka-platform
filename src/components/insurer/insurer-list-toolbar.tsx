'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdminSelect } from '@/components/admin/admin-select';
import { listDistrictNames, listProvinceNames } from '@/lib/rwanda-geo';
import { cn } from '@/lib/utils';

export interface ListToolbarFilters {
  search: string;
  status: string;
  province: string;
  district: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

interface InsurerListToolbarProps {
  filters: ListToolbarFilters;
  onChange: (patch: Partial<ListToolbarFilters>) => void;
  statusOptions: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  showAddressFilters?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export function InsurerListToolbar({
  filters,
  onChange,
  statusOptions,
  sortOptions,
  showAddressFilters = false,
  searchPlaceholder = 'Search…',
  className,
}: InsurerListToolbarProps) {
  const districts = filters.province ? listDistrictNames(filters.province) : [];

  return (
    <div className={cn('mb-6 space-y-3', className)}>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <Input
          className="border-brand-border bg-white pl-9"
          placeholder={searchPlaceholder}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <AdminSelect
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          options={statusOptions}
          aria-label="Status filter"
          className="min-w-[140px]"
        />
        <AdminSelect
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value })}
          options={sortOptions}
          aria-label="Sort by"
          className="min-w-[140px]"
        />
        <AdminSelect
          value={filters.sortDir}
          onChange={(e) => onChange({ sortDir: e.target.value as 'asc' | 'desc' })}
          options={[
            { value: 'desc', label: 'Newest first' },
            { value: 'asc', label: 'Oldest first' },
          ]}
          aria-label="Sort direction"
          className="min-w-[140px]"
        />
        {showAddressFilters && (
          <>
            <AdminSelect
              value={filters.province}
              onChange={(e) => onChange({ province: e.target.value, district: '' })}
              options={[
                { value: '', label: 'All provinces' },
                ...listProvinceNames().map((name) => ({ value: name, label: name })),
              ]}
              aria-label="Province filter"
              className="min-w-[160px]"
            />
            <AdminSelect
              value={filters.district}
              onChange={(e) => onChange({ district: e.target.value })}
              options={[
                { value: '', label: 'All districts' },
                ...districts.map((name) => ({ value: name, label: name })),
              ]}
              aria-label="District filter"
              className="min-w-[160px]"
              disabled={!filters.province}
            />
          </>
        )}
      </div>
    </div>
  );
}

export const DEFAULT_LIST_FILTERS: ListToolbarFilters = {
  search: '',
  status: '',
  province: '',
  district: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

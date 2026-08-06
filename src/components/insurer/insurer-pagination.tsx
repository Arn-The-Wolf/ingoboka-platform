'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminSelect } from '@/components/admin/admin-select';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE_OPTIONS = [8, 10, 20, 50];

interface InsurerPaginationProps {
  page: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function InsurerPagination({
  page,
  pageSize = 10,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: InsurerPaginationProps) {
  if (totalElements === 0 && !onPageSizeChange) return null;

  const showNav = totalPages > 1;

  return (
    <div className={cn('flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="text-sm text-brand-muted">
        {totalElements === 0
          ? 'No results'
          : `Page ${page + 1} of ${Math.max(totalPages, 1)} · ${totalElements} total`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <AdminSelect
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            options={pageSizeOptions.map((n) => ({ value: String(n), label: `${n} / page` }))}
            aria-label="Page size"
            className="min-w-[110px]"
          />
        )}
        {showNav && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

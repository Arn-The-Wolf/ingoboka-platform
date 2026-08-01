'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

const ITEMS_PER_PAGE = 15;

export default function AdminAuditPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.listAuditLog(),
    retry: false,
  });

  const entries = data?.content ?? [];
  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <PageContainer>
      <PageHeader 
        title={t('audit')} 
        subtitle={`${entries.length} audit entries`}
      />

      {isLoading && <ListSkeleton rows={8} />}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && paginatedEntries.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    {t('timestamp')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    {t('action')}
                  </th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 md:table-cell">
                    {t('actor')}
                  </th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 lg:table-cell">
                    {t('resource')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntries.map((entry, index) => (
                  <tr 
                    key={entry.id} 
                    className={`border-b border-indigo-50 last:border-0 hover:bg-indigo-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-indigo-500" />
                        {formatDate(entry.occurredAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{entry.action}</p>
                      {entry.details && (
                        <p className="text-xs text-gray-500">{entry.details}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{entry.actor}</td>
                    <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">{entry.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, entries.length)} of {entries.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && entries.length === 0 && (
        <Card className="border-dashed border-indigo-200">
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <p className="font-medium text-gray-700">{t('noAudit')}</p>
            <p className="mt-1 text-sm text-gray-500">{t('noAuditHint')}</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

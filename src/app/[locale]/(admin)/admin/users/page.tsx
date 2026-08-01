'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.listUsers(),
    retry: false,
  });

  const filtered = useMemo(() => {
    const users = data?.content ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [data?.content, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <PageContainer>
      <PageHeader title={t('users')} subtitle={`${filtered.length} ${t('activeUsers')}`} />

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <Input
          className="pl-9 bg-white border-green-200 focus:border-green-500 focus:ring-green-500"
          placeholder={t('searchUsers')}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label={tCommon('search')}
        />
      </div>

      {isLoading && <ListSkeleton rows={8} />}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && paginatedUsers.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-green-100 bg-gradient-to-r from-green-50 to-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 sm:table-cell">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('role')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    {tCommon('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={cn(
                      "border-b border-green-50 last:border-0 hover:bg-green-50/50 transition-colors",
                      index % 2 === 0 && "bg-green-50/20"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white font-semibold text-xs">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                      {user.email ?? user.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 'ACTIVE' ? 'active' : 'pending'}>
                        {user.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-green-200 hover:bg-green-50"
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
                  className="border-green-200 hover:bg-green-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && paginatedUsers.length === 0 && (
        <Card className="border-dashed border-green-200">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-gray-700">{search ? 'No users found' : t('noUsers')}</p>
            <p className="mt-1 text-sm text-gray-500">{search ? 'Try a different search term' : t('noUsersHint')}</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

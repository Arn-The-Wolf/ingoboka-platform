'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Search, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');

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

  return (
    <PageContainer>
      <PageHeader title={t('users')} subtitle={t('activeUsers')} />

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <Input
          className="pl-9"
          placeholder={t('searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={tCommon('search')}
        />
      </div>

      {isLoading && <ListSkeleton rows={8} />}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-brand-border/60 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border bg-brand-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">Name</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-brand-primary-dark sm:table-cell">
                  Contact
                </th>
                <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">{t('role')}</th>
                <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">
                  {tCommon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-brand-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-light">
                        <Users className="h-4 w-4 text-brand-primary" />
                      </div>
                      <span className="font-medium text-brand-primary-dark">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-brand-muted sm:table-cell">
                    {user.email ?? user.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{user.role}</Badge>
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
      )}

      {!isLoading && filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-brand-primary-dark">{t('noUsers')}</p>
            <p className="mt-1 text-sm text-brand-muted">{t('noUsersHint')}</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

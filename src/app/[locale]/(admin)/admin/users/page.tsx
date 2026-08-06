'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Search,
  UserPlus,
  Pencil,
  Ban,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import type { ApiError, ManagedUser } from '@/types';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdminSelect } from '@/components/admin/admin-select';
import { DistributionChart } from '@/components/admin/distribution-chart';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useAdminToast } from '@/components/admin/admin-toast';
import {
  USER_STATUS_ORDER,
  roleLabel,
  userStatusLabel,
  userStatusTone,
} from '@/lib/status-label';
import { listDistrictNames, listProvinceNames, RWANDA_DISTRICTS } from '@/lib/rwanda-geo';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

type SortField = 'name' | 'district' | 'status' | 'role' | 'createdAt';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const toast = useAdminToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [showChart, setShowChart] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<ManagedUser | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'managed-users'],
    queryFn: () => adminApi.listManagedUsers(0, 200),
    retry: false,
  });

  const users = useMemo(() => data?.content ?? [], [data?.content]);

  const roleOptions = useMemo(() => {
    const codes = new Set<string>();
    users.forEach((u) => u.roleCode && codes.add(u.roleCode));
    return Array.from(codes).map((code) => ({ value: code, label: roleLabel(code) }));
  }, [users]);

  const districtOptions = useMemo(() => {
    const names = province ? listDistrictNames(province) : RWANDA_DISTRICTS.map((d) => d.name);
    return names.map((n) => ({ value: n, label: n }));
  }, [province]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = users.filter((u) => {
      if (q && !(
        u.fullName.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      )) return false;
      if (province && u.province !== province) return false;
      if (district && u.district !== district) return false;
      if (status && u.status !== status) return false;
      if (role && u.roleCode !== role) return false;
      return true;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const val = (u: ManagedUser): string => {
        switch (sortField) {
          case 'district': return u.district ?? '';
          case 'status': return u.status;
          case 'role': return u.roleCode ?? '';
          case 'createdAt': return u.createdAt ?? '';
          default: return u.fullName;
        }
      };
      return val(a).localeCompare(val(b)) * dir;
    });
    return result;
  }, [users, search, province, district, status, role, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const statusChart = useMemo(
    () =>
      USER_STATUS_ORDER.map((st) => ({
        name: userStatusLabel(st),
        value: filtered.filter((u) => u.status === st).length,
      })).filter((d) => d.value > 0),
    [filtered]
  );

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: 'ACTIVE' | 'DISABLED' | 'LOCKED' }) =>
      adminApi.updateManagedUserStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managed-users'] });
      toast.success(t('statusUpdated'));
      setStatusTarget(null);
    },
    onError: (error: ApiError) =>
      toast.error(t('saveError'), getApiErrorMessage(error)),
  });

  const resetFilters = () => {
    setSearch(''); setProvince(''); setDistrict(''); setStatus(''); setRole(''); setPage(1);
  };
  const onFilterChange = () => setPage(1);

  const isDeactivated = statusTarget?.status === 'DISABLED';

  return (
    <PageContainer>
      <PageHeader
        title={t('allUsers')}
        subtitle={t('usersSubtitle', { count: filtered.length })}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowChart((s) => !s)} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{showChart ? t('hideChart') : t('visualize')}</span>
            </Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('addUser')}</span>
            </Button>
          </div>
        }
      />

      {showChart && (
        <div className="mb-6">
          <DistributionChart title={t('usersByStatus')} data={statusChart} defaultType="pie" height={260} />
        </div>
      )}

      {/* Toolbar: search + filters + sort */}
      <div className="mb-6 space-y-3 rounded-xl border border-brand-border/60 bg-white p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            className="pl-9"
            placeholder={t('searchUsers')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); onFilterChange(); }}
            aria-label={tCommon('search')}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <AdminSelect
            value={province}
            placeholder={t('allProvinces')}
            options={listProvinceNames().map((p) => ({ value: p, label: p }))}
            onChange={(e) => { setProvince(e.target.value); setDistrict(''); onFilterChange(); }}
          />
          <AdminSelect
            value={district}
            placeholder={t('allDistricts')}
            options={districtOptions}
            onChange={(e) => { setDistrict(e.target.value); onFilterChange(); }}
          />
          <AdminSelect
            value={status}
            placeholder={t('allStatuses')}
            options={USER_STATUS_ORDER.map((s) => ({ value: s, label: userStatusLabel(s) }))}
            onChange={(e) => { setStatus(e.target.value); onFilterChange(); }}
          />
          <AdminSelect
            value={role}
            placeholder={t('allRoles')}
            options={roleOptions}
            onChange={(e) => { setRole(e.target.value); onFilterChange(); }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted">
            <ArrowUpDown className="h-3.5 w-3.5" /> {t('sortBy')}
          </span>
          <AdminSelect
            className="h-9 w-auto"
            value={sortField}
            options={[
              { value: 'name', label: t('sortName') },
              { value: 'district', label: t('sortDistrict') },
              { value: 'status', label: t('sortStatus') },
              { value: 'role', label: t('sortRole') },
              { value: 'createdAt', label: t('sortCreated') },
            ]}
            onChange={(e) => setSortField(e.target.value as SortField)}
          />
          <Button variant="outline" size="sm" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>
            {sortDir === 'asc' ? t('sortAsc') : t('sortDesc')}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto gap-1.5 text-brand-muted">
            <Filter className="h-3.5 w-3.5" />
            {t('clearFilters')}
          </Button>
        </div>
      </div>

      {isLoading && <ListSkeleton rows={8} />}

      {error && !isLoading && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

      {!isLoading && !error && paginated.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-brand-border/60 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-brand-border/50 bg-brand-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">{t('name')}</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-brand-primary-dark sm:table-cell">{t('contact')}</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-brand-primary-dark md:table-cell">{t('district')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">{t('roleField')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-primary-dark">{tCommon('status')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-brand-primary-dark">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, index) => (
                  <tr key={user.id} className={cn('border-b border-brand-border/30 transition-colors last:border-0 hover:bg-brand-primary-light/40', index % 2 === 0 && 'bg-brand-surface-container-low/30')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark text-xs font-semibold text-white">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-brand-primary-dark">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-brand-muted sm:table-cell">{user.email ?? user.phone ?? '—'}</td>
                    <td className="hidden px-4 py-3 text-brand-muted md:table-cell">{user.district ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{roleLabel(user.roleCode)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={userStatusTone(user.status)}>{userStatusLabel(user.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-primary" onClick={() => { setEditing(user); setFormOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">{t('edit')}</span>
                        </Button>
                        {user.status === 'DISABLED' ? (
                          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-success" onClick={() => setStatusTarget(user)}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">{t('activate')}</span>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-error" onClick={() => setStatusTarget(user)}>
                            <Ban className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">{t('deactivate')}</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-brand-muted">
              {t('showing', {
                from: (safePage - 1) * ITEMS_PER_PAGE + 1,
                to: Math.min(safePage * ITEMS_PER_PAGE, filtered.length),
                total: filtered.length,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                <ChevronLeft className="h-4 w-4" /> {t('previous')}
              </Button>
              <span className="text-sm text-brand-muted">{t('page', { page: safePage, total: totalPages })}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                {t('next')} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {!isLoading && !error && paginated.length === 0 && (
        <Card className="border-dashed border-brand-border">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-brand-primary-dark">{users.length === 0 ? t('noUsers') : t('noResults')}</p>
            <p className="mt-1 text-sm text-brand-muted">{users.length === 0 ? t('noUsersHint') : t('tryDifferentSearch')}</p>
          </CardContent>
        </Card>
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(o) => !o && setStatusTarget(null)}
        title={isDeactivated ? t('activate') : t('confirmDeactivateTitle')}
        description={isDeactivated ? t('confirmActivateBody') : t('confirmDeactivateBody')}
        confirmLabel={isDeactivated ? t('activate') : t('deactivate')}
        confirmVariant={isDeactivated ? 'default' : 'destructive'}
        loading={statusMutation.isPending}
        onConfirm={() =>
          statusTarget && statusMutation.mutate({ id: statusTarget.id, newStatus: isDeactivated ? 'ACTIVE' : 'DISABLED' })
        }
      />
    </PageContainer>
  );
}

'use client';



import { useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useTranslations } from 'next-intl';

import {

  Building2,

  Plus,

  ChevronLeft,

  ChevronRight,

  Search,

  BarChart3,

  ArrowUpDown,

  Mail,

  Eye,

  Pencil,

  Ban,

  RotateCcw,

} from 'lucide-react';

import { adminApi } from '@/lib/api';

import type { Organization } from '@/lib/api/admin';

import { PageContainer } from '@/components/layout/page-container';

import { PageHeader } from '@/components/layout/page-header';

import { Card, CardContent } from '@/components/ui/card';

import { ListSkeleton } from '@/components/ui/list-skeleton';

import { Alert } from '@/components/ui/alert';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { AdminSelect } from '@/components/admin/admin-select';

import { DistributionChart } from '@/components/admin/distribution-chart';

import { PartnerFormDialog } from '@/components/admin/partner-form-dialog';

import { PartnerDetailDialog } from '@/components/admin/partner-detail-dialog';

import { ConfirmDialog } from '@/components/admin/confirm-dialog';

import { useAdminToast } from '@/components/admin/admin-toast';

import { orgStatusLabel, orgStatusTone, humanize } from '@/lib/status-label';

import { cn } from '@/lib/utils';



const SIZE_OPTIONS = [12, 24, 48];



export default function AdminPartnersPage() {

  const t = useTranslations('admin');

  const tCommon = useTranslations('common');

  const toast = useAdminToast();

  const queryClient = useQueryClient();



  const [serverPage, setServerPage] = useState(0);

  const [size, setSize] = useState(12);

  const [search, setSearch] = useState('');

  const [typeFilter, setTypeFilter] = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  const [sortField, setSortField] = useState<'name' | 'status' | 'type'>('name');

  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [showChart, setShowChart] = useState(false);

  const [addOpen, setAddOpen] = useState(false);

  const [editing, setEditing] = useState<Organization | null>(null);

  const [detailTarget, setDetailTarget] = useState<Organization | null>(null);

  const [statusTarget, setStatusTarget] = useState<Organization | null>(null);



  const { data, isLoading, error } = useQuery({

    queryKey: ['admin', 'partners', serverPage, size],

    queryFn: () => adminApi.listPartnersPaged(serverPage, size),

  });



  const content = useMemo(() => data?.content ?? [], [data?.content]);



  const typeOptions = useMemo(() => {

    const set = new Set<string>();

    content.forEach((o) => set.add(o.organizationType));

    return Array.from(set).map((v) => ({ value: v, label: humanize(v) }));

  }, [content]);



  const view = useMemo(() => {

    const q = search.trim().toLowerCase();

    const dir = sortDir === 'asc' ? 1 : -1;

    return content

      .filter((o) => {

        if (q && !(o.name.toLowerCase().includes(q) || o.slug.toLowerCase().includes(q))) return false;

        if (typeFilter && o.organizationType !== typeFilter) return false;

        if (statusFilter && o.status !== statusFilter) return false;

        return true;

      })

      .sort((a, b) => {

        const val = (o: Organization) =>

          sortField === 'status' ? o.status : sortField === 'type' ? o.organizationType : o.name;

        return val(a).localeCompare(val(b)) * dir;

      });

  }, [content, search, typeFilter, statusFilter, sortField, sortDir]);



  const byStatus = useMemo(() => {

    const counts = new Map<string, number>();

    content.forEach((o) => counts.set(o.status, (counts.get(o.status) ?? 0) + 1));

    return Array.from(counts.entries()).map(([s, value]) => ({ name: orgStatusLabel(s), value }));

  }, [content]);



  const totalPages = data?.totalPages ?? 1;

  const totalElements = data?.totalElements ?? content.length;



  const statusMutation = useMutation({

    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>

      adminApi.updatePartnerStatus(id, newStatus),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });

      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });

      toast.success(t('statusUpdated'));

      setStatusTarget(null);

    },

    onError: () => toast.error(t('saveError')),

  });



  const isInactive = statusTarget?.status === 'INACTIVE' || statusTarget?.status === 'SUSPENDED';



  const getGradient = (index: number) => {

    const gradients = [

      'from-purple-400 to-purple-600',

      'from-blue-400 to-blue-600',

      'from-green-400 to-green-600',

      'from-amber-400 to-amber-600',

      'from-pink-400 to-pink-600',

      'from-indigo-400 to-indigo-600',

    ];

    return gradients[index % gradients.length];

  };



  return (

    <PageContainer>

      <PageHeader

        title={t('partners')}

        subtitle={t('partnersSubtitle', { count: totalElements })}

        action={

          <div className="flex gap-2">

            <Button variant="outline" onClick={() => setShowChart((s) => !s)} className="gap-2">

              <BarChart3 className="h-4 w-4" />

              <span className="hidden sm:inline">{showChart ? t('hideChart') : t('visualize')}</span>

            </Button>

            <Button onClick={() => { setEditing(null); setAddOpen(true); }} className="gap-2">

              <Plus className="h-4 w-4" />

              <span className="hidden sm:inline">{t('addPartner')}</span>

            </Button>

          </div>

        }

      />



      {showChart && (

        <div className="mb-6">

          <DistributionChart title={t('partnersByStatus')} data={byStatus} defaultType="pie" height={260} />

        </div>

      )}



      <div className="portal-card mb-6 space-y-3 p-4">

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />

            <Input className="pl-9" placeholder={tCommon('search')} value={search} onChange={(e) => setSearch(e.target.value)} />

          </div>

          <AdminSelect value={typeFilter} placeholder={t('partnerType')} options={typeOptions} onChange={(e) => setTypeFilter(e.target.value)} />

          <AdminSelect

            value={statusFilter}

            placeholder={t('allStatuses')}

            options={[

              { value: 'ACTIVE', label: orgStatusLabel('ACTIVE') },

              { value: 'SUSPENDED', label: orgStatusLabel('SUSPENDED') },

              { value: 'INACTIVE', label: orgStatusLabel('INACTIVE') },

            ]}

            onChange={(e) => setStatusFilter(e.target.value)}

          />

          <div className="flex items-center gap-2">

            <AdminSelect

              className="h-10"

              value={sortField}

              options={[

                { value: 'name', label: t('sortName') },

                { value: 'status', label: t('sortStatus') },

                { value: 'type', label: t('partnerType') },

              ]}

              onChange={(e) => setSortField(e.target.value as 'name' | 'status' | 'type')}

            />

            <Button variant="outline" size="icon" className="shrink-0" onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))} title={sortDir === 'asc' ? t('sortAsc') : t('sortDesc')}>

              <ArrowUpDown className="h-4 w-4" />

            </Button>

          </div>

        </div>

      </div>



      {isLoading && <ListSkeleton rows={6} />}



      {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}



      {!isLoading && !error && view.length > 0 && (

        <>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {view.map((org, index) => (

              <div

                key={org.id}

                className="portal-card group animate-fade-in p-5 transition-all hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-elevated"

              >

                <div className="mb-3 flex items-start gap-3">

                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', getGradient(index))}>

                    <Building2 className="h-6 w-6" />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate font-semibold text-brand-primary-dark">{org.name}</p>

                    <p className="text-sm text-brand-muted">{humanize(org.organizationType)}</p>

                  </div>

                  <Badge variant={orgStatusTone(org.status)} className="shrink-0">{orgStatusLabel(org.status)}</Badge>

                </div>

                <div className="mb-4 space-y-1">

                  {org.slug && <p className="truncate text-xs text-brand-muted">{org.slug}</p>}

                  {org.contactEmail && (

                    <p className="flex items-center gap-1.5 truncate text-xs text-brand-muted">

                      <Mail className="h-3 w-3" /> {org.contactEmail}

                    </p>

                  )}

                </div>

                <div className="flex items-center justify-end gap-1 border-t border-brand-border/40 pt-3">

                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-primary" onClick={() => setDetailTarget(org)}>

                    <Eye className="h-3.5 w-3.5" />

                    <span className="hidden sm:inline">{t('viewPartner')}</span>

                  </Button>

                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-primary" onClick={() => { setEditing(org); setAddOpen(true); }}>

                    <Pencil className="h-3.5 w-3.5" />

                    <span className="hidden sm:inline">{t('edit')}</span>

                  </Button>

                  {org.status === 'INACTIVE' || org.status === 'SUSPENDED' ? (

                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-success" onClick={() => setStatusTarget(org)}>

                      <RotateCcw className="h-3.5 w-3.5" />

                      <span className="hidden sm:inline">{t('activate')}</span>

                    </Button>

                  ) : (

                    <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-brand-error" onClick={() => setStatusTarget(org)}>

                      <Ban className="h-3.5 w-3.5" />

                      <span className="hidden sm:inline">{t('deactivate')}</span>

                    </Button>

                  )}

                </div>

              </div>

            ))}

          </div>



          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">

            <div className="flex items-center gap-2 text-sm text-brand-muted">

              <span>{t('perPage')}</span>

              <AdminSelect

                className="h-9 w-20"

                value={String(size)}

                options={SIZE_OPTIONS.map((s) => ({ value: String(s), label: String(s) }))}

                onChange={(e) => { setSize(Number(e.target.value)); setServerPage(0); }}

              />

            </div>

            <div className="flex items-center gap-2">

              <Button variant="outline" size="sm" onClick={() => setServerPage((p) => Math.max(0, p - 1))} disabled={serverPage === 0}>

                <ChevronLeft className="h-4 w-4" /> {t('previous')}

              </Button>

              <span className="text-sm text-brand-muted">{t('page', { page: serverPage + 1, total: totalPages })}</span>

              <Button variant="outline" size="sm" onClick={() => setServerPage((p) => Math.min(totalPages - 1, p + 1))} disabled={serverPage >= totalPages - 1}>

                {t('next')} <ChevronRight className="h-4 w-4" />

              </Button>

            </div>

          </div>

        </>

      )}



      {!isLoading && !error && view.length === 0 && (

        <Card className="border-dashed border-brand-border">

          <CardContent className="py-16 text-center">

            <div className="mb-4 flex justify-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary-light">

                <Building2 className="h-10 w-10 text-brand-primary" />

              </div>

            </div>

            <p className="mb-2 font-medium text-brand-primary-dark">{content.length === 0 ? t('noOrganizations') : t('noResults')}</p>

            <Button onClick={() => { setEditing(null); setAddOpen(true); }} className="mt-2 gap-2">

              <Plus className="h-4 w-4" /> {t('addPartner')}

            </Button>

          </CardContent>

        </Card>

      )}



      <PartnerFormDialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) setEditing(null);
        }}
        partner={editing}
      />

      <PartnerDetailDialog open={Boolean(detailTarget)} onOpenChange={(o) => !o && setDetailTarget(null)} partner={detailTarget} />



      <ConfirmDialog

        open={Boolean(statusTarget)}

        onOpenChange={(o) => !o && setStatusTarget(null)}

        title={isInactive ? t('activate') : t('confirmDeactivatePartnerTitle')}

        description={isInactive ? t('confirmReactivatePartnerBody') : t('confirmDeactivatePartnerBody')}

        confirmLabel={isInactive ? t('activate') : t('deactivate')}

        confirmVariant={isInactive ? 'default' : 'destructive'}

        loading={statusMutation.isPending}

        onConfirm={() =>

          statusTarget &&

          statusMutation.mutate({

            id: statusTarget.id,

            newStatus: isInactive ? 'ACTIVE' : 'INACTIVE',

          })

        }

      />

    </PageContainer>

  );

}


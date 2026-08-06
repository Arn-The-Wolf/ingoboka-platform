'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Activity,
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { adminApi, type AuditLogFilters } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auditActionLabel, outcomeLabel, outcomeTone, resourceTypeLabel } from '@/lib/status-label';
import { formatDate } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

const RESOURCE_TYPES = [
  '',
  'USER',
  'ORGANIZATION',
  'POLICY',
  'CLAIM',
  'APPLICATION',
  'PLATFORM_SETTINGS',
  'ORGANIZATION_SETTINGS',
  'PAYMENT',
  'DOCUMENT',
  'DATA_SUBJECT_REQUEST',
];

const OUTCOMES = ['', 'SUCCESS', 'FAILED', 'PENDING', 'INFO'];

export default function AdminAuditPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [outcome, setOutcome] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [applied, setApplied] = useState<AuditLogFilters>({
    page: 0,
    size: ITEMS_PER_PAGE,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const filters: AuditLogFilters = useMemo(
    () => ({
      ...applied,
      page: currentPage,
      size: ITEMS_PER_PAGE,
    }),
    [applied, currentPage]
  );

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['admin', 'audit', filters],
    queryFn: () => adminApi.listAuditLog(filters),
    retry: false,
  });

  const entries = data?.content ?? [];
  const totalElements = data?.totalElements ?? entries.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / ITEMS_PER_PAGE));

  const applyFilters = () => {
    setCurrentPage(0);
    setApplied({
      page: 0,
      size: ITEMS_PER_PAGE,
      search: search.trim() || undefined,
      action: action.trim() || undefined,
      actor: actor.trim() || undefined,
      resourceType: resourceType || undefined,
      outcome: outcome || undefined,
      from: from ? `${from}T00:00:00Z` : undefined,
      to: to ? `${to}T23:59:59Z` : undefined,
      sortBy,
      sortDir,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setAction('');
    setActor('');
    setResourceType('');
    setOutcome('');
    setFrom('');
    setTo('');
    setSortBy('createdAt');
    setSortDir('desc');
    setCurrentPage(0);
    setApplied({ page: 0, size: ITEMS_PER_PAGE, sortBy: 'createdAt', sortDir: 'desc' });
  };

  const toggleSort = (key: string) => {
    const nextDir = sortBy === key && sortDir === 'desc' ? 'asc' : 'desc';
    setSortBy(key);
    setSortDir(nextDir);
    setCurrentPage(0);
    setApplied((prev) => ({ ...prev, sortBy: key, sortDir: nextDir, page: 0 }));
  };

  const outcomeVariant = (value?: string) => outcomeTone(value);

  return (
    <PageContainer>
      <PageHeader
        title={t('audit')}
        subtitle={t('auditSubtitle', { count: totalElements })}
      />

      <Card className="mb-6 border-indigo-100 shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter className="h-4 w-4 text-indigo-500" />
            {t('auditFilters')}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="audit-search">{tCommon('search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <Input
                  id="audit-search"
                  className="pl-9"
                  placeholder={t('auditSearchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-action">{t('action')}</Label>
              <Input
                id="audit-action"
                placeholder="USER_LOGIN"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-actor">{t('actor')}</Label>
              <Input
                id="audit-actor"
                placeholder="admin@…"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-resource">{t('resource')}</Label>
              <select
                id="audit-resource"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {RESOURCE_TYPES.map((rt) => (
                  <option key={rt || 'all'} value={rt}>
                    {rt ? resourceTypeLabel(rt) : t('allResources')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-outcome">{t('outcome')}</Label>
              <select
                id="audit-outcome"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                {OUTCOMES.map((o) => (
                  <option key={o || 'all'} value={o}>
                    {o ? outcomeLabel(o) : t('allOutcomes')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-from">{t('dateFrom')}</Label>
              <Input id="audit-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-to">{t('dateTo')}</Label>
              <Input id="audit-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={applyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              {t('applyFilters')}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              {t('clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && <ListSkeleton rows={8} />}

      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && entries.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('createdAt')}>
                      {t('timestamp')}
                      {sortBy === 'createdAt' && (sortDir === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('action')}>
                      {t('action')}
                      {sortBy === 'action' && (sortDir === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('outcome')}</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 md:table-cell">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('actorEmail')}>
                      {t('actor')}
                      {sortBy === 'actorEmail' && (sortDir === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />)}
                    </button>
                  </th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 lg:table-cell">
                    <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort('entityType')}>
                      {t('resource')}
                      {sortBy === 'entityType' && (sortDir === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />)}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
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
                      <p className="font-medium text-gray-800">{auditActionLabel(entry.action)}</p>
                      {entry.details && <p className="text-xs text-gray-500">{entry.details}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={outcomeVariant(entry.outcome)}>{outcomeLabel(entry.outcome)}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{entry.actor}</td>
                    <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
                      <span className="font-medium">{resourceTypeLabel(entry.resource)}</span>
                      {entry.entityId && (
                        <p className="font-mono text-[10px] text-gray-400">{entry.entityId.slice(0, 8)}…</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {isFetching ? '…' : null}{' '}
                {t('auditShowing', {
                  from: currentPage * ITEMS_PER_PAGE + 1,
                  to: Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalElements),
                  total: totalElements,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('previous')}
                </Button>
                <span className="text-sm text-gray-600">
                  {t('orgPageOf', { current: currentPage + 1, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="border-indigo-200 hover:bg-indigo-50"
                >
                  {t('next')}
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
            <div className="mb-4 flex justify-center">
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

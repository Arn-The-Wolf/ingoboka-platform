'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { FileText, Handshake, Receipt, Wallet, TrendingUp } from 'lucide-react';
import { insurerPortalApi } from '@/lib/api';
import { DistributionChart } from '@/components/admin/distribution-chart';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Badge } from '@/components/ui/badge';
import { AdminSelect } from '@/components/admin/admin-select';
import { insurerApi } from '@/lib/api';
import { insurerStatusLabel } from '@/lib/insurer-status';
import { CurrencyToggle } from '@/components/insurer/currency-toggle';
import { useCurrency } from '@/hooks/use-currency';

type Granularity = 'monthly' | 'weekly' | 'yearly';

export default function InsurerPartnerPage() {
  const t = useTranslations('insurer');
  const { currency, setCurrency, fx, format } = useCurrency();
  const [granularity, setGranularity] = useState<Granularity>('monthly');

  const { data: contracts, isLoading: cLoading } = useQuery({
    queryKey: ['partner', 'contracts'],
    queryFn: () => insurerApi.listPartnerContracts(),
  });

  const { data: invoices, isLoading: iLoading } = useQuery({
    queryKey: ['partner', 'invoices'],
    queryFn: () => insurerPortalApi.listPartnerInvoices(),
  });

  const { data: ledger, isLoading: lLoading } = useQuery({
    queryKey: ['partner', 'ledger'],
    queryFn: () => insurerPortalApi.listPartnerLedger(),
  });

  const { data: trends, isLoading: tLoading } = useQuery({
    queryKey: ['partner', 'revenue-trends', granularity],
    queryFn: () => insurerPortalApi.getRevenueTrends(granularity),
  });

  const revenueChart = useMemo(
    () =>
      (trends?.periods ?? []).map((p) => ({
        name: p.label,
        value: p.revenue,
      })),
    [trends?.periods]
  );

  const spendingChart = useMemo(
    () =>
      (trends?.periods ?? []).map((p) => ({
        name: p.label,
        value: p.spending,
      })),
    [trends?.periods]
  );

  const contractList = (contracts as Array<{ contractNumber: string; status: string }>) ?? [];
  const invoiceList = invoices ?? [];
  const ledgerList = ledger ?? [];

  return (
    <PageContainer>
      <PageHeader title={t('partner')} subtitle={t('partnerSubtitle')} />

      <div className="mb-6">
        <CurrencyToggle currency={currency} onChange={setCurrency} fxSource={fx?.source} />
      </div>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('revenueOverview')}</h2>
          </div>
          <AdminSelect
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
            options={[
              { value: 'weekly', label: t('weeklyView') },
              { value: 'monthly', label: t('monthlyView') },
              { value: 'yearly', label: t('yearlyView') },
            ]}
            aria-label="Revenue period"
            className="min-w-[160px]"
          />
        </div>

        {tLoading ? (
          <ListSkeleton rows={2} />
        ) : trends ? (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-brand-muted">{t('totalRevenue')}</p>
                  <p className="text-2xl font-bold text-brand-primary-dark">
                    {format(trends.totalRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-brand-muted">{t('settledRevenue')}</p>
                  <p className="text-2xl font-bold text-brand-primary">
                    {format(trends.totalSettled)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-brand-muted">{t('pendingRevenue')}</p>
                  <p className="text-2xl font-bold text-brand-primary-dark">
                    {format(trends.totalPending)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-brand-muted">{t('totalSpending')}</p>
                  <p className="text-2xl font-bold text-brand-error">
                    {format(trends.totalSpending)}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <DistributionChart title={t('revenueTrend')} data={revenueChart} defaultType="line" />
              <DistributionChart title={t('spendingTrend')} data={spendingChart} defaultType="bar" />
            </div>
          </>
        ) : null}
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Handshake className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-brand-primary-dark">{t('contracts')}</h2>
        </div>
        {cLoading ? (
          <ListSkeleton rows={3} />
        ) : contractList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-brand-muted">{t('noContracts')}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {contractList.map((c, i) => (
              <Card key={i} className="border-brand-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-brand-primary" />
                    <span className="font-medium text-brand-primary-dark">{c.contractNumber}</span>
                  </div>
                  <Badge variant={c.status === 'ACTIVE' ? 'active' : 'pending'}>
                    {insurerStatusLabel(c.status)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-brand-primary-dark">{t('invoices')}</h2>
        </div>
        {iLoading ? (
          <ListSkeleton rows={3} />
        ) : invoiceList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-brand-muted">{t('noInvoices')}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {invoiceList.map((inv) => (
              <Card key={inv.id} className="border-brand-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">{inv.invoiceNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-primary">
                      {format(inv.totalAmount)}
                    </span>
                    <Badge>{insurerStatusLabel(inv.status)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-brand-primary-dark">{t('revenueLedger')}</h2>
        </div>
        {lLoading ? (
          <ListSkeleton rows={4} />
        ) : ledgerList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-brand-muted">{t('noLedger')}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {ledgerList.map((e) => (
              <Card key={e.id} className="border-brand-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <span className="text-sm text-brand-primary-dark">{e.description}</span>
                    {e.createdAt && (
                      <p className="text-xs text-brand-muted">{new Date(e.createdAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-primary">
                      {format(e.amount)}
                    </span>
                    <Badge variant="secondary">{insurerStatusLabel(e.status)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

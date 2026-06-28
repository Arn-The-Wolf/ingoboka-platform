'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { FileText, Handshake, Receipt, Wallet } from 'lucide-react';
import { insurerApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export default function InsurerPartnerPage() {
  const t = useTranslations('insurer');

  const { data: contracts, isLoading: cLoading } = useQuery({
    queryKey: ['partner', 'contracts'],
    queryFn: () => insurerApi.listPartnerContracts(),
  });

  const { data: invoices, isLoading: iLoading } = useQuery({
    queryKey: ['partner', 'invoices'],
    queryFn: () => insurerApi.listPartnerInvoices(),
  });

  const { data: ledger, isLoading: lLoading } = useQuery({
    queryKey: ['partner', 'ledger'],
    queryFn: () => insurerApi.listPartnerLedger(),
  });

  const contractList = (contracts as Array<{ contractNumber: string; status: string }>) ?? [];
  const invoiceList =
    (invoices as Array<{ invoiceNumber: string; totalAmount: number; status: string }>) ?? [];
  const ledgerList =
    (ledger as Array<{ description: string; amount: number; currency: string }>) ?? [];

  return (
    <PageContainer>
      <PageHeader title={t('partner')} subtitle={t('partnerSubtitle')} />

      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Handshake className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-brand-primary-dark">{t('contracts')}</h2>
        </div>
        {cLoading ? (
          <Spinner />
        ) : contractList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-brand-muted">
              {t('noContracts')}
            </CardContent>
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
                  <Badge variant={c.status === 'ACTIVE' ? 'active' : 'pending'}>{c.status}</Badge>
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
          <Spinner />
        ) : invoiceList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-brand-muted">
              {t('noInvoices')}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {invoiceList.map((inv, i) => (
              <Card key={i} className="border-brand-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <span className="font-medium">{inv.invoiceNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-primary">
                      {formatCurrency(inv.totalAmount, 'RWF')}
                    </span>
                    <Badge>{inv.status}</Badge>
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
          <Spinner />
        ) : ledgerList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-brand-muted">
              {t('noLedger')}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {ledgerList.map((e, i) => (
              <Card key={i} className="border-brand-border/60">
                <CardContent className="flex items-center justify-between p-4">
                  <span className="text-sm text-brand-primary-dark">{e.description}</span>
                  <span className="font-semibold text-brand-primary">
                    {formatCurrency(e.amount, e.currency)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

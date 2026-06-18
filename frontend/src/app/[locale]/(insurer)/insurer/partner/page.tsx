'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { insurerApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
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

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">{t('partner')}</h1>

      <h2 className="mb-3 font-semibold">{t('contracts')}</h2>
      {cLoading ? <Spinner /> : (
        <div className="mb-8 grid gap-2">
          {(contracts as Array<{ contractNumber: string; status: string }> ?? []).map((c, i) => (
            <Card key={i}><CardContent className="p-4">{c.contractNumber} — {c.status}</CardContent></Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 font-semibold">{t('invoices')}</h2>
      {iLoading ? <Spinner /> : (
        <div className="mb-8 grid gap-2">
          {(invoices as Array<{ invoiceNumber: string; totalAmount: number; status: string }> ?? []).map((inv, i) => (
            <Card key={i}>
              <CardContent className="flex justify-between p-4">
                <span>{inv.invoiceNumber}</span>
                <span>{formatCurrency(inv.totalAmount, 'RWF')} — {inv.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 font-semibold">{t('revenueLedger')}</h2>
      {lLoading ? <Spinner /> : (
        <div className="grid gap-2">
          {(ledger as Array<{ description: string; amount: number; currency: string }> ?? []).map((e, i) => (
            <Card key={i}>
              <CardContent className="flex justify-between p-4">
                <span>{e.description}</span>
                <span>{formatCurrency(e.amount, e.currency)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

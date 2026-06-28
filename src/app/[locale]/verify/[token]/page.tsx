'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { usePublicVerification } from '@/hooks/use-policies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, policyStatusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { formatDate } from '@/lib/utils';
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export default function PublicVerifyPage() {
  const t = useTranslations('verify');
  const tCommon = useTranslations('common');
  const params = useParams();
  const token = params.token as string;
  const { data, isLoading } = usePublicVerification(token);

  return (
    <div className="flex min-h-screen flex-col bg-brand-background">
      <header className="flex items-center justify-between border-b border-brand-border bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-semibold">Ingoboka</span>
        </div>
        <LocaleSwitcher />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 lg:px-8">
        <h1 className="mb-2 text-center text-xl font-bold">{t('title')}</h1>
        <p className="mb-8 text-center text-sm text-brand-muted">{t('noPii')}</p>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && data && (
          <>
            {data.valid ? (
              <Alert variant="success" className="mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {t('valid')}
                </div>
              </Alert>
            ) : (
              <Alert variant="error" className="mb-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {t('invalid')}
                </div>
              </Alert>
            )}

            {data.valid && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">{data.policyNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-brand-muted">{t('productName')}</p>
                    <p className="font-medium">{data.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted">{t('insurerName')}</p>
                    <p className="font-medium">{data.insurerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted">{t('statusLabel')}</p>
                    <Badge variant={policyStatusVariant(data.status ?? 'PENDING')}>
                      {tCommon((data.status ?? 'pending').toLowerCase() as 'active' | 'pending')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-brand-muted">{t('validFrom')}</p>
                      <p className="text-sm font-medium">
                        {data.validFrom ? formatDate(data.validFrom) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-muted">{t('validTo')}</p>
                      <p className="text-sm font-medium">
                        {data.validTo ? formatDate(data.validTo) : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

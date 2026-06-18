'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { usePolicies } from '@/hooks/use-policies';
import { PolicyListItem } from '@/components/citizen/policy-list-item';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { useLogout } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { Shield, LogOut } from 'lucide-react';
import type { ApiError } from '@/types';

export default function CitizenDashboardPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch } = usePolicies();
  const logout = useLogout();

  const policies = data?.content ?? [];
  const totalCoverage = policies
    .filter((p) => p.status === 'ACTIVE')
    .reduce((sum, p) => sum + p.coverageAmount, 0);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-brand-muted">{t('policyWallet')}</p>
            <h1 className="text-lg font-bold">
              {t('welcome', { name: user?.fullName?.split(' ')[0] ?? 'Citizen' })}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout.mutate()}
            aria-label={tCommon('logout')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-brand-muted">{t('activePolicies')}</p>
            <p className="text-2xl font-bold text-brand-primary">
              {policies.filter((p) => p.status === 'ACTIVE').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-brand-muted">{t('totalCoverage')}</p>
            <p className="text-lg font-bold text-brand-primary">
              {formatCurrency(totalCoverage)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex gap-2">
        <Link href="/products">
          <Button variant="outline" size="sm">
            {t('browseProducts')}
          </Button>
        </Link>
        <Link href="/claims/new">
          <Button variant="outline" size="sm">
            File a claim
          </Button>
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-brand-muted">{t('dashboard')}</h2>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {(error as ApiError).message ?? tCommon('error')}
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            {tCommon('retry')}
          </Button>
        </Alert>
      )}

      {!isLoading && policies.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-brand-muted">{t('noPolicies')}</p>
            <Link href="/products">
              <Button className="mt-4" variant="outline">
                {t('browseProducts')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {policies.map((policy) => (
          <PolicyListItem key={policy.id} policy={policy} />
        ))}
      </div>
    </div>
  );
}

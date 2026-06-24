'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { usePolicies, usePolicyActivity } from '@/hooks/use-policies';
import { PolicyHeroCard } from '@/components/citizen/policy-hero-card';
import { PolicyListItem } from '@/components/citizen/policy-list-item';
import { QuickActionCard } from '@/components/citizen/quick-action-card';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';
import { CreditCard, FileText, LogOut, Megaphone, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ApiError } from '@/types';

export default function CitizenDashboardPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch } = usePolicies();
  const { data: activityData } = usePolicyActivity();
  const logout = useLogout();

  const policies = data?.content ?? [];
  const activities = activityData?.content ?? [];
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE');
  const heroPolicy = activePolicies[0];

  return (
    <>
      <CitizenHeader
        title={t('policyWallet')}
        subtitle={t('welcome', { name: user?.fullName?.split(' ')[0] ?? 'Citizen' })}
      />
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()} loading={logout.isPending}>
            <LogOut className="mr-1 h-4 w-4" />
            {tCommon('logout')}
          </Button>
        </div>

        <section className="mb-6 py-2">
          <h2 className="text-2xl font-bold text-brand-primary-dark">{t('dashboard')}</h2>
          <p className="text-sm text-brand-muted">
            Protecting what matters most with community-driven care.
          </p>
        </section>

        {heroPolicy && <PolicyHeroCard policy={heroPolicy} />}

        <section className="mb-6 grid grid-cols-2 gap-3">
          <QuickActionCard
            href="/products"
            icon={CreditCard}
            iconBgClass="bg-brand-accent/25"
            iconClass="text-brand-secondary"
            title={t('browseProducts')}
            subtitle="Explore plans"
          />
          <QuickActionCard
            href="/claims/new"
            icon={Megaphone}
            iconBgClass="bg-brand-primary-light"
            iconClass="text-brand-primary"
            title={t('claims')}
            subtitle="Report incident"
          />
        </section>

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
          <Card className="border-dashed border-brand-border">
            <CardContent className="py-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-brand-muted" />
              <p className="text-brand-muted">{t('noPolicies')}</p>
              <Link href="/products">
                <Button className="mt-4" variant="pill-accent">
                  {t('browseProducts')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {policies.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-primary-dark">Policy History</h3>
              <span className="text-sm font-semibold text-brand-primary">{tCommon('viewAll')}</span>
            </div>
            {activities.length > 0 ? (
              <div className="mb-4 space-y-2">
                {activities.slice(0, 5).map((event, index) => (
                  <div
                    key={`${event.type}-${event.occurredAt}-${index}`}
                    className="flex items-start gap-3 rounded-lg border border-brand-border bg-white p-3"
                  >
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-primary-dark">{event.label}</p>
                      <p className="text-xs text-brand-muted">{formatDate(event.occurredAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="space-y-2">
              {policies.map((policy) => (
                <PolicyListItem key={policy.id} policy={policy} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

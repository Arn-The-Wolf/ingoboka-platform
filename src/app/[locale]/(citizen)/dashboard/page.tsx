'use client';

import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { useAuthStore } from '@/store/auth-store';
import { usePolicies, usePolicyActivity } from '@/hooks/use-policies';
import { PolicyHeroCard } from '@/components/citizen/policy-hero-card';
import { PolicyListItem } from '@/components/citizen/policy-list-item';
import { QuickActionCard } from '@/components/citizen/quick-action-card';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CreditCard, FileText, Megaphone, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ApiError } from '@/types';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function CitizenDashboardPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, refetch } = usePolicies();
  const { data: activityData, isLoading: activityLoading } = usePolicyActivity();

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
      <PageContainer>
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-brand-primary-dark">{t('dashboard')}</h2>
          <p className="mt-1 text-brand-muted">
            Protecting what matters most with community-driven care.
          </p>
        </section>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {heroPolicy && <PolicyHeroCard policy={heroPolicy} />}

              {error && (
                <Alert variant="error" className="mb-4">
                  {(error as ApiError).message ?? tCommon('error')}
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                    {tCommon('retry')}
                  </Button>
                </Alert>
              )}

              {policies.length === 0 && (
                <Card className="border-dashed border-brand-border">
                  <CardContent className="py-12 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-brand-muted" />
                    <p className="text-brand-muted">{t('noPolicies')}</p>
                    <LoadingLink href="/products">
                      <Button className="mt-4" variant="pill-accent">
                        {t('browseProducts')}
                      </Button>
                    </LoadingLink>
                  </CardContent>
                </Card>
              )}

              {policies.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-brand-primary-dark">Policy History</h3>
                    <span className="text-sm font-semibold text-brand-primary">{tCommon('viewAll')}</span>
                  </div>
                  <div className="space-y-2">
                    {policies.map((policy) => (
                      <PolicyListItem key={policy.id} policy={policy} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6">
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                <QuickActionCard
                  href="/products"
                  icon={CreditCard}
                  iconBgClass="bg-brand-accent/25"
                  iconClass="text-brand-secondary"
                  title={t('browseProducts')}
                  subtitle="Explore plans"
                  className="aspect-auto min-h-[7rem] transition-all duration-300 hover:scale-105 cursor-pointer"
                />
                <QuickActionCard
                  href="/claims/new"
                  icon={Megaphone}
                  iconBgClass="bg-brand-primary-light"
                  iconClass="text-brand-primary"
                  title={t('claims.nav')}
                  subtitle="Report incident"
                  className="aspect-auto min-h-[7rem] transition-all duration-300 hover:scale-105 cursor-pointer"
                />
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-muted">
                  Recent Activity
                </h3>
                {activityLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-2">
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
                ) : (
                  <p className="text-sm text-brand-muted">No recent activity.</p>
                )}
              </section>
            </aside>
          </div>
        )}
      </PageContainer>
    </>
  );
}

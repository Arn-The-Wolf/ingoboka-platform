'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Mail, RotateCcw, UserPlus, Users } from 'lucide-react';
import { staffApi } from '@/lib/api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { EmployeeFormDialog } from '@/components/insurer/employee-form-dialog';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';

function enrollmentBadge(status: string) {
  if (status === 'COMPLETED') return 'active' as const;
  if (status === 'DISABLED') return 'error' as const;
  return 'pending' as const;
}

export default function InsurerEmployeesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.role !== 'INSURER_ADMIN') {
      router.replace('/insurer/dashboard');
    }
  }, [user, router]);

  const t = useTranslations('insurer.employees');
  const tCommon = useTranslations('common');
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'employees'],
    queryFn: () => staffApi.getOverview(),
  });

  const createMutation = useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'employees'] });
      setFormOpen(false);
      toast.success(t('inviteSent'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const resendMutation = useMutation({
    mutationFn: staffApi.resendInvite,
    onSuccess: () => toast.success(t('inviteResent')),
    onError: () => toast.error(tCommon('error')),
  });

  const employees = data?.staff ?? [];

  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Button variant="pill-accent" className="gap-2" onClick={() => setFormOpen(true)}>
            <UserPlus className="h-4 w-4" />
            {t('inviteEmployee')}
          </Button>
        }
      />

      {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InsurerStatCard label={t('total')} value={data?.totalStaff ?? 0} icon={Users} />
            <InsurerStatCard label={t('pendingInvites')} value={data?.pendingInvites ?? 0} icon={Mail} />
            <InsurerStatCard label={t('active')} value={data?.activeStaff ?? 0} icon={Users} />
            <InsurerStatCard
              label={t('pendingEnrollment')}
              value={(data?.pendingPasswordChange ?? 0) + (data?.pendingEmailVerification ?? 0)}
              icon={RotateCcw}
            />
          </div>

          {employees.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-brand-muted">
                {t('empty')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <Card key={employee.id} className="border-brand-border/60">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-brand-primary-dark">{employee.fullName}</p>
                      <p className="text-sm text-brand-muted">{employee.email}</p>
                      <p className="text-xs text-brand-muted">
                        {employee.roleCode?.replace(/_/g, ' ') ?? employee.role}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={enrollmentBadge(employee.enrollmentStatus)}>
                        {employee.enrollmentStatus === 'COMPLETED'
                          ? t('enrolled')
                          : employee.enrollmentStatus === 'DISABLED'
                            ? t('disabled')
                            : t('pending')}
                      </Badge>
                      {employee.enrollmentStatus === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={resendMutation.isPending}
                          onClick={() => resendMutation.mutate(employee.id)}
                        >
                          <Mail className="mr-1 h-3.5 w-3.5" />
                          {t('resendInvite')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        loading={createMutation.isPending}
        onSubmit={(input) => createMutation.mutate(input)}
      />
    </PageContainer>
  );
}

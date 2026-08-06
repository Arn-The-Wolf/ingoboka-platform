'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Mail, RotateCcw, UserPlus, Users } from 'lucide-react';
import { staffApi } from '@/lib/api';
import type { StaffMember, UpdateStaffInput } from '@/lib/api/staff';
import { useAdminToast } from '@/components/admin/admin-toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmployeeDetailDialog } from '@/components/insurer/employee-detail-dialog';
import { EmployeeFormDialog } from '@/components/insurer/employee-form-dialog';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InsurerStatCard } from '@/components/insurer/insurer-stat-card';
import { staffEnrollmentLabel, staffStatusLabel } from '@/lib/insurer-status';
import { STAFF_ROLE_OPTIONS } from '@/lib/api/staff';

const DEFAULT_PAGE_SIZE = 10;

function enrollmentBadge(status: string) {
  if (status === 'COMPLETED') return 'active' as const;
  if (status === 'DISABLED') return 'error' as const;
  return 'pending' as const;
}

function roleLabel(roleCode?: string) {
  if (!roleCode) return '—';
  return STAFF_ROLE_OPTIONS.find((r) => r.value === roleCode)?.label ?? roleCode.replace(/_/g, ' ');
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

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<StaffMember | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['insurer', 'employees', 'overview'],
    queryFn: () => staffApi.getOverview(),
  });

  const { data: listData, isLoading: listLoading, error } = useQuery({
    queryKey: ['insurer', 'employees', 'list', page, pageSize],
    queryFn: () => staffApi.list(page, pageSize),
  });

  const { data: detailEmployee, isLoading: detailLoading } = useQuery({
    queryKey: ['insurer', 'employees', 'detail', selectedEmployee?.id],
    queryFn: () => staffApi.get(selectedEmployee!.id),
    enabled: detailOpen && Boolean(selectedEmployee?.id),
  });

  const displayEmployee = detailEmployee ?? selectedEmployee;

  const invalidateEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ['insurer', 'employees'] });
  };

  const createMutation = useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => {
      invalidateEmployees();
      setFormOpen(false);
      toast.success(t('inviteSent'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStaffInput }) => staffApi.update(id, input),
    onSuccess: (updated) => {
      invalidateEmployees();
      setFormOpen(false);
      setSelectedEmployee(updated);
      toast.success(t('updated'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const deactivateMutation = useMutation({
    mutationFn: staffApi.deactivate,
    onSuccess: () => {
      invalidateEmployees();
      setDeactivateOpen(false);
      setDetailOpen(false);
      setSelectedEmployee(null);
      toast.success(t('deactivated'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const resendMutation = useMutation({
    mutationFn: staffApi.resendInvite,
    onSuccess: () => toast.success(t('inviteResent')),
    onError: () => toast.error(tCommon('error')),
  });

  const employees = listData?.content ?? [];
  const isLoading = overviewLoading || listLoading;

  const openCreate = () => {
    setFormMode('create');
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const openEdit = (employee: StaffMember) => {
    setFormMode('edit');
    setSelectedEmployee(employee);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const openDetail = (employee: StaffMember) => {
    setSelectedEmployee(employee);
    setDetailOpen(true);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Button variant="pill-accent" className="gap-2" onClick={openCreate}>
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
            <InsurerStatCard label={t('total')} value={overview?.totalStaff ?? 0} icon={Users} />
            <InsurerStatCard label={t('pendingInvites')} value={overview?.pendingInvites ?? 0} icon={Mail} />
            <InsurerStatCard label={t('active')} value={overview?.activeStaff ?? 0} icon={Users} />
            <InsurerStatCard
              label={t('pendingEnrollment')}
              value={(overview?.pendingPasswordChange ?? 0) + (overview?.pendingEmailVerification ?? 0)}
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
                <Card
                  key={employee.id}
                  className="cursor-pointer border-brand-border/60 transition-shadow hover:shadow-card"
                  onClick={() => openDetail(employee)}
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-brand-primary-dark">{employee.fullName}</p>
                      <p className="text-sm text-brand-muted">{employee.email}</p>
                      <p className="text-xs text-brand-muted">
                        {roleLabel(employee.roleCode ?? employee.roles[0])}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Badge variant={enrollmentBadge(employee.enrollmentStatus)}>
                        {staffEnrollmentLabel(employee.enrollmentStatus)}
                      </Badge>
                      <span className="text-xs text-brand-muted">{staffStatusLabel(employee.status)}</span>
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
                      {employee.status !== 'DISABLED' && employee.enrollmentStatus !== 'DISABLED' && (
                        <Button size="sm" variant="ghost" onClick={() => openEdit(employee)}>
                          {t('editEmployee')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {listData && (
            <InsurerPagination
              page={page}
              pageSize={pageSize}
              totalPages={listData.totalPages}
              totalElements={listData.totalElements}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        employee={selectedEmployee}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(input) => {
          if (formMode === 'edit' && selectedEmployee) {
            updateMutation.mutate({ id: selectedEmployee.id, input: input as UpdateStaffInput });
          } else {
            createMutation.mutate(input as Parameters<typeof staffApi.create>[0]);
          }
        }}
      />

      <EmployeeDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        employee={displayEmployee}
        onEdit={() => displayEmployee && openEdit(displayEmployee)}
        onDeactivate={() => setDeactivateOpen(true)}
        onResendInvite={() => displayEmployee && resendMutation.mutate(displayEmployee.id)}
        resendLoading={resendMutation.isPending}
        deactivateLoading={deactivateMutation.isPending || detailLoading}
      />

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={t('deactivateTitle')}
        description={t('deactivateConfirm', { name: selectedEmployee?.fullName ?? '' })}
        confirmLabel={t('deactivate')}
        onConfirm={() => selectedEmployee && deactivateMutation.mutate(selectedEmployee.id)}
        loading={deactivateMutation.isPending}
      />
    </PageContainer>
  );
}

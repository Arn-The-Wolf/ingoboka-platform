'use client';

import { useTranslations } from 'next-intl';
import { Mail, Pencil, UserX } from 'lucide-react';
import type { StaffMember } from '@/lib/api/staff';
import { staffEnrollmentLabel, staffStatusLabel } from '@/lib/insurer-status';
import { STAFF_ROLE_OPTIONS } from '@/lib/api/staff';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function enrollmentBadge(status: string) {
  if (status === 'COMPLETED') return 'active' as const;
  if (status === 'DISABLED') return 'error' as const;
  return 'pending' as const;
}

function roleLabel(roleCode?: string) {
  if (!roleCode) return '—';
  return STAFF_ROLE_OPTIONS.find((r) => r.value === roleCode)?.label ?? roleCode.replace(/_/g, ' ');
}

interface EmployeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: StaffMember | null;
  onEdit: () => void;
  onDeactivate: () => void;
  onResendInvite: () => void;
  resendLoading?: boolean;
  deactivateLoading?: boolean;
}

export function EmployeeDetailDialog({
  open,
  onOpenChange,
  employee,
  onEdit,
  onDeactivate,
  onResendInvite,
  resendLoading,
  deactivateLoading,
}: EmployeeDetailDialogProps) {
  const t = useTranslations('insurer.employees');
  const tCommon = useTranslations('common');

  if (!employee) return null;

  const isDisabled =
    employee.status === 'DISABLED' ||
    employee.status === 'LOCKED' ||
    employee.enrollmentStatus === 'DISABLED';
  const canResend = employee.status === 'PENDING_ACTIVATION' || employee.enrollmentStatus === 'PENDING';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('detailTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-lg font-semibold text-brand-primary-dark">{employee.fullName}</p>
            <p className="text-sm text-brand-muted">{employee.email}</p>
            {employee.phoneNumber && (
              <p className="text-sm text-brand-muted">{employee.phoneNumber}</p>
            )}
          </div>
          <dl className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">{t('role')}</dt>
              <dd className="font-medium">{roleLabel(employee.roleCode ?? employee.roles[0])}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">{tCommon('status')}</dt>
              <dd>
                <Badge variant={enrollmentBadge(employee.enrollmentStatus)}>
                  {staffEnrollmentLabel(employee.enrollmentStatus)}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-brand-muted">{t('accountStatus')}</dt>
              <dd className="font-medium">{staffStatusLabel(employee.status)}</dd>
            </div>
            {employee.createdAt && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-brand-muted">{t('joined')}</dt>
                <dd>{new Date(employee.createdAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {canResend && !isDisabled && (
            <Button
              variant="outline"
              size="sm"
              loading={resendLoading}
              onClick={onResendInvite}
              className="gap-1"
            >
              <Mail className="h-3.5 w-3.5" />
              {t('resendInvite')}
            </Button>
          )}
          {!isDisabled && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
                <Pencil className="h-3.5 w-3.5" />
                {t('editEmployee')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                loading={deactivateLoading}
                onClick={onDeactivate}
                className="gap-1"
              >
                <UserX className="h-3.5 w-3.5" />
                {t('deactivate')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

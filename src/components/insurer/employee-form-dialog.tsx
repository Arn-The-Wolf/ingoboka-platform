'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminSelect } from '@/components/admin/admin-select';
import { STAFF_ROLE_OPTIONS, type CreateStaffInput } from '@/lib/api/staff';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateStaffInput) => void;
  loading?: boolean;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: EmployeeFormDialogProps) {
  const t = useTranslations('insurer.employees');
  const tCommon = useTranslations('common');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [roleCode, setRoleCode] = useState('CLAIMS_OFFICER');

  useEffect(() => {
    if (!open) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setRoleCode('CLAIMS_OFFICER');
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      roleCode,
      inviteOnly: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inviteTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('firstName')}</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('lastName')}</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('email')}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('phone')}</Label>
            <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('role')}</Label>
            <AdminSelect
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              options={STAFF_ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
            />
          </div>
          <p className="text-sm text-brand-muted">{t('inviteHint')}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            variant="pill-accent"
            loading={loading}
            disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
            onClick={handleSubmit}
          >
            {t('sendInvite')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

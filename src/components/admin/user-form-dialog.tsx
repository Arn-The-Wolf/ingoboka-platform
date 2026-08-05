'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { UserPlus, Pencil } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { ManagedUser, RwandaAddress } from '@/types';
import { roleLabel } from '@/lib/status-label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSelect } from './admin-select';
import { RwandaAddressSelect } from './rwanda-address-select';
import { useAdminToast } from './admin-toast';

/** Role codes an admin can assign from the console. */
const ROLE_CODES = [
  'PLATFORM_ADMIN',
  'PARTNER_ADMIN',
  'INSURER_PRODUCT_MANAGER',
  'UNDERWRITER',
  'CLAIMS_OFFICER',
  'CLAIMS_SUPERVISOR',
  'FINANCE_OFFICER',
  'CUSTOMER_SUPPORT',
  'COMPLIANCE_AUDITOR',
  'AGENT',
];

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this user; otherwise it creates a new one. */
  user?: ManagedUser | null;
}

const emptyAddress: RwandaAddress = { country: 'Rwanda' };

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const t = useTranslations('admin');
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(user);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState('AGENT');
  const [organizationId, setOrganizationId] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [address, setAddress] = useState<RwandaAddress>(emptyAddress);

  const { data: organizations } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.listOrganizations(),
  });

  useEffect(() => {
    if (!open) return;
    if (user) {
      setFirstName(user.firstName ?? user.fullName.split(' ')[0] ?? '');
      setLastName(user.lastName ?? user.fullName.split(' ').slice(1).join(' ') ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '');
      setRoleCode(user.roleCode ?? 'AGENT');
      setOrganizationId(user.organizationId ?? '');
      setAddress({
        province: user.province,
        district: user.district,
        sector: user.sector,
        cell: user.cell,
        village: user.village,
        country: user.country ?? 'Rwanda',
      });
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setRoleCode('AGENT');
      setOrganizationId('');
      setDefaultPassword('');
      setAddress(emptyAddress);
    }
  }, [open, user]);

  const roleOptions = useMemo(
    () => ROLE_CODES.map((code) => ({ value: code, label: roleLabel(code) })),
    []
  );
  const orgOptions = useMemo(
    () => (organizations ?? []).map((o) => ({ value: o.id, label: o.name })),
    [organizations]
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const addr = {
        province: address.province,
        district: address.district,
        sector: address.sector,
        cell: address.cell,
        village: address.village,
      };
      if (user) {
        await adminApi.updateManagedUser(user.id, {
          firstName,
          lastName,
          email: email || undefined,
          phoneNumber: phone || undefined,
          ...addr,
        });
        if (roleCode && roleCode !== user.roleCode) {
          await adminApi.updateManagedUserRoles(user.id, roleCode);
        }
      } else {
        await adminApi.createManagedUser({
          firstName,
          lastName,
          email,
          phoneNumber: phone || undefined,
          roleCode,
          organizationId: organizationId || undefined,
          defaultPassword: defaultPassword || undefined,
          ...addr,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'managed-users'] });
      toast.success(isEdit ? t('userUpdated') : t('userCreated'));
      onOpenChange(false);
    },
    onError: () => toast.error(t('saveError')),
  });

  const canSubmit = firstName.trim() && lastName.trim() && (isEdit || email.trim()) && roleCode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="h-5 w-5 text-brand-primary" /> : <UserPlus className="h-5 w-5 text-brand-primary" />}
            {isEdit ? t('editUser') : t('createUser')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? user?.email ?? user?.phone ?? '' : t('newUser')}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div>label]:mb-1.5 [&>div>label]:block">
            <div>
              <Label htmlFor="uf-first">{t('firstName')}</Label>
              <Input id="uf-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="uf-last">{t('lastName')}</Label>
              <Input id="uf-last" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="uf-email">{t('email')}</Label>
              <Input id="uf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required={!isEdit} />
            </div>
            <div>
              <Label htmlFor="uf-phone">{t('phone')} <span className="text-brand-muted">({t('optional')})</span></Label>
              <Input id="uf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2507…" />
            </div>
            <div>
              <Label htmlFor="uf-role">{t('roleField')}</Label>
              <AdminSelect id="uf-role" value={roleCode} options={roleOptions} onChange={(e) => setRoleCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="uf-org">{t('organization')} <span className="text-brand-muted">({t('optional')})</span></Label>
              <AdminSelect id="uf-org" value={organizationId} placeholder="—" options={orgOptions} onChange={(e) => setOrganizationId(e.target.value)} />
            </div>
            {!isEdit && (
              <div className="sm:col-span-2">
                <Label htmlFor="uf-pass">{t('defaultPassword')} <span className="text-brand-muted">({t('optional')})</span></Label>
                <Input id="uf-pass" value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)} placeholder="••••••••" />
                <p className="mt-1 text-xs text-brand-muted">{t('defaultPasswordHint')}</p>
              </div>
            )}
          </div>

          <RwandaAddressSelect value={address} onChange={setAddress} idPrefix="uf-addr" />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit} loading={mutation.isPending}>
              {isEdit ? t('update') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

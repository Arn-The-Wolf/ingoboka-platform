'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, CheckCircle2, Pencil } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { Organization } from '@/lib/api/admin';
import type { PartnerCreateInput, PartnerUpdateInput } from '@/types';
import { orgStatusLabel, orgTypeLabel, orgCodeLabel } from '@/lib/status-label';
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
import { useAdminToast } from './admin-toast';

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this partner; otherwise it creates a new one. */
  partner?: Organization | null;
}

const createInitial: PartnerCreateInput = {
  name: '',
  code: '',
  type: 'INSURER',
  registrationNumber: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  addressLine: '',
  district: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminDefaultPassword: '',
};

const editInitial: PartnerUpdateInput = {
  name: '',
  registrationNumber: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  addressLine: '',
  district: '',
};

export function PartnerFormDialog({ open, onOpenChange, partner }: PartnerFormDialogProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(partner);

  const [createForm, setCreateForm] = useState<PartnerCreateInput>(createInitial);
  const [editForm, setEditForm] = useState<PartnerUpdateInput>(editInitial);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowSuccess(false);
    if (partner) {
      setEditForm({
        name: partner.name,
        registrationNumber: '',
        contactEmail: partner.contactEmail ?? '',
        contactPhone: '',
        website: '',
        addressLine: '',
        district: '',
      });
      adminApi.getPartner(partner.id).then((detail) => {
        setEditForm({
          name: detail.name,
          registrationNumber: detail.registrationNumber ?? '',
          contactEmail: detail.contactEmail ?? '',
          contactPhone: detail.contactPhone ?? '',
          website: detail.website ?? '',
          addressLine: detail.addressLine ?? '',
          district: detail.district ?? '',
        });
      }).catch(() => {});
    } else {
      setCreateForm(createInitial);
    }
  }, [open, partner]);

  const setCreate = (patch: Partial<PartnerCreateInput>) =>
    setCreateForm((f) => ({ ...f, ...patch }));
  const setEdit = (patch: Partial<PartnerUpdateInput>) =>
    setEditForm((f) => ({ ...f, ...patch }));

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createPartner({
        ...createForm,
        registrationNumber: createForm.registrationNumber || undefined,
        contactEmail: createForm.contactEmail || undefined,
        contactPhone: createForm.contactPhone || undefined,
        website: createForm.website || undefined,
        addressLine: createForm.addressLine || undefined,
        district: createForm.district || undefined,
        adminPhone: createForm.adminPhone || undefined,
        adminDefaultPassword: createForm.adminDefaultPassword || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      setShowSuccess(true);
      toast.success(t('partnerCreated'));
      setTimeout(() => onOpenChange(false), 1400);
    },
    onError: () => toast.error(t('saveError')),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updatePartner(partner!.id, {
        name: editForm.name,
        registrationNumber: editForm.registrationNumber || undefined,
        contactEmail: editForm.contactEmail || undefined,
        contactPhone: editForm.contactPhone || undefined,
        website: editForm.website || undefined,
        addressLine: editForm.addressLine || undefined,
        district: editForm.district || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'partner', partner!.id] });
      toast.success(t('partnerUpdated'));
      onOpenChange(false);
    },
    onError: () => toast.error(t('saveError')),
  });

  const mutation = isEdit ? updateMutation : createMutation;
  const canSubmit = isEdit
    ? Boolean(editForm.name?.trim())
    : Boolean(
        createForm.name.trim() &&
          createForm.code.trim() &&
          createForm.adminFirstName.trim() &&
          createForm.adminLastName.trim() &&
          createForm.adminEmail.trim()
      );

  const successLabel = isEdit ? t('partnerUpdated') : t('partnerCreated');
  const displayName = isEdit ? editForm.name : createForm.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-success/15">
              <CheckCircle2 className="h-9 w-9 text-brand-success" />
            </div>
            <p className="text-lg font-bold text-brand-primary-dark">{successLabel}</p>
            <p className="text-sm text-brand-muted">{displayName}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEdit ? (
                  <Pencil className="h-5 w-5 text-brand-primary" />
                ) : (
                  <Building2 className="h-5 w-5 text-brand-primary" />
                )}
                {isEdit ? t('editPartner') : t('createPartner')}
              </DialogTitle>
              <DialogDescription>
                {isEdit ? t('editPartnerDesc') : t('newPartner')}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) mutation.mutate();
              }}
              className="space-y-4"
            >
              {isEdit && partner && (
                <div className="rounded-xl border border-brand-border/70 bg-brand-surface-container-low/40 p-3 text-sm">
                  <p className="text-brand-muted">
                    {t('partnerCode')}: <span className="font-medium text-brand-primary-dark">{orgCodeLabel(partner.slug)}</span>
                    {' · '}
                    {t('partnerType')}: <span className="font-medium text-brand-primary-dark">{orgTypeLabel(partner.organizationType)}</span>
                    {' · '}
                    {tCommon('status')}: <span className="font-medium text-brand-primary-dark">{orgStatusLabel(partner.status)}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div>label]:mb-1.5 [&>div>label]:block">
                <div>
                  <Label htmlFor="pf-name">{t('partnerName')}</Label>
                  <Input
                    id="pf-name"
                    value={isEdit ? editForm.name : createForm.name}
                    onChange={(e) =>
                      isEdit ? setEdit({ name: e.target.value }) : setCreate({ name: e.target.value })
                    }
                    required
                  />
                </div>
                {!isEdit && (
                  <>
                    <div>
                      <Label htmlFor="pf-code">{t('partnerCode')}</Label>
                      <Input
                        id="pf-code"
                        value={createForm.code}
                        onChange={(e) => setCreate({ code: e.target.value.toUpperCase() })}
                        placeholder="ACME"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pf-type">{t('partnerType')}</Label>
                      <AdminSelect
                        id="pf-type"
                        value={createForm.type}
                        options={[
                          { value: 'INSURER', label: t('typeInsurer') },
                          { value: 'PARTNER', label: t('typePartner') },
                        ]}
                        onChange={(e) => setCreate({ type: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="pf-reg">
                    {t('registrationNumber')}{' '}
                    <span className="text-brand-muted">({t('optional')})</span>
                  </Label>
                  <Input
                    id="pf-reg"
                    value={isEdit ? editForm.registrationNumber : createForm.registrationNumber}
                    onChange={(e) =>
                      isEdit
                        ? setEdit({ registrationNumber: e.target.value })
                        : setCreate({ registrationNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pf-cemail">
                    {t('contactEmail')}{' '}
                    <span className="text-brand-muted">({t('optional')})</span>
                  </Label>
                  <Input
                    id="pf-cemail"
                    type="email"
                    value={isEdit ? editForm.contactEmail : createForm.contactEmail}
                    onChange={(e) =>
                      isEdit
                        ? setEdit({ contactEmail: e.target.value })
                        : setCreate({ contactEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pf-cphone">
                    {t('contactPhone')}{' '}
                    <span className="text-brand-muted">({t('optional')})</span>
                  </Label>
                  <Input
                    id="pf-cphone"
                    value={isEdit ? editForm.contactPhone : createForm.contactPhone}
                    onChange={(e) =>
                      isEdit
                        ? setEdit({ contactPhone: e.target.value })
                        : setCreate({ contactPhone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pf-web">
                    {t('website')}{' '}
                    <span className="text-brand-muted">({t('optional')})</span>
                  </Label>
                  <Input
                    id="pf-web"
                    value={isEdit ? editForm.website : createForm.website}
                    onChange={(e) =>
                      isEdit ? setEdit({ website: e.target.value }) : setCreate({ website: e.target.value })
                    }
                    placeholder="https://"
                  />
                </div>
                <div>
                  <Label htmlFor="pf-addr">
                    {t('addressLine')}{' '}
                    <span className="text-brand-muted">({t('optional')})</span>
                  </Label>
                  <Input
                    id="pf-addr"
                    value={isEdit ? editForm.addressLine : createForm.addressLine}
                    onChange={(e) =>
                      isEdit
                        ? setEdit({ addressLine: e.target.value })
                        : setCreate({ addressLine: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pf-district">
                    {t('district')}{' '}
                    <span className="text-brand-muted">({t('optional')})</span>
                  </Label>
                  <Input
                    id="pf-district"
                    value={isEdit ? editForm.district : createForm.district}
                    onChange={(e) =>
                      isEdit ? setEdit({ district: e.target.value }) : setCreate({ district: e.target.value })
                    }
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="rounded-xl border border-brand-border/70 bg-brand-surface-container-low/40 p-4">
                  <p className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('partnerAdmin')}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div>label]:mb-1.5 [&>div>label]:block">
                    <div>
                      <Label htmlFor="pf-afirst">{t('adminFirstName')}</Label>
                      <Input
                        id="pf-afirst"
                        value={createForm.adminFirstName}
                        onChange={(e) => setCreate({ adminFirstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pf-alast">{t('adminLastName')}</Label>
                      <Input
                        id="pf-alast"
                        value={createForm.adminLastName}
                        onChange={(e) => setCreate({ adminLastName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pf-aemail">{t('adminEmail')}</Label>
                      <Input
                        id="pf-aemail"
                        type="email"
                        value={createForm.adminEmail}
                        onChange={(e) => setCreate({ adminEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pf-aphone">
                        {t('adminPhone')}{' '}
                        <span className="text-brand-muted">({t('optional')})</span>
                      </Label>
                      <Input
                        id="pf-aphone"
                        value={createForm.adminPhone}
                        onChange={(e) => setCreate({ adminPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="pill-accent"
                  disabled={!canSubmit}
                  loading={mutation.isPending}
                >
                  {isEdit ? t('save') : t('create')}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

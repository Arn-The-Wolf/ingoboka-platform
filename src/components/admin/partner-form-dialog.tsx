'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { PartnerCreateInput } from '@/types';
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
}

const initial: PartnerCreateInput = {
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

export function PartnerFormDialog({ open, onOpenChange }: PartnerFormDialogProps) {
  const t = useTranslations('admin');
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PartnerCreateInput>(initial);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setShowSuccess(false);
    }
  }, [open]);

  const set = (patch: Partial<PartnerCreateInput>) => setForm((f) => ({ ...f, ...patch }));

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createPartner({
        ...form,
        registrationNumber: form.registrationNumber || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        website: form.website || undefined,
        addressLine: form.addressLine || undefined,
        district: form.district || undefined,
        adminPhone: form.adminPhone || undefined,
        adminDefaultPassword: form.adminDefaultPassword || undefined,
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

  const canSubmit =
    form.name.trim() && form.code.trim() && form.adminFirstName.trim() && form.adminLastName.trim() && form.adminEmail.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center animate-scale-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-success/15">
              <CheckCircle2 className="h-9 w-9 text-brand-success" />
            </div>
            <p className="text-lg font-bold text-brand-primary-dark">{t('partnerCreated')}</p>
            <p className="text-sm text-brand-muted">{form.name}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-primary" />
                {t('createPartner')}
              </DialogTitle>
              <DialogDescription>{t('newPartner')}</DialogDescription>
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
                  <Label htmlFor="pf-name">{t('partnerName')}</Label>
                  <Input id="pf-name" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="pf-code">{t('partnerCode')}</Label>
                  <Input id="pf-code" value={form.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="ACME" required />
                </div>
                <div>
                  <Label htmlFor="pf-type">{t('partnerType')}</Label>
                  <AdminSelect
                    id="pf-type"
                    value={form.type}
                    options={[
                      { value: 'INSURER', label: t('typeInsurer') },
                      { value: 'PARTNER', label: t('typePartner') },
                    ]}
                    onChange={(e) => set({ type: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="pf-reg">{t('registrationNumber')} <span className="text-brand-muted">({t('optional')})</span></Label>
                  <Input id="pf-reg" value={form.registrationNumber} onChange={(e) => set({ registrationNumber: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="pf-cemail">{t('contactEmail')} <span className="text-brand-muted">({t('optional')})</span></Label>
                  <Input id="pf-cemail" type="email" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="pf-cphone">{t('contactPhone')} <span className="text-brand-muted">({t('optional')})</span></Label>
                  <Input id="pf-cphone" value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="pf-web">{t('website')} <span className="text-brand-muted">({t('optional')})</span></Label>
                  <Input id="pf-web" value={form.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />
                </div>
                <div>
                  <Label htmlFor="pf-addr">{t('addressLine')} <span className="text-brand-muted">({t('optional')})</span></Label>
                  <Input id="pf-addr" value={form.addressLine} onChange={(e) => set({ addressLine: e.target.value })} />
                </div>
              </div>

              <div className="rounded-xl border border-brand-border/70 bg-brand-surface-container-low/40 p-4">
                <p className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('partnerAdmin')}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div>label]:mb-1.5 [&>div>label]:block">
                  <div>
                    <Label htmlFor="pf-afirst">{t('adminFirstName')}</Label>
                    <Input id="pf-afirst" value={form.adminFirstName} onChange={(e) => set({ adminFirstName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="pf-alast">{t('adminLastName')}</Label>
                    <Input id="pf-alast" value={form.adminLastName} onChange={(e) => set({ adminLastName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="pf-aemail">{t('adminEmail')}</Label>
                    <Input id="pf-aemail" type="email" value={form.adminEmail} onChange={(e) => set({ adminEmail: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="pf-aphone">{t('adminPhone')} <span className="text-brand-muted">({t('optional')})</span></Label>
                    <Input id="pf-aphone" value={form.adminPhone} onChange={(e) => set({ adminPhone: e.target.value })} />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="pill-accent" disabled={!canSubmit} loading={mutation.isPending}>
                  {t('create')}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Bell,
  Flag,
  Globe,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Server,
  Settings,
  Shield,
  Wrench,
  User,
} from 'lucide-react';
import { adminApi, staffApi, type PlatformSettings } from '@/lib/api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { ProfilePictureField } from '@/components/profile/profile-picture-field';
import type { ApiError } from '@/types';

type FormState = PlatformSettings;

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-brand-border/40 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-brand-primary-dark">{label}</p>
        <p className="text-xs text-brand-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const toast = useAdminToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getPlatformSettings(),
  });

  const { data: staffProfile } = useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => staffApi.getProfile(),
  });

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<PlatformSettings>) => adminApi.updatePlatformSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'settings'], updated);
      queryClient.invalidateQueries({ queryKey: ['platform', 'config'] });
      setForm(updated);
      toast.success(t('settingsSaved'));
    },
    onError: (err: ApiError) => {
      toast.error(t('settingsSaveError'), err.message);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => adminApi.refreshPlatformSettings(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'settings'], updated);
      setForm(updated);
      toast.success(t('settingsRefreshed'));
    },
    onError: () => toast.error(t('settingsSaveError')),
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onSave = () => {
    if (!form) return;
    saveMutation.mutate(form);
  };

  return (
    <PageContainer narrow>
      <PageHeader
        title={t('settings')}
        subtitle={t('platformConfigDesc')}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => refreshMutation.mutate()}
              loading={refreshMutation.isPending}
            >
              <RefreshCw className="h-4 w-4" />
              {t('refreshCache')}
            </Button>
            <Button className="gap-2" onClick={onSave} loading={saveMutation.isPending} disabled={!form}>
              <Save className="h-4 w-4" />
              {tCommon('save')}
            </Button>
          </div>
        }
      />

      {isLoading && <ListSkeleton rows={6} />}
      {error && !isLoading && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      <Card className="mb-6 border-brand-border/60 shadow-card">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('personalProfile')}</h2>
          </div>
          <ProfilePictureField
            fullName={staffProfile?.fullName}
            profilePictureUrl={staffProfile?.profilePictureUrl ?? undefined}
          />
        </CardContent>
      </Card>

      {form && (
        <div className="space-y-4">
          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-light">
                  <Settings className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{t('brandingSection')}</p>
                  <p className="text-xs text-brand-muted">{t('brandingSectionHint')}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('platformName')}</Label>
                  <Input value={form.platformName} onChange={(e) => update('platformName', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('brandingTagline')}</Label>
                  <Input
                    value={form.brandingTagline}
                    onChange={(e) => update('brandingTagline', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    {t('defaultLocale')}
                  </Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.defaultLocale}
                    onChange={(e) => update('defaultLocale', e.target.value)}
                  >
                    <option value="rw">Kinyarwanda (rw)</option>
                    <option value="en">English (en)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('defaultCurrency')}</Label>
                  <Input
                    value={form.defaultCurrency}
                    onChange={(e) => update('defaultCurrency', e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Wrench className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{t('opsSection')}</p>
                  <p className="text-xs text-brand-muted">{t('opsSectionHint')}</p>
                </div>
              </div>
              <ToggleRow
                label={t('maintenanceMode')}
                description={t('maintenanceModeHint')}
                checked={form.maintenanceMode}
                onChange={(v) => update('maintenanceMode', v)}
              />
              <ToggleRow
                label={t('registrationEnabled')}
                description={t('registrationEnabledHint')}
                checked={form.registrationEnabled}
                onChange={(v) => update('registrationEnabled', v)}
              />
              <ToggleRow
                label={t('selfServiceClaimsEnabled')}
                description={t('selfServiceClaimsEnabledHint')}
                checked={form.selfServiceClaimsEnabled}
                onChange={(v) => update('selfServiceClaimsEnabled', v)}
              />
              <ToggleRow
                label={t('requireKycBeforeEnrollment')}
                description={t('requireKycBeforeEnrollmentHint')}
                checked={form.requireKycBeforeEnrollment}
                onChange={(v) => update('requireKycBeforeEnrollment', v)}
              />
              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('defaultPolicyGraceDays')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={form.defaultPolicyGraceDays}
                    onChange={(e) => update('defaultPolicyGraceDays', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Server className="h-3.5 w-3.5" />
                    {t('apiBaseUrl')}
                  </Label>
                  <Input value={form.apiBaseUrl} onChange={(e) => update('apiBaseUrl', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Flag className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{t('featuresSection')}</p>
                  <p className="text-xs text-brand-muted">{t('featuresSectionHint')}</p>
                </div>
              </div>
              <ToggleRow
                label={t('ussdEnabled')}
                description={t('ussdEnabledHint')}
                checked={form.ussdEnabled}
                onChange={(v) => update('ussdEnabled', v)}
              />
              <ToggleRow
                label={t('agentAssistedEnabled')}
                description={t('agentAssistedEnabledHint')}
                checked={form.agentAssistedEnabled}
                onChange={(v) => update('agentAssistedEnabled', v)}
              />
            </CardContent>
          </Card>

          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Bell className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{t('notificationsSection')}</p>
                  <p className="text-xs text-brand-muted">{t('notificationsSectionHint')}</p>
                </div>
              </div>
              <ToggleRow
                label={t('emailNotificationsEnabled')}
                description={t('emailNotificationsEnabledHint')}
                checked={form.emailNotificationsEnabled}
                onChange={(v) => update('emailNotificationsEnabled', v)}
              />
              <ToggleRow
                label={t('smsNotificationsEnabled')}
                description={t('smsNotificationsEnabledHint')}
                checked={form.smsNotificationsEnabled}
                onChange={(v) => update('smsNotificationsEnabled', v)}
              />
              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {t('supportEmail')}
                  </Label>
                  <Input
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => update('supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    {t('supportPhone')}
                  </Label>
                  <Input value={form.supportPhone} onChange={(e) => update('supportPhone', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-border/60 shadow-card">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Shield className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{t('limitsSection')}</p>
                  <p className="text-xs text-brand-muted">{t('limitsSectionHint')}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('maxLoginAttempts')}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={form.maxLoginAttempts}
                    onChange={(e) => update('maxLoginAttempts', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('apiRateLimitPerMinute')}</Label>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    value={form.apiRateLimitPerMinute}
                    onChange={(e) => update('apiRateLimitPerMinute', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

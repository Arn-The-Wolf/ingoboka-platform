'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, Lock, Mail, Phone, Save, User } from 'lucide-react';
import { authApi, insurerApi, staffApi } from '@/lib/api';
import { useAdminToast } from '@/components/admin/admin-toast';
import { CurrencyToggle } from '@/components/insurer/currency-toggle';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePictureField } from '@/components/profile/profile-picture-field';
import { useAuthStore } from '@/store/auth-store';
import { useCurrency } from '@/hooks/use-currency';

export default function InsurerSettingsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'INSURER_ADMIN';
  const { currency, setCurrency, fx } = useCurrency();

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'settings'],
    queryFn: () => insurerApi.getSettings(),
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => staffApi.getProfile(),
  });

  const [orgName, setOrgName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [website, setWebsite] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const settings = data as Record<string, unknown> | undefined;

  useEffect(() => {
    if (!settings) return;
    if (settings.name) setOrgName(String(settings.name));
    if (settings.registrationNumber) setRegistrationNumber(String(settings.registrationNumber));
    if (settings.contactEmail) setContactEmail(String(settings.contactEmail));
    if (settings.contactPhone) setContactPhone(String(settings.contactPhone));
    if (settings.addressLine) setAddressLine(String(settings.addressLine));
    if (settings.district) setDistrict(String(settings.district));
    if (settings.website) setWebsite(String(settings.website));
  }, [settings]);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPersonalEmail(profile.email);
    setPersonalPhone(profile.phoneNumber ?? '');
  }, [profile]);

  const saveOrgMutation = useMutation({
    mutationFn: () =>
      insurerApi.updateSettings({
        name: orgName,
        registrationNumber,
        contactEmail,
        contactPhone,
        addressLine,
        district,
        website,
        displayCurrency: currency,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurer', 'settings'] });
      toast.success(t('settingsSaved'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      staffApi.updateProfile({
        firstName,
        lastName,
        email: personalEmail,
        phoneNumber: personalPhone || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
      toast.success(t('profileSaved'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      toast.success(t('passwordChanged'));
    },
    onError: () => toast.error(tCommon('error')),
  });

  if (isLoading || profileLoading) {
    return (
      <PageContainer narrow>
        <PageSkeleton cards={2} showHeader={false} />
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader title={t('settings')} subtitle={t('settingsSubtitleExtended')} />

      {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

      <div className="mb-6">
        <CurrencyToggle
          currency={currency}
          onChange={setCurrency}
          fxSource={fx?.source}
        />
      </div>

      {isAdmin && (
        <Card className="mb-6 border-brand-border/60 shadow-card">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-brand-primary" />
              <h2 className="text-lg font-semibold text-brand-primary-dark">{t('orgSettings')}</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('orgName')}</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('registrationNumber')}</Label>
                <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-muted" />
                  {t('contactEmail')}
                </Label>
                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-muted" />
                  {t('contactPhone')}
                </Label>
                <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('addressLine')}</Label>
                <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('district')}</Label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('website')}</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>
              </div>
            </div>

            <Button
              className="mt-6 gap-2"
              variant="pill-accent"
              onClick={() => saveOrgMutation.mutate()}
              loading={saveOrgMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {tCommon('save')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 border-brand-border/60 shadow-card">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <User className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('personalSettings')}</h2>
          </div>

          <ProfilePictureField
            fullName={profile?.fullName}
            profilePictureUrl={profile?.profilePictureUrl ?? undefined}
          />

          <div className="space-y-4 pt-6">
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
              <Label>{t('contactEmail')}</Label>
              <Input type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('contactPhone')}</Label>
              <Input type="tel" value={personalPhone} onChange={(e) => setPersonalPhone(e.target.value)} />
            </div>
          </div>

          <Button
            className="mt-6 gap-2"
            variant="pill-accent"
            onClick={() => saveProfileMutation.mutate()}
            loading={saveProfileMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {t('saveProfile')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-brand-border/60 shadow-card">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <Lock className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-brand-primary-dark">{t('changePassword')}</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('currentPassword')}</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('newPassword')}</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>

          <Button
            className="mt-6 gap-2"
            variant="outline"
            onClick={() => passwordMutation.mutate()}
            loading={passwordMutation.isPending}
            disabled={!currentPassword || newPassword.length < 8}
          >
            {t('updatePassword')}
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

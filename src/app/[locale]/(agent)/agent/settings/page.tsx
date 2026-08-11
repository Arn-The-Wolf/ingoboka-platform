'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Lock, Save, User } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { authApi, staffApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { useAuthStore } from '@/store/auth-store';
import { useAdminToast } from '@/components/admin/admin-toast';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePictureField } from '@/components/profile/profile-picture-field';

export default function AgentSettingsPage() {
  const t = useTranslations('agent');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const setAuth = useAuthStore((s) => s.setAuth);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['staff', 'profile'],
    queryFn: () => staffApi.getProfile(),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPersonalEmail(profile.email);
    setPersonalPhone(profile.phoneNumber ?? '');
  }, [profile]);

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      staffApi.updateProfile({
        firstName,
        lastName,
        email: personalEmail,
        phoneNumber: personalPhone || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
      if (updated.requiresEmailVerification) {
        updateUser({
          email: updated.email,
          requiresEmailVerification: true,
          emailVerified: false,
          status: 'PENDING_EMAIL_VERIFICATION',
        });
        toast.info(t('profileSaved'), tAuth('verifyEmailAfterChange'));
        router.replace('/verify-email');
        return;
      }
      toast.success(t('profileSaved'));
    },
    onError: (err) => toast.error(tCommon('error'), getApiErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: (result) => {
      setCurrentPassword('');
      setNewPassword('');
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success(t('passwordChanged'));
      if (result.user.requiresEmailVerification) {
        router.replace('/verify-email');
      }
    },
    onError: (err) => toast.error(tCommon('error'), getApiErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <PageContainer narrow>
        <PageSkeleton cards={2} showHeader={false} />
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader title={t('settings')} subtitle={t('settingsSubtitle')} />

      {error && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
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

'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { BadgeCheck, IdCard } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { customerApi, customerApiExt } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useAuthStore } from '@/store/auth-store';
import { ProfilePictureField } from '@/components/profile/profile-picture-field';
import { UserAvatar } from '@/components/ui/user-avatar';

export default function ProfilePage() {
  const t = useTranslations('citizen.profile');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const queryClient = useQueryClient();
  const storedUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [emailDraft, setEmailDraft] = useState(storedUser?.email ?? '');

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => customerApi.getMe(),
  });

  const user = profile ?? storedUser;

  useEffect(() => {
    if (user?.email) setEmailDraft(user.email);
  }, [user?.email]);

  const emailMutation = useMutation({
    mutationFn: () => customerApi.updateAccount({ email: emailDraft }),
    onSuccess: (account) => {
      updateUser({
        email: account.email,
        requiresEmailVerification: account.requiresEmailVerification,
        emailVerified: account.emailVerified,
        status: account.status,
      });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      if (account.requiresEmailVerification) {
        router.replace('/verify-email');
      }
    },
  });

  const kycMutation = useMutation({
    mutationFn: () => customerApiExt.submitKyc(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
  });

  if (isLoading && !user) {
    return (
      <>
        <CitizenHeader title={t('title')} />
        <PageSkeleton cards={2} showHeader={false} />
      </>
    );
  }

  const verified = user?.verified;
  const emailChanged = emailDraft.trim().toLowerCase() !== (user?.email ?? '').trim().toLowerCase();

  return (
    <>
      <CitizenHeader title={t('title')} />
      <PageContainer narrow>
        <PageHeader title={t('title')} subtitle={t('subtitle')} backHref="/dashboard" />

        {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

        <Card className="mb-6 border-brand-border/60 shadow-card">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <UserAvatar name={user?.fullName} imageUrl={user?.profilePictureUrl} className="h-12 w-12" />
              <div>
                <p className="text-lg font-semibold text-brand-primary-dark">{user?.fullName}</p>
                <p className="text-sm text-brand-muted">{user?.phone ?? user?.email}</p>
              </div>
            </div>

            <ProfilePictureField
              fullName={user?.fullName}
              profilePictureUrl={user?.profilePictureUrl}
            />

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-email">{t('email')}</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                />
                <p className="text-xs text-brand-muted">{tAuth('verifyEmailAfterChange')}</p>
              </div>
              {emailMutation.error && (
                <Alert variant="error">{getApiErrorMessage(emailMutation.error) ?? tCommon('error')}</Alert>
              )}
              {emailChanged && (
                <Button
                  variant="pill-accent"
                  loading={emailMutation.isPending}
                  disabled={!emailDraft.trim()}
                  onClick={() => emailMutation.mutate()}
                >
                  {t('saveEmail')}
                </Button>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-brand-border/40 pt-6 text-sm">
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <dt className="text-brand-muted">{t('nationalId')}</dt>
                <dd className="font-medium">{user?.nationalId ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-muted">{t('verification')}</dt>
                <dd className="font-medium">{verified ? t('verified') : t('pending')}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-brand-primary/20 shadow-card">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <IdCard className="h-5 w-5 text-brand-primary" />
              <h2 className="text-lg font-semibold text-brand-primary-dark">{t('kycTitle')}</h2>
            </div>
            <p className="mb-4 text-sm text-brand-muted">{t('kycBody')}</p>
            {kycMutation.isSuccess && (
              <Alert variant="default" className="mb-4">
                <BadgeCheck className="h-4 w-4" />
                {t('kycSubmitted')}
              </Alert>
            )}
            {kycMutation.error && (
              <Alert variant="error" className="mb-4">
                {getApiErrorMessage(kycMutation.error) ?? tCommon('error')}
              </Alert>
            )}
            <Button
              variant="pill-accent"
              disabled={verified}
              loading={kycMutation.isPending}
              onClick={() => kycMutation.mutate()}
            >
              {verified ? t('alreadyVerified') : t('submitKyc')}
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </>
  );
}

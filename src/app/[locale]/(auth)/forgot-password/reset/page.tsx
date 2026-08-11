'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { PasswordField } from '@/components/auth/fields';
import { authApi } from '@/lib/api';
import {
  clearPendingPasswordReset,
  readPendingPasswordReset,
} from '@/lib/auth/pending-password-reset';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators';
import type { ApiError } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export default function ForgotPasswordResetPage() {
  const t = useTranslations('auth.forgotPassword');
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const pending = readPendingPasswordReset();
    setResetToken(pending?.resetToken ?? null);
    setReady(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const reset = useMutation({
    mutationFn: (newPassword: string) => authApi.resetPassword(resetToken!, newPassword),
    onSuccess: () => {
      clearPendingPasswordReset();
      router.replace('/login?reset=success');
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    reset.mutate(data.newPassword);
  };

  const error = reset.error as ApiError | null;

  if (!ready) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!resetToken) {
    return (
      <div className="space-y-6">
        <AuthBackButton href="/forgot-password/verify" />
        <Alert variant="warning">{t('missingToken')}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthBackButton href="/forgot-password/verify" />
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
          <LockKeyhole className="h-6 w-6 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('resetTitle')}</h1>
        <p className="text-sm text-brand-muted">{t('resetSubtitle')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{getApiErrorMessage(error) ?? error.message}</Alert>}
        <PasswordField
          id="newPassword"
          label={t('newPassword')}
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordField
          id="confirmPassword"
          label={t('confirmPassword')}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button
          type="submit"
          className="w-full py-6"
          variant="pill-accent"
          loading={reset.isPending}
        >
          {t('resetPassword')}
        </Button>
      </form>
    </div>
  );
}

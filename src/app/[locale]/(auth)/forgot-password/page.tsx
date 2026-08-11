'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { TextField } from '@/components/auth/fields';
import { authApi } from '@/lib/api';
import { savePendingPasswordReset } from '@/lib/auth/pending-password-reset';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { forgotPasswordEmailSchema, type ForgotPasswordEmailFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordEmailFormData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: '' },
  });

  const requestReset = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: (_data, email) => {
      savePendingPasswordReset({ email, resetToken: null });
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    },
  });

  const onSubmit = (data: ForgotPasswordEmailFormData) => {
    requestReset.mutate(data.email.trim().toLowerCase());
  };

  const error = requestReset.error as ApiError | null;

  return (
    <div className="space-y-6">
      <AuthBackButton href="/login" />
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
          <KeyRound className="h-6 w-6 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('title')}</h1>
        <p className="text-sm text-brand-muted">{t('subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{getApiErrorMessage(error) ?? error.message}</Alert>}
        <TextField
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          label={t('emailLabel')}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button
          type="submit"
          className="w-full py-6"
          variant="pill-accent"
          loading={requestReset.isPending}
        >
          {t('sendCode')}
        </Button>
      </form>
    </div>
  );
}

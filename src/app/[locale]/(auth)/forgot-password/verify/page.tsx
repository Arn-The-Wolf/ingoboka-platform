'use client';

import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { OtpPinInput } from '@/components/ui/otp-pin-input';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { authApi } from '@/lib/api';
import { maskEmail } from '@/lib/auth/phone';
import {
  readPendingPasswordReset,
  resolvePendingPasswordResetFromUrl,
  savePendingPasswordReset,
} from '@/lib/auth/pending-password-reset';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { otpSchema, type OtpFormData } from '@/lib/validators';
import type { ApiError } from '@/types';
import { Spinner } from '@/components/ui/spinner';

export default function ForgotPasswordVerifyPage() {
  const t = useTranslations('auth.forgotPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const resolved =
      resolvePendingPasswordResetFromUrl(searchParams.get('email')) ??
      readPendingPasswordReset();
    setEmail(resolved?.email ?? null);
    setReady(true);
  }, [searchParams]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const verify = useMutation({
    mutationFn: (code: string) => authApi.verifyPasswordResetOtp(email!, code),
    onSuccess: (data) => {
      savePendingPasswordReset({ email: email!, resetToken: data.resetToken });
      router.push('/forgot-password/reset');
    },
  });

  const resend = useMutation({
    mutationFn: () => authApi.resendPasswordResetOtp(email!),
  });

  const runVerify = useCallback(
    (code: string) => {
      if (!email) return;
      verify.mutate(code);
    },
    [email, verify]
  );

  const submitCode = useCallback(
    (code: string) => {
      if (code.length === 6 && !verify.isPending) {
        runVerify(code);
      }
    },
    [verify.isPending, runVerify]
  );

  const onSubmit = (data: OtpFormData) => {
    runVerify(data.code);
  };

  const error = verify.error as ApiError | null;

  if (!ready) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="space-y-6">
        <AuthBackButton href="/forgot-password" />
        <Alert variant="warning">{t('missingEmail')}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthBackButton href="/forgot-password" />
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
          <ShieldCheck className="h-6 w-6 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('verifyTitle')}</h1>
        <p className="text-sm text-brand-muted">
          {t('verifySubtitle', { email: maskEmail(email) })}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="error">{getApiErrorMessage(error) ?? error.message}</Alert>
        )}
        {resend.isSuccess && <Alert variant="success">{t('resendSuccess')}</Alert>}
        <div className="space-y-3">
          <Label htmlFor="otp-pin" className="sr-only">
            {t('otpLabel')}
          </Label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <OtpPinInput
                id="otp-pin"
                value={field.value}
                onChange={field.onChange}
                onComplete={submitCode}
                disabled={verify.isPending}
                error={errors.code?.message}
              />
            )}
          />
          <p className="text-center text-xs text-brand-muted">{t('otpHint')}</p>
        </div>
        <Button type="submit" className="w-full py-6" variant="pill" loading={verify.isPending}>
          {t('verifyCode')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-brand-primary"
          loading={resend.isPending}
          disabled={verify.isPending}
          onClick={() => resend.mutate()}
        >
          {t('resendCode')}
        </Button>
      </form>
    </div>
  );
}

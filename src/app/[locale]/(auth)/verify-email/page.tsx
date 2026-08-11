'use client';

import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { OtpPinInput } from '@/components/ui/otp-pin-input';
import { WelcomeOverlay, useWelcomeSequence } from '@/components/auth/welcome-overlay';
import { authApi } from '@/lib/api';
import { getPostAuthPath } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { maskEmail } from '@/lib/auth/phone';
import { otpSchema, type OtpFormData } from '@/lib/validators';
import { useAuthStore } from '@/store/auth-store';
import type { ApiError } from '@/types';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const welcome = useWelcomeSequence();
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendPending, setResendPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const finishVerification = useCallback(
    (result: Awaited<ReturnType<typeof authApi.confirmEmailOtp>>) => {
      setAuth(result.user, result.accessToken, result.refreshToken);
      welcome.start(() => {
        window.location.href = `/${locale}${getPostAuthPath(result.user)}`;
      });
    },
    [setAuth, welcome, locale]
  );

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    setTokenLoading(true);
    authApi
      .confirmEmailVerification(token)
      .then(async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const tokens = await authApi.refresh(refreshToken);
          if (tokens.user) {
            finishVerification({
              ...tokens,
              user: tokens.user,
            } as Awaited<ReturnType<typeof authApi.confirmEmailOtp>>);
            return;
          }
        }
        window.location.href = `/${locale}/login`;
      })
      .catch((err: ApiError) => {
        setTokenError(getApiErrorMessage(err) ?? t('verifyEmailTokenInvalid'));
      })
      .finally(() => setTokenLoading(false));
  }, [searchParams, finishVerification, locale, t]);

  const runVerify = useCallback(
    async (code: string) => {
      setSubmitError(null);
      try {
        const result = await authApi.confirmEmailOtp(code);
        finishVerification(result);
      } catch (err) {
        setSubmitError(getApiErrorMessage(err) ?? t('verifyEmailFailed'));
      }
    },
    [finishVerification, t]
  );

  const onSubmit = (data: OtpFormData) => {
    void runVerify(data.code);
  };

  const handleResend = async () => {
    setResendPending(true);
    setResendSuccess(false);
    setSubmitError(null);
    try {
      await authApi.resendEmailVerificationOtp();
      setResendSuccess(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err) ?? t('verifyEmailResendFailed'));
    } finally {
      setResendPending(false);
    }
  };

  const email = user?.email ?? '';
  const description = email
    ? t('verifyEmailInboxHint', { email: maskEmail(email) })
    : t('verifyEmailInboxHintGeneric');

  if (tokenLoading) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-sm text-brand-muted">{t('verifyingEmailLink')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeOverlay
        state={welcome.state}
        title={t('verifyEmailSuccessTitle')}
        subtitle={t('verifyEmailSuccessSubtitle')}
        loadingText={t('verifying')}
      />

      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
          <MailCheck className="h-6 w-6 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('verifyEmailTitle')}</h1>
        <p className="text-sm text-brand-muted">{description}</p>
        <p className="text-xs text-brand-muted">{t('verifyEmailSpamHint')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {tokenError && <Alert variant="error">{tokenError}</Alert>}
        {submitError && <Alert variant="error">{submitError}</Alert>}
        {resendSuccess && <Alert variant="success">{t('verifyEmailResendSuccess')}</Alert>}

        <div className="space-y-3">
          <Label htmlFor="email-otp-pin" className="sr-only">
            {t('otp')}
          </Label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <OtpPinInput
                id="email-otp-pin"
                value={field.value}
                onChange={field.onChange}
                onComplete={(code) => {
                  if (code.length === 6 && !welcome.active) void runVerify(code);
                }}
                disabled={welcome.active}
                error={errors.code?.message}
              />
            )}
          />
          <p className="text-center text-xs text-brand-muted">{t('otpPinHint')}</p>
        </div>

        <Button type="submit" className="w-full py-6" variant="pill" loading={welcome.active}>
          {t('verifyEmailSubmit')}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-brand-primary"
          loading={resendPending}
          disabled={welcome.active}
          onClick={() => void handleResend()}
        >
          {t('verifyEmailResend')}
        </Button>
      </form>
    </div>
  );
}

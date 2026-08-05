'use client';

import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { OtpPinInput } from '@/components/ui/otp-pin-input';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { WelcomeOverlay, useWelcomeSequence } from '@/components/auth/welcome-overlay';
import { getPostAuthPath, useResendOtp, useVerifyOtp } from '@/hooks/use-auth';
import { useOtpDeliveryConfig } from '@/hooks/use-otp-config';
import { useAuthStore } from '@/store/auth-store';
import { maskEmail } from '@/lib/auth/phone';
import { otpSchema, type OtpFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function VerifyPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const verifyHint = useAuthStore((s) => s.verifyHint);
  const verify = useVerifyOtp();
  const resend = useResendOtp();
  const welcome = useWelcomeSequence();
  const { data: otpConfig } = useOtpDeliveryConfig();

  const isEmailMode = otpConfig?.deliveryChannel === 'EMAIL' || otpConfig?.requiresEmail;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' },
  });

  const runVerify = useCallback(
    (code: string) => {
      verify.mutate(code, {
        onSuccess: (result) => {
          welcome.start(() => {
            window.location.href = `/${locale}${getPostAuthPath(result.user)}`;
          });
        },
      });
    },
    [verify, welcome, locale]
  );

  const submitCode = useCallback(
    (code: string) => {
      if (code.length === 6 && !verify.isPending && !welcome.active) {
        runVerify(code);
      }
    },
    [verify.isPending, welcome.active, runVerify]
  );

  const onSubmit = (data: OtpFormData) => {
    runVerify(data.code);
  };

  const error = verify.error as ApiError | null;

  const description = (() => {
    if (verifyHint) return verifyHint;
    if (isEmailMode && pendingEmail) {
      return t('verifyCodeToEmail', { email: maskEmail(pendingEmail) });
    }
    if (pendingPhone) {
      return isEmailMode
        ? t('verifyEmailWithPhoneLogin', { phone: pendingPhone })
        : t('otpSent', { phone: pendingPhone });
    }
    return t('verifySubtitle');
  })();

  if (!pendingPhone) {
    return (
      <div className="space-y-6">
        <AuthBackButton href="/register" />
        <Alert variant="warning">{t('verifyNoPendingPhone')}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeOverlay
        state={welcome.state}
        title={t('verifiedTitle')}
        subtitle={t('verifiedSubtitle')}
        loadingText={t('verifying')}
      />
      <AuthBackButton href="/register" />
      <header className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
          <ShieldCheck className="h-6 w-6 text-brand-primary" />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary">{t('verifyAccount')}</h1>
        <p className="text-sm text-brand-muted">{description}</p>
      </header>

      <StepIndicator totalSteps={3} currentStep={2} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{error.message}</Alert>}
        {resend.isSuccess && (
          <Alert variant="success">
            {isEmailMode ? t('resendCodeToEmailSuccess') : t('resendCodeSuccess')}
          </Alert>
        )}
        <div className="space-y-3">
          <Label htmlFor="otp-pin" className="sr-only">
            {t('otp')}
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
                disabled={verify.isPending || welcome.active}
                error={errors.code?.message}
              />
            )}
          />
          <p className="text-center text-xs text-brand-muted">{t('otpPinHint')}</p>
        </div>
        <Button
          type="submit"
          className="w-full py-6"
          variant="pill"
          loading={verify.isPending || welcome.active}
        >
          {t('verify')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-brand-primary"
          loading={resend.isPending}
          disabled={welcome.active}
          onClick={() => resend.mutate()}
        >
          {isEmailMode ? t('resendCodeToEmail') : t('resendOtp')}
        </Button>
      </form>
    </div>
  );
}

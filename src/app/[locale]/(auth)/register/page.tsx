'use client';

import { UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { MailhogInboxHint } from '@/components/auth/mailhog-inbox-hint';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useRegister } from '@/hooks/use-auth';
import { useOtpDeliveryConfig } from '@/hooks/use-otp-config';
import { createRegisterSchema, type RegisterFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const registerMutation = useRegister();
  const { data: otpConfig } = useOtpDeliveryConfig();
  const requiresEmail = otpConfig?.requiresEmail ?? true;
  const isLogMode = otpConfig?.deliveryChannel === 'LOG';
  const isEmailMode = otpConfig?.deliveryChannel === 'EMAIL' || requiresEmail;

  const schema = useMemo(() => createRegisterSchema(requiresEmail), [requiresEmail]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword: _, email, ...rest } = data;
    registerMutation.mutate({
      ...rest,
      ...(email?.trim() ? { email: email.trim().toLowerCase() } : {}),
    });
  };

  const error = registerMutation.error as ApiError | null;

  return (
    <div className="space-y-6">
      <AuthBackButton href="/login" />
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-brand-primary">{t('register')}</h1>
        </div>
        <p className="text-sm text-brand-muted">{t('registerSubtitle')}</p>
      </header>

      <StepIndicator totalSteps={3} currentStep={1} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{error.message}</Alert>}
        {isLogMode && <Alert variant="warning">{t('otpLogModeWarning')}</Alert>}
        {isEmailMode && !isLogMode && <Alert variant="default">{t('registerEmailHint')}</Alert>}
        <MailhogInboxHint />

        <div className="space-y-2">
          <Label htmlFor="fullName">{t('fullName')}</Label>
          <Input id="fullName" error={errors.fullName?.message} {...register('fullName')} />
        </div>

        <fieldset className="space-y-4 rounded-xl border border-brand-border/60 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-brand-primary-dark">
            {t('contactDetails')}
          </legend>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <div className="flex h-12 items-center gap-2 rounded-lg border border-brand-border bg-white px-3 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
              <span className="border-r border-brand-border pr-2 text-sm font-medium text-brand-muted">
                +250
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="7XX XXX XXX"
                className="border-0 px-0 shadow-none focus-visible:ring-0"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <p className="text-xs text-brand-muted">{t('phoneLoginHint')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email')}
              {requiresEmail ? ' *' : ` (${t('optional')})`}
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="nationalId">{t('nationalId')}</Label>
          <Input id="nationalId" error={errors.nationalId?.message} {...register('nationalId')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
        <Button type="submit" className="w-full py-6" variant="pill" loading={registerMutation.isPending}>
          {t('register')}
        </Button>
      </form>
      <p className="text-center text-sm text-brand-muted">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-bold text-brand-primary hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { StepIndicator } from '@/components/ui/step-indicator';
import {
  AddressCascade,
  emptyAddressCascade,
} from '@/components/auth/address-cascade';
import {
  PasswordField,
  PasswordStrength,
  PhoneField,
  TextField,
} from '@/components/auth/fields';
import { WelcomeOverlay, useWelcomeSequence } from '@/components/auth/welcome-overlay';
import { useRegister } from '@/hooks/use-auth';
import { useOtpDeliveryConfig } from '@/hooks/use-otp-config';
import { createRegisterSchema, type RegisterFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

const TOTAL_STEPS = 4;

type StepField = keyof RegisterFormData;
const STEP_FIELDS: Record<number, StepField[]> = {
  1: ['firstName', 'lastName'],
  2: ['phone', 'nationalId'],
  3: ['province', 'district', 'sector', 'cell', 'village'],
  4: ['email', 'password', 'confirmPassword'],
};

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const registerMutation = useRegister();
  const welcome = useWelcomeSequence();
  const { data: otpConfig } = useOtpDeliveryConfig();
  const requiresEmail = otpConfig?.requiresEmail ?? true;
  const isEmailMode = otpConfig?.deliveryChannel === 'EMAIL' || requiresEmail;

  const schema = useMemo(() => createRegisterSchema(requiresEmail), [requiresEmail]);

  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      ...emptyAddressCascade,
      firstName: '',
      lastName: '',
      phone: '',
      nationalId: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') ?? '';
  const addressValue = {
    province: watch('province') ?? '',
    district: watch('district') ?? '',
    sector: watch('sector') ?? '',
    cell: watch('cell') ?? '',
    village: watch('village') ?? '',
  };

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = (data: RegisterFormData) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();
    registerMutation.mutate(
      {
        fullName,
        phone: data.phone,
        nationalId: data.nationalId,
        password: data.password,
        province: data.province,
        district: data.district,
        sector: data.sector,
        cell: data.cell,
        village: data.village,
        ...(data.email?.trim() ? { email: data.email.trim().toLowerCase() } : {}),
      },
      {
        onSuccess: () => {
          welcome.start(() => {
            window.location.href = `/${locale}/verify`;
          });
        },
      }
    );
  };

  const error = registerMutation.error as ApiError | null;
  const stepTitles = [t('step1Title'), t('step2Title'), t('step3Title'), t('step4Title')];

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeOverlay
        state={welcome.state}
        title={t('welcomeTitle')}
        subtitle={t('welcomeRegisterSubtitle')}
        loadingText={t('creatingAccount')}
      />

      {step === 1 ? <AuthBackButton href="/login" /> : null}

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">{t('register')}</h1>
            <p className="text-sm text-brand-muted">{t('registerSubtitle')}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <StepIndicator totalSteps={TOTAL_STEPS} currentStep={step} />
          <p className="text-xs font-medium text-brand-muted">
            {t('stepOf', { current: step, total: TOTAL_STEPS })} · {stepTitles[step - 1]}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && <Alert variant="error">{error.message}</Alert>}
        {step === 4 && isEmailMode && <Alert variant="default">{t('registerEmailHint')}</Alert>}

        {/* key forces the entrance animation to replay on each step change */}
        <div key={step} className="space-y-4 animate-fade-in">
          {step === 1 && (
            <>
              <TextField
                id="firstName"
                label={t('firstName')}
                autoComplete="given-name"
                placeholder={t('firstNamePlaceholder')}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <TextField
                id="lastName"
                label={t('lastName')}
                autoComplete="family-name"
                placeholder={t('lastNamePlaceholder')}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </>
          )}

          {step === 2 && (
            <>
              <PhoneField
                id="phone"
                label={t('phone')}
                placeholder="7XX XXX XXX"
                hint={t('phoneLoginHint')}
                error={errors.phone?.message}
                {...register('phone')}
              />
              <TextField
                id="nationalId"
                label={t('nationalId')}
                inputMode="numeric"
                maxLength={16}
                placeholder="1199780012345678"
                hint={t('nationalIdHint')}
                error={errors.nationalId?.message}
                {...register('nationalId')}
              />
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-brand-muted">{t('addressHint')}</p>
              <AddressCascade
                value={addressValue}
                onChange={(next) => {
                  setValue('province', next.province, { shouldValidate: true, shouldDirty: true });
                  setValue('district', next.district, { shouldValidate: true, shouldDirty: true });
                  setValue('sector', next.sector, { shouldValidate: true, shouldDirty: true });
                  setValue('cell', next.cell, { shouldValidate: true, shouldDirty: true });
                  setValue('village', next.village, { shouldValidate: true, shouldDirty: true });
                }}
                errors={{
                  province: errors.province?.message,
                  district: errors.district?.message,
                  sector: errors.sector?.message,
                  cell: errors.cell?.message,
                  village: errors.village?.message,
                }}
              />
            </>
          )}

          {step === 4 && (
            <>
              <TextField
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                label={`${t('email')}${requiresEmail ? ' *' : ` (${t('optional')})`}`}
                placeholder="name@example.com"
                hint={requiresEmail ? t('emailForVerification') : t('emailOptionalHint')}
                error={errors.email?.message}
                {...register('email')}
              />
              <div className="space-y-2">
                <PasswordField
                  id="password"
                  label={t('password')}
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <PasswordStrength
                  value={passwordValue}
                  label={t('passwordStrengthLabel')}
                  levels={[
                    t('strengthWeak'),
                    t('strengthFair'),
                    t('strengthGood'),
                    t('strengthStrong'),
                  ]}
                />
              </div>
              <PasswordField
                id="confirmPassword"
                label={t('confirmPassword')}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 gap-2 rounded-full py-6"
              onClick={goBack}
              disabled={registerMutation.isPending || welcome.active}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('previous')}
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              className="flex-[2] gap-2 rounded-full py-6"
              variant="pill"
              onClick={goNext}
            >
              {t('next')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-[2] rounded-full py-6"
              variant="pill-accent"
              loading={registerMutation.isPending || welcome.active}
            >
              {t('register')}
            </Button>
          )}
        </div>
      </form>

      <p className="text-center text-sm text-brand-muted">
        {t('hasAccount')}{' '}
        <LoadingLink href="/login" className="font-bold text-brand-primary hover:underline">
          {t('login')}
        </LoadingLink>
      </p>
    </div>
  );
}

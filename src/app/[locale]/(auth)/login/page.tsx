'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { DemoCredentialsPanel } from '@/components/auth/demo-credentials-panel';
import { PasswordField, PhoneField, TextField } from '@/components/auth/fields';
import { WelcomeOverlay, useWelcomeSequence } from '@/components/auth/welcome-overlay';
import { getPostAuthPath, useLogin } from '@/hooks/use-auth';
import { useAdminToast } from '@/components/admin/admin-toast';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const login = useLogin();
  const welcome = useWelcomeSequence();
  const toast = useAdminToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginMethod: 'phone',
      phone: '',
      email: '',
      password: '',
    },
  });

  const loginMethod = watch('loginMethod');

  const onSubmit = (data: LoginFormData) => {
    login.mutate(
      {
        password: data.password,
        ...(data.loginMethod === 'email'
          ? { email: data.email.trim().toLowerCase() }
          : { phone: normalizeCitizenPhone(data.phone) }),
      },
      {
        onSuccess: (result) => {
          toast.success(t('loginSuccess'));
          welcome.start(() => {
            window.location.href = `/${locale}${getPostAuthPath(result.user)}`;
          });
        },
        onError: (err) => {
          const apiErr = err as ApiError;
          toast.error(t('loginFailed'), apiErr?.message);
        },
      }
    );
  };

  const error = login.error as ApiError | null;

  return (
    <div className="space-y-5">
      <WelcomeOverlay
        state={welcome.state}
        title={t('welcomeBackTitle')}
        subtitle={t('welcomeBackSubtitle')}
        loadingText={t('signingIn')}
      />

      <AuthBackButton href="/" />
      <header className="space-y-1 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-brand-primary">{t('login')}</h1>
        <p className="text-sm text-brand-muted">{t('loginSubtitle')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{error.message}</Alert>}

        <div className="space-y-1.5 animate-fade-in-up stagger-1">
          <span className="text-sm font-medium text-brand-primary-dark">{t('loginMethod')}</span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={loginMethod === 'phone' ? 'pill' : 'outline'}
              className="w-full rounded-full py-2.5 text-sm"
              onClick={() => setValue('loginMethod', 'phone')}
            >
              {t('loginWithPhone')}
            </Button>
            <Button
              type="button"
              variant={loginMethod === 'email' ? 'pill' : 'outline'}
              className="w-full rounded-full py-2.5 text-sm"
              onClick={() => setValue('loginMethod', 'email')}
            >
              {t('loginWithEmail')}
            </Button>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-2">
          {loginMethod === 'phone' ? (
            <PhoneField
              id="phone"
              label={t('phone')}
              placeholder="7XX XXX XXX"
              error={errors.phone?.message}
              {...register('phone')}
            />
          ) : (
            <TextField
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              label={t('email')}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          )}
        </div>

        <input type="hidden" {...register('loginMethod')} />

        <div className="animate-fade-in-up stagger-3">
          <PasswordField
            id="password"
            label={t('password')}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          className="w-full py-6 animate-fade-in-up stagger-4"
          variant="pill-accent"
          loading={login.isPending || welcome.active}
        >
          {t('login')}
        </Button>
      </form>

      <div className="animate-fade-in-up stagger-5">
        <DemoCredentialsPanel
          onFill={(demo) => {
            setValue('loginMethod', demo.loginMethod);
            if (demo.loginMethod === 'email') {
              setValue('email', demo.identifier);
            } else {
              setValue('phone', demo.identifier);
            }
            setValue('password', demo.password);
          }}
        />
      </div>

      <p className="text-center text-sm text-brand-muted">
        {t('noAccount')}{' '}
        <LoadingLink href="/register" className="font-bold text-brand-primary hover:underline">
          {t('register')}
        </LoadingLink>
      </p>
    </div>
  );
}

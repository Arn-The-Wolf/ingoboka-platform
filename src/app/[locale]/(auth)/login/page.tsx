'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AuthBackButton } from '@/components/layout/auth-back-button';
import { useLogin } from '@/hooks/use-auth';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function LoginPage() {
  const t = useTranslations('auth');
  const login = useLogin();

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
      phone: '0780000001',
      email: '',
      password: 'Ingoboka@2026',
    },
  });

  const loginMethod = watch('loginMethod');

  const onSubmit = (data: LoginFormData) => {
    login.mutate({
      password: data.password,
      ...(data.loginMethod === 'email'
        ? { email: data.email.trim().toLowerCase() }
        : { phone: normalizeCitizenPhone(data.phone) }),
    });
  };

  const error = login.error as ApiError | null;

  return (
    <div className="space-y-6">
      <AuthBackButton href="/" />
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-brand-primary">{t('login')}</h1>
        <p className="text-sm text-brand-muted">{t('loginSubtitle')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="error">{error.message}</Alert>}

        <div className="space-y-2">
          <Label>{t('loginMethod')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={loginMethod === 'phone' ? 'pill' : 'outline'}
              className="w-full rounded-full"
              onClick={() => setValue('loginMethod', 'phone')}
            >
              {t('loginWithPhone')}
            </Button>
            <Button
              type="button"
              variant={loginMethod === 'email' ? 'pill' : 'outline'}
              className="w-full rounded-full"
              onClick={() => setValue('loginMethod', 'email')}
            >
              {t('loginWithEmail')}
            </Button>
          </div>
        </div>

        {loginMethod === 'phone' ? (
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
        ) : (
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <p className="text-xs text-brand-muted">{t('emailLoginHint')}</p>
          </div>
        )}

        <input type="hidden" {...register('loginMethod')} />

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        <Button type="submit" className="w-full py-6" variant="pill-accent" loading={login.isPending}>
          {t('login')}
        </Button>
      </form>
      <p className="text-center text-sm text-brand-muted">
        {t('noAccount')}{' '}
        <LoadingLink href="/register" className="font-bold text-brand-primary hover:underline">
          {t('register')}
        </LoadingLink>
      </p>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AuthHeader } from '@/components/layout/auth-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function LoginPage() {
  const t = useTranslations('auth');
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '0780000001', password: 'Ingoboka@2026' },
  });

  const onSubmit = (data: LoginFormData) => {
    const isEmail = data.identifier.includes('@');
    login.mutate({
      password: data.password,
      ...(isEmail ? { email: data.identifier } : { phone: data.identifier }),
    });
  };

  const error = login.error as ApiError | null;

  return (
    <div className="space-y-8">
      <AuthHeader />
      <Card>
        <CardHeader>
          <CardTitle>{t('login')}</CardTitle>
          <CardDescription>{t('loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <Alert variant="error">{error.message}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="identifier">{t('phone')} / {t('email')}</Label>
              <Input
                id="identifier"
                placeholder="0780000001"
                error={errors.identifier?.message}
                {...register('identifier')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
            <Button type="submit" className="w-full" loading={login.isPending}>
              {t('login')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-brand-muted">
            {t('noAccount')}{' '}
            <Link href="/register" className="font-medium text-brand-primary hover:underline">
              {t('register')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

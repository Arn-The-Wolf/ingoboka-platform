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
import { useRegister } from '@/hooks/use-auth';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword: _, ...payload } = data;
    registerMutation.mutate(payload);
  };

  const error = registerMutation.error as ApiError | null;

  return (
    <div className="space-y-8">
      <AuthHeader />
      <Card>
        <CardHeader>
          <CardTitle>{t('register')}</CardTitle>
          <CardDescription>{t('registerSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <Alert variant="error">{error.message}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input id="fullName" error={errors.fullName?.message} {...register('fullName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                placeholder="07XXXXXXXX"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">{t('nationalId')}</Label>
              <Input
                id="nationalId"
                error={errors.nationalId?.message}
                {...register('nationalId')}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>
            <Button type="submit" className="w-full" loading={registerMutation.isPending}>
              {t('register')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-brand-muted">
            {t('hasAccount')}{' '}
            <Link href="/login" className="font-medium text-brand-primary hover:underline">
              {t('login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

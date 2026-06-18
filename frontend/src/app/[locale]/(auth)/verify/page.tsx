'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { AuthHeader } from '@/components/layout/auth-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyOtp } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { otpSchema, type OtpFormData } from '@/lib/validators';
import type { ApiError } from '@/types';

export default function VerifyPage() {
  const t = useTranslations('auth');
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const verify = useVerifyOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = (data: OtpFormData) => {
    verify.mutate(data.code);
  };

  const error = verify.error as ApiError | null;

  return (
    <div className="space-y-8">
      <AuthHeader />
      <Card>
        <CardHeader>
          <CardTitle>{t('verify')}</CardTitle>
          <CardDescription>
            {pendingPhone
              ? t('otpSent', { phone: pendingPhone })
              : t('verifySubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <Alert variant="error">{error.message}</Alert>}
            <div className="space-y-2">
              <Label htmlFor="code">{t('otp')}</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center text-lg tracking-widest"
                error={errors.code?.message}
                {...register('code')}
              />
            </div>
            <Button type="submit" className="w-full" loading={verify.isPending}>
              {t('verify')}
            </Button>
            <Button type="button" variant="ghost" className="w-full">
              {t('resendOtp')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

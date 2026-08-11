'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { authApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api/integration-helpers';
import { useAuthStore } from '@/store/auth-store';
import { getPostAuthPath } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

export default function ChangePasswordPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError(t('activate.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('activate.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.changePassword(currentPassword, newPassword);
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.replace(getPostAuthPath(result.user));
    } catch (err) {
      setError(getApiErrorMessage(err) ?? tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-brand-primary-dark">{t('changePasswordTitle')}</h1>
        <p className="text-sm text-brand-muted">{t('changePasswordSubtitle')}</p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <div className="space-y-2">
          <Label>{t('currentPassword')}</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('newPassword')}</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label>{t('confirmPassword')}</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" variant="pill-accent" loading={loading}>
          {t('changePasswordSubmit')}
        </Button>
      </form>
    </div>
  );
}

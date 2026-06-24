'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface AuthBackButtonProps {
  href: '/' | '/login' | '/register';
}

export function AuthBackButton({ href }: AuthBackButtonProps) {
  const t = useTranslations('common');

  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary-dark"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('back')}
    </Link>
  );
}

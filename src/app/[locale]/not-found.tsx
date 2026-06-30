import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-brand-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-brand-primary-dark">Page not found</h1>
      <p className="mt-2 max-w-md text-brand-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8">
        <Button variant="pill-accent">{t('back')}</Button>
      </Link>
    </div>
  );
}

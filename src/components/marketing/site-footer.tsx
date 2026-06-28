'use client';

import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LoadingLink } from '@/components/navigation/loading-link';

const SOCIAL_PLACEHOLDERS = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Linkedin, label: 'LinkedIn' },
] as const;

export function SiteFooter() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-border/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl font-bold text-brand-primary">{tCommon('appName')}</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">{t('footer.tagline')}</p>
            <div className="mt-4 flex gap-3" aria-label={t('footer.social')}>
              {SOCIAL_PLACEHOLDERS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border/60 text-brand-muted"
                  title={label}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('footer.company')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.company')}>
              <LoadingLink href="/" className="text-brand-muted hover:text-brand-primary">
                {t('nav.home')}
              </LoadingLink>
              <LoadingLink href="/about" className="text-brand-muted hover:text-brand-primary">
                {t('nav.about')}
              </LoadingLink>
              <LoadingLink href="/contact" className="text-brand-muted hover:text-brand-primary">
                {t('nav.contact')}
              </LoadingLink>
              <span className="text-brand-outline">{t('footer.careers')}</span>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('footer.product')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.product')}>
              <LoadingLink href="/features" className="text-brand-muted hover:text-brand-primary">
                {t('nav.features')}
              </LoadingLink>
              <LoadingLink href="/plans" className="text-brand-muted hover:text-brand-primary">
                {t('nav.plans')}
              </LoadingLink>
              <LoadingLink href="/how-it-works" className="text-brand-muted hover:text-brand-primary">
                {t('nav.howItWorks')}
              </LoadingLink>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('footer.legal')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.legal')}>
              <LoadingLink href="/privacy" className="text-brand-muted hover:text-brand-primary">
                {t('footer.privacy')}
              </LoadingLink>
              <LoadingLink href="/terms" className="text-brand-muted hover:text-brand-primary">
                {t('footer.terms')}
              </LoadingLink>
              <p className="text-xs leading-relaxed text-brand-outline">{t('footer.lawMention')}</p>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('footer.support')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.support')}>
              <LoadingLink href="/faq" className="text-brand-muted hover:text-brand-primary">
                {t('nav.faq')}
              </LoadingLink>
              <LoadingLink href="/login" className="text-brand-muted hover:text-brand-primary">
                {t('footer.login')}
              </LoadingLink>
              <LoadingLink href="/register" className="text-brand-muted hover:text-brand-primary">
                {t('footer.register')}
              </LoadingLink>
              <a
                href={`mailto:${t('footer.contactEmail')}`}
                className="text-brand-muted hover:text-brand-primary"
              >
                {t('footer.contactEmail')}
              </a>
            </nav>
          </div>
        </div>

        <p className="mt-10 border-t border-brand-border/40 pt-6 text-center text-xs text-brand-outline lg:text-left">
          {t('footer.copyright', { year })}
        </p>
      </div>
    </footer>
  );
}

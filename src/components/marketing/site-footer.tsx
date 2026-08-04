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
    <footer className="relative mt-0 overflow-hidden border-t-0 bg-gradient-to-br from-brand-primary via-brand-primary-darker to-brand-sidebar text-white">
      <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-brand-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl font-bold text-white">
              {tCommon('appName')}
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-accent align-middle" />
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{t('footer.tagline')}</p>
            <div className="mt-4 flex gap-3" aria-label={t('footer.social')}>
              {SOCIAL_PLACEHOLDERS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/80 transition-all hover:border-brand-accent hover:bg-brand-accent/15 hover:text-brand-accent cursor-pointer"
                  title={label}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-accent">{t('footer.company')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.company')}>
              <LoadingLink href="/" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.home')}
              </LoadingLink>
              <LoadingLink href="/about" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.about')}
              </LoadingLink>
              <LoadingLink href="/contact" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.contact')}
              </LoadingLink>
              <span className="text-white/60">{t('footer.careers')}</span>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-accent">{t('footer.product')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.product')}>
              <LoadingLink href="/features" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.features')}
              </LoadingLink>
              <LoadingLink href="/plans" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.plans')}
              </LoadingLink>
              <LoadingLink href="/how-it-works" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.howItWorks')}
              </LoadingLink>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-accent">{t('footer.legal')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.legal')}>
              <LoadingLink href="/privacy" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('footer.privacy')}
              </LoadingLink>
              <LoadingLink href="/terms" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('footer.terms')}
              </LoadingLink>
              <p className="text-xs leading-relaxed text-white/60">{t('footer.lawMention')}</p>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-brand-accent">{t('footer.support')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.support')}>
              <LoadingLink href="/faq" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('nav.faq')}
              </LoadingLink>
              <LoadingLink href="/login" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('footer.login')}
              </LoadingLink>
              <LoadingLink href="/register" className="text-white/80 transition-colors hover:text-brand-accent">
                {t('footer.register')}
              </LoadingLink>
              <a
                href={`mailto:${t('footer.contactEmail')}`}
                className="text-white/80 transition-colors hover:text-brand-accent"
              >
                {t('footer.contactEmail')}
              </a>
            </nav>
          </div>
        </div>

        <p className="mt-10 border-t border-brand-accent/20 pt-6 text-center text-xs text-white/70 lg:text-left">
          {t('footer.copyright', { year })}
        </p>
      </div>
    </footer>
  );
}

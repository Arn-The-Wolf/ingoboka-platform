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
    <footer className="border-t border-brand-border/60 bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl font-bold text-white">{tCommon('appName')}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{t('footer.tagline')}</p>
            <div className="mt-4 flex gap-3" aria-label={t('footer.social')}>
              {SOCIAL_PLACEHOLDERS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/80 hover:bg-white/10 hover:border-white/50 transition-all cursor-pointer"
                  title={label}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">{t('footer.company')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.company')}>
              <LoadingLink href="/" className="text-white/80 hover:text-white transition-colors">
                {t('nav.home')}
              </LoadingLink>
              <LoadingLink href="/about" className="text-white/80 hover:text-white transition-colors">
                {t('nav.about')}
              </LoadingLink>
              <LoadingLink href="/contact" className="text-white/80 hover:text-white transition-colors">
                {t('nav.contact')}
              </LoadingLink>
              <span className="text-white/60">{t('footer.careers')}</span>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">{t('footer.product')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.product')}>
              <LoadingLink href="/features" className="text-white/80 hover:text-white transition-colors">
                {t('nav.features')}
              </LoadingLink>
              <LoadingLink href="/plans" className="text-white/80 hover:text-white transition-colors">
                {t('nav.plans')}
              </LoadingLink>
              <LoadingLink href="/how-it-works" className="text-white/80 hover:text-white transition-colors">
                {t('nav.howItWorks')}
              </LoadingLink>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">{t('footer.legal')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.legal')}>
              <LoadingLink href="/privacy" className="text-white/80 hover:text-white transition-colors">
                {t('footer.privacy')}
              </LoadingLink>
              <LoadingLink href="/terms" className="text-white/80 hover:text-white transition-colors">
                {t('footer.terms')}
              </LoadingLink>
              <p className="text-xs leading-relaxed text-white/60">{t('footer.lawMention')}</p>
            </nav>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">{t('footer.support')}</p>
            <nav className="flex flex-col gap-2 text-sm" aria-label={t('footer.support')}>
              <LoadingLink href="/faq" className="text-white/80 hover:text-white transition-colors">
                {t('nav.faq')}
              </LoadingLink>
              <LoadingLink href="/login" className="text-white/80 hover:text-white transition-colors">
                {t('footer.login')}
              </LoadingLink>
              <LoadingLink href="/register" className="text-white/80 hover:text-white transition-colors">
                {t('footer.register')}
              </LoadingLink>
              <a
                href={`mailto:${t('footer.contactEmail')}`}
                className="text-white/80 hover:text-white transition-colors"
              >
                {t('footer.contactEmail')}
              </a>
            </nav>
          </div>
        </div>

        <p className="mt-10 border-t border-white/20 pt-6 text-center text-xs text-white/70 lg:text-left">
          {t('footer.copyright', { year })}
        </p>
      </div>
    </footer>
  );
}

'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { LoadingLink } from '@/components/navigation/loading-link';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { cn } from '@/lib/utils';

const NAV_LINKS: { href: string; labelKey: 'nav.home' | 'nav.features' | 'nav.howItWorks' | 'nav.plans' | 'nav.about' | 'nav.faq' | 'nav.contact'; exact?: boolean }[] = [
  { href: '/', labelKey: 'nav.home', exact: true },
  { href: '/features', labelKey: 'nav.features' },
  { href: '/how-it-works', labelKey: 'nav.howItWorks' },
  { href: '/plans', labelKey: 'nav.plans' },
  { href: '/about', labelKey: 'nav.about' },
  { href: '/faq', labelKey: 'nav.faq' },
  { href: '/contact', labelKey: 'nav.contact' },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (href: string, exact?: boolean) =>
    cn(
      'relative text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-brand-primary after:transition-all after:duration-300 hover:after:w-full',
      isActive(pathname, href, exact)
        ? 'text-brand-primary after:w-full'
        : 'text-brand-muted hover:text-brand-primary'
    );

  const mobileLinkClass = (href: string, exact?: boolean) =>
    cn(
      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      isActive(pathname, href, exact)
        ? 'bg-brand-primary-light text-brand-primary'
        : 'text-brand-muted hover:bg-brand-primary-light hover:text-brand-primary'
    );

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border/60 bg-brand-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-20 lg:px-8">
        <LoadingLink href="/" className="text-xl font-bold tracking-tight text-brand-primary transition-colors hover:text-brand-primary-dark lg:text-2xl">
          {tCommon('appName')}
        </LoadingLink>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <LoadingLink key={link.href} href={link.href} className={linkClass(link.href, link.exact)}>
              {t(link.labelKey)}
            </LoadingLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher />
          <LoadingLink href="/login">
            <Button variant="ghost" className="font-semibold">
              {t('login')}
            </Button>
          </LoadingLink>
          <LoadingLink href="/register">
            <Button variant="pill-accent" className="font-bold">
              {t('getStarted')}
            </Button>
          </LoadingLink>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-primary transition-colors hover:bg-brand-primary-light"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden border-t border-brand-border/60 bg-brand-background transition-all duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-4">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <LoadingLink
                key={link.href}
                href={link.href}
                className={mobileLinkClass(link.href, link.exact)}
                onClick={() => setMobileOpen(false)}
              >
                {t(link.labelKey)}
              </LoadingLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-brand-border/40 pt-3">
              <LoadingLink href="/login" className="w-full" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  {t('login')}
                </Button>
              </LoadingLink>
              <LoadingLink href="/register" className="w-full" onClick={() => setMobileOpen(false)}>
                <Button variant="pill-accent" className="w-full font-bold">
                  {t('getStarted')}
                </Button>
              </LoadingLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

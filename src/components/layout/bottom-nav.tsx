'use client';

import { useTranslations } from 'next-intl';
import { Home, Package, FileText, Users } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, labelKey: 'home' as const },
  { href: '/products', icon: Package, labelKey: 'products' as const },
  { href: '/claims/new', icon: FileText, labelKey: 'claims' as const },
  { href: '/dependants', icon: Users, labelKey: 'dependants' as const },
];

export function BottomNav() {
  const t = useTranslations('citizen');
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border/80 bg-brand-surface/95 pb-safe backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.labelKey}
              href={item.href}
              className={cn(
                'flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-brand-primary-light text-brand-primary'
                  : 'text-brand-muted hover:text-brand-primary-dark'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className="truncate">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

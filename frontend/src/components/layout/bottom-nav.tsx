'use client';

import { useTranslations } from 'next-intl';
import { Home, FileText, User } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, labelKey: 'home' as const },
  { href: '/dashboard', icon: FileText, labelKey: 'claims' as const },
  { href: '/dependants', icon: User, labelKey: 'dependants' as const },
];

export function BottomNav() {
  const t = useTranslations('citizen');
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-white pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.labelKey}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs transition-colors',
                active
                  ? 'text-brand-primary'
                  : 'text-brand-muted hover:text-brand-primary-dark'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

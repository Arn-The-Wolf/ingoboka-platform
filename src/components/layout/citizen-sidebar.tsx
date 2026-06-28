'use client';

import { useTranslations } from 'next-intl';
import { Home, Package, FileText, Users, LogOut, Shield } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn, getInitials } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './locale-switcher';

const navItems = [
  { href: '/dashboard', icon: Home, labelKey: 'home' as const },
  { href: '/products', icon: Package, labelKey: 'products' as const },
  { href: '/claims', icon: FileText, labelKey: 'claims.nav' as const },
  { href: '/dependants', icon: Users, labelKey: 'dependants' as const },
];

export function CitizenSidebar() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-brand-border bg-white">
      <div className="flex items-center gap-3 border-b border-brand-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-brand-primary-dark">{tCommon('appName')}</p>
          <p className="text-xs text-brand-muted">{t('policyWallet')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-primary-light text-brand-primary'
                  : 'text-brand-muted hover:bg-brand-surface-container-low hover:text-brand-primary-dark'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-border p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-medium text-brand-primary-dark">
              {getInitials(user?.fullName ?? 'Citizen')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-brand-primary-dark">
                {user?.fullName ?? 'Citizen'}
              </p>
              <p className="truncate text-xs text-brand-muted">{user?.phone ?? user?.email}</p>
            </div>
          </div>
          <LocaleSwitcher />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => logout.mutate()}
          loading={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          {tCommon('logout')}
        </Button>
      </div>
    </aside>
  );
}

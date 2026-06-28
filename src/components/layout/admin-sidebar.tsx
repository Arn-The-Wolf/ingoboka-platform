'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Building2,
  Users,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'overview' as const },
  { href: '/admin/users', icon: Users, labelKey: 'users' as const },
  { href: '/admin/organizations', icon: Building2, labelKey: 'organizations' as const },
  { href: '/admin/audit', icon: ScrollText, labelKey: 'audit' as const },
  { href: '/admin/settings', icon: Settings, labelKey: 'settings' as const },
];

export function AdminSidebar() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-border bg-white">
      <div className="border-b border-brand-border px-6 py-5">
        <p className="font-semibold text-brand-primary-dark">Ingoboka</p>
        <p className="text-xs text-brand-muted">{t('dashboard')}</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                active
                  ? 'bg-brand-primary-light text-brand-primary'
                  : 'text-brand-muted hover:bg-brand-background'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-brand-border p-4">
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

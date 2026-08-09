'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Package, FileText, Users, LogOut, Bell } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { IngobokaLogo } from '@/components/ui/ingoboka-logo';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';

const navItems = [
  { href: '/dashboard', icon: Home, labelKey: 'home' as const },
  { href: '/products', icon: Package, labelKey: 'products' as const },
  { href: '/claims', icon: FileText, labelKey: 'claims.nav' as const },
  { href: '/notifications', icon: Bell, labelKey: 'notifications.nav' as const },
  { href: '/dependants', icon: Users, labelKey: 'dependants' as const },
];

export function CitizenSidebar() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-brand-primary-darker bg-gradient-to-b from-brand-primary to-brand-primary-darker text-white transition-all duration-300 lg:flex',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div
        className={cn(
          'flex items-center border-b border-brand-primary-darker px-3 py-4',
          isCollapsed ? 'justify-center' : 'justify-between gap-2 px-4'
        )}
      >
        {isCollapsed ? (
          <SidebarToggle collapsed onToggle={() => setIsCollapsed(false)} />
        ) : (
          <>
            <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90">
              <IngobokaLogo theme="dark" size="sm" showWordmark />
            </Link>
            <SidebarToggle collapsed={false} onToggle={() => setIsCollapsed(true)} />
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <SidebarNavLink
              key={item.labelKey}
              href={item.href}
              active={active}
              collapsed={isCollapsed}
              title={isCollapsed ? t(item.labelKey) : undefined}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active && 'text-brand-accent')} />
              {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
            </SidebarNavLink>
          );
        })}
      </nav>

      <div className="border-t border-brand-primary-darker bg-brand-primary-darker/50 p-3">
        {!isCollapsed && (
          <Link
            href="/profile"
            className="mb-3 flex min-w-0 items-center gap-3 rounded-lg p-1 transition-colors hover:bg-brand-primary-darker/60"
          >
            <UserAvatar
              name={user?.fullName ?? t('profile.fallbackName')}
              imageUrl={user?.profilePictureUrl}
              initialsClassName="bg-brand-accent text-brand-primary-dark"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.fullName ?? t('profile.fallbackName')}
              </p>
              <p className="truncate text-xs text-blue-50/70">{user?.phone ?? user?.email}</p>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full text-blue-50 hover:bg-brand-primary-darker/60 hover:text-white',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          onClick={() => logout.mutate()}
          loading={logout.isPending}
          title={isCollapsed ? tCommon('logout') : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && tCommon('logout')}
        </Button>
      </div>
    </aside>
  );
}

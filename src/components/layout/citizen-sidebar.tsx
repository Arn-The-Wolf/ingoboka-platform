'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Package, FileText, Users, LogOut, Shield, Bell, Menu, X } from 'lucide-react';
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
    <>
      {/* Toggle Button - Desktop only */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed left-4 top-4 z-50 hidden lg:flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white shadow-lg transition-all hover:bg-green-500"
        aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 h-screen shrink-0 flex-col border-r border-green-700 bg-gradient-to-b from-green-600 to-green-700 transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <Link href="/" className={cn(
          "flex items-center gap-3 border-b border-green-700 px-6 py-5 transition-colors hover:bg-green-500",
          isCollapsed && "px-2 justify-center"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
            <Shield className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-bold text-white text-lg">{tCommon('appName')}</p>
            </div>
          )}
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
                    ? 'bg-green-800 text-white shadow-sm'
                    : 'text-green-50 hover:bg-green-700/60 hover:text-white',
                  isCollapsed && 'justify-center px-2'
                )}
                title={isCollapsed ? t(item.labelKey) : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-green-700 p-4 bg-green-800/50">
          {!isCollapsed && (
            <div className="mb-3 flex items-center justify-between gap-2">
              <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 transition-colors hover:bg-green-700/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white">
                  {getInitials(user?.fullName ?? t('profile.fallbackName'))}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.fullName ?? t('profile.fallbackName')}
                  </p>
                  <p className="truncate text-xs text-green-50/70">{user?.phone ?? user?.email}</p>
                </div>
              </Link>
              <LocaleSwitcher />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-green-50 hover:bg-green-700/60 hover:text-white",
              isCollapsed ? "justify-center px-2" : "justify-start"
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
    </>
  );
}

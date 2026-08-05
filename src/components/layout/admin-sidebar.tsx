'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  ScrollText,
  Settings,
  LogOut,
  Map,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'overview' as const },
  { href: '/admin/users', icon: Users, labelKey: 'users' as const },
  { href: '/admin/organizations', icon: Building2, labelKey: 'partners' as const },
  { href: '/admin/geography', icon: Map, labelKey: 'geography' as const },
  { href: '/admin/policies', icon: Shield, labelKey: 'policies' as const },
  { href: '/admin/audit', icon: ScrollText, labelKey: 'audit' as const },
  { href: '/admin/settings', icon: Settings, labelKey: 'settings' as const },
];

export function AdminSidebar() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const logout = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {isCollapsed && (
        <SidebarToggle
          collapsed
          floating
          onToggle={() => setIsCollapsed(false)}
          className="lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-brand-primary-darker bg-gradient-to-b from-brand-primary to-brand-primary-darker text-white transition-all duration-300',
          isCollapsed ? 'w-0 -translate-x-full lg:w-16 lg:translate-x-0' : 'w-64'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-brand-primary-darker px-3 py-4',
            isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between gap-2 px-4'
          )}
        >
          {isCollapsed ? (
            <SidebarToggle
              collapsed
              onToggle={() => setIsCollapsed(false)}
              className="hidden lg:flex"
            />
          ) : (
            <>
              <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <p className="truncate text-lg font-bold">Ingoboka</p>
              </Link>
              <SidebarToggle collapsed={false} onToggle={() => setIsCollapsed(true)} />
            </>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(item.href);
            return (
              <SidebarNavLink
                key={item.href}
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
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-blue-50 hover:bg-brand-primary-darker/60 hover:text-white',
              isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-start'
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

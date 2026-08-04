'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn, getInitials } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { SidebarToggle } from '@/components/layout/sidebar-toggle';
import { SidebarNavLink } from '@/components/layout/sidebar-nav-link';

const navItems = [
  { href: '/insurer/dashboard', icon: LayoutDashboard, labelKey: 'overview' as const, exact: true },
  { href: '/insurer/claims', icon: FileText, labelKey: 'claimsQueue' as const },
  { href: '/insurer/applications', icon: ClipboardList, labelKey: 'applicationsQueue' as const },
  { href: '/insurer/products', icon: Package, labelKey: 'products' as const },
  { href: '/insurer/reports', icon: BarChart3, labelKey: 'reports' as const },
  { href: '/insurer/partner', icon: Shield, labelKey: 'partner' as const },
  { href: '/insurer/settings', icon: Settings, labelKey: 'settings' as const },
];

const ROLE_LABELS: Record<string, string> = {
  INSURER_ADMIN: 'Partner Admin',
  INSURER_CLAIMS_OFFICER: 'Claims Officer',
};

export function Sidebar() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
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
            const active = item.exact
              ? pathname === item.href
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
          {!isCollapsed && (
            <div className="mb-3 flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-sm font-medium text-brand-primary-dark">
                {getInitials(user?.fullName ?? 'User')}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user?.fullName ?? 'User'}</p>
                <p className="truncate text-xs text-blue-50/70">
                  {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : ''}
                </p>
              </div>
            </div>
          )}
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

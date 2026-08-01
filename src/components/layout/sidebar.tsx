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
  Menu,
  X,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn, getInitials } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './locale-switcher';

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
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white shadow-lg transition-all hover:bg-green-500 lg:left-auto lg:right-4"
        aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 flex h-screen flex-col border-r border-green-700 bg-gradient-to-b from-green-600 to-green-700 text-white transition-all duration-300 z-40",
        isCollapsed ? "w-0 -translate-x-full lg:w-16 lg:translate-x-0" : "w-64"
      )}>
        <Link href="/" className={cn(
          "flex items-center gap-2 border-b border-green-700 px-6 py-5 transition-colors hover:bg-green-500",
          isCollapsed && "lg:px-2 lg:justify-center"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-lg">Ingoboka</p>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
              <Shield className="h-5 w-5" />
            </div>
          )}
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-green-800 text-white shadow-sm'
                    : 'text-green-50 hover:bg-green-700/60 hover:text-white',
                  isCollapsed && 'lg:justify-center lg:px-2'
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
            <>
              <div className="mb-3">
                <LocaleSwitcher />
              </div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white">
                  {getInitials(user?.fullName ?? 'User')}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user?.fullName ?? 'User'}</p>
                  <p className="truncate text-xs text-green-50/70">
                    {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : ''}
                  </p>
                </div>
              </div>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-green-50 hover:bg-green-700/60 hover:text-white",
              isCollapsed ? "lg:justify-center lg:px-2" : "justify-start"
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

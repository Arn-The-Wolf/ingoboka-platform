'use client';

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

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-primary-dark/20 bg-brand-primary-dark text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Ingoboka</p>
          <p className="text-xs text-white/70">{t('portalTitle')}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
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
                  ? 'bg-white/15 text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary text-sm font-medium text-white">
            {getInitials(user?.fullName ?? 'User')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.fullName ?? 'User'}</p>
            <p className="truncate text-xs text-white/60">
              {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
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

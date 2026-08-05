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
import { usePathname } from '@/i18n/routing';
import { cn, getInitials } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { StaffSidebar, type StaffNavItem } from '@/components/layout/staff-sidebar';
import { useStaffShell } from '@/components/layout/staff-shell';

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
  const { collapsed } = useStaffShell();

  const items: StaffNavItem[] = navItems.map((item) => ({
    href: item.href,
    icon: item.icon,
    label: t(item.labelKey),
    active: item.exact ? pathname === item.href : pathname.startsWith(item.href),
  }));

  return (
    <StaffSidebar
      items={items}
      footer={
        <>
          <div className={cn('mb-3 flex items-center gap-3 px-1', collapsed && 'xl:hidden')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-medium text-brand-primary-dark">
              {getInitials(user?.fullName ?? 'User')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.fullName ?? 'User'}</p>
              <p className="truncate text-xs text-blue-50/70">
                {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-blue-50 hover:bg-brand-primary-darker/60 hover:text-white',
              collapsed ? 'justify-start xl:justify-center xl:px-2' : 'justify-start'
            )}
            onClick={() => logout.mutate()}
            loading={logout.isPending}
            title={collapsed ? tCommon('logout') : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && 'xl:hidden')}>{tCommon('logout')}</span>
          </Button>
        </>
      }
    />
  );
}

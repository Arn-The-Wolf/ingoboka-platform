'use client';

import { useTranslations } from 'next-intl';
import { LayoutDashboard, ClipboardList, Settings, LogOut } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { StaffSidebar, type StaffNavItem } from '@/components/layout/staff-sidebar';
import { useStaffShell } from '@/components/layout/staff-shell';

const navItems = [
  { href: '/agent/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const, exact: true },
  { href: '/agent/applications', icon: ClipboardList, labelKey: 'applications' as const },
  { href: '/agent/settings', icon: Settings, labelKey: 'settings' as const },
];

export function AgentSidebar() {
  const t = useTranslations('agent');
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
            <UserAvatar name={user?.fullName ?? 'User'} imageUrl={user?.profilePictureUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.fullName ?? 'User'}</p>
              <p className="truncate text-xs text-blue-50/70">{t('settings')}</p>
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

'use client';

import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { StaffSidebar, type StaffNavItem } from '@/components/layout/staff-sidebar';
import { useStaffShell } from '@/components/layout/staff-shell';

const navItems = [
  { href: '/agent/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { href: '/agent/dashboard', icon: Users, labelKey: 'applications' as const },
];

export function AgentSidebar() {
  const t = useTranslations('agent');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const logout = useLogout();
  const { collapsed } = useStaffShell();

  const items: StaffNavItem[] = navItems.map((item) => ({
    href: item.href,
    icon: item.icon,
    label: t(item.labelKey),
    active: pathname.startsWith(item.href),
  }));

  return (
    <StaffSidebar
      items={items}
      footer={
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
      }
    />
  );
}

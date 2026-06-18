'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  Package,
  BarChart3,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn, getInitials } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/insurer/dashboard', icon: LayoutDashboard, labelKey: 'overview' as const },
  { href: '/insurer/dashboard', icon: FileText, labelKey: 'claimsQueue' as const },
  { href: '/insurer/products', icon: Package, labelKey: 'products' as const },
  { href: '/insurer/reports', icon: BarChart3, labelKey: 'reports' as const },
  { href: '/insurer/partner', icon: Shield, labelKey: 'partner' as const },
  { href: '/insurer/settings', icon: Settings, labelKey: 'settings' as const },
];

export function Sidebar() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-border bg-white">
      <div className="flex items-center gap-2 border-b border-brand-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-brand-primary-dark">Ingoboka</p>
          <p className="text-xs text-brand-muted">Insurer Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.labelKey}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-primary-light text-brand-primary'
                  : 'text-brand-muted hover:bg-brand-background hover:text-brand-primary-dark'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary text-sm font-medium text-white">
            {getInitials('Eric Demo')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Eric Demo</p>
            <p className="truncate text-xs text-brand-muted">Claims Officer</p>
          </div>
        </div>
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

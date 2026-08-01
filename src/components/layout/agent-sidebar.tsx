'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, LogOut, Menu, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './locale-switcher';

const navItems = [
  { href: '/agent/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { href: '/agent/dashboard', icon: Users, labelKey: 'applications' as const },
];

export function AgentSidebar() {
  const t = useTranslations('agent');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const logout = useLogout();
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
        "fixed left-0 top-0 flex h-screen flex-col border-r border-green-700 bg-gradient-to-b from-green-600 to-green-700 transition-all duration-300 z-40",
        isCollapsed ? "w-0 -translate-x-full lg:w-16 lg:translate-x-0" : "w-64"
      )}>
        <Link href="/" className={cn(
          "border-b border-green-700 px-6 py-5 transition-colors hover:bg-green-500",
          isCollapsed && "lg:px-2"
        )}>
          {!isCollapsed ? (
            <p className="font-bold text-white text-lg">Ingoboka</p>
          ) : (
            <p className="font-bold text-white text-lg text-center hidden lg:block">I</p>
          )}
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
            <div className="mb-3">
              <LocaleSwitcher />
            </div>
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

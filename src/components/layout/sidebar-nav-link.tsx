'use client';

import { ComponentProps, useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type SidebarNavLinkProps = ComponentProps<typeof Link> & {
  active?: boolean;
  collapsed?: boolean;
};

/** Sidebar nav item with a modern pending state while the route loads. */
export function SidebarNavLink({
  href,
  active,
  collapsed,
  className,
  children,
  onClick,
  ...props
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const target = typeof href === 'string' ? href : (href.pathname ?? '');

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (target && pathname !== target && !pathname.startsWith(`${target}/`)) {
          setPending(true);
        }
        onClick?.(e);
      }}
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-brand-primary-darker text-white shadow-sm'
          : 'text-blue-50 hover:bg-brand-primary-darker/60 hover:text-white',
        pending && 'pointer-events-none bg-brand-primary-darker/40',
        collapsed && 'justify-center px-2',
        className
      )}
      {...props}
    >
      {children}
      {pending && (
        <span
          className={cn(
            'absolute right-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white',
            collapsed && 'right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2'
          )}
          aria-hidden
        />
      )}
    </Link>
  );
}

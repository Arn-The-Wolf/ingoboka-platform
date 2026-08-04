'use client';

import { ComponentProps, useEffect, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

type LoadingLinkProps = ComponentProps<typeof Link> & {
  showSpinner?: boolean;
};

/** Link that shows a loading indicator while navigating to the target route. */
export function LoadingLink({
  href,
  children,
  className,
  showSpinner = true,
  onClick,
  ...props
}: LoadingLinkProps) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const target = typeof href === 'string' ? href : (href.pathname ?? '');

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  return (
    <Link
      href={href}
      className={cn(
        'transition-opacity duration-200',
        className,
        pending && 'pointer-events-none opacity-70'
      )}
      onClick={(e) => {
        if (target && pathname !== target && !pathname.startsWith(`${target}/`)) {
          setPending(true);
        }
        onClick?.(e);
      }}
      {...props}
    >
      {pending && showSpinner ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size="sm" />
          {children}
        </span>
      ) : (
        children
      )}
    </Link>
  );
}

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const MARK_SRC = '/images/brand/ingoboka-mark.svg';
const MARK_LIGHT_SRC = '/images/brand/ingoboka-mark-light.svg';
const FULL_SRC = '/images/brand/ingoboka-logo.svg';

type IngobokaLogoProps = {
  variant?: 'mark' | 'full';
  /** Light surfaces use blue wordmark; dark surfaces use white wordmark beside the mark. */
  theme?: 'light' | 'dark';
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  size?: 'sm' | 'md' | 'lg';
};

const MARK_SIZES = { sm: 28, md: 36, lg: 44 } as const;
const FULL_HEIGHT = { sm: 28, md: 36, lg: 44 } as const;
const FULL_WIDTH = { sm: 96, md: 124, lg: 152 } as const;

/**
 * Distinctive Ingoboka brand mark (shield + Rwanda sun / microinsurance motif).
 * Replaces generic Lucide Shield icons in nav, auth, and sidebars.
 */
export function IngobokaLogo({
  variant = 'mark',
  theme = 'light',
  showWordmark = true,
  className,
  markClassName,
  wordmarkClassName,
  size = 'md',
}: IngobokaLogoProps) {
  if (variant === 'full') {
    return (
      <span className={cn('relative inline-flex items-center', className)}>
        <Image
          src={FULL_SRC}
          alt="Ingoboka"
          width={FULL_WIDTH[size]}
          height={FULL_HEIGHT[size]}
          className={cn('h-auto w-auto object-contain', markClassName)}
          priority
        />
      </span>
    );
  }

  const markPx = MARK_SIZES[size];
  const markSrc = theme === 'dark' ? MARK_LIGHT_SRC : MARK_SRC;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center',
          theme === 'dark' && 'rounded-lg bg-white/15 p-1',
          markClassName
        )}
      >
        <Image
          src={markSrc}
          alt=""
          width={markPx}
          height={markPx}
          className="object-contain"
          aria-hidden
          priority
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            'truncate font-bold tracking-tight',
            size === 'sm' && 'text-base',
            size === 'md' && 'text-lg',
            size === 'lg' && 'text-xl',
            theme === 'dark' ? 'text-white' : 'text-brand-primary-dark',
            wordmarkClassName
          )}
        >
          Ingoboka
        </span>
      )}
    </span>
  );
}

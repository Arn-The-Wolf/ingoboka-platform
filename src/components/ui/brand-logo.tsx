'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  name: string;
  src: string;
  fallbackSrc: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  /** When both image sources fail, render a typographic wordmark. */
  showWordmarkFallback?: boolean;
};

/**
 * Displays a brand logo with graceful degradation:
 * primary src → local fallbackSrc → optional text wordmark.
 * Remote marks (Wikimedia / Google favicon CDN) never leave a broken image.
 */
export function BrandLogo({
  name,
  src,
  fallbackSrc,
  className,
  imgClassName,
  width = 120,
  height = 48,
  showWordmarkFallback = true,
}: BrandLogoProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setShowText(false);
  }, [src]);

  if (showText && showWordmarkFallback) {
    return (
      <span
        className={cn(
          'text-center text-sm font-bold tracking-tight text-brand-primary-dark',
          className
        )}
        title={name}
      >
        {name}
      </span>
    );
  }

  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <Image
        src={currentSrc}
        alt={name}
        width={width}
        height={height}
        className={cn('object-contain', imgClassName)}
        unoptimized={currentSrc.startsWith('http')}
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            return;
          }
          if (showWordmarkFallback) {
            setShowText(true);
          }
        }}
      />
    </span>
  );
}

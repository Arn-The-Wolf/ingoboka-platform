'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

type ImageWithFallbackProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string;
  /** Shown if the primary src fails to load (e.g. remote Unsplash/Clearbit URL is down). */
  fallbackSrc: string;
};

/**
 * next/image wrapper that gracefully swaps to a local fallback asset when a
 * remote image (Unsplash product art, Clearbit partner logos, MinIO media) fails.
 */
export function ImageWithFallback({ src, fallbackSrc, ...props }: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}

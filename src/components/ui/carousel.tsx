'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  showDots?: boolean;
  showArrows?: boolean;
  ariaLabel?: string;
}

export function Carousel({
  children,
  className,
  itemClassName,
  showDots = true,
  showArrows = true,
  ariaLabel = 'Carousel',
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = children.length;

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const { scrollLeft, clientWidth } = track;
      const index = Math.round(scrollLeft / Math.max(clientWidth, 1));
      setActiveIndex(Math.min(index, count - 1));
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [count]);

  return (
    <div className={cn('relative', className)} aria-label={ariaLabel}>
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/60 bg-white text-brand-primary shadow-card transition-all hover:border-brand-primary/40 hover:bg-brand-primary-light hover:shadow-elevated md:flex"
            onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/60 bg-white text-brand-primary shadow-card transition-all hover:border-brand-primary/40 hover:bg-brand-primary-light hover:shadow-elevated md:flex"
            onClick={() => scrollTo(Math.min(count - 1, activeIndex + 1))}
            disabled={activeIndex === count - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={cn('w-[85%] shrink-0 snap-start sm:w-[70%] md:w-full', itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>

      {showDots && count > 1 && (
        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {children.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                activeIndex === index ? 'w-6 bg-brand-primary' : 'w-2 bg-brand-border'
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

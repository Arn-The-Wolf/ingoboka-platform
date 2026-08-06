'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, X } from 'lucide-react';
import { announcementApi } from '@/lib/api/announcements';
import { dismissAnnouncement, getDismissedAnnouncementIds } from '@/lib/announcement-dismissals';
import { cn } from '@/lib/utils';

const ROTATE_MS = 30_000;

interface AnnouncementBannerProps {
  className?: string;
}

/** Horizontal scrolling news banner — dismissible, auto-rotates every ~30s. */
export function AnnouncementBanner({ className }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => getDismissedAnnouncementIds());
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: () => announcementApi.listActive(),
    staleTime: 60_000,
  });

  const visible = useMemo(
    () => announcements.filter((a) => !dismissed.has(a.id)),
    [announcements, dismissed]
  );

  useEffect(() => {
    if (visible.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % visible.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [visible.length]);

  useEffect(() => {
    if (activeIndex >= visible.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visible.length]);

  const handleDismiss = useCallback((id: string) => {
    dismissAnnouncement(id);
    setDismissed((prev) => new Set([...Array.from(prev), id]));
  }, []);

  if (visible.length === 0) return null;

  const current = visible[activeIndex] ?? visible[0];

  return (
    <div
      className={cn(
        'relative shrink-0 border-b border-brand-primary/20 bg-brand-primary-light/40',
        className
      )}
      role="region"
      aria-label="Platform announcements"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 lg:px-6">
        <Megaphone className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            <span className="inline-flex items-center gap-2 pr-16 text-sm text-brand-primary-dark">
              <strong className="font-semibold">{current.title}</strong>
              <span className="text-brand-muted">—</span>
              <span>{current.body}</span>
              {current.source === 'INSURER' && (
                <span className="rounded-full bg-brand-accent/30 px-2 py-0.5 text-xs font-medium text-brand-primary-dark">
                  Insurer update
                </span>
              )}
            </span>
          </div>
        </div>
        {visible.length > 1 && (
          <div className="hidden shrink-0 gap-1 sm:flex" aria-hidden>
            {visible.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors',
                  idx === activeIndex ? 'bg-brand-primary' : 'bg-brand-primary/30'
                )}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show announcement ${idx + 1}`}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => handleDismiss(current.id)}
          className="shrink-0 rounded-full p-1 text-brand-muted transition-colors hover:bg-brand-primary/10 hover:text-brand-primary-dark"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

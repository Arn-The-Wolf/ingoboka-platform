'use client';

import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  date?: string;
  status: 'done' | 'current' | 'pending';
}

interface ClaimTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

/** Claim status timeline — matches claim_status_timeline / claim_detail_view design. */
export function ClaimTimeline({ steps, className }: ClaimTimelineProps) {
  return (
    <ol className={cn('space-y-0', className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[11px] top-6 h-full w-0.5',
                  step.status === 'done' ? 'bg-brand-primary' : 'bg-brand-surface-container'
                )}
              />
            )}
            <div className="relative z-10 mt-0.5 shrink-0">
              {step.status === 'done' && (
                <CheckCircle2 className="h-6 w-6 text-brand-primary" />
              )}
              {step.status === 'current' && (
                <CircleDot className="h-6 w-6 text-brand-primary" aria-hidden />
              )}
              {step.status === 'pending' && (
                <Circle className="h-6 w-6 text-brand-border" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-semibold',
                  step.status === 'pending' ? 'text-brand-muted' : 'text-brand-primary-dark'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-brand-muted">{step.description}</p>
              )}
              {step.date && (
                <p className="mt-1 text-xs text-brand-outline">{step.date}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

'use client';

import { CheckCircle2, FileSearch } from 'lucide-react';
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

function TimelineStepIndicator({ status }: { status: TimelineStep['status'] }) {
  if (status === 'done') {
    return (
      <CheckCircle2
        className="h-6 w-6 fill-brand-primary text-brand-surface"
        strokeWidth={2}
        aria-hidden
      />
    );
  }

  if (status === 'current') {
    return (
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary shadow-sm ring-4 ring-brand-primary/15"
        aria-hidden
      >
        <FileSearch className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand-border bg-brand-surface"
      aria-hidden
    />
  );
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
              <TimelineStepIndicator status={step.status} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-semibold',
                  step.status === 'pending' && 'text-brand-muted',
                  step.status === 'done' && 'text-brand-primary-dark',
                  step.status === 'current' && 'text-brand-primary'
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

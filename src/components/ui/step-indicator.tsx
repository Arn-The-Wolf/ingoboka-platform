'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

/** Horizontal progress bars — matches registration_otp / claim_submission designs. */
export function StepIndicator({ totalSteps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-300',
            i < currentStep ? 'bg-brand-primary' : 'bg-brand-surface-container'
          )}
        />
      ))}
    </div>
  );
}

interface StepDotsProps {
  labels: string[];
  currentStep: number;
  className?: string;
}

/** Numbered step dots with labels — matches enrollment_flow design. */
export function StepDots({ labels, currentStep, className }: StepDotsProps) {
  return (
    <nav className={cn('flex items-center justify-between', className)}>
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                'text-xs font-medium',
                active || done ? 'text-brand-primary' : 'text-brand-outline'
              )}
            >
              {label}
            </span>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                active || done
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-surface-container text-brand-outline'
              )}
            >
              {stepNum}
            </div>
            {i < labels.length - 1 && (
              <div
                className={cn(
                  'absolute hidden h-1 flex-1 bg-brand-surface-container',
                  done && 'bg-brand-primary'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

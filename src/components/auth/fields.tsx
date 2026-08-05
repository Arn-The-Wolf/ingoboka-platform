'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FieldShellProps {
  id?: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

/** Shared label + helper/error layout so every auth field aligns identically. */
function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-brand-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-brand-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        ref={ref}
        className={cn('design-input', error && 'design-input--error', className)}
        {...props}
      />
    </FieldShell>
  )
);
TextField.displayName = 'TextField';

/** Phone input with a fixed +250 prefix, sized to match every other design-input. */
export const PhoneField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div
        className={cn(
          'flex h-12 w-full items-center rounded-xl border border-brand-border bg-white pr-4 transition-all duration-200 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20',
          error && 'border-brand-error focus-within:border-brand-error focus-within:ring-brand-error/20'
        )}
      >
        <span className="flex h-full items-center border-r border-brand-border px-4 text-sm font-semibold text-brand-primary-dark">
          +250
        </span>
        <input
          id={id}
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className={cn(
            'h-full flex-1 rounded-r-xl bg-transparent pl-3 text-sm text-brand-primary-dark outline-none placeholder:text-brand-muted',
            className
          )}
          {...props}
        />
      </div>
    </FieldShell>
  )
);
PhoneField.displayName = 'PhoneField';

export const PasswordField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, disabled, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <FieldShell id={id} label={label} error={error} hint={hint}>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={visible ? 'text' : 'password'}
            disabled={disabled}
            className={cn('design-input pr-12', error && 'design-input--error', className)}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            disabled={disabled}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-brand-muted transition-colors hover:text-brand-primary-dark disabled:opacity-50"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FieldShell>
    );
  }
);
PasswordField.displayName = 'PasswordField';

/** Heuristic 0–4 password score used by the strength meter. */
export function passwordScore(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(4, score);
}

interface PasswordStrengthProps {
  value: string;
  label: string;
  /** Ordered labels for scores 1–4: [weak, fair, good, strong]. */
  levels: [string, string, string, string];
}

const SEGMENT_COLORS = ['bg-brand-error', 'bg-brand-warning', 'bg-brand-accent', 'bg-brand-success'];
const LABEL_COLORS = ['text-brand-error', 'text-brand-warning', 'text-brand-accent-dark', 'text-brand-success'];

export function PasswordStrength({ value, label, levels }: PasswordStrengthProps) {
  const score = passwordScore(value);
  if (!value) return null;
  const activeIndex = Math.max(0, score - 1);

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < score ? SEGMENT_COLORS[activeIndex] : 'bg-brand-surface-container'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', LABEL_COLORS[activeIndex])}>
        {label}: {levels[activeIndex]}
      </p>
    </div>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            className={cn(
              'mt-0.5 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary',
              className
            )}
            {...props}
          />
          {label && <span className="text-sm text-brand-primary-dark">{label}</span>}
        </label>
        {error && <p className="text-xs text-brand-error">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

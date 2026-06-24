'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, disabled, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            className={cn(
              'flex h-10 w-full rounded-md border border-brand-border bg-white py-2 pl-3 pr-10 text-sm ring-offset-white placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-brand-error focus-visible:ring-brand-error',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
            disabled={disabled}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-brand-muted hover:text-brand-primary-dark disabled:opacity-50"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-brand-error">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

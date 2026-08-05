'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminSelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: AdminSelectOption[];
  placeholder?: string;
}

/** Lightweight styled native <select> for admin filters, sorting and forms. */
export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-10 w-full appearance-none rounded-md border border-brand-border bg-white px-3 pr-9 text-sm text-brand-primary-dark transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
            className
          )}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
      </div>
    );
  }
);
AdminSelect.displayName = 'AdminSelect';

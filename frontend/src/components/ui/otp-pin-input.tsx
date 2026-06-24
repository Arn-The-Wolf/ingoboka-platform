'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;

export interface OtpPinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
}

export function OtpPinInput({
  value,
  onChange,
  onComplete,
  disabled,
  error,
  id = 'otp-pin',
}: OtpPinInputProps) {
  const digits = React.useMemo(() => {
    const chars = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    while (chars.length < OTP_LENGTH) chars.push('');
    return chars;
  }, [value]);

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const updateValue = React.useCallback(
    (next: string) => {
      const sanitized = next.replace(/\D/g, '').slice(0, OTP_LENGTH);
      onChange(sanitized);
      if (sanitized.length === OTP_LENGTH) {
        onComplete?.(sanitized);
      }
    },
    [onChange, onComplete]
  );

  const focusIndex = (index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    updateValue(next.join(''));
    if (digit && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        updateValue(next.join(''));
      } else if (index > 0) {
        next[index - 1] = '';
        updateValue(next.join(''));
        focusIndex(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    updateValue(pasted);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="w-full">
      <div
        className="flex justify-center gap-2 sm:gap-3"
        role="group"
        aria-label="Verification code"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={index === 0 ? id : undefined}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'h-12 w-10 rounded-lg border bg-white text-center text-lg font-semibold tabular-nums',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-12 sm:text-xl',
              error ? 'border-brand-error focus-visible:ring-brand-error' : 'border-brand-border'
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-brand-error">{error}</p>}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function CitizenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-brand-primary-dark">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-brand-muted">{error.message}</p>
      <Button className="mt-6" variant="pill-accent" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}

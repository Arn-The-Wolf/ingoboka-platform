'use client';

import { IngobokaLogo } from '@/components/ui/ingoboka-logo';

export function AuthHeader() {
  return (
    <header className="flex items-center justify-between">
      <IngobokaLogo size="md" showWordmark wordmarkClassName="text-brand-primary-dark" />
    </header>
  );
}

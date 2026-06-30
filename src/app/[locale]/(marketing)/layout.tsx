import { ReactNode } from 'react';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { MarketingPageTransition } from '@/components/marketing/marketing-page-transition';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-background">
      <SiteHeader />
      <main className="flex-1">
        <MarketingPageTransition>{children}</MarketingPageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}

'use client';

import { ReactNode, useEffect } from 'react';
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel';
import { IngobokaLogo } from '@/components/ui/ingoboka-logo';
import { LocaleSwitcher } from './locale-switcher';

interface AuthShellProps {
  children: ReactNode;
}

const LOCK_CLASS = 'auth-scroll-lock';

/** Auth pages — branded split-panel layout on desktop, single column on mobile. */
export function AuthShell({ children }: AuthShellProps) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlOverflowX: html.style.overflowX,
      htmlOverflowY: html.style.overflowY,
      htmlHeight: html.style.height,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyOverflowX: body.style.overflowX,
      bodyOverflowY: body.style.overflowY,
      bodyHeight: body.style.height,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
    };

    html.classList.add(LOCK_CLASS);
    body.classList.add(LOCK_CLASS);

    html.style.overflow = 'hidden';
    html.style.overflowX = 'hidden';
    html.style.overflowY = 'hidden';
    html.style.height = '100%';
    html.style.overscrollBehavior = 'none';

    body.style.overflow = 'hidden';
    body.style.overflowX = 'hidden';
    body.style.overflowY = 'hidden';
    body.style.height = '100%';
    body.style.overscrollBehavior = 'none';
    body.style.position = 'fixed';
    body.style.width = '100%';

    return () => {
      html.classList.remove(LOCK_CLASS);
      body.classList.remove(LOCK_CLASS);
      html.style.overflow = prev.htmlOverflow;
      html.style.overflowX = prev.htmlOverflowX;
      html.style.overflowY = prev.htmlOverflowY;
      html.style.height = prev.htmlHeight;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overflow = prev.bodyOverflow;
      body.style.overflowX = prev.bodyOverflowX;
      body.style.overflowY = prev.bodyOverflowY;
      body.style.height = prev.bodyHeight;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.position = prev.bodyPosition;
      body.style.width = prev.bodyWidth;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] overflow-hidden bg-brand-background">
      <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 lg:grid-cols-2">
        {/* Full-bleed left brand column (desktop) — no outer margin/padding */}
        <AuthBrandPanel />

        <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-brand-background">
          <div className="flex shrink-0 items-center justify-between px-4 py-2.5 sm:py-3 lg:justify-end lg:px-6 lg:py-3">
            <div className="flex items-center gap-2 lg:hidden">
              <IngobokaLogo size="sm" showWordmark />
            </div>
            <LocaleSwitcher />
          </div>

          {/* Only the form column may scroll on short viewports; the page never does. */}
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            <div className="flex min-h-full items-center justify-center px-4 py-3 sm:py-5 lg:px-10">
              <div className="portal-card w-full max-w-md animate-fade-in-up p-4 sm:p-5 lg:p-7">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

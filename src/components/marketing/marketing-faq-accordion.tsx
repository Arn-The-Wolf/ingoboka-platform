'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '@/components/ui/animated-section';
import { cn } from '@/lib/utils';

export const FAQ_ITEMS = [
  { qKey: 'faq.q1' as const, aKey: 'faq.a1' as const },
  { qKey: 'faq.q2' as const, aKey: 'faq.a2' as const },
  { qKey: 'faq.q3' as const, aKey: 'faq.a3' as const },
  { qKey: 'faq.q4' as const, aKey: 'faq.a4' as const },
  { qKey: 'faq.q5' as const, aKey: 'faq.a5' as const },
  { qKey: 'faq.q6' as const, aKey: 'faq.a6' as const },
  { qKey: 'faq.q7' as const, aKey: 'faq.a7' as const },
  { qKey: 'faq.q8' as const, aKey: 'faq.a8' as const },
];

export function MarketingFaqAccordion() {
  const t = useTranslations('landing');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AnimatedSection>
      <div className="divide-y divide-brand-border/60 rounded-2xl border border-brand-border/60 bg-brand-background shadow-card">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.qKey}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200',
                  isOpen ? 'bg-brand-primary-light/40 text-brand-primary' : 'hover:bg-brand-primary-light/30'
                )}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-semibold text-brand-primary-dark">{t(item.qKey)}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-brand-muted transition-transform duration-300',
                    isOpen && 'rotate-180 text-brand-primary'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-4 text-sm leading-relaxed text-brand-muted">{t(item.aKey)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedSection>
  );
}

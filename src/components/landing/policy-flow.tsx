'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileCheck2, IdCard, Search, Smartphone, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SectionHeading } from '@/components/landing/section-heading';

type FlowStepId = 'register' | 'choose' | 'pay' | 'card' | 'claim';

/**
 * The policy journey is described declaratively as JSON and rendered as an
 * animated flow. `sample` is illustrative payload data shown as a mini JSON chip
 * so users can see the shape of each step (register -> choose -> pay -> card -> claim).
 */
const POLICY_FLOW: {
  id: FlowStepId;
  icon: LucideIcon;
  sample: Record<string, string>;
}[] = [
  {
    id: 'register',
    icon: UserPlus,
    sample: { phone: '+2507•• ••• •••', lang: 'rw' },
  },
  {
    id: 'choose',
    icon: Search,
    sample: { product: 'family-health', premium: 'RWF 2,500' },
  },
  {
    id: 'pay',
    icon: Smartphone,
    sample: { channel: 'MTN MoMo', mode: 'sandbox', status: 'PAID' },
  },
  {
    id: 'card',
    icon: IdCard,
    sample: { policyNo: 'ING-2026-0421', status: 'ACTIVE', qr: '✓' },
  },
  {
    id: 'claim',
    icon: FileCheck2,
    sample: { claimId: 'CLM-0098', status: 'IN_REVIEW' },
  },
];

const PAY_ACCENT: FlowStepId = 'pay';

function JsonChip({ data }: { data: Record<string, string> }) {
  return (
    <pre className="mt-3 w-full overflow-hidden rounded-lg border border-brand-border/60 bg-brand-surface-container/60 px-3 py-2 text-left font-mono text-[10px] leading-relaxed text-brand-outline">
      <span className="text-brand-muted">{'{'}</span>
      {Object.entries(data).map(([key, value]) => (
        <span key={key} className="block pl-3">
          <span className="text-brand-primary">&quot;{key}&quot;</span>
          <span className="text-brand-muted">: </span>
          <span className="text-brand-secondary">&quot;{value}&quot;</span>
        </span>
      ))}
      <span className="text-brand-muted">{'}'}</span>
    </pre>
  );
}

export function PolicyFlow() {
  const t = useTranslations('landing.policyFlow');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-brand-primary-light/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <AnimatedSection>
          <SectionHeading title={t('title')} subtitle={t('subtitle')} />
        </AnimatedSection>

        {/* Desktop / tablet: horizontal flow */}
        <div className="hidden lg:flex lg:items-start lg:justify-between lg:gap-2">
          {POLICY_FLOW.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="flex-1">
                <FlowNode step={step} index={index} accent={step.id === PAY_ACCENT} t={t} />
              </div>
              {index < POLICY_FLOW.length - 1 && (
                <div className="flex shrink-0 items-center justify-center pt-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
                  >
                    <ArrowRight className="h-6 w-6 text-brand-primary/50" />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical stepper */}
        <ol className="relative mx-auto max-w-md lg:hidden">
          {POLICY_FLOW.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === POLICY_FLOW.length - 1;
            return (
              <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-6 top-14 h-[calc(100%-3.5rem)] w-0.5 bg-gradient-to-b from-brand-primary/60 to-brand-border/40"
                    aria-hidden
                  />
                )}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-elevated">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-accent">
                    {t('stepLabel', { step: index + 1 })}
                  </p>
                  <h3 className="mb-1 text-base font-semibold text-brand-primary-dark">
                    {t(`steps.${step.id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-muted">{t(`steps.${step.id}.desc`)}</p>
                  <JsonChip data={step.sample} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function FlowNode({
  step,
  index,
  accent,
  t,
}: {
  step: (typeof POLICY_FLOW)[number];
  index: number;
  accent: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 4 }}
          transition={{ duration: 0.3 }}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-elevated ${
            accent ? 'bg-brand-accent text-brand-primary-dark' : 'bg-brand-primary text-white'
          }`}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-primary shadow-sm ring-1 ring-brand-border/60">
          {index + 1}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-brand-primary-dark">
        {t(`steps.${step.id}.title`)}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">{t(`steps.${step.id}.desc`)}</p>
      <JsonChip data={step.sample} />
    </motion.div>
  );
}

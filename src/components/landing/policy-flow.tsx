'use client';

import { motion } from 'framer-motion';
import { FileCheck2, IdCard, Search, Smartphone, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { AnimatedSection } from '@/components/ui/animated-section';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

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
  /** Keys carried forward into the next step's payload (shown as flying chips). */
  emitKeys: string[];
}[] = [
  {
    id: 'register',
    icon: UserPlus,
    sample: { phone: '+2507•• ••• •••', lang: 'rw' },
    emitKeys: ['phone', 'lang'],
  },
  {
    id: 'choose',
    icon: Search,
    sample: { product: 'family-health', premium: 'RWF 2,500' },
    emitKeys: ['product', 'premium'],
  },
  {
    id: 'pay',
    icon: Smartphone,
    sample: { channel: 'MTN MoMo', mode: 'sandbox', status: 'PAID' },
    emitKeys: ['status'],
  },
  {
    id: 'card',
    icon: IdCard,
    sample: { policyNo: 'ING-2026-0421', status: 'ACTIVE', qr: '✓' },
    emitKeys: ['policyNo'],
  },
  {
    id: 'claim',
    icon: FileCheck2,
    sample: { claimId: 'CLM-0098', status: 'IN_REVIEW' },
    emitKeys: [],
  },
];

const PAY_ACCENT: FlowStepId = 'pay';

function JsonChip({ data, active }: { data: Record<string, string>; active?: boolean }) {
  return (
    <pre
      className={cn(
        'mt-3 w-full overflow-hidden rounded-lg border px-3 py-2 text-left font-mono text-[10px] leading-relaxed transition-all duration-500',
        active
          ? 'border-brand-primary/50 bg-brand-primary-light/40 shadow-sm ring-1 ring-brand-primary/20'
          : 'border-brand-border/60 bg-brand-surface-container/60 text-brand-outline'
      )}
    >
      <span className="text-brand-muted">{'{'}</span>
      {Object.entries(data).map(([key, value], i) => (
        <motion.span
          key={key}
          className="block pl-3"
          initial={{ opacity: 0.35, x: -4 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
        >
          <span className="text-brand-primary">&quot;{key}&quot;</span>
          <span className="text-brand-muted">: </span>
          <span className="text-brand-secondary">&quot;{value}&quot;</span>
        </motion.span>
      ))}
      <span className="text-brand-muted">{'}'}</span>
    </pre>
  );
}

/** Horizontal connector: dashed pipe + flying JSON key packets. */
function DataFlowBridge({ keys, delay }: { keys: string[]; delay: number }) {
  return (
    <div
      className="relative mx-1 flex h-full min-w-[3.5rem] flex-1 shrink-0 flex-col items-center justify-center pt-16"
      aria-hidden
    >
      <div className="relative h-8 w-full">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-brand-border/50">
          <span className="absolute inset-y-0 w-1/3 animate-data-flow bg-gradient-to-r from-transparent via-brand-primary to-transparent" />
        </div>
        {keys.slice(0, 2).map((key, i) => (
          <motion.span
            key={key}
            className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-brand-primary/30 bg-white px-1.5 py-0.5 font-mono text-[8px] font-semibold text-brand-primary shadow-sm"
            initial={{ left: '0%', opacity: 0 }}
            animate={{
              left: ['0%', '100%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.4,
              delay: delay + i * 0.55,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.8,
            }}
          >
            {key}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/** Vertical connector for mobile stepper. */
function MobileDataPipe({ keys }: { keys: string[] }) {
  return (
    <span className="absolute left-6 top-14 h-[calc(100%-3.5rem)] w-0.5 overflow-hidden bg-brand-border/40" aria-hidden>
      <span className="absolute inset-x-0 h-1/3 animate-data-flow-vertical bg-gradient-to-b from-transparent via-brand-primary to-transparent" />
      {keys.slice(0, 1).map((key) => (
        <motion.span
          key={key}
          className="absolute left-2 whitespace-nowrap rounded border border-brand-primary/30 bg-white px-1 py-0.5 font-mono text-[8px] font-semibold text-brand-primary shadow-sm"
          initial={{ top: '10%', opacity: 0 }}
          animate={{ top: ['10%', '85%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        >
          {key}
        </motion.span>
      ))}
    </span>
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

        {/* Desktop / tablet: horizontal flow with animated data transfer */}
        <div className="hidden lg:flex lg:items-start lg:justify-between">
          {POLICY_FLOW.map((step, index) => (
            <div key={step.id} className="flex min-w-0 flex-1 items-start">
              <div className="min-w-0 flex-1">
                <FlowNode step={step} index={index} accent={step.id === PAY_ACCENT} t={t} />
              </div>
              {index < POLICY_FLOW.length - 1 && (
                <DataFlowBridge keys={step.emitKeys} delay={index * 0.35} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical stepper with flowing packets */}
        <ol className="relative mx-auto max-w-md lg:hidden">
          {POLICY_FLOW.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === POLICY_FLOW.length - 1;
            return (
              <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && <MobileDataPipe keys={step.emitKeys} />}
                <motion.div
                  className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-elevated"
                  animate={{ boxShadow: ['0 0 0 0 rgba(11,61,145,0.35)', '0 0 0 8px rgba(11,61,145,0)', '0 0 0 0 rgba(11,61,145,0)'] }}
                  transition={{ duration: 2.4, delay: index * 0.4, repeat: Infinity }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-accent">
                    {t('stepLabel', { step: index + 1 })}
                  </p>
                  <h3 className="mb-1 text-base font-semibold text-brand-primary-dark">
                    {t(`steps.${step.id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-muted">{t(`steps.${step.id}.desc`)}</p>
                  <JsonChip data={step.sample} active />
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
          animate={{
            boxShadow: [
              '0 8px 20px rgba(15, 39, 68, 0.12)',
              '0 8px 28px rgba(15, 39, 68, 0.22)',
              '0 8px 20px rgba(15, 39, 68, 0.12)',
            ],
          }}
          transition={{ duration: 2.8, delay: index * 0.3, repeat: Infinity }}
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
      <JsonChip data={step.sample} active />
    </motion.div>
  );
}

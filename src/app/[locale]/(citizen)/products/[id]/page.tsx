'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Download,
  FileText,
  HeartPulse,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { productApi } from '@/lib/api';
import { getProductHeroImage } from '@/lib/product-images';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { formatCurrency, cn } from '@/lib/utils';
import type { ProductPlan } from '@/lib/api/products';

const TABS = ['cover', 'exclusions', 'how-to-claim', 'documents'] as const;
type TabId = (typeof TABS)[number];

const TAB_I18N_KEYS: Record<TabId, 'cover' | 'exclusions' | 'howToClaim' | 'documents'> = {
  cover: 'cover',
  exclusions: 'exclusions',
  'how-to-claim': 'howToClaim',
  documents: 'documents',
};

const BENEFIT_ICONS = [HeartPulse, Shield, HeartPulse];

function planForFrequency(plans: ProductPlan[], freq: 'daily' | 'weekly' | 'monthly') {
  const key = freq.toUpperCase();
  return (
    plans.find((p) => p.billingFrequency.toUpperCase().includes(key)) ??
    plans.find((p) => p.billingFrequency.toUpperCase() === 'MONTHLY') ??
    plans[0]
  );
}

export default function ProductDetailPage() {
  const t = useTranslations('citizen.productDetail');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;
  const [activeTab, setActiveTab] = useState<TabId>('cover');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const quiz = useMemo(
    () => [
      {
        id: 'q1',
        question: t('quiz.q1.question'),
        options: [
          { id: 'q1a', label: t('quiz.q1.optA'), correct: false },
          { id: 'q1b', label: t('quiz.q1.optB'), correct: true },
        ],
      },
      {
        id: 'q2',
        question: t('quiz.q2.question'),
        options: [
          { id: 'q2a', label: t('quiz.q2.optA'), correct: true },
          { id: 'q2b', label: t('quiz.q2.optB'), correct: false },
        ],
      },
    ],
    [t]
  );

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', productId, 'detail'],
    queryFn: () => productApi.getById(productId),
  });

  const selectedPlan = product ? planForFrequency(product.plans ?? [], frequency) : undefined;
  const coverItems = selectedPlan?.benefits?.length
    ? selectedPlan.benefits
    : product?.plans?.[0]?.benefits ?? [];
  const exclusionItems = selectedPlan?.exclusions?.length
    ? selectedPlan.exclusions
    : product?.plans?.[0]?.exclusions ?? [];
  const claimSteps = product?.claimSteps ?? [];
  const faqItems = product?.faq ?? [];
  const documents = product?.documents ?? [];
  const waitingDays = selectedPlan?.waitingPeriodDays ?? product?.waitingPeriodDays ?? 30;

  const quizPassed = quiz.every((q) => {
    const selected = answers[q.id];
    return q.options.find((o) => o.id === selected)?.correct;
  });

  if (isLoading) {
    return (
      <>
        <CitizenHeader title={t('loadingTitle')} />
        <PageContainer>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-2xl bg-brand-surface-container" />
            <div className="h-8 w-48 animate-pulse rounded bg-brand-surface-container" />
          </div>
        </PageContainer>
      </>
    );
  }

  if (isError || !product) {
    return (
      <>
        <CitizenHeader title={t('loadingTitle')} />
        <PageContainer>
          <Alert variant="error" className="mb-4">
            {t('loadError')}
          </Alert>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              {t('retry')}
            </Button>
            <Link href="/products">
              <Button variant="pill">{t('backToProducts')}</Button>
            </Link>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <CitizenHeader title={product.name} />
      <PageContainer>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <section className="relative mb-8 h-64 overflow-hidden rounded-2xl lg:h-80">
          <Image
            src={getProductHeroImage(product)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 z-20 w-full p-4">
            <span className="mb-2 inline-block rounded-full bg-brand-accent px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand-primary-dark">
              {product.category || t('defaultCategory')}
            </span>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          </div>
        </section>

        <section className="px-4 py-6">
          <div className="flex items-center gap-1 rounded-full border border-brand-border bg-brand-surface-container-low p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={cn(
                  'flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-all',
                  frequency === freq
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-muted hover:bg-brand-surface-container'
                )}
              >
                {t(`frequencies.${freq}`)}
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-brand-primary">
              {selectedPlan ? formatCurrency(selectedPlan.premiumAmount) : '—'}
            </span>
            <span className="ml-1 text-sm text-brand-muted">{t('perPerson')}</span>
          </div>
        </section>

        <section className="mb-6 px-4">
          <div className="flex items-start gap-3 rounded-xl border border-brand-secondary/30 bg-brand-accent/20 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" />
            <div>
              <p className="text-sm font-semibold text-brand-primary-dark">
                {t('waitingPeriodTitle', { days: waitingDays })}
              </p>
              <p className="text-sm text-brand-muted">
                {t('waitingPeriodBody', { days: waitingDays })}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex overflow-x-auto border-b border-brand-border px-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors',
                  activeTab === tab
                    ? 'border-b-2 border-brand-primary text-brand-primary'
                    : 'text-brand-muted'
                )}
              >
                {t(`tabs.${TAB_I18N_KEYS[tab]}`)}
              </button>
            ))}
          </div>

          <div className="px-4 py-5">
            {activeTab === 'cover' && (
              <div className="space-y-4">
                {product.termsSummary && (
                  <p className="text-sm text-brand-muted">{product.termsSummary}</p>
                )}
                {coverItems.length === 0 ? (
                  <p className="text-sm text-brand-muted">{t('coverEmpty')}</p>
                ) : (
                  coverItems.map((item, index) => {
                    const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
                    return (
                      <div key={`${item.title}-${index}`} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-light">
                          <Icon className="h-4 w-4 text-brand-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-primary-dark">{item.title}</p>
                          <p className="text-sm text-brand-muted">
                            {item.description}
                            {item.coverageLimit != null &&
                              ` ${t('coverageUpTo', { amount: formatCurrency(item.coverageLimit) })}`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'exclusions' && (
              <ul className="list-inside list-disc space-y-2 text-sm text-brand-muted">
                {exclusionItems.length === 0 ? (
                  <li>{t('exclusionsDefault')}</li>
                ) : (
                  exclusionItems.map((item) => (
                    <li key={item.title}>
                      {item.title}
                      {item.description ? ` — ${item.description}` : ''}
                    </li>
                  ))
                )}
              </ul>
            )}

            {activeTab === 'how-to-claim' && (
              <div className="relative space-y-6 border-l-2 border-brand-primary/20 pl-4">
                {claimSteps.map((item) => (
                  <div key={item.step} className="relative">
                    <div className="absolute -left-[21px] flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                      {item.step}
                    </div>
                    <p className="ml-2 text-sm font-semibold text-brand-primary-dark">{item.title}</p>
                    <p className="ml-2 text-sm text-brand-muted">{item.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-sm text-brand-muted">{t('documentsEmpty')}</p>
                ) : (
                  documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-brand-border p-3 transition-colors hover:bg-brand-surface-container-low"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-muted" />
                        <span className="text-sm">{doc.title || doc.fileName}</span>
                      </div>
                      <Download className="h-4 w-4 text-brand-primary" />
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {faqItems.length > 0 && (
          <section className="mb-6 px-4">
            <h3 className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('faq')}</h3>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <div key={item.question} className="rounded-xl border border-brand-border bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-4 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-medium text-brand-primary-dark">{item.question}</span>
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 text-brand-muted" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-brand-muted" />
                    )}
                  </button>
                  {openFaq === i && (
                    <p className="border-t border-brand-border px-4 pb-4 text-sm text-brand-muted">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <section className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-brand-primary-dark">{t('quickCheck')}</h3>
          <div className="space-y-4">
            {quiz.map((q) => (
              <div key={q.id}>
                <p className="mb-2 text-sm text-brand-primary-dark">{q.question}</p>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-brand-surface-container-low',
                        answers[q.id] === opt.id
                          ? 'border-brand-primary bg-brand-primary-light'
                          : 'border-brand-border'
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="sr-only"
                        checked={answers[q.id] === opt.id}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-card">
            <Button
              className="w-full"
              variant="pill-accent"
              disabled={!quizPassed}
              onClick={() => router.push(`/products/${productId}/enroll`)}
            >
              {t('applyPlan')}
            </Button>
            <p
              className={cn(
                'mt-2 text-center text-xs',
                quizPassed ? 'text-brand-primary' : 'text-brand-muted'
              )}
            >
              {quizPassed ? t('quizPass') : t('quizFail')}
            </p>
            <Link
              href="/products/needs-assessment"
              className="mt-2 block text-center text-xs font-medium text-brand-primary hover:underline"
            >
              {t('needsAssessmentLink')}
            </Link>
          </div>
      </aside>
      </div>
      </PageContainer>
    </>
  );
}

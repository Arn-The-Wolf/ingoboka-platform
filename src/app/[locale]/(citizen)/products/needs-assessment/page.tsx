'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Bike,
  Building2,
  MoreHorizontal,
  Smartphone,
  Sprout,
  Store,
  Users,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { enrollmentApi } from '@/lib/api';
import { setRecommendedProductIds } from '@/lib/recommended-products';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QuestionId = 'occupation' | 'dependents' | 'smartphone' | 'payment' | 'income' | 'ready';

const QUESTION_META: Array<{
  id: QuestionId;
  iconMap: Record<string, React.ComponentType<{ className?: string }>>;
  options: Array<{ value: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  {
    id: 'occupation',
    iconMap: {},
    options: [
      { value: 'MOTO_RIDER', icon: Bike },
      { value: 'FARMER', icon: Sprout },
      { value: 'VENDOR', icon: Store },
      { value: 'OFFICE', icon: Building2 },
      { value: 'OTHER', icon: MoreHorizontal },
    ],
  },
  {
    id: 'dependents',
    iconMap: {},
    options: [
      { value: '0', icon: Users },
      { value: '1-2', icon: Users },
      { value: '3-4', icon: Users },
      { value: '5+', icon: Users },
    ],
  },
  {
    id: 'smartphone',
    iconMap: {},
    options: [
      { value: 'YES', icon: Smartphone },
      { value: 'SOMETIMES', icon: Smartphone },
      { value: 'NO', icon: Smartphone },
    ],
  },
  {
    id: 'payment',
    iconMap: {},
    options: [
      { value: 'DAILY', icon: Store },
      { value: 'WEEKLY', icon: Store },
      { value: 'MONTHLY', icon: Store },
    ],
  },
  {
    id: 'income',
    iconMap: {},
    options: [
      { value: 'UNDER_2K', icon: Store },
      { value: '2K_5K', icon: Store },
      { value: '5K_10K', icon: Store },
      { value: 'OVER_10K', icon: Store },
    ],
  },
  {
    id: 'ready',
    iconMap: {},
    options: [{ value: 'YES', icon: ArrowRight }],
  },
];

export default function NeedsAssessmentPage() {
  const t = useTranslations('citizen.needsAssessment');
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = useMemo(
    () =>
      QUESTION_META.map((meta) => ({
        id: meta.id,
        title: t(`questions.${meta.id}.title`),
        subtitle: t(`questions.${meta.id}.subtitle`),
        options: meta.options.map((opt) => ({
          value: opt.value,
          label: t(`questions.${meta.id}.${opt.value}`),
          icon: opt.icon,
        })),
      })),
    [t]
  );

  const assessmentMutation = useMutation({
    mutationFn: () =>
      enrollmentApi.needsAssessment({
        occupation: answers.occupation ?? 'OTHER',
        incomeRange: answers.income,
        dependents: answers.dependents
          ? parseInt(answers.dependents.replace(/\D/g, ''), 10) || 0
          : undefined,
        primaryRisk: answers.occupation === 'MOTO_RIDER' ? 'ACCIDENT' : 'HEALTH',
      }),
    onSuccess: (result) => {
      const ids = result.recommendedProducts?.map((p) => p.id) ?? [];
      if (ids.length > 0) {
        setRecommendedProductIds(ids);
      }
      setTimeout(() => router.push('/products?recommended=true'), 2500);
    },
  });

  const question = questions[step];
  const progress = ((step + 1) / questions.length) * 100;
  const selected = question ? answers[question.id] : undefined;

  function handleSelect(value: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setShowResults(true);
    assessmentMutation.mutate();
  }

  function handleSkip() {
    router.push('/products');
  }

  if (showResults) {
    return (
      <>
        <CitizenHeader title={t('title')} />
        <PageContainer narrow className="flex flex-col items-center py-16 text-center">
          <div className="relative mb-8 h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-brand-primary">{t('findingCover')}</h2>
          <p className="max-w-sm text-sm text-brand-muted">
            {assessmentMutation.data?.guidance || t('analyzing')}
          </p>
          {assessmentMutation.data && (
            <>
              <p className="mt-4 text-sm font-semibold text-brand-primary">
                {t('matchScore', { score: assessmentMutation.data.score })}
              </p>
              {assessmentMutation.data.recommendedProducts &&
                assessmentMutation.data.recommendedProducts.length > 0 && (
                  <ul className="mt-4 space-y-2 text-left text-sm text-brand-muted">
                    {assessmentMutation.data.recommendedProducts.map((p) => (
                      <li key={p.id}>
                        <span className="font-semibold text-brand-primary-dark">{p.name}</span>
                        {p.reason ? ` — ${p.reason}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
            </>
          )}
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <CitizenHeader title={t('title')} />
      <PageContainer narrow className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden pb-4">
        <Link href="/products" className="mb-3 text-sm font-medium text-brand-primary hover:underline">
          {t('backToProducts')}
        </Link>

        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-brand-muted">
            <span>{t('questionOf', { current: step + 1, total: questions.length })}</span>
            <span className="font-semibold text-brand-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-surface-container">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h1 className="mb-2 text-xl lg:text-2xl font-bold text-brand-primary-dark">{question.title}</h1>
          <p className="mb-6 text-sm text-brand-muted">{question.subtitle}</p>

          <div
            className={cn(
              'grid gap-3 pb-4',
              question.options.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'
            )}
          >
            {question.options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border-2 p-4 lg:p-5 text-center transition-all active:scale-95',
                    isSelected
                      ? 'border-brand-primary bg-brand-primary-light shadow-md'
                      : 'border-brand-border bg-white hover:border-brand-secondary'
                  )}
                >
                  <div
                    className={cn(
                      'mb-2 flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full transition-colors',
                      isSelected ? 'bg-brand-accent' : 'bg-brand-primary-light'
                    )}
                  >
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-brand-primary" />
                  </div>
                  <span className="text-sm font-semibold text-brand-primary-dark">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-brand-border mt-auto">
          <Button variant="outline" className="flex-1 rounded-full" onClick={handleSkip}>
            {t('skip')}
          </Button>
          <Button
            variant="pill-accent"
            className="flex-1 gap-1 rounded-full"
            disabled={!selected}
            loading={assessmentMutation.isPending}
            onClick={handleNext}
          >
            {step === questions.length - 1 ? t('seeResults') : t('continue')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </PageContainer>
    </>
  );
}

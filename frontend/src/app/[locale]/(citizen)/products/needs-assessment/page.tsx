'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type QuestionId = 'occupation' | 'dependents' | 'smartphone' | 'payment' | 'income' | 'ready';

interface Question {
  id: QuestionId;
  title: string;
  subtitle: string;
  options: Array<{ value: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}

const QUESTIONS: Question[] = [
  {
    id: 'occupation',
    title: 'What is your main work?',
    subtitle: 'Tell us what you do so we can suggest the right cover for your daily risks.',
    options: [
      { value: 'MOTO_RIDER', label: 'Moto Rider', icon: Bike },
      { value: 'FARMER', label: 'Farmer', icon: Sprout },
      { value: 'VENDOR', label: 'Market Vendor', icon: Store },
      { value: 'OFFICE', label: 'Office Worker', icon: Building2 },
      { value: 'OTHER', label: 'Other', icon: MoreHorizontal },
    ],
  },
  {
    id: 'dependents',
    title: 'How many people depend on you?',
    subtitle: 'This helps us recommend family or individual plans.',
    options: [
      { value: '0', label: 'Just me', icon: Users },
      { value: '1-2', label: '1–2 people', icon: Users },
      { value: '3-4', label: '3–4 people', icon: Users },
      { value: '5+', label: '5 or more', icon: Users },
    ],
  },
  {
    id: 'smartphone',
    title: 'Do you own a smartphone?',
    subtitle: 'Ingoboka works best on mobile for claims and payments.',
    options: [
      { value: 'YES', label: 'Yes, I use it daily', icon: Smartphone },
      { value: 'SOMETIMES', label: 'Sometimes', icon: Smartphone },
      { value: 'NO', label: 'No smartphone', icon: Smartphone },
    ],
  },
  {
    id: 'payment',
    title: 'How do you prefer to pay?',
    subtitle: 'Choose the premium frequency that fits your cash flow.',
    options: [
      { value: 'DAILY', label: 'Daily (small amounts)', icon: Store },
      { value: 'WEEKLY', label: 'Weekly', icon: Store },
      { value: 'MONTHLY', label: 'Monthly', icon: Store },
    ],
  },
  {
    id: 'income',
    title: 'What is your daily income?',
    subtitle: 'We use this only to check affordability — never shared.',
    options: [
      { value: 'UNDER_2K', label: 'Under 2,000 RWF', icon: Store },
      { value: '2K_5K', label: '2,000 – 5,000 RWF', icon: Store },
      { value: '5K_10K', label: '5,000 – 10,000 RWF', icon: Store },
      { value: 'OVER_10K', label: 'Over 10,000 RWF', icon: Store },
    ],
  },
  {
    id: 'ready',
    title: 'Almost there! Ready for results?',
    subtitle: 'We will match you with affordable protection for your family.',
    options: [
      { value: 'YES', label: 'Show my recommendations', icon: ArrowRight },
    ],
  },
];

export default function NeedsAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [showResults, setShowResults] = useState(false);

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

  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const selected = question ? answers[question.id] : undefined;

  function handleSelect(value: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (step < QUESTIONS.length - 1) {
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
        <CitizenHeader title="Needs Assessment" />
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
          <div className="relative mb-8 h-32 w-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-brand-primary">
            Finding your perfect cover…
          </h2>
          <p className="max-w-sm text-sm text-brand-muted">
            {assessmentMutation.data?.guidance ||
              "We're analyzing your risk profile to find the most affordable protection for your family."}
          </p>
          {assessmentMutation.data && (
            <>
              <p className="mt-4 text-sm font-semibold text-brand-primary">
                Match score: {assessmentMutation.data.score}%
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
          {assessmentMutation.isPending && <Spinner className="mt-6" />}
        </div>
      </>
    );
  }

  return (
    <>
      <CitizenHeader title="Needs Assessment" />
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col px-4 pb-28 pt-4">
        <Link href="/products" className="mb-4 text-sm font-medium text-brand-primary hover:underline">
          ← Back to products
        </Link>

        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs text-brand-muted">
            <span>
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <span className="font-semibold text-brand-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-surface-container">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="mb-2 text-2xl font-bold text-brand-primary-dark">{question.title}</h1>
          <p className="mb-8 text-sm text-brand-muted">{question.subtitle}</p>

          <div
            className={cn(
              'grid gap-3',
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
                    'flex flex-col items-center justify-center rounded-xl border-2 p-5 text-center transition-all active:scale-95',
                    isSelected
                      ? 'border-brand-primary bg-brand-primary-light shadow-md'
                      : 'border-brand-border bg-white hover:border-brand-secondary'
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-colors',
                      isSelected ? 'bg-brand-accent' : 'bg-brand-primary-light'
                    )}
                  >
                    <Icon className="h-7 w-7 text-brand-primary" />
                  </div>
                  <span className="text-sm font-semibold text-brand-primary-dark">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-brand-border bg-brand-surface-container-low px-4 py-4">
        <div className="mx-auto flex max-w-lg gap-3">
          <Button variant="outline" className="flex-1 rounded-full" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button
            variant="pill-accent"
            className="flex-1 gap-1 rounded-full"
            disabled={!selected}
            onClick={handleNext}
          >
            {step === QUESTIONS.length - 1 ? 'See results' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </>
  );
}

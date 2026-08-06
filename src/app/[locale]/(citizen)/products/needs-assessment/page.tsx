'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Bike,
  Building2,
  MoreHorizontal,
  Smartphone,
  Sprout,
  Store,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { enrollmentApi, customerApiExt } from '@/lib/api';
import { setRecommendedProductIds } from '@/lib/recommended-products';
import { DEPENDANT_AGE_ERROR, isDependantTooOld } from '@/lib/dependant-validation';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

function dependantSlotsForRange(range: string): number {
  if (range === '1-2') return 2;
  if (range === '3-4') return 4;
  if (range === '5+') return 5;
  return 0;
}

type DependantDraft = { firstName: string; lastName: string; dateOfBirth: string };

export default function NeedsAssessmentPage() {
  const t = useTranslations('citizen.needsAssessment');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [showResults, setShowResults] = useState(false);
  const [showDependantDialog, setShowDependantDialog] = useState(false);
  const [dependantDrafts, setDependantDrafts] = useState<DependantDraft[]>([]);
  const [dependantError, setDependantError] = useState<string | null>(null);

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
    mutationFn: async () => {
      await customerApiExt.saveNeedsAssessmentPreferences({
        occupation: answers.occupation,
        incomeRange: answers.income,
        dependents: answers.dependents
          ? parseInt(answers.dependents.replace(/\D/g, ''), 10) || 0
          : 0,
        primaryRisk: answers.occupation === 'MOTO_RIDER' ? 'ACCIDENT' : 'HEALTH',
        paymentPreference: answers.payment,
        smartphoneAccess: answers.smartphone,
        answers,
      });
      return enrollmentApi.needsAssessment({
        occupation: answers.occupation ?? 'OTHER',
        incomeRange: answers.income,
        dependents: answers.dependents
          ? parseInt(answers.dependents.replace(/\D/g, ''), 10) || 0
          : undefined,
        primaryRisk: answers.occupation === 'MOTO_RIDER' ? 'ACCIDENT' : 'HEALTH',
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['needs-assessment-preferences'] });
      const ids = result.recommendedProducts?.map((p) => p.id) ?? [];
      if (ids.length > 0) {
        setRecommendedProductIds(ids);
      }
      setTimeout(() => router.push('/products?recommended=true'), 2500);
    },
  });

  const saveDependantsMutation = useMutation({
    mutationFn: async (drafts: DependantDraft[]) => {
      for (const draft of drafts) {
        if (!draft.firstName.trim() || !draft.lastName.trim()) continue;
        await customerApiExt.addDependant({
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          relationship: 'CHILD',
          dateOfBirth: draft.dateOfBirth || undefined,
        });
      }
    },
    onSuccess: () => {
      setShowDependantDialog(false);
      setStep((s) => s + 1);
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
    if (question?.id === 'dependents' && answers.dependents && answers.dependents !== '0') {
      const slots = dependantSlotsForRange(answers.dependents);
      setDependantDrafts(
        Array.from({ length: slots }, () => ({ firstName: '', lastName: '', dateOfBirth: '' }))
      );
      setDependantError(null);
      setShowDependantDialog(true);
      return;
    }
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setShowResults(true);
    assessmentMutation.mutate();
  }

  function handleSaveDependants() {
    const filled = dependantDrafts.filter((d) => d.firstName.trim() && d.lastName.trim());
    if (filled.length === 0) {
      setDependantError('Add at least one dependant or go back and select "None".');
      return;
    }
    for (const draft of filled) {
      if (draft.dateOfBirth && isDependantTooOld(draft.dateOfBirth)) {
        setDependantError(DEPENDANT_AGE_ERROR);
        return;
      }
    }
    saveDependantsMutation.mutate(filled);
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

      <Dialog open={showDependantDialog} onOpenChange={setShowDependantDialog}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-brand-primary" />
              Add your dependants
            </DialogTitle>
            <DialogDescription>
              You indicated {answers.dependents} dependants. Add their details below (must be under 18).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dependantDrafts.map((draft, index) => (
              <div key={index} className="rounded-lg border border-brand-border p-3 space-y-2">
                <p className="text-sm font-semibold text-brand-primary-dark">Dependant {index + 1}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`dep-fn-${index}`}>First name</Label>
                    <Input
                      id={`dep-fn-${index}`}
                      value={draft.firstName}
                      onChange={(e) => {
                        const next = [...dependantDrafts];
                        next[index] = { ...next[index], firstName: e.target.value };
                        setDependantDrafts(next);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dep-ln-${index}`}>Last name</Label>
                    <Input
                      id={`dep-ln-${index}`}
                      value={draft.lastName}
                      onChange={(e) => {
                        const next = [...dependantDrafts];
                        next[index] = { ...next[index], lastName: e.target.value };
                        setDependantDrafts(next);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`dep-dob-${index}`}>Date of birth</Label>
                  <Input
                    id={`dep-dob-${index}`}
                    type="date"
                    value={draft.dateOfBirth}
                    onChange={(e) => {
                      const next = [...dependantDrafts];
                      next[index] = { ...next[index], dateOfBirth: e.target.value };
                      setDependantDrafts(next);
                    }}
                  />
                </div>
              </div>
            ))}
            {dependantError && <Alert variant="error">{dependantError}</Alert>}
            {saveDependantsMutation.error && (
              <Alert variant="error">{(saveDependantsMutation.error as Error).message}</Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDependantDialog(false)}>
              Cancel
            </Button>
            <Button loading={saveDependantsMutation.isPending} onClick={handleSaveDependants}>
              Save &amp; continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

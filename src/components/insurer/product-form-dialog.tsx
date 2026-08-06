'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  Users,
  Verified,
} from 'lucide-react';
import { productApi } from '@/lib/api';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, cn } from '@/lib/utils';
import { humanizeLabel } from '@/lib/status-label';

const CATEGORIES = ['BUNDLE', 'HEALTH', 'ACCIDENT', 'FUNERAL', 'BUSINESS'] as const;

const DEFAULT_BENEFITS = [
  { id: 'hospital', label: 'Hospital Cash', description: 'Daily payout during inpatient stays exceeding 48 hours.', icon: HeartPulse },
  { id: 'bereavement', label: 'Bereavement Support', description: 'Immediate financial assistance for funeral arrangements.', icon: Users },
  { id: 'disability', label: 'Accidental Disability', description: 'Lump sum payout for permanent disability from accidents.', icon: AlertTriangle },
];

const DEFAULT_EXCLUSIONS = [
  'Self-inflicted injuries or elective procedures.',
  'Pre-existing chronic conditions not declared at signup.',
  'Injuries sustained during illegal activities.',
];

const STEP_LABELS = ['Basic Info', 'Coverage', 'Pricing', 'Review'];

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormDialog({ open, onOpenChange, onSuccess }: ProductFormDialogProps) {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'BUNDLE' as (typeof CATEGORIES)[number],
    description: '',
    heroImageUrl: '',
    benefits: DEFAULT_BENEFITS.map((b) => b.id),
    ageRange: '18 - 65 Years Old',
    location: 'Rwanda (All Provinces)',
    occupationTypes: 'Smallholder Farmers, Traders',
    exclusions: DEFAULT_EXCLUSIONS,
    planCode: 'MONTHLY',
    planName: 'Monthly Plan',
    premiumAmount: 4500,
    billingFrequency: 'MONTHLY',
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const selectedBenefits = DEFAULT_BENEFITS.filter((b) => form.benefits.includes(b.id));
      return productApi.create({
        code: form.code,
        name: form.name,
        category: form.category,
        description: form.description || undefined,
        heroImageUrl: form.heroImageUrl.trim() || undefined,
        plans: [
          {
            code: form.planCode,
            name: form.planName,
            billingFrequency: form.billingFrequency,
            premiumAmount: form.premiumAmount,
            isDefault: true,
            waitingPeriodDays: 30,
            benefits: selectedBenefits.map((b) => ({
              title: b.label,
              description: b.description,
              coverageLimit: b.id === 'disability' ? 500000 : b.id === 'bereavement' ? 1000000 : 500000,
            })),
            exclusions: form.exclusions.map((title) => ({ title })),
            eligibility: { minAge: 18, maxAge: 65 },
          },
        ],
      });
    },
    onSuccess: () => {
      onOpenChange(false);
      setFormStep(1);
      onSuccess?.();
    },
  });

  function toggleBenefit(id: string) {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(id)
        ? prev.benefits.filter((b) => b !== id)
        : [...prev.benefits, id],
    }));
  }

  function handleClose(next: boolean) {
    if (!next) {
      setFormStep(1);
      createMutation.reset();
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createProduct')}</DialogTitle>
        </DialogHeader>

        <div className="mb-4 text-sm text-brand-muted">
          Step {formStep} of 4 — {STEP_LABELS[formStep - 1]}
        </div>
        <StepIndicator totalSteps={4} currentStep={formStep} className="mb-6" />

        {formStep === 1 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Product code</Label>
                <Input
                  placeholder="FAMILY-HEALTH"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label>Product name</Label>
                <Input
                  placeholder="Family Health Guard"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                      form.category === cat
                        ? 'border-brand-accent bg-brand-accent text-brand-primary-dark'
                        : 'border-brand-border text-brand-muted hover:bg-brand-surface-container-low'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Short description</Label>
              <textarea
                className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Product image URL</Label>
              <Input
                placeholder="https://example.com/product-image.jpg"
                value={form.heroImageUrl}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
              />
              <p className="text-xs text-brand-muted">
                Optional. Paste an image URL related to this product name/category. Citizens see this on product cards.
              </p>
            </div>
            <Button className="w-full sm:w-auto" variant="pill" disabled={!form.code || !form.name} onClick={() => setFormStep(2)}>
              Continue
            </Button>
          </div>
        )}

        {formStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-border bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Verified className="h-5 w-5 text-brand-primary" />
                <h3 className="font-semibold text-brand-primary-dark">Core Benefits</h3>
              </div>
              <div className="space-y-3">
                {DEFAULT_BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  const active = form.benefits.includes(benefit.id);
                  return (
                    <button
                      key={benefit.id}
                      type="button"
                      onClick={() => toggleBenefit(benefit.id)}
                      className={cn(
                        'flex w-full gap-3 rounded-lg p-3 text-left transition-all',
                        active ? 'bg-brand-primary-light ring-2 ring-brand-primary/30' : 'bg-brand-surface-container-low opacity-60'
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
                        <Icon className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{benefit.label}</p>
                        <p className="text-xs text-brand-muted">{benefit.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-brand-error/20 bg-red-50/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-brand-error" />
                <h3 className="font-semibold text-brand-primary-dark">Key Exclusions</h3>
              </div>
              <ul className="space-y-2">
                {form.exclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                    <Ban className="mt-0.5 h-4 w-4 shrink-0 text-brand-error" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormStep(1)}>Back</Button>
              <Button className="flex-1" variant="pill" onClick={() => setFormStep(3)}>Continue</Button>
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Plan name</Label>
                <Input value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Plan code</Label>
                <Input value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label>Billing frequency</Label>
                <select
                  className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
                  value={form.billingFrequency}
                  onChange={(e) => setForm({ ...form, billingFrequency: e.target.value })}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Premium (RWF)</Label>
                <Input
                  type="number"
                  value={form.premiumAmount}
                  onChange={(e) => setForm({ ...form, premiumAmount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormStep(2)}>Back</Button>
              <Button className="flex-1" variant="pill" onClick={() => setFormStep(4)}>Review</Button>
            </div>
          </div>
        )}

        {formStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-3 rounded-xl bg-brand-surface-container-low p-4 text-sm">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-primary" />
                <div>
                  <p className="font-semibold text-brand-primary-dark">{form.name} ({form.code})</p>
                  <p className="text-brand-muted">{humanizeLabel(form.category, 'title')}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-brand-primary">
                {formatCurrency(form.premiumAmount)} / {form.billingFrequency.toLowerCase()}
              </p>
              <p className="text-xs text-brand-muted">{t('draftProductHint')}</p>
            </div>
            {createMutation.error && (
              <Alert variant="error">{(createMutation.error as Error).message}</Alert>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFormStep(3)}>Back</Button>
              <Button
                className="flex-1 gap-2"
                variant="pill-accent"
                onClick={() => createMutation.mutate()}
                loading={createMutation.isPending}
                disabled={!form.code || !form.name}
              >
                <CheckCircle2 className="h-4 w-4" />
                {tCommon('save')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

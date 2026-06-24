'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Package,
  Plus,
  ShieldCheck,
  Users,
  Verified,
} from 'lucide-react';
import { productApi } from '@/lib/api';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, cn } from '@/lib/utils';

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

export default function InsurerProductsPage() {
  const t = useTranslations('insurer');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: 'BUNDLE' as (typeof CATEGORIES)[number],
    description: '',
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['insurer', 'products'],
    queryFn: () => productApi.listAdmin(),
  });

  function buildDescription() {
    const benefitLines = DEFAULT_BENEFITS.filter((b) => form.benefits.includes(b.id))
      .map((b) => `- ${b.label}: ${b.description}`)
      .join('\n');
    return [
      form.description,
      '',
      '## Coverage',
      benefitLines,
      '',
      `Eligibility: ${form.ageRange}; ${form.location}; ${form.occupationTypes}`,
      '',
      '## Exclusions',
      ...form.exclusions.map((e) => `- ${e}`),
    ]
      .filter(Boolean)
      .join('\n');
  }

  const createMutation = useMutation({
    mutationFn: () => {
      const selectedBenefits = DEFAULT_BENEFITS.filter((b) => form.benefits.includes(b.id));
      return productApi.create({
        code: form.code,
        name: form.name,
        category: form.category,
        description: form.description || undefined,
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
      queryClient.invalidateQueries({ queryKey: ['insurer', 'products'] });
      setShowForm(false);
      setFormStep(1);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => productApi.publish(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insurer', 'products'] }),
  });

  const products = data?.content ?? [];

  function toggleBenefit(id: string) {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(id)
        ? prev.benefits.filter((b) => b !== id)
        : [...prev.benefits, id],
    }));
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary-dark">{t('manageProducts')}</h1>
          <p className="text-sm text-brand-muted">{t('products')}</p>
        </div>
        <Button variant="pill" onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('createProduct')}
        </Button>
      </header>

      {showForm && (
        <Card className="mb-6 border-brand-primary/20">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-brand-muted">
                Step {formStep} of 4 — {STEP_LABELS[formStep - 1]}
              </span>
            </div>
            <StepIndicator totalSteps={4} currentStep={formStep} className="mb-6" />

            {formStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-primary-dark">Product Setup: Basic Info</h2>
                  <p className="text-sm text-brand-muted">Name your product and choose a category.</p>
                </div>
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
                    placeholder="Full medical coverage for families"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full sm:w-auto"
                  variant="pill"
                  disabled={!form.code || !form.name}
                  onClick={() => setFormStep(2)}
                >
                  Continue to coverage
                </Button>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-primary-dark">Product Setup: Coverage</h2>
                  <p className="text-sm text-brand-muted">
                    Define what is included, who qualifies, and what stays out. (UI-only — stored in product description.)
                  </p>
                </div>

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
                            active
                              ? 'bg-brand-primary-light ring-2 ring-brand-primary/30'
                              : 'bg-brand-surface-container-low opacity-60'
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

                <div className="rounded-xl border border-brand-border bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-secondary" />
                    <h3 className="font-semibold text-brand-primary-dark">Eligibility Criteria</h3>
                  </div>
                  <div className="grid gap-3">
                    {[
                      { key: 'ageRange' as const, label: 'Age Range' },
                      { key: 'location' as const, label: 'Location' },
                      { key: 'occupationTypes' as const, label: 'Occupation Type' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-brand-muted">{field.label}</Label>
                        <Input
                          value={form[field.key]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        />
                      </div>
                    ))}
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
                  <Button variant="outline" onClick={() => setFormStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" variant="pill" onClick={() => setFormStep(3)}>
                    Continue to pricing
                  </Button>
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-primary-dark">Product Setup: Pricing</h2>
                  <p className="text-sm text-brand-muted">Set your default plan and premium amount.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plan name</Label>
                    <Input
                      value={form.planName}
                      onChange={(e) => setForm({ ...form, planName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Plan code</Label>
                    <Input
                      value={form.planCode}
                      onChange={(e) => setForm({ ...form, planCode: e.target.value.toUpperCase() })}
                    />
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
                  <Button variant="outline" onClick={() => setFormStep(2)}>
                    Back
                  </Button>
                  <Button className="flex-1" variant="pill" onClick={() => setFormStep(4)}>
                    Review
                  </Button>
                </div>
              </div>
            )}

            {formStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-primary-dark">Review & Publish</h2>
                  <p className="text-sm text-brand-muted">Confirm details before creating the draft product.</p>
                </div>
                <div className="space-y-3 rounded-xl bg-brand-surface-container-low p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-primary" />
                    <div>
                      <p className="font-semibold text-brand-primary-dark">
                        {form.name} ({form.code})
                      </p>
                      <p className="text-brand-muted">{form.category}</p>
                    </div>
                  </div>
                  <p className="text-brand-muted">{form.description || 'No short description.'}</p>
                  <p className="text-xs text-brand-muted">
                    {form.benefits.length} benefits · {form.exclusions.length} exclusions
                  </p>
                  <p className="text-lg font-bold text-brand-primary">
                    {formatCurrency(form.premiumAmount)} / {form.billingFrequency.toLowerCase()}
                  </p>
                </div>
                {createMutation.error && (
                  <Alert variant="error">{(createMutation.error as Error).message}</Alert>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setFormStep(3)}>
                    Back
                  </Button>
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
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && <Alert variant="error">{tCommon('error')}</Alert>}

      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="border-brand-border/60 transition-shadow hover:shadow-elevated">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-light">
                  <Package className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold text-brand-primary-dark">{product.name}</p>
                  <p className="text-sm text-brand-muted">{product.code}</p>
                  {product.startingPremium != null && (
                    <p className="text-sm font-semibold text-brand-primary">
                      {formatCurrency(product.startingPremium, product.currency ?? 'RWF')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={product.status === 'ACTIVE' ? 'active' : 'pending'}>
                  {product.status === 'ACTIVE' ? t('activeProduct') : t('draft')}
                </Badge>
                {product.status !== 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="pill"
                    loading={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(product.id)}
                  >
                    {t('publish')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && products.length === 0 && !showForm && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-brand-muted">
            No products yet. Create your first microinsurance product.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

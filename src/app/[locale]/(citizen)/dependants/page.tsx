'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Baby, Heart, Trash2, User, UserPlus, Users } from 'lucide-react';
import { customerApiExt } from '@/lib/api';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RELATIONSHIPS = [
  { value: 'CHILD', labelKey: 'relChild' as const, icon: Baby },
  { value: 'SPOUSE', labelKey: 'relSpouse' as const, icon: Heart },
  { value: 'PARENT', labelKey: 'relParent' as const, icon: User },
] as const;

function relationshipIcon(relationship: string) {
  return RELATIONSHIPS.find((r) => r.value === relationship)?.icon ?? Users;
}

function relationshipLabel(
  relationship: string,
  t: ReturnType<typeof useTranslations<'citizen.dependantsPage'>>
) {
  const found = RELATIONSHIPS.find((r) => r.value === relationship);
  return found ? t(found.labelKey) : relationship;
}

export default function DependantsPage() {
  const t = useTranslations('citizen.dependantsPage');
  const tNav = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    relationship: 'CHILD',
    dateOfBirth: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['dependants'],
    queryFn: () => customerApiExt.listDependants(),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      customerApiExt.addDependant({
        firstName: form.firstName,
        lastName: form.lastName,
        relationship: form.relationship,
        dateOfBirth: form.dateOfBirth || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependants'] });
      setForm({ firstName: '', lastName: '', relationship: 'CHILD', dateOfBirth: '' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => customerApiExt.removeDependant(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dependants'] }),
  });

  const dependants =
    (data as Array<{
      id: string;
      firstName: string;
      lastName: string;
      relationship: string;
      dateOfBirth?: string;
    }>) ?? [];

  if (isLoading) {
    return (
      <>
        <CitizenHeader title={tNav('dependants')} />
        <PageSkeleton cards={3} showHeader={false} />
      </>
    );
  }

  return (
    <>
      <CitizenHeader title={tNav('dependants')} />
      <PageContainer>
        <PageHeader title={tNav('dependants')} subtitle={t('subtitle')} backHref="/dashboard" />

        {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="h-fit border-brand-primary/20 shadow-card">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-primary" />
                <h2 className="font-semibold text-brand-primary-dark">{t('addTitle')}</h2>
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>{t('firstName')}</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('lastName')}</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('dateOfBirth')}</Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('relationship')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map((rel) => {
                      const Icon = rel.icon;
                      return (
                        <button
                          key={rel.value}
                          type="button"
                          aria-pressed={form.relationship === rel.value}
                          onClick={() => setForm({ ...form, relationship: rel.value })}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                            form.relationship === rel.value
                              ? 'border-brand-primary bg-brand-primary-light text-brand-primary'
                              : 'border-brand-border text-brand-muted hover:bg-brand-surface-container-low'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {t(rel.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {addMutation.error && (
                  <Alert variant="error">{(addMutation.error as Error).message}</Alert>
                )}
                <Button
                  variant="pill-accent"
                  onClick={() => addMutation.mutate()}
                  loading={addMutation.isPending}
                  disabled={!form.firstName || !form.lastName}
                >
                  {tCommon('save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-brand-primary-dark">{t('yourFamily')}</h2>
              <span className="text-xs text-brand-muted">{t('members', { count: dependants.length })}</span>
            </div>

            {dependants.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-brand-muted">
                  {t('empty')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dependants.map((d) => {
                  const Icon = relationshipIcon(d.relationship);
                  return (
                    <Card
                      key={d.id}
                      className="border-brand-border/60 transition-shadow hover:shadow-card"
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-light">
                          <Icon className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-brand-primary-dark">
                            {d.firstName} {d.lastName}
                          </p>
                          <Badge variant="pending" className="mt-1 text-xs">
                            {relationshipLabel(d.relationship, t)}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-brand-error"
                          loading={removeMutation.isPending}
                          onClick={() => removeMutation.mutate(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('remove')}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}

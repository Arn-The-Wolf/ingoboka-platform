'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Baby, Heart, User, UserPlus, Users } from 'lucide-react';
import { customerApiExt } from '@/lib/api';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const RELATIONSHIPS = [
  { value: 'CHILD', label: 'Child', icon: Baby },
  { value: 'SPOUSE', label: 'Spouse', icon: Heart },
  { value: 'PARENT', label: 'Parent', icon: User },
] as const;

function relationshipIcon(relationship: string) {
  return RELATIONSHIPS.find((r) => r.value === relationship)?.icon ?? Users;
}

export default function DependantsPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', relationship: 'CHILD' });

  const { data, isLoading } = useQuery({
    queryKey: ['dependants'],
    queryFn: () => customerApiExt.listDependants(),
  });

  const addMutation = useMutation({
    mutationFn: () => customerApiExt.addDependant(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependants'] });
      setForm({ firstName: '', lastName: '', relationship: 'CHILD' });
    },
  });

  const dependants =
    (data as Array<{ id: string; firstName: string; lastName: string; relationship: string }>) ?? [];

  return (
    <>
      <CitizenHeader title={t('dependants')} />
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        <PageHeader
          title={t('dependants')}
          subtitle="Manage family members on your profile."
          backHref="/dashboard"
        />

        <Card className="mb-6 border-brand-primary/20 shadow-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-brand-primary" />
              <h2 className="font-semibold text-brand-primary-dark">Add dependant</h2>
            </div>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                  placeholder="Jean"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                  placeholder="Mukamana"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map((rel) => {
                    const Icon = rel.icon;
                    return (
                      <button
                        key={rel.value}
                        type="button"
                        onClick={() => setForm({ ...form, relationship: rel.value })}
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                          form.relationship === rel.value
                            ? 'border-brand-primary bg-brand-primary-light text-brand-primary'
                            : 'border-brand-border text-brand-muted hover:bg-brand-surface-container-low'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {rel.label}
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

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-primary-dark">Your family</h2>
          <span className="text-xs text-brand-muted">{dependants.length} members</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : dependants.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-brand-muted">
              No dependants added yet. Add a family member above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dependants.map((d) => {
              const Icon = relationshipIcon(d.relationship);
              return (
                <Card key={d.id} className="border-brand-border/60 transition-shadow hover:shadow-card">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-light">
                      <Icon className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-brand-primary-dark">
                        {d.firstName} {d.lastName}
                      </p>
                      <Badge variant="pending" className="mt-1 text-xs">
                        {d.relationship}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

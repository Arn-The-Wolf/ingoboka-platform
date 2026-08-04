'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Baby, Heart, Trash2, User, UserPlus, Users, Edit2, Plus, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

type DependantFormData = {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
};

type Dependant = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth?: string;
};

export default function DependantsPage() {
  const t = useTranslations('citizen.dependantsPage');
  const tNav = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDependant, setSelectedDependant] = useState<Dependant | null>(null);
  
  const [form, setForm] = useState<DependantFormData>({
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
      setIsAddDialogOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: () => {
      if (!selectedDependant) throw new Error('No dependant selected');
      return customerApiExt.updateDependant(selectedDependant.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        relationship: form.relationship,
        dateOfBirth: form.dateOfBirth || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependants'] });
      setIsEditDialogOpen(false);
      setSelectedDependant(null);
      setForm({ firstName: '', lastName: '', relationship: 'CHILD', dateOfBirth: '' });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => customerApiExt.removeDependant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dependants'] });
      setIsDeleteDialogOpen(false);
      setSelectedDependant(null);
    },
  });

  const handleAddClick = () => {
    setForm({ firstName: '', lastName: '', relationship: 'CHILD', dateOfBirth: '' });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (dependant: Dependant) => {
    setSelectedDependant(dependant);
    setForm({
      firstName: dependant.firstName,
      lastName: dependant.lastName,
      relationship: dependant.relationship,
      dateOfBirth: dependant.dateOfBirth || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (dependant: Dependant) => {
    setSelectedDependant(dependant);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDependant) {
      removeMutation.mutate(selectedDependant.id);
    }
  };

  const dependants = (data as Dependant[]) ?? [];

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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary-dark">{tNav('dependants')}</h1>
            <p className="mt-1 text-sm text-brand-muted">{t('subtitle')}</p>
          </div>
          <Button onClick={handleAddClick} variant="default">
            <Plus className="h-4 w-4" />
            {t('addButton')}
          </Button>
        </div>

        {error && <Alert variant="error" className="mb-4">{tCommon('error')}</Alert>}

        {dependants.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-light">
                <Users className="h-8 w-8 text-brand-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-brand-primary-dark">{t('empty')}</h3>
              <p className="mb-6 max-w-sm text-sm text-brand-muted">
                Add family members to manage their insurance coverage together.
              </p>
              <Button onClick={handleAddClick} variant="default">
                <Plus className="h-4 w-4" />
                {t('addButton')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b bg-brand-surface-container-low">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-brand-primary-dark">
                        {t('name')}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-brand-primary-dark">
                        {t('relationship')}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-brand-primary-dark">
                        {t('dob')}
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-brand-primary-dark">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {dependants.map((dependant) => {
                      const Icon = relationshipIcon(dependant.relationship);
                      return (
                        <tr
                          key={dependant.id}
                          className="transition-colors hover:bg-brand-surface-container-low/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light">
                                <Icon className="h-5 w-5 text-brand-primary" />
                              </div>
                              <span className="font-medium text-brand-primary-dark">
                                {dependant.firstName} {dependant.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="pending" className="text-xs">
                              {relationshipLabel(dependant.relationship, t)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-muted">
                            {dependant.dateOfBirth || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(dependant)}
                                className="text-brand-primary hover:bg-brand-primary-light"
                              >
                                <Edit2 className="h-4 w-4" />
                                {t('edit')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(dependant)}
                                className="text-brand-error hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t('remove')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="divide-y divide-brand-border md:hidden">
                {dependants.map((dependant) => {
                  const Icon = relationshipIcon(dependant.relationship);
                  return (
                    <div key={dependant.id} className="p-4">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light">
                          <Icon className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-brand-primary-dark">
                            {dependant.firstName} {dependant.lastName}
                          </p>
                          <Badge variant="pending" className="mt-1 text-xs">
                            {relationshipLabel(dependant.relationship, t)}
                          </Badge>
                          {dependant.dateOfBirth && (
                            <p className="mt-1 text-xs text-brand-muted">
                              {t('dob')}: {dependant.dateOfBirth}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(dependant)}
                          className="flex-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          {t('edit')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(dependant)}
                          className="flex-1 text-brand-error hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('remove')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Dependant Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-primary" />
                {t('addTitle')}
              </DialogTitle>
              <DialogDescription>{t('subtitle')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-firstName">{t('firstName')}</Label>
                <Input
                  id="add-firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">{t('lastName')}</Label>
                <Input
                  id="add-lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-dateOfBirth">{t('dateOfBirth')}</Label>
                <Input
                  id="add-dateOfBirth"
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
                        onClick={() => setForm({ ...form, relationship: rel.value })}
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={addMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => addMutation.mutate()}
                loading={addMutation.isPending}
                disabled={!form.firstName || !form.lastName}
                variant="default"
              >
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dependant Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-brand-primary" />
                {t('editTitle')}
              </DialogTitle>
              <DialogDescription>Update dependant information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">{t('firstName')}</Label>
                <Input
                  id="edit-firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">{t('lastName')}</Label>
                <Input
                  id="edit-lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBirth">{t('dateOfBirth')}</Label>
                <Input
                  id="edit-dateOfBirth"
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
                        onClick={() => setForm({ ...form, relationship: rel.value })}
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
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
              {editMutation.error && (
                <Alert variant="error">{(editMutation.error as Error).message}</Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={editMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => editMutation.mutate()}
                loading={editMutation.isPending}
                disabled={!form.firstName || !form.lastName}
                variant="default"
              >
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-brand-error">
                <Trash2 className="h-5 w-5" />
                {t('deleteTitle')}
              </DialogTitle>
              <DialogDescription>{t('deleteConfirm')}</DialogDescription>
            </DialogHeader>
            {selectedDependant && (
              <div className="rounded-lg border border-brand-border bg-brand-surface-container-low p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-light">
                    {(() => {
                      const Icon = relationshipIcon(selectedDependant.relationship);
                      return <Icon className="h-5 w-5 text-brand-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-primary-dark">
                      {selectedDependant.firstName} {selectedDependant.lastName}
                    </p>
                    <p className="text-sm text-brand-muted">
                      {relationshipLabel(selectedDependant.relationship, t)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {removeMutation.error && (
              <Alert variant="error">{(removeMutation.error as Error).message}</Alert>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={removeMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                loading={removeMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('remove')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
}

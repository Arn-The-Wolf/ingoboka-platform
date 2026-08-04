'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, type Organization } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ITEMS_PER_PAGE = 12;

const ORG_TYPES = ['INSURER', 'BROKER', 'PARTNER'] as const;
const ORG_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'] as const;

type OrgFormData = {
  name: string;
  slug: string;
  organizationType: string;
  status: string;
  contactEmail: string;
};

const emptyForm: OrgFormData = {
  name: '',
  slug: '',
  organizationType: 'INSURER',
  status: 'ACTIVE',
  contactEmail: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type OrgFormFieldsProps = {
  idPrefix: string;
  form: OrgFormData;
  slugTouched: boolean;
  onFormChange: (next: OrgFormData) => void;
  onSlugTouched: () => void;
  labels: {
    name: string;
    namePlaceholder: string;
    slug: string;
    slugPlaceholder: string;
    type: string;
    status: string;
    contactEmail: string;
    contactEmailPlaceholder: string;
  };
};

function OrgFormFields({
  idPrefix,
  form,
  slugTouched,
  onFormChange,
  onSlugTouched,
  labels,
}: OrgFormFieldsProps) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>{labels.name}</Label>
        <Input
          id={`${idPrefix}-name`}
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            onFormChange({
              ...form,
              name,
              slug: slugTouched ? form.slug : slugify(name),
            });
          }}
          placeholder={labels.namePlaceholder}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-slug`}>{labels.slug}</Label>
        <Input
          id={`${idPrefix}-slug`}
          value={form.slug}
          onChange={(e) => {
            onSlugTouched();
            onFormChange({ ...form, slug: slugify(e.target.value) });
          }}
          placeholder={labels.slugPlaceholder}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-type`}>{labels.type}</Label>
        <select
          id={`${idPrefix}-type`}
          value={form.organizationType}
          onChange={(e) => onFormChange({ ...form, organizationType: e.target.value })}
          className="flex h-10 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {ORG_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-status`}>{labels.status}</Label>
        <select
          id={`${idPrefix}-status`}
          value={form.status}
          onChange={(e) => onFormChange({ ...form, status: e.target.value })}
          className="flex h-10 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {ORG_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>{labels.contactEmail}</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={form.contactEmail}
          onChange={(e) => onFormChange({ ...form, contactEmail: e.target.value })}
          placeholder={labels.contactEmailPlaceholder}
        />
      </div>
    </div>
  );
}

export default function AdminOrganizationsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<OrgFormData>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.listOrganizations(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createOrganization({
        name: form.name.trim(),
        slug: form.slug.trim(),
        organizationType: form.organizationType,
        status: form.status,
        contactEmail: form.contactEmail.trim() || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setForm(emptyForm);
      setSlugTouched(false);
      setIsAddOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedOrg) throw new Error('No organization selected');
      return adminApi.updateOrganization(selectedOrg.id, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        organizationType: form.organizationType,
        status: form.status,
        contactEmail: form.contactEmail.trim() || undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      setSelectedOrg(null);
      setForm(emptyForm);
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteOrganization(id),
    onSuccess: () => {
      invalidate();
      setSelectedOrg(null);
      setIsDeleteOpen(false);
      if (currentPage > 1 && (organizations?.length ?? 1) - 1 <= (currentPage - 1) * ITEMS_PER_PAGE) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    },
  });

  const totalPages = Math.ceil((organizations?.length ?? 0) / ITEMS_PER_PAGE);
  const paginatedOrgs = organizations?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getOrgGradient = (index: number) => {
    const gradients = [
      'from-brand-primary to-brand-primary-darker',
      'from-brand-secondary to-brand-secondary/80',
      'from-sky-500 to-sky-700',
      'from-brand-accent to-amber-700',
      'from-teal-500 to-teal-700',
      'from-indigo-500 to-indigo-700',
    ];
    return gradients[index % gradients.length];
  };

  const openAdd = () => {
    setForm(emptyForm);
    setSlugTouched(false);
    setIsAddOpen(true);
  };

  const openEdit = (org: Organization) => {
    setSelectedOrg(org);
    setForm({
      name: org.name,
      slug: org.slug,
      organizationType: org.organizationType || 'INSURER',
      status: org.status || 'ACTIVE',
      contactEmail: org.contactEmail ?? '',
    });
    setSlugTouched(true);
    setIsEditOpen(true);
  };

  const openDelete = (org: Organization) => {
    setSelectedOrg(org);
    setIsDeleteOpen(true);
  };

  const formValid = form.name.trim().length > 0 && form.slug.trim().length > 0;

  const formLabels = {
    name: t('orgName'),
    namePlaceholder: t('orgNamePlaceholder'),
    slug: t('orgSlug'),
    slugPlaceholder: t('orgSlugPlaceholder'),
    type: t('orgType'),
    status: tCommon('status'),
    contactEmail: t('orgContactEmail'),
    contactEmailPlaceholder: t('orgContactEmailPlaceholder'),
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t('organizations')}
          subtitle={t('partnerCount', { count: organizations?.length ?? 0 })}
        />
        <Button variant="default" onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addOrganization')}
        </Button>
      </div>

      {isLoading && <ListSkeleton rows={6} />}

      {error && (
        <Alert variant="error" className="mb-4">
          {tCommon('error')}
        </Alert>
      )}

      {!isLoading && (paginatedOrgs?.length ?? 0) > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedOrgs?.map((org, index) => (
              <Card
                key={org.id}
                className="border-brand-border bg-gradient-to-br from-white to-brand-primary-light/40 hover:shadow-lg transition-all hover:border-brand-primary/40 group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getOrgGradient(index)} text-white shadow-md`}
                    >
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-primary-dark truncate">{org.name}</p>
                      <p className="text-sm text-brand-muted">{org.organizationType}</p>
                    </div>
                    <Badge variant={org.status === 'ACTIVE' ? 'active' : 'pending'} className="shrink-0">
                      {org.status}
                    </Badge>
                  </div>
                  {(org.slug || org.contactEmail) && (
                    <div className="space-y-1 mb-4">
                      {org.slug && (
                        <p className="text-xs text-brand-muted truncate">
                          {t('orgSlug')}: {org.slug}
                        </p>
                      )}
                      {org.contactEmail && (
                        <p className="text-xs text-brand-muted truncate">{org.contactEmail}</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(org)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {t('editOrganization')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-brand-error hover:bg-red-50"
                      onClick={() => openDelete(org)}
                      aria-label={t('deleteOrganization')}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-brand-muted">
                {t('orgShowingRange', {
                  from: (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  to: Math.min(currentPage * ITEMS_PER_PAGE, organizations?.length ?? 0),
                  total: organizations?.length ?? 0,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('previous')}
                </Button>
                <span className="text-sm text-brand-muted">
                  {t('orgPageOf', { current: currentPage, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && (organizations?.length ?? 0) === 0 && (
        <Card className="border-dashed border-brand-border">
          <CardContent className="py-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary-light">
                <Building2 className="h-10 w-10 text-brand-primary" />
              </div>
            </div>
            <p className="font-medium text-brand-primary-dark mb-2">{t('noOrganizations')}</p>
            <p className="text-sm text-brand-muted mb-6">{t('addOrganizationHint')}</p>
            <Button variant="default" onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('addOrganization')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-primary" />
              {t('addOrganization')}
            </DialogTitle>
            <DialogDescription>{t('addOrganizationDesc')}</DialogDescription>
          </DialogHeader>
          <OrgFormFields
            idPrefix="add"
            form={form}
            slugTouched={slugTouched}
            onFormChange={setForm}
            onSlugTouched={() => setSlugTouched(true)}
            labels={formLabels}
          />
          {createMutation.error && (
            <Alert variant="error">{(createMutation.error as Error).message}</Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={createMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="default"
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!formValid}
            >
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-brand-primary" />
              {t('editOrganization')}
            </DialogTitle>
            <DialogDescription>{t('editOrganizationDesc')}</DialogDescription>
          </DialogHeader>
          <OrgFormFields
            idPrefix="edit"
            form={form}
            slugTouched={slugTouched}
            onFormChange={setForm}
            onSlugTouched={() => setSlugTouched(true)}
            labels={formLabels}
          />
          {updateMutation.error && (
            <Alert variant="error">{(updateMutation.error as Error).message}</Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={updateMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="default"
              onClick={() => updateMutation.mutate()}
              loading={updateMutation.isPending}
              disabled={!formValid}
            >
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-brand-error">
              <Trash2 className="h-5 w-5" />
              {t('deleteOrganization')}
            </DialogTitle>
            <DialogDescription>{t('deleteOrganizationConfirm')}</DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <div className="rounded-lg border border-brand-border bg-brand-surface-container-low p-4">
              <p className="font-semibold text-brand-primary-dark">{selectedOrg.name}</p>
              <p className="text-sm text-brand-muted">{selectedOrg.organizationType}</p>
            </div>
          )}
          {deleteMutation.error && (
            <Alert variant="error">{(deleteMutation.error as Error).message}</Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedOrg && deleteMutation.mutate(selectedOrg.id)}
              loading={deleteMutation.isPending}
            >
              {t('deleteOrganization')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

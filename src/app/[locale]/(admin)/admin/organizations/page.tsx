'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Building2, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/ui/list-skeleton';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

export default function AdminOrganizationsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.listOrganizations(),
  });

  const totalPages = Math.ceil((organizations?.length ?? 0) / ITEMS_PER_PAGE);
  const paginatedOrgs = organizations?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getOrgGradient = (index: number) => {
    const gradients = [
      'from-purple-400 to-purple-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-amber-400 to-amber-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={t('organizations')}
          subtitle={t('partnerCount', { count: organizations?.length ?? 0 })}
        />
        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Organization
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
              <Card key={org.id} className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-lg transition-all hover:border-purple-300 group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getOrgGradient(index)} text-white shadow-md`}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{org.name}</p>
                      <p className="text-sm text-gray-600">{org.organizationType}</p>
                    </div>
                    <Badge variant={org.status === 'ACTIVE' ? 'active' : 'pending'} className="shrink-0">
                      {org.status}
                    </Badge>
                  </div>
                  {(org.slug || org.contactEmail) && (
                    <div className="space-y-1 mb-4">
                      {org.slug && <p className="text-xs text-gray-500 truncate">Slug: {org.slug}</p>}
                      {org.contactEmail && <p className="text-xs text-gray-500 truncate">📧 {org.contactEmail}</p>}
                    </div>
                  )}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1 border-blue-200 hover:bg-blue-50 text-blue-700">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50 text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, organizations?.length ?? 0)} of {organizations?.length ?? 0} organizations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && (organizations?.length ?? 0) === 0 && (
        <Card className="border-dashed border-purple-200">
          <CardContent className="py-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                <Building2 className="h-10 w-10 text-purple-600" />
              </div>
            </div>
            <p className="font-medium text-gray-700 mb-2">{t('noOrganizations')}</p>
            <p className="text-sm text-gray-500 mb-6">Start by adding your first organization</p>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

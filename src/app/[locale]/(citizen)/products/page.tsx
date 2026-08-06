'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { LoadingLink } from '@/components/navigation/loading-link';
import { productApi } from '@/lib/api';
import { useRecommendedProductIds } from '@/hooks/use-recommended-products';
import { InsurerPagination } from '@/components/insurer/insurer-pagination';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { PageContainer } from '@/components/layout/page-container';
import { ProductCard } from '@/components/citizen/product-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const FILTERS = ['All', 'Accident', 'Health', 'Funeral', 'Business'] as const;
const DEFAULT_PAGE_SIZE = 9;

function ProductsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { recommendedIds, needsAssessmentCompleted } = useRecommendedProductIds();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: () => productApi.list(page, pageSize),
  });

  const filtered = useMemo(() => {
    const items = data?.content ?? [];
    const sorted = [...items].sort((a, b) => {
      const aRec = recommendedIds.has(a.id) ? 1 : 0;
      const bRec = recommendedIds.has(b.id) ? 1 : 0;
      return bRec - aRec;
    });
    return sorted.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === 'All' ||
        p.category?.toLowerCase().includes(filter.toLowerCase()) ||
        p.name.toLowerCase().includes(filter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [data?.content, search, filter, recommendedIds]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(0);
  };

  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? filtered.length;

  return (
    <>
      <CitizenHeader title={t('products')} />
      <PageContainer>
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="relative overflow-hidden rounded-2xl bg-brand-primary shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/95 to-brand-primary/50" />
            <div className="relative flex min-h-[10rem] items-center px-8 py-10">
              <div>
                <h2 className="text-3xl font-bold text-white">Protect what matters most</h2>
                <p className="mt-2 max-w-lg text-white/85">
                  Browse microinsurance plans tailored for Rwanda — health, accident, funeral, and more.
                </p>
              </div>
            </div>
          </div>
          {!needsAssessmentCompleted && (
            <LoadingLink
              href="/products/needs-assessment"
              className="flex flex-col justify-center rounded-2xl border border-brand-secondary/30 bg-brand-accent/15 p-6 text-sm transition-colors hover:bg-brand-accent/25"
            >
              <span className="text-lg font-semibold text-brand-primary-dark">Not sure which plan fits?</span>
              <span className="mt-2 text-brand-muted">
                Take our 2-minute needs assessment for personalized recommendations.
              </span>
            </LoadingLink>
          )}
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-outline" />
            <input
              type="search"
              placeholder="Search for plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-brand-border bg-white py-3.5 pl-12 pr-4 text-base focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <nav className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all',
                  filter === f
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-brand-surface-container text-brand-muted hover:bg-brand-primary-light'
                )}
              >
                {f}
              </button>
            ))}
          </nav>
        </div>

        {isLoading && <ProductsSkeleton />}

        {error && (
          <Card className="border-brand-error/30 bg-red-50">
            <CardContent className="p-4 text-sm text-brand-error">
              {tCommon('error')}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                {tCommon('retry')}
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                recommended={recommendedIds.has(product.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-brand-muted">
              No products match your search.
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <InsurerPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[9, 12, 20, 50]}
          />
        )}
      </PageContainer>
    </>
  );
}

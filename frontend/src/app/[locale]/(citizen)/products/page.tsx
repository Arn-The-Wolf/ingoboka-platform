'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { productApi } from '@/lib/api';
import { getRecommendedProductIds, clearRecommendedProductIds } from '@/lib/recommended-products';
import { CitizenHeader } from '@/components/layout/citizen-header';
import { ProductCard } from '@/components/citizen/product-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const FILTERS = ['All', 'Accident', 'Health', 'Funeral', 'Business'] as const;

export default function ProductsPage() {
  const t = useTranslations('citizen');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = getRecommendedProductIds();
    if (ids.size > 0) {
      setRecommendedIds(ids);
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.list(),
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

  useEffect(() => {
    if (recommendedIds.size > 0 && data?.content?.length) {
      clearRecommendedProductIds();
    }
  }, [recommendedIds, data?.content?.length]);

  return (
    <>
      <CitizenHeader title={t('products')} />
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        <section className="mb-6">
          <div className="relative mb-4 h-36 overflow-hidden rounded-xl bg-brand-primary shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/90 to-brand-primary/40" />
            <div className="absolute inset-0 flex items-center px-6">
              <h2 className="max-w-[200px] text-2xl font-bold text-white">
                Protect what matters most
              </h2>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-outline" />
            <input
              type="search"
              placeholder="Search for plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-brand-border bg-white py-3.5 pl-12 pr-4 text-base focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </section>

        <nav className="sticky top-16 z-30 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-brand-background px-4 py-2">
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

        <Link
          href="/products/needs-assessment"
          className="mb-6 block rounded-xl border border-brand-secondary/30 bg-brand-accent/15 p-4 text-sm transition-colors hover:bg-brand-accent/25"
        >
          <span className="font-semibold text-brand-primary-dark">Not sure which plan fits?</span>
          <span className="mt-1 block text-brand-muted">
            Take our 2-minute needs assessment for personalized recommendations.
          </span>
        </Link>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

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

        <div className="grid gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              recommended={recommendedIds.has(product.id)}
            />
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-brand-muted">
              No products match your search.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

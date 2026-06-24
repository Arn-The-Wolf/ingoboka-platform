'use client';

import { Star, Package } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { ProductSummary } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ProductSummary;
  recommended?: boolean;
  isNew?: boolean;
  className?: string;
}

/** Product catalog card — matches product_catalog design. */
export function ProductCard({ product, recommended, isNew, className }: ProductCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-brand-border/60 bg-white/80 p-5 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-elevated',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-brand-surface-container">
          {product.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.heroImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-6 w-6 text-brand-primary" />
          )}
        </div>
        {recommended && (
          <Badge className="gap-1 bg-brand-accent text-brand-primary-dark">
            <Star className="h-3 w-3 fill-current" />
            Recommended
          </Badge>
        )}
        {isNew && !recommended && (
          <Badge variant="active" className="bg-brand-primary-light text-brand-primary">
            New
          </Badge>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-brand-primary-dark">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-brand-muted">{product.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-brand-border/30 pt-4">
        <div>
          <p className="text-xs text-brand-outline">Starting from:</p>
          {product.startingPremium != null && (
            <p className="text-sm font-semibold text-brand-primary">
              {formatCurrency(product.startingPremium)} / month
            </p>
          )}
        </div>
        <Link href={`/products/${product.id}`}>
          <Button variant="secondary" size="sm" className="rounded-full">
            View Details
          </Button>
        </Link>
      </div>
    </article>
  );
}

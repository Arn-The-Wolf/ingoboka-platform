'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProductHeroImage } from '@/lib/product-images';
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
  const heroSrc = getProductHeroImage(product);

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-brand-border/60 bg-white/80 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-elevated',
        className
      )}
    >
      <div className="relative h-36 overflow-hidden bg-brand-primary-light/30">
        <Image
          src={heroSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          {recommended && (
            <Badge className="gap-1 bg-brand-accent text-brand-primary-dark shadow-sm">
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
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
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
      </div>
    </article>
  );
}

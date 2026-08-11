import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary-light text-brand-primary-dark',
        active: 'bg-brand-success/15 text-brand-success',
        pending: 'bg-brand-warning/15 text-brand-warning',
        expired: 'bg-brand-muted/15 text-brand-muted',
        error: 'bg-brand-error/15 text-brand-error',
        secondary: 'bg-brand-secondary-light text-brand-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function policyStatusVariant(
  status: string
): VariantProps<typeof badgeVariants>['variant'] {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
      return 'active';
    case 'PENDING':
    case 'DRAFT':
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'INFO_REQUESTED':
      return 'pending';
    case 'EXPIRED':
    case 'REJECTED':
    case 'CANCELLED':
      return status === 'REJECTED' ? 'error' : 'expired';
    default:
      return 'default';
  }
}

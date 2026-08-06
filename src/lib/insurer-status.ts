import { humanize, type StatusTone } from '@/lib/status-label';

/** Humanize any insurer-facing enum/status for display. */
export function insurerStatusLabel(status?: string | null): string {
  return humanize(status);
}

export function claimStatusTone(status?: string | null): StatusTone {
  switch (status) {
    case 'APPROVED':
      return 'active';
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'INFORMATION_REQUIRED':
    case 'INFO_REQUESTED':
    case 'PAYMENT_PROCESSING':
      return 'pending';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
}

export function applicationStatusTone(status?: string | null): StatusTone {
  switch (status) {
    case 'APPROVED':
      return 'active';
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
      return 'pending';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
}

export function productStatusLabel(status?: string | null): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'PUBLISHED':
      return 'Published';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return humanize(status);
  }
}

export function productStatusTone(status?: string | null): StatusTone {
  switch (status) {
    case 'PUBLISHED':
      return 'active';
    case 'DRAFT':
      return 'pending';
    case 'ARCHIVED':
      return 'expired';
    default:
      return 'default';
  }
}

export function isProductPublished(status?: string | null): boolean {
  return status === 'PUBLISHED';
}

export function isProductDraft(status?: string | null): boolean {
  return status === 'DRAFT' || !status;
}

import { humanizeLabel, type StatusTone } from '@/lib/status-label';

const CLAIM_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  INFORMATION_REQUIRED: 'Information requested',
  INFO_REQUESTED: 'Information requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  PAYMENT_PROCESSING: 'Payment processing',
  CLOSED: 'Closed',
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/** Human-readable claim status for badges and timelines. */
export function claimStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return CLAIM_STATUS_LABELS[status] ?? humanizeLabel(status, 'sentence');
}

/** Human-readable application status. */
export function applicationStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return APPLICATION_STATUS_LABELS[status] ?? humanizeLabel(status, 'sentence');
}

/** Humanize any insurer-facing enum/status for display. */
export function insurerStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return (
    CLAIM_STATUS_LABELS[status] ??
    APPLICATION_STATUS_LABELS[status] ??
    humanizeLabel(status, 'sentence')
  );
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
    case 'CANCELLED':
      return 'expired';
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
      return humanizeLabel(status, 'sentence');
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

/** Human-readable staff account status for insurer employee management. */
export function staffStatusLabel(status?: string | null): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'DISABLED':
      return 'Deactivated';
    case 'LOCKED':
      return 'Locked';
    case 'PENDING_ACTIVATION':
      return 'Pending invite';
    case 'PENDING_PASSWORD_CHANGE':
      return 'Pending password change';
    case 'PENDING_EMAIL_VERIFICATION':
      return 'Pending email verification';
    default:
      return humanizeLabel(status, 'sentence');
  }
}

/** Human-readable staff enrollment badge label. */
export function staffEnrollmentLabel(enrollmentStatus?: string | null): string {
  switch (enrollmentStatus) {
    case 'COMPLETED':
      return 'Enrolled';
    case 'DISABLED':
      return 'Deactivated';
    case 'PENDING':
      return 'Pending enrollment';
    default:
      return humanizeLabel(enrollmentStatus, 'sentence');
  }
}

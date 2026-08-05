/**
 * Shared status humanizer for admin surfaces.
 * Never render raw enum values with underscores in the UI — always route through here.
 */

export type StatusTone = 'active' | 'pending' | 'expired' | 'error' | 'secondary' | 'default';

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING_EMAIL_VERIFICATION: 'Pending email verification',
  PENDING_ACTIVATION: 'Pending activation',
  PENDING_PASSWORD_CHANGE: 'Pending password change',
  LOCKED: 'Locked',
  DISABLED: 'Deactivated',
  // Frontend fallbacks that may appear before backend status is resolved.
  PENDING: 'Pending',
  INACTIVE: 'Deactivated',
  DEACTIVATED: 'Deactivated',
};

const ORG_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
};

/** Generic underscore/case humanizer, e.g. PENDING_EMAIL_VERIFICATION → "Pending email verification". */
export function humanize(value?: string | null): string {
  if (!value) return '—';
  return value
    .toString()
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export function userStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return USER_STATUS_LABELS[status] ?? humanize(status);
}

export function orgStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return ORG_STATUS_LABELS[status] ?? humanize(status);
}

/** Map a status to a Badge tone. */
export function userStatusTone(status?: string | null): StatusTone {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'PENDING_EMAIL_VERIFICATION':
    case 'PENDING_ACTIVATION':
    case 'PENDING_PASSWORD_CHANGE':
    case 'PENDING':
      return 'pending';
    case 'LOCKED':
      return 'error';
    case 'DISABLED':
    case 'INACTIVE':
    case 'DEACTIVATED':
      return 'expired';
    default:
      return 'default';
  }
}

export function orgStatusTone(status?: string | null): StatusTone {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'SUSPENDED':
    case 'PENDING':
      return 'pending';
    case 'INACTIVE':
      return 'expired';
    default:
      return 'default';
  }
}

/** Humanize a role code, e.g. PLATFORM_ADMIN → "Platform admin". */
export function roleLabel(role?: string | null): string {
  return humanize(role);
}

/** Canonical user-status buckets for filtering + visualization. */
export const USER_STATUS_ORDER: string[] = [
  'ACTIVE',
  'PENDING_EMAIL_VERIFICATION',
  'PENDING_ACTIVATION',
  'PENDING_PASSWORD_CHANGE',
  'LOCKED',
  'DISABLED',
];

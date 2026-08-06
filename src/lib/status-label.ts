/**
 * Shared status humanizer for admin surfaces.
 * Never render raw enum values with underscores in the UI — always route through here.
 */

export type StatusTone = 'active' | 'pending' | 'expired' | 'error' | 'secondary' | 'default';

export type HumanizeStyle = 'sentence' | 'title';

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

const ORG_TYPE_LABELS: Record<string, string> = {
  INSURER: 'Insurer',
  AGENT: 'Agent',
  BROKER: 'Broker',
  REINSURER: 'Reinsurer',
  TPA: 'TPA',
};

const OUTCOME_LABELS: Record<string, string> = {
  SUCCESS: 'Success',
  FAILED: 'Failed',
  FAILURE: 'Failed',
  PENDING: 'Pending',
  INFO: 'Info',
};

/**
 * Generic underscore/case humanizer.
 * sentence: USER_UPDATED → "User updated"
 * title: DEMO_INSURER → "Demo Insurer"
 */
export function humanizeLabel(value?: string | null, style: HumanizeStyle = 'sentence'): string {
  if (!value) return '—';
  const words = value
    .toString()
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/);
  if (style === 'title') {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  const joined = words.join(' ');
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

/** @deprecated Prefer humanizeLabel — kept for existing imports. */
export function humanize(value?: string | null): string {
  return humanizeLabel(value, 'sentence');
}

/** Audit log action, e.g. USER_UPDATED → "User updated". */
export function auditActionLabel(action?: string | null): string {
  return humanizeLabel(action, 'sentence');
}

/** Organization/partner type badge, e.g. INSURER → "Insurer". */
export function orgTypeLabel(type?: string | null): string {
  if (!type) return '—';
  return ORG_TYPE_LABELS[type] ?? humanizeLabel(type, 'title');
}

/** Partner/org code slug for display, e.g. DEMO_INSURER → "Demo Insurer". */
export function orgCodeLabel(code?: string | null): string {
  if (!code) return '—';
  return humanizeLabel(code, 'title');
}

/** Audit resource/entity type, e.g. PLATFORM_SETTINGS → "Platform settings". */
export function resourceTypeLabel(resource?: string | null): string {
  if (!resource) return '—';
  return humanizeLabel(resource, 'title');
}

/** Audit outcome badge tone. */
export function outcomeTone(outcome?: string | null): StatusTone {
  const normalized = outcome?.toUpperCase();
  if (normalized === 'FAILED' || normalized === 'FAILURE') return 'error';
  if (normalized === 'PENDING') return 'pending';
  if (normalized === 'INFO') return 'secondary';
  return 'active';
}

/** Audit outcome badge, e.g. SUCCESS → "Success". */
export function outcomeLabel(outcome?: string | null): string {
  if (!outcome) return 'Success';
  return OUTCOME_LABELS[outcome] ?? humanizeLabel(outcome, 'sentence');
}

export function userStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return USER_STATUS_LABELS[status] ?? humanizeLabel(status, 'sentence');
}

export function orgStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return ORG_STATUS_LABELS[status] ?? humanizeLabel(status, 'sentence');
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
  return humanizeLabel(role, 'title');
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

import type {
  Claim,
  Policy,
  PolicyCard,
  PublicVerification,
  User,
  UserRole,
} from '@/types';

/** Map Rodin backend role codes to frontend portal roles. */
export function mapBackendRole(role?: string | null): UserRole {
  if (!role) return 'CITIZEN';
  switch (role) {
    case 'PLATFORM_ADMIN':
      return 'PLATFORM_ADMIN';
    case 'AGENT':
      return 'AGENT';
    case 'CLAIMS_OFFICER':
    case 'CLAIMS_SUPERVISOR':
      return 'INSURER_CLAIMS_OFFICER';
    case 'PARTNER_ADMIN':
    case 'UNDERWRITER':
    case 'INSURER_PRODUCT_MANAGER':
    case 'FINANCE_OFFICER':
    case 'COMPLIANCE_AUDITOR':
    case 'CUSTOMER_SUPPORT':
      return 'INSURER_ADMIN';
    default:
      return 'CITIZEN';
  }
}

export function isInsurerPortalRole(role: UserRole): boolean {
  return role.startsWith('INSURER');
}

export interface BackendAuthPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  expiresInMinutes?: number;
  user?: BackendUserPayload;
}

export interface BackendUserPayload {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  roles?: string[];
  verified?: boolean;
  consentGiven?: boolean;
}

export function mapAuthUser(raw?: BackendUserPayload | null): User {
  if (!raw) {
    return {
      id: '',
      fullName: 'User',
      role: 'CITIZEN',
      verified: false,
      consentGiven: false,
    };
  }
  const backendRole = raw.role ?? raw.roles?.[0];
  const fullName =
    raw.fullName?.trim() ||
    [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() ||
    'Citizen';
  return {
    id: String(raw.id ?? ''),
    fullName,
    email: raw.email,
    phone: raw.phone,
    role: mapBackendRole(backendRole),
    verified: Boolean(raw.verified),
    consentGiven: Boolean(raw.consentGiven),
  };
}

export function mapAuthResponse(raw: BackendAuthPayload) {
  return {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
    expiresIn: raw.expiresIn ?? (raw.expiresInMinutes ?? 30) * 60,
    user: mapAuthUser(raw.user),
  };
}

export function mapPolicyStatus(status?: string): Policy['status'] {
  switch (status) {
    case 'ACTIVE':
      return 'ACTIVE';
    case 'PENDING_PAYMENT':
      return 'PENDING';
    case 'EXPIRED':
    case 'LAPSED':
      return 'EXPIRED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

export function mapPolicy(raw: Record<string, unknown>): Policy {
  const premium = Number(raw.premiumAmount ?? 0);
  const coverage = raw.coverageAmount != null ? Number(raw.coverageAmount) : premium;
  return {
    id: String(raw.id ?? ''),
    policyNumber: String(raw.policyNumber ?? ''),
    productName: String(raw.productName ?? 'Insurance Product'),
    insurerName: String(raw.insurerName ?? 'Partner Insurer'),
    status: mapPolicyStatus(String(raw.status ?? '')),
    coverageAmount: coverage,
    premiumAmount: premium,
    currency: String(raw.currency ?? 'RWF'),
    validFrom: String(raw.startDate ?? raw.validFrom ?? new Date().toISOString()),
    validTo: String(raw.endDate ?? raw.validTo ?? new Date().toISOString()),
    verificationToken: raw.qrVerificationToken
      ? String(raw.qrVerificationToken)
      : undefined,
  };
}

export function mapPolicyCard(raw: Record<string, unknown>): PolicyCard {
  const premium = Number(raw.premium ?? raw.premiumAmount ?? 0);
  const coverage = raw.coverageAmount != null ? Number(raw.coverageAmount) : premium;
  return {
    policyId: String(raw.policyId ?? raw.id ?? ''),
    policyNumber: String(raw.policyNumber ?? ''),
    holderName: String(raw.holderName ?? ''),
    productName: String(raw.productName ?? 'Insurance Product'),
    insurerName: String(raw.insurerName ?? 'Partner Insurer'),
    status: mapPolicyStatus(String(raw.status ?? '')),
    coverageAmount: coverage,
    currency: String(raw.currency ?? 'RWF'),
    validFrom: String(raw.startDate ?? raw.validFrom ?? ''),
    validTo: String(raw.endDate ?? raw.validTo ?? ''),
    qrPayload: String(raw.qrToken ?? raw.qrPayload ?? ''),
  };
}

export function mapPublicVerification(raw: Record<string, unknown>): PublicVerification {
  return {
    valid: Boolean(raw.valid),
    policyNumber: raw.policyNumber ? String(raw.policyNumber) : undefined,
    productName: raw.productName ? String(raw.productName) : undefined,
    insurerName: raw.insurerCode ? String(raw.insurerCode) : undefined,
    status: raw.status ? mapPolicyStatus(String(raw.status)) : undefined,
    validFrom: raw.startDate ? String(raw.startDate) : undefined,
    validTo: raw.endDate ? String(raw.endDate) : undefined,
  };
}

function mapStatusHistory(raw: unknown): Claim['statusHistory'] {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      status: String(row.status ?? ''),
      label: row.label ? String(row.label) : undefined,
      occurredAt: String(row.occurredAt ?? ''),
      note: row.note ? String(row.note) : undefined,
    };
  });
}

export function mapClaim(raw: Record<string, unknown>): Claim {
  const rawStatus = String(raw.status ?? 'SUBMITTED');
  const status =
    rawStatus === 'INFORMATION_REQUIRED' ? 'INFO_REQUESTED' : (rawStatus as Claim['status']);
  return {
    id: String(raw.id),
    claimNumber: String(raw.claimNumber ?? ''),
    policyId: String(raw.policyId ?? ''),
    policyNumber: String(raw.policyNumber ?? ''),
    claimantName: String(raw.claimantName ?? 'Citizen'),
    status: status ?? 'SUBMITTED',
    amount: Number(raw.claimedAmount ?? raw.amount ?? 0),
    currency: String(raw.currency ?? 'RWF'),
    description: String(raw.description ?? ''),
    submittedAt: String(raw.createdAt ?? raw.submittedAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()),
    statusHistory: mapStatusHistory(raw.statusHistory),
  };
}

export function mapPolicyActivity(raw: Record<string, unknown>) {
  return {
    type: String(raw.type ?? ''),
    label: String(raw.label ?? ''),
    occurredAt: String(raw.occurredAt ?? ''),
    policyId: raw.policyId ? String(raw.policyId) : undefined,
    claimId: raw.claimId ? String(raw.claimId) : undefined,
  };
}

export function unwrapPage<T>(data: T[] | { content?: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.content ?? [];
}

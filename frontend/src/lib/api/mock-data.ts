import type {
  AuthTokens,
  Claim,
  ClaimDecisionRequest,
  ConsentRequest,
  InsurerStats,
  LoginRequest,
  OtpVerifyRequest,
  PaginatedResponse,
  Policy,
  PolicyCard,
  PublicVerification,
  RegisterRequest,
  User,
} from '@/types';

const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol-001',
    policyNumber: 'ING-2026-0001',
    productName: 'Health Shield Basic',
    insurerName: 'Demo Insurer Rwanda',
    status: 'ACTIVE',
    coverageAmount: 500000,
    premiumAmount: 2500,
    currency: 'RWF',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    verificationToken: 'verify-demo-token-001',
  },
  {
    id: 'pol-002',
    policyNumber: 'ING-2026-0002',
    productName: 'Crop Protection Plus',
    insurerName: 'Demo Insurer Rwanda',
    status: 'PENDING',
    coverageAmount: 200000,
    premiumAmount: 1500,
    currency: 'RWF',
    validFrom: '2026-03-01',
    validTo: '2027-02-28',
    verificationToken: 'verify-demo-token-002',
  },
];

const MOCK_CLAIMS: Claim[] = [
  {
    id: 'clm-001',
    claimNumber: 'CLM-2026-0042',
    policyId: 'pol-001',
    policyNumber: 'ING-2026-0001',
    claimantName: 'Aline Uwase',
    status: 'UNDER_REVIEW',
    amount: 75000,
    currency: 'RWF',
    description: 'Outpatient medical visit and prescribed medication.',
    submittedAt: '2026-06-10T08:30:00Z',
    updatedAt: '2026-06-12T14:00:00Z',
  },
  {
    id: 'clm-002',
    claimNumber: 'CLM-2026-0038',
    policyId: 'pol-002',
    policyNumber: 'ING-2026-0002',
    claimantName: 'Jean Pierre',
    status: 'SUBMITTED',
    amount: 120000,
    currency: 'RWF',
    description: 'Crop damage due to heavy rainfall in Eastern Province.',
    submittedAt: '2026-06-15T11:15:00Z',
    updatedAt: '2026-06-15T11:15:00Z',
  },
];

const MOCK_USER: User = {
  id: 'usr-001',
  fullName: 'Aline Uwase',
  phone: '0780000001',
  role: 'CITIZEN',
  verified: true,
  consentGiven: true,
};

export const mockData = {
  policies: MOCK_POLICIES,
  claims: MOCK_CLAIMS,
  user: MOCK_USER,
  insurerStats: {
    openClaims: 12,
    resolvedToday: 4,
    avgResolutionDays: 3.2,
    claimsByStatus: [
      { status: 'SUBMITTED', count: 5 },
      { status: 'UNDER_REVIEW', count: 7 },
      { status: 'APPROVED', count: 18 },
      { status: 'REJECTED', count: 2 },
    ],
  } satisfies InsurerStats,
  getPolicyCard(policyId: string): PolicyCard | null {
    const policy = MOCK_POLICIES.find((p) => p.id === policyId);
    if (!policy) return null;
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      holderName: MOCK_USER.fullName,
      productName: policy.productName,
      insurerName: policy.insurerName,
      status: policy.status,
      coverageAmount: policy.coverageAmount,
      currency: policy.currency,
      validFrom: policy.validFrom,
      validTo: policy.validTo,
      qrPayload: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/verify/${policy.verificationToken}`,
    };
  },
  getPublicVerification(token: string): PublicVerification {
    const policy = MOCK_POLICIES.find((p) => p.verificationToken === token);
    if (!policy || policy.status === 'EXPIRED') {
      return { valid: false };
    }
    return {
      valid: true,
      policyNumber: policy.policyNumber,
      productName: policy.productName,
      insurerName: policy.insurerName,
      status: policy.status,
      validFrom: policy.validFrom,
      validTo: policy.validTo,
    };
  },
};

export function paginate<T>(items: T[], page = 0, size = 20): PaginatedResponse<T> {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    page,
    size,
  };
}

export type {
  LoginRequest,
  RegisterRequest,
  OtpVerifyRequest,
  ConsentRequest,
  AuthTokens,
  User,
  Policy,
  PolicyCard,
  Claim,
  ClaimDecisionRequest,
  PublicVerification,
  InsurerStats,
};

export type UserRole =
  | 'CITIZEN'
  | 'INSURER_ADMIN'
  | 'INSURER_CLAIMS_OFFICER'
  | 'AGENT'
  | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  role: UserRole;
  verified: boolean;
  consentGiven: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  phone?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email?: string;
  nationalId: string;
  password: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface ConsentRequest {
  dataProcessing: boolean;
  marketing?: boolean;
  termsAccepted: boolean;
}

export interface Policy {
  id: string;
  policyNumber: string;
  productName: string;
  insurerName: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  coverageAmount: number;
  premiumAmount: number;
  currency: string;
  validFrom: string;
  validTo: string;
  verificationToken?: string;
}

export interface PolicyCard {
  policyId: string;
  policyNumber: string;
  holderName: string;
  productName: string;
  insurerName: string;
  status: Policy['status'];
  coverageAmount: number;
  currency: string;
  validFrom: string;
  validTo: string;
  qrPayload: string;
}

export interface PublicVerification {
  valid: boolean;
  policyNumber?: string;
  productName?: string;
  insurerName?: string;
  status?: Policy['status'];
  validFrom?: string;
  validTo?: string;
}

export interface ClaimStatusHistoryItem {
  status: string;
  label?: string;
  occurredAt: string;
  note?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  claimantName: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
  amount: number;
  currency: string;
  description: string;
  submittedAt: string;
  updatedAt: string;
  statusHistory?: ClaimStatusHistoryItem[];
}

export interface PolicyActivity {
  type: string;
  label: string;
  occurredAt: string;
  policyId?: string;
  claimId?: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  startingPremium: number;
  currency: string;
  matchScore: number;
  reason?: string;
}

export interface NeedsAssessmentResult {
  score: number;
  guidance: string;
  recommendedCategories?: string[];
  recommendedProducts?: RecommendedProduct[];
}

export interface PolicyReportSummary {
  activePolicies: number;
  citizensEnrolled: number;
}

export interface ClaimDecisionRequest {
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
  notes?: string;
}

export interface InsurerStats {
  openClaims: number;
  activePolicies?: number;
  resolvedToday: number;
  avgResolutionDays: number;
  claimsByStatus: { status: string; count: number }[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/** Rwandan address (Province → District → Sector → Cell → Village, country fixed to Rwanda). */
export interface RwandaAddress {
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  country?: string;
}

/** A platform user as managed by the admin console (maps to backend ManagedUserResponse). */
export interface ManagedUser {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  /** Raw backend role code (e.g. PLATFORM_ADMIN) — kept for admin editing. */
  roleCode?: string;
  status: string;
  verified: boolean;
  organizationId?: string;
  organizationName?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload for creating a managed user via the admin console. */
export interface ManagedUserCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleCode: string;
  organizationId?: string;
  defaultPassword?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

/** Payload for updating a managed user's profile via the admin console. */
export interface ManagedUserUpdateInput {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

/** Payload for onboarding a new partner organization. */
export interface PartnerCreateInput {
  name: string;
  code: string;
  type: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine?: string;
  district?: string;
  website?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone?: string;
  adminDefaultPassword?: string;
}

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

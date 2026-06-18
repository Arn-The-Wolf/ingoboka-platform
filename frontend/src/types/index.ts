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
}

export interface ClaimDecisionRequest {
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
  notes?: string;
}

export interface InsurerStats {
  openClaims: number;
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

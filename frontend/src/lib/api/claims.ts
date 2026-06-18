import { apiClient, isNetworkError } from './client';
import { mockData, paginate } from './mock-data';
import type { Claim, ClaimDecisionRequest, InsurerStats, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/auth-store';

function isInsurerRole() {
  const role = useAuthStore.getState().user?.role;
  return role?.startsWith('INSURER');
}

export const claimApi = {
  async list(page = 0, size = 20): Promise<PaginatedResponse<Claim>> {
    try {
      const endpoint = isInsurerRole() ? '/admin/claims' : '/claims';
      const { data } = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(endpoint, {
        params: { page, size },
      });
      return {
        ...data,
        content: data.content.map((raw) => mapClaim(raw)),
      };
    } catch (error) {
      if (isNetworkError(error)) {
        return paginate(mockData.claims, page, size);
      }
      throw error;
    }
  },
  async create(payload: {
    policyId: string;
    claimType: string;
    description: string;
    incidentDate: string;
    claimedAmount: number;
  }) {
    const { data } = await apiClient.post('/claims', payload);
    return data;
  },

  async submit(id: string) {
    const { data } = await apiClient.post(`/claims/${id}/submit`);
    return data;
  },

  async getById(id: string): Promise<Claim> {
    try {
      const endpoint = isInsurerRole() ? `/admin/claims/${id}` : `/claims/${id}`;
      const { data } = await apiClient.get<Record<string, unknown>>(endpoint);
      return mapClaim(data);
    } catch (error) {
      if (isNetworkError(error)) {
        const claim = mockData.claims.find((c) => c.id === id);
        if (!claim) throw new Error('Claim not found');
        return claim;
      }
      throw error;
    }
  },

  async decide(id: string, payload: ClaimDecisionRequest): Promise<Claim> {
    const decision =
      payload.decision === 'APPROVE'
        ? 'APPROVED'
        : payload.decision === 'REJECT'
          ? 'REJECTED'
          : payload.decision;
    const { data } = await apiClient.post(`/admin/claims/${id}/decision`, {
      decision,
      reason: payload.notes ?? decision,
    });
    return data as Claim;
  },

  async getInsurerStats(): Promise<InsurerStats> {
    const { data } = await apiClient.get<{
      pendingClaims: number;
      approvedClaims: number;
      rejectedClaims: number;
      activePolicies: number;
    }>('/admin/reports/overview');
    return {
      openClaims: data.pendingClaims ?? 0,
      resolvedToday: data.approvedClaims ?? 0,
      avgResolutionDays: 3,
      claimsByStatus: [
        { status: 'Pending', count: data.pendingClaims ?? 0 },
        { status: 'Approved', count: data.approvedClaims ?? 0 },
        { status: 'Rejected', count: data.rejectedClaims ?? 0 },
      ],
    };
  },
};

function mapClaim(raw: Record<string, unknown>): Claim {
  return {
    id: String(raw.id),
    claimNumber: String(raw.claimNumber ?? ''),
    policyId: String(raw.policyId ?? ''),
    policyNumber: String(raw.policyNumber ?? ''),
    claimantName: String(raw.claimantName ?? 'Citizen'),
    status: (raw.status as Claim['status']) ?? 'SUBMITTED',
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? 'RWF'),
    description: String(raw.description ?? ''),
    submittedAt: String(raw.submittedAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.submittedAt ?? new Date().toISOString()),
  };
}

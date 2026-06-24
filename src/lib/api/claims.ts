import { apiClient, isNetworkError } from './client';
import { isInsurerPortalRole, mapClaim, unwrapPage } from './mappers';
import { mockData, paginate } from './mock-data';
import type { Claim, ClaimDecisionRequest, InsurerStats, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/auth-store';

function isInsurerRole() {
  const role = useAuthStore.getState().user?.role;
  return role ? isInsurerPortalRole(role) : false;
}

export const claimApi = {
  async list(page = 0, size = 20): Promise<PaginatedResponse<Claim>> {
    try {
      const endpoint = isInsurerRole() ? '/admin/claims' : '/claims/me';
      const { data } = await apiClient.get<PaginatedResponse<Record<string, unknown>>>(endpoint, {
        params: { page, size },
      });
      const content = unwrapPage(data).map((raw) => mapClaim(raw as Record<string, unknown>));
      return {
        content,
        totalElements: data.totalElements ?? content.length,
        totalPages: data.totalPages ?? 1,
        page: data.page ?? page,
        size: data.size ?? size,
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
    const { data } = await apiClient.post<Record<string, unknown>>(`/admin/claims/${id}/decision`, {
      decision,
      reason: payload.notes ?? decision,
    });
    return mapClaim(data);
  },

  async getInsurerStats(): Promise<InsurerStats> {
    const [{ data: overview }, { data: breakdown }] = await Promise.all([
      apiClient.get<Record<string, number>>('/admin/reports/overview'),
      apiClient.get<Record<string, unknown>>('/admin/reports/claims-breakdown'),
    ]);
    const claimsByStatus = Array.isArray(breakdown.claimsByStatus)
      ? breakdown.claimsByStatus.map((row) => {
          const item = row as Record<string, unknown>;
          return {
            status: String(item.status ?? ''),
            count: Number(item.count ?? 0),
          };
        })
      : [];
    return {
      openClaims: overview.openClaims ?? overview.pendingClaims ?? 0,
      resolvedToday: Number(breakdown.resolvedToday ?? 0),
      avgResolutionDays: Number(breakdown.avgResolutionDays ?? 0),
      claimsByStatus,
    };
  },
};

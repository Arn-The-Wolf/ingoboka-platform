import { apiClient } from './client';
import { uploadClaimEvidence } from './documents';
import { isInsurerPortalRole, mapClaim, unwrapPage } from './mappers';
import type { Claim, ClaimDecisionRequest, InsurerStats, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/auth-store';

function isInsurerRole() {
  const role = useAuthStore.getState().user?.role;
  return role ? isInsurerPortalRole(role) : false;
}

export const claimApi = {
  async list(page = 0, size = 20): Promise<PaginatedResponse<Claim>> {
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
    const endpoint = isInsurerRole() ? `/admin/claims/${id}` : `/claims/${id}`;
    const { data } = await apiClient.get<Record<string, unknown>>(endpoint);
    return mapClaim(data);
  },

  async decide(id: string, payload: ClaimDecisionRequest): Promise<Claim> {
    if (payload.decision === 'REQUEST_INFO') {
      const { data } = await apiClient.patch<Record<string, unknown>>(`/claims/${id}/status`, {
        status: 'INFORMATION_REQUIRED',
        reason: payload.notes ?? 'Additional information requested',
      });
      return mapClaim(data);
    }

    const decision = payload.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const { data } = await apiClient.post<Record<string, unknown>>(`/admin/claims/${id}/decision`, {
      decision,
      reason: payload.notes ?? decision,
    });
    return mapClaim(data);
  },

  async appeal(id: string, reason: string) {
    const { data } = await apiClient.post(`/claims/${id}/appeals`, { reason });
    return data;
  },

  async uploadDocuments(id: string, files: File[]) {
    await uploadClaimEvidence(id, files);
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
      activePolicies: overview.activePolicies ?? 0,
      resolvedToday: Number(breakdown.resolvedToday ?? 0),
      avgResolutionDays: Number(breakdown.avgResolutionDays ?? 0),
      claimsByStatus,
    };
  },
};

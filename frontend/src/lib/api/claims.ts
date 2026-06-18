import { apiClient, isNetworkError } from './client';
import { mockData, paginate } from './mock-data';
import type {
  Claim,
  ClaimDecisionRequest,
  InsurerStats,
  PaginatedResponse,
} from '@/types';

export const claimApi = {
  async list(page = 0, size = 20): Promise<PaginatedResponse<Claim>> {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Claim>>('/claims', {
        params: { page, size },
      });
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return paginate(mockData.claims, page, size);
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Claim> {
    try {
      const { data } = await apiClient.get<Claim>(`/claims/${id}`);
      return data;
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
    try {
      const { data } = await apiClient.patch<Claim>(
        `/claims/${id}/decision`,
        payload
      );
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        const claim = mockData.claims.find((c) => c.id === id);
        if (!claim) throw new Error('Claim not found');
        const statusMap = {
          APPROVE: 'APPROVED' as const,
          REJECT: 'REJECTED' as const,
          REQUEST_INFO: 'INFO_REQUESTED' as const,
        };
        return {
          ...claim,
          status: statusMap[payload.decision],
          updatedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  async getInsurerStats(): Promise<InsurerStats> {
    try {
      const { data } = await apiClient.get<InsurerStats>('/insurer/stats');
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return mockData.insurerStats;
      }
      throw error;
    }
  },
};

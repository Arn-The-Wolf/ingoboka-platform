import { apiClient, isNetworkError } from './client';
import { mockData, paginate } from './mock-data';
import type { PaginatedResponse, Policy, PolicyCard, PublicVerification } from '@/types';

export const policyApi = {
  async list(page = 0, size = 20): Promise<PaginatedResponse<Policy>> {
    try {
      const { data } = await apiClient.get<PaginatedResponse<Policy>>('/policies', {
        params: { page, size },
      });
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return paginate(mockData.policies, page, size);
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Policy> {
    try {
      const { data } = await apiClient.get<Policy>(`/policies/${id}`);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        const policy = mockData.policies.find((p) => p.id === id);
        if (!policy) throw new Error('Policy not found');
        return policy;
      }
      throw error;
    }
  },

  async getCard(id: string): Promise<PolicyCard> {
    try {
      const { data } = await apiClient.get<PolicyCard>(`/policies/${id}/card`);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        const card = mockData.getPolicyCard(id);
        if (!card) throw new Error('Policy card not found');
        return card;
      }
      throw error;
    }
  },

  async verifyPublic(token: string): Promise<PublicVerification> {
    try {
      const { data } = await apiClient.get<PublicVerification>(
        `/verify/${token}`
      );
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return mockData.getPublicVerification(token);
      }
      throw error;
    }
  },
};

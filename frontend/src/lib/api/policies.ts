import { apiClient, isNetworkError } from './client';
import { mockData } from './mock-data';
import type { Policy, PolicyCard, PublicVerification } from '@/types';

export const policyApi = {
  async list() {
    try {
      const { data } = await apiClient.get<Policy[]>('/policies');
      return { content: data ?? [], totalElements: data?.length ?? 0 };
    } catch (error) {
      if (isNetworkError(error)) {
        return { content: mockData.policies, totalElements: mockData.policies.length };
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
      const { data } = await apiClient.get<PublicVerification>(`/verify/${token}`);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return mockData.getPublicVerification(token);
      }
      throw error;
    }
  },
};

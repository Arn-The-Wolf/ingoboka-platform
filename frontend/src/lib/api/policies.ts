import { apiClient, isNetworkError } from './client';
import { mapPolicy, mapPolicyActivity, mapPolicyCard, mapPublicVerification, unwrapPage } from './mappers';
import { mockData } from './mock-data';
import type { Policy, PolicyActivity, PolicyCard, PublicVerification } from '@/types';

export const policyApi = {
  async list() {
    try {
      const { data } = await apiClient.get<{ content?: Record<string, unknown>[] } | Record<string, unknown>[]>('/policies');
      const items = unwrapPage(data).map((raw) => mapPolicy(raw as Record<string, unknown>));
      return { content: items, totalElements: items.length };
    } catch (error) {
      if (isNetworkError(error)) {
        return { content: mockData.policies, totalElements: mockData.policies.length };
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Policy> {
    try {
      const { data } = await apiClient.get<Record<string, unknown>>(`/policies/${id}`);
      return mapPolicy(data);
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
      const { data } = await apiClient.get<Record<string, unknown>>(`/policies/${id}/card`);
      return mapPolicyCard(data);
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
      const { data } = await apiClient.get<Record<string, unknown>>(`/verify/${token}`);
      return mapPublicVerification(data);
    } catch (error) {
      if (isNetworkError(error)) {
        return mockData.getPublicVerification(token);
      }
      throw error;
    }
  },

  async listActivity(page = 0, size = 20): Promise<{ content: PolicyActivity[]; totalElements: number }> {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[]; totalElements?: number }>(
      '/policies/me/activity',
      { params: { page, size } }
    );
    const content = unwrapPage(data).map((raw) => mapPolicyActivity(raw as Record<string, unknown>));
    return { content, totalElements: data.totalElements ?? content.length };
  },
};

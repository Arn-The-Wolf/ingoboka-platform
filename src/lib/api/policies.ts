import { apiClient } from './client';
import { mapPolicy, mapPolicyActivity, mapPolicyCard, mapPublicVerification, unwrapPage } from './mappers';
import type { Policy, PolicyActivity, PolicyCard, PublicVerification } from '@/types';

export const policyApi = {
  async list() {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] } | Record<string, unknown>[]>('/policies');
    const items = unwrapPage(data).map((raw) => mapPolicy(raw as Record<string, unknown>));
    return { content: items, totalElements: items.length };
  },

  async getById(id: string): Promise<Policy> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/policies/${id}`);
    return mapPolicy(data);
  },

  async getCard(id: string): Promise<PolicyCard> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/policies/${id}/card`);
    return mapPolicyCard(data);
  },

  async verifyPublic(token: string): Promise<PublicVerification> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/verify/${token}`);
    return mapPublicVerification(data);
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

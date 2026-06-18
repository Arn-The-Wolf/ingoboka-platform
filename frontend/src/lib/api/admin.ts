import { apiClient } from './client';
import type { ApplicationResponse } from './products';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  status: string;
  contactEmail?: string;
}

export interface PlatformOverview {
  organizations: number;
  activeUsers: number;
  activePolicies: number;
  openClaims: number;
  totalApplications: number;
}

export const adminApi = {
  async getOverview(): Promise<PlatformOverview> {
    const { data } = await apiClient.get<PlatformOverview>('/admin/platform/overview');
    return data;
  },

  async listOrganizations(): Promise<Organization[]> {
    const { data } = await apiClient.get<Organization[]>('/admin/platform/organizations');
    return data;
  },
};

export const agentApi = {
  async listApplications(page = 0, size = 20) {
    const { data } = await apiClient.get<{
      content: ApplicationResponse[];
      totalElements: number;
    }>('/agent/applications', { params: { page, size } });
    return data;
  },

  async createAssistedApplication(citizenPhone: string, productPlanId: string) {
    const { data } = await apiClient.post<ApplicationResponse>('/agent/applications', {
      citizenPhone,
      productPlanId,
    });
    return data;
  },
};

export const customerApiExt = {
  async listDependants() {
    const { data } = await apiClient.get('/customer/dependants');
    return data;
  },

  async addDependant(payload: {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth?: string;
  }) {
    const { data } = await apiClient.post('/customer/dependants', payload);
    return data;
  },
};

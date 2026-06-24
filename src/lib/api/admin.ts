import { apiClient } from './client';
import { unwrapPage } from './mappers';
import type { ApplicationResponse } from './products';
import type { PolicyReportSummary } from '@/types';

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
    const { data } = await apiClient.get<Record<string, number>>('/admin/platform/overview');
    return {
      organizations: data.organizations ?? 0,
      activeUsers: data.activeUsers ?? 0,
      activePolicies: data.activePolicies ?? 0,
      openClaims: data.openClaims ?? 0,
      totalApplications: data.totalApplications ?? 0,
    };
  },

  async listOrganizations(): Promise<Organization[]> {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>('/partners', {
      params: { page: 0, size: 50 },
    });
    return unwrapPage(data).map((p) => ({
      id: String(p.id ?? ''),
      name: String(p.name ?? 'Partner'),
      slug: String(p.code ?? ''),
      organizationType: String(p.type ?? p.organizationType ?? 'INSURER'),
      status: String(p.status ?? 'ACTIVE'),
      contactEmail: p.contactEmail ? String(p.contactEmail) : undefined,
    }));
  },
};

export const agentApi = {
  async listApplications(page = 0, size = 20) {
    const { data } = await apiClient.get<{
      content: Record<string, unknown>[];
      totalElements: number;
    }>('/agent/applications', { params: { page, size } });
    return {
      content: data.content.map(
        (raw): ApplicationResponse => ({
          id: String(raw.id ?? ''),
          applicationNumber: String(raw.applicationReference ?? raw.applicationNumber ?? ''),
          status: String(raw.status ?? ''),
          premiumAmount: Number(raw.premiumAmount ?? 0),
          currency: 'RWF',
        })
      ),
      totalElements: data.totalElements,
    };
  },

  async createAssistedApplication(citizenPhone: string, productPlanId: string) {
    const { data } = await apiClient.post<Record<string, unknown>>('/agent/applications', {
      citizenPhone,
      productPlanId,
    });
    return {
      id: String(data.id ?? ''),
      applicationNumber: String(data.applicationReference ?? ''),
      status: String(data.status ?? ''),
      premiumAmount: Number(data.premiumAmount ?? 0),
      currency: 'RWF',
    } satisfies ApplicationResponse;
  },
};

export const customerApiExt = {
  async listDependants() {
    const { data } = await apiClient.get<{ content?: unknown[] }>('/customer/dependants');
    return unwrapPage(data);
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

  async removeDependant(id: string) {
    await apiClient.delete(`/customer/dependants/${id}`);
  },

  async submitKyc() {
    const { data } = await apiClient.post('/customer/kyc/submit');
    return data;
  },
};

export const insurerApi = {
  async getSettings() {
    const { data } = await apiClient.get<Record<string, unknown>>('/insurer/settings');
    return data;
  },

  async updateSettings(payload: Record<string, unknown>) {
    const settingsJson = JSON.stringify(payload);
    const { data } = await apiClient.put('/insurer/settings', { settingsJson });
    return data;
  },

  async getPolicyReport(): Promise<PolicyReportSummary> {
    const [{ data: overview }, { data: policies }] = await Promise.all([
      apiClient.get<Record<string, number>>('/admin/reports/overview'),
      apiClient.get<{ totalElements?: number }>('/reports/policies', { params: { page: 0, size: 1 } }),
    ]);
    return {
      activePolicies: overview.activePolicies ?? 0,
      citizensEnrolled: policies.totalElements ?? overview.activePolicies ?? 0,
    };
  },

  async listPartnerInvoices() {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>('/revenue/invoices', {
      params: { page: 0, size: 20 },
    });
    return unwrapPage(data).map((inv) => ({
      invoiceNumber: String(inv.invoiceNumber ?? ''),
      totalAmount: Number(inv.amount ?? 0),
      status: String(inv.status ?? ''),
    }));
  },

  async listPartnerContracts() {
    const { data: partner } = await apiClient.get<Record<string, unknown>>('/partners/me');
    const partnerId = String(partner.id ?? partner.organizationId ?? '');
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>(
      `/partners/${partnerId}/contracts`,
      { params: { page: 0, size: 20 } }
    );
    return unwrapPage(data).map((c) => ({
      contractNumber: String(c.contractReference ?? c.contractNumber ?? ''),
      status: String(c.status ?? ''),
    }));
  },

  async listPartnerLedger() {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>('/revenue/ledger', {
      params: { page: 0, size: 20 },
    });
    return unwrapPage(data);
  },
};

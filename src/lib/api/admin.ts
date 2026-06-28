import { apiClient } from './client';
import { mapAuthUser, unwrapPage } from './mappers';
import type { ApplicationResponse } from './products';
import type { PolicyReportSummary, UserRole } from '@/types';

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

export interface AdminUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: string;
  verified: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  resource: string;
  occurredAt: string;
  details?: string;
}

export interface PlatformSettings {
  platformName: string;
  defaultLocale: string;
  maintenanceMode: boolean;
  apiBaseUrl: string;
  supportEmail: string;
}

function mapApplication(raw: Record<string, unknown>): ApplicationResponse {
  return {
    id: String(raw.id ?? ''),
    applicationNumber: String(raw.applicationReference ?? raw.applicationNumber ?? ''),
    status: String(raw.status ?? ''),
    premiumAmount: Number(raw.premiumAmount ?? 0),
    currency: String(raw.currency ?? 'RWF'),
  };
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

  async listUsers(page = 0, size = 50): Promise<{ content: AdminUser[]; totalElements: number }> {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
    }>('/admin/users', { params: { page, size } });
    const content = unwrapPage(data).map((raw) => {
      const user = mapAuthUser(raw);
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: String(raw.status ?? (user.verified ? 'ACTIVE' : 'PENDING')),
        verified: user.verified,
      };
    });
    return { content, totalElements: data.totalElements ?? content.length };
  },

  async listAuditLog(page = 0, size = 50): Promise<{ content: AuditLogEntry[]; totalElements: number }> {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
    }>('/admin/audit-logs', { params: { page, size } });
    const content = unwrapPage(data).map((raw) => ({
      id: String(raw.id ?? ''),
      action: String(raw.action ?? raw.eventType ?? 'ACTION'),
      actor: String(raw.actorName ?? raw.actor ?? raw.userEmail ?? 'System'),
      resource: String(raw.resourceType ?? raw.resource ?? raw.entityType ?? '—'),
      occurredAt: String(raw.occurredAt ?? raw.createdAt ?? new Date().toISOString()),
      details: raw.details ? String(raw.details) : raw.description ? String(raw.description) : undefined,
    }));
    return { content, totalElements: data.totalElements ?? content.length };
  },

  async getPlatformSettings(): Promise<PlatformSettings> {
    const { data } = await apiClient.get<Record<string, unknown>>('/admin/platform/settings');
    return {
      platformName: String(data.platformName ?? 'Ingoboka'),
      defaultLocale: String(data.defaultLocale ?? 'rw'),
      maintenanceMode: Boolean(data.maintenanceMode),
      apiBaseUrl: String(data.apiBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''),
      supportEmail: String(data.supportEmail ?? 'support@ingoboka.rw'),
    };
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

  async listApplications(page = 0, size = 20, status = 'PENDING') {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
    }>('/insurer/applications', { params: { page, size, status } });
    const content = unwrapPage(data).map(mapApplication);
    return { content, totalElements: data.totalElements ?? content.length };
  },

  async reviewApplication(id: string, decision: 'APPROVE' | 'REJECT', reason?: string) {
    const { data } = await apiClient.post<Record<string, unknown>>(`/insurer/applications/${id}/decision`, {
      decision: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      reason,
    });
    return mapApplication(data);
  },
};

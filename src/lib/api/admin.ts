import { apiClient } from './client';
import { getApiBaseUrl } from './config';
import { mapAuthUser, mapBackendRole, unwrapPage } from './mappers';
import { getWithFallback, mapApplicationStatusFilter, PENDING_APPLICATION_STATUSES } from './integration-helpers';
import type { ApplicationResponse } from './products';
import type {
  ManagedUser,
  ManagedUserCreateInput,
  ManagedUserUpdateInput,
  PagedResult,
  PartnerCreateInput,
  PolicyReportSummary,
  UserRole,
} from '@/types';

/** Map a backend ManagedUserResponse into the frontend ManagedUser shape. */
export function mapManagedUser(raw: Record<string, unknown>): ManagedUser {
  const roles = Array.isArray(raw.roles) ? (raw.roles as string[]) : [];
  const roleCode = roles[0] ?? (raw.roleCode ? String(raw.roleCode) : undefined);
  const firstName = raw.firstName ? String(raw.firstName) : undefined;
  const lastName = raw.lastName ? String(raw.lastName) : undefined;
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || String(raw.email ?? 'User');
  return {
    id: String(raw.id ?? ''),
    fullName,
    firstName,
    lastName,
    email: raw.email ? String(raw.email) : undefined,
    phone: raw.phoneNumber ? String(raw.phoneNumber) : raw.phone ? String(raw.phone) : undefined,
    role: mapBackendRole(roleCode),
    roleCode,
    status: String(raw.status ?? 'PENDING_EMAIL_VERIFICATION'),
    verified: Boolean(raw.emailVerified ?? raw.verified ?? false),
    organizationId: raw.organizationId ? String(raw.organizationId) : undefined,
    organizationName: raw.organizationName ? String(raw.organizationName) : undefined,
    province: raw.province ? String(raw.province) : undefined,
    district: raw.district ? String(raw.district) : undefined,
    sector: raw.sector ? String(raw.sector) : undefined,
    cell: raw.cell ? String(raw.cell) : undefined,
    village: raw.village ? String(raw.village) : undefined,
    country: raw.country ? String(raw.country) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

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

  /** Managed users with backend pagination + optional server-side status/org filters. */
  async listManagedUsers(
    page = 0,
    size = 20,
    filters: { status?: string; organizationId?: string } = {}
  ): Promise<PagedResult<ManagedUser>> {
    const params: Record<string, string | number> = { page, size };
    if (filters.status) params.status = filters.status;
    if (filters.organizationId) params.organizationId = filters.organizationId;
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
      number?: number;
      size?: number;
    }>('/admin/users', { params });
    const content = unwrapPage(data).map(mapManagedUser);
    return {
      content,
      totalElements: data.totalElements ?? content.length,
      totalPages: data.totalPages ?? 1,
      page: data.number ?? page,
      size: data.size ?? size,
    };
  },

  async getManagedUser(id: string): Promise<ManagedUser> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/admin/users/${id}`);
    return mapManagedUser(data);
  },

  async createManagedUser(input: ManagedUserCreateInput): Promise<ManagedUser> {
    const { data } = await apiClient.post<Record<string, unknown>>('/admin/users', input);
    return mapManagedUser(data);
  },

  async updateManagedUser(id: string, input: ManagedUserUpdateInput): Promise<ManagedUser> {
    const { data } = await apiClient.put<Record<string, unknown>>(`/admin/users/${id}`, input);
    return mapManagedUser(data);
  },

  async updateManagedUserRoles(id: string, roleCode: string): Promise<ManagedUser> {
    const { data } = await apiClient.patch<Record<string, unknown>>(`/admin/users/${id}/roles`, {
      roleCode,
    });
    return mapManagedUser(data);
  },

  /** Update a user's status. Deactivation = status DISABLED (soft-disable, never hard delete). */
  async updateManagedUserStatus(id: string, status: string): Promise<ManagedUser> {
    const { data } = await apiClient.patch<Record<string, unknown>>(`/admin/users/${id}/status`, {
      status,
    });
    return mapManagedUser(data);
  },

  /** Onboard a new partner organization. */
  async createPartner(input: PartnerCreateInput): Promise<Organization> {
    const { data } = await apiClient.post<Record<string, unknown>>('/partners', {
      country: 'Rwanda',
      ...input,
    });
    return {
      id: String(data.id ?? data.organizationId ?? ''),
      name: String(data.name ?? input.name),
      slug: String(data.code ?? input.code ?? ''),
      organizationType: String(data.type ?? input.type ?? 'INSURER'),
      status: String(data.status ?? 'ACTIVE'),
      contactEmail: data.contactEmail ? String(data.contactEmail) : input.contactEmail,
    };
  },

  /** Partners with backend pagination. */
  async listPartnersPaged(page = 0, size = 20): Promise<PagedResult<Organization>> {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
      number?: number;
      size?: number;
    }>('/partners', { params: { page, size } });
    const content = unwrapPage(data).map((p) => ({
      id: String(p.id ?? ''),
      name: String(p.name ?? 'Partner'),
      slug: String(p.code ?? ''),
      organizationType: String(p.type ?? p.organizationType ?? 'INSURER'),
      status: String(p.status ?? 'ACTIVE'),
      contactEmail: p.contactEmail ? String(p.contactEmail) : undefined,
    }));
    return {
      content,
      totalElements: data.totalElements ?? content.length,
      totalPages: data.totalPages ?? 1,
      page: data.number ?? page,
      size: data.size ?? size,
    };
  },

  async listAuditLog(page = 0, size = 50): Promise<{ content: AuditLogEntry[]; totalElements: number }> {
    const data = await getWithFallback<{
      content?: Record<string, unknown>[];
      totalElements?: number;
    }>('/audit/logs', '/admin/audit-logs', { page, size });
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
    const fallback: PlatformSettings = {
      platformName: 'Ingoboka',
      defaultLocale: 'rw',
      maintenanceMode: false,
      apiBaseUrl: getApiBaseUrl(),
      supportEmail: 'support@ingoboka.rw',
    };
    try {
      const { data } = await apiClient.get<Record<string, unknown>>('/admin/platform/settings');
      return {
        platformName: String(data.platformName ?? fallback.platformName),
        defaultLocale: String(data.defaultLocale ?? fallback.defaultLocale),
        maintenanceMode: Boolean(data.maintenanceMode),
        apiBaseUrl: String(data.apiBaseUrl ?? fallback.apiBaseUrl),
        supportEmail: String(data.supportEmail ?? fallback.supportEmail),
      };
    } catch {
      return fallback;
    }
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

  async updateDependant(id: string, payload: {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth?: string;
  }) {
    const { data } = await apiClient.put(`/customer/dependants/${id}`, payload);
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
    if (typeof data.settingsJson === 'string' && data.settingsJson.trim()) {
      try {
        const parsed = JSON.parse(data.settingsJson) as Record<string, unknown>;
        return { ...data, ...parsed };
      } catch {
        return data;
      }
    }
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
    const backendStatus = mapApplicationStatusFilter(status);
    const params: Record<string, string | number> = { page, size };
    if (backendStatus) params.status = backendStatus;

    const fetchPage = async (path: string) => {
      const { data } = await apiClient.get<{
        content?: Record<string, unknown>[];
        totalElements?: number;
      }>(path, { params });
      return data;
    };

    let data: { content?: Record<string, unknown>[]; totalElements?: number };
    try {
      data = await fetchPage('/applications');
    } catch {
      data = await fetchPage('/insurer/applications');
    }

    let content = unwrapPage(data).map(mapApplication);
    if (status === 'PENDING') {
      content = content.filter((app) => PENDING_APPLICATION_STATUSES.has(app.status));
    }
    return { content, totalElements: content.length };
  },

  async reviewApplication(id: string, decision: 'APPROVE' | 'REJECT', reason?: string) {
    const body = {
      status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      decisionReason: reason,
    };
    try {
      const { data } = await apiClient.patch<Record<string, unknown>>(
        `/applications/${id}/review`,
        body
      );
      return mapApplication(data);
    } catch {
      const { data } = await apiClient.post<Record<string, unknown>>(
        `/insurer/applications/${id}/decision`,
        { decision: body.status, reason: body.decisionReason }
      );
      return mapApplication(data);
    }
  },
};

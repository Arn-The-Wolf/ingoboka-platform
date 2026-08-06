import { apiClient } from './client';
import { mapClaim, unwrapPage } from './mappers';
import type { ApplicationResponse } from './products';
import type { Claim, InsurerStats, PaginatedResponse, PolicyReportSummary } from '@/types';
import { getWithFallback, mapApplicationStatusFilter, PENDING_APPLICATION_STATUSES } from './integration-helpers';

export interface InsurerDashboardData {
  activePolicies: number;
  citizensEnrolled: number;
  openClaims: number;
  pendingApplications: number;
  resolvedToday: number;
  avgResolutionDays: number;
  claimsByStatus: { status: string; count: number }[];
  enrollmentByProduct: { name: string; count: number }[];
  enrollmentByDistrict: {
    district: string;
    province: string;
    districtCode: string;
    enrolled: number;
  }[];
}

export interface ClaimListFilters {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  province?: string;
  district?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ApplicationListFilters {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface RevenueTrendData {
  granularity: string;
  totalRevenue: number;
  totalSettled: number;
  totalPending: number;
  totalSpending: number;
  periods: Array<{
    label: string;
    periodStart: string;
    periodEnd: string;
    revenue: number;
    settled: number;
    pending: number;
    spending: number;
    invoiceCount: number;
  }>;
}

type InsurerApplication = ApplicationResponse & {
  submittedAt?: string;
  productName?: string;
  applicantName?: string;
  province?: string;
  district?: string;
};

function applicationSortValue(app: InsurerApplication, sortBy: string): string {
  switch (sortBy) {
    case 'submittedAt':
      return app.submittedAt ?? '';
    case 'status':
      return app.status;
    case 'productName':
      return app.productName ?? '';
    case 'applicantName':
      return app.applicantName ?? '';
    default:
      return app.applicationNumber;
  }
}

function mapApplication(raw: Record<string, unknown>): InsurerApplication {
  return {
    id: String(raw.id ?? ''),
    applicationNumber: String(raw.applicationReference ?? raw.applicationNumber ?? ''),
    status: String(raw.status ?? ''),
    premiumAmount: Number(raw.premiumAmount ?? 0),
    currency: String(raw.currency ?? 'RWF'),
    submittedAt: raw.submittedAt ? String(raw.submittedAt) : undefined,
    productName: raw.productName ? String(raw.productName) : undefined,
    applicantName: raw.applicantName ? String(raw.applicantName) : undefined,
    province: raw.province ? String(raw.province) : undefined,
    district: raw.district ? String(raw.district) : undefined,
  };
}

export const insurerPortalApi = {
  async getDashboard(): Promise<InsurerDashboardData> {
    const { data } = await apiClient.get<Record<string, unknown>>('/insurer/dashboard');
    return {
      activePolicies: Number(data.activePolicies ?? 0),
      citizensEnrolled: Number(data.citizensEnrolled ?? 0),
      openClaims: Number(data.openClaims ?? 0),
      pendingApplications: Number(data.pendingApplications ?? 0),
      resolvedToday: Number(data.resolvedToday ?? 0),
      avgResolutionDays: Number(data.avgResolutionDays ?? 0),
      claimsByStatus: Array.isArray(data.claimsByStatus)
        ? data.claimsByStatus.map((row) => {
            const item = row as Record<string, unknown>;
            return { status: String(item.status ?? ''), count: Number(item.count ?? 0) };
          })
        : [],
      enrollmentByProduct: Array.isArray(data.enrollmentByProduct)
        ? data.enrollmentByProduct.map((row) => {
            const item = row as Record<string, unknown>;
            return { name: String(item.name ?? ''), count: Number(item.count ?? 0) };
          })
        : [],
      enrollmentByDistrict: Array.isArray(data.enrollmentByDistrict)
        ? data.enrollmentByDistrict.map((row) => {
            const item = row as Record<string, unknown>;
            return {
              district: String(item.district ?? ''),
              province: String(item.province ?? ''),
              districtCode: String(item.districtCode ?? ''),
              enrolled: Number(item.enrolled ?? 0),
            };
          })
        : [],
    };
  },

  async getStats(): Promise<InsurerStats> {
    const dashboard = await this.getDashboard();
    return {
      openClaims: dashboard.openClaims,
      activePolicies: dashboard.activePolicies,
      resolvedToday: dashboard.resolvedToday,
      avgResolutionDays: dashboard.avgResolutionDays,
      claimsByStatus: dashboard.claimsByStatus,
    };
  },

  async listClaims(filters: ClaimListFilters = {}): Promise<PaginatedResponse<Claim>> {
    const params: Record<string, string | number> = {
      page: filters.page ?? 0,
      size: filters.size ?? 10,
      sortBy: filters.sortBy ?? 'createdAt',
      sortDir: filters.sortDir ?? 'desc',
    };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.province) params.province = filters.province;
    if (filters.district) params.district = filters.district;

    const { data } = await apiClient.get<PaginatedResponse<Record<string, unknown>>>('/admin/claims', {
      params,
    });
    const content = unwrapPage(data).map((raw) => mapClaim(raw as Record<string, unknown>));
    return {
      content,
      totalElements: data.totalElements ?? content.length,
      totalPages: data.totalPages ?? 1,
      page: data.page ?? params.page,
      size: data.size ?? params.size,
    };
  },

  async createClaim(payload: {
    policyId: string;
    claimType: string;
    description: string;
    incidentDate?: string;
    claimedAmount?: number;
  }): Promise<Claim> {
    const { data } = await apiClient.post<Record<string, unknown>>('/admin/claims', payload);
    return mapClaim(data);
  },

  async updateClaim(
    id: string,
    payload: {
      claimType?: string;
      description?: string;
      incidentDate?: string;
      claimedAmount?: number;
    }
  ): Promise<Claim> {
    const { data } = await apiClient.put<Record<string, unknown>>(`/admin/claims/${id}`, payload);
    return mapClaim(data);
  },

  async listApplications(filters: ApplicationListFilters = {}) {
    const backendStatus = mapApplicationStatusFilter(filters.status ?? '');
    const params: Record<string, string | number> = {
      page: filters.page ?? 0,
      size: filters.size ?? 10,
    };
    if (backendStatus) params.status = backendStatus;

    let data: {
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
    };
    try {
      data = await getWithFallback('/insurer/applications', '/applications', params);
    } catch {
      data = { content: [], totalElements: 0 };
    }
    let content = unwrapPage(data).map(mapApplication);

    if (filters.status === 'PENDING') {
      content = content.filter((app) => PENDING_APPLICATION_STATUSES.has(app.status));
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      content = content.filter(
        (app) =>
          app.applicationNumber.toLowerCase().includes(q) ||
          (app.applicantName?.toLowerCase().includes(q) ?? false) ||
          (app.productName?.toLowerCase().includes(q) ?? false)
      );
    }

    const sortBy = filters.sortBy ?? 'submittedAt';
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    content.sort((a, b) => {
      const av = applicationSortValue(a, sortBy);
      const bv = applicationSortValue(b, sortBy);
      return av.localeCompare(bv) * dir;
    });

    const page = filters.page ?? 0;
    const size = filters.size ?? 10;
    const start = page * size;
    const paged = content.slice(start, start + size);

    return {
      content: paged,
      totalElements: content.length,
      totalPages: Math.max(1, Math.ceil(content.length / size)),
      page,
      size,
    };
  },

  async reviewApplication(id: string, decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO', reason?: string) {
    if (decision === 'REQUEST_INFO') {
      const body = { status: 'UNDER_REVIEW', decisionReason: reason };
      try {
        const { data } = await apiClient.patch<Record<string, unknown>>(
          `/applications/${id}/review`,
          body
        );
        return mapApplication(data);
      } catch {
        const { data } = await apiClient.post<Record<string, unknown>>(
          `/insurer/applications/${id}/decision`,
          { decision: 'UNDER_REVIEW', reason }
        );
        return mapApplication(data);
      }
    }

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

  async getPolicyReport(): Promise<PolicyReportSummary> {
    const { data } = await apiClient.get<Record<string, number>>('/reports/policies/summary');
    return {
      activePolicies: data.activePolicies ?? 0,
      citizensEnrolled: data.citizensEnrolled ?? 0,
    };
  },

  async getRevenueTrends(granularity: 'monthly' | 'weekly' | 'yearly' = 'monthly'): Promise<RevenueTrendData> {
    const { data } = await apiClient.get<Record<string, unknown>>('/insurer/revenue/trends', {
      params: { granularity },
    });
    const periods = Array.isArray(data.periods)
      ? data.periods.map((row) => {
          const item = row as Record<string, unknown>;
          return {
            label: String(item.label ?? ''),
            periodStart: String(item.periodStart ?? ''),
            periodEnd: String(item.periodEnd ?? ''),
            revenue: Number(item.revenue ?? 0),
            settled: Number(item.settled ?? 0),
            pending: Number(item.pending ?? 0),
            spending: Number(item.spending ?? 0),
            invoiceCount: Number(item.invoiceCount ?? 0),
          };
        })
      : [];
    return {
      granularity: String(data.granularity ?? granularity),
      totalRevenue: Number(data.totalRevenue ?? 0),
      totalSettled: Number(data.totalSettled ?? 0),
      totalPending: Number(data.totalPending ?? 0),
      totalSpending: Number(data.totalSpending ?? 0),
      periods,
    };
  },

  async listPartnerInvoices(page = 0, size = 20) {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>('/revenue/invoices', {
      params: { page, size },
    });
    return unwrapPage(data).map((inv) => ({
      id: String(inv.id ?? inv.invoiceNumber ?? ''),
      invoiceNumber: String(inv.invoiceNumber ?? ''),
      totalAmount: Number(inv.amount ?? inv.totalAmount ?? 0),
      status: String(inv.status ?? ''),
      periodStart: inv.periodStart ? String(inv.periodStart) : undefined,
      periodEnd: inv.periodEnd ? String(inv.periodEnd) : undefined,
    }));
  },

  async listPartnerLedger(page = 0, size = 50) {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[] }>('/revenue/ledger', {
      params: { page, size },
    });
    return unwrapPage(data).map((e) => ({
      id: String(e.id ?? e.reference ?? ''),
      description: String(e.notes ?? e.reference ?? e.entryType ?? 'Ledger entry'),
      amount: Number(e.amount ?? 0),
      currency: String(e.currency ?? 'RWF'),
      status: String(e.status ?? ''),
      entryType: String(e.entryType ?? ''),
      createdAt: e.createdAt ? String(e.createdAt) : undefined,
    }));
  },
};

import { apiClient } from './client';
import { unwrapPage } from './mappers';
import type { ApplicationResponse } from './products';
import { mapApplicationStatusFilter, PENDING_APPLICATION_STATUSES } from './integration-helpers';

export interface AgentApplicationListFilters {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

type AgentApplication = ApplicationResponse & {
  submittedAt?: string;
};

function mapApplication(raw: Record<string, unknown>): AgentApplication {
  return {
    id: String(raw.id ?? ''),
    applicationNumber: String(raw.applicationReference ?? raw.applicationNumber ?? ''),
    status: String(raw.status ?? ''),
    premiumAmount: Number(raw.premiumAmount ?? 0),
    currency: String(raw.currency ?? 'RWF'),
    submittedAt: raw.submittedAt ? String(raw.submittedAt) : undefined,
  };
}

function applicationSortValue(app: AgentApplication, sortBy: string): string {
  switch (sortBy) {
    case 'submittedAt':
      return app.submittedAt ?? '';
    case 'status':
      return app.status;
    case 'premiumAmount':
      return String(app.premiumAmount).padStart(12, '0');
    default:
      return app.applicationNumber;
  }
}

export const agentPortalApi = {
  async listApplications(filters: AgentApplicationListFilters = {}) {
    const backendStatus = mapApplicationStatusFilter(filters.status ?? '');
    const params: Record<string, string | number> = {
      page: 0,
      size: 500,
    };
    if (backendStatus) params.status = backendStatus;

    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
    }>('/agent/applications', { params });

    let content = unwrapPage(data).map(mapApplication);

    if (filters.status === 'PENDING') {
      content = content.filter((app) => PENDING_APPLICATION_STATUSES.has(app.status));
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      content = content.filter(
        (app) =>
          app.applicationNumber.toLowerCase().includes(q) ||
          app.status.toLowerCase().includes(q)
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

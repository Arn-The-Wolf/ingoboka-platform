import { apiClient, isNetworkError } from './client';

export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  description?: string;
  startingPremium?: number;
  currency?: string;
}

export interface ProductPlan {
  id: string;
  code: string;
  name: string;
  billingFrequency: string;
  premiumAmount: number;
}

export interface ProductDetail extends ProductSummary {
  code: string;
  termsSummary?: string;
  plans: ProductPlan[];
}

export interface QuoteResponse {
  productPlanId: string;
  productId: string;
  productName: string;
  planName: string;
  billingFrequency: string;
  premiumAmount: number;
  currency: string;
  affordabilityWarning?: string;
}

export interface ApplicationResponse {
  id: string;
  applicationNumber: string;
  status: string;
  premiumAmount: number;
  currency: string;
}

export const productApi = {
  async list(page = 0, size = 20) {
    const { data } = await apiClient.get<{
      content: ProductSummary[];
      totalElements: number;
    }>('/products', { params: { page, size } });
    return data;
  },

  async listAdmin(page = 0, size = 20) {
    const { data } = await apiClient.get<{
      content: Array<ProductSummary & { status: string; code: string }>;
      totalElements: number;
    }>('/admin/products', { params: { page, size } });
    return data;
  },

  async create(payload: {
    code: string;
    name: string;
    category: string;
    description?: string;
    plans: Array<{
      code: string;
      name: string;
      billingFrequency: string;
      premiumAmount: number;
      isDefault?: boolean;
    }>;
  }) {
    const { data } = await apiClient.post('/admin/products', payload);
    return data;
  },

  async publish(id: string) {
    const { data } = await apiClient.post(`/admin/products/${id}/publish`);
    return data;
  },

  async getById(id: string): Promise<ProductDetail> {
    const { data } = await apiClient.get<ProductDetail>(`/products/${id}`);
    return data;
  },
};

export const enrollmentApi = {
  async quote(productPlanId: string) {
    const { data } = await apiClient.post<QuoteResponse>('/applications/quote', {
      productPlanId,
    });
    return data;
  },

  async createApplication(productPlanId: string) {
    const { data } = await apiClient.post<ApplicationResponse>('/applications', {
      productPlanId,
      beneficiaries: [],
    });
    return data;
  },

  async submitApplication(id: string) {
    const { data } = await apiClient.post<ApplicationResponse>(`/applications/${id}/submit`);
    return data;
  },

  async needsAssessment(payload: {
    occupation: string;
    incomeRange?: string;
    dependents?: number;
    primaryRisk?: string;
  }) {
    try {
      const { data } = await apiClient.post('/applications/needs-assessment', payload);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return { score: 70, guidance: 'Accident cover recommended for informal workers.' };
      }
      throw error;
    }
  },
};

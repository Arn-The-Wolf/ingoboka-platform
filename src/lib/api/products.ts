import { apiClient } from './client';
import { unwrapPage } from './mappers';
import { getWithFallback } from './integration-helpers';
import type { NeedsAssessmentResult, RecommendedProduct } from '@/types';

export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  description?: string;
  startingPremium?: number;
  currency?: string;
  status?: string;
  code?: string;
  heroImageUrl?: string;
}

export interface PlanBenefit {
  title: string;
  description?: string;
  coverageLimit?: number;
}

export interface PlanExclusion {
  title: string;
  description?: string;
}

export interface ProductPlan {
  id: string;
  code: string;
  name: string;
  billingFrequency: string;
  premiumAmount: number;
  benefits?: PlanBenefit[];
  exclusions?: PlanExclusion[];
  waitingPeriodDays?: number;
}

export interface ProductFaqItem {
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface ProductClaimStep {
  step: number;
  title: string;
  description: string;
}

export interface ProductDocument {
  id: string;
  title: string;
  fileName: string;
  downloadUrl: string;
}

export interface ProductDetail extends ProductSummary {
  code: string;
  termsSummary?: string;
  plans: ProductPlan[];
  faq?: ProductFaqItem[];
  claimSteps?: ProductClaimStep[];
  documents?: ProductDocument[];
  waitingPeriodDays?: number;
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

function mapBenefit(raw: Record<string, unknown>): PlanBenefit {
  return {
    title: String(raw.title ?? ''),
    description: raw.description ? String(raw.description) : undefined,
    coverageLimit: raw.coverageLimit != null ? Number(raw.coverageLimit) : undefined,
  };
}

function mapExclusion(raw: Record<string, unknown>): PlanExclusion {
  return {
    title: String(raw.title ?? ''),
    description: raw.description ? String(raw.description) : undefined,
  };
}

function mapProduct(raw: Record<string, unknown>): ProductSummary {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    category: String(raw.category ?? ''),
    description: raw.description ? String(raw.description) : undefined,
    code: raw.code ? String(raw.code) : undefined,
    status: raw.status ? String(raw.status) : undefined,
    currency: 'RWF',
    heroImageUrl: raw.heroImageUrl ? String(raw.heroImageUrl) : undefined,
    startingPremium: raw.startingPremium != null ? Number(raw.startingPremium) : undefined,
  };
}

function mapPlan(raw: Record<string, unknown>): ProductPlan {
  const benefits = Array.isArray(raw.benefits)
    ? raw.benefits.map((b) => mapBenefit(b as Record<string, unknown>))
    : undefined;
  const exclusions = Array.isArray(raw.exclusions)
    ? raw.exclusions.map((e) => mapExclusion(e as Record<string, unknown>))
    : undefined;
  return {
    id: String(raw.id ?? ''),
    code: String(raw.code ?? ''),
    name: String(raw.name ?? ''),
    billingFrequency: String(raw.premiumFrequency ?? raw.billingFrequency ?? 'MONTHLY'),
    premiumAmount: Number(raw.premiumAmount ?? 0),
    benefits,
    exclusions,
    waitingPeriodDays: raw.waitingPeriodDays != null ? Number(raw.waitingPeriodDays) : undefined,
  };
}

function mapApplication(raw: Record<string, unknown>): ApplicationResponse {
  return {
    id: String(raw.id ?? ''),
    applicationNumber: String(raw.applicationReference ?? raw.applicationNumber ?? ''),
    status: String(raw.status ?? ''),
    premiumAmount: Number(raw.premiumAmount ?? 0),
    currency: 'RWF',
  };
}

function mapRecommendedProduct(raw: Record<string, unknown>): RecommendedProduct {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    category: String(raw.category ?? ''),
    startingPremium: Number(raw.startingPremium ?? 0),
    currency: String(raw.currency ?? 'RWF'),
    matchScore: Number(raw.matchScore ?? 0),
    reason: raw.reason ? String(raw.reason) : undefined,
  };
}

function mapProductDetailPayload(data: Record<string, unknown>): ProductDetail {
  const product = (data.product ?? data) as Record<string, unknown>;
  const plansRaw = data.plans ?? [];
  const plans = Array.isArray(plansRaw)
    ? plansRaw.map((p) => mapPlan(p as Record<string, unknown>))
    : unwrapPage(plansRaw as { content?: Record<string, unknown>[] }).map((p) =>
        mapPlan(p as Record<string, unknown>)
      );
  const summary = mapProduct(product);
  const faq = Array.isArray(data.faq)
    ? data.faq.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          question: String(row.question ?? ''),
          answer: String(row.answer ?? ''),
          sortOrder: row.sortOrder != null ? Number(row.sortOrder) : undefined,
        };
      })
    : undefined;
  const claimSteps = Array.isArray(data.claimSteps)
    ? data.claimSteps.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          step: Number(row.step ?? 0),
          title: String(row.title ?? ''),
          description: String(row.description ?? ''),
        };
      })
    : undefined;
  const documents = Array.isArray(data.documents)
    ? data.documents.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          id: String(row.id ?? ''),
          title: String(row.title ?? ''),
          fileName: String(row.fileName ?? ''),
          downloadUrl: String(row.downloadUrl ?? ''),
        };
      })
    : undefined;
  const defaultWaiting =
    plans.find((p) => p.waitingPeriodDays != null)?.waitingPeriodDays ?? 30;

  return {
    ...summary,
    code: summary.code ?? String(product.code ?? ''),
    termsSummary: product.description ? String(product.description) : undefined,
    plans,
    faq,
    claimSteps,
    documents,
    waitingPeriodDays: defaultWaiting,
    startingPremium: plans[0]?.premiumAmount,
    currency: String(data.currency ?? 'RWF'),
  };
}

export const productApi = {
  async list(page = 0, size = 20) {
    const { data } = await apiClient.get<{ content?: Record<string, unknown>[]; totalElements?: number }>(
      '/products',
      { params: { page, size } }
    );
    const content = unwrapPage(data).map(mapProduct);
    return { content, totalElements: data.totalElements ?? content.length };
  },

  async listAdmin(page = 0, size = 20, status?: string) {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    const data = await getWithFallback<{
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
      page?: number;
      size?: number;
    }>('/products/tenant', '/insurer/products', params);
    const content = unwrapPage(data).map(mapProduct);
    const totalElements = data.totalElements ?? content.length;
    return {
      content,
      totalElements,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(totalElements / size)),
      page: data.page ?? page,
      size: data.size ?? size,
    };
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
      waitingPeriodDays?: number;
      benefits?: PlanBenefit[];
      exclusions?: PlanExclusion[];
      eligibility?: { minAge?: number; maxAge?: number };
    }>;
  }) {
    const { data: product } = await apiClient.post<Record<string, unknown>>('/products', {
      code: payload.code,
      name: payload.name,
      category: payload.category,
      description: payload.description,
    });
    const productId = String(product.id);
    for (const plan of payload.plans) {
      await apiClient.post(`/products/${productId}/plans`, {
        code: plan.code,
        name: plan.name,
        premiumAmount: plan.premiumAmount,
        premiumFrequency: plan.billingFrequency.toUpperCase(),
        waitingPeriodDays: plan.waitingPeriodDays ?? 30,
        benefits: plan.benefits?.map((b, i) => ({
          title: b.title,
          description: b.description,
          coverageLimit: b.coverageLimit,
          sortOrder: i,
        })),
        exclusions: plan.exclusions?.map((e, i) => ({
          title: e.title,
          description: e.description,
          sortOrder: i,
        })),
        eligibility: plan.eligibility,
      });
    }
    return product;
  },

  async publish(id: string) {
    const { data } = await apiClient.post(`/products/${id}/publish`);
    return data;
  },

  async getById(id: string): Promise<ProductDetail> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/products/${id}/detail`);
    return mapProductDetailPayload(data);
  },
};

export const enrollmentApi = {
  async quote(productPlanId: string, productName?: string, planName?: string) {
    const { data } = await apiClient.post<Record<string, unknown>>('/applications/quote', {
      productPlanId,
    });
    return {
      productPlanId: String(data.productPlanId ?? productPlanId),
      productId: String(data.organizationId ?? ''),
      productName: productName ?? 'Insurance Product',
      planName: planName ?? 'Selected Plan',
      billingFrequency: String(data.premiumFrequency ?? 'MONTHLY'),
      premiumAmount: Number(data.premiumAmount ?? 0),
      currency: 'RWF',
      affordabilityWarning: data.affordabilityWarning
        ? String(data.affordabilityWarning)
        : undefined,
    } satisfies QuoteResponse;
  },

  async createApplication(productPlanId: string) {
    const { data } = await apiClient.post<Record<string, unknown>>('/applications', {
      productPlanId,
    });
    return mapApplication(data);
  },

  async submitApplication(id: string) {
    const { data } = await apiClient.post<Record<string, unknown>>(`/applications/${id}/submit`);
    return mapApplication(data);
  },

  async needsAssessment(payload: {
    occupation: string;
    incomeRange?: string;
    dependents?: number;
    primaryRisk?: string;
  }): Promise<NeedsAssessmentResult> {
    const { data } = await apiClient.post<Record<string, unknown>>(
      '/applications/needs-assessment',
      payload
    );
    const recommendedProducts = Array.isArray(data.recommendedProducts)
      ? data.recommendedProducts.map((p) => mapRecommendedProduct(p as Record<string, unknown>))
      : undefined;
    return {
      score: Number(data.score ?? 0),
      guidance: String(data.guidance ?? ''),
      recommendedCategories: Array.isArray(data.recommendedCategories)
        ? data.recommendedCategories.map(String)
        : undefined,
      recommendedProducts,
    };
  },
};

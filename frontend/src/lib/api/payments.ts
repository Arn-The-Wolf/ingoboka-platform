import { apiClient } from './client';

export interface PaymentResponse {
  id: string;
  paymentReference: string;
  providerReference?: string;
  status: string;
  amount: number;
  currency: string;
  instructions?: string;
}

function mapPayment(raw: Record<string, unknown>): PaymentResponse {
  const ref = String(raw.providerReference ?? raw.paymentReference ?? raw.id ?? '');
  return {
    id: String(raw.id ?? ''),
    paymentReference: ref,
    providerReference: ref,
    status: String(raw.status ?? 'PENDING'),
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? 'RWF'),
    instructions: raw.paymentInstructions ? String(raw.paymentInstructions) : undefined,
  };
}

export const paymentApi = {
  async initiate(payload: { policyId?: string; applicationId?: string }) {
    const { data } = await apiClient.post<Record<string, unknown>>('/payments/initiate', payload);
    return mapPayment(data);
  },

  async getStatus(id: string) {
    const { data } = await apiClient.get<Record<string, unknown>>(`/payments/${id}/status`);
    return {
      id: String(data.id ?? id),
      status: String(data.status ?? ''),
      paymentReference: String(data.paymentReference ?? data.providerReference ?? ''),
    };
  },
};

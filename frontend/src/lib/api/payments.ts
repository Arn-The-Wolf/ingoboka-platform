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

export const paymentApi = {
  async initiate(payload: { policyId?: string; applicationId?: string }) {
    const { data } = await apiClient.post<PaymentResponse>('/payments/initiate', payload);
    return data;
  },

  async getStatus(id: string) {
    const { data } = await apiClient.get<{ id: string; status: string; paymentReference: string }>(
      `/payments/${id}/status`
    );
    return data;
  },
};

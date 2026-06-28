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

  /** Poll until payment reaches a terminal state. */
  async pollUntilSettled(
    paymentId: string,
    options?: { intervalMs?: number; maxAttempts?: number }
  ): Promise<string> {
    const intervalMs = options?.intervalMs ?? 3000;
    const maxAttempts = options?.maxAttempts ?? 20;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { status } = await this.getStatus(paymentId);
      const normalized = status.toUpperCase();
      if (['SUCCESS', 'COMPLETED', 'PAID', 'SUCCESSFUL'].includes(normalized)) {
        return status;
      }
      if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(normalized)) {
        throw new Error('Payment failed');
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error('Payment timed out — check your mobile money prompt or try again');
  },

  async confirmSandboxPayment(providerReference: string) {
    await apiClient.post('/payments/sandbox/callback', {
      providerReference,
      status: 'SUCCESS',
    });
  },
};

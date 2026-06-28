import { apiClient } from './client';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { mapAuthResponse, mapAuthUser, type BackendAuthPayload } from './mappers';
import type {
  AuthTokens,
  ConsentRequest,
  LoginRequest,
  OtpVerifyRequest,
  PaginatedResponse,
  RegisterRequest,
  User,
} from '@/types';

interface ConsentRecord {
  consentType: string;
  granted: boolean;
  revokedAt?: string | null;
}

async function filterConsentPayload(payload: ConsentRequest): Promise<ConsentRequest> {
  const { data } = await apiClient.get<PaginatedResponse<ConsentRecord>>(
    '/customers/me/consents',
    { params: { page: 0, size: 20 } }
  );

  const active = new Set(
    data.content
      .filter((c) => c.granted && !c.revokedAt)
      .map((c) => c.consentType)
  );

  return {
    termsAccepted: payload.termsAccepted && !active.has('TERMS_OF_SERVICE'),
    dataProcessing: payload.dataProcessing && !active.has('DATA_PROCESSING'),
    marketing: payload.marketing && !active.has('MARKETING'),
  };
}

function hasConsentToSubmit(body: ConsentRequest): boolean {
  return Boolean(body.termsAccepted || body.dataProcessing || body.marketing);
}

export interface OtpDeliveryConfig {
  deliveryChannel: 'EMAIL' | 'SMS' | 'LOG';
  requiresEmail: boolean;
  smsAvailable: boolean;
  verifyHint: string;
}

export const authApi = {
  async getOtpDeliveryConfig(): Promise<OtpDeliveryConfig> {
    try {
      const { data } = await apiClient.get<OtpDeliveryConfig>('/auth/otp-delivery-config');
      return data;
    } catch {
      return {
        deliveryChannel: 'EMAIL',
        requiresEmail: true,
        smsAvailable: false,
        verifyHint: 'Enter the 6-digit code sent to your email.',
      };
    }
  },

  async login(payload: LoginRequest): Promise<AuthTokens & { user: User }> {
    const raw = payload.email ?? payload.phone ?? '';
    const identifier = raw.includes('@') ? raw.trim().toLowerCase() : normalizeCitizenPhone(raw);
    const { data } = await apiClient.post<BackendAuthPayload>('/auth/login', {
      identifier,
      password: payload.password,
    });
    return mapAuthResponse(data);
  },

  async register(payload: RegisterRequest): Promise<{ message: string; phone: string }> {
    const body = {
      ...payload,
      phone: normalizeCitizenPhone(payload.phone),
      email: payload.email?.trim() || undefined,
    };
    await apiClient.post('/auth/register', body);
    return { message: 'Registration successful', phone: body.phone };
  },

  async verifyOtp(payload: OtpVerifyRequest): Promise<AuthTokens & { user: User }> {
    const phone = normalizeCitizenPhone(payload.phone);
    const code = payload.code.replace(/\D/g, '').slice(0, 6);
    const { data } = await apiClient.post<BackendAuthPayload>('/auth/verify-otp', {
      phone,
      phoneNumber: phone,
      code,
      otp: code,
    });
    return mapAuthResponse(data);
  },

  async resendOtp(phone: string): Promise<void> {
    const normalized = normalizeCitizenPhone(phone);
    await apiClient.post('/auth/resend-otp', { phone: normalized, phoneNumber: normalized });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<BackendAuthPayload>('/auth/refresh', {
      refreshToken,
    });
    const mapped = mapAuthResponse(data);
    return {
      accessToken: mapped.accessToken,
      refreshToken: mapped.refreshToken,
      expiresIn: mapped.expiresIn,
    };
  },

  async logout(refreshToken?: string | null): Promise<void> {
    try {
      await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Best-effort logout
    }
  },
};

export const customerApi = {
  async getMe(): Promise<User> {
    await apiClient.get('/customers/me');
    return mapAuthUser(null);
  },

  async submitConsent(payload: ConsentRequest): Promise<Partial<User>> {
    const body = await filterConsentPayload(payload);
    if (hasConsentToSubmit(body)) {
      await apiClient.post('/customers/consent', body);
    }
    return { consentGiven: true };
  },
};

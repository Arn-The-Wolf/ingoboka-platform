import { apiClient, isNetworkError } from './client';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { mapAuthResponse, mapAuthUser, type BackendAuthPayload } from './mappers';
import { mockData } from './mock-data';
import type {
  AuthTokens,
  ConsentRequest,
  LoginRequest,
  OtpVerifyRequest,
  RegisterRequest,
  User,
} from '@/types';

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
    try {
      const { data } = await apiClient.post<BackendAuthPayload>('/auth/login', {
        identifier,
        password: payload.password,
      });
      return mapAuthResponse(data);
    } catch (error) {
      if (isNetworkError(error)) {
        const isInsurer =
          identifier.includes('insurer') || identifier.includes('admin@ingoboka');
        return {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 900,
          user: {
            ...mockData.user,
            fullName: isInsurer ? 'Eric Demo' : mockData.user.fullName,
            email: payload.email,
            phone: payload.phone,
            role: isInsurer ? 'INSURER_CLAIMS_OFFICER' : 'CITIZEN',
            consentGiven: Boolean(isInsurer),
          },
        };
      }
      throw error;
    }
  },

  async register(payload: RegisterRequest): Promise<{ message: string; phone: string }> {
    const body = {
      ...payload,
      phone: normalizeCitizenPhone(payload.phone),
      email: payload.email?.trim() || undefined,
    };
    try {
      await apiClient.post('/auth/register', body);
      return { message: 'Registration successful', phone: body.phone };
    } catch (error) {
      if (isNetworkError(error)) {
        return { message: 'OTP sent', phone: payload.phone };
      }
      throw error;
    }
  },

  async verifyOtp(payload: OtpVerifyRequest): Promise<AuthTokens & { user: User }> {
    const phone = normalizeCitizenPhone(payload.phone);
    const code = payload.code.replace(/\D/g, '').slice(0, 6);
    try {
      const { data } = await apiClient.post<BackendAuthPayload>('/auth/verify-otp', {
        phone,
        phoneNumber: phone,
        code,
        otp: code,
      });
      return mapAuthResponse(data);
    } catch (error) {
      if (isNetworkError(error)) {
        return {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 900,
          user: { ...mockData.user, verified: true, consentGiven: false },
        };
      }
      throw error;
    }
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
    try {
      await apiClient.get('/customers/me');
      // Profile endpoint returns citizen profile; user fields come from auth store after login.
      return mapAuthUser(null);
    } catch (error) {
      if (isNetworkError(error)) {
        return mockData.user;
      }
      throw error;
    }
  },

  async submitConsent(payload: ConsentRequest): Promise<Partial<User>> {
    try {
      await apiClient.post('/customers/consent', payload);
      return { consentGiven: true };
    } catch (error) {
      if (isNetworkError(error)) {
        return { consentGiven: true };
      }
      throw error;
    }
  },
};

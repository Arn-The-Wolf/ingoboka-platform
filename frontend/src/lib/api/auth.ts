import { apiClient, isNetworkError } from './client';
import { mockData } from './mock-data';
import type {
  AuthTokens,
  ConsentRequest,
  LoginRequest,
  OtpVerifyRequest,
  RegisterRequest,
  User,
} from '@/types';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthTokens & { user: User }> {
    try {
      const { data } = await apiClient.post<AuthTokens & { user: User }>(
        '/auth/login',
        payload
      );
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        const isInsurer =
          payload.email?.includes('insurer') || payload.email?.includes('admin@ingoboka');
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
    try {
      const { data } = await apiClient.post('/auth/register', payload);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return { message: 'OTP sent', phone: payload.phone };
      }
      throw error;
    }
  },

  async verifyOtp(payload: OtpVerifyRequest): Promise<AuthTokens & { user: User }> {
    try {
      const { data } = await apiClient.post('/auth/verify-otp', payload);
      return data;
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

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best-effort logout
    }
  },
};

export const customerApi = {
  async getMe(): Promise<User> {
    try {
      const { data } = await apiClient.get<User>('/customers/me');
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return mockData.user;
      }
      throw error;
    }
  },

  async submitConsent(payload: ConsentRequest): Promise<User> {
    try {
      const { data } = await apiClient.post<User>('/customers/consent', payload);
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        return { ...mockData.user, consentGiven: true };
      }
      throw error;
    }
  },
};

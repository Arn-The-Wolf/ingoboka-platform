import { apiClient } from './client';
import { normalizeCitizenPhone } from '@/lib/auth/phone';
import { mapAuthResponse, mapAuthUser, type BackendAuthPayload } from './mappers';
import { profilePictureApi } from './profile-picture';
import { useAuthStore } from '@/store/auth-store';
import type {
  AuthTokens,
  ConsentRequest,
  LoginRequest,
  OtpVerifyRequest,
  PaginatedResponse,
  RegisterRequest,
  User,
} from '@/types';
import type { ApiError } from '@/types';

interface ConsentRecord {
  consentType: string;
  granted: boolean;
  revokedAt?: string | null;
}

const TERMS_TYPES = ['TERMS_OF_SERVICE', 'TERMS', 'TERMS_AND_CONDITIONS'] as const;
const DATA_TYPES = ['DATA_PROCESSING', 'PRIVACY', 'DATA_PROTECTION'] as const;
const MARKETING_TYPES = ['MARKETING', 'MARKETING_COMMUNICATIONS'] as const;

function hasActiveConsent(records: ConsentRecord[], types: readonly string[]): boolean {
  return records.some((c) => c.granted && !c.revokedAt && types.includes(c.consentType));
}

async function listActiveConsents(): Promise<ConsentRecord[]> {
  const { data } = await apiClient.get<PaginatedResponse<ConsentRecord>>(
    '/customers/me/consents',
    { params: { page: 0, size: 20 } }
  );
  return data.content.filter((c) => c.granted && !c.revokedAt);
}

async function filterConsentPayload(payload: ConsentRequest): Promise<ConsentRequest> {
  const active = await listActiveConsents();
  const activeTypes = new Set(active.map((c) => c.consentType));

  return {
    termsAccepted:
      payload.termsAccepted && !Array.from(TERMS_TYPES).some((t) => activeTypes.has(t)),
    dataProcessing:
      payload.dataProcessing && !Array.from(DATA_TYPES).some((t) => activeTypes.has(t)),
    marketing:
      payload.marketing && !Array.from(MARKETING_TYPES).some((t) => activeTypes.has(t)),
  };
}

function hasConsentToSubmit(body: ConsentRequest): boolean {
  return Boolean(body.termsAccepted || body.dataProcessing || body.marketing);
}

function requiredConsentsSatisfied(active: ConsentRecord[]): boolean {
  return hasActiveConsent(active, TERMS_TYPES) && hasActiveConsent(active, DATA_TYPES);
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

  async refresh(refreshToken: string): Promise<AuthTokens & { user?: User }> {
    const { data } = await apiClient.post<BackendAuthPayload>('/auth/refresh', {
      refreshToken,
    });
    const mapped = mapAuthResponse(data);
    return {
      accessToken: mapped.accessToken,
      refreshToken: mapped.refreshToken,
      expiresIn: mapped.expiresIn,
      user: mapped.user,
    };
  },

  async logout(refreshToken?: string | null): Promise<void> {
    try {
      await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Best-effort logout
    }
  },

  async activateAccount(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/activate-account', { token, password });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await apiClient.post<BackendAuthPayload>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return mapAuthResponse(data);
  },
};

export const customerApi = {
  async getMe(): Promise<Partial<User> & { id?: string }> {
    const stored = useAuthStore.getState().user;
    if (!stored) return mapAuthUser(null);

    let profilePictureUrl = stored.profilePictureUrl;
    try {
      const pic = await profilePictureApi.get();
      profilePictureUrl = pic.profilePictureUrl ?? undefined;
    } catch {
      /* keep stored URL */
    }

    try {
      const { data } = await apiClient.get<Record<string, unknown>>('/customers/me');
      const kycStatus = String(data.kycStatus ?? '');
      let consentGiven = stored.consentGiven;
      try {
        const active = await listActiveConsents();
        consentGiven = requiredConsentsSatisfied(active);
      } catch {
        /* keep stored consent flag */
      }

      return {
        ...stored,
        fullName: String(data.fullName ?? stored.fullName),
        email: data.email ? String(data.email) : stored.email,
        phone: data.phone ? String(data.phone) : stored.phone,
        nationalId: data.nationalId ? String(data.nationalId) : stored.nationalId,
        verified: stored.verified || kycStatus === 'VERIFIED',
        consentGiven,
        profilePictureUrl,
      };
    } catch {
      return { ...stored, profilePictureUrl };
    }
  },

  async submitConsent(payload: ConsentRequest): Promise<Partial<User>> {
    const body = await filterConsentPayload(payload);
    if (!hasConsentToSubmit(body)) {
      return { consentGiven: true };
    }

    try {
      await apiClient.post('/customers/consent', body);
    } catch (error) {
      const status = (error as ApiError).status;
      if (status === 500 || status === 409) {
        const active = await listActiveConsents();
        if (requiredConsentsSatisfied(active)) {
          return { consentGiven: true };
        }
      }
      throw error;
    }
    return { consentGiven: true };
  },
};

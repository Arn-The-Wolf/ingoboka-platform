import { apiClient } from './client';
import { mapBackendRole, unwrapPage } from './mappers';

export interface StaffMember {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  roles: string[];
  roleCode?: string;
  role: string;
  enrollmentStatus: 'PENDING' | 'COMPLETED' | 'DISABLED';
  createdAt?: string;
}

export interface StaffOverview {
  totalStaff: number;
  pendingInvites: number;
  pendingPasswordChange: number;
  pendingEmailVerification: number;
  activeStaff: number;
  disabledOrLocked: number;
  staff: StaffMember[];
}

export interface StaffProfile {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  emailVerified: boolean;
  requiresEmailVerification?: boolean;
  roles: string[];
  organizationId?: string;
  organizationName?: string;
  profilePictureUrl?: string;
}

export interface CreateStaffInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleCode: string;
  inviteOnly?: boolean;
  defaultPassword?: string;
}

export interface UpdateStaffInput {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  roleCode?: string;
}

function mapStaff(raw: Record<string, unknown>): StaffMember {
  const roles = Array.isArray(raw.roles) ? (raw.roles as string[]) : [];
  const roleCode = roles[0] ?? '';
  const firstName = String(raw.firstName ?? '');
  const lastName = String(raw.lastName ?? '');
  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    phoneNumber: raw.phoneNumber ? String(raw.phoneNumber) : undefined,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' ').trim() || String(raw.email ?? ''),
    status: String(raw.status ?? ''),
    emailVerified: Boolean(raw.emailVerified),
    mustChangePassword: Boolean(raw.mustChangePassword),
    roles,
    roleCode,
    role: mapBackendRole(roleCode),
    enrollmentStatus: (String(raw.enrollmentStatus ?? 'PENDING') as StaffMember['enrollmentStatus']),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  };
}

export const staffApi = {
  async getOverview(): Promise<StaffOverview> {
    const { data } = await apiClient.get<Record<string, unknown>>('/partner/staff/overview');
    const staff = Array.isArray(data.staff)
      ? (data.staff as Record<string, unknown>[]).map(mapStaff)
      : [];
    return {
      totalStaff: Number(data.totalStaff ?? staff.length),
      pendingInvites: Number(data.pendingInvites ?? 0),
      pendingPasswordChange: Number(data.pendingPasswordChange ?? 0),
      pendingEmailVerification: Number(data.pendingEmailVerification ?? 0),
      activeStaff: Number(data.activeStaff ?? 0),
      disabledOrLocked: Number(data.disabledOrLocked ?? 0),
      staff,
    };
  },

  async list(page = 0, size = 20) {
    const { data } = await apiClient.get<{
      content?: Record<string, unknown>[];
      totalElements?: number;
      totalPages?: number;
      page?: number;
      size?: number;
    }>('/partner/staff', { params: { page, size } });
    const content = unwrapPage(data).map(mapStaff);
    const totalElements = data.totalElements ?? content.length;
    return {
      content,
      totalElements,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(totalElements / size)),
      page: data.page ?? page,
      size: data.size ?? size,
    };
  },

  async get(userId: string): Promise<StaffMember> {
    const { data } = await apiClient.get<Record<string, unknown>>(`/partner/staff/${userId}`);
    return mapStaff(data);
  },

  async update(userId: string, input: UpdateStaffInput): Promise<StaffMember> {
    const { data } = await apiClient.put<Record<string, unknown>>(`/partner/staff/${userId}`, input);
    return mapStaff(data);
  },

  /** Soft-deactivate staff (sets status to DISABLED). */
  async deactivate(userId: string): Promise<StaffMember> {
    const { data } = await apiClient.patch<Record<string, unknown>>(`/partner/staff/${userId}/status`, {
      status: 'DISABLED',
    });
    return mapStaff(data);
  },

  async create(input: CreateStaffInput) {
    const { data } = await apiClient.post<Record<string, unknown>>('/partner/staff', {
      ...input,
      inviteOnly: input.inviteOnly ?? true,
    });
    return data;
  },

  async resendInvite(userId: string) {
    const { data } = await apiClient.post<Record<string, unknown>>(`/partner/staff/${userId}/resend-invite`);
    return mapStaff(data);
  },

  async resetCredentials(userId: string) {
    const { data } = await apiClient.post<Record<string, unknown>>(
      `/partner/staff/${userId}/reset-credentials`
    );
    return mapStaff(data);
  },

  async getProfile(): Promise<StaffProfile> {
    const { data } = await apiClient.get<Record<string, unknown>>('/staff/me');
    const firstName = String(data.firstName ?? '');
    const lastName = String(data.lastName ?? '');
    const roles = Array.isArray(data.roles) ? (data.roles as string[]) : [];
    return {
      id: String(data.id ?? ''),
      email: String(data.email ?? ''),
      phoneNumber: data.phoneNumber ? String(data.phoneNumber) : undefined,
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(' ').trim() || String(data.email ?? ''),
      status: String(data.status ?? ''),
      emailVerified: Boolean(data.emailVerified),
      requiresEmailVerification: Boolean(data.requiresEmailVerification ?? !data.emailVerified),
      roles,
      organizationId: data.organizationId ? String(data.organizationId) : undefined,
      organizationName: data.organizationName ? String(data.organizationName) : undefined,
      profilePictureUrl: data.profilePictureUrl ? String(data.profilePictureUrl) : undefined,
    };
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }) {
    const { data } = await apiClient.put<Record<string, unknown>>('/staff/me', payload);
    const firstName = String(data.firstName ?? '');
    const lastName = String(data.lastName ?? '');
    const roles = Array.isArray(data.roles) ? (data.roles as string[]) : [];
    return {
      id: String(data.id ?? ''),
      email: String(data.email ?? ''),
      phoneNumber: data.phoneNumber ? String(data.phoneNumber) : undefined,
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
      status: String(data.status ?? ''),
      emailVerified: Boolean(data.emailVerified),
      requiresEmailVerification: Boolean(data.requiresEmailVerification ?? !data.emailVerified),
      roles,
      organizationId: data.organizationId ? String(data.organizationId) : undefined,
      organizationName: data.organizationName ? String(data.organizationName) : undefined,
      profilePictureUrl: data.profilePictureUrl ? String(data.profilePictureUrl) : undefined,
    } satisfies StaffProfile;
  },
};

export const STAFF_ROLE_OPTIONS = [
  { value: 'CLAIMS_OFFICER', label: 'Claims Officer' },
  { value: 'CLAIMS_SUPERVISOR', label: 'Claims Supervisor' },
  { value: 'UNDERWRITER', label: 'Underwriter' },
  { value: 'INSURER_PRODUCT_MANAGER', label: 'Product Manager' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer' },
  { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
  { value: 'PARTNER_ADMIN', label: 'Partner Admin' },
];
